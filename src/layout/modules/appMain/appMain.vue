<template>
  <div :style="appMainStyle" class="app-main">
    <Navbar></Navbar>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import Navbar from '../navbar/navbar'
export default {
  components: {
    Navbar
  },
  data() {
    return {
      appMainStyle: {
        paddingLeft: ''
      }
    }
  },
  created() {
    if (this.sidebarUnfold === true) {
      this.appMainStyle = {
        paddingLeft: '80px'
      }
    } else {
      this.appMainStyle = {
        paddingLeft: '220px'
      }
    }
  },
  watch: {
    sidebarUnfold() {
      if (this.sidebarUnfold === true) {
        this.appMainStyle = {
          paddingLeft: '80px'
        }
      } else {
        this.appMainStyle = {
          paddingLeft: '220px'
        }
      }
    }
  },
  computed: {
    // 侧边栏展开收起
    sidebarUnfold() {
      console.log(this.$store.state)
      return this.$store.state.common.sidebarUnfold
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "./appMain.styl";
</style>
