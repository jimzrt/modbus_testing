<template>
  <div id="app">
    <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
        <toggle-button
          :sync="true"
          @change="toggleEngine"
          v-model="turnedOn"
          :width="150"
          :height="50"
          :labels="{checked: 'Motor an', unchecked: 'Motor aus'}"
          :color="{checked: '#5AAA5A', unchecked: '#8F2020', disabled: '#CCCCCC'}"
        ></toggle-button>
      </a>
      <ul class="navbar-nav px-3">
        <li class="nav-item text-nowrap"></li>
      </ul>
    </nav>

    <div class="container-fluid">
      <div class="row mt-3">
        <div class="col-sm-4 align-self-center">
          <div class="card text-center">
            <div class="card-body align-self-center">
              <h5 class="card-title">Umdrehungen</h5>
              {{revolutions}}
            </div>
          </div>
        </div>
        <div class="col-sm-8 align-self-center">
          <div class="card text-center">
            <div class="card-body align-self-center">
              <h5 class="card-title">Geschwindigkeit</h5>
              <Superknob @input="setSpeed" v-model="speed"></Superknob>
            </div>
          </div>
        </div>
        <!-- <div class="col-sm-5 align-self-center">
          <div class="card text-center">
            <div class="card-body align-self-center">
              <h5 class="card-title">Umdrehungen pro Minute</h5>
              <RevolutionPanel ref="revPanel" v-model="revolutions"></RevolutionPanel>
            </div>
          </div>
        </div>-->
      </div>
      <div class="row mt-3">
        <div class="col-sm-4">
          <apexchart
            ref="chartMotor"
            type="line"
            :options="chartOptsMotor"
            :series="dataMotor"
            :height="350"
          ></apexchart>
          <!-- <highcharts ref="motorChart" :options="chartOptsMotor"></highcharts> -->
        </div>
        <div class="col-sm-4">
          <apexchart
            ref="chartRev"
            type="line"
            :options="chartOptsRev"
            :series="dataRevolutions"
            :height="350"
          ></apexchart>
          <!-- <apexchart ref="chartRevBrush" type="area" :options="chartOptsRevBrush" :series="dataRevolutions" :height="130"></apexchart> -->
          <!-- <highcharts ref="revChart" :options="chartOptsRev"></highcharts> -->
        </div>
        <div class="col-sm-4">
          <apexchart
            ref="chartSpeed"
            type="line"
            :options="chartOptsSpeed"
            :series="dataSpeed"
            :height="350"
          ></apexchart>

          <!-- <highcharts ref="speedChart" :options="chartOptsSpeed"></highcharts> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Superknob from "./components/SuperKnob";
//import RevolutionPanel from "./components/RevolutionPanel";
import { ToggleButton } from "vue-js-toggle-button";
//import { Chart } from "highcharts-vue";
import io from "socket.io-client";
import VueApexCharts from "vue-apexcharts";
import moment from "moment";

