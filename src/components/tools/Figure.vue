<template>
  <div class="dv-figure-bar">
    <div class="dv-figure" :style="style"></div>
  </div>
</template>

<script>
export default {
  name: 'ChartsFigure',
  props: {
    setting: {
      type: Object,
      required: true
    }
  },
  created() {
    this.handleStyle(this.setting)
  },
  watch: {
    setting: {
      handler(newValue, oldValue) {
        this.handleStyle(newValue)
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      style: {}
    }
  },
  methods: {
    handleStyle(setting) {
      const view = setting.view
      const config = setting.config.style
      const style = {
        ...config,
        width: view.width + 'px',
        transform: `translate3d(0,0,0)`,
        borderRadius:
          typeof config.borderRadius === 'string'
            ? config.borderRadius
            : config.borderRadius + 'px'
      }
      if (this.setting.config.title === '直线') {
        if (config.showShadow) {
          style.boxShadow = `0 ${view.height / 2}px ${
            view.height
          }px ${config.shadowColor}`
        }
        style.borderWidth = view.height + 'px 0 0' // 直线只显示上边框
      } else {
        style.height = view.height + 'px'
        style.borderWidth = config.borderWidth + 'px'
      }
      this.style = style
    }
  }
}
</script>

<style lang="less" scoped>
.dv-figure-bar {
  position: relative;
  width: 100%;
  height: 100%;

  .dv-figure {
    background-clip: content-box;
  }
}
</style>
