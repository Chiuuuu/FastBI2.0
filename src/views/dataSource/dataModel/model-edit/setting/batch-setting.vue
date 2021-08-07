<template>
  <a-drawer
    title="批量编辑字段"
    width="80%"
    :visible="isShow"
    :body-style="{ paddingBottom: '80px' }"
    @close="handleClose"
  >
    <div class="drawer-btn">
      <a-button style="width: 110px"
        :disabled="!fieldSetable"
        @click="handleShowSetting($event, 'dataType')">设置字段类型</a-button>
      <a-button style="width: 110px"
        :disabled="!selectDrawer"
        @click="handleShowSetting($event, 'role')">设置字段属性</a-button>
      <a-button style="width: 110px"
        :disabled="!selectDrawer"
        @click="handleShowSetting($event, 'visible')">设置是否可见</a-button>
    </div>
    <div v-if="Object.keys(cacheTables).length > 0"
         class="drawer-menu draw-menu-batch scrollbar">
      <a-collapse style="width: 100%">
        <a-collapse-panel
          v-for="(value, name) in cacheTables"
          :key="name"
          :header="handleGetPanelName(value[0].tableName)">
          <BatchSettingItem
            :tableData="value"
            @deleteSelectAllRows="handleDeleteSelectAllRows"
            @onSelectAllRows="handleSelectAllRows"
            @deleteSelectRow="handleDeleteSelectRow"
            @onSelectRow="handleSelectRows"
            @checkName="handleCheckName"
            @change-visible="handleSelect"
          ></BatchSettingItem>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <a-empty v-else class="drawer-menu" />
    <div :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1,
      }">
      <a-button :style="{ marginRight: '8px' }" @click="$emit('close')">
        取消
      </a-button>
      <a-button type="primary" @click="handleSave"> 保存 </a-button>
    </div>
    <a-modal
      :visible="showSetting"
      :afterClose="handleAfterClose"
      @cancel="handleCancelModal"
      @ok="handleBatchSetting">
      <template v-if="setType === 'dataType'">
        <a-form-model :model="modalForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-model-item label="字段类型" required>
            <a-select default-value="BIGINT" style="width: 100px" v-model="modalForm.dataType">
              <a-select-option value="BIGINT"> 整数 </a-select-option>
              <a-select-option value="DOUBLE"> 小数 </a-select-option>
              <a-select-option value="DECIMAL"> 数值 </a-select-option>
              <a-select-option value="VARCHAR"> 字符串 </a-select-option>
              <a-select-option value="DATE"> 日期 </a-select-option>
              <a-select-option value="TIMESTAMP"> 日期时间 </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-form-model>
      </template>
      <template v-else-if="setType === 'role'">
        <a-form-model :model="modalForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-model-item label="字段属性" required>
            <a-radio-group name="batchRole" :default-value="1" v-model="modalForm.role">
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
        <a-form-model :model="modalForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-model-item label="是否可见" required>
            <a-radio-group name="batchVisible" :default-value="true" v-model="modalForm.visible">
              <a-radio :value="true">
                是
              </a-radio>
              <a-radio :value="false">
                否
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>
  </a-drawer>
</template>

<script>
import BatchSettingItem from './batch-setting-item'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import pullAllBy from 'lodash/pullAllBy'
export default {
  name: 'batchSetting',
  components: {
    BatchSettingItem
  },
  props: {
    isShow: Boolean,
    tables: [Array, Object, String]
  },
  data() {
    return {
      selectedRows: [],
      showSetting: false,
      setType: '',
      cacheTables: '',
      modalForm: {
        dataType: 'BIGINT',
        role: 1,
        visible: true
      },
      validatePass: true
    }
  },
  computed: {
    selectDrawer() {
      return this.selectedRows.length > 0
    },
    fieldSetable() {
      // 相同的字段属性(维度度量)才能批量设置字段类型
      return this.selectDrawer && !this.selectedRows.some((item, index, list) => list[0].role !== item.role)
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(value) {
        this.cacheTables = value ? cloneDeep(this.tables) : ''
      }
    }
  },
  methods: {
    handleGetPanelName(name) {
      if (['自定义维度', '自定义度量', '自定义表'].indexOf(name) > -1) {
        return '自定义表'
      }
      return name
    },
    // 全选
    handleSelectAllRows(rows) {
      this.selectedRows = this.selectedRows.concat(rows)
    },
    // 取消全选
    handleDeleteSelectAllRows(rows) {
      pullAllBy(this.selectedRows, rows, 'id')
    },
    // 选择单个
    handleSelectRows(record) {
      this.selectedRows.push(record)
    },
    // 取消单个
    handleDeleteSelectRow(record) {
      pullAllBy(this.selectedRows, [record], 'id')
    },
    handleSelect(value, record, index) {
      const has = Object.keys(this.cacheTables).some(item => (item === record.tableNo) || (item === `${record.tableNo}`))
      if (has) {
        this.cacheTables[record.tableNo].splice(index, 1, {
          ...record,
          visible: value === 'true'
        })
      }
    },
    handleCheckName: debounce(function(event) {
      const value = event.target.value
      let hasSame = false
      Object.values(this.tables).forEach(list => {
        if (list.some(item => item.alias === value)) {
          hasSame = true
        }
      })
      if (hasSame) {
        this.validatePass = false
        this.$message.error('存在同名字段, 请重新命名')
      } else {
        this.validatePass = true
      }
    }, 500),
    handleSave() {
      if (this.validatePass) {
        this.selectedRows = []
        this.$emit('success', this.cacheTables)
      } else {
        this.$message.error('存在同名字段, 请重新命名')
      }
    },
    handleAfterClose() {
      this.modalForm = this.$options.data().modalForm
    },
    handleClose() {
      this.selectedRows = []
      this.$emit('close')
    },
    handleShowSetting(e, type) {
      this.showSetting = true
      this.setType = type
    },
    handleCancelModal() {
      this.showSetting = false
    },
    handleBatchSetting() {
      this.saveBatchFiled()
      this.showSetting = false
    },
    saveBatchFiled() {
      let value = this.modalForm[this.setType]
      this.selectedRows.forEach(item => {
        Object.keys(this.cacheTables).forEach(key => {
          this.cacheTables[key].forEach(table => {
            if (item.id === table.id) {
              table[this.setType] = value
            }
          })
        })
      })
    }
  }
}
</script>
