<template>
  <div
    class="board-shape-unit"
    :class="isActive ? 'shape-unit-active' : ''"
    :style="getBoardShapeUnitStyle()"
    ref="js-board-shape-unit"
  >
    <div
      class="shape-rotate-left"
      :style="getRotateStyle('left')"
      @mousedown.stop="$event => handleMouseDown($event, 'rotate')"
      v-if="isShapeLine && model === parameter.EDIT"
    ></div>
    <!-- 八个方向拖拽区 start -->
    <div class="shape-resize" v-if="!isShapeLine && model === parameter.EDIT">
      <div
        v-for="item in pointList"
        :class="`resize-${item}`"
        :key="item"
        @mousedown.stop="$event => handleMouseDown($event, item)"
      ></div>
    </div>
    <!-- 八个方向拖拽区 end -->

    <div
      class="shape-mover"
      v-if="model === parameter.EDIT && isShowShapMover"
      @dblclick.stop="handleDbClick"
      @mousedown.stop="$event => handleMouseDown($event, 'shape')"
    ></div>

    <!-- 插入真正的图表 start -->
    <slot></slot>
    <!-- 插入真正的图表 end -->
    <div
      class="shape-rotate-right"
      :style="getRotateStyle('right')"
      @mousedown.stop="$event => handleMouseDown($event, 'rotate')"
      v-if="isShapeLine && model === parameter.EDIT"
    ></div>

    <!-- 查看数据 -->
    <UnitChartTableData :show="show" :chart-data="chartData" @cancel="show = false"></UnitChartTableData>
  </div>
</template>
<script>
import ContextMenu from '@/components/contextmenu';
import BoardType from '@/views/screenManage/screen/setting/default-type';
import { getStyle } from '@/utils';
import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { mapState } from 'vuex';
import ContenxtmenuMethodMixin from '@/views/screenManage/screen/setting/contenxtmenu-method-mixin';
import { checkFullScreen } from '@/utils';

/**
 * @description 图表外框区
 */
