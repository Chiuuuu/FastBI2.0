<template>
  <div class="dv-amap" style="width: 100%;height:100%;" ref="aMap">
    <div id="map" style="width: 100%;height:100%;"></div>
  </div>
</template>
<script>
export default {
  name: 'amap',
  components: {},
  data() {
    return {
      map: null
    }
  },
  mounted() {
    this.$nextTick(this.drawMap)
  },
  methods: {
    drawMap() {
      this.map = new AMap.Map('map', {
        zoom: 11, //级别
        center: [116.397428, 39.90923], //中心点坐标
        viewMode: '3D' //使用3D视图
      })
    }
  }
}
</script>
