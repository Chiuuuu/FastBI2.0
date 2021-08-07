<template>
  <a-modal
    :bodyStyle="bodyStyle"
    :maskClosable="false"
    width="700px"
    title="定时任务设置"
    :confirmLoading="loading"
    :visible="show"
    @cancel="handleClose"
    @ok="handleOk"
  >
    <template slot="footer">
      <template v-if="!isCheck">
        <a-button type="default" key="back" @click="handleClose">取消</a-button>
        <a-button type="primary" key="submit" @click="handleOk">确定</a-button>
      </template>
      <span v-else></span>
    </template>
    <a-spin :spinning="spinning">
      <a-form-model
        ref="form"
        :model="form"
        :rules="regRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 19 }"
      >
        <template v-if="single">
          <a-form-model-item class="form-not-required" label="抽取方式" prop="extractType">
            <a-radio-group style="width:100%" v-model="form.extractType">
              <a-radio :disabled="isCheck" :value="0">
                <span>全量覆盖抽取</span>
                <a-popover>
                  <template slot="content">每次抽取，对数据库的全部数据进行抽取，并覆盖数据库全部已有的数据</template>
                  <a-icon style="margin-left:10px" type="question-circle" theme="outlined" />
                </a-popover>
              </a-radio>
              <!-- 自定义表, 没有增量字段, 大数据表暂时不支持增量更新 -->
              <a-radio :value="1" :disabled="disabledIncrease">
                <span>增量抽取</span>
                <a-popover>
                  <template slot="content">每次抽取，根据增量字段判断数据库中的数据是否为新增数据，对数据库的新增数据进行抽取，并追加在数据库中</template>
                  <a-icon style="margin-left:10px" type="question-circle" theme="outlined" />
                </a-popover>
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item
            v-if="form.extractType === 1"
            label="抽取依据字段"
            prop="incrementalColumn"
            :rules="increaseColRules"
          >
            <a-select
              :disabled="isCheck"
              v-model="form.incrementalColumn"
              placeholder="请选择依据字段"
              @change="handleSelectIncreaseField"
            >
              <a-select-option
                v-for="item in increaseList[0].fieldList"
                :key="item.name"
                :value="item.name"
              >{{ item.name }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </template>
        <a-form-model-item label="任务名称" prop="name">
          <a-input :disabled="isCheck" v-model="form.name" placeholder="请输入任务名称"></a-input>
        </a-form-model-item>
        <a-form-model-item label="执行频率" prop="repeat">
          <a-select :disabled="isCheck" v-model="form.repeat" placeholder="请选择更新方式">
            <a-select-option :value="0">只执行一次</a-select-option>
            <a-select-option :value="1">重复执行</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item
          style="margin-left: 100px"
          prop="interval"
          v-if="form.repeat === 1"
          :rules="intervalRules"
        >
          <div>
            <span>每隔&nbsp;</span>
            <a-input :disabled="isCheck" style="width:100px" v-model="form.interval"></a-input>
            <a-select
              :disabled="isCheck"
              class="regular-bordered"
              style="width:80px"
              @select="handleSelectFrequency"
              v-model="form.frequency"
              placeholder="请选择更新方式"
            >
              <a-select-option :value="0">分钟</a-select-option>
              <a-select-option :value="1">小时</a-select-option>
              <a-select-option :value="2">天</a-select-option>
              <a-select-option :value="3">周</a-select-option>
              <a-select-option :value="4">月</a-select-option>
            </a-select>
            <span>&nbsp;执行一次</span>
          </div>
        </a-form-model-item>
        <a-form-model-item label="开始时间" prop="gmtStart">
          <a-date-picker
            :disabled="isCheck"
            style="width:100%"
            show-time
            v-model="form.gmtStart"
            :disabled-date="disabledStartDate"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始时间"
          ></a-date-picker>
        </a-form-model-item>
        <a-form-model-item class="form-not-required" label="结束时间" prop="gmtEnd">
          <a-date-picker
            :disabled="isCheck"
            style="width:100%"
            show-time
            v-model="form.gmtEnd"
            :disabled-date="disabledEndDate"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择结束时间"
          ></a-date-picker>
        </a-form-model-item>
      </a-form-model>
      <a-table
        v-if="!single"
        row-key="target"
        size="small"
        :loading="tableLoading"
        :columns="columns"
        :data-source="increaseList"
      >
        <template #extractType="list, record, index">
          <a-select
            :disabled="isCheck"
            style="width: 150px"
            v-model="record.extractType"
            placeholder="请选择方式"
            @change="handleSelectExtractType($event, record)"
          >
            <a-select-option :value="0">全量更新</a-select-option>
            <!-- 自定义表, 不是抽取成功状态, 没有增量字段, 大数据表暂时不支持增量更新 -->
            <a-select-option
              :value="1"
              :disabled="tableType === 1 ||
              isIncreasableTable(record) ||
              isLargeData(record.target)"
            >增量更新</a-select-option>
          </a-select>
        </template>
        <template #fieldList="list, record, index">
          <a-select
            :disabled="isCheck"
            v-if="record.extractType === 1"
            :value="record.incrementalColumn"
            style="width: 150px"
            :default-value="list[0].name"
            placeholder="请选择字段"
            @change="handleSelectIncreaseFieldBatch($event, record)"
          >
            <a-select-option
              v-for="item in list"
              :key="item.name"
              :value="item.name"
            >{{ item.name }}</a-select-option>
          </a-select>
        </template>
      </a-table>
    </a-spin>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'

const columns = [
  {
    title: '表名',
    dataIndex: 'targetName',
    ellipsis: true,
    width: 200
  },
  {
    title: '抽取方式',
    dataIndex: 'extractType',
    scopedSlots: { customRender: 'extractType' }
  },
  {
    title: '增量字段',
    dataIndex: 'fieldList',
    scopedSlots: { customRender: 'fieldList' }
  }
]

export default {
  name: 'regularSetting',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    hasChangeData: {
      // 字段有变动的表
      type: Boolean,
      default: false
    },
    isCheck: {
      type: Boolean,
      default: false
    },
    largeData: Array, // 有大数据量的表
    regData: Array, // 编辑的任务
    rows: [Array],
    allTable: Array, // 当前库的所有表
    tableType: Number // 0 原表, 1 自定义表
  },
  data() {
    return {
      bodyStyle: { maxHeight: 'calc(100vh - 240px)', 'overflow-y': 'auto' },
      spinning: false,
      loading: false,
      tableLoading: false,
      form: {
        extractType: 0,
        incrementalColumn: undefined,
        incrementalType: '',
        name: undefined,
        repeat: undefined,
        interval: undefined,
        frequency: 0,
        gmtStart: undefined,
        gmtEnd: undefined
      },
      increaseList: [],
      errorState: 0, // 0.通过 1.小于系统时间 2.大于结束时间
      increaseColRules: [{ required: true, message: '请选择增量字段' }],
      regRules: {
        name: [
          { required: true, message: '请输入任务名称' },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '请输入1-20个字符的任务名称'
          }
        ],
        repeat: [{ required: true, message: '请选择更新方式' }],
        gmtStart: [
          { required: true, message: '请选择开始时间' },
          {
            validator: this.gmtStartValidator,
            trigger: 'change'
          }
        ],
        gmtEnd: [
          {
            validator: this.gmtEndValidator,
            trigger: 'change'
          }
        ]
      },
      intervalRules: [
        { required: true, message: '请填写频率' },
        {
          validator: this.intervalValidator,
          trigger: 'change'
        }
      ],
      columns
    }
  },
  computed: {
    ...mapState({
      modelName: (state) => state.dataAccess.modelName,
      modelType: (state) => state.dataAccess.modelType,
      modelId: (state) => state.dataAccess.modelId
    }),
    single() {
      return this.rows.length === 1
    },
    // 表单, 是否禁止选择增量字段(只针对单表操作的情况做控制)
    disabledIncrease() {
      if (!this.single) return false
      return this.isCheck || this.tableType === 1 || this.largeData.length > 0 || this.rows[0].extractStatus !== 2
    }
  },
  watch: {
    show(newValue, oldValue) {
      // 获取增量字段
      if (newValue) {
        // 判断是否新增, 有id为编辑, 先获取详情
        if (this.regData.length > 0) {
          this.handleGetRegularInfo()
        } else {
          let idList = this.rows.map((item) => item.id)
          this.handleGetIncreaseList(idList)
        }

        // 判断是否为大数据量的表
        if (this.largeData.length > 0) {
          this.$message.info(
            '当前选择抽取的表数据量过多，请延长间隔时间，推荐您至少6小时抽取一次'
          )
        }
      } else {
        this.increaseList = []
      }
    }
  },
  filters: {
    toMomentObj: function (value) {
      return value ? moment(value, 'YYYY-MM-DD HH:mm:ss') : null
    }
  },
  methods: {
    isLargeData(id) {
      return this.largeData.some((item) => item.tableId === id)
    },
    disabledStartDate(date) {
      return date && date < moment().subtract(1, 'days')
    },
    disabledEndDate(date) {
      let time = this.form.gmtStart || ''
      // 如果开始时间在今天之前, 禁用从开始到今天的时间段
      if (time && +new Date(time) > +new Date()) {
        return (
          date && date < moment(time, 'YYYY-MM-DD HH:mm:ss').startOf('hour')
        )
      } else {
        return date && date < moment().subtract(1, 'days')
      }
    },
    // 批量时判断是否可以增量抽取
    isIncreasableTable(table) {
      const target = this.allTable.find(item => item.id === table.target)
      return target.extractStatus !== 2
    },
    handleGetIncreaseList(idList) {
      this.tableLoading = true
      this.$server.dataAccess
        .getIncreaseFields(idList)
        .then((res) => {
          if (res.code === 200) {
            // 编辑状态
            if (this.regData.length > 0) {
              this.increaseList = this.regData.map((item) => {
                return {
                  id: item.id,
                  name: item.name,
                  target: item.target,
                  targetName: item.tableName,
                  extractType: item.extractType,
                  incrementalType: item.incrementalType,
                  incrementalColumn: item.incrementalColumn,
                  fieldList: res.data[item.target] || []
                }
              })
            } else {
              // 新增状态
              this.increaseList = this.rows.map((item) => {
                return {
                  id: '',
                  name: '',
                  target: item.id,
                  targetName: item.name,
                  extractType: 0,
                  incrementalType: '',
                  incrementalColumn: undefined,
                  fieldList: res.data[item.id] || []
                }
              })
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    handleGetRegularInfo() {
      const form = {}
      for (const key in this.form) {
        // this.$set(this.form, key, this.regData[0][key])
        form[key] = this.regData[0][key]
      }
      this.$set(this, 'form', form)
      const idList = this.regData.map((item) => item.target)
      this.handleGetIncreaseList(idList)
    },
    intervalValidator(rule, value, callback) {
      if (/^[1-9]\d*$/.test(value)) {
        if (this.form.frequency === 0 && value * 1 < 30) {
          callback(new Error('间隔不得小于30分钟'))
        } else if (this.form.frequency === 0 && value * 1 >= 60) {
          callback(new Error('间隔不得大于或等于60分钟'))
        } else if (this.largeData.length > 0 && this.form.frequency === 0) {
          callback(new Error('当前所选表数据量较大, 间隔需大于或等于2小时'))
        } else if (
          this.largeData.length > 0 &&
          this.form.frequency === 1 &&
          value * 1 < 2
        ) {
          callback(new Error('当前所选表数据量较大, 间隔需大于或等于2小时'))
        } else if (this.form.frequency === 1 && value * 1 >= 24) {
          callback(new Error('间隔不得大于或等于24小时'))
        } else if (this.form.frequency === 2 && value * 1 >= 365) {
          callback(new Error('间隔不得大于或等于365'))
        } else if (this.form.frequency === 3 && value * 1 >= 52) {
          callback(new Error('间隔不得大于或等于52周'))
        } else if (this.form.frequency === 4 && value * 1 >= 12) {
          callback(new Error('间隔不得大于或等于12个月'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请填写正整数'))
      }
    },
    gmtStartValidator(rule, value, callback) {
      if (+new Date(value) < +new Date() + 60 * 1000) {
        // 编辑时, 当前重复执行的任务还未结束时, 不检验开始时间是否大于当前时间
        if (
          this.regData.length > 0 &&
          this.form.repeat === 1 &&
          (!this.form.gmtEnd || +new Date(this.form.gmtEnd) > +new Date())
        ) {
          callback()
        }
        this.errorState = 1
        callback(new Error('开始时间最早需设置在1分钟后'))
      } else if (
        value &&
        this.form.gmtEnd &&
        +new Date(this.form.gmtEnd) < +new Date(value)
      ) {
        this.errorState = 2
        callback(new Error('开始时间不能大于结束时间'))
      } else {
        this.errorState = 0
        callback()
      }
    },
    // 自定义结束时间校验
    gmtEndValidator(rule, value, callback) {
      if (!value && this.errorState === 2) {
        this.$refs.form.clearValidate('gmtStart')
      }
      if (value && +new Date(value) < +new Date(this.form.gmtStart)) {
        callback(new Error('结束时间不能小于开始时间'))
      } else {
        callback()
      }
    },
    handleSelectFrequency() {
      this.$refs.form.validateField('interval')
    },
    handleSelectExtractType(value, record) {
      // 初始值
      if (value === 1) {
        record.incrementalColumn = record.fieldList[0].name
        record.incrementalType = record.fieldList[0].incrementalType
      }
    },
    // 选中增量字段, 同时要赋值增量字段类型
    handleSelectIncreaseField(value) {
      this.form.incrementalType = this.increaseList[0].fieldList.find(
        (item) => item.name === value
      ).incrementalType
    },
    handleSelectIncreaseFieldBatch(value, record) {
      record.incrementalColumn = value
      record.incrementalType = record.fieldList.find(
        (item) => item.name === value
      ).incrementalType
    },
    resetForm() {
      this.form = Object.assign({}, this.$options.data().form)
    },
    handleClose() {
      this.resetForm()
      this.$refs.form.clearValidate()
      this.$emit('close')
    },
    async handleAsyncRegularInfo(type) {
      // 传参
      if (this.tableType === 0) {
        // 原表
        let paramList = []
        this.increaseList.map((item) => {
          const obj = {
            ...this.form,
            target: item.target,
            sourceId: this.modelId
          }
          if (item.id) {
            obj.id = item.id
          }
          // 批量时将form中的值替换成下面table的下拉框值
          if (!this.single) {
            obj.extractType = item.extractType
            obj.incrementalType = item.incrementalType
            obj.incrementalColumn = item.incrementalColumn
          }
          paramList.push(obj)
        })
        if (type === 'add') {
          return this.$server.dataAccess
            .addRegularInfo(paramList)
            .finally(() => {
              this.loading = false
            })
        } else if (type === 'update') {
          return this.$server.dataAccess
            .putRegularInfo(paramList)
            .finally(() => {
              this.loading = false
            })
        }
      } else if (this.tableType === 1) {
        // 自定义表
        let paramList = []
        this.increaseList.map((item) => {
          const obj = {
            ...this.form,
            target: item.target
          }
          if (item.id) {
            obj.id = item.id
          }
          paramList.push(obj)
        })
        if (type === 'add') {
          return this.$server.dataAccess
            .addCustomRegularInfo(paramList)
            .finally(() => {
              this.loading = false
            })
        } else if (type === 'update') {
          return this.$server.dataAccess
            .putCustomRegularInfo(paramList)
            .finally(() => {
              this.loading = false
            })
        }
      }
    },
    handleOk() {
      this.$refs.form.validate(async (ok, obj) => {
        if (ok) {
          this.loading = true
          let res
          if (this.regData.length > 0) {
            res = await this.handleAsyncRegularInfo('update')
          } else {
            res = await this.handleAsyncRegularInfo('add')
          }
          if (res.code === 200) {
            this.$message.success('保存成功')
            if (this.regData.length > 0) {
              this.$emit('updateData', res.data)
            } else {
              if (this.single) {
                this.$emit('insertData', res.data)
              }
            }
            this.handleClose()
          } else {
            this.$message.error(res.msg)
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .regular-bordered .ant-select-selection {
  border-color: #d9d9d9;
}
@{deep} .regular-bordered .ant-select-arrow {
  color: #d9d9d9;
}
@{deep} .ant-form-item-label {
  width: 100px !important;
}
</style>