export default {
  name: 'BoardShapeUnit',
  mixins: [ContenxtmenuMethodMixin],
  data() {
    return {
      parameter,
      isShowShapMover: true, // 控制是否能拖动
      pointList: ['leftTop', 'top', 'rightTop', 'right', 'rightBottom', 'bottom', 'leftBottom', 'left'], // 八个方向
      dragging: false, // 是否正则拖拽
      contenxtMenu: [
        {
          name: '查看数据',
          readonly: true,
          onClick: this.handleChartDataComponent,
        },
        {
          name: '导出',
          readonly: true,
          children: [
            { name: 'excel', onClick: this.handleExportExcel },
            { name: 'csv', onClick: this.handleExportCsv },
            { name: '导出图片', onClick: this.handleExportImg },
          ],
        },
        // 右键菜单
        {
          name: '复制',
          readonly: false,
          onClick: this.handleCopyComponent,
        },
        {
          name: '删除',
          readonly: false,
          onClick: this.handleDeleComponent,
        },
        {
          name: '排列',
          readonly: false,
          children: [
            {
              name: '置于顶层',
              onClick: this.handleSetZIndex.bind(this, 'top'),
            },
            {
              name: '置于底层',
              onClick: this.handleSetZIndex.bind(this, 'bottom'),
            },
            {
              name: '上移一层',
              onClick: this.handleSetZIndex.bind(this, 'up'),
            },
            {
              name: '下移一层',
              onClick: this.handleSetZIndex.bind(this, 'down'),
            },
          ],
        },
      ],
      show: false, // 图表数据查看
      chartData: {}, // 图表数据
    };
  },
  provide() {
    return {
      shapeUnit: this,
    };
  },
  props: {
    config: {
      // 配置项信息
      type: Object,
      required: true,
    },
    index: {
      // 组件下标
      type: Number,
      required: true,
    },
    component: {
      // 组件信息
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      boardScale: state => state.board.scale,
      model: state => state.board.model,
    }),
    isActive() {
      // 是否处于活动状态
      return this.component === this.$store.state.board.currentCom;
    },
    isShapeLine() {
      return this.component.type === BoardType.ShapeLine;
    },
    // 是否需要导出
    isNeedExport() {
      return this.component.type.includes('Chart');
    },
  },
  watch: {
    isActive(val) {
      if (!val) {
        this.isShowShapMover = true;
      }
    },
    model() {
      this.$store.dispatch('common/destroy_context_menu');
      this.initContextMenu();
    },
  },
  mounted() {
    this.initContextMenu();
  },
  beforeDestroy() {
    this.destoryContextMenu();
  },
  methods: {
    /**
     * @description 初始化右键菜单
     */
    initContextMenu() {
      const contextmenuDom = this.$refs['js-board-shape-unit'];
      contextmenuDom && contextmenuDom.addEventListener('contextmenu', this.handleConextMenu);
    },
    /**
     * @description 销毁右键菜单
     */
    destoryContextMenu() {
      const contextmenuDom = this.$refs['js-board-shape-unit'];
      contextmenuDom && contextmenuDom.removeEventListener('contextmenu', this.handleConextMenu);
    },
    /**
     * @description 初始化右键菜单
     */
    handleConextMenu(e) {
      e.preventDefault();
      this.handleCreateMenu(e);
    },
    /**
     * @description 创建右键菜单
     */
    handleCreateMenu(e) {
      e.stopPropagation();
      const isFullScreen = checkFullScreen();
      if (isFullScreen && !this.isNeedExport) {
        return;
      }
      let list = this.contenxtMenu;
      if (isFullScreen) {
        list = list.filter(item => item.readonly);
      }
      if (!this.isNeedExport) {
        list = list.filter(item => !item.readonly);
      }
      const that = this;
      function addEvent(target) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that.component, that.index, that);
          target.onClick.apply(this, arguments);
        };
      }
      const targetDom = this.$parent.$parent.$refs['js-board-content'];
      // eslint-disable-next-line no-new
      new ContextMenu({
        vm: that,
        menus: list.map(item => {
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
        containerDom: isFullScreen ? targetDom : null,
        markDom: isFullScreen ? targetDom : null,
      });
    },
    /**
     * @description 获取旋转div的样式
     */
    getRotateStyle(type = 'left') {
      const space = this.config.style.size.height > 10 ? this.config.style.size.height : 10;
      return {
        width: `${space}px`,
        height: `${space}px`,
        marginTop: `-${space / 2}px`,
        [type === 'left' ? 'left' : 'right']: `-${space}px`,
      };
    },
    /**
     * @description 获取样式
     */
    getBoardShapeUnitStyle() {
      const {
        style: {
          position,
          size,
          background,
          border,
          echart: { rotate },
        },
      } = this.config;

      let style = {
        zIndex: this.index + 1,
      };

      if (typeof rotate !== 'undefined') {
        // 当有旋转配置项的时候
        style['transform'] = `rotate(${rotate}deg)`;
      }

      const checkProps = {
        position,
        size,
        background,
        border,
      };
      style = getStyle(style, checkProps, ['width', 'height', 'left', 'top', 'radius'], ['background', 'border']);

      return style;
    },
    /**
     * @description 鼠标按下一系列事件
     */
    handleMouseDown(event, type) {
      // 如果不能拖拽或者不是编辑模式则直接返回不操作
      if (!this.isShowShapMover || this.model !== this.parameter.EDIT) return;

      this.dragging = false;
      this.$store.commit(boardMutaion.SET_CURCOM, {
        component: this.component,
      });

      // 设置画板的比例
      const BOARD_SCALE = this.boardScale;

      const SHAPE = 'shape';

      // 记录开始拖拽的元素信息
      const startDragInfo = {
        size: Object.assign({}, this.config.style.size),
        position: Object.assign({}, this.config.style.position),
        echart: {
          rotate: this.config.style.echart.rotate,
        },
      };

      // 记录结束拖拽的元素信息
      let endStyle = {};

      // 记录开始拖拽的鼠标位置
      let startEvent = {
        x: event.clientX,
        y: event.clientY,
      };

      // 记录开始的距离
      const diff = {
        x: startEvent.x - startDragInfo.position.left * BOARD_SCALE,
        y: startEvent.y - startDragInfo.position.top * BOARD_SCALE,
      };

      if (typeof startDragInfo.echart.rotate !== 'undefined') {
        // 如果有旋转配置
        // 设置组件中心点
        const rect = this.$el.getBoundingClientRect();
        startEvent['centerX'] = Math.round(rect.left + rect.width / 2);
        startEvent['centerY'] = Math.round(rect.top + rect.height / 2);
      }

      // 执行方法
      let perform = {
        [SHAPE]: this.handleShapMove,
        leftTop: this.handleLeftTopMove,
        top: this.handleTopMove,
        rightTop: this.handleRightTopMove,
        right: this.handleRightMove,
        rightBottom: this.handleRightBottomMove,
        bottom: this.handleBottomMove,
        leftBottom: this.handleLeftBottomMove,
        left: this.handleLeftMove,
        rotate: this.handleRotate,
      };

      document.onmousemove = mouseEvent => {
        this.dragging = true;
        // 设置当前组件的状态,防止拖动的情况更新组件
        if (this.dragging && this.$store.state.board.currentComState === 'stop') {
          this.$store.commit(boardMutaion.SET_CURCOM_STATE, {
            // 如果是shape就是移动状态，
            // 如果不是则为缩放状态
            comState: type === SHAPE ? 'move' : 'zoom',
          });
        }

        const result = perform[type](mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff);

        endStyle = {
          ...result,
        };

        this.$store.commit(boardMutaion.SET_SHAPE_STYLE, {
          style: {
            ...endStyle,
          },
        });
      };

      // 鼠标放开的时候移除并重置相关事件
      document.onmouseup = () => {
        // 防止没有拖动的情况执行
        if (this.dragging) {
          // 记录修改当前组件样式
          this.$store.commit(historyMutation.COMMAND, {
            commandType: 'DragMove',
            target: this.component,
            store: this.$store,
            startStyle: startDragInfo,
            endStyle,
            afterExecute: () => {
              this.$store.commit(boardMutaion.SET_CURCOM_STATE, {
                comState: 'stop',
              });
            },
          });
          this.dragging = false;
        }
        // 鼠标弹起来的时候不再移动
        document.onmousemove = null;
        // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
        document.onmouseup = null;
      };
    },
    /**
     * @description 图表单元框移动
     */
    handleShapMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff) {
      // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
      const left = mouseEvent.clientX - diff.x;
      const top = mouseEvent.clientY - diff.y;
      return {
        position: {
          left: Math.round(left / BOARD_SCALE),
          top: Math.round(top / BOARD_SCALE),
        },
      };
    },
    /**
     * @description 图表单元框向左拉伸
     */
    handleLeftMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff) {
      let left = mouseEvent.clientX - diff.x;
      let width = (startEvent.x - mouseEvent.clientX + startDragInfo.size.width * BOARD_SCALE) / BOARD_SCALE;

      width = Math.round(Math.max(1, width));
      left =
        width === 1 ? startDragInfo.size.width - width + startDragInfo.position.left : Math.round(left / BOARD_SCALE);
      return {
        size: {
          width,
        },
        position: {
          left,
        },
      };
    },
    /**
     * @description 图表单元框左上角拉伸
     */
    handleLeftTopMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff) {
      const {
        size: { width },
        position: { left },
      } = this.handleLeftMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff);
      const {
        size: { height },
        position: { top },
      } = this.handleTopMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff);
      return {
        size: {
          width,
          height,
        },
        position: {
          left,
          top,
        },
      };
    },
    /**
     * @description 图表单元框向上拉伸
     */
    handleTopMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff) {
      let top = mouseEvent.clientY - diff.y;
      let height = (startEvent.y - mouseEvent.clientY + startDragInfo.size.height * BOARD_SCALE) / BOARD_SCALE;
      height = Math.round(Math.max(1, height));
      top =
        height === 1 ? startDragInfo.size.height - height + startDragInfo.position.top : Math.round(top / BOARD_SCALE);
      return {
        size: {
          height,
        },
        position: {
          top,
        },
      };
    },
    /**
     * @description 图表单元框右上角拉伸
     */
    handleRightTopMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff) {
      const {
        size: { width },
      } = this.handleRightMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff);
      const {
        size: { height },
        position: { top },
      } = this.handleTopMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff);
      return {
        size: {
          width,
          height,
        },
        position: {
          top,
        },
      };
    },
    /**
     * @description 图表单元框向右拉伸
     */
    handleRightMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE) {
      let width = (mouseEvent.clientX - startEvent.x + startDragInfo.size.width * BOARD_SCALE) / BOARD_SCALE;
      width = Math.round(Math.max(1, width));
      return {
        size: {
          width,
        },
      };
    },
    /**
     * @description 图表单元框右下角拉伸
     */
    handleRightBottomMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE) {
      const {
        size: { width },
      } = this.handleRightMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE);
      const {
        size: { height },
      } = this.handleBottomMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE);
      return {
        size: {
          width,
          height,
        },
      };
    },
    /**
     * @description 图表单元框向下拉伸
     */
    handleBottomMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE) {
      let height = (mouseEvent.clientY - startEvent.y + startDragInfo.size.height * BOARD_SCALE) / BOARD_SCALE;
      height = Math.round(Math.max(1, height));
      return {
        size: {
          height,
        },
      };
    },
    /**
     * @description 图表单元框左下角拉伸
     */
    handleLeftBottomMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff) {
      const {
        size: { width },
        position: { left },
      } = this.handleLeftMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE, diff);
      const {
        size: { height },
      } = this.handleBottomMove(mouseEvent, startDragInfo, startEvent, BOARD_SCALE);

      return {
        size: {
          width,
          height,
        },
        position: {
          left,
        },
      };
    },
    /**
     * @description 图表旋转
     */
    handleRotate(mouseEvent, startDragInfo, startEvent) {
      // 旋转前的角度
      const rotateDegreeBefore =
        Math.atan2(startEvent.y - startEvent.centerY, startEvent.x - startEvent.centerX) / (Math.PI / 180);

      // 旋转后的角度
      const rotateDegreeAfter =
        Math.atan2(mouseEvent.clientY - startEvent.centerY, mouseEvent.clientX - startEvent.centerX) / (Math.PI / 180);

      // 获取旋转的角度值， startEvent.rotate 为初始角度值
      const rotate = Math.round((startDragInfo.echart.rotate + rotateDegreeAfter - rotateDegreeBefore + 360) % 360);

      return {
        echart: {
          rotate,
        },
      };
    },
    /**
     * @description 图表单元框双击后不能拖动
     */
    handleDbClick() {
      this.isShowShapMover = false;
    },
    /**
     * @description 查看数据
     */
    showChartData(chartData) {
      this.chartData = chartData;
      this.show = true;
    },
  },
};
</script>
<style lang="less" scoped>
.board-shape-unit {
  position: absolute;
  box-sizing: content-box;
  &.shape-select {
    border: 1px solid #59c7f9;
  }
  .shape-mover {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: transparent;
    z-index: 5;
    cursor: move;
  }
  &.shape-unit-active {
    .shape-resize {
      border: 1px solid rgba(89, 199, 249, 0.6);
      [class^='resize-'] {
        display: block;
      }
    }
    .shape-rotate-left,
    .shape-rotate-right {
      display: block;
    }
  }
  &:hover {
    .shape-resize {
      box-shadow: 0 0 6px #58bee9;
    }
  }
}

