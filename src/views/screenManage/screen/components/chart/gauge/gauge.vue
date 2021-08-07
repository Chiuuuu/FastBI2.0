<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import BaseChart from '../base'
import defaultData from './default-data'
import omit from 'lodash/omit'
import merge from 'lodash/merge'

const GAUGE = 'gauge'

/**
 * @description 仪表盘
 */
export default {
  name: `${BoardType.ChartGauge}View`,
  extends: BaseChart,
  methods: {
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options
      return data.progress && data.progress.length
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据')
      const { data } = this.options
      this.serverData = {
        current: {
          value: 50,
          name: '测试'
        },
        min: !Array.isArray(data.min) ? data.min : 0,
        max: !Array.isArray(data.max) ? data.max : 90,
        target: !Array.isArray(data.targe) ? data.targe : 80
      }

      const options = this.doWithOptions(this.serverData)
      this.updateSaveChart(options)
    },
    /**
     * @description 处理中心点
     */
    doWithCenter(center) {
      return [`${center[0]}%`, `${center[1]}%`]
    },
    /**
     * @description 处理半径
     */
    doWithRadius(type) {
      const { customRadius, customGap } = this.options.style.echart
      const radius = +(customRadius + customGap)
      return type === GAUGE ? `${customRadius}%` : `${radius}%`
    },
    /**
     * @description 处理仪表盘
     */
    doWithGauge(cur, min, max) {
      const { customOptions } = this.options.style.echart

      // 如果没有最大值，则设置为2倍的进度值
      max = max || 2 * cur.value

      const options = merge({}, customOptions, {
        name: GAUGE,
        radius: this.doWithRadius(GAUGE),
        min: min,
        max: max
      })

      options.data = [cur]

      return options
    },
    /**
     * @description 处理目标值
     */
    doWithTarget(gauge, targetValue) {
      const omitArry = [
        'axisLine',
        'progress',
        'pointer',
        'axisTick',
        'axisLabel',
        'detail',
        'data'
      ]

      const { customTarget } = this.options.style.echart

      const options = merge({}, omit(gauge, omitArry), {
        name: 'target',
        radius: this.doWithRadius('target'),
        itemStyle: {
          color: customTarget.color
        },
        progress: {
          // 展示当前进度
          show: true,
          width: 8
        },
        zlevel: 2,
        axisLine: {
          // 仪表盘轴线相关配置
          show: false
        },
        pointer: {
          // 指针
          show: false
        },
        splitLine: {
          // 分割样式
          show: false
        },
        axisTick: {
          // 刻度样式
          show: false
        },
        axisLabel: {
          // 刻度标签
          show: false
        },
        detail: {
          // 数据
          show: false
        },
        title: {
          show: false
        }
      })

      options.data = [
        {
          value: targetValue
        }
      ]

      return options
    },
    /**
     * @description 处理目标值
     */
    doWithTargetBG(target) {
      const { customTarget } = this.options.style.echart

      const options = merge({}, omit(target, 'data'), {
        name: 'targetBG', // 目标值背景
        zlevel: 1,
        itemStyle: {
          color: customTarget.backgroundColor
        },
        data: [
          {
            value: target.max
          }
        ]
      })

      return options
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null
      const options = this.doWithOptions(defaultData)
      this.updateSaveChart(options)
    },
    doWithOptions(fetchData) {
      // 1. 先构建底层仪表盘
      const gauge = this.doWithGauge(
        fetchData.current,
        fetchData.min,
        fetchData.max
      )

      // 2. 依赖仪表盘构建目标值
      const target = this.doWithTarget(gauge, fetchData.target)

      // 3. 依赖目标值构建目标值的背景
      const targetBG = this.doWithTargetBG(target)

      const series = fetchData.target
        ? [gauge, target, targetBG]
        : [gauge, targetBG]
      const options = {
        series
      }

      return options
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
