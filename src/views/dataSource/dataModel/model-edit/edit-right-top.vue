<template>
  <div
    class="m-dml-map m-map"
    ref="mapRef"
    @dragenter.prevent.stop="handleMapDragEnter"
    @dragover.prevent.stop
    @drop.stop="handleMapDrop"
  >
    <a-empty v-if="renderTables.length === 0" class="main-empty">
      <span slot="description">暂无数据</span>
    </a-empty>
    <template v-else>
      <tree-node
        v-for="(item, index) in renderTables"
        :key="index"
        :node-data="item"
        :data-index="index"
        :detailInfo="detailInfo"
        :errorTables="errorTables"
      ></tree-node>
    </template>
  </div>
</template>
<script>
import { Utils, Node, conversionTree } from '../util'
import { mapState } from 'vuex'
import TreeNode from './tree-node'
import groupBy from 'lodash/groupBy'
export default {
  name: 'edit-right-top',
  inject: ['nodeStatus'],
  components: {
    TreeNode
  },
  props: ['detailInfo'],
  data() {
    return {
      isTree: true,
      info: '',
      renderTables: [], // 用来渲染树组件
      errorTables: [] // 接受错误的tableNo
    }
  },
  created() {
    // this.modelId = this.$route.query.modelId || this.$store.state.dataModel.modelId
  },
  mounted() {
  },
  computed: {
    ...mapState({
      // modelId: state => state.dataModel.modelId,
      databaseId: state => state.dataModel.databaseId
    }),
    modelId() {
      return this.$route.query.modelId || this.$store.state.dataModel.addModelId
    }
  },
  watch: {
    detailInfo: {
      handler: function(v) {
        if (v) {
          this.info = v
          this.handleDetailWithRoot()
        }
      },
      deep: false
    }
  },
  methods: {
    handleClearRenderTables() {
      this.renderTables = []
      this.errorTables = []
      this.detailInfo.config.tables = []
      this.detailInfo.pivotSchema.dimensions = []
      this.detailInfo.pivotSchema.measures = []
      this.$parent.cacheDimensions = []
      this.$parent.cacheMeasures = []
      this.$parent.handleDimensions()
      this.$parent.handleMeasures()
    },
    /**
     * 处理树形组件
    */
    handleDetailWithRoot() {
      if (this.info.config.tables.length === 0) return
      this.renderTables = []
      const first = this.info.config.tables[0]
      const root = new Node(first)
      const node = this.handleConversionTree(root)
      this.renderTables.push(node)
    },
        /**
     * 转换数据
    */
    handleConversionTree(node) {
      conversionTree(node, this.info.config.tables.slice(1), 'tableNo')
      return node
    },
    handleMapAddClass() {
      Utils.addClass(this.$refs.mapRef, 'm-map-hover')
    },
    handleMapRemoveClass() {
      Utils.removeClass(this.$refs.mapRef, 'm-map-hover')
    },
    handleMapDragEnter(event) {
      event.preventDefault()
      this.handleMapAddClass()
    },
    handleMapDrop(event) {
      if (this.nodeStatus.dragType === 'node') return
      Utils.removeClass(this.$refs.mapRef, 'map-hover')
      this.handleDealWithNode()
    },
    handleDealWithNode(key = 'children') {
      const tables = this.detailInfo.config.tables
      let len = tables.length
      let node = this.nodeStatus.dragNode
      node.tableNo = tables.length + 1
      if (len === 0) {
        this.generateRoot(node)
      } else {
        this.loopCurrentAddNode(this.renderTables, node, key)
      }
    },
    async generateRoot(node) {
      const getNode = await this.handleGetSingleTableInfo({
        tableId: node.tableId,
        datamodelId: this.modelId
      })

      const renderNode = new Node(getNode)
      await this.handleUpdate({
        tables: [renderNode.getProps()]
      })
      this.renderTables.push(renderNode)
    },
    async loopCurrentAddNode(arry, node, key) {
      let current = arry[0]
      if (!Utils.isType(current, 'Object')) {
        return
      }

      if (current.hasOwnProperty(key)) {
        if (current[key].length === 0) {
          const getNode = await this.getJoin(current, node)
          const renderNode = new Node(getNode)
          current.add(renderNode)
          await this.handleUpdate({
            tables: this.detailInfo.config.tables
          })
        } else {
          this.loopCurrentAddNode(current[key], node, key)
        }
      }
    },
    /**
     *@param left 左边数据
     *@param right 右边数据
     *@param type 类型：1 表示新增 0表示节点拖动
     */
    async getJoin(left, right, type = 1) {
      const result = await this.$server.dataModel.getSingleTableInfoWithJoin({
        databaseId: this.databaseId,
        datamodelId: this.detailInfo.id,
        isAddTable: type,
        left: left.getProps(),
        right: Object.assign(right, {
          leftTableId: left.getProps().tableNo,
          datamodelId: this.detailInfo.id
        })
      })
      if (result.code === 200) {
        if (type === 1) {
          // 如果是新增才处理维度度量
          this.detailInfo.config.tables.push(result.data.table)
        }
        return result.data.table
      } else {
        this.$message.error(result.msg)
      }
    },
    async handleUpdate(params) {
      // const result = await this.$server.dataModel.getPivotschemaByTables(params)
      const result = await this.$server.dataModel.getDataModelTableInfoAndPivotshchemaInfo(params)

      if (result.code === 200) {
        this.detailInfo.config = result.data.config
        this.detailInfo.pivotSchema = result.data.pivotSchema
        this.$parent.handleDimensions()
        this.$parent.handleMeasures()
      } else {
        this.$message.error(result.msg)
      }
    },
    async handleGetSingleTableInfo(params) {
      const result = await this.$server.dataModel.getSingleTableInfo(params)
      if (result && result.code === 200) {
        this.doWithResult(result.data.table, result.data.dimensions, result.data.measures)
        return result.data.table
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    doWithResult(table, dimensions = [], measures = []) {
      this.detailInfo.config.tables.push(table)
      this.detailInfo.pivotSchema.dimensions = [...this.detailInfo.pivotSchema.dimensions, ...dimensions]
      this.detailInfo.pivotSchema.measures = [...this.detailInfo.pivotSchema.measures, ...measures]
      this.$parent.handleDimensions()
      this.$parent.handleMeasures()
    }
  }
}
</script>
<style lang="stylus" scoped>
.m-map {
    position: relative;
    box-sizing: border-box;
    padding: 14px 21px;
    height: 100%;
    width: 100%;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    border: 1px solid transparent;
}
.m-map-hover {
    border-color: #90b9e8;
}
</style>
