<template>
  <div class="dv-nodata" style="width:100%;height:100%">
    <div
      class="titles"
      ref="titles"
      v-if="config.title && config.title.show"
      :style="titleStyle"
    >
      <span>{{ config.title.content }}</span>
    </div>
    <div style="width:80px;margin:50px auto;">
      <a-icon type="file-image" style="text-align:center;font-size:80px;" />
    </div>
    <div style="font-size:20px;text-align:center;">
      {{ showTextMap[isEmpty] }}
    </div>
  </div>
</template>

<script>
const showTextMap = {
  noData: '当前图表使用的数据已被删除，无法正常显示。请重新选择模型', // 数据返回isChanged(模型被删)
  dataError: '当前图表使用数据有误，无法正常显示，请重新拖入数据' // 数据存在null
}
export default {
  name: 'ChartNodata',
  props: {
    isEmpty: {
      required: false,
      default: 'noData'
    },
    config: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showTextMap
    }
  },
  created() {},
  mounted() {},
  methods: {},
  computed: {
    titleStyle() {
      return {
        padding: '0 10px',
        color: this.config.title.textStyle.color,
        fontSize: this.config.title.textStyle.fontSize + 'px',
        textAlign: this.config.title.textAlign,
        fontFamily: this.config.title.textStyle.fontFamily,
        fontWeight: this.config.title.textStyle.fontWeight,
        background: 'none',
        border: 'none',
        ...this.background
      }
    }
  }
}
</script>
