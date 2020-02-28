const path = require('path')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//const sqlite3 = require('sqlite3').verbose()
const Database = require('better-sqlite3');
const Modbus = require('jsmodbus')
const net = require('net')
const modbusSocket = new net.Socket()
const client = new Modbus.client.TCP(modbusSocket)
const options = {
    'host': '192.168.0.250',
    'port': '502'
}

io.set('heartbeat timeout', 60000);
io.set('heartbeat interval', 25000);

const dbPath = path.resolve(__dirname, 'events.db')
const db = new Database(dbPath, {
    verbose: console.log
});

var connected = false;
// let db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log('Connected to database.');
// });

db.prepare('CREATE TABLE IF NOT EXISTS revolutions (revolutions INTEGER, timestamp TEXT)').run()
db.prepare('CREATE TABLE IF NOT EXISTS motor (state BOOLEAN, timestamp TEXT)').run()
db.prepare('CREATE TABLE IF NOT EXISTS speed (speed INTEGER, timestamp TEXT)').run()

const dbRevolutionInsert = db.prepare('INSERT INTO revolutions (revolutions, timestamp) VALUES (?, ?)');
const dbMotorInsert = db.prepare('INSERT INTO motor (state, timestamp) VALUES (?, ?)');
const dbSpeedInsert = db.prepare('INSERT INTO speed (speed, timestamp) VALUES (?, ?)');
const dbRevolutionQuery = db.prepare("SELECT revolutions, timestamp FROM revolutions where timestamp >= ?");
const dbMotorQuery = db.prepare("SELECT state, timestamp FROM motor where timestamp >= ?");
const dbSpeedQuery = db.prepare("SELECT speed, timestamp FROM speed where timestamp >= ?");


let revolutions = 0;
let speed = 0;
let turnedOn = false;
let lastUpdate = new Date()

let pause = false;

function sendEventsToClients(ioSocket) {
    let date = new Date();
    date.setHours(date.getHours() - 1);
    ioSocket.emit("revolutionsDB", dbRevolutionQuery.all(date.toISOString()));
    ioSocket.emit("motorDB", dbMotorQuery.all(date.toISOString()));
    ioSocket.emit("speedDB", dbSpeedQuery.all(date.toISOString()))

}

async function update(io) {
    let changed = false;
    let oldRevolutions = revolutions;
    revolutions = await getRevolutions()
    let oldTurnedOn = turnedOn;
    turnedOn = await isTurnedOn();
    let oldSpeed = speed;
    speed = await getSpeed()
    if (oldRevolutions !== revolutions && !changed) {
        //       dbRevolutionInsert.run(oldRevolutions, new Date().toISOString())
        dbRevolutionInsert.run(revolutions, new Date().toISOString())
        dbMotorInsert.run(turnedOn ? 1 : 0, new Date().toISOString())
        dbSpeedInsert.run(speed, new Date().toISOString())
        changed = true;
        lastUpdate = new Date()
    }

    if (oldTurnedOn !== turnedOn && !changed) {
        //        dbMotorInsert.run(oldTurnedOn ? 1 : 0, new Date().toISOString())
        dbRevolutionInsert.run(revolutions, new Date().toISOString())
        dbMotorInsert.run(turnedOn ? 1 : 0, new Date().toISOString())
        dbSpeedInsert.run(speed, new Date().toISOString())
        changed = true;
        lastUpdate = new Date()
    }

    if (oldSpeed !== speed && !changed) {
        //       dbSpeedInsert.run(oldSpeed, new Date().toISOString())
        dbRevolutionInsert.run(revolutions, new Date().toISOString())
        dbMotorInsert.run(turnedOn ? 1 : 0, new Date().toISOString())
        dbSpeedInsert.run(speed, new Date().toISOString())
        changed = true;
        lastUpdate = new Date()
    }

    if (!changed) {

        let diff = Math.abs(lastUpdate - new Date());
        if (diff > 1000 * 60 * 5) {
            dbRevolutionInsert.run(revolutions, new Date().toISOString())
            dbMotorInsert.run(turnedOn ? 1 : 0, new Date().toISOString())
            dbSpeedInsert.run(speed, new Date().toISOString())
            changed = true;
            lastUpdate = new Date()
        }

    }
    // dbRevolutionInsert.run(revolutions, new Date().toISOString())
    // dbMotorInsert.run(turnedOn ? 1 : 0, new Date().toISOString())
    // dbSpeedInsert.run(speed, new Date().toISOString())
    // if(change){
    //     io.emit("init", {
    //         "revolutions": oldRevolutions,
    //         "speed": oldSpeed,
    //         "turnedOn": oldTurnedOn
    //     });
    // }
    io.emit("init", {
        "revolutions": revolutions,
        "speed": speed,
        "turnedOn": turnedOn
    });
}


