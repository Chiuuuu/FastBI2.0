<template>
  <div class="dv-map"
  :style="[backgroundStyle]"
  ref="mapwrap">
    <div
      class="titles"
      ref="titles"
      v-if="config.title && config.title.show"
      :style="titleStyle"
    >
      <span>{{ config.title.content }}</span>
    </div>
    <!-- {{width}}{{height}} -->
    <div class="map" >
      <div ref="map" :style="{height:height,width:width}"></div>
    </div>
  </div>
</template>

<script>
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'
import echarts from 'echarts'
import geoJson from '@/utils/guangdong.json'
export default {
  name: 'chartMap',
  props: {
    config: {
      type: Object,
      required: true
    },
    // apiData: {
    //   type: Object,
    //   required: true
    // },
    background: {
      type: Object,
      required: true
    }
  },
  computed: {
    titleStyle() {
      return {
        padding: '0 10px',
        color: this.config.title.textStyle.color,
        fontSize: this.config.title.textStyle.fontSize + 'px',
        textAlign: this.config.title.textAlign
      }
    }
  },
  watch: {
    background: {
      handler(val) {
        if (val) {
          this.backgroundStyle = {
            background:
              val.backgroundType === '1'
                ? val.backgroundColor
                : `url(${val.backgroundSrc})`,
            //  backgroundColor: val.backgroundColor,
            borderColor: val.borderColor,
            borderWidth: val.borderWidth + 'px',
            borderStyle: val.borderStyle,
            borderRadius: val.borderRadius + 'px'
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      width: '400px',
      height: '400px',
      backgroundStyle: {}
    }
  },
  mounted() {
    this.drapMap()
    this._calcStyle()
    addResizeListener(this.$refs.mapwrap, this._calcStyle)
  },
  beforeDestroy() {
    removeResizeListener(this.$refs.mapwrap, this._calcStyle)
  },
  methods: {
    drapMap() {
      this.myChart = echarts.init(this.$refs.map)
      echarts.registerMap('guangzhou', geoJson)
      let option = this.config
      console.log(option)
      if (option && typeof option === 'object') {
        this.myChart.setOption(option, true)
      }
      addResizeListener(this.$refs.mapwrap, this._calcStyle)
      this.$refs.mapwrap.addEventListener('resize', () => {
        this.mychart.resize()
      }, true)
    },
    _calcStyle() {
      const wrap = this.$refs.mapwrap
      const title = this.$refs.titles
      if (!wrap) return
      let width = wrap.clientWidth
      let height = wrap.clientHeight
      if (this.config.title && this.config.title.show) {
        height -= title.clientHeight
      }
      this.width = width + 'px'
      this.height = height + 'px'
      var opt = this.myChart.getOption()
      this.myChart.clear()
      this.myChart.resize({ width: width, height: height })
      this.myChart.setOption(opt)
      // window.addEventListener('resize', () => {
      //   this.mychart.resize()
      // }, true)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
