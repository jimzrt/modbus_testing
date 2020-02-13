<template>
  <div>
    <JqxGauge
      ref="gauge"
      :caption="caption"
      :ranges="ranges"
      :ticksMinor="ticksMinor"
      :ticksMajor="ticksMajor"
      :value="0"
      :labels="labels"
      :border="border"
      :colorScheme="'scheme05'"
      :animationDuration="500"
      :max="20"
    ></JqxGauge>
    {{ value }} - {{ revPerMinute }} U/min
  </div>
</template>
<script>
import JqxGauge from "jqwidgets-scripts/jqwidgets-vue/vue_jqxgauge.vue";

export default {
  name: "RevolutionPanel",
  components: { JqxGauge },
  props: ["value"],
  watch: {
    value: function(newVal, oldVal) {
      if (oldVal == 0) {
        this.previousTimeStamp = new Date();
        return;
      }
      if (newVal !== oldVal) {
        let currentDate = new Date();
        let sBetween = Math.ceil(currentDate - this.previousTimeStamp);
        let revBetween = newVal - oldVal;
        let revPerMinuteFull = (revBetween / sBetween) * 60000;
        this.revPerMinute = revPerMinuteFull.toFixed(2);
        this.previousTimeStamp = currentDate;
        this.$refs.gauge.caption = {
          value: this.revPerMinute + " U/min",
          position: "bottom",
          offset: [0, 20],
          visible: true
        };
        this.$refs.gauge.value = revPerMinuteFull;
        //

        //   this.$refs.gauge.caption("test")
        //this.$set(this.$refs.gauge.caption, 'value', 'test')
        // Object.assign({}, this.$refs.gauge.caption,captain);
        // this.$refs.gauge.$forceUpdate()
      }
    }
  },
  data: function() {
    return {
      previousTimeStamp: new Date(),
      revPerMinute: 0,
      ticksMinor: { interval: 1, size: "5%" },
      ticksMajor: { interval: 2, size: "9%" },
      ranges: [
        {
          startValue: 0,
          endValue: 5,
          style: { fill: "#4bb648", stroke: "#4bb648" },
          endWidth: 5,
          startWidth: 1
        },
        {
          startValue: 5,
          endValue: 10,
          style: { fill: "#fbd109", stroke: "#fbd109" },
          endWidth: 10,
          startWidth: 5
        },
        {
          startValue: 10,
          endValue: 15,
          style: { fill: "#ff8000", stroke: "#ff8000" },
          endWidth: 13,
          startWidth: 10
        },
        {
          startValue: 15,
          endValue: 20,
          style: { fill: "#e02629", stroke: "#e02629" },
          endWidth: 16,
          startWidth: 13
        }
      ],
      border: {
        style: { fill: "#8e9495", stroke: "#7b8384", "stroke-width": 1 }
      },
      caption: {
        value: "0 U/min",
        position: "bottom",
        offset: [0, 20],
        visible: true
      },
      labels: {
        distance: "50%",
        position: "inside",
        interval: 2,
        offset: [0, -10],
        visible: true,
        formatValue: function(value) {
          return value;
        }
      }
    };
  },
  computed: {
    //   gaugeCaption: function(){
    //      return { value: this.revPerMinute  + " U/min", position: 'bottom', offset: [0, 10], visible: true }
    //   }
  }
};
</script>
<style>
.jqx-gauge-caption {
  font-size: 20px;
}
</style>