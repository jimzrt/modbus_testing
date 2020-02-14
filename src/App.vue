<template>
  <div id="app">
    <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
        <toggle-button
          :sync="true"
          @change="toggleEngine"
          v-model="turnedOn"
          :width="180"
          :height="80"
          :labels="{checked: 'Motor an', unchecked: 'Motor aus'}"
          :color="{checked: '#5AAA5A', unchecked: '#8F2020', disabled: '#CCCCCC'}"
        ></toggle-button>
      </a>
      <ul class="navbar-nav px-3">
        <li class="nav-item text-nowrap"></li>
      </ul>
    </nav>

    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-2">
          <div class="card">
            <div class="card-body">{{revolutions}}</div>
          </div>
        </div>
        <div class="col-sm-5">
          <div class="card">
            <div class="card-body">
              <Superknob @input="setSpeed" v-model="speed_value"></Superknob>
            </div>
          </div>
        </div>
        <div class="col-sm-5">
          <div class="card">
            <div class="card-body">
              <RevolutionPanel ref="revPanel" v-model="revolutions"></RevolutionPanel>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4">
          <highcharts ref="motorChart" :options="chartOptsMotor"></highcharts>
        </div>
        <div class="col-sm-4">
          <highcharts ref="revChart" :options="chartOptsRev"></highcharts>
        </div>
        <div class="col-sm-4">
          <highcharts ref="speedChart" :options="chartOptsSpeed"></highcharts>
        </div>
      </div>
    </div>
    {{ connection_string }} {{ speed_value }} {{ turnedOn }} {{loading}}
  </div>
</template>

<script>
import Superknob from "./components/SuperKnob";
import RevolutionPanel from "./components/RevolutionPanel";
import { ToggleButton } from "vue-js-toggle-button";
import { Chart } from "highcharts-vue";
import io from "socket.io-client";

export default {
  name: "App",
  components: {
    Superknob,
    ToggleButton,
    RevolutionPanel,
    highcharts: Chart
  },
  created: function() {
    //   window.setInterval(() => {
    //   this.revolutions++;
    // }, 3000);
    // this.$socket.emit('connection')
  },

  data: function() {
    return {
      turnedOn: false,
      speed_value: 0,
      revolutions: 0,
      connection_string: "not connected",
      socket: io("192.168.0.162:4000"),
      loading: true,
      chartOptsRev: {
        chart: {
          type: "line",
          zoomType: "x",
          panning: true,
          panKey: "shift"
        },
        title: {
          text: "Umdrehungen"
        },
        series: [
          {
            data: [],
            // step: 'left',
            showInLegend: false
          }
        ],
        xAxis: {
          type: "datetime"
        }
      },
      chartOptsMotor: {
        chart: {
          type: "line",
          zoomType: "x",
          panning: true,
          panKey: "shift"
        },
        title: {
          text: "Motor"
        },
        series: [
          {
            data: [],
            // step: 'left',
            showInLegend: false
          }
        ],
        xAxis: {
          type: "datetime"
        }
      },
      chartOptsSpeed: {
        chart: {
          type: "line",
          zoomType: "x",
          panning: true,
          panKey: "shift"
        },
        title: {
          text: "Geschwindigkeit"
        },
        series: [
          {
            data: [],
            // step: 'left',
            showInLegend: false
          }
        ],
        xAxis: {
          type: "datetime"
        }
      }
    };
  },
  mounted() {
    this.socket.on("init", data => {
      //this.connection_string = "socket connected";
      this.loading = false;
      this.turnedOn = data.turnedOn == 1;
      this.speed_value = data.speed;
      this.revolutions = data.revolutions;
      // this.chartOptsRev.series[0].data.push( {x: new Date().getTime(), y:  data.revolutions});
      // this.chartOptsMotor.series[0].data.push( {x: new Date().getTime(), y:  data.turnedOn});
      // this.chartOptsSpeed.series[0].data.push( {x: new Date().getTime(), y:  data.speed});
      this.$refs.motorChart.chart.series[0].addPoint(
        { x: new Date().getTime(), y: data.turnedOn },
        true,
        true
      );
      this.$refs.revChart.chart.series[0].addPoint(
        { x: new Date().getTime(), y: data.revolutions },
        true,
        true
      );
      this.$refs.speedChart.chart.series[0].addPoint(
        { x: new Date().getTime(), y: data.speed },
        true,
        true
      );
      if (this.turnedOn == false) {
        this.$refs.revPanel.reset();
      }
      // this.chartOptsRev.series[0].addPoint( {x: new Date().getTime(), y:  data.revolutions}, true, true);
      // this.chartOptsMotor.series[0].addPoint( {x: new Date().getTime(), y:  data.turnedOn}, true, true);
      // this.chartOptsSpeed.series[0].addPoint( {x: new Date().getTime(), y:  data.speed}, true, true);
    });

    this.socket.on("revolutions", data => {
      this.revolutions = data.revolutions;
      // this.chartOptsRev.series[0].data.push( {x: new Date().getTime(), y:  data.revolutions});
      this.$refs.revChart.chart.series[0].addPoint(
        { x: new Date().getTime(), y: data.revolutions },
        true,
        true
      );
    });

    this.socket.on("revolutionsDB", data => {
      this.chartOptsRev.series[0].data = this.transformDBData(
        data,
        "revolutions"
      );
    });
    this.socket.on("motorDB", data => {
      this.chartOptsMotor.series[0].data = this.transformDBData(data, "state");
    });
    this.socket.on("speedDB", data => {
      this.chartOptsSpeed.series[0].data = this.transformDBData(data, "speed");
    });
  },
  methods: {
    transformDBData: function(data, key) {
      let values = [];
      for (var i = 0; i < data.length; i++) {
        var item = {};
        item.y = data[i][key];
        item.x = new Date(data[i].timestamp).getTime();
        values.push(item);
      }
      return values;
    },
    toggleEngine: function(event) {
      console.log("toggle: " + event.value);
      if (event.value == true) {
        this.socket.emit("turnOn");
      } else {
        this.socket.emit("turnOff");
      }
    },
    setSpeed: function(event) {
      console.log("speed: " + event);
      this.socket.emit("setSpeed", this.speed_value);
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;

  /* background: rgb(181, 189, 200);
  background: linear-gradient(
    to bottom,
    rgba(181, 189, 200, 1) 0%,
    rgba(130, 140, 149, 1) 36%,
    rgba(40, 52, 59, 1) 100%
  ); */
}

.vue-js-switch {
  font-size: 15px !important;
}
</style>
