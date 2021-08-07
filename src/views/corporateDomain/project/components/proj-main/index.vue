<template>
  <div class="main">
    <div class="right" style="padding-top:16px">
      <div class="role-list-controller">
        <div class="searchbar">
          <a-form-model layout="inline" :model="searchForm">
            <a-form-model-item label="项目名称" prop="projectName">
              <a-input
                placeholder="请输入项目名称"
                v-model="searchForm.projectName"
                style="width: 200px"
              ></a-input>
            </a-form-model-item>
            <a-form-model-item label="管理员" prop="adminName">
              <a-input
                placeholder="请输入管理员姓名"
                v-model="searchForm.adminName"
                style="width: 200px"
              ></a-input>
            </a-form-model-item>
            <a-form-model-item>
              <a-button
                type="primary"
                @click="() => handleGetListData()"
                :disabled="loading"
                >查询</a-button
              >
            </a-form-model-item>
            <a-form-model-item>
              <a-button
                type="default"
                @click="handleResetForm"
                :disabled="loading"
                >重置</a-button
              >
            </a-form-model-item>
          </a-form-model>
        </div>
        <a-button
          class="btn-add"
          type="primary"
          ghost
          @click="showModal('add')"
          :disabled="loading"
          >添加项目</a-button>
      </div>
      <a-table
        class="role-list-table scrollbar"
        row-key="projectId"
        :columns="listColumn"
        :data-source="listData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1420 }"
        @change="handleTableChange"
      >
        <template #adminName="text, record">
          <span :title="record.adminName">{{ record.adminName }}</span>
        </template>
        <template #config="text, record, index">
          <a-popover placement="left" trigger="click">
            <template slot="content">
              <a-spin :spinning="getUserByProjectLoading" size="small">
                <div
                  v-for="(item, index) in projectUsers"
                  :key="index"
                  :title="item.userName"
                  class="pop-user-list"
                >
                  {{ item.roleName }}: {{ item.userName }}
                </div>
              </a-spin>
            </template>
            <a class="handler-margin" @click="handleCheckUsers(record)"
              >查看项目用户</a
            >
          </a-popover>
          <a class="handler-margin" @click="handleEdit(record)">编辑</a>
          <a-popconfirm
            title="是否确定删除？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(record, index)"
          >
            <a href="#">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </div>
    <a-modal
      v-model="visible"
      :title="modalType === 'add' ? '添加项目' : '编辑项目'"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      @ok="handleModalSubmit"
      @cancel="clearModal"
    >
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="项目名称" prop="projectName">
          <a-input
            v-model="form.projectName"
            style="width: 100%"
            placeholder="请输入项目名称"
          />
        </a-form-model-item>
        <a-form-model-item label="项目描述" prop="projectDesc">
          <a-input
            v-model="form.projectDesc"
            style="width: 100%"
            placeholder="请输入项目描述"
          />
        </a-form-model-item>
        <a-form-model-item label="管理员" prop="adminList">
          <a-button block v-if="adminListLoading" :loading="adminListLoading" />
          <a-select
            v-else
            show-search
            mode="multiple"
            v-model="form.adminList"
            style="width: 100%"
            :filter-option="filterOption"
            placeholder="请选择管理员"
          >
            <a-select-option
              v-for="item in adminList"
              :key="item.id"
              :value="item.id"
              :disabled="item.id === '1'"
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
import omit from 'lodash/omit'
import { trimFormData } from '@/utils/form-utils'
import commonValidateField from '@/utils/validator'
const listColumn = [
  {
    title: '项目名称',
    width: 250,
    ellipsis: true,
    dataIndex: 'projectName'
  },
  {
    title: '管理员',
    dataIndex: 'adminName',
    width: 250,
    ellipsis: true,
    scopedSlots: { customRender: 'adminName' }
  },
  {
    title: '用户数',
    width: 100,
    dataIndex: 'userCount'
  },
  {
    title: '大屏数量',
    width: 100,
    dataIndex: 'screenCount'
  },
  {
    title: '项目描述',
    dataIndex: 'projectDesc',
    width: 300,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 200,
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'config',
    width: 220,
    scopedSlots: { customRender: 'config' }
  }
]

