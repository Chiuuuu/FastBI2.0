<template>
  <div class="user-layout">
    <div class="role-list-controller">
      <a-form-model layout="inline" :model="userMangeForm" ref="userMangeForm">
        <a-form-model-item label="用户名" prop="username">
          <a-input
            v-model="userMangeForm.username"
            class="form-item"
            placeholder="请输入用户名"
          ></a-input>
        </a-form-model-item>
        <a-form-model-item label="姓名" prop="name">
          <a-input
            v-model="userMangeForm.name"
            class="form-item"
            placeholder="请输入姓名"
          ></a-input>
        </a-form-model-item>
        <a-form-model-item label="用户角色" prop="roleId">
          <a-select
            :disabled="roleLoading"
            show-search
            v-model="userMangeForm.roleId"
            class="form-item"
            placeholder="请选择角色"
            :filter-option="filterOption"
          >
            <a-select-option
              v-for="item in roleList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item>
          <a-button
            type="primary"
            @click="() => handleGetTableList()"
            :disabled="loading"
            >查询</a-button
          >
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="default" @click="handleRestForm" :disabled="loading"
            >重置</a-button
          >
        </a-form-model-item>
      </a-form-model>
      <a-button
        class="btn-add"
        type="primary"
        ghost
        @click="handleShowModal('add')"
        :disabled="loading"
        >添加</a-button
      >
    </div>
    <div class="role-list-table scrollbar">
      <a-table
        row-key="id"
        :columns="usersColumn"
        :data-source="usersData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ y: 'calc(100vh - 350px)', x: 770 }"
        @change="handleTableChange"
      >
        <template #config="text, record, index">
          <a @click="handleEditUser(record, index)" style="margin-right: 20px"
            >编辑</a
          >
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
    </div>
    <a-modal
      v-model="visible"
      :maskClosable="false"
      :title="modalType === 'add' ? '添加用户' : '编辑用户'"
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
        <a-form-model-item label="用户名" prop="userIds">
          <a-select
            mode="multiple"
            :disabled="modalType !== 'add'"
            v-model="modalForm.userIds"
            :filter-option="false"
            :not-found-content="fetching ? undefined : null"
            style="width: 100%"
            placeholder="请输入用户名/姓名"
            @search="handleGetModalUserList"
          >
            <a-spin v-if="fetching" slot="notFoundContent" size="small" />
            <a-select-option v-for="item in modalUserList" :key="item.id">
              {{ item.username }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="用户角色" prop="roleIds">
          <a-select
            show-search
            mode="multiple"
            v-model="modalForm.roleIds"
            style="width: 100%"
            placeholder="请选择用户角色"
            :filter-option="filterOption"
          >
            <a-select-option
              v-for="item in roleList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import debounce from 'lodash/debounce'
import { trimFormData } from '@/utils/form-utils'
import omit from 'lodash/omit'
const usersColumn = [
  {
    title: '用户名',
    width: 150,
    ellipsis: true,
    dataIndex: 'username'
  },
  {
    title: '姓名',
    width: 100,
    ellipsis: true,
    dataIndex: 'name'
  },
  {
    title: '电话',
    width: 120,
    ellipsis: true,
    dataIndex: 'phone'
  },
  {
    title: '用户角色',
    dataIndex: 'roleName'
  },
  {
    title: '添加时间',
    dataIndex: 'gmtCreate',
    width: 200,
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'config',
    fixed: 'right',
    width: 120,
    scopedSlots: { customRender: 'config' }
  }
]

export default {
  name: 'userManage',
  data() {
    return {
      usersData: [], // 用户列表数据
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      roleList: [], // 角色列表数据
      usersColumn, // 表单配置
      userMangeForm: {
        // 搜索表单
        username: '',
        name: '',
        roleId: undefined
      },
      modalType: 'add', // 模态窗口的类型，添加(add)/编辑(edit)
      loading: false,
      roleLoading: false,
      visible: false, // 模态窗口的显示
      confirmLoading: false, // 模态窗口确定按钮 loading
      fetching: false,
      modalUserList: [],
      modalRoleList: [],
      modalForm: {
        userIds: [],
        roleIds: []
      },
      rules: {
        userIds: [
          { required: true, message: '请输入用户名/姓名查询,可选择多个' }
        ],
        roleIds: [{ required: true, message: '请选择一个或多个角色' }]
      }
    }
  },
  mounted() {
    this.handleGetData()
  },
  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handleTableChange(pagination) {
      this.handleGetTableList(pagination)
    },
    /** 获取数据 */
    handleGetData() {
      this.handleGetRoleList()
      this.handleGetTableList()
    },
    /** 获取角色列表数据 */
    async handleGetRoleList() {
      this.roleLoading = true
      const result = await this.$server.projectCenter
        .getRoleList()
        .finally(() => {
          this.roleLoading = false
        })
      if (result.code === 200) {
        this.roleList = result.rows
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    /** 获取用户列表数据 */
    async handleGetTableList(pagination) {
      this.loading = true
      const params = Object.assign({}, trimFormData(this.userMangeForm), {
        ...omit(this.pagination, 'total'),
        current: pagination
          ? pagination.current
          : this.$options.data().pagination.current
      })
      const result = await this.$server.projectCenter
        .getList(params)
        .finally(() => {
          this.loading = false
        })

      if (result.code === 200) {
        this.usersData = [].concat(result.rows)
        Object.assign(this.pagination, {
          current: params.current,
          total: result.total
        })
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    /** 重置表单 */
    handleRestForm() {
      this.$refs.userMangeForm.resetFields()
      this.$nextTick(() => {
        this.handleGetData()
      })
    },
    handleShowModal(type, data) {
      this.confirmLoading = false
      this.visible = true
      this.modalType = type

      this.$nextTick(() => {
        if (type === 'add') {
          this.modalForm = this.$options.data().modalForm
        } else {
          this.modalForm = Object.assign({}, data)
        }
      })
    },
    handleGetModalUserList: debounce(async function(value) {
      this.fetching = true
      const result = await this.$server.projectCenter
        .getModalUserList({
          keyword: value
        })
        .finally(() => {
          this.fetching = false
        })

      if (result.code === 200) {
        this.modalUserList = result.rows
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    }, 400),
    /** 模态窗口确定 */
    handleModalSubmit() {
      this.$refs.modalForm.validate(async valid => {
        if (valid) {
          let result
          this.confirmLoading = true
          if (this.modalType === 'add') {
            // 新增保存
            result = await this.$server.projectCenter
              .addUser(this.modalForm)
              .finally(() => {
                this.confirmLoading = false
              })
          } else if (this.modalType === 'edit') {
            // 编辑保存
            const params = {
              roleList: this.modalForm.roleIds,
              userId: this.modalForm.userIds.pop()
            }
            result = await this.$server.projectCenter
              .putUser(params)
              .finally(() => {
                this.confirmLoading = false
              })
          }
          if (result.code === 200) {
            let message
            if (this.modalType === 'add') {
              message = '添加成功'
              if (result.data && result.data.length > 0) {
                if (result.data && result.data.length === this.modalForm.userIds.length) {
                  return this.$message.error('所选用户已添加, 无法重复添加')
                }
                message += `\n其中${result.data.toString()}用户已添加, 无法重复添加`
              }
            } else if (this.modalType === 'edit') {
              message = '编辑成功'
            }
            this.$message
              .success(this.modalType === 'add' ? '添加成功' : '编辑成功', 1)
              .then(() => {
                this.handleGetTableList()
              })
            this.visible = false
            this.handleModalCancel()
          } else {
            this.$message.error(result.msg || '请求错误')
          }
        } else {
          return false
        }
      })
    },
    /** 模态窗口取消 */
    handleModalCancel() {
      this.modalUserList = []
      this.$refs.modalForm.resetFields()
    },
    /** 编辑操作 */
    handleEditUser({ id }, index) {
      const item = this.usersData[index]
      this.modalUserList.push({
        id: item.id,
        username: item.username
      })
      this.handleShowModal('edit', {
        roleIds: item.roleIds,
        userIds: [item.id]
      })
    },
    /** 移除操作 */
    async handleDeleteUser({ id }, index) {
      const result = await this.$server.projectCenter.deleUserById(id)
      if (result.code === 200) {
        this.$message.success('移除成功')
        this.usersData.splice(index, 1)
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../../main.less";
</style>
