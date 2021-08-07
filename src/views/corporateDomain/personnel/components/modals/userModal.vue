<template>
  <a-modal
    :bodyStyle="bodyStyle"
    :title="modalType === 'edit' ? '编辑用户' : '新建用户'"
    :visible="show"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleModalCancel">
    <a-spin :spinning="spinning">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item label="用户名" prop="username">
          <a-input
            v-model="form.username"
            style="width: 100%"
            placeholder="请输入用户名"
            :disabled="modalType === 'edit'"
          >
          </a-input>
        </a-form-model-item>
        <a-form-model-item label="密码" prop="password">
          <a-input-password
            v-model="form.password"
            style="width: 100%"
            placeholder="请输入密码"
            :disabled="!editPsw"
          >
          </a-input-password>
        </a-form-model-item>
        <a-form-model-item label="确认密码" prop="expassword">
          <a-input-password
            v-model="form.expassword"
            style="width: 100%"
            placeholder="请输入确认密码"
            :disabled="!editPsw"
          >
          </a-input-password>
        </a-form-model-item>
        <a-form-model-item label="姓名" prop="name">
          <a-input
            v-model="form.name"
            style="width: 100%"
            placeholder="请输入姓名"
          >
          </a-input>
        </a-form-model-item>
        <a-form-model-item label="手机号码" prop="phone">
          <a-input
            v-model="form.phone"
            style="width: 100%"
            placeholder="请输入手机号码"
          >
          </a-input>
        </a-form-model-item>
        <a-form-model-item label="所属项目" prop="projects">
          <a-select
            mode="multiple"
            v-model="form.projects"
            style="width: 100%"
            :filter-option="false"
            :not-found-content="searching ? undefined : null"
            placeholder="请选择所属项目"
            @search="searchProject"
          >
            <a-select-option v-for="item in projectList" :key="item.projectId" :value="item.projectId">
              {{ item.projectName }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="部门" prop="department">
          <a-select
            v-model="form.department"
            style="width: 100%"
            placeholder="请选择部门"
            @change="getPostList"
          >
            <a-select-option v-for="item in deptList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="岗位" prop="post">
          <a-select
            v-model="form.post"
            style="width: 100%"
            placeholder="请选择岗位"
          >
            <a-select-option v-for="item in postList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
    <template v-if="modalType === 'edit'" #footer>
      <a-button key="back" @click="handleModalCancel">取消</a-button>
      <a-button type="primary" ghost :loading="confirmLoading" @click="handleResetPsw">重置密码</a-button>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">确认</a-button>
    </template>
  </a-modal>
</template>

<script>
import debounce from 'lodash/debounce'
import commonValidateField from '@/utils/validator'
export default {
  name: 'personnelUserModal',
  props: {
    deptList: Array,
    modalType: String,
    modalData: Object,
    show: Boolean
  },
  watch: {
    show(newValue) {
      if (newValue) {
        // 获取项目列表
        this.getProjectList()
        if (this.modalType === 'edit') {
          this.spinning = true
          this.form.username = this.modalData.username
          this.form.name = this.modalData.name
          this.form.phone = this.modalData.phone
          this.form.password = '123456'
          this.form.expassword = '123456'
          this.form.projects = this.modalData.projects.map(item => item.id)
          // 编辑时禁止编辑密码
          this.editPsw = false
          this.password = this.modalData.password

          if (this.modalData.department) {
            this.getPostList(this.modalData.department.id, () => {
              this.form.department = this.modalData.department.id
              this.form.post = this.modalData.post ? this.modalData.post.id : undefined
              this.spinning = false
            })
          } else {
            this.spinning = false
          }
        } else {
          this.editPsw = true
        }
      } else {
        this.form = this.$options.data().form
        if (this.$refs.form) this.$refs.form.resetFields()
      }
    }
  },
  data() {
    if (typeof this.searchProject === 'function') {
      this.searchProject = debounce(this.searchProject, 500)
    }
    return {
      bodyStyle: { height: 'calc(100vh - 240px)', 'overflow-y': 'auto' },
      searching: false,
      spinning: false,
      confirmLoading: false, // 模态窗口确定按钮 loading
      editPsw: true, // 重置密码状态
      password: '', // 记录用户密码
      form: {
        username: '',
        name: '',
        password: '',
        expassword: '',
        phone: '',
        projects: [],
        department: undefined,
        post: undefined
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' },
          commonValidateField.length({
            title: '用户名',
            min: 2,
            max: 20
          }),
          commonValidateField.noChinese({ title: '用户名' })
        ],
        password: [
          { required: true, message: '请输入密码' },
          // {
          //   pattern: new RegExp('^[0-9]*$'),
          //   message: '只能填数字'
          // },
          {
            type: 'string',
            max: 20,
            min: 6,
            message: '请输入6-20个字符的密码'
          },
          { validator: this.passwordValidate, trigger: 'change' }
        ],
        expassword: [
          { required: true, message: '请输入确认密码' },
          { validator: this.confirmValidate, trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入姓名' },
          commonValidateField.length({
            title: '姓名',
            min: 2,
            max: 10
          }),
          commonValidateField.noSign({ title: '姓名' })
        ],
        phone: [
          { required: true, message: '请输入手机号码' },
          {
            pattern: new RegExp('^[0-9]*$'),
            message: '只能填数字'
          },
          {
            type: 'string',
            len: 11,
            message: '手机号码格式不正确'
          }
        ],
        projects: [{ required: true, message: '请选择所属项目' }],
        department: [{ required: true, message: '请选择部门' }],
        post: [{ required: true, message: '请选择岗位' }]
      },
      projectList: [],
      postList: []
    }
  },
  methods: {
    async getProjectList(projectName) {
      this.searching = true
      const res = await this.$server.corporateDomain.getProjectList({
        projectName: projectName || '',
        adminName: '',
        pageSize: 10,
        current: 1
      })
        .finally(() => {
          this.searching = false
        })
      if (res.code === 200) {
        this.projectList = res.rows
      } else {
        this.projectList = []
        this.$message.error('获取项目列表失败')
      }
    },
    async getPostList(id, callback) {
      if (this.$refs.form) this.$refs.form.clearValidate('post')
      const res = await this.$server.corporateDomain.getPostList(id)
      if (res.code === 200) {
        this.form.post = []
        this.postList = res.data
        if (typeof callback === 'function') {
          this.$nextTick(() => {
            callback()
          })
        }
      } else {
        this.$message.error('获取岗位列表失败')
      }
    },
    searchProject(value) {
      this.getProjectList(value)
    },
    passwordValidate(rule, value, callback) {
      if (/[\u4e00-\u9fa5]/.test(value)) {
        callback(new Error('暂不支持中文密码'))
      } else if (value.length > 20 || value.length < 6) {
        callback(new Error('请输入6~20位密码'))
      } else {
        this.$refs.form.validateField('expassword')
        callback()
      }
    },
    confirmValidate(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error('两次密码不一致，请重新输入确认密码'))
      } else {
        callback()
      }
    },
    handleModalCancel() {
      this.form = this.$options.data().form
      this.$refs.form.resetFields()
      this.confirmLoading = false
      this.$nextTick(() => {
        this.$emit('close')
      })
    },
    handleResetPsw() {
      this.editPsw = true
      this.form.password = ''
      this.form.expassword = ''
    },
    async handleAddUser() {
      const res = await this.$server.corporateDomain.addUser({
        ...this.form,
        isEnable: 1
      })
        .finally(() => {
          this.confirmLoading = false
        })
      if (res.code === 200) {
        this.$message.success('添加用户成功')
        this.$parent.handleGetData()
        this.handleModalCancel()
      } else {
        this.$message.error(res.msg)
      }
    },
    async handleUpdateUser() {
      const params = {
        ...this.form,
        id: this.modalData.id,
        isEnable: this.modalData.enable
      }
      // 若没有编辑过密码, 使用之前存储的密文
      if (!this.editPsw) {
        params.password = this.password
        params.expassword = this.password
      }
      const res = await this.$server.corporateDomain.updateUser(params)
        .finally(() => {
          this.confirmLoading = false
        })
      if (res.code === 200) {
        this.$message.success('修改成功')
        this.$parent.handleGetData()
        this.handleModalCancel()
      } else {
        this.$message.error(res.msg)
      }
    },
    handleOk() {
      this.confirmLoading = true
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.modalType === 'add') {
            this.handleAddUser()
          } else if (this.modalType === 'edit') {
            // 编辑保存
            this.handleUpdateUser()
          }
        } else {
          this.confirmLoading = false
        }
      })
    }
  }
}
</script>

<style>

</style>
