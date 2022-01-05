<template>
  <div class="model-main">
    <a-empty v-if="!modelId || modelId === -1" class="main-empty">
      <span slot="description">请新建模型或者选中左侧模型</span>
    </a-empty>
    <template v-else>
      <a-spin class="main-box" :spinning="spinning">
        <div class="header">
          <span class="data_con">{{ modelName }}</span>
          <div class="data_btn">
            <a-button v-if="hasEditPermission" type="primary" v-on:click="edit">编辑模型</a-button>
            <a-button @click="handleGetData">刷新数据</a-button>
          </div>
        </div>
        <div class="scrollable scrollbar">
          <div class="description">
            <span class="d-s" :title="detailInfo.description">描述：{{ detailInfo.description }}</span>
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
                  title="alias"
                ></tree-node>
              </template>
            </div>
          </div>
          <div class="detail">
            <div class="detail_header">
              <span>数据模型详情</span>
              <div class="detail_btn">
                <a-checkbox :checked="Boolean(+detailInfo.isDuplicate)" disabled style="margin-top: 5px">
                  数据去重
                </a-checkbox>
                <a-button v-on:click="openModal()" :disabled="disableByDetailInfo">查看宽表</a-button>
              </div>
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
                          <div class="name" :class="{ 'line-through': !item.visible }">
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
                          <div class="name" :class="{ 'line-through': !item.visible }">
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
    <CheckTable v-if="detailInfo" :is-show="visible" :detailInfo="detailInfo" @close="visible = false" />
  </div>
</template>

