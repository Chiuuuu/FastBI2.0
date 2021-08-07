<template>
  <div
    class="color"
    ref="js-color-wrap"
    :class="isTransparent ? 'transparency' : ''"
    :style="!isTransparent && colorStyle"
    @click="openColorSelect"
  ></div>
</template>
<script>
import CreateColor from './create'
export default {
  name: 'ColorPicker',
  props: {
    value: {
      // 样式值
      type: String,
      required: true
    },
    zIndex: {
      // 层级
      type: Number,
      default: 1001
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  watch: {
    value: {
      immediate: true,
      handler(color) {
        this.isTransparent = color === 'transparent'
        this.colorStyle.backgroundColor = color
      }
    }
  },
  data() {
    return {
      isTransparent: false,
      instance: null,
      colorStyle: {
        backgroundColor: ''
      }
    }
  },
  provide() {
    return {
      colorPicker: this
    }
  },
  methods: {
    openColorSelect(event) {
      this.show(event)
    },
    show(event) {
      this.instance = new CreateColor({
        target: event,
        parent: this
      })
    },
    close() {
      this.instance.remove()
      this.instance = null
    },
    changeColor(color) {
      this.isTransparent = false
      this.colorStyle.backgroundColor = color
      this.$emit('change', color)
      this.close()
    }
  }
}
</script>
<style lang="less">
.color {
  width: 100%;
  height: 100%;
  &.transparency {
    background-image: linear-gradient(
        45deg,
        #c5c5c5 25%,
        transparent 0,
        transparent 75%,
        #c5c5c5 0,
        #c5c5c5
      ),
      linear-gradient(
        45deg,
        #c5c5c5 25%,
        transparent 0,
        transparent 75%,
        #c5c5c5 0,
        #c5c5c5
      );
    background-size: 10px 10px;
    background-position: 0 0, 5px 5px;
    background-color: inherit;
  }
}
</style>
