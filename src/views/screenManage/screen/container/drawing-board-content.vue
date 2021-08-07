<template>
  <div class="drawing-board-content reset-scrollbar" ref="js-board-content">
    <!-- 画板外框控制视图宽高 start -->
    <div class="board-frame" :style="boardFrameStyle">
      <!-- 画板控制缩放比例 start -->
      <div
        class="board-canvas"
        :style="boardCanvasStyle"
        @mousedown="handleBoardFrame"
      >
        <!-- 画板控制拖放 start -->
        <div class="board-box board-dropable">
          <!-- 画板网格控制真实尺寸 start -->
          <div class="board-grid" :style="boardGridStyle">
            <BoardShapeUnit
              v-for="(item, index) in components"
              :key="item.id"
              :config="item.setting"
              :index="index"
              :component="item"
            >
              <component :is="item.type" :options="item.setting"></component>
            </BoardShapeUnit>
          </div>
          <!-- 画板网格控制真实尺寸 end -->
        </div>
        <!-- 画板控制拖放 end -->
      </div>
      <!-- 画板控制缩放比例 end -->
    </div>
    <!-- 画板外框控制视图宽高 end -->
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { requestFullScreen, checkFullScreen } from '@/utils'
import BoardShapeUnit from '../components/board-shape-unit'
import ChartLine from '../components/chart/line/line'
import ChartBar from '../components/chart/bar/bar'
import ChartPie from '../components/chart/pie/pie'
import ChartRingPie from '../components/chart/ring-pie/ring-pie'
import ChartNestPie from '../components/chart/nest-pie/nest-pie'
import ChartRadar from '../components/chart/radar/radar'
import ChartGauge from '../components/chart/gauge/gauge'
import ChartScatter from '../components/chart/scatter/scatter'
import ChartSunburst from '../components/chart/sunburst/sunburst'
import ChartTreemap from '../components/chart/treemap/treemap'
import ChartHeatmap from '../components/chart/heatmap/heatmap'
import ChartProgress from '../components/progress/progress'
import ChartTable from '../components/table/table'
import BoardText from '../components/text/text'
import ShapeLine from '../components/shape/line/line'
import ShapeRound from '../components/shape/round/round'
import ShapeRectangular from '../components/shape/rectangular/rectangular'

import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board'

/**
 * @description 大屏编辑区
 */