export default {
  name: "App",
  components: {
    Superknob,
    ToggleButton,
    // RevolutionPanel,
    //highcharts: Chart,
    apexchart: VueApexCharts
  },

  data: function() {
    return {
      lastDate: 0,
      dataMotor: [{ data: [] }],
      chartOptsMotor: {
        chart: {
          // id: "realtime",
          // height: '500px',
          type: "line",
          animations: {
            enabled: true,
            easing: "linear",
            dynamicAnimation: {
              speed: 500
            }
          },
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "stepline",
          width: 1
        },
        title: {
          text: "Verlauf Motor",
          align: "center"
        },
        xaxis: {
          type: "datetime",
          //   range: 600000,
          tickAmount: 5,
          labels: {
            formatter: function(val, timestamp) {
              return moment(timestamp).format("HH:mm");
            }
          }
        },
        yaxis: {
          min: 0,
          max: 1,
          tickAmount: 2,
          labels: {
            formatter: function(val) {
              if (val == 1) {
                return "An";
              } else if (val == 0) {
                return "Aus";
              } else {
                return "";
              }
            }
          }
        },
        legend: {
          show: false
        }
      },
      dataRevolutions: [{ data: [] }],
      chartOptsRev: {
        chart: {
          id: "chart2",
          //height: '100%',
          type: "line",
          animations: {
            enabled: true,
            easing: "linear",
            dynamicAnimation: {
              speed: 500
            }
          },
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true,
            autoScaleYaxis: true
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "stepline",
          width: 1
        },
        title: {
          text: "Verlauf Umdrehungen",
          align: "center"
        },
        xaxis: {
          type: "datetime",
          // range: 600000,
          tickAmount: 5,
          labels: {
            formatter: function(val, timestamp) {
              return moment(timestamp).format("HH:mm");
            }
          }
        },
        yaxis: {
          tickAmount: 5
          //   tickAmount: 2,
          //   labels: {
          //     formatter: function(val) {
          //       if (val == 1) {
          //         return "An";
          //       } else if (val == 0) {
          //         return "Aus";
          //       } else {
          //         return "";
          //       }
          //     }
          //   }
        },
        legend: {
          show: false
        }
      },
      // chartOptsRevBrush: {
      //       chart: {
      //         id: 'chart1',
      //         //height: 130,
      //         type: 'area',
      //         brush:{
      //           target: 'chart2',
      //           enabled: true
      //         },
      //         zoom: {
      //       enabled: false
      //     },
      //         selection: {
      //           enabled: true,
      //           // xaxis: {
      //           //   min: new Date('19 Jun 2017').getTime(),
      //           //   max: new Date('14 Aug 2017').getTime()
      //           // }
      //         },
      //       },
      //       colors: ['#008FFB'],
      //       fill: {
      //         type: 'gradient',
      //         gradient: {
      //           opacityFrom: 0.91,
      //           opacityTo: 0.1,
      //         }
      //       },
      //       xaxis: {
      //         type: 'datetime',
      //         tooltip: {
      //           enabled: false
      //         },
      //     //               labels: {
      //     //   formatter: function(val, timestamp) {
      //     //     return moment(timestamp).format("HH:mm");
      //     //   }
      //     // }
      //       },
      //       yaxis: {
      //         tickAmount: 2
      //       }
      //     },
      dataSpeed: [{ data: [] }],
      chartOptsSpeed: {
        chart: {
          //id: "realtime",
          //height: 500,
          type: "line",
          animations: {
            enabled: true,
            easing: "linear",
            dynamicAnimation: {
              speed: 500
            }
          },
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "stepline",
          width: 1
        },
        title: {
          text: "Verlauf Geschwindigkeit",
          align: "center"
        },
        xaxis: {
          type: "datetime",
          //  range: 600000,
          tickAmount: 5,
          labels: {
            formatter: function(val, timestamp) {
              return moment(timestamp).format("HH:mm");
            }
          }
        },
        yaxis: {
          min: 0,
          max: 10
          //   tickAmount: 2,
          //   labels: {
          //     formatter: function(val) {
          //       if (val == 1) {
          //         return "An";
          //       } else if (val == 0) {
          //         return "Aus";
          //       } else {
          //         return "";
          //       }
          //     }
          //   }
        },
        legend: {
          show: false
        }
      },
      oldTurnedOn: false,
      turnedOn: false,
      oldSpeed: 0,
      speed: 0,
      oldRevolution: 0,
      revolutions: 0,
      connection_string: "not connected",
      socket: io("192.168.0.162:4000"),
      loading: true
      // chartOptsRev: {
      //   chart: {
      //     type: "line",
      //     zoomType: "x",
      //     panning: true,
      //     panKey: "shift"
      //   },
      //   title: {
      //     text: ""
      //   },
      //   series: [
      //     {
      //       data: [],
      //       // step: 'left',
      //       showInLegend: false
      //     }
      //   ],
      //   xAxis: {
      //     type: "datetime"
      //   },
      //   yAxis: {
      //     title: {
      //       text: "Umdrehungen"
      //     }
      //   }
      // },
      // chartOptsMotor: {
      //   chart: {
      //     type: "line",
      //     zoomType: "x",
      //     panning: true,
      //     panKey: "shift"
      //   },
      //   title: {
      //     text: ""
      //   },
      //   series: [
      //     {
      //       data: [],
      //       // step: 'left',
      //       showInLegend: false
      //     }
      //   ],
      //   xAxis: {
      //     type: "datetime"
      //   },
      //   yAxis: {
      //     title: {
      //       text: "An/Aus"
      //     }
      //   }
      // },
      // chartOptsSpeed: {
      //   chart: {
      //     type: "line",
      //     zoomType: "x",
      //     panning: true,
      //     panKey: "shift"
      //   },
      //   title: {
      //     text: ""
      //   },
      //   series: [
      //     {
      //       data: [],
      //       // step: 'left',
      //       showInLegend: false
      //     }
      //   ],
      //   xAxis: {
      //     type: "datetime"
      //   },
      //   yAxis: {
      //     title: {
      //       text: "Geschwindigkeit"
      //     }
      //   }
      // }
    };
  },
  mounted() {
    let that = this;

    // window.setInterval(function() {
    //   that.getNewSeries(that.lastDate, { min: 10, max: 90 });
    //   that.$refs.chartMotor.updateSeries([{ data: that.dataMotor }]);
    // }, 1000);

    this.socket.on("init", data => {
      //this.connection_string = "socket connected";

      that.loading = false;
      that.turnedOn = data.turnedOn;
      that.speed = data.speed;
      that.revolutions = data.revolutions;

      let turnedOnItem = {
        x: new Date().getTime(),
        y: data.turnedOn ? 1 : 0
      };
      that.dataMotor[0].data.push(turnedOnItem);
      that.$refs.chartMotor.appendData([{ data: turnedOnItem }]);

      let revItem = {
        x: new Date().getTime(),
        y: data.revolutions
      };
      that.dataRevolutions[0].data.push(revItem);
      // that.$refs.chartRev.updateSeries(that.dataRevolutions);
      that.$refs.chartRev.appendData([{ data: revItem }]);

      // this.chartOptsRev = {
      //   ...this.chartOptsRev,
      //   ...{
      //     yaxis: {
      //       max: revItem.y
      //     }
      //   }
      // };

      //that.$refs.chartRevBrush.updateSeries(this.dataRevolutions);
      // that.$refs.chartRevBrush.appendData([{data:revItem}])

      let speedItem = {
        x: new Date().getTime(),
        y: data.speed
      };
      that.dataSpeed[0].data.push(speedItem);
      that.$refs.chartSpeed.appendData([{ data: speedItem }]);

      that.oldTurnedOn = that.turnedOn;
      that.oldSpeed = that.speed;
      that.oldRevolution = that.revolutions;
    });

    this.socket.on("revolutionsDB", data => {
      this.dataRevolutions[0].data = this.transformDBData(data, "revolutions");
      this.$refs.chartRev.updateSeries(this.dataRevolutions);
      //this.$refs.chartRevBrush.updateSeries(this.dataRevolutions);
      // this.chartOptsRev.series[0].data = this.transformDBData(
      //   data,
      //   "revolutions"
      // );
    });
    this.socket.on("motorDB", data => {
      this.dataMotor[0].data = this.transformDBData(data, "state");
      this.$refs.chartMotor.updateSeries(this.dataMotor);
    });
    this.socket.on("speedDB", data => {
      this.dataSpeed[0].data = this.transformDBData(data, "speed");
      this.$refs.chartSpeed.updateSeries(this.dataSpeed);
      //    this.chartOptsSpeed.series[0].data = this.transformDBData(data, "speed");
    });
  },
  methods: {
    //    getNewSeries: function (baseval, yrange) {
    //   var newDate = baseval + 86400000;
    //   this.lastDate = newDate;
    //   this.dataMotor.data.push({
    //     x: newDate,
    //     y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
    //   });

    // },
    transformDBData: function(data, key) {
      let values = [];
      for (var i = 0; i < data.length; i++) {
        var item = {};
        if (typeof data[i][key] === "boolean") {
          item.y = data[i][key] ? 1 : 0;
        } else {
          item.y = data[i][key];
        }

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
      this.socket.emit("setSpeed", this.speed);
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