export default {
  name: 'projMain',
  data() {
    return {
      loading: false,
      visible: false,
      modalType: '', // 判断是编辑还是新增
      rowProjectId: '', // 当前编辑的id
      form: {
        // 添加新项目表单
        projectName: '',
        projectDesc: '',
        adminList: ['1']
      },
      rules: {
        projectName: [
          { required: true, message: '请输入项目名称' },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '请输入1-20个字的项目名称'
          }
        ],
        projectDesc: [
          { required: true, message: '请输入项目描述' },
          { type: 'string', max: 200, message: '请输入200字以内的项目描述' },
          commonValidateField.noEmoji({ title: '项目描述' })
        ],
        adminList: [{ required: true, message: '请选择管理员' }]
      },
      confirmLoading: false,
      searchForm: {
        // 搜索表单
        projectName: '',
        adminName: ''
      },
      projectUsers: [],
      getUserByProjectLoading: false,
      listData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      listColumn,
      adminListLoading: false,
      adminList: []
    }
  },
  watch: {
    modalType(newValue) {
      if (newValue === 'add') {
        this.form = this.$options.data().form
      }
    }
  },
  mounted() {
    this.handleGetListData()
  },
  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handleTableChange(pagination) {
      this.handleGetListData(pagination)
    },
    showModal(type) {
      this.visible = true
      this.modalType = type
      this.handleGetAdminList()
    },
    async handleGetAdminList() {
      this.adminListLoading = true
      const result = await this.$server.corporateDomain
        .getAdminList()
        .finally(() => {
          this.adminListLoading = false
        })
      if (result.code === 200) {
        this.adminList = [].concat(result.data)
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    clearModal() {
      this.rowProjectId = ''
      this.form = this.$options.data().form
      this.$refs.form.resetFields()
    },
    handleResetForm() {
      this.searchForm = this.$options.data().searchForm
      this.$nextTick(() => {
        this.handleGetListData()
      })
    },
    handleModalSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.confirmLoading = true
          let result
          if (this.modalType === 'add') {
            // 新增保存
            result = await this.$server.corporateDomain
              .addNewProject(this.form)
              .finally(() => {
                this.confirmLoading = false
              })
          } else if (this.modalType === 'edit') {
            // 编辑保存
            const params = {
              ...this.form,
              projectId: this.rowProjectId
            }
            result = await this.$server.corporateDomain
              .putProject(params)
              .finally(() => {
                this.confirmLoading = false
              })
          }
          if (result.code === 200) {
            this.$message
              .success(this.modalType === 'add' ? '添加成功' : '编辑成功', 1)
              .then(() => {
                this.$store.dispatch('user/reFreshProjectList')
                this.handleGetListData()
                this.visible = false
                this.clearModal()
              })
          } else {
            this.$message.error(result.msg || '请求错误')
          }
        } else {
          return false
        }
      })
    },
    async handleDelete({ projectId }, index) {
      const result = await this.$server.corporateDomain.deleProject(projectId)
      if (result.code === 200) {
        this.listData.splice(index, 1)
        this.$message.success('删除成功', 1)
        this.$store.dispatch('user/reFreshProjectList')
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    async handleEdit({ projectId }) {
      this.rowProjectId = projectId
      const result = await this.$server.corporateDomain.getProjectInfoById(
        projectId
      )

      if (result.code === 200) {
        const list = result.data.adminList.map(item => item.id)
        this.form = Object.assign(this.form, {
          ...result.data,
          adminList: list
        })
        this.showModal('edit')
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    async handleCheckUsers({ projectId }) {
      this.getUserByProjectLoading = true
      const result = await this.$server.corporateDomain
        .getUserByProject(projectId)
        .finally(() => {
          this.getUserByProjectLoading = false
        })
      if (result.code === 200) {
        this.projectUsers = [].concat(result.data)
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    async handleGetListData(pagination) {
      this.loading = true

      const params = Object.assign({}, trimFormData(this.searchForm), {
        ...omit(this.pagination, 'total'),
        current: pagination
          ? pagination.current
          : this.$options.data().pagination.current
      })

      const result = await this.$server.corporateDomain
        .getProjectList(params)
        .finally(() => {
          this.loading = false
        })
      if (result.code === 200) {
        this.listData = [].concat(result.rows)

        Object.assign(this.pagination, {
          current: params.current,
          total: result.total
        })
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../main.less";
.pop-user-list {
  margin: 10px 0;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
