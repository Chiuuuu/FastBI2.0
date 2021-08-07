<template>
  <div class="model-main">
    <a-empty v-if="menuSelectId === -1" class="main-empty">
      <span slot="description">请新建模型或者选中左侧模型</span>
    </a-empty>
    <template v-else>
      <a-spin class="main-box" :spinning="spinning">
        <div class="header">
          <span class="data_con">{{ modelName }}</span>
          <div class="data_btn">
            <a-button v-if="hasEditPermission" type="primary" v-on:click="edit"
              >编辑模型</a-button
            >
            <a-button @click="handleGetData">刷新数据</a-button>
          </div>
        </div>
        <div class="scrollable scrollbar">
          <div class="description">
            <span class="d-s" :title="detailInfo.description"
              >描述：{{ detailInfo.description }}</span
            >
          </div>
          <!-- <p class="tips"><a-icon theme="filled" type="exclamation-circle" style="margin-right: 2px;" />下方表显示红色表示表在数据源已被删除，请您删除此表。表显示黄色表示表中列字段发生了变动，请您重新构建表关联关系。</p> -->
          <div class="draw_board scrollbar">
            <div class="m-dml-map m-map">
              <a-empty v-if="tablesEmpty" class="main-empty">
                <span slot="description">暂无数据</span>
              </a-empty>
              <template v-else>
                <tree-node
                  v-for="(item, index) in renderTables"
                  :key="index"
                  :node-data="item"
                  title="name"
                ></tree-node>
              </template>
            </div>
          </div>
          <div class="detail">
            <div class="detail_header">
              <span>数据模型详情</span>
            </div>
            <div class="detail_main">
              <div class="dimensionality">
                <div class="dim_title">
                  <span class="dim_span">维度</span>
                </div>
                <div class="dim_menu scrollbar">
                  <a-collapse :bordered="false" v-model="dimensionsActiveKey">
                    <a-collapse-panel
                      v-for="(value, name) in dimensions"
                      :key="name"
                      :style="customStyle"
                      :header="value[0].tableName"
                    >
                      <div class="u-bitem" v-for="item in value" :key="item.id">
                        <div class="txt">
                          <div class="icon">
                            <img src="@/assets/images/icon_dimension.png" />
                          </div>
                          <div
                            class="name"
                            :class="{ 'line-through': !item.visible }"
                          >
                            {{ item.alias }}
                          </div>
                        </div>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
              </div>
              <div class="measurement">
                <div class="dim_title">
                  <span class="mea_span">度量</span>
                </div>
                <div class="mea_menu scrollbar">
                  <a-collapse :bordered="false" v-model="measuresActiveKey">
                    <a-collapse-panel
                      v-for="(value, name) in measures"
                      :key="name"
                      :style="customStyle"
                      :header="value[0].tableName"
                    >
                      <div class="u-bitem" v-for="item in value" :key="item.id">
                        <div class="txt">
                          <div class="icon">
                            <img src="@/assets/images/icon_measure.png" />
                          </div>
                          <div
                            class="name"
                            :class="{ 'line-through': !item.visible }"
                          >
                            {{ item.alias }}
                          </div>
                        </div>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </template>
  </div>
</template>

<script>
import TreeNode from './show-tree-node'
import { Node, conversionTree } from '../../util'
import { hasPermission } from '@/utils/permission'
import { mapState } from 'vuex'
import groupBy from 'lodash/groupBy'
import keys from 'lodash/keys'
export default {
  name: 'model-main',
  components: {
    TreeNode
  },
  data() {
    return {
      spinning: false, // 获取数据loading
      detailInfo: '', // 详情信息
      tablesEmpty: false, // 是否表为空
      dimensions: '', // 维度
      measures: '', // 度量
      renderTables: [], // 用来渲染树组件
      dimensionsActiveKey: [],
      measuresActiveKey: [],
      customStyle: 'border: 0'
    }
  },
  computed: {
    ...mapState({
      modelId: state => state.dataModel.modelId,
      modelName: state => state.dataModel.modelName,
      privileges: state => state.common.privileges,
      menuSelectId: state => state.common.menuSelectId,
      datasourceId: state => state.dataModel.datasourceId
    }),
    hasEditPermission() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.edit)
    }
  },
  methods: {
    /**
     * 获取数据
     */
    async handleGetData(id) {
      if (!id) {
        return
      }
      this.spinning = true
      this.renderTables = []
      let modelId = ''
      if (typeof id === 'string') {
        modelId = id
      } else {
        modelId = this.modelId
      }
      const result = await this.$server.dataModel
        .getDataModelDetailInfo(modelId)
        .finally(() => {
          this.spinning = false
        })

      if (result.code === 200) {
        this.$message.success('获取数据成功')
        this.detailInfo = result.data
        this.$store.commit('dataModel/SET_MODELNAME', result.data.name)
        this.$store.commit(
          'common/SET_PRIVILEGES',
          result.data.privileges || []
        )
        this.handleDetailWithRoot()
        this.handleDimensions()
        this.handleMeasures()
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 编辑时根据modelId获取数据源
     */
    async handleGetDataSource() {
      // 第一个数据库id
      const datsource = await this.$server.dataModel.getDataSourceList(
        this.modelId
      )
      console.log('根据modelId获取数据源', datsource)
      this.$store.dispatch(
        'dataModel/setDatasourceId',
        datsource.data[0].datasourceId
      )
      return datsource.data[0].datasourceId
    },
    /**
     * 跳转编辑状态
     */
    edit() {
      // this.$router.push({ path: `/dataSource/Model-Edit/${this.modelId}` })
      this.handleGetDataSource().then(id => {
        this.$router.push({
          name: 'modelEdit',
          query: {
            type: 'edit',
            datasourceId: id,
            modelId: this.modelId
          }
        })
      })
    },
    /**
     * 处理树形组件
     */
    handleDetailWithRoot() {
      if (this.detailInfo.config.tables.length === 0) {
        this.tablesEmpty = true
        return
      }
      this.tablesEmpty = false
      const first = this.detailInfo.config.tables[0]
      const root = new Node(first)
      const node = this.handleConversionTree(root)
      this.renderTables.push(node)
    },
    /**
     * 转换数据
     */
    handleConversionTree(node) {
      conversionTree(node, this.detailInfo.config.tables.slice(1), 'tableNo')
      return node
    },
    /**
     * 维度数据处理
     */
    handleDimensions() {
      this.dimensions = groupBy(
        this.detailInfo.pivotSchema.dimensions,
        'tableNo'
      )
      this.dimensionsActiveKey = [].concat(keys(this.dimensions))
    },
    /**
     * 度量数据处理
     */
    handleMeasures() {
      this.measures = groupBy(this.detailInfo.pivotSchema.measures, 'tableNo')
      this.measuresActiveKey = [].concat(keys(this.measures))
    }
  }
}
</script>

<style lang="styl" scoped>
@import "./main.styl";
</style>
