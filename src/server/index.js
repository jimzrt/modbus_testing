var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const Modbus = require('jsmodbus')
const net = require('net')
const socket = new net.Socket()
const client = new Modbus.client.TCP(socket)
const options = {
    'host': '192.168.0.250',
    'port': '502'
}
let firstConnect = true;

let revolutions = 0;
let speed = 0;
let turnedOn = 0;
let that = this;

io.on('connection', function(socket){
    console.log('a user connected');
    console.log({"revolutions" : revolutions, "speed": speed, "turnedOn": turnedOn})

    io.emit("init", {"revolutions" : revolutions, "speed": speed, "turnedOn": turnedOn});
    
    socket.on("turnOn", function(){
        console.log("turning on");
        turnOn();
        turnedOn = 1;
        io.emit("init", {"revolutions" : revolutions, "speed": speed, "turnedOn": turnedOn});
    })
    
    socket.on("turnOff", function(){
        console.log("turning off");
        turnOff();
        turnedOn = 0;
        io.emit("init", {"revolutions" : revolutions, "speed": speed, "turnedOn": turnedOn});
    })
    
    socket.on("setSpeed", function(newSpeed){
        console.log("setting speed: " + newSpeed)
        setSpeed(newSpeed)
        speed = newSpeed;
        io.emit("init", {"revolutions" : revolutions, "speed": speed, "turnedOn": turnedOn});
    })

  });
  




socket.on('connect', async function () {
    if (firstConnect) {
        console.log("connected!!");
        firstConnect = false;
    } else {
        console.log("reconnected!!");
    }

    this.revolutions = await getRevolutions()
    this.speed = await getSpeed()
    this.turnedOn = await isTurnedOn();
    console.log({"revolutions" : this.revolutions, "speed": this.speed, "turnedOn": this.turnedOn})
    io.emit("init", {"revolutions" : this.revolutions, "speed": this.speed, "turnedOn": this.turnedOn});

    while(true){
        //console.log("still here");
        //await setSpeed(2)
        //await turnOff()
        this.revolutions = await getRevolutions()
        io.emit("revolutions", {"revolutions" : this.revolutions});
   //     console.log({"revolutions" : this.revolutions, "speed": this.speed, "turnedOn": this.turnedOn})

       // speed = await getSpeed()
      //  turnedOn = await isTurnedOn();

      //  console.log(`revolutions: ${revolutions}, speed: ${speed}, turnedOn: ${turnedOn}`)
       
        await sleep(1000);
    }
    

});



socket.on('error', console.error)
socket.on('close', function () {
    console.log("connection closed");
    socket.connect(options)
})
socket.connect(options);
socket.on('timeout', function () {
    console.log("timeout!!");
});




async function turnOn(){
    return client.writeSingleCoil(8224, 1);
}
async function turnOff(){
    return client.writeSingleCoil(8224, 0);
}

async function setSpeed(speed){
    return client.writeSingleRegister(768, speed);
}


async function getSpeed(){
    result = await client.readInputRegisters(768, 1);
    speed = result.response.body.values[0];
    return speed
}
async function getRevolutions(){
    result = await client.readInputRegisters(256, 1);
    revolutions = result.response.body.values[0];
    return revolutions;
}
async function isTurnedOn(){
    result = await client.readCoils(8224, 1);
    turnedOn = result.response.body.values[0] == 1;
    return turnedOn;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  





http.listen(4000, function(){
  console.log('listening on *:4000');
});



