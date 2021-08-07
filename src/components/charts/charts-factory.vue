<template>
  <div
    class="dv-charts"
    style="width: 100%;height:100%;"
    :style="backgroundStyle"
    ref="wrap"
  >
    <div
      class="titles"
      ref="titles"
      v-if="
        (chartType === 'v-ring' && config.topTitle.show) ||
          (chartType !== 'v-ring' && config.title && config.title.show)
      "
      :style="chartType === 'v-ring' ? titleStyleForRing : titleStyle"
    >
      <span>{{
        chartType === 'v-ring' ? config.topTitle.content : config.title.content
      }}</span>
    </div>
    <component
      :key="key"
      v-if="
        chartData.columns &&
          chartData.columns.length > 0 &&
          typeName !== 've-map'
      "
      v-bind:is="typeName"
      :events="chartEvents"
      :data="chartData"
      :width="width"
      :height="height"
      ref="chart"
      :legend-visible="legendVisible"
      :after-config="afterConfig"
      :title="chartType === 'v-ring' ? config.chartTitle : {}"
      :extend="chartExtend"
      :options="chartOptions"
      :settings="chartSettings"
      :after-set-option="afterSetOption"
    ></component>
    <component
      v-else
      v-bind:is="typeName"
      :events="chartEvents"
      :data="chartData"
      :width="width"
      :height="height"
      ref="chart"
      :legend-visible="legendVisible"
      :after-config="afterConfig"
      :title="chartType === 'v-ring' ? config.chartTitle : {}"
      :extend="chartExtend"
      :legend="chartLegend"
      :options="chartOptions"
      :settings="chartSettings"
      :series="chartSeries"
      :after-set-option="afterSetOption"
    ></component>
    <!-- <div v-else class="dv-charts-null">
      <a-icon  type="pie-chart" style="font-size:50px;" />
    </div> -->
  </div>
</template>

<script>
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'
import { formatData, convertData } from '../../utils/formatData'
import { deepClone } from '@/utils/deepClone'
import guangzhou from '@/utils/guangdong.json'
import omit from 'lodash/omit'
import { DEFAULT_COLORS } from '@/utils/defaultColors'
import { setChartInstanceIdMap } from '@/utils/screenExport'
import { setLinkageData, resetOriginData } from '@/utils/setDataLink'
import { mapGetters } from 'vuex'

