<template>
  <a-spin class="main-box" :spinning="spinning">
    <div class="tab scrollbar">
      <header>
        <div class="permission-info">
          <div>权限名称：<span></span></div>
          <div class="line">权限描述：</div>
        </div>
        <a-button class="main-button" type="primary" @click="edit">编辑数据权限</a-button>
      </header>
      <div class="title">数据权限</div>
      <div class="content scrollbar">
        <PermissionTable :type="editType" mode="show" />
      </div>
    </div>
  </a-spin>
</template>

<script>
import { mapState } from 'vuex'
import PermissionTable from '../tab-content/permission-table'

export default {
  name: 'permContent',
  data() {
    return {
      spinning: false,
      detailInfo: {}
    }
  },
  components: {
    PermissionTable
  },
  computed: {
    ...mapState({
      permissionId: state => state.projectPermissions.permissionId,
      editType: state => state.projectPermissions.editType,
      formInfo: state => state.projectPermissions.permissionInfo
    })
  },
  created() {
    if (this.permissionId) {
      this.handleGetPermissionInfo()
    }
  },
  methods: {
    edit() {
      // 切换至编辑模式
      this.$router.push({
        path: '/projectCenter/permissions/edit/id=' + this.permissionId,
        query: {
          type: this.editType
        }
      })
    },
    async handleGetPermissionInfo() {

    }
  }
}
</script>

<style scoped>
.tab .content {
  height: calc(100% - 122px) !important;
}
</style>
