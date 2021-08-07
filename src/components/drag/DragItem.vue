<template>
  <div
    class="dv-transform"
    :class="{ selected: isSelected && !isScreen }"
    :style="contentStyles"
    ref="dvTransform"
    @mousedown="handleMoveStart"
    @touchstart="handleMoveStart"
  >
    <div
      class="navigator-line"
      v-show="isSelected && !isScreen"
      :style="lineRotateStyle"
    >
      <div class="navigator-line-left" :style="lineLeft"></div>
      <div class="navigator-line-top" :style="lineTop"></div>
      <div class="navigator-line-account" :style="lineAccountStyle">
        {{ transformData.x + ',' + transformData.y }}
      </div>
    </div>
    <!-- <div class="dv-scale" :style="isFigure ? '' : dragScaleStyle"> -->
    <div
      class="dv-com"
      :class="{ hovered: comHover && !isScreen }"
      style="transform: rotate(0deg);"
    >
      <DragLine
        v-if="isLine"
        :item="item"
        :selected="selected"
        :com-hover="comHover"
      >
        <slot></slot>
      </DragLine>
      <div
        v-else
        :class="[
          'transform-handler',
          { hide: (!comHover && !isSelected) || isScreen },
          { 'default-cursor': isScreen }
        ]"
      >
        <div
          :class="['dv-wrapper', { 'full-screen': isScreen }]"
          :id="item.id"
          :style="dvWrapperStyles"
        >
          <slot>我是块的标题</slot>
        </div>
        <!--缩放辅助条-->
        <i class="top-handler">
          <span
            class="control-point"
            :style="controlPointStyleBottom"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span
        ></i>
        <i class="left-handler">
          <span
            class="control-point"
            :style="controlPointStyleRight"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
        <i class="bottom-handler">
          <span
            class="control-point"
            :style="controlPointStyleBottom"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
        <i class="right-handler">
          <span
            class="control-point"
            :style="controlPointStyleRight"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
        <i class="top-left-handler">
          <!-- <span
            v-show="isFigure"
            class="control-rotate control-rotate-top-left"
            @mousedown.stop.prevent="handleRotateMoveStart"
          ></span> -->
          <span
            class="control-point"
            :style="controlPointStyleTopLeft"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
        <i class="top-right-handler">
          <!-- <span
            v-show="isFigure"
            class="control-rotate control-rotate-top-right"
            @mousedown.stop.prevent="handleRotateMoveStart"
          ></span> -->
          <span
            class="control-point"
            :style="controlPointStyleTopRight"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
        <i class="bottom-left-handler">
          <!-- <span
            v-show="isFigure"
            class="control-rotate control-rotate-bottom-left"
            @mousedown.stop.prevent="handleRotateMoveStart"
          ></span> -->
          <span
            class="control-point"
            :style="controlPointStyleTopRight"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
        <i class="bottom-right-handler">
          <!-- <span
            v-show="isFigure"
            class="control-rotate control-rotate-bottom-right"
            @mousedown.stop.prevent="handleRotateMoveStart"
          ></span> -->
          <span
            class="control-point"
            :style="controlPointStyleTopLeft"
            @mousedown.stop.prevent="handleResizeMoveStart"
          ></span>
        </i>
      </div>
    </div>
    <!-- </div> -->
  </div>
</template>

<script>
// 引入两个注册和取消注册的事件
import { on, off } from 'bin-ui/src/utils/dom'
import { mapGetters, mapActions } from 'vuex'
import { setBaseProperty } from '../../api/canvasMaps/canvas-maps-request'
import DragLine from './components/drag-line.vue'