export default {
  name: 'DrawingBoardContent',
  components: {
    BoardShapeUnit,
    ShapeLine,
    ShapeRound,
    ShapeRectangular,
    ChartLine,
    ChartBar,
    ChartPie,
    ChartRingPie,
    ChartNestPie,
    ChartRadar,
    ChartGauge,
    ChartScatter,
    ChartSunburst,
    ChartTreemap,
    ChartHeatmap,
    ChartProgress,
    ChartTable,
    BoardText
  },
  props: {
    components: {
      // 组件列表
      type: Array,
      default: () => []
    },
    type: {
      // 编辑区类型
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return [parameter.PREVIEW, parameter.EDIT].indexOf(value) !== -1
      }
    }
  },
  data() {
    return {
      parameter,
      boardFrameStyle: {}, // 画板外框样式
      boardCanvasStyle: {}, // 画板样式
      cacheBoardScale: '' // 缓存画板比例
    }
  },
  computed: {
    ...mapState({
      boardScale: state => state.board.scale, // 比例
      boardModel: state => state.board.model, // 模式
      boardPage: state => state.board.page // 页面
    }),
    boardGridStyle() {
      // 画板下的网格样式（真实的页面样式）
      return {
        width: `${this.boardPage.size.width}px`,
        height: `${this.boardPage.size.height}px`,
        backgroundColor: `${this.boardPage.background.color}`
      }
    }
  },
  watch: {
    boardPage: {
      // 深度监听页面变化修改画板外框样式
      deep: true,
      handler(val) {
        if (val) {
          this.doWithBoardFrameStyle()
        }
      }
    },
    boardScale() {
      // 监听页面比例修改样式
      this.doWithBoardFrameStyle()
      this.doWithBoardCanvasStyle()
    },
    boardModel(val) {
      // 监听大屏模式
      if (val === parameter.FULLSCREEN) {
        this.cacheBoardScale = this.boardScale
        this.fullScreenPreview()
      }
    }
  },
  methods: {
    /**
     * @description 判断是否为全屏
     */
    isFullScreen() {
      return this.$store.state.board.model === this.parameter.FULLSCREEN
    },
    /**
     * @description 点击画板设置当前组件为null
     */
    handleBoardFrame(event) {
      event.stopPropagation()
      this.$store.commit(boardMutaion.SET_CURCOM, {
        component: null
      })
    },
    /**
     * @description 处理编辑区
     */
    doWithRect() {
      // 如果是从全屏退出则不需要再次处理比例
      if (this.exitFullscreen()) return

      this.$nextTick(() => {
        const boardContentRect = this.$refs['js-board-content'].getBoundingClientRect()
        const SCALE = this.setRatio(boardContentRect)
        this.$store.commit(boardMutaion.SET_BOARD_SCALE, {
          scale: SCALE
        })
      })
    },
    /**
     * @description 设置比例
     */
    // TODO: 自适应窗口就是根据宽和高的占比，取小的那个，自适应宽度就是取宽度占比
    setRatio(rect) {
      const MARGIN = 32
      const isFullScreen = this.isFullScreen()
      const width = isFullScreen ? rect.width : rect.width - MARGIN * 2
      const height = isFullScreen ? rect.height : rect.height - MARGIN * 2
      const wRatio = isFullScreen
        ? +(width / this.boardPage.size.width)
        : +(width / this.boardPage.size.width).toFixed(2)
      const hRatio = isFullScreen
        ? +(height / this.boardPage.size.height)
        : +(height / this.boardPage.size.height).toFixed(2)
      return wRatio > hRatio ? hRatio : wRatio
    },
    /**
     * @description 处理画板外框样式
     */
    doWithBoardFrameStyle() {
      const SPACE = 41
      this.boardFrameStyle = this.isFullScreen()
        ? {
            width: `${Math.ceil(
              this.boardPage.size.width * this.boardScale
            )}px`,
            height: `${Math.ceil(
              this.boardPage.size.height * this.boardScale
            )}px`
          }
        : {
            width: `${Math.ceil(this.boardPage.size.width * this.boardScale) +
              SPACE}px`, // 1920 => 1135
            height: `${Math.ceil(this.boardPage.size.height * this.boardScale) +
              SPACE +
              5}px` // 1080 => 661 高比宽多5像素
          }
    },
    /**
     * @description 处理画板比例
     */
    doWithBoardCanvasStyle() {
      const transformList = ['transform', 'WebkitTransform', 'MozTransform']
      transformList.forEach(css => {
        this.boardCanvasStyle[css] = `scale(${this.boardScale})`
      })
    },
    /**
     * @description 全屏预览
     */
    fullScreenPreview() {
      this.$nextTick(() => {
        const requiredFullScreenDom = this.$refs['js-board-content']
        this.doWithBoardFrameStyle()
        requestFullScreen(requiredFullScreenDom)
        // TODO:更改全屏方式
        // https://blog.csdn.net/zqian1994/article/details/105814522
      })
    },
    /**
     * @description 退出全屏
     */
    exitFullscreen() {
      if (!checkFullScreen() && this.boardModel === this.parameter.FULLSCREEN) {
        // 从全屏退出只能是编辑或预览模式
        this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
          model:
            this.type === this.parameter.EDIT
              ? this.parameter.EDIT
              : this.parameter.PREVIEW
        })
        if (this.cacheBoardScale !== this.boardScale) {
          // 从全屏退出还原比例
          this.$store.commit(boardMutaion.SET_BOARD_SCALE, {
            scale: this.cacheBoardScale
          })
        }
        this.doWithBoardFrameStyle()
        return true
      }
      return false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.doWithRect()
      window.addEventListener('resize', this.doWithRect)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.doWithRect)
  }
}
</script>
<style lang="less" scoped>
@import url('../../../../assets/less/common/variables.less');
.@{board}-content {
  top: 64px;
  bottom: 32px;
  right: @board-setting-width;
  overflow: auto;
  background-color: #dbdbdb;
  transition: left 0.3s ease-in-out, right 0.3s ease-in-out;
  .board-frame {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    overflow: visible;
    .board-canvas {
      position: relative;
      text-align: center;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 2px 4px 0px;
      z-index: 0;
    }
  }
}
</style>
