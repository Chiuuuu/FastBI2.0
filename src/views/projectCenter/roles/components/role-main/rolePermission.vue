<template>
  <div class="tab scrollbar">
    <header>
      <div class="role-info">
        <div>角色名称：<span>{{ roleInfo.name }}</span></div>
        <div class="line">角色描述：<span :title="roleInfo.description">{{ roleInfo.description }}</span></div>
      </div>
      <a-button class="main-button" type="primary" @click="edit"
        >编辑角色</a-button
      >
    </header>
    <RoleTabeRole status="show"></RoleTabeRole>
    <!-- <RolesTabDataPermission status="show"></RolesTabDataPermission> -->
  </div>
</template>
<script>
import { mapState } from 'vuex'
// import RolesTabDataPermission from '../tab-content/rolesTabDataPermission'
import RoleTabeRole from '../tab-content/rolesTabRole'

export default {
    name: 'rolePermission',
    components: {
      // RolesTabDataPermission,
      RoleTabeRole
    },
    computed: {
      ...mapState({
        roleId: state => state.projectRoles.roleId,
        roleInfo: state => state.projectRoles.roleInfo
      })
    },
    methods: {
      edit() {
        // 切换至编辑模式
        this.$router.push({
            path: '/projectCenter/roles/edit/id=' + this.roleId
        })
      }
    }
}
</script>