<script>
import TreeNode from './show-tree-node';
import CheckTable from '../../model-edit/setting/check-table';
import { Node, conversionTree } from '../../util';
import { hasPermission } from '@/utils/permission';
import { mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
export default {
  name: 'model-main',
  components: {
    TreeNode,
    CheckTable,
  },
  data() {
    return {
      NUMBER_LIST: ['Int64', 'Float64', 'Decimal64(2)'],
      spinning: false, // 获取数据loading
      visible: false,
      detailInfo: '', // 详情信息
      tablesEmpty: false, // 是否表为空
      dimensions: [], // 维度
      measures: [], // 度量
      cacheDimensions: [],
      cacheMeasures: [],
      renderTables: [], // 用来渲染树组件
      dimensionsActiveKey: [],
      measuresActiveKey: [],
      customStyle: 'border: 0',
    };
  },
  computed: {
    ...mapState({
      modelId: state => state.dataModel.modelId,
      modelName: state => state.dataModel.modelName,
      privileges: state => state.common.privileges,
      menuSelectId: state => state.common.menuSelectId,
      datasourceId: state => state.dataModel.datasourceId,
    }),
    hasEditPermission() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.edit);
    },
    disableByDetailInfo() {
      if (this.detailInfo === '') {
        return true;
      }

      return this.detailInfo.config.tables && this.detailInfo.config.tables.length === 0;
    },
  },
  methods: {
    /**
     * 合并维度度量数据
     */
    handleConcat() {
      return {
        dimensions: [...this.cacheDimensions, ...this.detailInfo.pivotSchema.dimensions],
        measures: [...this.cacheMeasures, ...this.detailInfo.pivotSchema.measures],
      };
    },
    handlePeelCustom(list, cache) {
      if (list && list.length) {
        return list.filter(item => {
          if (item.tableNo === 0) {
            cache.push(item);
          } else {
            return item;
          }
        });
      }
      return list;
    },
    /**
     * 获取数据
     */
    async handleGetData(id) {
      if (!id) {
        return;
      }
      this.spinning = true;
      this.renderTables = [];
      this.cacheDimensions = [];
      this.cacheMeasures = [];
      let modelId = '';
      if (typeof id === 'string') {
        modelId = id;
      } else {
        modelId = this.modelId;
      }
      if (!this.modelId || this.modelId === -1) return;
      const result = await this.$server.dataModel.getDataModelDetailInfo(modelId).finally(() => {
        this.spinning = false;
      });

      if (result.code === 200) {
        this.$message.success('获取数据成功');
        this.detailInfo = result.data;
        this.$store.commit('dataModel/SET_MODELNAME', result.data.name);
        this.$store.commit('common/SET_PRIVILEGES', result.data.privileges || []);
        this.handleDetailWithRoot();
        this.handleDimensions();
        this.handleMeasures();
        this.handleFilterSort();
        this.handleGroupField();
        // 将自定义维度度量剥离处理
        this.detailInfo.pivotSchema.dimensions = this.handlePeelCustom(
          this.detailInfo.pivotSchema.dimensions,
          this.cacheDimensions,
        );
        this.detailInfo.pivotSchema.measures = this.handlePeelCustom(
          this.detailInfo.pivotSchema.measures,
          this.cacheMeasures,
        );
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * 编辑时根据modelId获取数据源
     */
    async handleGetDataSource() {
      // 第一个数据库id
      const datsource = await this.$server.dataModel.getDataSourceList(this.modelId);
      console.log('根据modelId获取数据源', datsource);
      const data = datsource.data[0];
      const datasourceId = data ? data.datasourceId : '';
      this.$store.dispatch('dataModel/setDatasourceId', datasourceId);
      return datasourceId;
    },
    // 打开模态框
    openModal() {
      this.visible = true;
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
            modelId: this.modelId,
          },
        });
      });
    },
    /**
     * 处理树形组件
     */
    handleDetailWithRoot() {
      if (this.detailInfo.config.tables.length === 0) {
        this.tablesEmpty = true;
        return;
      }
      this.tablesEmpty = false;
      const first = this.detailInfo.config.tables[0];
      const root = new Node(first);
      const node = this.handleConversionTree(root);
      this.renderTables.push(node);
    },
    /**
     * 转换数据
     */
    handleConversionTree(node) {
      conversionTree(node, this.detailInfo.config.tables.slice(1), 'tableNo');
      return node;
    },
    /**
     * 维度数据处理
     */
    handleDimensions() {
      this.dimensions = groupBy(this.detailInfo.pivotSchema.dimensions, 'tableNo');
      this.dimensionsActiveKey = [].concat(keys(this.dimensions));
    },
    /**
     * 度量数据处理
     */
    handleMeasures() {
      this.measures = groupBy(this.detailInfo.pivotSchema.measures, 'tableNo');
      this.measuresActiveKey = [].concat(keys(this.measures));
    },
    // 判断字段是否为数值类型
    isNumber(data) {
      return this.NUMBER_LIST.includes(data.convertType || data.dataType);
    },
    /**
     * 表格变更时, 处理筛选排序的列表
     */
    handleFilterSort() {
      const tables = this.detailInfo.config.tables;
      if (Array.isArray(tables)) {
        const { filterRules, sortRules } = this.detailInfo.modelPivotschemaRule;
        const { dimensions, measures } = this.detailInfo.pivotSchema;
        const fieldList = []
          .concat(dimensions)
          .concat(measures)
          .concat(this.cacheDimensions)
          .concat(this.cacheMeasures);

        if (sortRules.length > 0) {
          const result = [];
          sortRules.forEach(item => {
            const field = fieldList.find(f => f.id === item.pivotschemaId);
            if (field) {
              if (field.visible === false) {
                // visible为false(不可见)字段要置灰
                item.status = 2;
              } else {
                item.status = 0;
              }
              result.push(item);
            }
          });
          // 重置order顺序
          this.detailInfo.modelPivotschemaRule.sortRules = result.map((item, index) => {
            item.displayOrder = index + 1;
            return item;
          });
        }
        if (filterRules.length > 0) {
          const result = [];
          filterRules.forEach(item => {
            const field = fieldList.find(f => f.id === item.pivotschemaId);
            if (field) {
              if (field.visible === false) {
                // visible为false(不可见)字段要置灰
                item.status = 2;
              } else if (this.isNumber(item) !== this.isNumber(field)) {
                // 字段类型修改, 数值->非数值 or 非数值->数值, 需标黄
                item.status = 3;
              } else {
                item.status = 0;
              }
              result.push(item);
            }
          });
          this.detailInfo.modelPivotschemaRule.filterRules = result;
        }
      }
    },
    /**
     * 字段变更时, 处理分了组的指定聚合, 把删掉的字段去掉
     */
    handleGroupField() {
      const { dimensions, measures } = this.detailInfo.pivotSchema;
      const fieldList = [].concat(dimensions).concat(measures).concat(this.cacheDimensions).concat(this.cacheMeasures);
      const groupList = fieldList.filter(item => item.isGroupFlag === 2);
      groupList.forEach(field => {
        // 制定聚合
        let rawExpr = [];
        try {
          rawExpr = JSON.parse(field.raw_expr);
        } catch (error) {
          console.log(error);
        }
        // 分组的字段数组, 要清除被删除的字段
        const idList = [];
        const list = rawExpr.checkedList.filter(item =>
          fieldList.some(p => {
            if (`$$${p.id}` === item) {
              idList.push(`$$${p.id}`);
              return true;
            } else {
              return false;
            }
          }),
        );
        rawExpr.checkedList = list;
        field.raw_expr = JSON.stringify(rawExpr);
        field.groupByFunc = `group by (${idList.toString()})`;

        // let rawExpr = []
        // if (typeof field.raw_expr === 'string') {
        //   rawExpr = field.raw_expr.slice(1, -1).split(', ')
        // } else if (Array.isArray(field.raw_expr)) {
        //   rawExpr = field.raw_expr
        // }
        // const list = rawExpr.filter(item => fieldList.some(p => `$$${p.id}` === item))
        // field.raw_expr = list
        // field.groupByFunc = `group by (${list.toString()})`

        if (list.length === 0) {
          field.isGroupFlag = 1;
        }
      });
    },
  },
};
</script>

<style lang="styl" scoped>
@import "./main.styl";
</style>
