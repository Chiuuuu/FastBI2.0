<template>
  <a-modal
    width="764px"
    :z-index="800"
    :title="single ? '定时设置' : '批量抽取设置'"
    :bodyStyle="bodyStyle"
    :maskClosable="false"
    :visible="show"
    @cancel="handleClose"
    @ok="handleOk">
    <div v-if="single" style="margin-bottom:10px">
      <a-button type="primary" :loading="modalSpin" @click="setRegular">添加定时任务</a-button>
    </div>
    <a-table
      rowKey='id'
      size="small"
      :columns="regColumns"
      :data-source="regData"
      :loading="modalSpin"
      :pagination='false'
      :footer="null"
    >
      <span slot="name" slot-scope="name, row">
        <a @click="handleRegular(row, 'check')">{{ name }}</a>
      </span>
      <span slot="repeat" slot-scope="type">
        {{ type === 0 ? '只执行一次' : '重复执行' }}
      </span>
      <span slot="config" slot-scope="row">
        <a-tooltip v-if="row.executed > 0 && row.repeat === 0" placement="left">
          <span slot="title">该任务已执行完毕, 无法编辑</span>
          <span style="color:#ccc;margin-right: 20px">编辑</span>
        </a-tooltip>
        <a-tooltip v-else-if="row.repeat === 1 && row.gmtEnd && +new Date(row.gmtEnd) < +new Date()" placement="left">
          <span slot="title">该任务已执行完毕, 无法编辑</span>
          <span style="color:#ccc;margin-right: 20px">编辑</span>
        </a-tooltip>
        <a v-else style="margin-right: 20px" v-on:click="handleRegular(row, 'edit')">编辑</a>
        <a v-on:click="handleRegular(row, 'delete')">删除</a>
      </span>
    </a-table>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'

const regColumns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    ellipsis: true,
    width: 200,
    key: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '执行频率',
    dataIndex: 'repeat',
    key: 'repeat',
    scopedSlots: { customRender: 'repeat' }
  },
  {
    title: '开始时间',
    dataIndex: 'gmtStart',
    key: 'gmtStart',
    scopedSlots: { customRender: 'gmtStart' }
  },
  {
    title: '操作',
    key: 'config',
    scopedSlots: { customRender: 'config' }
  }
]

export default {
  name: 'extractSetting',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    rows: [Array],
    databaseId: [String],
    formData: [Object, String]
  },
  data() {
    return {
      bodyStyle: { 'maxHeight': 'calc(100vh - 240px)', 'overflow-y': 'auto' },
      modalSpin: false,
      regularForm: '',
      form: {
        extractType: undefined,
        id: undefined
      },
      rules: {
        extractType: [
          { required: true, message: '请选择抽取方式', trigger: 'change' }
        ],
        id: [
          { required: true, message: '请选择依据字段', trigger: 'change' }
        ]
      },
      regData: [],
      regColumns
    }
  },
  computed: {
    ...mapState({
      modelName: state => state.dataAccess.modelName,
      modelId: state => state.dataAccess.modelId
    }),
    single() {
      return this.rows.length === 1
    },
    regularData() {
      return this.selectedRows.length > 0 ? this.selectedRows : this.data
    }
  },
  watch: {
    show(newValue, oldValue) {
      if (newValue) {
        this.handleGetRegularList()
      }
    }
  },
  methods: {
    setRegular() {
      this.modalSpin = true
      this.$emit('setRegular')
    },
    async handleGetRegularList() {
      this.modalSpin = true
      let res
      if (!this.single) {
        res = await this.$server.dataAccess.getRegularList(this.databaseId, 1)
          .finally(() => {
            this.modalSpin = false
          })
      } else {
        res = await this.$server.dataAccess.getRegularList(this.rows[0].id, 0)
          .finally(() => {
            this.modalSpin = false
          })
      }
      if (res.code === 200) {
        this.regData = res.rows
      } else {
        this.$message.error(res.msg || '请求错误')
      }
    },
    updateRows(row) {
      this.regData.map((item, index) => {
        if (item.id === row.id) {
          this.$set(this.regData, index, row)
        }
      })
    },
    handleRegular(row, type) {
      if (type === 'check') {
        this.$emit('checkRegular', row)
      } else if (type === 'edit') {
        this.modalSpin = true
        this.$emit('setRegular', row)
      } else if (type === 'delete') {
        this.$confirm({
          title: '确认提示',
          content: '确定要删除该任务吗',
          onOk: async () => {
            let res, id
            if (row.groupId !== '0') {
              id = row.groupId
              res = await this.$server.dataAccess.deleBatchRegularInfo(id)
            } else {
              id = row.id
              res = await this.$server.dataAccess.deleRegularInfo(id)
            }
            if (res.code === 200) {
              this.$message.success('删除成功')
              for (let i = 0; i < this.regData.length; i++) {
                const item = this.regData[i]
                if (item.id === row.id) {
                  this.regData.splice(i, 1)
                  break
                }
              }
            } else {
              this.$message.error(res.msg)
            }
          }
        })
      }
    },
    closeRegular() {
      this.visible2 = false
    },
    handleClose() {
      this.$emit('close')
    },
    handleOk() {
      this.handleClose()
    }
  }
}
</script>

<style>

</style>
