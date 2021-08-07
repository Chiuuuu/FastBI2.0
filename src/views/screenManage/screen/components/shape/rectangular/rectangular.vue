<template>
  <div class="shape-rectangular" :style="rectangularStyle"></div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import { getStyle } from '@/utils'
import { mapState } from 'vuex'
/**
 * @description 形状-直线图
 */
export default {
  name: `${BoardType.ShapeRectangular}View`,
  props: {
    options: {
      // 配置项信息
      type: [Object, String],
      default: ''
    }
  },
  data() {
    return {
      rectangularStyle: {}
    }
  },
  computed: {
    ...mapState({
      // 当前组件状态
      currentComState: state => state.board.currentComState
    })
  },
  watch: {
    'options.style': {
      deep: true,
      immediate: false,
      handler(opt) {
        // 1. 状态要是是停止（移动或者缩放情况下不更变）
        // 2. 配置项发生改变
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.updateChartStyle()
          })
        }
      }
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    /**
     * @description 初始化
     */
    initChart() {
      const style = this.doWithOptions()
      this.rectangularStyle = Object.assign({}, style)
    },
    doWithOptions() {
      const {
        style: {
          echart: { background, border, opacity }
        }
      } = this.options

      const checkProps = {
        background,
        border
      }

      let style = {
        opacity
      }

      style = getStyle(
        style,
        checkProps,
        ['width', 'radius'],
        ['background', 'border']
      )

      return style
    },
    updateChartStyle() {
      this.initChart()
    }
  }
}
</script>
<style lang="less" scoped>
.shape-rectangular {
  width: 100%;
  height: 100%;
}
</style>
