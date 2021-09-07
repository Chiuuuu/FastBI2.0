<template>
  <div class="drawing-board-content reset-scrollbar" ref="js-board-content">
    <!-- 画板外框控制视图宽高 start -->
    <div class="board-frame" :style="boardFrameStyle">
      <!-- 画板控制缩放比例 start -->
      <div class="board-canvas" :style="boardCanvasStyle" @mousedown="handleBoardFrame">
        <!-- 画板控制拖放 start -->
        <div class="board-box board-dropable">
          <!-- 画板网格控制真实尺寸 start -->
          <a-spin :spinning="spinning" :tip="tip">
            <div class="board-grid" ref="js-board-grid" :style="boardGridStyle" @keyup.enter="handleKeyup">
              <BoardShapeUnit
                v-for="(item, index) in components"
                :key="item.id"
                :config="item.setting"
                :index="index"
                :component="item"
              >
                <component :is="item.type" :options="item.setting" ref="js-board-grid-chart"></component>
              </BoardShapeUnit>
            </div>
          </a-spin>
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
import { mapState } from 'vuex';
import { requestFullScreen, checkFullScreen } from '@/utils';
import BoardShapeUnit from '../components/board-shape-unit';
import ChartLine from '../components/chart/line/line';
import ChartBar from '../components/chart/bar/bar';
import ChartPie from '../components/chart/pie/pie';
import ChartRingPie from '../components/chart/ring-pie/ring-pie';
import ChartNestPie from '../components/chart/nest-pie/nest-pie';
import ChartRadar from '../components/chart/radar/radar';
import ChartGauge from '../components/chart/gauge/gauge';
import ChartScatter from '../components/chart/scatter/scatter';
import ChartSunburst from '../components/chart/sunburst/sunburst';
import ChartTreemap from '../components/chart/treemap/treemap';
import ChartHeatmap from '../components/chart/heatmap/heatmap';
import ChartProgress from '../components/progress/progress';
import ChartTable from '../components/table/table';
import BoardText from '../components/text/text';
import BoardImage from '../components/image/image';
import BoardSource from '../components/screen-source/source';
import ShapeLine from '../components/shape/line/line';
import ShapeRound from '../components/shape/round/round';
import ShapeRectangular from '../components/shape/rectangular/rectangular';
import ChartMap from '../components/chart/map/map';
import ChartFunnel from '../components/chart/funnel/funnel';
import BoardQuatoCard from '../components/quota-card/quota-card';

import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import ContextMenu from '@/components/contextmenu';
import ContenxtmenuMethodMixin from '@/views/screenManage/screen/setting/contenxtmenu-method-mixin';

/**
 * @description 大屏编辑区
 */
