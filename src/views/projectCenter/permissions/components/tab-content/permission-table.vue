<template>
  <a-form-model
    labelAlign="left"
    :model="form"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 19 }"
  >
    <a-form-model-item label="数据接入" prop="sourceId">
      <a-select
        style="width:240px"
        v-model="form.sourceId"
        placeholder="请选择数据源"
        @change="handleGetTableData"
      >
        <a-select-option v-for="source in sourceList" :key="source.id">{{
          source.name
        }}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item v-if="type === 'row'" label="规则" prop="rule">
      <a-radio-group v-model="form.rule" @change="handleGetTableData">
        <a-radio :value="0">and</a-radio>
        <a-radio :value="1">or</a-radio>
      </a-radio-group>
    </a-form-model-item>
    <a-form-model-item v-if="type === 'row'" label="设置方式" prop="setType">
      <a-radio-group v-model="form.setType" @change="handleGetTableData">
        <a-radio :value="0">固定值</a-radio>
        <a-radio :value="1">动态值</a-radio>
      </a-radio-group>
    </a-form-model-item>
    <a-form-model-item label="选择字段">
      <a-button v-show="mode === 'edit'" style="width:100%" @click="showModal"
        >添加数据筛选</a-button
      >
      <a-table
        style="border: 1px solid #e8e8e8"
        rowKey="id"
        :data-source="tableData"
        :columns="tableColumns"
        :loading="loading"
        :scroll="{
          y: type === 'row' ? 'calc(100vh - 620px)' : 'calc(100vh - 492px)'
        }"
      >
        <template #config="text, record, index">
          <a @click="handleEditPermission(record)">编辑</a>
          <a-popconfirm
            title="是否确定删除？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDeletePermission(record.id)"
          >
            <a style="margin-left:5px">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-form-model-item>

    <ModalAddPermission
      :visible="visible"
      :modal-data="modalData"
      @close="visible = false"
      @ok="handleAddPermission"
    />
  </a-form-model>
</template>

<script>
import ModalAddPermission from './modal-addPerm'

const sourceList = [
  { id: '1', name: '数据源1', type: 1 },
  { id: '2', name: '数据源2', type: 2 },
  { id: '3', name: '数据源3', type: 3 },
  { id: '4', name: '数据源4', type: 4 },
  { id: '5', name: '数据源5', type: 5 }
]

const tableColumns = [
  {
    title: '表名',
    width: 200,
    ellipsis: true,
    dataIndex: 'tableName'
  },
  {
    title: '字段名',
    width: 200,
    ellipsis: true,
    dataIndex: 'fieldName'
  },
  {
    title: '数据',
    ellipsis: true,
    dataIndex: 'data'
  }
]

const tableColumnsEdit = tableColumns.concat({
  title: '操作',
  dataIndex: 'config',
  width: 100,
  scopedSlots: { customRender: 'config' }
})

export default {
  name: 'permissionTable',
  components: {
    ModalAddPermission
  },
  props: {
    type: {
      // 行或者列
      type: String,
      default: 'row'
    },
    mode: {
      // 编辑模式或者查看模式
      type: String,
      default: 'show'
    }
  },
  data() {
    return {
      loading: false,
      visible: false,
      modalData: null,
      form: {
        sourceId: undefined,
        rule: 0,
        setType: 0
      },
      sourceList: [],
      tableData: [],
      tableColumns: this.mode === 'show' ? tableColumns : tableColumnsEdit
    }
  },
  created() {
    this.handleGetSourceList()
  },
  methods: {
    handleGetSourceList() {
      this.sourceList = sourceList
    },
    handleGetTableData() {
      this.loading = true
      setTimeout(() => {
        for (let i = 0; i < 30; i++) {
          this.tableData.push({
            id: i,
            tableName: 'dami',
            fieldName: 'sssdai',
            data: '天河区域'
          })
        }
        this.loading = false
      }, 500)
    },
    showModal() {
      this.visible = true
      this.modalData = null
    },
    handleEditPermission(data) {
      this.modalData = data
      this.visible = true
    },
    handleDeletePermission(id) {},
    handleAddPermission() {
      this.visible = false
    }
  }
}
</script>

<style></style>
