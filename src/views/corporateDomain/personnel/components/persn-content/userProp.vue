<template>
  <div class="flex-col">
    <div class="role-list-controller">
      <div class="searchbar">
        <a-form-model ref="form" layout="inline" :model="userSearch">
          <a-form-model-item label="用户名" prop="username">
            <a-input v-model="userSearch.username" style="width: 150px" placeholder="请输入用户名"></a-input>
          </a-form-model-item>
          <a-form-model-item label="姓名" prop="name">
            <a-input v-model="userSearch.name" style="width: 150px" placeholder="请输入姓名"></a-input>
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="primary" @click="() => handleGetData()" :disabled="loading">查询</a-button>
          </a-form-model-item>
          <a-form-model-item>
            <a-button type="default" @click="resetForm" :disabled="loading">重置</a-button>
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>
    <a-table
      class="role-list-table scrollbar"
      ref="table"
      row-key="id"
      :columns="userColumn"
      :pagination="pagination"
      :data-source="userData"
      :loading="loading"
      :scroll="{ y: 'calc(100vh - 350px)', x: 1210 }"
      @change="handleTableChange">
      <!-- 列属性编辑 -->
      <template v-for="index in 6">
        <PropsEdit
          v-if="propNameList.length > 0"
          :slot="'col' + (index - 1)"
          :key="(index - 1)"
          :index="(index - 1)"
          :active-index="activePropIndex"
          :title="propNameList[index - 1].name"
          @changePropsEdit="activePropIndex = (index - 1)"
          @cancelPropsEdit="activePropIndex = -1"
          @savePropsEdit="handleSaveEditCol"
          />
      </template>

      <!-- 行属性编辑 -->
      <template v-for="i in 6" :slot="'custom' + (i - 1)" slot-scope="text, record, index">
        <TableEdit
          :key="i"
          :index="index"
          :active-index="activeTableIndex"
          :data="text"
          @getChangeText="v => getChangeText(i - 1, v)"
        />
      </template>

      <template #config="text, record, index">
        <a class="handler-margin" v-show="index === activeTableIndex" @click="handleSaveEditRow">保存</a>
        <a v-show="index === activeTableIndex" @click="activeTableIndex = -1">取消</a>
        <a v-show="index !== activeTableIndex" @click="handleEditUserRow(record, index)">编辑</a>
      </template>
    </a-table>
  </div>
</template>

<script>
import { trimFormData } from '@/utils/form-utils'
import PropsEdit from './props-edit'
import TableEdit from './table-edit'

const userColumn = [
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
  }
]

for (let i = 0; i < 6; i++) {
  userColumn.push({
    scopedSlots: { customRender: 'custom' + i, title: 'col' + i },
    dataIndex: 'userattrList.' + i,
    width: 240,
    ellipsis: true
  })
}

userColumn.push({
  title: '操作',
  width: 120,
  fixed: 'right',
  dataIndex: 'config',
  scopedSlots: { customRender: 'config' }
})

export default {
  name: 'userProp',
  components: {
    PropsEdit,
    TableEdit
  },
  data() {
    return {
      loading: false,
      modalData: {},
      visible1: false,
      activePropIndex: -1,
      activeTableIndex: -1,
      editRowIndex: '',
      editRow: '',
      userSearch: {
        username: '',
        name: ''
      },
      userData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      userColumn,
      propNameList: []
    }
  },
  created () {
    this.handleGetData()
  },
  methods: {
    async handleGetData(pagination) {
      this.activePropIndex = -1
      this.activeTableIndex = -1
      this.loading = true
      const params = Object.assign({}, trimFormData(this.userSearch), {
        pageSize: this.pagination.pageSize,
        current: pagination ? pagination.current : this.$options.data().pagination.current
      })
      const res = await this.$server.corporateDomain.getPropListByName(params)
        .finally(() => {
          this.loading = false
        })
      if (res.code === 200) {
        if (res.headers) {
          this.propNameList = res.headers.slice(-6)
        }
        this.userData = res.rows
        this.pagination.total = res.total
        this.pagination.current = params.current
      } else {
        this.$message.error(res.msg)
      }
    },
    resetForm(tab) {
      this.$refs.form.resetFields()
      this.$nextTick(() => {
        this.handleGetData()
      })
    },
    handleTableChange(pagination, filters, sorter) {
      this.handleGetData(pagination)
    },
    /* 处理列 */
    async handleSaveEditCol(index, data) {
      const headers = [].concat(this.propNameList)
      headers[index].name = data
      const res = await this.$server.corporateDomain.updateUserProp({
        headers
      })
      if (res.code === 200) {
        this.activePropIndex = -1
        this.$message.success('保存成功')
        this.handleGetData()
      } else {
        this.$message.error(res.msg)
      }
    },

    /* 处理行 */
    handleEditUserRow(record, index) {
      if (this.activeTableIndex !== -1) {
        return this.$message.error('请先完成操作')
      } else {
        // this.editRow = Object.assign({}, record)
        this.editRow = JSON.parse(JSON.stringify(record))
        this.activeTableIndex = index
      }
    },
    getChangeText(index, value) {
      this.editRow.userattrList[index].attrValue = value
    },
    async handleSaveEditRow() {
      let valid = true
      this.editRow.userattrList.map(item => {
        if (item.attrValue.length > 50) {
          valid = false
        }
      })
      if (!valid) return this.$message.error('请输入50个字符以内的属性')
      const res = await this.$server.corporateDomain.updateUserProp({
        rows: new Array(this.editRow)
      })
      if (res.code === 200) {
        this.userData.splice(this.activeTableIndex, 1, this.editRow)
        this.$message.success('保存成功')
        this.activeTableIndex = -1
      } else {
        this.$message.error('修改失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../main.less";
</style>
