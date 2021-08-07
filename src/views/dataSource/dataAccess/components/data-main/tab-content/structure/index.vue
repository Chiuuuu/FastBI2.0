<template>
  <a-spin class="tab-panel" :spinning="verifying">
    <div class="search_bar">
      <a-radio-group v-if="showExtractBtn" class="search_radio" v-model="tableType" @change="handleTableTypeChange">
        <a-radio-button :value="0">原始表</a-radio-button>
        <a-radio-button :value="1">自定义表</a-radio-button>
      </a-radio-group>
      <a-row type="flex" align="middle">
        <a-col :span="6" style="padding-left:20px">
          <a-input :value="tableKeyword" @change="handleGetTableKeyword" placeholder="请输入表名">
            <a-icon slot="prefix" type="search" />
          </a-input>
        </a-col>
        <a-col :span="4" style="padding-left:10px">
          <a-select v-show="tableType === 0" style="width: 100%;" :value="database" @change="handleChangeDatabase">
            <a-select-option v-for="item in databaseList" :key="item.name" :value="item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="14">
          <a-row type="flex" justify="end" align="middle">
            <a-button type="primary" class="select_button" @click="() => handleGetTableList(pagination)" :loading="spinning">刷新数据</a-button>
            <a-button
              v-if="hasBtnPermissionEdit || hasBtnPermissionSchedule"
              v-show="showExtractBtn"
              type="primary"
              class="select_button"
              style="margin-left:10px;"
              @click="handleExtract"
              :loading="extractSping">立即抽取</a-button>
            <a-button
              v-if="tableType === 0 && hasBtnPermissionSchedule"
              v-show="showExtractBtn"
              type="primary"
              style="margin-left:10px;"
              @click="showSetting('batch')"
              class="select_button"
            >批量定时抽取</a-button>
            <a-dropdown v-if="['excel', 'csv'].indexOf(modelType) === -1" :trigger="['click']">
              <a-button type="primary" style="margin-left:10px;">更多<a-icon type="down" /></a-button>
              <a-menu slot="overlay">
                <a-menu-item>
                  <span @click="handleSyncTable">同步库表结构</span>
                </a-menu-item>
                <a-menu-item
                  v-if="tableType === 0 && hasBtnPermissionSchedule"
                  v-show="showExtractBtn">
                  <span @click="showExtractLog">定时抽取记录</span>
                </a-menu-item>
                <a-menu-item
                  v-if="tableType === 0 && hasBtnPermissionSchedule"
                  v-show="showExtractBtn">
                  <span @click="showSetting('batchList')">批量任务列表</span>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-row>
        </a-col>
      </a-row>
    </div>
    <div class="tab-scroll scrollbar">
      <a-table
        rowKey='id'
        :row-selection="rowSelection"
        :pagination="pagination"
        :columns="columns"
        :data-source="data"
        :loading="spinning"
        :scroll="{ y: 'calc(100vh - 440px)', x: 960 }"
        @change="handleChangeTable"
      >
        <span slot="name" slot-scope="text, record">
          <a @click="handleCheckTable($event, record.id)">{{ text }}</a>
        </span>
        <span slot="set" slot-scope="set">
          {{ set ? '是' : '否' }}
        </span>
        <span slot="extracted" slot-scope="extracted">
          {{ extracted ? '是' : '否' }}
        </span>
        <template slot="extractStatus" slot-scope="extractStatus">
          <span v-if="extractStatus === 0">未抽取</span>
          <span v-else-if="extractStatus === 1">抽取中</span>
          <span v-else-if="extractStatus === 2">抽取成功</span>
          <span v-else-if="extractStatus === 3">抽取失败</span>
          <span v-else>未抽取</span>
        </template>
        <span slot="config" slot-scope="row">
          <a v-on:click="setting(row)">{{row.set ? '字段编辑' : '字段设置' }}</a>
        </span>
        <span slot="regular" slot-scope="row">
          <a v-on:click="showSetting('single', row)">定时设置</a>
        </span>
      </a-table>
      <a-modal width="920px" title="定时抽取记录" :bodyStyle="bodyStyle" :visible="visible1" @cancel="handleCloseExtractLog">
        <a-table
          row-key="id"
          size="small"
          :columns="logColumns"
          :data-source="logData"
          :loading="modalSpin"
          :footer="null"
          :scroll="{ y: 'calc(100vh - 360px)' }"
        >
          <template #status="text">
            <span v-if="text === '0'">成功</span>
            <span v-else-if="text === '1'">失败</span>
            <div v-else-if="text === '2'">
              <span>正在抽取中</span>
              <!-- <a-progress :percent="row.progress" /> -->
            </div>
          </template>
          <template #cost="text">
            <span>{{ formatCost(text) }}</span>
          </template>
          <template #startTime="text">
            <span>{{ text | formatTime }}</span>
          </template>
        </a-table>
      </a-modal>
      <extract-setting
        ref="extract"
        :show="visible"
        :rows="clickRows"
        :database-id="databaseId"
        @close="closeRegularList"
        @setRegular="setRegular"
        @checkRegular="handleCheckRegularInfo" />
      <regular-setting
        ref="regular"
        :show="visible2"
        :rows="clickRows"
        :table-type="tableType"
        :reg-data="regData"
        :large-data="largeDataList"
        :has-change-data="hasChangeData"
        :is-check="isCheckRegular"
        :all-table="data"
        @insertData="data => $refs.extract && $refs.extract.regData.push(data)"
        @updateData="data => $refs.extract && $refs.extract.updateRows(data)"
        @close="closeRegular" />
      <table-info
        :table-id="checkTableId"
        :show="visible3"
        @close="visible3 = false"
      />
    </div>
  </a-spin>
