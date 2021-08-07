<template>
  <div class="slider-wraper" ref="js-slider-wraper">
    <slot></slot>
    <div class="slider-step"></div>
    <div class="slider-handle" ref="js-slider-handle"></div>
  </div>
</template>
<script>
export default {
  name: 'Slider',
  props: {
    value: {
      type: [Number, String],
      required: true
    }
  },
  watch: {
    value(val) {
      this.setThumb(val)
      this.$emit('change', val)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initDrag()
    })
  },
  methods: {
    setThumb(value) {
      const thumb = this.$refs['js-slider-handle']
      thumb.style.left = Number(value) + '%'
    },
    initDrag() {
      const self = this
      const thumb = this.$refs['js-slider-handle']
      const slider = this.$refs['js-slider-wraper']
      self.setThumb(self.value)
      let cache = 0
      thumb.onmousedown = function(event) {
        event.preventDefault() // prevent selection start (browser action)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        function onMouseMove(event) {
          let newLeft = event.clientX - slider.getBoundingClientRect().left
          // the pointer is out of slider => lock the thumb within the bounaries
          if (newLeft < 0) {
            newLeft = 0
          }

          if (newLeft > slider.offsetWidth) {
            newLeft = slider.offsetWidth
          }

          const t = Math.round(((newLeft / slider.offsetWidth) * 10000) / 100.0)
          self.setThumb(t)
          cache = t
          self.$emit('change', t)
        }

        function onMouseUp() {
          self.$emit('afterChange', Number((cache / 100).toFixed(2)))
          document.removeEventListener('mouseup', onMouseUp)
          document.removeEventListener('mousemove', onMouseMove)
        }
      }

      thumb.ondragstart = function() {
        return false
      }
    }
  }
}
</script>
<style lang="less" scoped>
.slider-wraper {
  position: relative;
  .slider-step {
    position: absolute;
    width: 100%;
    height: 4px;
    background-color: #ccc;
    border-radius: 2px;
  }
  .slider-handle {
    position: absolute;
    width: 16px;
    height: 16px;
    margin-top: -7px;
    background-color: #fff;
    border: 2px solid #8f8f8f;
    border-radius: 50%;
    cursor: pointer;
    transform: translateX(-50%);
    left: 0;
  }
}
</style>
