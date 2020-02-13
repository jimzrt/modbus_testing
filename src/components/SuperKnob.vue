<template>
<div id="container">
      <JqxKnob
        ref="myKnob"
        @change="onChange($event)"
        :value="value"
        :min="0"
        :max="10"
        :startAngle="120"
        :endAngle="420"
        :snapToStep="true"
        :rotation="'clockwise'"
        :style="style"
        :marks="marks"
        :labels="labels"
        :progressBar="progressBar"
        :pointer="pointer"
      ></JqxKnob>

      <div id="inputField">
        <JqxNumberInput
          ref="myNumberInput"
          @mousedown="onMouseDown($event)"
          @keyup="onKeyup()"
          @valueChanged="onValueChanged()"
          :width="60"
          :height="40"
          :value="value"
          :min="0"
          :max="10"
          :textAlign="'center'"
          :decimalDigits="0"
          :inputMode="'simple'"
        ></JqxNumberInput>
      </div>
    </div>
</template>
<script>
import JqxKnob from "jqwidgets-scripts/jqwidgets-vue/vue_jqxknob.vue";
import JqxNumberInput from "jqwidgets-scripts/jqwidgets-vue/vue_jqxnumberinput.vue";

export default {
  name: "SuperKnob",
  components: {
    JqxKnob,
    JqxNumberInput
  },
  props: ['value'],
 
  data: function() {
    return {
      style: {
        stroke: "#dfe3e9",
        strokeWidth: 1,
        fill: {
          color: "#fefefe",
          gradientType: "linear",
          gradientStops: [
            [0, 1],
            [50, 0.9],
            [100, 1]
          ]
        }
      },
      marks: {
        colorRemaining: { color: "grey", border: "grey" },
        colorProgress: { color: "#00a4e1", border: "#00a4e1" },
        type: "line",
        offset: "71%",
        thickness: 3,
        size: "6%",
        majorSize: "9%",
        majorInterval: 1,
        minorInterval: 0.2
      },
      labels: {
        offset: "88%",
        step: 1,
        visible: true,
        // style: { fill: "#00a4e1"}
      },
      progressBar: {
        style: { fill: "#447384",  stroke: "white" },
        size: "9%",
        offset: "60%",
        background: { fill: "grey", stroke: "grey" }
      },
      pointer: {
        type: "circle",
        style: {
          fill: {
            color: "#a4a3a3",
            gradientType: "linear",
            gradientStops: [
              [0, 0.5],
              [50, 0.6],
              [100, 1]
            ]
          },
          stroke: "#333"
        },
        size: "10%",
        offset: "49%"
      }
     
    };
  },
  methods: {
    onChange: function(event) {
        console.log(event);
      if (
        event.args.changeSource == "propertyChange" ||
        event.args.changeSource == "val" 
      ) {
        return;
      }
      this.$refs.myNumberInput.val(event.args.value);
      if (event.args.type !== null)
        this.$emit('input', event.args.value);
    },
    onMouseDown: function(event) {
      event.stopPropagation();
    },
    onKeyup: function() {
      let val = this.$refs.myNumberInput.val();
      this.$refs.myKnob.val(val);
    },
    onValueChanged: function() {
      let val = this.$refs.myNumberInput.val();
      this.$refs.myKnob.val(val);
    }
  },
  watch: {
      value : function(newVal, oldVal){
          if(newVal != oldVal){
        //      console.log("watcher");
          this.$refs.myKnob.val(newVal);

          }
      }
  }
};
</script>

<style>
#container {
  position: relative;
}

.jqx-numberinput {
  left: 170px;
  top: 323px;
  position: absolute;
  background: transparent !important;
  border: none !important;
}

text.jqx-knob-label {
  font-size: 20px;
  stroke-width: 0px;
  color: grey !important;
}

.jqx-numberinput > input {
  background: transparent !important;
  font-size: 20px !important;
  color: black !important;
}
</style>