io.on('connection', async function (ioSocket) {
    while (!connected) {
        await sleep(1000);
    }
    console.log('a user connected');
    console.log({
        "revolutions": revolutions,
        "speed": speed,
        "turnedOn": turnedOn
    })
    sendEventsToClients(ioSocket);
    await update(ioSocket);


    ioSocket.on("turnOn", async function () {
        console.log("turning on");
        await turnOn();
        //turnedOn = 1;
        await update(io);
    })

    ioSocket.on("turnOff", async function () {
        console.log("turning off");
        await turnOff();
        //turnedOn = 0;
        await update(io);
    })

    ioSocket.on("setSpeed", async function (newSpeed) {
        console.log("setting speed: " + newSpeed)
        await setSpeed(newSpeed)
        // speed = newSpeed;
        await update(io);
    })

});





modbusSocket.on('connect', async function () {

    connected = true;

    //await update();
    console.log({
        "revolutions": revolutions,
        "speed": speed,
        "turnedOn": turnedOn
    })

    let oldSpeed = speed;

    while (true) {

        if (turnedOn) {
            let currentMinutes = new Date().getMinutes();

            if (!pause && currentMinutes < 20) {
                pause = true;
                oldSpeed = speed;
                await setSpeed(0);
                // update();
            }

            if (pause && currentMinutes >= 20) {
                pause = false;
                await setSpeed(oldSpeed);
                // update();
            }


        }

        //console.log("still here");
        //await setSpeed(2)
        //await turnOff()
        // let newRevoulutions = await getRevolutions()
        // if (newRevoulutions !== revolutions) {
        await update(io)
        // db.run(`INSERT INTO revolutions(revolutions, timestamp) VALUES(?, ?)`, [revolutions, new Date().toISOString()], function(err) {
        //     if (err) {
        //       return console.log(err.message);
        //     }
        //   });
        // revolutions = newRevoulutions
        // io.emit("revolutions", {
        //     "revolutions": revolutions
        // });
        //   }

        //     console.log({"revolutions" : this.revolutions, "speed": this.speed, "turnedOn": this.turnedOn})

        // speed = await getSpeed()
        //  turnedOn = await isTurnedOn();

        //  console.log(`revolutions: ${revolutions}, speed: ${speed}, turnedOn: ${turnedOn}`)

        await sleep(5000);
    }


});



modbusSocket.on('error', console.error)
modbusSocket.on('close', function () {
    console.log("connection closed");
    modbusSocket.connect(options)
})
modbusSocket.connect(options);
modbusSocket.on('timeout', function () {
    console.log("timeout!!");
});




async function turnOn() {
    return client.writeSingleCoil(8224, 1);
}
async function turnOff() {
    return client.writeSingleCoil(8224, 0);
}

async function setSpeed(speed) {
    //speed += 0.5;
    return client.writeSingleRegister(768, speed);
}


async function getSpeed() {
    let result = await client.readInputRegisters(768, 1);
    let speed = result.response.body.values[0];
    return speed
}
async function getRevolutions() {
    let result = await client.readInputRegisters(256, 1);
    let revolutions = result.response.body.values[0];
    return revolutions;
}
async function isTurnedOn() {
    let result = await client.readCoils(8224, 1);
    let turnedOn = result.response.body.values[0] == 1;
    return turnedOn;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}






http.listen(4000, function () {
    console.log('listening on *:4000');
});