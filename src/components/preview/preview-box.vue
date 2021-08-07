<template>
  <div class="preview-box" :style="contentStyles">
    <div class="preview-wrap" :style="dvWrapperStyles">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    item: {
      type: Object,
      required: true
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
    }
  },
  computed: {
    ...mapGetters(['currentSelected']),
    isLine() {
      return this.item.setting.chartType === 'line'
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
      return {
        width: this.transformData.width + 'px',
        height: this.transformData.height + 'px'
      }
    }
  }
}
</script>
