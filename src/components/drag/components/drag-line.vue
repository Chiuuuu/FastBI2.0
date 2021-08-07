<template>
  <div
    class="transform-handler"
    :class="{ hide: !comHover && !isSelected }"
    :style="dvWrapperStyles"
  >
    <slot>我是块的标题</slot>
    <div
      v-show="isSelected"
      class="line-left-point"
      @mousedown.stop.prevent="handleTransformStart($event, 'left')"
    ></div>
    <div
      v-show="isSelected"
      class="line-right-point"
      @mousedown.stop.prevent="handleTransformStart($event, 'right')"
    ></div>
  </div>
</template>

<script>
// 引入两个注册和取消注册的事件
import { on, off } from 'bin-ui/src/utils/dom'
import { mapGetters, mapActions } from 'vuex'

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
  data() {
    return {
      transformData: { width: 0, height: 0, x: 0, y: 0, rotate: 0 },
      dragData: {
        dotX: 0, // 另一端位置
        dotY: 0, // 另一端位置
        dragDot: 'left', // 当前拖动端点位置
        dragX: 0, // 缓存鼠标单次滑动的x
        dragY: 0, // 缓存鼠标单次滑动的y
        startX: 0, // 记录开始位置x
        startY: 0, // 记录开始位置y
        startWidth: 0, // 记录开始缩放的宽度
        startHeight: 0 // 记录开始缩放的高度
      },
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
      'coverageExpand'
    ]),
    // 鼠标移动根据栅格间距的值
    mouseMoveStep() {
      return this.canvasRange * this.pageSettings.gridStep
    },
    isFigure() {
      return this.item.setting.name === 'figure'
    },
    isLine() {
      return this.item.setting.config.title === '直线'
    },
    dvWrapperStyles() {
      return {
        width: this.transformData.width + 'px',
        height: this.transformData.height + 'px'
      }
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
    // 拖动直线端点
    handleTransformStart(event, dotDirection) {
      if (!this.isSelected) return
      // 计算鼠标的相对位置
      const distance = {
        x: event.clientX,
        y: event.clientY
      }
      // 记录开始的width height
      this.dragData.startWidth = this.transformData.width
      this.dragData.startHeight = this.transformData.height
      // 记录开始的xy
      this.dragData.startX = this.transformData.x
      this.dragData.startY = this.transformData.y
      // 缓存鼠标点击位置，会事实更新
      this.dragData.dragX = distance.x
      this.dragData.dragY = distance.y

      // 获取cosin值
      const cos = Math.cos(((this.transformData.rotate || 0) / 180) * Math.PI)
      const sin = Math.sin(((this.transformData.rotate || 0) / 180) * Math.PI)
      const dx = this.dragData.startWidth * cos * this.canvasRange
      const dy = this.dragData.startWidth * sin * this.canvasRange
      const origin = {
        originX: this.dragData.dragX - dx,
        originY: this.dragData.dragY - dy
      }
      if (dotDirection === 'left') {
        origin.originX = this.dragData.dragX + dx
        origin.originY = this.dragData.dragY + dy
      }
      // 记录开始的圆心
      this.dragData.dragDot = dotDirection
      this.dragData.dotX = origin.originX
      this.dragData.dotY = origin.originY

      // 获取角度
      const rotate = this.handleComputeAngle(distance)
      this.transformData.rotate = +rotate.toFixed(2)
      this.$store.dispatch('SetBaseProperty', this.transformData)

      on(window, 'mousemove', this.handleTransformMove)
      on(window, 'mouseup', this.handleTransformEnd)
    },
    handleTransformMove(event) {
      if (!this.isSelected) return false
      const distance = {
        x: event.clientX,
        y: event.clientY
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
      // 换算实际transform宽高
      const transform = {
        w: Math.round(diffDistance.x / this.canvasRange),
        h: Math.round(diffDistance.y / this.canvasRange)
      }
      // 根据当前鼠标点位到形变中心的距离计算偏移角度和宽高
      if (this.dragData.dragDot === 'left') {
        this.transformData.x = this.dragData.startX + transform.w
        this.transformData.y = this.dragData.startY + transform.h
      }

      // 计算实际长度
      const cos = Math.abs(
        Math.cos(((this.transformData.rotate || 0) / 180) * Math.PI)
      )
      let width = Math.abs(distance.x - this.dragData.dotX) / this.canvasRange
      // 倍数小于0.1可以近似等于Y轴点到点的长度了
      if (cos >= 0.1) {
        width = width / cos
      } else {
        width = Math.abs(distance.y - this.dragData.dotY) / this.canvasRange
      }
      this.transformData.width = Math.round(width)
      // 获取旋转角度
      const rotate = this.handleComputeAngle(distance)
      this.transformData.rotate = +rotate.toFixed(2)
      this.$store.dispatch('SetBaseProperty', this.transformData)
    },
    handleTransformEnd(event) {
      this.setBaseProperty()
      off(window, 'mousemove', this.handleTransformMove)
      off(window, 'mouseup', this.handleTransformEnd)
    },
    handleComputeAngle(distance) {
      // 计算鼠标到圆心的距离, 并根据反正切值获取角度
      const dx = distance.x - this.dragData.dotX
      const dy = distance.y - this.dragData.dotY
      let tan = dy / dx
      if (isNaN(tan) || tan === Infinity || tan === -Infinity) {
        tan = 0
      }
      let angle = (Math.atan(Math.abs(tan)) / (Math.PI * 2)) * 360
      // 判断鼠标在水平直角坐标系的位置, 取得最终角度值
      if (dx < 0 && dy < 0) {
        // 相对在左上角，第四象限
        angle = 180 + angle
      } else if (dx < 0 && dy > 0) {
        // 左下角,3象限
        angle = 180 - angle
      } else if (dx > 0 && dy < 0) {
        // 右上角，1象限
        angle = 360 - angle
      } else if (dx > 0 && dy > 0) {
        // 右下角，2象限
        angle = +angle
      }
      // 如果拖住的是左端点, 轴线要反转180度
      if (this.dragData.dragDot === 'left') {
        angle = (angle + 180) % 360
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
