<template>
    <!-- 模态框 -->
    <a-modal title="编辑数据筛选" :visible="visible" @cancel="$emit('close')" @ok="handleOk">
      <a-form-model
        ref="modalForm"
        :model="modalForm"
        :rules="modalRules"
        >
        <a-form-model-item prop="database">
          <a-cascader
            placeholder="请选择数据库"
            v-model="modalForm.database"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            :options="databaseList"
            :load-data="loadCascaderData"
            change-on-select>
          </a-cascader>
        </a-form-model-item>
        <a-form-model-item prop="props">
          <a-select v-model="modalForm.props" mode="multiple" placeholder="请选择数据项">
            <a-select-option :value="'prop1'">属性一</a-select-option>
            <a-select-option :value="'prop2'">属性二</a-select-option>
            <a-select-option :value="'prop3'">属性三</a-select-option>
            <a-select-option :value="'prop4'">属性四</a-select-option>
            <a-select-option :value="'prop5'">属性五</a-select-option>
            <a-select-option :value="'prop6'">属性六</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
</template>

<script>
import newFolderVue from '../../../../../components/newFolder/newFolder.vue'
export default {
  name: 'modalAddPermission',
  props: {
    sourceId: String,
    modalData: Object,
    visible: Boolean
  },
  data() {
    return {
      title: '编辑数据筛选',
      databaseList: [],
      modalForm: {
        database: [],
        props: []
      },
      modalRules: {
        database: [
          { validator: (rule, value, callback) => {
              if (value.length !== 3) {
                callback(new Error('请选择具体字段'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        props: [{ required: true, message: '请选择数据项' }]
      }
    }
  },
  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        this.getDataBaseList()
        if (this.modalData) { // 编辑
          this.title = '编辑数据筛选'
          // 将数据库/表/字段处理成数组, 写入form(属性名还没约定)
          this.modalForm.database.push(this.modalData.databaseId, this.modalData.tableId, this.modalData.fieldId)
          this.modalForm.props = this.modalData.props
        } else {
          this.title = '新增数据筛选'
        }
      } else {
        this.resetForm()
      }
    }
  },
  methods: {
    resetForm() {
      this.modalForm = this.$options.data().modalForm
    },
    getDataBaseList() {
      this.databaseList = [
        {
          id: '1',
          name: '数据库1',
          isLeaf: false
        },
        {
          id: '2',
          name: '数据库2',
          isLeaf: false
        }
      ]
    },
    loadCascaderData(options) {
      const len = options.length
      // 选完数据库
      if (len === 1) {
        const data = options[0]
        data.loading = true
        setTimeout(() => {
          data.loading = false
          data.children = [
            {
              name: '表1',
              id: '1',
              isLeaf: false
            },
            {
              name: '表2',
              id: '2',
              isLeaf: false
            }
          ]
          this.databaseList = [...this.databaseList]
        }, 500)
      } else if (len === 2) { // 选完表
        const data = options[1]
        data.loading = true
        setTimeout(() => {
          data.loading = false
          data.children = [
            {
              name: '字段1',
              id: '1'
            },
            {
              name: '字段2',
              id: '2'
            }
          ]
          this.databaseList = [...this.databaseList]
        }, 500)
      }
    },
    handleOk() {
      this.$refs.modalForm.validate((ok, obj) => {
        if (ok) {
          this.$emit('ok')
        }
      })
    }
  }
}
</script>

<style>

</style>
