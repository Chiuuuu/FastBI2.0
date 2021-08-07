<template>
  <div class="data-access-setting">
    <div class="set-main">
      <div class="header">
        <span class="data_con">{{ fieldInfo.name }}</span>
        <a-button class="data_btn" v-on:click="back">返回</a-button>
      </div>
      <div class="scrollable scrollbar">
        <div class="setting">
          <div class="set_bar">
            <a-input
              :value="fieldKeyword"
              @change="handleGetFieldKeyword"
              placeholder="请输入关键词"
              class="search_input"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
            <a-button
              :disabled="!fieldSetable"
              v-on:click="handleShowSetting('convertType')"
              >设置字段类型</a-button
            >
            <a-button
              :disabled="!selectDrawer"
              v-on:click="handleShowSetting('role')"
              >设置字段属性</a-button
            >
            <a-button
              :disabled="!selectDrawer"
              v-on:click="handleShowSetting('visible')"
              >设置是否可见</a-button
            >
          </div>
          <div class="table">
            <a-table
              rowKey="id"
              :row-selection="rowSelection"
              :columns="columns"
              :pagination="false"
              :data-source="currentData"
              :loading="sping"
              :scroll="{ x: 1200, y: 'calc(100vh - 350px)' }"
            >
              <template slot="alias" slot-scope="text, record, index">
                <a-input
                  style="width:100%;height:32px"
                  :value="text"
                  :maxLength="20"
                  @blur.stop.prevent="
                    handleAliasBlur($event, record, index, 'alias')
                  "
                  @change.stop.prevent="
                    handleChangeValue($event, record, index, 'alias')
                  "
                />
              </template>
              <template slot="convertType" slot-scope="text, record">
                <field-select
                  :text="(text || record.dataType) | formatField"
                  :select-data="record"
                  :contextmenus="fieldContenxtMenu"
                  :isDimension="record.role === 1"
                />
              </template>
              <template slot="role" slot-scope="text, record">
                <field-select
                  :text="text | formatRole"
                  :select-data="record"
                  :contextmenus="[
                    {
                      name: '转换为' + (text === 1 ? '度量' : '维度'),
                      roleType: text === 1 ? 2 : 1,
                      onClick: switchRoleType
                    }
                  ]"
                  :isDimension="record.role === 1"
                />
              </template>
              <template slot="description" slot-scope="text, record, index">
                <a-input
                  style="width:100%;height:32px"
                  :value="text"
                  :maxLength="200"
                  @change.stop.prevent="
                    handleChangeValue($event, record, index, 'description')
                  "
                />
              </template>
              <template slot="comment" slot-scope="comment">
                {{ comment }}
              </template>
              <template slot="visible" slot-scope="text, record, index">
                <a-select
                  style="width:60px"
                  :value="`${text}`"
                  @change="
                    value =>
                      handleSelectChangeValue(value, record, index, 'visible')
                  "
                >
                  <a-select-option value="true">
                    是
                  </a-select-option>
                  <a-select-option value="false">
                    否
                  </a-select-option>
                </a-select>
              </template>
              <template slot="extractable" slot-scope="text, record, index">
                <a-select
                  style="width:60px"
                  :value="`${text}`"
                  @change="
                    value =>
                      handleSelectChangeValue(
                        value,
                        record,
                        index,
                        'extractable'
                      )
                  "
                >
                  <a-select-option value="true">
                    是
                  </a-select-option>
                  <a-select-option value="false">
                    否
                  </a-select-option>
                </a-select>
              </template>
            </a-table>
          </div>
          <a-modal
            v-model="showSetting"
            @cancel="handleCancelModal"
            @ok="handleBatchSetting"
          >
            <template v-if="setType === 'convertType'">
              <a-form-model
                :model="modalForm"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-form-model-item label="字段类型" prop="convertType" required>
                  <a-select
                    default-value="BIGINT"
                    style="width: 100px"
                    v-model="modalForm.convertType"
                  >
                    <a-select-option value="BIGINT"> 整数 </a-select-option>
                    <a-select-option value="DOUBLE"> 小数 </a-select-option>
                    <a-select-option value="DECIMAL"> 数值 </a-select-option>
                    <a-select-option value="VARCHAR"> 字符串 </a-select-option>
                    <a-select-option value="DATE"> 日期 </a-select-option>
                    <a-select-option value="TIMESTAMP">
                      日期时间
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-form-model>
            </template>
            <template v-else-if="setType === 'role'">
              <a-form-model
                :model="modalForm"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-form-model-item label="字段属性" prop="role" required>
                  <a-radio-group
                    name="batchRole"
                    :default-value="1"
                    v-model="modalForm.role"
                  >
                    <a-radio :value="1">
                      维度
                    </a-radio>
                    <a-radio :value="2">
                      度量
                    </a-radio>
                  </a-radio-group>
                </a-form-model-item>
              </a-form-model>
            </template>
            <template v-else-if="setType === 'visible'">
              <a-form-model
                :model="modalForm"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-form-model-item label="是否可见" prop="visible" required>
                  <a-radio-group
                    name="batchVisible"
                    v-model="modalForm.visible"
                  >
                    <a-radio value="true">
                      是
                    </a-radio>
                    <a-radio value="false">
                      否
                    </a-radio>
                  </a-radio-group>
                </a-form-model-item>
              </a-form-model>
            </template>
          </a-modal>
        </div>
        <div class="set_btn">
          <a-row type="flex" justify="space-around" align="middle">
            <a-col>
              <a-button style="width:88px;height:30px;" @click="back">
                取消
              </a-button>
            </a-col>
            <a-col>
              <a-button
                :loading="loading"
                type="primary"
                style="width:88px;height:30px;"
                @click="handleSaveWriteTable"
              >
                保存
              </a-button>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { message } from 'ant-design-vue'
