<template>
  <!-- 矩形热力图 -->
  <div class="dvs-heat" ref="dvsheat" :style="styleObj"></div>
</template>
<script>
import { DEFAULT_COLORS } from '@/utils/defaultColors'
import { mapGetters } from 'vuex'
import { setLinkageData, resetOriginData } from '@/utils/setDataLink'
import { deepClone } from '@/utils/deepClone'
import { setChartInstanceIdMap } from '@/utils/screenExport'
export default {
  name: 'chartHeat',
  props: {
    chartId: {
      type: String,
      default: '0'
    },
    chartType: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    apiData: {
      type: Object,
      required: true
    },
    view: {
      type: Object
    },
    background: {
      type: Object
    }
  },
  computed: {
    ...mapGetters(['canvasMap', 'currentSelected']),
    // 是否开启图表联动
    isClickLink() {
      return this.apiData.interactive && this.apiData.interactive.clickLink
    }
  },
  data() {
    return {
      mychart: null,
      option: {},
      styleObj: {},
      currentIndex: '' // 记录当前选择的度量数据(图表联动)
    }
  },
  mounted() {
    this.Init()
    this.mychart.on('click', this.clickEvent)
    // 保存echart实例，截图用
    setChartInstanceIdMap(this.mychart, this.chartId)
  },
  methods: {
    Init(val) {
      this.option = val || this.config
      this.mychart = this.$echarts.init(this.$refs.dvsheat)
      // 有拖入数据才处理
      const config = this.option
      if (
        this.apiData.dimensions.length > 0 &&
        this.apiData.measures.length > 0
      ) {
        this.handleFormatter(config.series, 'tooltip')
        this.handleFormatter(config.series, 'label')
      }
      this.mychart.setOption(config, true)
    },
    clickEvent(e) {
      let self = this
      // 判断是否启用了联动
      if (!self.isClickLink) {
        return
      }
      self.$nextTick(() => {
        // 重复选择数据，进行重置
        if (self.currentIndex === e.dataIndex) {
          self.currentIndex = ''
          // 强行渲染
          self.key++
          resetOriginData(self.chartId, self.canvasMap)
          return
        }
        // 记录当前选择数据的index
        self.currentIndex = e.dataIndex
        self.setChartClick()
        setLinkageData(self.chartId, e, self.canvasMap)
      })
    },
    // 添加图表点击事件，可以点击非数据区域
    setChartClick() {
      this.$nextTick(() => {
        let self = this
        this.mychart.getZr().on('click', function(params) {
          if (typeof params.target === 'undefined') {
            // 重置数据颜色样式
            const series = self.config.series
            if (
              series.itemStyle &&
              series.itemStyle.normal &&
              series.itemStyle.normal.color
            ) {
              delete self.config.series.itemStyle.normal.color
            }
            resetOriginData(self.chartId, self.canvasMap)
            self.currentIndex = ''
          }
        })
      })
    },
    // 处理图表的formatter
    handleFormatter(series, type) {
      let flag = false
      if (this.apiData.measures[0]) {
        const measureAlias = this.apiData.measures[0].alias
        flag = series[type + 'ShowList'].includes(measureAlias)
      }
      series[type].formatter = params => {
        let result = []
        this.apiData.dimensions.map((item, index) => {
          if (series[type + 'ShowList'].includes(item.alias)) {
            if (this.chartType === 'v-sun') {
              if (params.treePathInfo.length - 1 > index) {
                result.push(params.treePathInfo[index + 1].name)
              }
            } else {
              result.push(params.data[index])
            }
          }
        })
        if (this.apiData.measures[0]) {
          const measureAlias = this.apiData.measures[0].alias
          if (series[type + 'ShowList'].includes(measureAlias)) {
            if (this.chartType === 'v-sun') {
              result.push(params.data.value)
            } else {
              result.push(params.data[params.data.length - 1])
            }
          }
        }
        return result.toString()
      }
    }
  },
  watch: {
    config: {
      handler(val) {
        // if(val.title.text!=="矩形热力图"){
        //   debugger
        //   let max = val.series.data.map(item=>item.value);
        //   val.visualMap.max = Math.max(...max)
        // }
        // 有拖入数据才处理
        const config = deepClone(val)
        // if (this.apiData.dimensions.length > 0 && this.apiData.measures.length > 0) {
        //   this.handleFormatter(config.series, 'tooltip')
        //   this.handleFormatter(config.series, 'label')
        //   // 如果有图表联动, 则渲染联动的数据
        //   if (this.apiData.selectData) {
        //     config.series.data = this.apiData.selectData.data
        //   }
        // }
        this.Init(config)
      },
      deep: true
      // immediate: true
    },
    view: {
      handler(val) {
        if (this.mychart !== null) {
          this.mychart.resize()
        }
      },
      deep: true,
      immediate: true
    },
    apiData: {
      handler(val) {
        if (val.source) {
          if (!val.source.rows) {
            return
          }
          let list = val.source.rows
          // 是否有联动数据
          if (val.selectData) {
            list = val.selectData.rows
          }
          if (this.chartType === 'v-sun') {
            let max = list.map(item => item.value)
            this.option.visualMap.max = Math.max(...max)
            this.option.series.data = [...list]
            // 图表联动, 不需要改变配置
            if (this.chartId === this.currentSelected) {
              this.$store.dispatch('SetSelfProperty', this.option)
            }
            this.Init(this.option)
          } else {
            // 维度
            let dim = val.dimensions.map(x => x.alias)
            // 度量
            let mea = val.measures.map(y => y.alias)
            if ((dim.length === 0) | (mea.length === 0)) {
              return
            }
            // 获取度量数组
            let meaarr = list.map(h => h[mea[0]])
            if (meaarr.includes(undefined)) {
              return
            }
            let _series = list.map(item => [
              item[dim[0]],
              item[dim[1]],
              item[mea[0]]
            ])
            if (this.mychart != null) {
              //   this.option.xAxis.data = val.source.rows.map(x=>(x[dim[0]]));
              this.option.visualMap.max = Math.max(...meaarr)
              this.option.series.data = [..._series]
              // 图表联动, 不需要改变配置
              if (this.chartId === this.currentSelected) {
                this.$store.dispatch('SetSelfProperty', this.option)
              }
              this.Init(this.option)
            }
            // console.clear();
          }
        }
      },
      deep: true
      // immediate: true,
    },
    background: {
      handler(objcolor) {
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
        // for (const key in val) {
        //   let _key = key
        //     .replace(/::/g, '/')
        //     .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        //     .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        //     .replace(/_/g, '-')
        //     .toLowerCase();
        //   this.$set(
        //     this.styleObj,
        //     _key,
        //     key == 'backgroundImage' ? `url(${val[key]})` : (typeof val[key])==='number'?`${val[key]}px`:val[key]
        //   )
        //   // this.styleObj[_key] = val[key];
        // }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
<style lang="less" scoped>
.dvs-heat {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
