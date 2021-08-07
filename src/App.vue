<template>
  <div id="app">
     <a-config-provider :locale="zhCN">
      <router-view v-if="isRouterAlive"/>
     </a-config-provider>
  </div>
</template>
<script>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')
  export default {
    name: 'App',
    data() {
      return {
        zhCN,
        isRouterAlive: true
      }
    },
    provide() {
      return {
        reload: this.reload
      }
    },
    methods: {
      reload() {
        this.isRouterAlive = false
        this.$nextTick(() => {
          this.isRouterAlive = true
        })
      }
    }
  }
</script>
