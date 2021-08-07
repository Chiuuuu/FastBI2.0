<template>
  <div class="dv-steep-bar" ref="wrap" :style="backgroundStyle">
    <div
      class="titles"
      ref="titles"
      v-if="config.title && config.title.show"
      :style="titleStyle"
    >
      <span>{{ config.title.content }}</span>
    </div>
    <div class="bar-body" :style="{ height: bodyHeight }">
      <!--底部条-->
      <div class="background-bar" :style="barStyle">
        <!--数值条-->
        <div class="value-bar" :style="contentStyle"></div>
      </div>
      <span
        v-show="percentNum && config.common.isShowValue"
        :style="valueStyle"
        >{{ percentNum }}</span
      >
    </div>
  </div>
</template>

<script>
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'

export default {
  name: 'SteepBar',
  props: {
    config: {
      type: Object,
      required: true
    },
    background: {
      type: Object,
      required: true
    },
    apiData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      width: '400px',
      height: '200px',
      chartData: {
        columns: ['x', 'y'],
        rows: [{ x: 'x', y: 100 }]
      },
      contentStyle: {},
      backgroundStyle: {},
      bodyHeight: 0, // 进度条框高度
      value: 0
    }
  },
  watch: {
    apiData: {
      handler(val) {
        if (val) {
          this.value = 0
          if (val.source) {
            // 获取显示值
            this.value = val.source.rows[0].value
            this.contentStyle.width = this.percentNum || '100%'
          }
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        if (val) {
          let backgroundColor = ''
          switch (val.valueBar.backgroundType) {
            case '1':
              backgroundColor = val.valueBar.background
              break
            case '2':
              backgroundColor = `linear-gradient(to right,${
                val.valueBar.lineColor[0]
              },${val.valueBar.lineColor[1]})`
              break
            case '3':
              backgroundColor = `radial-gradient(${
                val.valueBar.radialColor[0]
              },${val.valueBar.radialColor[1]})`
              break
          }
          this.contentStyle = {
            width: this.percentNum || '100%',
            height: this.config.common.height + 'px',
            background: backgroundColor,
            borderRadius: this.config.valueBar.borderRadius + 'px'
          }
        }
      },
      deep: true,
      immediate: true
    },
    background: {
      handler(val) {
        if (val) {
          this.backgroundStyle = {
            background:
              val.backgroundType === '1'
                ? val.backgroundColor
                : `url(${val.backgroundSrc})`,
            //  backgroundColor: val.backgroundColor,
            borderColor: val.borderColor,
            borderWidth: val.borderWidth + 'px',
            borderStyle: val.borderStyle,
            borderRadius: val.borderRadius + 'px'
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 计算百分比
    percentNum() {
      if (!this.value) {
        return 0
      }
      let precent = (this.value / this.config.common.targetValue) * 100
      return precent.toFixed(2) + '%'
    },
    barStyle() {
      return {
        height: this.config.common.height + 'px',
        background: this.config.buttonBar.background,
        borderRadius: this.config.buttonBar.borderRadius + 'px'
      }
    },
    titleStyle() {
      return {
        padding: '0 10px',
        color: this.config.title.textStyle.color,
        fontSize: this.config.title.textStyle.fontSize + 'px',
        textAlign: this.config.title.textAlign,
        fontFamily: this.config.title.textStyle.fontFamily,
        fontWeight: this.config.title.textStyle.fontWeight
      }
    },
    valueStyle() {
      return {
        marginLeft: '10px',
        color: this.config.common.textStyle.color,
        fontSize: this.config.common.textStyle.fontSize + 'px'
      }
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
      if (this.$refs.titles) {
        this.bodyHeight =
          wrap.clientHeight - this.$refs.titles.clientHeight + 'px'
      } else {
        this.bodyHeight = wrap.clientHeight
      }
    }
  }
}
</script>
<style lang="less" scoped>
.dv-steep-bar {
  width: 100%;
  height: 100%;
  .bar-body {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    .background-bar {
      position: relative;
      width: 100%;
      overflow: hidden;
      .value-bar {
        position: absolute;
        left: 0;
        right: 0;
      }
    }
  }
}
</style>
