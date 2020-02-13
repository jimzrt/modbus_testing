<template>
  <div id="app">
    <toggle-button :sync="true" @change="toggleEngine" v-model="turnedOn" :width="180" :height="80" :labels="{checked: 'Motor an', unchecked: 'Motor aus'}"></toggle-button>
    <Superknob @input="setSpeed" v-model="speed_value"></Superknob>
    <RevolutionPanel v-model="revolutions"></RevolutionPanel>
    {{ connection_string }} {{ speed_value }} {{ turnedOn }} {{loading}}
  </div>
</template>

<script>
import Superknob from "./components/SuperKnob";
import RevolutionPanel from "./components/RevolutionPanel"
import { ToggleButton } from 'vue-js-toggle-button';
import io from 'socket.io-client';


export default {
  name: "App",
  components: {
    Superknob,
    ToggleButton,
    RevolutionPanel
  },
  created: function() {
  //   window.setInterval(() => {
  //   this.revolutions++;
  // }, 3000);
 // this.$socket.emit('connection')

  },
  sockets: {
    connect: function() {
      console.log("socket connected");
      this.connection_string = "socket connected";
    }
  },
  data: function() {
    return {
      turnedOn: false,
      speed_value: 0,
      revolutions: 0,
      connection_string: "not connected",
      socket : io('192.168.0.162:4000'),
      loading: true
    };
  },
  mounted() {
this.socket.on("init", (data) => {
    this.loading = false;
    this.turnedOn = data.turnedOn == 1;
    this.speed_value = data.speed;
    this.revolutions = data.revolutions;
});



this.socket.on("revolutions", (data) => {
    this.revolutions = data.revolutions;
});


  },
  methods: {
    toggleEngine: function(event){
      console.log("toggle: " + event.value)
      if(event.value == true){
        this.socket.emit("turnOn");
      } else {
        this.socket.emit("turnOff");
      }
    },
    setSpeed: function(event){
      console.log("speed: " + event)
      this.socket.emit("setSpeed", this.speed_value)
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;

background: rgb(181,189,200); /* Old browsers */
background: linear-gradient(to bottom,  rgba(181,189,200,1) 0%,rgba(130,140,149,1) 36%,rgba(40,52,59,1) 100%); 

}

.vue-js-switch{
  font-size: 15px!important;
}

</style>
