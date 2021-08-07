<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import BaseChart from '../base'
import defaultData from './default-data'
import merge from 'lodash/merge'
// TODO:优化逻辑和代码
/**
 * @description 雷达图
 */
export default {
  name: `${BoardType.ChartRadar}View`,
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
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name)
    },
    /**
     * @description 处理半径
     */
    doWithRadius(inRadius, outRadius) {
      return [`${inRadius}%`, `${outRadius}%`]
    },
    /**
     * @description 处理中心点
     */
    doWithCenter(customCenter) {
      return [`${customCenter[0]}%`, `${customCenter[1]}%`]
    },
    doWithOptions(fetchData) {
      const {
        style: { echart }
      } = this.options

      const { indicator, data } = fetchData

      const legend = this.doWithlegend(data)
      const radius = this.doWithRadius(
        echart.customInRadius,
        echart.customOutRadius
      )
      const center = this.doWithCenter(echart.customCenter)
      const series = [
        {
          type: 'radar',
          areaStyle: {
            opacity: echart.customOpacity
          },
          data
        }
      ]

      const options = merge({}, echart)

      options.series = series
      options.legend.data = legend
      options.radar.radius = radius
      options.radar.center = center
      options.radar.indicator = indicator

      return options
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据')
      this.serverData = {
        indicator: [
          { name: '销售（Sales）' },
          { name: '管理（Administration）' },
          { name: '信息技术（Information Technology）' },
          { name: '客服（Customer Support）' },
          { name: '研发（Development）' },
          { name: '市场（Marketing）' }
        ],
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: '预算分配（Allocated Budget）'
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: '实际开销（Actual Spending）'
          }
        ]
      }
      const options = this.doWithOptions(this.serverData)
      this.updateSaveChart(options, ['radar', 'series'])
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null
      const options = this.doWithOptions(defaultData)
      this.updateSaveChart(options, ['radar', 'series'])
    },
    updateChartStyle() {
      if (!this.chartInstane) return
      const newOptions = this.doWithOptions(
        this.serverData ? this.serverData : defaultData
      )
      this.chartInstane.setOption(newOptions)
    }
  }
}
</script>
