<template>
  <div class="dv-images" style="width: 100%;height:100%;" :style="backgroundStyle" ref="wrap">
    <img v-if="config.imageUrl || background.backgroundSrc" :src="config.imageUrl || background.backgroundSrc" alt="">
    <a-icon v-else type="file-image" style="font-size:40px;" />
  </div>
</template>

<script>
  import { addResizeListener, removeResizeListener } from 'bin-ui/src/utils/resize-event'
  import { formatData, convertData } from '../../utils/formatData'

  export default {
    name: 'ChartsImage',
    props: {
      config: {
        type: Object,
        required: true
      },
      background: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        width: '500px',
        height: '400px',
        chartData: {
          columns: ['x', 'y'],
          rows: [{ x: 'x', y: 100 }]
        },
        tooltipVisible: true,
        legendVisible: true,
        // chart扩展配置项
        chartExtend: {},
        chartOptions: {},
        chartSettings: {},
        colors: [],
        backgroundStyle: {}
      }
    },
    watch: {
      config: {
        handler (val) {
          if (val) {
          }
        },
        deep: true,
        immediate: true
      },
      background: {
        handler (val) {
          console.log(val)
          if (val) {
           this.backgroundStyle = {
             backgroundColor: val.backgroundColor,
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
    mounted () {
      this._calcStyle()
      addResizeListener(this.$refs.wrap, this._calcStyle)
    },
    beforeDestroy () {
      removeResizeListener(this.$refs.wrap, this._calcStyle)
    },
    methods: {
      afterConfig (options) {
        if (this.typeName === 've-map') {
          let data = [...options.series[0].data]
          options.series[0].data = convertData(data)
        }
        return options
      },
      _calcStyle () {
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
