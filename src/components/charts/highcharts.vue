<template>
  <!-- 3D饼图和柱状图 -->
  <div class="dvs-high" :style="styleObj">
    <div class="container" ref="container" @click.capture="resetBindData"></div>
  </div>
</template>
<script>
import { DEFAULT_COLORS } from '@/utils/defaultColors'
import { mapGetters } from 'vuex'
import { setLinkageData, resetOriginData } from '@/utils/setDataLink'
import sourceMap from '../board/data-source/components/defaultData'
import Exporting from 'highcharts/modules/exporting'
export default {
  name: 'hightCharts',
  props: {
    chartId: {
      type: String,
      default: '0'
    },
    transform: {
      type: Object
    },
    setting: {
      type: Object,
      required: true
    },
    apiData: {
      type: Object,
      required: true
    },
    config: {
      type: Object
      // required: true,
    }
  },
  data() {
    return {
      chart: null,
      styleObj: {},
      currentIndex: '' // 记录当前选择的度量数据(图表联动)
    }
  },
  computed: {
    ...mapGetters(['canvasMap']),
    // 是否开启图表联动
    isClickLink() {
      return this.apiData.interactive && this.apiData.interactive.clickLink
    }
  },
  mounted() {
    // Exporting(this.$highCharts)
    this.init()
  },
  methods: {
    init() {
      this.setting.config.plotOptions.series.events.click = this.clickEvent
      this.mychart = this.$highCharts.chart(
        this.$refs.container,
        this.setting.config
      )
      this.getBackgroundColor(this.setting.background)
    },
    resetBindData(e) {
      const nodeName = e.target.nodeName
      if (nodeName !== 'path') {
        // 清除选中效果
        const target = this.mychart.series[0].data[this.currentIndex]
        if (target && typeof target.slice === 'function') {
          target.slice(false)
        }
        resetOriginData(this.chartId, this.canvasMap)
        this.currentIndex = ''
      }
    },
    clickEvent(e) {
      let self = this
      // 判断是否启用了联动
      if (!self.isClickLink) {
        return
      }
      self.$nextTick(() => {
        // 重复选择数据，进行重置
        if (self.currentIndex === e.point.index) {
          // 清除选中效果
          const target = self.mychart.series[0].data[self.currentIndex]
          if (target && typeof target.slice === 'function') {
            target.slice(false)
          }
          resetOriginData(self.chartId, self.canvasMap)
          self.currentIndex = ''
          return
        }
        // 记录当前选择数据的index
        self.currentIndex = e.point.index
        // 兼容echarts处理, echarts的e.name就是维度值
        e.name = e.point.name || e.point.category
        setLinkageData(self.chartId, e, self.canvasMap)
      })
    },
    getBackgroundColor(objcolor) {
      // this.styleObj = {};
      let type = objcolor.backgroundType
      this.styleObj = {
        background:
          type === '1'
            ? objcolor.backgroundColor
            : `url(${objcolor.backgroundImage})`,
        //  backgroundColor: val.backgroundColor,
        'border-color': objcolor.borderColor,
        'border-width': objcolor.borderWidth + 'px',
        'border-style': objcolor.borderStyle,
        'border-radius': objcolor.borderRadius + 'px'
      }
      // for (const key in objcolor) {
      //     let _key = key
      //       .replace(/::/g, '/')
      //       .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      //       .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      //       .replace(/_/g, '-')
      //       .toLowerCase();
      //     this.$set(this.styleObj,_key,
      //       key == 'backgroundImage' ? `url(${objcolor[key]})` : (typeof objcolor[key])==='number'?`${objcolor[key]}px`:objcolor[key]
      //     )
      //   }
    }
  },
  watch: {
    setting: {
      handler(val) {
        val.config.chart.width = val.view.width
        val.config.chart.height = val.view.height
        // console.log('background',val.background);
        // this.$highCharts.chart(this.$refs.container, val.config);
        this.getBackgroundColor(val.background)
        this.mychart.update(val.config)
      },
      deep: true
      // immediate:true
    },
    config: {
      handler(val) {},
      deep: true
    },
    apiData: {
      handler(val) {
        /*
        dimensions //维度（name）
        measures//度量(value)
      */
        // 单维度
        if (val.dimensions.length === 0 && val.measures.length === 0) {
          if (this.setting.chartType === 'high-column') {
            const data = sourceMap[this.setting.chartType][0].data || []
            this.setting.config.xAxis.categories = data.map(n => n.name)
          }
          this.mychart = this.$highCharts.chart(
            this.$refs.container,
            this.setting.config
          )
          return
        }
        if (
          !val.source |
          (val.dimensions.length === 0) |
          (val.measures.length === 0)
        ) {
          return
        }
        if (val.source.rows.length === 0) {
          this.setting.config.series = []
        } else {
          let _dimensions = val.dimensions[0].alias
          // 判断是否单度量和多度量
          let _measure = val.measures.map(item => item.alias)
          let series = []

          let rows = val.source.rows
          if (val.selectData) {
            rows = val.selectData.rows
          }

          if (this.setting.chartType === 'high-column') {
            let categories = []
            _measure.forEach(key => {
              series.push({
                name: key,
                data: rows.map(x => x[key])
              })
            })
            if (series.length === 0) {
              return
            }
            this.setting.config.series = [...series]
            this.setting.config.xAxis.categories = rows.map(x => x[_dimensions])
          } else {
            _measure.forEach(key => {
              series.push({
                name: key,
                data: rows.map(x => ({
                  name: x[_dimensions],
                  y: x[key]
                }))
              })
            })
            if (series.length === 0) {
              return
            }
            this.setting.config.series = [...series]
          }
        }
        this.mychart = this.$highCharts.chart(
          this.$refs.container,
          this.setting.config
        )
        // this.mychart.update(this.setting.config);//只能更新原来的一个或两个series，哪怕多加series，也不会起作用
      },
      deep: true
    }
  }
}
</script>
<style lang="less" scoped>
.dvs-high {
  width: 100%;
  height: 100%;
  .container {
    display: table-cell;
    position: absolute;
    width: 100%;
    height: 100%;
    ::v-deep .highcharts-container {
      width: 100% !important;
      height: 100% !important;
    }
  }
}
</style>
