<template>
  <a-spin :spinning="$store.state.common.globalSpinning" :tip="$store.state.common.globalSpinTip" class="layout">
    <Sidebar></Sidebar>
    <AppMain></AppMain>
  </a-spin>
</template>
<script>
import AppMain from './modules/appMain/appMain';
import Sidebar from './modules/sidebar/sidebar';
export default {
  components: {
    Sidebar,
    AppMain,
  },
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';
.layout {
  height: 100%;

  /* 重置全局loading样式 */
  @{deep} .ant-spin {
    z-index: 3000;
    max-height: none;
  }
}
</style>