</template>
<script>
import { mapState } from 'vuex'
import RegularSetting from './regular'
import ExtractSetting from './extract'
import TableInfo from './table-info'
import moment from 'moment'
import { checkActionPermission, hasPermission } from '@/utils/permission'
import debounce from 'lodash/debounce'
const logColumns = [
  {
    title: '抽取任务名称',
    align: 'center',
    ellipsis: true,
    width: 150,
    dataIndex: 'taskName'
  },
  {
    title: '表名',
    align: 'center',
    ellipsis: true,
    width: 200,
    dataIndex: 'tableName'
  },
  {
    title: '抽取开始时间',
    align: 'center',
    width: 150,
    dataIndex: 'startTime',
    scopedSlots: { customRender: 'startTime' }
  },
  {
    title: '耗时',
    align: 'center',
    width: 80,
    dataIndex: 'cost',
    scopedSlots: { customRender: 'cost' }
  },
  {
    title: '状态',
    align: 'center',
    width: 100,
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  // {
  //   title: '报错信息',
  //   align: 'center',
  //   dataIndex: 'errMsg'
  // },
  {
    title: '关联表同步数量',
    width: 120,
    align: 'center',
    dataIndex: 'relateTableNum'
  }
]

export default {
  name: 'tabContentStructure',
  components: {
    RegularSetting,
    ExtractSetting,
    TableInfo
  },
  data() {
    return {
      // hasBtnPermission: false,
      columns: [],
      data: [],
      pagination: {
        current: 1,
        pageSize: 30,
        total: 0
      },
      databaseList: [],
      database: '', // 当前数据库名
      databaseId: '', // 当前数据库id
      verifying: false,
      isCheckRegular: false, // 是否为查看状态(定时任务详情)
      regData: [], // 定时任务详情
      largeDataList: [], // 所选表是否含有大量数据
      hasChangeData: false, // 所选表是否有字段变动
      tableKeyword: '',
      logColumns,
      logData: [],
      bodyStyle: { 'maxHeight': 'calc(100vh - 240px)', 'overflow-y': 'auto' },
      tableType: 0,
      visible: false, // 批量设置定时弹窗
      visible1: false, // 抽取记录弹窗
      visible2: false, // 添加定时任务弹窗
      visible3: false, // 查看表信息
      extractForm: '',
      spinning: false,
      selectedRows: [],
      selectedRowKeys: [],
      extractSping: false,
      modalSpin: false,
      clickRows: [],
      checkTableId: '' // 查看数据的表id
    }
  },
  computed: {
    ...mapState({
      formInfo: state => state.dataAccess.modelInfo,
      modelId: state => state.dataAccess.modelId,
      databaseName: state => state.dataAccess.databaseName,
      modelInfo: state => state.dataAccess.modelInfo,
      modelName: state => state.dataAccess.modelName,
      modelType: state => state.dataAccess.modelType,
      privileges: state => state.common.privileges,
      showExtractBtn: state => [ 'mysql', 'oracle', 'hive' ].indexOf(state.dataAccess.modelType) > -1
    }),
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
    },
    hasBtnPermissionEdit() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.edit)
    },
    hasBtnPermissionExtract() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.extract)
    },
    hasBtnPermissionSchedule() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.schedule)
    }
  },
  filters: {
    formatTime(v) {
      return moment(v).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  methods: {
    formatCost(v, notCapital) {
      if (v === 0) {
        return notCapital ? '' : '0s'
      } else if (v < 60) {
        return v + 's'
      } else if (v < 3600 && v >= 60) {
        let min = Math.floor(v / 60)
        return `${min}min${this.formatCost(v % 60, true)}`
      } else if (v >= 3600) {
        let h = Math.floor(v / 3600)
        return `${h}h${this.formatCost(v % 3600, true)}`
      }
    },
    handleTableTypeChange(event) {
      this.handleGetTableList()
    },
    // 同步库库表结构
    async handleSyncTable() {
      this.spinning = true
      const result = await this.$server.dataAccess.actionSyncTable(this.modelId, this.databaseId)
        .finally(() => {
          this.spinning = false
        })

      if (result.code === 200) {
        this.$message.success('同步库表成功')
        this.handleGetTableList()
      } else {
        this.$message.error(result.msg)
      }
    },
    handleGetTableKeyword: debounce(function(e) {
      this.tableKeyword = e.target.value.trim()
      this.selectedRowKeys = []
      this.selectedRows = []
      this.handleGetTableList()
    }, 400),
    handleChangeDatabase(value) {
      this.database = value
      this.$store.commit('dataAccess/SET_DATABASENAME', value)
      this.handleGetTableList()
    },
    async handleGetDatabaseList() {
      const result = await this.$server.dataAccess.getDatabaseList({
        datasourceId: this.modelId
      })
      if (result.code === 200) {
        this.databaseList = [].concat(result.rows)
        if (this.databaseName) {
          this.database = this.databaseName
        } else {
          this.database = this.formInfo ? this.formInfo.databaseName : ''
        }
      } else {
        this.databaseList = []
        this.$message.error(result.msg)
      }
    },
    handleColumns() {
      // 定时权限决定表头是否显示
      const columns = [
        {
          title: '表名',
          dataIndex: 'name',
          ellipsis: true,
          width: 200,
          key: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '是否设置过字段',
          dataIndex: 'set',
          key: 'set',
          slots: { title: 'set' },
          scopedSlots: { customRender: 'set' }
        },
        {
          title: '是否抽取过',
          dataIndex: 'extracted',
          key: 'extracted',
          slots: { title: 'extracted' },
          scopedSlots: { customRender: 'extracted' }
        },
        {
          title: '抽取状态',
          dataIndex: 'extractStatus',
          key: 'extractStatus',
          slots: { title: 'extractStatus' },
          scopedSlots: { customRender: 'extractStatus' }
        },
        {
          title: '修改时间',
          key: 'gmtModified',
          width: 200,
          dataIndex: 'gmtModified'
        },
        {
          title: '字段配置',
          key: 'config',
          scopedSlots: { customRender: 'config' }
        },
        {
          title: '定时配置',
          key: 'regular',
          scopedSlots: { customRender: 'regular' }
        }
      ]

      if (!this.hasBtnPermissionSchedule || ['excel', 'csv'].indexOf(this.modelType) > -1) {
        columns.pop()
      }
      if (!this.hasBtnPermissionEdit) {
        columns.splice(5, 1)
      }
      this.columns = columns
    },
    handleChangeTable(pagination) {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.handleGetTableList(pagination)
    },
    async handleGetData(pagination) {
      if (!this.modelType) return
      await this.handleGetDatabaseList()
      this.handleGetTableList()
    },
    async handleGetTableList(pagination) {
      this.handleColumns()
      this.spinning = true
      let databaseName
      if (this.databaseName) {
        databaseName = this.databaseName
      } else {
        databaseName = this.formInfo ? this.formInfo.databaseName : ''
      }
      // sql, oracle的数据库名称在formInfo里, excel的在dabaseName里
      if (['excel', 'csv'].indexOf(this.modelType) > -1) {
        databaseName = this.databaseName
      }
      // 当前库组列表没有默认数据库(即没有权限)则不掉接口
      if (!databaseName) {
        this.spinning = false
        this.data = []
        this.$store.dispatch('dataAccess/setReadRows', this.data)
        this.pagination.total = 0
        this.pagination.current = 1
        return
      }

      // 获取数据库id
      const database = this.databaseList.find(item => item.name === databaseName)
      this.databaseId = database ? database.id : ''
      const params = {
        databaseName,
        databaseId: this.databaseId,
        keyword: this.tableKeyword,
        sourceId: this.modelId,
        tableType: this.tableType,
        pageSize: this.pagination.pageSize,
        current: pagination ? pagination.current : this.$options.data().pagination.current
      }
      const dabaseInfoResult = await this.$server.dataAccess.getTableList(params)
        .finally(() => {
          this.spinning = false
        })
      if (dabaseInfoResult.code === 200) {
        this.data = [].concat(dabaseInfoResult.rows)
        this.$store.dispatch('dataAccess/setReadRows', this.data)
        this.pagination.total = dabaseInfoResult.total
        this.pagination.current = params.current
      } else {
        this.data = []
        this.$message.error(dabaseInfoResult.msg)
      }
    },
    async handleCheckTable(e, id) {
      // 先不做表校验
      // const code = await this.handleVerifyTable(new Array(id))
      // if (code === 'hasDelete') return
      this.checkTableId = id
      this.visible3 = true
    },
    handleCloseExtractLog() {
      this.visible1 = false
      this.logData = []
    },
    /**
      52009, "在线获取当前数据表的数据失败"
      52017, "远程对应的原数据表不存在或已经被删"
      52018, "远程对应的原表字段不存在或已经被删"
      52019, "远程对应的原表字段已发生改变"
      52020, "远程对应的库表结构没有改变"
      52021, "远程对应的表字段较多,是宽表"
      52022, "远程对应的表的数据量较大"
     */
    handleTableInfo(infoList) {
      const changeList = []
      const deleteList = []
      const largeList = []
      let normalCnt = 0
      infoList.map(item => {
        const codeList = Object.keys(item.codeMsgMap)
        if (codeList.includes('52018') || codeList.includes('52019')) {
          changeList.push(item)
        } else if (codeList.includes('52017')) {
          deleteList.push(item)
        } else if (codeList.includes('52022')) {
          largeList.push(item)
        } else if (codeList.includes('52020')) {
          normalCnt++
        }
      })
      if (changeList.length > 0) { // 表字段发生变化
        this.hasChangeData = true
        return 'hasChange'
      } else if (deleteList.length > 0) { // 有表被删除, 直接拦截操作
        this.$message.error(h => h('span', { style: { textAlign: 'left' } }, deleteList.map(item => {
          return h('span', {}, [
            '表',
            h('span', {}, item.tableName),
            ':' + Object.values(item.codeMsgMap).join('、'),
            h('br')
          ])
        })), 5)
        return 'hasDelete'
      } else if (largeList.length > 0) { // 有大数据表, 则定时任务需至少间隔2小时
        this.largeDataList = largeList
        return 'hasLarge'
      } else if (infoList.length === normalCnt) { // 正常情况
        return 'normal'
      }
    },
    // 校验当前表数据变动
    async handleVerifyTable(ids) {
      this.verifying = true
      const result = await this.$server.dataAccess.actionVerifyTable(ids)
        .finally(() => {
          this.verifying = false
        })
      if (result.code === 200) {
        return this.handleTableInfo(result.data)
      } else {
        this.$message.error(result.msg)
        return 'error'
      }
    },
    // 抽取记录
    async showExtractLog() {
      if (this.data.length < 1) {
        return this.$message.error('当前数据库暂无数据')
      }
      this.visible1 = true
      this.modalSpin = true
      this.$server.dataAccess.getExtractLogList(this.data[0].id)
        .then(res => {
          if (res.code === 200) {
            this.logData = res.rows
          } else {
            this.$message.error(res.msg)
          }
        })
        .finally(() => {
          this.modalSpin = false
        })
    },
    async handleExtract() {
      if (this.selectedRows.length === 0) {
        return this.$message.error('请选择至少一项')
      } else if (this.selectedRows.length > 10) {
        return this.$message.error('一次抽取最多只能选择10个')
      }
      const code = await this.handleVerifyTable(this.selectedRows.map(item => item.id))
      if (code === 'hasDelete' || code === 'error') return
      // 源表抽取
      let result
      if (this.tableType === 0) {
        const rows = this.selectedRows.map(item => {
          const _item = {
            databaseName: this.database,
            sourceId: this.modelId,
            sourceName: this.modelName,
            tableId: item.id,
            tableName: item.name
          }
          return _item
        })
        this.extractSping = true
        result = await this.$server.dataAccess.actionExtract('/datasource/extract', {
          rows: rows,
          tableList: this.data
        }).finally(() => {
          this.extractSping = false
          this.handleGetTableList(this.pagination)
        })
      } else if (this.tableType === 1) { // 自定义表抽取
        this.extractSping = true
        result = await this.$server.dataAccess.actionCustomExtract(this.selectedRows.map(item => item.id)).finally(() => {
          this.extractSping = false
          this.handleGetTableList(this.pagination)
        })
      }
      if (result.code === 200) {
        // if (result.data) {
        //   if (result.data.length && result.data.length > 0 && result.data.length < this.selectedRows.length) {
        //     return this.$message.info(`抽取任务已下达 \n ${result.msg}`, 5)
        //   } else if (result.data.length && result.data.length > 0 && result.data.length === this.selectedRows.length) {
        //     return this.$message.error('所选表格不是orc格式, 无法抽取')
        //   } else {
        //     return this.$message.info(result.msg)
        //   }
        // }
        const errorList = result.msg.split('\\n')
        if (this.largeDataList.length > 0) {
          this.$message.info({
            content: h => h('div', [
              h('div', {}, '当前抽取的表数据量较多，耗时会更长，请您耐心等待'),
              errorList.map(item => h('div', {}, item))
            ]),
            icon: '抽取提示'
          })
          this.largeDataList = []
        } else {
          this.$message.info({
            content: h => h('div', errorList.map(item => h('div', {}, item))),
            icon: '抽取提示'
          })
        }
      } else {
        const errorList = result.msg.split('\\n')
        this.$message.error({
          content: h => h('div', errorList.map(item => h('div', {}, item))),
          icon: '抽取提示'
        })
      }
    },
    // 字段设置
    async setting(row) {
      this.$emit('on-change-componet', 'Setting', row)
    },
    // 显示定时任务
    async showSetting(type, row) {
      // 点击单张表的定时设置
      if (type === 'single') {
        this.clickRows = new Array(row)
        this.visible = true
      } else if (type === 'batch') { // 点击批量抽取按钮
        if (this.selectedRows.length < 2) {
          return this.$message.error('请选择至少2项')
        } else if (this.selectedRows.length > 10) {
          return this.$message.error('最多只能选择10项')
        }
        const code = await this.handleVerifyTable(this.selectedRows.map(item => item.id))
        if (code === 'hasDelete' || code === 'error') return
        this.clickRows = this.selectedRows
        this.visible2 = true
      } else if (type === 'batchList') { // 查看批量抽取记录
        if (this.data.length < 1) {
          return this.$message.error('当前数据库暂无数据')
        }
        this.clickRows = []
        this.visible = true
      }
    },
    // 关闭定时任务详情窗口
    closeRegular() {
      this.visible2 = false
      this.regData = []
      this.largeDataList = []
      this.hasChangeData = false
      this.isCheckRegular = false
    },
    // 关闭定时任务列表窗口
    closeRegularList() {
      this.visible = false
      this.largeDataList = []
      this.hasChangeData = false
      this.clickRows = []
    },
    // 获取定时任务详情(查看用)
    async handleCheckRegularInfo(data) {
      if (this.$refs.extract.modalSpin) this.$refs.extract.modalSpin = true
      const res = await this.$server.dataAccess.getRegularInfo(data.id, data.groupId)
        .catch(() => {
          if (this.$refs.extract.modalSpin) this.$refs.extract.modalSpin = false
        })
      if (res.code === 200) {
        this.visible2 = true
        this.isCheckRegular = true
        this.regData = res.data
      } else {
        this.$message.error(res.msg)
      }
    },
    // 获取定时任务详情(编辑用)
    async handleGetRegularInfo(data) {
      if (this.$refs.extract.modalSpin) this.$refs.extract.modalSpin = true
      const res = await this.$server.dataAccess.getRegularInfo(data.id, data.groupId)
        .catch(() => {
          if (this.$refs.extract.modalSpin) this.$refs.extract.modalSpin = false
        })
      if (res.code === 200) {
        // 校验当前表
        const code = await this.handleVerifyTable(res.data.map(item => item.target))
          .finally(() => {
            if (this.$refs.extract.modalSpin) this.$refs.extract.modalSpin = false
          })
        if (code === 'hasDelete' || code === 'error') {
          return code
        } else {
          this.regData = res.data
        }
      } else {
        this.$message.error(res.msg)
        if (this.$refs.extract.modalSpin) this.$refs.extract.modalSpin = false
      }
    },
    async setRegular(data) {
      // 有data, 则是编辑状态
      let code
      if (data) {
        code = await this.handleGetRegularInfo(data)
      } else {
        this.regData = []
        code = await this.handleVerifyTable(this.clickRows.map(item => item.id))
        if (this.$refs.extract) this.$refs.extract.modalSpin = false
      }
      if (code === 'hasDelete' || code === 'error') return
      this.visible2 = true
    }
  }
}
</script>
