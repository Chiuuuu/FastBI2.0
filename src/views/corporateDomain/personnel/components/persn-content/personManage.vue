<template>
  <div class="flex-col">
    <div class="role-list-controller">
      <div class="searchbar">
        <a-form-model layout="inline" :model="personSearch">
          <a-form-model-item label="用户名" prop="username">
            <a-input
              v-model="personSearch.username"
              style="width: 150px"
              placeholder="请输入用户名"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item label="姓名" prop="name">
            <a-input
              v-model="personSearch.name"
              style="width: 150px"
              placeholder="请输入姓名"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item label="部门" prop="department">
            <a-select
              v-model="personSearch.department"
              style="width: 150px"
              placeholder="请选择部门"
              @change="handleGetPostList"
            >
              <a-select-option
                v-for="item in departList"
                :key="item.id"
                :value="item.id"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="岗位" prop="post">
            <a-select
              v-model="personSearch.post"
              style="width: 150px"
              placeholder="请选择岗位"
            >
              <a-select-option
                v-for="item in postList"
                :key="item.id"
                :value="item.id"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </a-form-model-item>
          <a-form-model-item>
            <a-button
              type="primary"
              @click="() => handleGetData()"
              :disabled="loading"
              >查询</a-button
            >
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="default" @click="resetForm" :disabled="loading"
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
        >添加</a-button
      >
    </div>
    <a-table
      class="role-list-table scrollbar"
      row-key="id"
      :columns="personColumn"
      :pagination="pagination"
      :data-source="personData"
      :loading="loading"
      :scroll="{ y: 'calc(100vh - 350px)', x: 1230 }"
      @change="handleTableChange"
    >
      <!-- 部门 -->
      <span slot="deptName"
        >部门 <a-icon class="edit-icon" type="setting" @click="handleSetDepart"
      /></span>
      <!-- 岗位 -->
      <span slot="postName"
        >岗位 <a-icon class="edit-icon" type="setting" @click="handleSetPost"
      /></span>
      <!-- 所属项目 -->
      <template #projects="text">
        <span :title="text ? text.toString() : ''">{{
          text ? text.toString() : ""
        }}</span>
      </template>
      <!-- 是否启用 -->
      <template #enable="text, record"
        ><a-switch
          :checked="record.enable"
          :disabled="record && record.id === adminId"
          @change="handleSwitch($event, record)"
      /></template>
      <!-- 操作 -->
      <template #config="text, record">
        <template v-if="record && record.id !== adminId">
          <a
            class="handler-margin"
            @click="handleEdit(record)"
            style="margin-right: 20px"
            >编辑</a
          >
          <a-popconfirm
            title="是否确定删除？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(record.id)"
          >
            <a href="#">删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- 用户新建及编辑弹窗 -->
    <UserModal
      ref="userModal"
      :show="visible1"
      :dept-list="departList"
      :modal-data="modalData"
      :modal-type="modalType"
      @close="visible1 = false"
    />

    <!-- 部门管理弹窗 -->
    <ModalListManager
      :options="deptOptions"
      @refresh="handleGetDepartList"
      @close="deptOptions.visible = false" />

    <!-- 岗位管理弹窗 -->
    <PostModal
      ref="postModal"
      :visible="visible2"
      :dept-list="departList"
      :modal-data="modalData"
      @close="visible2 = false"
    />

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { trimFormData } from '@/utils/form-utils'
import UserModal from '../modals/userModal'
import PostModal from '../modals/postModal'
import omit from 'lodash/omit'
import ModalListManager from '@/components/modal-list-manager'

const personColumn = [
  {
    title: '用户名',
    width: 150,
    dataIndex: 'username'
  },
  {
    title: '姓名',
    width: 100,
    dataIndex: 'name'
  },
  {
    title: '手机号码',
    width: 120,
    dataIndex: 'phone'
  },
  {
    // 部门
    slots: { title: 'deptName' },
    dataIndex: 'deptName',
    width: 200,
    ellipsis: true,
    key: 'deptName'
  },
  {
    // 岗位
    slots: { title: 'postName' },
    dataIndex: 'postName',
    width: 200,
    ellipsis: true,
    key: 'postName'
  },
  {
    title: '所属项目',
    dataIndex: 'projects',
    scopedSlots: { customRender: 'projects' },
    width: 200,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'enable',
    width: 80,
    scopedSlots: { customRender: 'enable' }
  },
  {
    title: '创建时间',
    dataIndex: 'gmtCreate',
    width: 180,
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'config',
    fixed: 'right',
    width: 110,
    scopedSlots: { customRender: 'config' }
  }
]