export default {
  name: 'DragItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean
    },
    comHover: {
      type: Boolean
    }
  },
  components: {
    DragLine
  },
  data() {
    return {
      transformData: { width: 0, height: 0, x: 0, y: 0, rotate: 0 },
      dragData: {
        dragX: 0, // 缓存鼠标单次滑动的x
        dragY: 0, // 缓存鼠标单次滑动的y
        startX: 0, // 记录开始位置x
        startY: 0, // 记录开始位置y
        startWidth: 0, // 记录开始缩放的宽度
        startHeight: 0, // 记录开始缩放的高度
        originX: 0, // 记录开始的图形圆心
        originY: 0, // 记录开始的图形圆心
        rotate: 0, // 记录开始时的旋转角度
        shiftAngle: 0, // 记录开始时距离水平直角坐标系的偏移角度
        dragging: false
      },
      dragScale: null,
      resizeType: 'none',
      isSelected: false
    }
  },
  created() {
    this.transformData = { ...this.item.setting.view }
  },
  watch: {
    item: {
      handler(val) {
        if (val) {
          this.transformData = { ...val.setting.view }
        }
      },
      deep: true
    },
    selected: {
      handler(val) {
        this.isSelected = val
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters([
      'canvasRange',
      'pageSettings',
      'contextMenuInfo',
      'currentSelected',
      'coverageExpand',
      'isScreen'
    ]),
    // 鼠标移动根据栅格间距的值
    mouseMoveStep() {
      return this.canvasRange * this.pageSettings.gridStep
    },
    isFigure() {
      return this.item.setting.name === 'figure'
    },
    isLine() {
      return this.item.setting.chartType === 'line'
    },
    lineLeft() {
      return {
        width: this.transformData.x + 60 / this.canvasRange + 'px'
      }
    },
    lineTop() {
      return {
        height: this.transformData.y + 60 / this.canvasRange + 'px'
      }
    },
    lineAccountStyle() {
      let fontSize = 16 / this.canvasRange
      return {
        fontSize: fontSize > 24 ? '24px' : fontSize + 'px',
        left: -10 + 'px',
        top: -10 + 'px'
      }
    },
    lineRotateStyle() {
      if (this.isLine) {
        return {
          transform: `rotate(${360 - (this.transformData.rotate || 0)}deg)`
        }
      }
      return {}
    },
    contentStyles() {
      if (this.isLine) {
        return {
          width: this.transformData.width + 'px',
          height: this.transformData.height + 'px',
          transformOrigin: 'left center',
          transform: `translate3d(${this.transformData.x}px,${
            this.transformData.y
          }px,0) rotate(${this.transformData.rotate || 0}deg)`
        }
      } else {
        return {
          width: this.transformData.width + 'px',
          height: this.transformData.height + 'px',
          transform: `translate3d(${this.transformData.x}px,${
            this.transformData.y
          }px,0)`
        }
      }
    },
    dvWrapperStyles() {
      let style = {}
      if (this.dragScale) {
        style = {
          width: this.transformData.width / this.dragScale.x + 'px',
          height: this.transformData.height / this.dragScale.y + 'px'
        }
      } else {
        style = {
          width: this.transformData.width + 'px',
          height: this.transformData.height + 'px'
        }
        if (!this.isLine) {
          style.transform = `translateZ(0) rotate(${this.transformData.rotate ||
            0}deg)`
        }
      }
      if (this.isScreen) {
        style.cursor = 'default'
      }
      return style
    },
    controlPointStyleBottom() {
      return `cursor: ${this.handleCursor('bottom')}; transform: scale(${1 /
        this.canvasRange});`
    },
    controlPointStyleRight() {
      return `cursor: ${this.handleCursor('right')}; transform: scale(${1 /
        this.canvasRange});`
    },
    controlPointStyleTopLeft() {
      return `cursor: ${this.handleCursor('topLeft')}; transform: scale(${1 /
        this.canvasRange});`
    },
    controlPointStyleTopRight() {
      return `cursor: ${this.handleCursor('topRight')}; transform: scale(${1 /
        this.canvasRange});`
    },
    dragScaleStyle() {
      if (this.dragScale) {
        return `transform:scale(${this.dragScale.x},${this.dragScale.y})`
      }
      return ''
    },
    // 画布到页面边界距离X
    canvasOffsetX() {
      const coverageWidth =
        document.querySelector('.board-coverage').clientWidth || 120
      const screenShotWidth =
        document.querySelector('.screen-shot').clientWidth || 1368
      const canvasPanelWidth =
        document.querySelector('.canvas-panel').clientWidth || 1920
      const width = (screenShotWidth - canvasPanelWidth * this.canvasRange) / 2
      return coverageWidth + width
    },
    // 画布到页面边界距离Y
    canvasOffsetY() {
      const borderHeaderHeight =
        document.querySelector('.board-header').clientHeight || 62
      const screenShotHeight =
        document.querySelector('.screen-shot').clientHeight || 822
      const canvasPanelHeight =
        document.querySelector('.canvas-panel').clientHeight || 1080
      const height =
        (screenShotHeight - canvasPanelHeight * this.canvasRange) / 2
      return borderHeaderHeight + height
    }
  },
  methods: {
    ...mapActions(['updateChartData']),
    // 悬停事件
    handleHover() {
      this.comHover = true
    },
    handleNoHover() {
      this.comHover = false
    },
    // 处理不同旋转角度的缩放指针样式
    handleCursor(direction) {
      // 从左上开始按照顺时针排列样式
      const list = ['nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize']
      let index = 0
      switch (direction) {
        case 'topLeft':
        case 'bottomRight':
          index = 0
          break
        case 'top':
        case 'bottom':
          index = 1
          break
        case 'topRight':
        case 'bottomLeft':
          index = 2
          break
        case 'right':
        case 'left':
          index = 3
          break
      }
      // 旋转180度后样式是一样的
      // const rotate = this.transformData.rotate % 180
      // if (rotate <= 22.5 || rotate > 157.5) {
      //   index = index % 4
      // } else if (rotate > 22.5 && rotate <= 67.5) {
      //   index = (index + 1) % 4
      // } else if (rotate > 67.5 && rotate <= 112.5) {
      //   index = (index + 2) % 4
      // } else if (rotate > 112.5 && rotate <= 157.5) {
      //   index = (index + 3) % 4
      // }
      return list[index]
    },
    // 鼠标拖动事件函数
    handleMoveStart(event) {
      if (!this.isSelected) {
        this.isSelected = true
        this.$store.dispatch('SingleSelected', this.item.id)
        this.$store.dispatch('ToggleContextMenu')
      }
      if (!this.isSelected || this.contextMenuInfo.isShow || this.isScreen) { return }
      // 计算鼠标的相对位置
      // 兼容移动端touch事件
      let e = event.targetTouches ? event.targetTouches[0] : event
      const distance = {
        x: e.clientX,
        y: e.clientY
      }
      // 缓存鼠标点击位置，会事实更新
      this.dragData.dragX = distance.x
      this.dragData.dragY = distance.y
      // 记录开始的xy
      this.dragData.startX = this.transformData.x
      this.dragData.startY = this.transformData.y

      this.dragData.dragging = true
      on(window, 'mousemove', this.handleMoveMove)
      on(window, 'touchmove', this.handleMoveMove)
      on(window, 'mouseup', this.handleMoveEnd)
      on(window, 'touchend', this.handleMoveEnd)
    },
    handleMoveMove(event) {
      if (!this.dragData.dragging) return false
      // 兼容移动端touch事件
      let e = event.targetTouches ? event.targetTouches[0] : event
      const distance = {
        x: e.clientX,
        y: e.clientY
      }
      // 鼠标走的像素数需要换算成缩放画布的实际移动数
      const diffDistance = {
        x:
          Math.floor((distance.x - this.dragData.dragX) / this.mouseMoveStep) *
          this.mouseMoveStep,
        y:
          Math.floor((distance.y - this.dragData.dragY) / this.mouseMoveStep) *
          this.mouseMoveStep
      }
      // 计算间距需要除以缩放比例否则移动像素对不齐
      this.transformData.x =
        this.dragData.startX + Math.round(diffDistance.x / this.canvasRange)
      this.transformData.y =
        this.dragData.startY + Math.round(diffDistance.y / this.canvasRange)

      this.$store.dispatch('SetBaseProperty', this.transformData)
    },
    handleMoveEnd() {
      this.dragData.dragging = false
      this.setBaseProperty()
      off(window, 'mousemove', this.handleMoveMove)
      off(window, 'touchmove', this.handleMoveMove)
      off(window, 'mouseup', this.handleMoveEnd)
      off(window, 'touchend', this.handleMoveEnd)
    },
    // 鼠标拖动缩放事件函数
    handleResizeMoveStart(event) {
      this.resizeType = event.target.parentElement.className
      if (!this.isSelected) return
      // 计算鼠标的相对位置
      const distance = {
        x: event.clientX,
        y: event.clientY
      }
      // 缓存鼠标点击位置，会事实更新
      this.dragData.dragX = distance.x
      this.dragData.dragY = distance.y
      // 记录开始的xy
      this.dragData.startX = this.transformData.x
      this.dragData.startY = this.transformData.y
      // 记录开始的width height
      this.dragData.startWidth = this.transformData.width
      this.dragData.startHeight = this.transformData.height
      this.dragData.dragging = true
      on(window, 'mousemove', this.handleResizeMoveMove)
      on(window, 'mouseup', this.handleResizeMoveEnd)
    },
    handleResizeMoveMove(event) {
      if (!this.dragData.dragging) return false
      const distance = {
        x: event.clientX,
        y: event.clientY
      }
      // 鼠标走的像素数需要换算成缩放画布的实际移动数
      const diffDistance = {
        // x: Math.floor((distance.x - this.dragData.dragX) / this.mouseMoveStep / Math.cos(((this.transformData.rotate || 0) / 180) * Math.PI)) * this.mouseMoveStep,
        // y: Math.floor((distance.y - this.dragData.dragY) / this.mouseMoveStep / Math.cos(((this.transformData.rotate || 0) / 180) * Math.PI)) * this.mouseMoveStep
        x:
          Math.floor((distance.x - this.dragData.dragX) / this.mouseMoveStep) *
          this.mouseMoveStep,
        y:
          Math.floor((distance.y - this.dragData.dragY) / this.mouseMoveStep) *
          this.mouseMoveStep
      }
      // 换算实际transform宽高
      const transform = {
        w: Math.round(diffDistance.x / this.canvasRange),
        h: Math.round(diffDistance.y / this.canvasRange)
      }
      this.resizeWidth(this.resizeType, transform.w, transform.h)
    },
    handleResizeMoveEnd() {
      this.dragData.dragging = false
      this.resizeType = 'none'
      this.dragScale = null
      // resizeWidth 重置宽高
      this.setBaseProperty()
      off(window, 'mousemove', this.handleResizeMoveMove)
      off(window, 'mouseup', this.handleResizeMoveEnd)
    },
    // 根据缩放类型来调节宽高
    resizeWidth(type, w, h) {
      switch (type) {
        case 'top-handler': // 上面需要更新位置pos
          this.transformData.height = this.dragData.startHeight - h
          this.transformData.y = this.dragData.startY + h
          break
        case 'left-handler': // 左边也需要更新位置pos
          this.transformData.width = this.dragData.startWidth - w
          this.transformData.x = this.dragData.startX + w
          break
        case 'bottom-handler': // 下面
          this.transformData.height = this.dragData.startHeight + h
          break
        case 'right-handler': // 右边
          this.transformData.width = this.dragData.startWidth + w
          break
        case 'top-left-handler': // 左上角也需要更新位置pos
          this.transformData.width = this.dragData.startWidth - w
          this.transformData.x = this.dragData.startX + w
          this.transformData.height = this.dragData.startHeight - h
          this.transformData.y = this.dragData.startY + h
          break
        case 'top-right-handler': // 右上角也需要更新位置pos
          this.transformData.width = this.dragData.startWidth + w
          this.transformData.height = this.dragData.startHeight - h
          this.transformData.y = this.dragData.startY + h
          break
        case 'bottom-left-handler': // 左下角
          this.transformData.x = this.dragData.startX + w
          this.transformData.width = this.dragData.startWidth - w
          this.transformData.height = this.dragData.startHeight + h
          break
        case 'bottom-right-handler': // 右下角
          this.transformData.width = this.dragData.startWidth + w
          this.transformData.height = this.dragData.startHeight + h
          break
      }
      // 边界值处理
      if (this.transformData.width < 0) {
        this.transformData.width = 0
      } else if (this.transformData.height < 0) {
        this.transformData.height = 0
      }
      if (
        this.transformData.x >
        this.dragData.startX + this.dragData.startWidth
      ) {
        this.transformData.x = this.dragData.startX + this.dragData.startWidth
      } else if (
        this.transformData.y >
        this.dragData.startY + this.dragData.startHeight
      ) {
        this.transformData.y = this.dragData.startY + this.dragData.startHeight
      }
      // // 计算缩放比例
      // this.dragScale = {
      //   x: this.transformData.width / this.dragData.startWidth,
      //   y: this.transformData.height / this.dragData.startHeight
      // }
      this.$store.dispatch('SetBaseProperty', this.transformData)
    },
    // 鼠标拖动旋转事件函数
    handleRotateMoveStart(event) {
      if (!this.isSelected) return
      // 计算鼠标的相对位置
      const distance = {
        x: event.clientX,
        y: event.clientY
      }
      // 缓存鼠标点击位置，会事实更新
      this.dragData.dragX = distance.x
      this.dragData.dragY = distance.y
      // 记录开始的xy
      this.dragData.startX = this.transformData.x
      this.dragData.startY = this.transformData.y
      // 记录开始的width height
      this.dragData.startWidth = this.transformData.width
      this.dragData.startHeight = this.transformData.height
      // 记录开始的圆心
      this.dragData.originX =
        (this.transformData.x + this.transformData.width / 2) * this.canvasRange
      this.dragData.originY =
        (this.transformData.y + this.transformData.height / 2) *
        this.canvasRange
      this.dragData.rotate = this.transformData.rotate
      this.dragData.shiftAngle = this.handleComputeAngle(distance)
      this.dragData.dragging = true
      on(window, 'mousemove', this.handleRotateMoveMove)
      on(window, 'mouseup', this.handleRotateMoveEnd)
    },
    handleRotateMoveMove(event) {
      if (!this.dragData.dragging) return false
      const distance = {
        x: event.clientX,
        y: event.clientY
      }
      // 最终旋转角度增量 = 当前旋转角度 - 初始偏移角度
      // rotate值 = (初始旋转值 + 旋转角度增量) % 360
      const angle = this.handleComputeAngle(distance)
      const rotate =
        (this.dragData.rotate + (angle - this.dragData.shiftAngle) + 360) % 360
      this.transformData.rotate = +rotate.toFixed(2)
      this.$store.dispatch('SetBaseProperty', this.transformData)
    },
    handleRotateMoveEnd(event) {
      this.dragData.dragging = false
      this.setBaseProperty()
      off(window, 'mousemove', this.handleRotateMoveMove)
      off(window, 'mouseup', this.handleRotateMoveEnd)
    },
    handleComputeAngle(distance) {
      // 减去画布到页面的距离
      const distanceX = distance.x - this.canvasOffsetX
      const distanceY = distance.y - this.canvasOffsetY
      // 计算鼠标到圆心的距离, 并根据反正切值获取角度
      const dx = distanceX - this.dragData.originX
      const dy = distanceY - this.dragData.originY
      let angle = (Math.atan(Math.abs(dx / dy)) / (Math.PI * 2)) * 360
      // 判断鼠标在水平直角坐标系的位置, 取得最终角度值
      if (dx < 0 && dy < 0) {
        // 相对在左上角，第四象限
        angle = 360 - angle
      } else if (dx < 0 && dy > 0) {
        // 左下角,3象限
        angle = 180 + angle
      } else if (dx > 0 && dy < 0) {
        // 右上角，1象限
        angle = +angle
      } else if (dx > 0 && dy > 0) {
        // 右下角，2象限
        angle = 180 - angle
      }
      return angle
    },
    setBaseProperty() {
      this.updateChartData()
      // setBaseProperty(this.currentSelected)
    }
  }
}
</script>
<style lang="less" scoped>
.control-rotate {
  display: block;
  width: 100px;
  height: 100px;
  background: transparent;
  position: absolute;
  top: -45px;
  left: -45px;
  z-index: -1;
}
.control-rotate-top-left,
.control-rotate-bottom-left {
  cursor: url('../../assets/images/chart/routate_left.png'), auto;
}
.control-rotate-top-right,
.control-rotate-bottom-right {
  cursor: url('../../assets/images/chart/routate_right.png'), auto;
}
</style>
<style lang="less" scoped>
.full-screen {
  pointer-events: auto !important;
}
</style>
