<template>
  <div class="main">
    <a-spin class="main-box" :spinning="spinning">
      <div class="right edit">
        <div class="tab scrollbar">
          <header>
            <span>编辑{{ type === 'row' ? '行' : '列' }}级权限</span>
            <div>
              <a-button class="main-button" type="primary" @click="handleSave">保 存</a-button>
              <a-button class="main-button" @click="back">退 出</a-button>
            </div>
          </header>
          <a-form-model class="role-form" ref="form" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
            <a-form-model-item label="角色名称" prop="name">
              <a-input v-model="form.name"></a-input>
            </a-form-model-item>
            <a-form-model-item label="角色描述" prop="description">
              <a-input v-model="form.description"></a-input>
            </a-form-model-item>
          </a-form-model>
          <div class="title">数据权限</div>
          <div class="content scrollbar">
            <PermissionTable :type="type" mode="edit" />
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PermissionTable from '../tab-content/permission-table'

export default {
  name: 'permEditCol',
  components: {
    PermissionTable
  },
  data() {
    return {
      spinning: false,
      type: this.$route.query.type,
      detailInfo: {},
      form: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入权限名称'
          },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '请输入1-20个字的权限名称'
          }
        ],
        description: [
          {
            type: 'string',
            max: 200,
            min: 1,
            message: '请输入200字以内的权限描述'
          }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      permissionId: state => state.projectPermissions.permissionId,
      formInfo: state => state.projectPermissions.permissionInfo
    })
  },
  mounted() {
    this.handleGetPermissionInfo()
    this.$store.commit('projectPermissions/SET_PERMISSIONID', this.$route.params.id)
  },
  methods: {
    async handleGetPermissionInfo() {
      this.spinning = true
      this.spinning = false
    },
    back() {
      // 切换回查看模式
      this.$store.commit('projectPermissions/SET_EDITTYPE', this.$route.query.type)
      this.$router.go(-1)
    },
    handleSave() {
      this.$refs.form.validate((ok, obj) => {
        if (ok) {
          this.$message.success('保存成功')
          this.$store.commit('projectPermissions/SET_PERMISSIONID', 'id')
          this.back()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../main";
.main .edit.right .content {
  height: calc(100% - 186px);
  @{deep} .ant-form-item-label {
      width: 100px !important;
      padding-left: 16px;
      label {
          color: rgba(0, 0, 0, 0.65);
      }
  }
}
</style>
