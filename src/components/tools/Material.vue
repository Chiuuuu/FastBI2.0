<template>
  <div class="dv-material" style="width: 100%;height:100%;" ref="wrap">
    <img style="width: 100%;height:100%;" :src="url | imgUrlFilter" alt="" />
  </div>
</template>

<script>
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'
import { formatData, convertData } from '../../utils/formatData'

export default {
  name: 'ChartsMaterial',
  props: {
    url: {
      type: String,
      required: true
    }
  },
  filters: {
    // thumbnail表示缩略图，控件内去掉thumbnail显示原图
    imgUrlFilter(url) {
      let imgUrl = url.replace(/\/thumbnail/g, '')
      return imgUrl
    }
  },
  data() {
    return {
      width: '500px',
      height: '400px'
    }
  },
  mounted() {
    this._calcStyle()
    addResizeListener(this.$refs.wrap, this._calcStyle)
  },
  beforeDestroy() {
    removeResizeListener(this.$refs.wrap, this._calcStyle)
  },
  methods: {
    afterConfig(options) {
      return options
    },
    _calcStyle() {
      const wrap = this.$refs.wrap
      if (!wrap) return
      let width = wrap.clientWidth
      let height = wrap.clientHeight
      this.width = width + 'px'
      this.height = height + 'px'
    }
  }
}
</script>
