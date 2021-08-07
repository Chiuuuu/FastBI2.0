<template>
  <a-modal
      :visible="visible"
      title="设置可见库组"
      :bodyStyle="bodyStyle"
      :maskClosable="false"
      @ok="handleOkTable"
      @cancel="handleClearTable"
    >
      <a-input-search v-model="tableSearchWord" placeholder="请输入搜索的库组名" enter-button="查询" />
      <a-tree
        :checkedKeys="searchTableKey"
        :tree-data="treeData"
        :replaceFields="{title: 'dbName', key: 'dbId'}"
        :expandedKeys="[currentSourceInfo.id || '']"
        :default-expand-all="true"
        :auto-expand-parent="true"
        :checkable="true"
        @check="onCheckTable"
      ></a-tree>
    </a-modal>
</template>

<script>
export default {
  inject: [
    'status',
    'getCurrentRoleTab'
  ],
  props: {
    visible: Boolean
  },
  data() {
    return {
      bodyStyle: { height: 'calc(100vh - 240px)', 'overflow-y': 'auto' },
      currentSourceInfo: {},
      tableSearchWord: '',
      checkedTables: [],
      tableData: []
    }
  },
  computed: {
    injectRoleTab() {
      return this.getCurrentRoleTab()
    },
    // 库组-树结构
    treeData() {
      if (!this.currentSourceInfo.id) return []
      return [
        {
          dbName: this.currentSourceInfo.title,
          dbId: this.currentSourceInfo.id,
          disabled: this.status === 'show',
          children: this.tableData.filter(
            (item) =>
              item.dbName
                .toLowerCase()
                .indexOf(this.tableSearchWord.toLowerCase()) > -1
          )
        }
      ]
    },
    // 库组-筛选后的selectKey
    searchTableKey() {
      if (this.treeData.length === 0) {
        return []
      } else if (this.checkedTables.indexOf(this.currentSourceInfo.id) > -1) {
        return [...new Set([this.currentSourceInfo.id].concat(this.tableData.map(item => item.dbId)))]
      } else {
        return this.checkedTables.filter((item) =>
          this.treeData[0].children.some((t) => t.dbId === item)
        )
      }
    }
  },
  methods: {
    async handleSetVisibleTable(sourceInfo) {
      this.$emit('update:visible', true)
      this.currentSourceInfo = sourceInfo
      const res = await this.$server.projectCenter.getRoleSourceTable({
        roleId: this.$store.state.projectRoles.roleId,
        refId: sourceInfo.id
      })
      if (res.code === 200) {
        this.tableData = res.rows.map(item => {
          if (this.status === 'show') {
            item.disabled = true
          }
          return item
        })
        // 初始化选中框
        this.checkedTables = sourceInfo.dataBasePri
      } else {
        this.$message.error(res.msg || '请求错误')
      }
    },
    // 库组模态框-选中表格
    onCheckTable(checkedKeys, { checked, node }) {
      const dbId = node.dataRef.dbId
      if (checked) {
        // 直接暴力合并去重
        const newList = this.checkedTables.concat(checkedKeys)
        this.checkedTables = [...new Set(newList)]
      } else {
        if (dbId === this.currentSourceInfo.id) {
          this.checkedTables.splice(0)
        } else {
          const index = this.checkedTables.indexOf(dbId)
          if (index > -1) {
            this.checkedTables.splice(index, 1)
            // 如果之前是全选状态, 还要把库id去掉
            const rootIndex = this.checkedTables.indexOf(this.currentSourceInfo.id)
            if (rootIndex > -1) {
              this.checkedTables.splice(rootIndex, 1)
            }
          }
        }
      }
    },
    // 库组模态框-确认
    handleOkTable() {
      if (
        this.checkedTables.some((item) => item.id === this.currentSourceInfo.id)
      ) {
        this.currentSourceInfo.dataBasePri = Array(this.currentSourceInfo.id)
        this.$emit('getTablePermi', this.injectRoleTab, this.currentSourceInfo)
      } else {
        this.currentSourceInfo.dataBasePri = this.checkedTables
        this.$emit('getTablePermi', this.injectRoleTab, this.currentSourceInfo)
      }
      this.$emit('update:visible', false)
    },
    // 库组模态框-关闭
    handleClearTable() {
      this.tableSearchWord = ''
      this.tableData = []
      this.checkedTables = []
      this.currentSourceInfo = {}
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>

</style>
