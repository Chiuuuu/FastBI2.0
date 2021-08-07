<template>
  <div class="main">
    <a-empty v-if="menuSelectId === -1" class="main-empty">
      <span slot="description">请新建角色或者选中左侧角色</span>
    </a-empty>
    <template v-else>
      <div class="right">
        <div class="role-layout">
          <a-tabs v-model="activeTab" class="tabs" @change="handleChangeModule">
            <a-tab-pane key="permission" tab="权限设置">
              <role-permission ref='permissionManage'></role-permission>
            </a-tab-pane>
            <a-tab-pane key="user" tab="角色用户">
              <role-user ref="userManage"></role-user>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RolePermission from './rolePermission'
import RoleUser from './roleUser'

export default {
  name: 'roleMain',
  components: {
    RolePermission,
    RoleUser
  },
  data() {
    return {
      activeTab: 'permission'
    }
  },
  computed: {
    ...mapState({
      roleId: state => state.projectRoles.roleId,
      formInfo: state => state.projectRoles.roleInfo,
      menuSelectId: state => state.common.menuSelectId
    })
  },
  methods: {
    handleChangeModule(key) {
      const tab = this.$refs[`${key}Manage`]
      if (tab) {
        tab.handleGetData && tab.handleGetData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../main.less";
</style>
