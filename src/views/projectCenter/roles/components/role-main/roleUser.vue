<template>
  <div class="role-layout">
    <div class="role-list-controller">
      <a-form-model layout="inline" :model="roleForm" ref="roleForm">
        <!-- <a-form-model-item label="用户名" prop="username">
          <a-input v-model="roleForm.username" class="form-item"></a-input>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="handleGetData" :disabled="loading"
            >查询</a-button
          >
        </a-form-model-item> -->
      </a-form-model>
      <a-button class="btn-add" type="primary" @click="handleShowModal"
        >添加</a-button
      >
    </div>
    <a-table
      class="role-list-table scrollbar"
      row-key="id"
      :columns="tableColumn"
      :data-source="tableData"
      :loading="loading"
    >
      <template #config="text, record, index">
        <a-popconfirm
          title="是否确定移除？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleDeleteUser(record, index)"
        >
          <a href="#">移除</a>
        </a-popconfirm>
      </template>
    </a-table>
    <a-modal
      title="添加用户"
      v-model="visible"
      :confirmLoading="confirmLoading"
      @ok="handleModalSubmit"
      @cancel="handleModalCancel"
    >
      <a-form-model
        ref="modalForm"
        :model="modalForm"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="用户名" prop="users">
          <a-select
            mode="multiple"
            v-model="modalForm.users"
            :filter-option="false"
            :not-found-content="fetching ? undefined : null"
            style="width: 100%"
            placeholder="请输入用户名进行查询"
            @search="handleInputRole"
          >
            <a-spin v-if="fetching" slot="notFoundContent" size="small" />
            <a-select-option v-for="item in userList" :key="item.id">
              {{ item.username }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'

const tableColumn = [
  {
    title: '用户名',
    dataIndex: 'username'
  },
  {
    title: '姓名',
    dataIndex: 'name'
  },
  {
    title: '创建时间',
    dataIndex: 'gmtCreate',
    width: 200,
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'config',
    scopedSlots: { customRender: 'config' }
  }
]
export default {
  name: 'roleUser',
  data() {
    return {
      tableColumn,
      tableData: [],
      userList: [],
      fetching: false,
      roleForm: {
        username: ''
      },
      modalForm: {
        users: []
      },
      rules: {
        users: [{ required: true, message: '请选择用户名' }]
      },
      loading: false,
      visible: false,
      confirmLoading: false
    }
  },
  mounted() {
    this.handleGetData()
  },
  computed: {
    ...mapState({
      roleId: state => state.projectRoles.roleId
    })
  },
  methods: {
    async handleGetData() {
      this.loading = true
      const res = await this.$server.projectCenter.getRoleUserInfo(this.roleId)
      if (res.code === 200) {
        this.tableData = res.rows
        this.loading = false
      } else {
        this.$message.error(res.msg)
      }
    },
    handleShowModal() {
      // this.confirmLoading = true
      this.visible = true
    },
    /** 模态窗口确定 */
    handleModalSubmit() {
      this.confirmLoading = true
      this.visible = false
      this.$server.projectCenter
        .addRoleUser({
          userIds: this.modalForm.users,
          roleId: this.roleId
        })
        .then(res => {
          if (res.code === 200) {
            this.$message.success('添加成功')
            this.handleGetData()
          }
        })
        .finally(() => {
          this.confirmLoading = false
          this.handleModalCancel()
        })
    },
    /** 模态窗口取消 */
    handleModalCancel() {
      this.modalForm = this.$options.data().modalForm
      this.$refs.modalForm.resetFields()
    },
    async handleDeleteUser({ id }, index) {
      const res = await this.$server.projectCenter.deleRoleUser(id)
      if (res.code === 200) {
        this.$message.success('移除成功')
        this.handleGetData()
      } else {
        this.$message.error(res.msg || '请求错误')
      }
    },
    handleInputRole: debounce(async function(value) {
      this.fetching = true
      const res = await this.$server.projectCenter
        .getModalUserList({ keyword: value })
        .finally(() => {
          this.fetching = false
        })
      if (res.code === 200) {
        this.userList = res.rows
      } else {
        this.$message.error(res.msg || '请求错误')
      }
    }, 400)
  }
}
</script>
<style lang="less" scoped>
@import '../../../main.less';
</style>