export default {
  name: 'ChartsFactory',
  props: {
    chartId: {
      type: String,
      default: '0'
    },
    typeName: {
      type: String,
      required: true
    },
    chartType: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    apiData: {
      type: Object,
      required: true
    },
    apis: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    background: {
      type: Object,
      required: true
    }
  },
  data() {
    let self = this
    this.chartEvents = {
      click: function(e) {
        self.name = e.name
        // 判断是否启用了联动
        if (!self.isClickLink) {
          return
        }
        self.$nextTick(() => {
          let needReset = self.currentIndex === e.dataIndex
          // 散点图要比较seriesIndex
          if (self.typeName === 've-scatter') {
            needReset = self.currentIndex === e.seriesIndex
          }
          // 重复选择数据，进行重置
          if (needReset) {
            // 重置数据颜色样式
            self.resetChartStyle()
            resetOriginData(self.chartId, self.canvasMap)
            return
          }
          // 如果被联动筛选过样式不改变
          if (!self.apiData.selectData) {
            // 鼠标单击时选中,选中颜色不变，其余变暗
            if (
              self.typeName === 've-bar' ||
              self.typeName === 've-histogram'
            ) {
              // 柱状图折线图数据颜色体现在度量，用seriesIndex
              self.chartExtend.series.itemStyle.normal.color = function(
                params
              ) {
                return params.dataIndex === e.dataIndex
                  ? DEFAULT_COLORS[params.seriesIndex]
                  : self.hexToRgba(DEFAULT_COLORS[params.seriesIndex], 0.4)
              }
            } else if (self.typeName === 've-pie') {
              // 饼图数据颜色体现在维度，用dataIndex
              self.chartExtend.series.itemStyle.normal.color = function(
                params
              ) {
                return params.dataIndex === e.dataIndex
                  ? DEFAULT_COLORS[params.dataIndex]
                  : self.hexToRgba(DEFAULT_COLORS[params.dataIndex], 0.4)
              }
            }
          }
          // 记录当前选择数据的index
          self.currentIndex = e.dataIndex
          // 强行渲染
          self.key++
          setLinkageData(self.chartId, e, self.canvasMap)
          //   self.$emit('linkage', self.chartId, e)
          if (!self.apiData.selectData) {
            self.setChartClick()
          }
        })
      }
    }
    return {
      wrapStyle: {},
      width: '500px',
      height: '400px',
      chartData: {
        columns: ['x', 'y'],
        rows: [{ x: 'x', y: 100 }]
      },
      tooltipVisible: true,
      legendVisible: true,
      // chart扩展配置项
      chartExtend: {},
      chartOptions: {},
      chartSettings: {},
      chartSeries: {},
      backgroundStyle: {},
      colors: [],
      geo: {},
      mapToolTip: {},
      chartLegend: {},
      key: 0,
      currentIndex: '' // 记录当前选择的度量数据(图表联动)
    }
  },
  watch: {
    config: {
      handler(val) {
        if (val) {
          // 图例
          this.legendVisible = val.legend && val.legend.show
          if (this.typeName === 've-map') {
            this.chartExtend = { ...omit(val, ['series']) }
            this.chartSeries = deepClone(val.series)
            this.setMapFormatter()
          } else if (this.typeName === 've-scatter') {
            val = deepClone(val)
            if (this.apiData.dimensions.length === 0) {
              val.legend.data = this.apis.legendData
              val.series.data = this.apis.seriesData
            }
            // 散点图
            this.chartExtend = { ...omit(val, ['series', 'legend']) }
            this.chartLegend = val.legend // 图例
            // series设置
            let series = deepClone(val.series)
            let data = series.data
            let list = []
            data.map(item => {
              list.push(deepClone(series))
              list[list.length - 1].data = item.data
              list[list.length - 1].name = item.label
            })
            this.chartSeries = list
          } else {
            this.chartExtend = deepClone(val)
            if (this.typeName === 've-pie') {
              this.setPieFormatter()
            }
          }
          // this.colors = [...val.colors]
          this.$log.primary('========>chartExtend')
          this.$print(this.chartExtend)
        }
      },
      deep: true,
      immediate: true
    },
    apiData: {
      handler(val) {
        if (val) {
          // 只有度量的情况
          if (this.type === '2') {
            if (val.measures && val.measures.length > 0) {
              if (!val.source) {
                return
              }
              this.chartData = val.source
              //   if (this.chartType === 'v-ring') {
              //     this.chartExtend.chartTitle.text = val.source.rows
              //       ? val.source.rows[0].value
              //       : ''
              //   }
              return
            }
          }
          if (val.dimensions && val.measures) {
            // 没有删完维度度量的时候不改变图表
            if (
              (val.dimensions.length === 0 && val.measures.length > 0) ||
              (val.dimensions.length > 0 && val.measures.length === 0)
            ) {
              return
            }
            if (
              val.dimensions.length > 0 &&
              val.measures.length > 0 &&
              val.source
            ) {
              if (!val.source) {
                return
              }
              if (this.chartType === 'v-scatter') {
                // 散点图的数据自定义显示
                this.chartData.columns = []
                this.chartData.rows = []
              } else {
                // 如果有联动，显示联动的数据
                this.chartData = val.selectData ? val.selectData : val.source
                // 被联动的图表恢复样式,取消原来选中状态
                if (val.selectData) {
                  this.resetChartStyle()
                  this.currentIndex = ''
                } else {
                  this.setChartClick()
                }
              }
              return
            }
          }
          // 散点图 -- 维度和度量都移除后，设置回初始默认值
          if (
            (val.dimensions || []).length === 0 &&
            (val.measures || []).length === 0 &&
            this.chartType === 'v-scatter'
          ) {
            this.config.legend.data = this.apis.legendData
            this.config.series.data = this.apis.seriesData
            this.apis.xMax = 1000 // 度量1 最大值
            this.apis.yMax = 1000 // 度量2 最大值
          }
          if (this.chartType === 'v-scatter') {
            // 散点图的数据自定义显示
            this.chartData.columns = []
            this.chartData.rows = []
          } else {
            this.chartData.columns = val.columns
            this.chartData.rows = val.rows
          }
        }
      },
      deep: true,
      immediate: true
    },
    apis: {
      handler(val) {
        if (val) {
          this.chartSettings = deepClone(val)
          if (this.typeName === 've-map') {
            this.chartSettings.mapOrigin = guangzhou
          }
          this.$log.primary('========>chartSettings')
          this.$print(this.chartSettings)
        }
      },
      deep: true,
      immediate: true
    },
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
  mounted() {
    this._calcStyle()
    addResizeListener(this.$refs.wrap, this._calcStyle)
    // 添加了图表联动的图表也要添加重置图表事件
    if (this.isClickLink) {
      this.setChartClick()
    }
  },
  beforeDestroy() {
    removeResizeListener(this.$refs.wrap, this._calcStyle)
  },
  methods: {
    afterConfig(options) {
      options = deepClone(options)
      // 散点图
      if (this.typeName === 've-scatter') {
        // tooltip显示
        options.tooltip.formatter = function(params) {
          let val = params.value
          if (val.length < 6) {
            return ''
          }
          return `${params.marker}<br/>
                  ${val[5]}：${val[2]}<br/>
                  ${val[3]}：${val[0]}<br/>
                  ${val[4]}：${val[1]}<br/>
                  `
        }
        options.series.forEach(item => {
          // 图形属性 -- 散点颜色 -- 单色
          this.apis.scatterColor === '0'
            ? (item.color = '#68ABDA')
            : delete item.color
          // 散点图大小设置
          let scatterSize = this.apis.scatterSize
          if (scatterSize) {
            let max = scatterSize === '0' ? this.apis.xMax : this.apis.yMax
            item.symbolSize = function(val) {
              let num = val[scatterSize]
              return max === 0 ? 8 : (20 / max) * num + 8
            }
          }
        })
        // 如果有图表联动, 则渲染联动的数据
        if (this.apiData.selectData) {
          let seriesData = options.series[0]
          let columns = this.apiData.selectData.columns
          let rows1 = this.apiData.selectData.rows[0]
          seriesData.data = [
            {
              name: '',
              value: [
                rows1[columns[1]],
                rows1[columns[2]],
                rows1[columns[0]],
                columns[1],
                columns[2],
                columns[0]
              ]
            }
          ]
          options.series = seriesData
          options.legend.data = [rows1[columns[0]]]
        }
      }

      // 矩形树图
      if (this.chartType === 'v-treemap') {
        const series = options.series[0] ? options.series[0] : options.series
        // 有拖入数据才处理
        if (
          this.apiData.dimensions.length > 0 &&
          this.apiData.measures.length > 0
        ) {
          this.handleTreemapFormatter(series, 'tooltip')
          this.handleTreemapFormatter(series, 'label')
          // 如果有图表联动, 则渲染联动的数据
          if (this.apiData.selectData) {
            series.data = this.apiData.selectData.data
            options.visualMap.pieces = this.apiData.selectData.pieces
          }
        }
      }
      return options
    },
    // 处理矩形树图的formatter
    handleTreemapFormatter(series, type) {
      let flag = false
      if (this.apiData.measures[0]) {
        const measureAlias = this.apiData.measures[0].alias
        flag = series[type + 'ShowList'].includes(measureAlias)
      }
      series[type].formatter = params => {
        let result = []
        let target = params.data
        while (target.parent) {
          if (series[type + 'ShowList'].includes(target.column)) {
            result.push(target.name)
          }
          target = target.parent
        }
        result = result.reverse()
        if (flag) {
          result.push(params.value[1])
        }
        return result.toString()
      }
    },
    // 重置图表样式(图表联动)
    resetChartStyle() {
      if (!this.chartExtend) {
        return
      }
      if (this.typeName === 've-map') {
        return
      }
      const series = this.chartExtend.series
      if (
        series &&
        series.itemStyle &&
        series.itemStyle.normal &&
        series.itemStyle.normal.color
      ) {
        delete this.chartExtend.series.itemStyle.normal.color
      }
      this.currentIndex = ''
      // 强行渲染
      this.key++
    },
    // 添加图表点击事件，可以点击非数据区域
    setChartClick() {
      this.$nextTick(() => {
        let self = this
        this.$refs.chart.echarts.getZr().on('click', function(params) {
          if (typeof params.target === 'undefined') {
            // 重置数据颜色样式
            self.resetChartStyle()
            resetOriginData(self.chartId, self.canvasMap)
            self.currentIndex = ''
          }
        })
      })
    },
    // 饼图显示内容格式拼接
    setPieFormatter() {
      let list = this.chartExtend.series.label.formatterSelect || []
      this.chartExtend.series.label.formatter = function(params) {
        let str = []
        list.forEach(item => {
          let val = params[item]
          if (!val) {
            return
          }
          if (typeof val === 'number') {
            val = +parseFloat(val)
          }
          if (item === 'percent') {
            val += '%'
          }
          str.push(val)
        })
        return str.join(' ')
      }
    },
    // 地图显示内容格式拼接
    setMapFormatter() {
      for (let series of this.chartSeries) {
        // 指标内容
        let isShowAreaName = series.pointShowList.some(
          str => str.search('地区名') > -1
        )
        let orient = series.label.normal.orient
        series.label.normal.formatter = function(params) {
          if (!params.data) {
            return isShowAreaName ? params.name : ''
          }
          let str = []
          series.pointShowList.forEach(item => {
            let val = params.data[item]
            if (!val) {
              return
            }
            str.push(val)
          })
          str = orient === 'vertical' ? str.join('\n') : str.join(':')
          return str
        }
        series.tooltip.formatter = function(params) {
          if (!params.data) {
            return params.name
          }
          let str = []
          series.tooltipShowList.forEach(item => {
            let val = params.data[item]
            if (!val) {
              return
            }
            str.push(`${item}：${val}`)
          })
          return str.join('<br />')
        }
      }
    },
    _calcStyle() {
      const wrap = this.$refs.wrap
      const title = this.$refs.titles
      if (!wrap) return
      let width = wrap.clientWidth
      let height = wrap.clientHeight
      if (
        (this.config.title && this.config.title.show) ||
        (this.config.topTitle && this.config.topTitle.show)
      ) {
        height -= title.clientHeight
      }
      this.width = width + 'px'
      this.height = height + 'px'
    },
    // 颜色转透明色，用于选中图表转换显示颜色
    hexToRgba(hex, opacity) {
      return hex && hex.replace(/\s+/g, '').length === 7
        ? `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
            '0x' + hex.slice(3, 5)
          )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
        : ''
    },
    afterSetOption(chartObj) {
      // 保存echart实例，截图用
      setChartInstanceIdMap(chartObj, this.chartId)
    }
  },
  computed: {
    ...mapGetters(['canvasMap']),
    titleStyle() {
      return {
        padding: '20px 10px',
        color: this.config.title.textStyle.color,
        fontSize: this.config.title.textStyle.fontSize + 'px',
        textAlign: this.config.title.textAlign,
        fontFamily: this.config.title.textStyle.fontFamily,
        fontWeight: this.config.title.textStyle.fontWeight,
        height: 'auto'
      }
    },
    titleStyleForRing() {
      return this.config.topTitle
        ? {
            padding: '20px 10px',
            color: this.config.topTitle.textStyle.color,
            fontSize: this.config.topTitle.textStyle.fontSize + 'px',
            textAlign: this.config.topTitle.textAlign,
            fontFamily: this.config.topTitle.textStyle.fontFamily,
            fontWeight: this.config.topTitle.textStyle.fontWeight,
            height: 'auto'
          }
        : {}
    },
    // 是否开启图表联动
    isClickLink() {
      return this.apiData.interactive && this.apiData.interactive.clickLink
    }
  }
}
</script>
<style lang="less" scoped>
.chart-event {
  pointer-events: auto !important;
}
</style>