export default {
  name: 'personManage',
  components: {
    UserModal,
    PostModal,
    ModalListManager
  },
  data() {
    // 部门管理
    const deptOptions = {
      visible: false,
      title: '部门',
      list: [],
      add: params => this.$server.corporateDomain.addDept(params.name),
      update: params => this.$server.corporateDomain.updateDept(params),
      delete: params => this.$server.corporateDomain.deleDept(params.id)
    }
    return {
      loading: false,
      modalData: {},
      modalType: '',
      visible1: false,
      visible2: false,
      deptOptions,
      personSearch: {
        username: '',
        name: '',
        department: undefined,
        post: undefined
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      personData: [],
      personColumn,
      departList: [],
      postList: []
    }
  },
  computed: {
    ...mapState({
      adminId: state => state.user.info.id
    })
  },
  mounted() {
    this.handleGetData()
    this.handleGetDepartList()
  },
  methods: {
    resetForm(tab) {
      this.personSearch = this.$options.data().personSearch
      this.$nextTick(() => {
        this.handleGetData()
      })
    },
    async handleSwitch(e, record) {
      const res = await this.$server.corporateDomain.actionEnableUser({
        userId: record.id,
        isEnable: +!record.enable
      })
      if (res.code === 200) {
        record.enable = !record.enable
        this.$message.success((!record.enable ? '禁用' : '启用') + '成功')
      } else {
        this.$message.error(res.msg)
      }
    },
    handleSetDepart() {
      this.deptOptions = Object.assign({}, this.deptOptions, {
        visible: true,
        list: this.departList
      })
    },
    handleSetPost() {
      const data = {} // 取当前项目下的部门岗位
      this.modalData = data
      this.visible2 = true
    },
    handleTableChange(pagination) {
      this.handleGetData(pagination)
    },
    async handleGetDepartList() {
      const res = await this.$server.corporateDomain
        .getDeptList()
        .finally(() => {
          this.spinning = false
        })
      if (res.code === 200) {
        this.departList = res.data
        this.deptOptions.list = res.data
      } else {
        this.departList = []
        this.deptOptions.list = []
        this.$message.error('获取部门列表失败')
      }
    },
    async handleGetPostList(id) {
      this.personSearch.post = undefined
      const res = await this.$server.corporateDomain
        .getPostList(id)
        .finally(() => {
          this.spinning = false
        })
      if (res.code === 200) {
        this.postList = res.data
        this.postOptions.list = res.data
      } else {
        this.postList = []
        this.postOptions.list = []
        this.$message.error('获取部门列表失败')
      }
    },
    async handleGetData(pagination) {
      this.loading = true
      const params = Object.assign({}, trimFormData(this.personSearch), {
        ...omit(this.pagination, 'total'),
        current: pagination
          ? pagination.current
          : this.$options.data().pagination.current
      })
      const res = await this.$server.corporateDomain
        .getUserListByParams(params)
        .finally(() => {
          this.loading = false
        })

      if (res.code === 200) {
        this.personData = res.rows
        this.pagination.total = res.total
        this.pagination.current = params.current
      } else {
        this.$message.error(res.msg)
        this.personData = []
      }
    },
    showModal(type) {
      this.visible1 = true
      this.modalType = type || ''
    },
    async handleDelete(id) {
      const res = await this.$server.corporateDomain.deleUser(id)
      if (res.code === 200) {
        this.$message.success('删除成功')
        this.handleGetData()
      } else {
        this.$message.error(res.msg)
      }
    },
    async handleEdit(data) {
      const res = await this.$server.corporateDomain.getUserInfo(data.id)
      if (res.code) {
        this.modalData = res.data
        this.showModal('edit')
      } else {
        this.$message.error('获取信息失败, 请重试')
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../main.less";
</style>
