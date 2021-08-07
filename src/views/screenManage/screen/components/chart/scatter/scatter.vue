<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import BaseChart from '../base'
import defaultData from './default-data'
import merge from 'lodash/merge'
/**
 * @description 散点图
 */
export default {
  name: `${BoardType.ChartScatter}View`,
  extends: BaseChart,
  methods: {
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options
      return (
        data.dataModelId &&
        data.dimensions.length &&
        data.xaxis.length &&
        data.yaxis.length
      )
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据')
      this.serverData = {
        legend: [
          '可口可乐',
          '百事可乐',
          '雪碧',
          '健力宝',
          '康师傅',
          '星巴克',
          '统一'
        ],
        data: [
          {
            man: 120,
            women: 150,
            name: '产品部'
          },
          {
            man: 130,
            women: 160,
            name: '市场部'
          },
          {
            man: 140,
            women: 170,
            name: '销售部'
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
    doWithFormatter(data, way) {
      const ways = {
        name: '{a}',
        value: '{c}',
        nv: '{a}\n({c})'
      }
      const formatter = ways[way] || ways.nv
      return formatter
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart }
      } = this.options

      const series = []
      fetchData.data.forEach(data => {
        const ary = [data.man, data.women]
        const item = this.createScatterUnit(data.name, [ary], echart)
        series.push(item)
      })

      const legend = this.doWithlegend(fetchData.data)

      const options = merge({}, echart, {
        legend: {
          data: legend
        },
        series
      })
      return options
    },
    createScatterUnit(name, data, echart) {
      const formatter = this.doWithFormatter(data, echart.customFormatterWay)
      return {
        name,
        type: 'scatter',
        label: Object.assign({}, echart.customLabel, {
          formatter: `${formatter}`
        }),
        data: data
      }
    },
    updateChartStyle() {
      if (!this.chartInstane) return
      const newOptions = this.doWithOptions(
        this.serverData ? this.serverData : defaultData
      )
      this.updateSaveChart(newOptions)
    }
  }
}
</script>
