<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import BaseChart from '../base'
import defaultData from './default-data'
import merge from 'lodash/merge'
/**
 * @description 折线图
 */
export default {
  name: `${BoardType.ChartLine}View`,
  extends: BaseChart,
  methods: {
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options
      return data.dataModelId && data.dimensions.length && data.measures.length
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据')
      this.serverData = {
        categoryData: [
          '可口可乐',
          '百事可乐',
          '雪碧',
          '健力宝',
          '康师傅',
          '星巴克',
          '统一'
        ],
        series: [
          {
            name: '销量',
            type: 'line',
            data: [1000, 5600, 3000, 2000, 1500, 4000, 300]
          },
          {
            name: '生产',
            type: 'line',
            data: [1500, 6100, 3500, 2500, 2000, 4500, 800]
          },
          {
            name: '退货',
            type: 'line',
            data: [10, 100, 50, 80, 70, 20, 40]
          }
        ]
      }
      const options = this.doWithOptions(this.serverData)
      this.updateSaveChart(options)
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null
      const options = this.doWithOptions(defaultData)
      this.updateSaveChart(options)
    },
    /**
     * @description 处理 图表样式 线形
     */
    doWithSmooth(item, customLinear) {
      if (customLinear === 'curve') {
        item['step'] = false
        item['smooth'] = true
      } else if (customLinear === 'trapezoidal') {
        item['step'] = 'start'
        item['smooth'] = false
      } else {
        item['step'] = false
        item['smooth'] = false
      }
    },
    /**
     * @description 处理 图表样式 是否显示标记点
     */
    doWithShowSymbol(item, customShowSymbol) {
      const SYMOLSIZE = 'symbolSize'
      if (customShowSymbol) {
        item[SYMOLSIZE] = 4
      } else {
        item[SYMOLSIZE] = 0
      }
    },
    /**
     * @description 根据key处理value值
     * @param {object} item 数据
     * @param {string} key 字段
     * @param {any} value 对应字段值
     */
    doWithKeyValue(item, key, value) {
      item[key] = value
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name)
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart }
      } = this.options

      fetchData.series.forEach(item => {
        this.doWithSmooth(item, echart.customLinear)
        this.doWithShowSymbol(item, echart.customShowSymbol)
        this.doWithKeyValue(item, 'label', echart.customLabel)
        this.doWithKeyValue(item, 'labelLayout', echart.customLabelLayout)
      })

      const legend = this.doWithlegend(fetchData.series)

      const options = merge({}, echart, {
        xAxis: {
          data: fetchData.categoryData
        },
        legend: {
          data: legend
        },
        series: fetchData.series
      })
      return options
    },
    updateChartStyle() {
      if (!this.chartInstane) return
      const options = this.chartInstane.getOption()

      const data = {
        categoryData: options.xAxis[0].data,
        series: options.series
      }

      const newOptions = this.doWithOptions(data)
      this.chartInstane.setOption(newOptions)
    }
  }
}
</script>
