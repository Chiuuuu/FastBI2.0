<template>
  <a-row :gutter="16" class="screen-manage">
    <a-col class="gutter-row screen-manage" :span="24">
      <div class="main">
        <div class="right">
          <a-tabs class="tabs" @change="handleChangeModule">
            <a-tab-pane key="user" tab="用户管理">
              <user-manage ref="userManage"></user-manage>
            </a-tab-pane>
            <!-- <a-tab-pane key="role" tab="用户属性">
              <role-manage ref="roleManage"></role-manage>
            </a-tab-pane> -->
          </a-tabs>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import UserManage from './components/user'
// import RoleManage from './components/role'

export default {
  name: 'users',
  components: {
    UserManage
    // RoleManage
  },
  methods: {
    handleChangeModule(key) {
      const tab = this.$refs[`${key}Manage`]
      if (tab) {
        tab.handleGetData()
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "../main.less";
</style>
