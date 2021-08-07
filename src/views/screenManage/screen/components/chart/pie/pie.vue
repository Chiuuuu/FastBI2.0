<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import BaseChart from '../base'
import defaultData from './default-data'
import { mutationTypes as boardMutation } from '@/store/modules/board'
import merge from 'lodash/merge'
/**
 * @description 饼图
 */
export default {
  name: `${BoardType.ChartPie}View`,
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
     * @description 处理标签对齐
     */
    doWithLabelLayout(chartInstaneWidth, params) {
      if (this.options.style.echart.customLabel.position !== 'outside') return

      const isLeft = params.labelRect.x < chartInstaneWidth / 2
      const points = params.labelLinePoints

      if (!points) return

      // 更新节点.
      points[2][0] = isLeft
        ? params.labelRect.x
        : params.labelRect.x + params.labelRect.width
      return {
        labelLinePoints: points
      }
    },
    /**
     * @description 处理标签线
     */
    doWithLabelLine() {
      return {
        length: 15,
        length2: 0,
        maxSurfaceAngle: 80
      }
    },
    /**
     * @description 处理标签字体等
     */
    doWithLabel(customLabel) {
      const { fontSize } = customLabel
      return Object.assign(customLabel, {
        minMargin: fontSize,
        edgeDistance: 1.5 * fontSize,
        lineHeight: 1.5 * fontSize
      })
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
    doWithRoseType(customRoseType) {
      const { show, type } = customRoseType
      return {
        show,
        type
      }
    },
    /**
     * @description 扇形个数限制
     */
    doWithLimit(data, customLimit) {
      return data.slice(0, customLimit)
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name)
    },
    doWithOptions(fetchData) {
      const {
        style: { echart }
      } = this.options

      const radius = this.doWithRadius(
        echart.customInRadius,
        echart.customOutRadius
      )

      const data = this.doWithLimit(fetchData.data, echart.customLimit)
      const legend = this.doWithlegend(data)
      const roseType = this.doWithRoseType(echart.customRoseType)

      const label = this.doWithLabel(echart.customLabel)
      const center = this.doWithCenter(echart.customCenter)

      const options = merge({}, echart, {
        legend: {
          data: legend
        },
        series: [
          {
            type: 'pie',
            center,
            roseType: roseType.show ? roseType.type : false,
            radius,
            label: label,
            labelLine: this.doWithLabelLine(),
            labelLayout: this.doWithLabelLayout.bind(
              this,
              this.chartInstane.getWidth()
            ),
            data: data
          }
        ]
      })
      console.log(options)
      return options
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null
      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customLimit: defaultData.data.length
          }
        }
      })
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据')
      this.serverData = {
        data: [
          { value: 16237, name: '其它' },
          { value: 3399, name: '西南' },
          { value: 1796, name: '西北' },
          { value: 5146, name: '华北' },
          { value: 11115, name: '华东' },
          { value: 10000, name: '华南' }
        ]
      }

      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customLimit: this.serverData.data.length
          }
        }
      })
    },
    updateChartStyle() {
      if (!this.chartInstane) return
      const newOptions = this.doWithOptions(
        this.serverData ? this.serverData : defaultData
      )
      this.chartInstane.setOption(newOptions, {
        replaceMerge: ['series']
      })
    }
  }
}
</script>