export default {
  name: 'DrawingBoardContent',
  mixins: [ContenxtmenuMethodMixin],
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
    BoardText,
    BoardImage,
    ChartMap,
    BoardQuatoCard,
    BoardSource,
    ChartFunnel,
  },
  props: {
    components: {
      // 组件列表
      type: Array,
      default: () => [],
    },
    type: {
      // 编辑区类型
      type: String,
      required: true,
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return [parameter.PREVIEW, parameter.EDIT].indexOf(value) !== -1;
      },
    },
    screenName: {
      type: String,
      required: false,
      default: '大屏',
    },
  },
  data() {
    return {
      parameter,
      fullscreenchangeList: ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'],
      boardFrameStyle: {}, // 画板外框样式
      boardCanvasStyle: {}, // 画板样式
      cacheBoardScale: '', // 缓存画板比例
      spinning: false,
      tip: '导出大屏...',
      contenxtMenuForScreen: [
        { name: '导出当前大屏', onClick: this.handleExportScreen },
        // 右键菜单
        { name: '取消' },
      ],
    };
  },
  computed: {
    ...mapState({
      currentCom: state => state.board.currentCom, // 当前图表
      boardScale: state => state.board.scale, // 比例
      boardModel: state => state.board.model, // 模式
      boardPage: state => state.board.page, // 页面
    }),
    boardGridStyle() {
      // 画板下的网格样式（真实的页面样式）
      return {
        width: `${this.boardPage.size.width}px`,
        height: `${this.boardPage.size.height}px`,
        backgroundColor: `${this.boardPage.background.color}`,
      };
    },
  },
  watch: {
    boardPage: {
      // 深度监听页面变化修改画板外框样式
      deep: true,
      handler(val) {
        if (val) {
          this.doWithBoardFrameStyle();
        }
      },
    },
    boardScale: {
      immediate: true,
      handler() {
        // 监听页面比例修改样式
        this.doWithBoardFrameStyle();
        this.doWithBoardCanvasStyle();
      },
    },
    boardModel(val) {
      // 删除出现的右键菜单
      this.$store.dispatch('common/destroy_context_menu');
      // 监听大屏模式
      if (val === parameter.FULLSCREEN) {
        this.cacheBoardScale = this.boardScale;
        this.fullScreenPreview();
        this.initContextMenuForScreen();
      }
    },
  },
  methods: {
    /**
     * @description 监听delete按键删除图表
     */
    handleDeleteChart(event) {
      let e = event || window.event;
      let code = e.keyCode || e.which;
      if (code === 46 && this.currentCom) {
        const index = this.components.findIndex(item => item === this.currentCom);
        this.$store.commit(boardMutaion.DELE_COM, {
          component: this.currentCom,
          index,
        });
      }
    },
    /**
     * @description 判断是否为全屏
     */
    isFullScreen() {
      return this.$store.state.board.model === this.parameter.FULLSCREEN;
    },
    /**
     * @description 点击画板设置当前组件为null
     */
    handleBoardFrame(event) {
      event.stopPropagation();
      this.$store.commit(boardMutaion.SET_CURCOM, {
        component: null,
      });
    },
    /**
     * @description 处理编辑区
     */
    doWithRect() {
      // 如果是从全屏退出则不需要再次处理比例
      if (this.exitFullscreen()) return;
      this.$nextTick(() => {
        const boardContentRect = this.$refs['js-board-content'].getBoundingClientRect();
        const SCALE = this.setRatio(boardContentRect);
        this.$store.commit(boardMutaion.SET_BOARD_SCALE, {
          scale: SCALE,
        });
      });
    },
    /**
     * @description 设置比例
     */
    // TODO: 自适应窗口就是根据宽和高的占比，取小的那个，自适应宽度就是取宽度占比
    setRatio(rect) {
      const MARGIN = 32;
      const isFullScreen = this.isFullScreen();
      const width = isFullScreen ? rect.width : rect.width - MARGIN * 2;
      const height = isFullScreen ? rect.height : rect.height - MARGIN * 2;
      const wRatio = isFullScreen
        ? +(width / this.boardPage.size.width)
        : +(width / this.boardPage.size.width).toFixed(2);
      const hRatio = isFullScreen
        ? +(height / this.boardPage.size.height)
        : +(height / this.boardPage.size.height).toFixed(2);
      return wRatio > hRatio ? hRatio : wRatio;
    },
    /**
     * @description 处理画板外框样式
     */
    doWithBoardFrameStyle() {
      const SPACE = 41;
      this.boardFrameStyle = this.isFullScreen()
        ? {
            width: `${Math.ceil(this.boardPage.size.width * this.boardScale)}px`,
            height: `${Math.ceil(this.boardPage.size.height * this.boardScale)}px`,
          }
        : {
            width: `${Math.ceil(this.boardPage.size.width * this.boardScale) + SPACE}px`, // 1920 => 1135
            height: `${Math.ceil(this.boardPage.size.height * this.boardScale) + SPACE + 5}px`, // 1080 => 661 高比宽多5像素
          };
    },
    /**
     * @description 处理画板比例
     */
    doWithBoardCanvasStyle() {
      const transformList = ['transform', 'WebkitTransform', 'MozTransform'];
      transformList.forEach(css => {
        this.boardCanvasStyle[css] = `scale(${this.boardScale})`;
      });
    },
    /**
     * @description 全屏预览
     */
    fullScreenPreview() {
      this.$nextTick(() => {
        const requiredFullScreenDom = this.$refs['js-board-content'];
        requestFullScreen(requiredFullScreenDom);
      });
    },
    /**
     * @description 退出全屏
     */
    exitFullscreen() {
      if (!checkFullScreen() && this.boardModel === this.parameter.FULLSCREEN) {
        return true;
      }
      return false;
    },
    /**
     * @description 全屏事件执行方法
     */
    listenerFun() {
      let isFullScreen = checkFullScreen();
      if (!isFullScreen) {
        // 退出全屏
        // 从全屏退出只能是编辑或预览模式
        this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
          model: this.type === this.parameter.EDIT ? this.parameter.EDIT : this.parameter.PREVIEW,
        });
        if (this.cacheBoardScale !== this.boardScale) {
          // 从全屏退出还原比例
          this.$store.commit(boardMutaion.SET_BOARD_SCALE, {
            scale: this.cacheBoardScale,
          });
        }
      }
      this.doWithBoardFrameStyle();
    },
    /**
     * @description 监听全屏事件
     */
    listenerFullScreen() {
      this.fullscreenchangeList.forEach(listener => {
        document.addEventListener(listener, this.listenerFun);
      });
    },
    /**
     * @description 取消监听全屏事件
     */
    removeListenerFullScreen() {
      this.fullscreenchangeList.forEach(listener => {
        document.removeEventListener(listener, this.listenerFun);
      });
    },
    /**
     * @description 初始化导出大屏右键菜单
     */
    initContextMenuForScreen() {
      const screenDom = this.$refs['js-board-grid'];
      screenDom && screenDom.addEventListener('contextmenu', this.handleCreateMenuForScreen);
    },
    /**
     * @description 创建导出大屏右键菜单
     */
    handleCreateMenuForScreen(e) {
      e.preventDefault();
      e.stopPropagation();
      const that = this;
      function addEvent(target) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that);
          target.onClick.apply(this, arguments);
        };
      }
      const isFullScreen = checkFullScreen();
      // eslint-disable-next-line no-new
      new ContextMenu({
        vm: that,
        menus: that.contenxtMenuForScreen.map(item => {
          if (item['children'] && item.children.length) {
            item.children.forEach(subitem => {
              addEvent(subitem);
            });
          } else {
            addEvent(item);
          }
          return item;
        }),
        target: e,
        subPosition: 'right',
        handleMarkCancel: function () {},
        containerDom: isFullScreen ? this.$refs['js-board-content'] : null,
        markDom: isFullScreen ? this.$refs['js-board-content'] : null,
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.doWithRect();
      window.addEventListener('resize', this.doWithRect);
      window.addEventListener('keyup', this.handleDeleteChart);
      this.listenerFullScreen();
      this.initContextMenuForScreen();
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.doWithRect);
    window.removeEventListener('keyup', this.handleDeleteChart);
    this.removeListenerFullScreen();
  },
};
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
