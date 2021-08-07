<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import BaseChart from '../base'
import defaultData from './default-data'
import merge from 'lodash/merge'
/**
 * @description 柱状图
 */
export default {
  name: `${BoardType.ChartBar}View`,
  extends: BaseChart,
  methods: {
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options
      return data.dataModelId && data.dimensions.length && data.measures.length
    },
    doWithBarGap(item, barGap = 0) {
      item['barGap'] = barGap
    },
    /**
     * @description 处理方向
     */
    doWithShape(echart, categoryData) {
      const { customShape } = echart

      // 垂直（vertical） or 水平（horizontal）
      const isVertical = customShape === 'vertical'

      const xAxis = Object.assign({}, echart.xAxis, {
        type: isVertical ? 'category' : 'value',
        boundaryGap: isVertical,
        name: isVertical ? echart.xAxis.name : echart.yAxis.name,
        cache: isVertical ? echart.xAxis.cache : echart.yAxis.name
      })

      const yAxis = Object.assign({}, echart.yAxis, {
        type: isVertical ? 'value' : 'category',
        boundaryGap: !isVertical,
        name: isVertical ? echart.yAxis.name : echart.xAxis.name,
        cache: isVertical ? echart.yAxis.cache : echart.xAxis.cache
      })

      if (isVertical) {
        xAxis.data = categoryData
      } else {
        yAxis.data = categoryData
      }

      return {
        xAxis,
        yAxis
      }
    },
    /**
     * @description 处理形状是否堆叠
     */
    doWithStack(item, customStack) {
      item['stack'] = customStack ? 'stack' : ''
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name)
    },
    /**
     * @description 处理柱状条宽度（百分比）
     */
    doWithBarWidth(item, customBarWidth, length) {
      item['barWidth'] = `${customBarWidth / length}%`
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
    doWithOptions(fetchData) {
      const {
        style: { echart }
      } = this.options

      const shape = this.doWithShape(echart, fetchData.categoryData)
      fetchData.series.forEach(item => {
        this.doWithBarGap(item)
        this.doWithStack(item, echart.customStack)
        this.doWithKeyValue(item, 'label', echart.customLabel)
        this.doWithBarWidth(
          item,
          echart.customBarWidth,
          fetchData.series.length
        )
      })
      const legend = this.doWithlegend(fetchData.series)

      const options = merge({}, echart, {
        color: echart.customBarColors,
        xAxis: shape.xAxis,
        yAxis: shape.yAxis,
        series: fetchData.series,
        legend: {
          data: legend
        }
      })

      return options
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据')
      this.serverData = {
        categoryData: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)'],
        series: [
          {
            name: '2022年',
            type: 'bar',
            data: [18203, 23489, 29034, 104970, 131744, 630230]
          },
          {
            name: '2023年',
            type: 'bar',
            data: [19325, 23438, 31000, 121594, 134141, 681807]
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
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (!this.chartInstane) return
      const options = this.chartInstane.getOption()

      const data = {
        categoryData: options.xAxis[0].data || options.yAxis[0].data,
        series: options.series
      }

      const newOptions = this.doWithOptions(data)
      this.chartInstane.setOption(newOptions)
    }
  }
}
</script>