import FieldSelect from '@/components/dataSource/field-select/select'
import debounce from 'lodash/debounce'

const columns = [
  {
    title: '原名',
    ellipsis: true,
    width: 200,
    dataIndex: 'name'
  },
  {
    title: '别名',
    dataIndex: 'alias',
    scopedSlots: { customRender: 'alias' }
  },
  {
    title: '字段类型',
    dataIndex: 'convertType',
    scopedSlots: { customRender: 'convertType' }
  },
  {
    title: '字段属性',
    dataIndex: 'role',
    scopedSlots: { customRender: 'role' }
  },
  {
    title: '字段说明',
    dataIndex: 'description',
    scopedSlots: { customRender: 'description' }
  },
  {
    title: '注释',
    dataIndex: 'comment',
    ellipsis: true,
    width: 200,
    scopedSlots: { customRender: 'comment' }
  },
  {
    title: '是否可见',
    dataIndex: 'visible',
    scopedSlots: { customRender: 'visible' }
  },
  {
    title: '是否抽取',
    dataIndex: 'extractable',
    scopedSlots: { customRender: 'extractable' }
  }
]

export default {
  props: {
    fieldInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  components: {
    FieldSelect
  },
  data() {
    return {
      data: [],
      fieldKeyword: '',
      sping: false,
      loading: false,
      showSetting: false,
      setType: '',
      modalForm: {
        convertType: 'BIGINT',
        role: 1,
        visible: 'true'
      },
      columns,
      selectedRows: [],
      selectedRowKeys: [],
      current: ['mail'],
      openKeys: ['sub1'],
      visible: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      fieldContenxtMenu: [
        {
          name: '转换为整数',
          dataType: 'BIGINT',
          onClick: this.switchFieldType
        },
        {
          name: '转换为小数',
          dataType: 'DOUBLE',
          onClick: this.switchFieldType
        },
        // {
        //   name: '转换为数值',
        //   dataType: 'DECIMAL',
        //   onClick: this.switchFieldType
        // },
        {
          name: '转换为字符串',
          dataType: 'VARCHAR',
          onClick: this.switchFieldType
        },
        {
          name: '转换为日期',
          dataType: 'DATE',
          onClick: this.switchFieldType
        },
        {
          name: '转换为日期时间',
          dataType: 'TIMESTAMP',
          onClick: this.switchFieldType
        }
      ]
    }
  },
  computed: {
    ...mapState({
      formInfo: state => state.dataAccess.modelInfo,
      modelId: state => state.dataAccess.modelId,
      readRows: state => state.dataAccess.readRows,
      modelType: state => state.dataAccess.modelType,
      modelName: state => state.dataAccess.modelName,
      databaseName: state => state.dataAccess.databaseName
    }),
    selectDrawer() {
      return this.selectedRows.length > 0
    },
    fieldSetable() {
      // 相同的字段属性(维度度量)才能批量设置字段类型
      return (
        this.selectDrawer &&
        !this.selectedRows.some(
          (item, index, list) => list[0].role !== item.role
        )
      )
    },
    currentData() {
      return this.data.filter(
        item =>
          item.name.toLowerCase().indexOf(this.fieldKeyword.toLowerCase()) > -1
      )
    },
    rowSelection() {
      return {
        fixed: true,
        selectedRowKeys: this.selectedRowKeys,
        onSelect: (record, selected, selectedRows) => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.selectedRows = selectedRows
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.selectedRowKeys = selectedRows.map(item => item.id)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.selectedRows = selectedRows
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.selectedRowKeys = selectedRows.map(item => item.id)
        }
      }
    }
  },
  mounted() {
    this.handleGetData()
  },
  filters: {
    formatField(value) {
      switch (value) {
        case 'BIGINT':
          value = '整数'
          break
        case 'TIMESTAMP':
          value = '日期时间'
          break
        case 'DATE':
          value = '日期'
          break
        case 'DOUBLE':
          value = '小数'
          break
        case 'DECIMAL':
          value = '数值'
          break
        case 'VARCHAR':
          value = '字符串'
          break
        default:
          value = '未知类型'
      }
      return value
    },
    formatRole(value) {
      if (value === 1) {
        return '维度'
      } else {
        return '度量'
      }
    }
  },
  methods: {
    handleChangeValue(event, record, index, key) {
      const newValue = event.target.value
      record[key] = newValue
    },
    handleGetFieldKeyword: debounce(function(e) {
      this.fieldKeyword = e.target.value
      this.selectedRowKeys = []
      this.selectedRows = []
    }, 400),
    handleAliasBlur(event, record, index, key) {
      if (!event.target.value) {
        message.error('别名不能为空')
        record[key] = record.name
      } else if (event.target.value.length > 20) {
        message.error('别名不能超过20个字符')
      }
    },
    handleSelectChangeValue(value, record, index, key) {
      record[key] = value
    },
    switchFieldType(e, item, vm) {
      let convertType = item.dataType
      vm.selectData.convertType = convertType
    },
    switchRoleType(e, item, vm) {
      let roleType = item.roleType
      vm.selectData.role = roleType
    },
    async handleGetData() {
      this.sping = true
      let databaseName = this.formInfo ? this.formInfo.databaseName : ''
      // sql, oracle的数据库名称在formInfo里, excel的在dabaseName里
      if (['excel', 'csv'].indexOf(this.modelType) > -1) {
        databaseName = this.databaseName
      }
      const result = await this.$server.dataAccess
        .getTableFieldDetail({
          databaseName,
          sourceId: this.modelId,
          sourceName: this.modelName,
          databaseId: this.fieldInfo.databaseId,
          tableId: this.fieldInfo.id,
          tableName: this.fieldInfo.name
        })
        .finally(() => {
          this.sping = false
        })

      if (result.code === 200) {
        this.data = [].concat(result.rows)
      } else {
        this.$message.error(result.msg)
      }
    },
    showModal() {
      this.visible = true
    },
    /**
     * 抽屉-批量设置
     */
    handleShowSetting(type) {
      this.showSetting = true
      this.setType = type
    },
    handleBatchSetting() {
      let value = this.modalForm[this.setType]
      this.selectedRows.forEach(item => {
        if (this.setType === 'visible') {
          item[this.setType] = value === 'true'
        } else {
          item[this.setType] = value
        }
      })
      this.showSetting = false
    },
    back() {
      this.$emit('on-change-componet', 'Main')
    },
    handleCancelModal() {
      this.modalForm = this.$options.data().modalForm
    },
    async handleSaveWriteTable() {
      this.loading = true
      const writeResult = await this.$server.dataAccess
        .saveDataTable({
          rows: this.readRows,
          tableId: this.fieldInfo.id
        })
        .finally(() => {
          this.loading = false
        })

      if (writeResult.code === 200) {
        this.handleSaveTableField()
      } else {
        this.$message.error(writeResult.msg)
      }
    },
    async handleSaveTableField() {
      const result = await this.$server.dataAccess.saveTableField({
        rows: this.data
      })

      if (result.code === 200) {
        this.$message
          .success({
            content: '保存成功',
            duration: 0.5
          })
          .then(() => {
            this.back()
          })
      } else {
        this.$message.error(result.msg)
      }
    }
  }
}
</script>

<style lang="styl" scope>
@import "./dataAccess-setting.styl";
</style>
