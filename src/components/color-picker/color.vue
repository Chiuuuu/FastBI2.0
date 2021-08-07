<template>
  <div class="show-color" :style="wrapStyle">
    <!-- 颜色拾色器 start -->
    <div class="color-picker-container">
      <!-- 头部：用于切换类型：start -->
      <ColorPickerHeader></ColorPickerHeader>
      <!-- 头部：用于切换类型：end -->
      <!-- 类型内容 start -->
      <div class="body">
        <!-- 调色器 start -->
        <ColorCorrenction :visible="isMore" :model="model"></ColorCorrenction>
        <!-- 调色器 end -->
        <!-- 简单模式 start -->
        <div class="color-wrapper">
          <ColorValueModel :model="model"></ColorValueModel>
          <ColorPouList :visible="!isMore"></ColorPouList>
          <!-- 切换模式按钮 start -->
          <div class="color-block">
            <button
              class="event-btn submit"
              @click="$event => handleSubmit($event)"
            >
              确定
            </button>
            <button class="event-btn cancel" @click="handleCancel">取消</button>
            <button
              type="button"
              class="btn btn-menu-right"
              @click="handleChangeModel"
            >
              {{ isMore ? '简单模式' : '更多颜色' }}
            </button>
          </div>
          <!-- 切换模式按钮 end -->
        </div>
        <!-- 简单模式 end -->
      </div>
      <!-- 类型内容 end -->
    </div>
    <!-- 颜色拾色器 end -->
  </div>
</template>
<script>
import ColorPickerHeader from './components/header'
import ColorCorrenction from './components/correnction'
import ColorValueModel from './components/model'
import ColorPouList from './components/list'
import { parseColor } from './converColor'
export default {
  name: 'ColorPicker',
  props: {
    zIndex: {
      type: Number,
      default: 1001
    },
    parent: {
      type: Object,
      default: () => {}
    },
    target: {
      type: [MouseEvent, Object],
      default: () => {}
    },
    remove: {
      type: Function
    },
    customStyle: {
      type: Function
    }
  },
  data() {
    return {
      isMore: false,
      wrapStyle: {},
      model: {
        type: 'RGBA',
        value: '',
        origin: '',
        cacheH: ''
      }
    }
  },
  provide() {
    return {
      colorPicker: this
    }
  },
  components: {
    ColorPickerHeader,
    ColorCorrenction,
    ColorValueModel,
    ColorPouList
  },
  mounted() {
    this.model = {
      ...this.model,
      ...parseColor(this.parent.value)
    }
    this.doWithPosition()
  },
  methods: {
    doWithPosition() {
      // TODO:目前写死高度
      const MAX = 315
      const MIN = 231
      this.$nextTick(() => {
        const Dom = this.parent.$refs['js-color-wrap'].getBoundingClientRect()
        // 浏览器可视区域的高度(兼容处理)
        const clientHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight
        // 获取列表高度
        const ctxMenuDomHeight = MAX
        // 点击目标的位置
        const targetY = this.target.clientY
        // 是否超过底部
        const isMoreThanBottom = targetY + ctxMenuDomHeight - clientHeight > 0
        this.wrapStyle = {
          left: Dom.left - 3 + 'px',
          top: isMoreThanBottom
            ? Dom.top - MIN - 5 + 'px'
            : Dom.bottom + 5 + 'px',
          zIndex: this.zIndex + 1
        }
      })
    },
    handleChangeModel() {
      this.isMore = !this.isMore
    },
    update(color) {
      this.model = {
        ...this.model,
        ...parseColor(color)
      }
    },
    handleSubmit(event, color) {
      this.parent.changeColor(color || this.model.value)
    },
    handleCancel() {
      this.parent.close()
    },
    setTransparent() {
      this.parent.changeColor('transparent')
    }
  }
}
</script>
<style lang="less">
@import url('./index.less');
.show-color {
  position: absolute;
  top: 32px;
  left: 105px;
  width: 190px;
  border: 1px solid #ccc;
}
</style>
