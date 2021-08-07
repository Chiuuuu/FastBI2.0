<template>
  <div class="main">
    <div class="right">
      <div class="header">
        <span class="data_con">{{
          modelType ? (modelName ? modelName : '未命名连接') : "请连接数据"
        }}</span>
        <span class="data_category" v-if="modelType"
          >（类型：{{ modelTypeShow }}）</span
        >
      </div>
      <div class="tab scrollbar">
        <a-tabs class="tabs" default-active-key="1" v-model="defaultTab" :wrapper-col="wrapperCol" @change="handleChangeTab">
          <a-tab-pane key="1" tab="连接信息">
            <tab-content-entry
              ref="entry"
              @on-set-table-name="handleSetTableName"
              ></tab-content-entry>
          </a-tab-pane>
          <a-tab-pane key="2" tab="库表结构" force-render :disabled="!tabChangeAble">
            <tab-content-structure v-on="$listeners" ref="structure" @hook:mounted="handleTT"></tab-content-structure>
          </a-tab-pane>
          <a-tab-pane key="3" tab="操作记录" :disabled="!tabChangeAble">
            <tab-content-record ref='record'></tab-content-record>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TabContentEntry from './tab-content/entry'
import TabContentStructure from './tab-content/structure'
import TabContentRecord from './tab-content/record'

export default {
  name: 'dataAccessMain',
  components: {
    TabContentEntry,
    TabContentStructure,
    TabContentRecord
  },
  props: ['tabindex'],
  data() {
    return {
      excel: false,
      visible: false,
      wrapperCol: { span: 14 },
      defaultTab: this.tabindex,
      formName: ''
    }
  },
  computed: {
    ...mapState({
      formInfo: state => state.dataAccess.modelInfo,
      modelType: state => state.dataAccess.modelType, // 数据类型
      isFileType(state) { // 数据类型是否是文件格式
        return ['execl', 'csv'].some(function(item) {
          return item === state.dataAccess.modelType
        })
      },
      modelTypeShow: state => {
        const type = state.dataAccess.modelType
        switch (type) {
          case 'mysql':
            return 'Mysql'
          case 'oracle':
            return 'Oracle'
          case 'hive':
            return 'Hadoop Hive'
          case 'excel':
            return 'Excel'
          case 'csv':
            return 'Csv'
        }
      },
      modelName: state => state.dataAccess.modelName,
      tabChangeAble: state => state.dataAccess.firstFinished // 是否完成第一部分
    })
  },
  created() {
    this.$EventBus.$on('set-tab-index', this.handleSetTab)
  },
  beforeDestroy() {
    this.$EventBus.$off('set-tab-index', this.handleSetTab)
  },
  methods: {
    /**
     * 设置表名称
    */
    handleSetTableName(name) {
      // this.$set(this.formInfo, 'name', name)
      this.$store.dispatch('dataAccess/setModelName', name)
    },
    handleSetTab(key) {
      this.defaultTab = key
    },
    handleTT() {
      if (this.defaultTab === '2') {
        this.$refs.structure.tableType = 0
        this.$refs.structure.handleGetData()
      }
    },
    /**
     * 选项卡
    */
    handleChangeTab(activeKey) {
      // this.$emit('on-change-componet')
      if (activeKey === '2') {
        this.$nextTick(() => {
          this.$refs.structure.tableKeyword = ''
          this.$refs.structure.handleGetData()
          // 切换tab清空所有选中项
          this.$refs.structure.selectedRows = []
          this.$refs.structure.selectedRowKeys = []
          this.$refs.structure.clickRows = []
        })
      } else if (activeKey === '3') {
        this.$nextTick(() => {
          this.$refs.record.form.keyword = ''
          this.$refs.record.handleGetData()
        })
      }
    },
    /**
     * 展示弹出
    */
    showModal() {
      this.visible = true
    }
  }
}
</script>

<style lang="styl" scope>
@import "./main.styl";
</style>