.shape-rotate-left,
.shape-rotate-right {
  display: none;
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  cursor: s-resize;
}

.shape-rotate-left {
  left: -20px;
}

.shape-rotate-right {
  right: -20px;
}

.shape-resize {
  position: absolute;
  top: -1px;
  bottom: -1px;
  left: -1px;
  right: -1px;
  z-index: -1;
  [class^='resize-'] {
    display: none;
    position: absolute;
    width: 10px;
    height: 10px;
    z-index: 10;
    box-sizing: border-box;
    border: 3px solid #59c7f9;
  }
  .resize-leftTop {
    margin-top: -3px;
    margin-left: -3px;
    top: 0;
    left: 0;
    cursor: nwse-resize;
    border-right: none;
    border-bottom: none;
  }
  .resize-top {
    margin-top: -4px;
    margin-left: -5px;
    top: 0;
    left: 50%;
    cursor: ns-resize;
    border-left: none;
    border-right: none;
    border-bottom: none;
    border-width: 5px;
  }
  .resize-rightTop {
    margin-top: -3px;
    margin-left: -6px;
    top: 0;
    left: 100%;
    cursor: nesw-resize;
    border-left: none;
    border-bottom: none;
  }
  .resize-right {
    margin-top: -5px;
    margin-left: -6px;
    top: 50%;
    left: 100%;
    cursor: ew-resize;
    border-top: none;
    border-left: none;
    border-bottom: none;
    border-width: 5px;
  }
  .resize-rightBottom {
    margin-top: -6px;
    margin-left: -6px;
    top: 100%;
    left: 100%;
    cursor: nwse-resize;
    border-top: none;
    border-left: none;
  }
  .resize-bottom {
    margin-top: -6px;
    margin-left: -5px;
    top: 100%;
    left: 50%;
    cursor: ns-resize;
    border-top: none;
    border-left: none;
    border-right: none;
    border-width: 5px;
  }
  .resize-leftBottom {
    margin-top: -6px;
    margin-left: -3px;
    top: 100%;
    left: 0%;
    cursor: nesw-resize;
    border-top: none;
    border-right: none;
  }
  .resize-left {
    margin-top: -5px;
    margin-left: -4px;
    top: 50%;
    left: 0%;
    cursor: ew-resize;
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-width: 5px;
  }
}
</style>
