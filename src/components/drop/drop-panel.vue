<template>
  <!--这里默认组织画布的右键点击事件 后期加在拖拽区块上-->
  <div
    class="drop-panel"
    @drop.stop.prevent="handleDropOnCanvas($event)"
    @dragover.stop.prevent
  >
    <slot> </slot>
    <map-type-view
      :visible="visible"
      @ok="handleOk"
      @close="visible = false"
    ></map-type-view>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex' // 导入vuex
import MapTypeView from '../drag/components/map-type-view.vue'

export default {
  name: 'DropPanel',
  data() {
    return {
      visible: false,
      com: {}
    }
  },
  computed: {
    ...mapGetters(['canvasMap', 'pageSettings', 'screenId'])
  },
  components: { MapTypeView },
  methods: {
    ...mapActions(['addChartData']),
    // 元素drop
    handleDropOnCanvas: function(event) {
      // 获取节点数据
      let nodeInfo = JSON.parse(event.dataTransfer.getData('node'))
      nodeInfo = {
        tabId: this.$route.query.tabId,
        ...nodeInfo
      }

      console.log(nodeInfo)
      // 获取drop事件
      // let offsetX = event.offsetX
      // let offsetY = event.offsetY
      // let style = {
      //   position: 'absolute',
      //   left: offsetX + 'px',
      //   top: offsetY + 'px'
      // }
      if (nodeInfo.setting.chartType === 'v-map') {
        this.com = nodeInfo
        this.visible = true
        return
      }
      this.addChartData(nodeInfo)
    },
    handleOk() {
      this.visible = false
      this.addChartData(this.com)
    }
  }
}
</script>

<style lang="stylus" scoped>
.drop-panel{
}
</style>
