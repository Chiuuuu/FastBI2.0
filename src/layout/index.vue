<template>
  <div class="layout">
    <Sidebar></Sidebar>
    <AppMain></AppMain>
  </div>
</template>
<script>
import AppMain from './modules/appMain/appMain'
import Sidebar from './modules/sidebar/sidebar'
export default {
  components: {
    Sidebar,
    AppMain
  }
}
</script>
<style lang="stylus" scoped>
.layout {
  height: 100%;
}
</style>
