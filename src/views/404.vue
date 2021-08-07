<template>
  <a-result
    status="404"
    title="非常抱歉，您无权限查看该界面/该界面不存在。"
    sub-title=""
  >
    <template #extra>
      <a-button type="primary" @click="handleGoBackHome">
        返回首页
      </a-button>
    </template>
  </a-result>
</template>
<script>
export default {
  name: 'NoFound',
  methods: {
    handleGoBackHome() {
      this.$router.push({
        path: '/'
      })
    }
  }
}
</script>
