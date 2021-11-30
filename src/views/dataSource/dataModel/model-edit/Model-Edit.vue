<template>
  <div class="Model-Edit">
    <div class="left">
      <div class="menu_title">
        <span>数据接入</span>
      </div>
      <!-- 临时方案, 不写class了 -->
      <div
        :title="datasourceName"
        style="
          width: calc(100% - 30px);
          color: #01040f;
          margin: 0 15px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        "
      >
        {{ datasourceName }}
      </div>
      <!-- <div class="selector"> -->
      <!-- <a-select default-value="银行账户" style="width: 94%;">
          <a-select-option value="SQL Server">
            SQL Server
          </a-select-option>
        </a-select> -->
      <!-- </div> -->
      <a-divider />
      <div class="menu_search">
        <span class="search_span">数据库</span>
      </div>
      <a-select v-model="databaseName" class="menu_select" @change="handleChangeDatabase">
        <a-select-option v-for="database in databaseList" :key="database.id" :value="database.name">
          {{ database.name }}
        </a-select-option>
      </a-select>
      <a-divider />
      <div class="table_list" :class="{ 'no-sql': !isDatabase }">
        <div class="menu_search">
          <span class="search_span">表</span>
          <a-input placeholder="请输入关键词搜索" :value="tableSearch" @change="handleSearchTable" class="search_input">
            <a-icon slot="prefix" type="search" />
          </a-input>
        </div>
        <edit-left
          ref="editLeftRef"
          :keywords="tableSearch"
          :list="tableSearchList"
          @on-left-drag-leave="handleLeftDragLeave"
        ></edit-left>
      </div>
      <!-- <a-divider /> -->
      <div v-if="isDatabase" class="SQL_View table_list">
        <div class="menu_search">
          <span class="search_span">自定义SQL视图</span>
          <a-icon class="view_icon" type="plus-square" @click="handleAddSQL('new')" />
        </div>
        <!-- <div class="text-center"> -->
        <edit-left
          ref="editSqlRef"
          type="sql"
          :list="rightMenuList"
          @on-left-drag-leave="handleLeftDragLeave"
          @edit="item => handleAddSQL('edit', item)"
          @delete="item => handleSQLDelete(item)"
        ></edit-left>
        <!-- </div> -->
        <!-- <div class="sheet_list">
          <a-dropdown class="sheet_list_item" :trigger="['contextmenu']">
            <div>
              银行账户
              </div>
            <a-menu slot="overlay">
              <a-menu-item v-on:click="check">
                查看表
              </a-menu-item>
              <a-menu-item @click="handleAddSQL('edit')">
                编辑
              </a-menu-item>
              <a-menu-item>
                删除
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div> -->
      </div>
    </div>
    <div class="right" ref="rightBody" :class="{ add_new: model === 'add' }">
      <div class="header" v-if="model === 'edit'">
        <span class="data_con">{{ detailInfo.name }}</span>
      </div>
      <div class="data_con_add" v-else-if="model === 'add'">
        <a-form :form="modelForm" :label-col="{ span: 3 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="数据模型名称">
            <a-input
              v-decorator="[
                'name',
                {
                  rules: [
                    {
                      required: true,
                      message: '请填写名称',
                    },
                    {
                      type: 'string',
                      min: 1,
                      max: 20,
                      message: '请输入1-20个字的名称',
                    },
                  ],
                },
              ]"
            />
          </a-form-item>
        </a-form>
      </div>
      <div class="description">
        <span class="d-s" :title="detailInfo.description">描述： {{ detailInfo.description }}</span>
        <a-icon type="edit" v-on:click="openModal('describe-setting')" class="d-s-icon" />
      </div>
      <p class="tips">
        <a-icon theme="filled" type="exclamation-circle" style="margin-right: 2px" />
        下方表显示红色表示表在数据源已被删除，请您删除此表。表显示黄色表示表中列字段发生了变动，请您重新构建表关联关系。
      </p>
      <div class="draw_board scrollbar">
        <edit-right-top ref="rightTopRef" :detailInfo="detailInfo"></edit-right-top>
      </div>
      <div class="detail scrollbar">
        <div class="detail_header">
          <span>
            数据模型详情
            <span class="sub">{{ createViewName ? `(已导入BI库-表名: ${createViewName})` : '' }}</span>
          </span>
          <div class="detail_btn">
            <a-checkbox
              :checked="Boolean(+detailInfo.isDuplicate)"
              :disabled="disableByDetailInfo"
              @change="e => $set(detailInfo, 'isDuplicate', +e.target.checked)"
              style="margin-top: 5px"
            >
              数据去重
            </a-checkbox>
            <a-button v-on:click="openModal('create-view')" :disabled="disableByDetailInfo || model === 'add'">
              导入BI库
            </a-button>
            <a-button v-on:click="openModal('check-table')" :disabled="disableByDetailInfo">查看宽表</a-button>
            <a-button v-on:click="openModal('batch-setting')" :disabled="disableByDetailInfo">批量编辑字段</a-button>
            <a-button v-on:click="openModal('field-filter-sort')" :disabled="disableByDetailInfo">筛选排序</a-button>
          </div>
        </div>
        <div class="detail_main">
          <div class="dimensionality">
            <div class="dim_title">
              <span class="dim_span">维度</span>
              <div class="dim_operation">
                <a v-on:click="handleOpenComputeSetting('维度')" style="color: #677cf7; line-height: 38px">
                  新建计算维度
                </a>
                <a-divider type="vertical" />
                <!-- <a v-on:click="openModal('geo-setting')" style="color:#677cf7;">设置地理位置</a> -->
              </div>
            </div>
            <div class="dim_menu scrollbar">
              <a-collapse :bordered="false" v-model="dimensionsActiveKey">
                <a-collapse-panel
                  v-for="(value, name) in dimensions"
                  :key="name"
                  :style="customStyle"
                  :header="value[0].tableName"
                >
                  <panel-item
                    v-for="item in value"
                    :key="item.alias"
                    className="dimensions"
                    :imgURI="DimensionsIcon"
                    :itemData="item"
                    :detail-info="detailInfo"
                    :contextmenus="handleComboContextmenus('dimensions')"
                  ></panel-item>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </div>
          <div class="measurement">
            <div class="mea_title">
              <span class="mea_span">度量</span>
              <div class="mea_operation">
                <a
                  v-on:click="handleOpenComputeSetting('度量')"
                  style="color: #677cf7; margin-right: 20px; line-height: 38px"
                >
                  新建计算度量
                </a>
              </div>
            </div>
            <div class="mea_menu scrollbar">
              <a-collapse :bordered="false" v-model="measuresActiveKey">
                <a-collapse-panel
                  v-for="(value, name) in measures"
                  :key="name"
                  :style="customStyle"
                  :header="value[0].tableName"
                >
                  <panel-item
                    v-for="item in value"
                    :key="item.alias"
                    className="measures"
                    :imgURI="MeasureIcon"
                    :itemData="item"
                    :detail-info="detailInfo"
                    :contextmenus="handleComboContextmenus('measures')"
                  ></panel-item>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </div>
        </div>
      </div>

      <!-- 动态弹窗组件 -->
      <component
        ref="componentRef"
        v-bind:is="modalName"
        :is-show="visible"
        :detailInfo="detailInfo"
        :compute-type="computeType"
        :tables="tableFields"
        :sql-form="sqlForm"
        :status="modalStatus"
        :description="detailInfo.description"
        :rename-data="panelData"
        :union-data="unionNode"
        @showGroupbyModal="openModal('field-aggregator')"
        @get-fetch-param="handleGetFetchParams"
        @close="close"
        @success="data => componentSuccess(data)"
        @handleSaveFilterSort="handleSaveFilterSort"
      />

      <div class="submit_btn">
        <!-- <a-button :disabled="!detailInfo">保存并新建报告</a-button> -->
        <a-button
          v-if="hasBtnPermissionSave"
          type="primary"
          @click="handleSave"
          :loading="spinning"
          :disabled="!detailInfo"
        >
          保 存
        </a-button>
        <a-button v-on:click="exit">退 出</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import findIndex from 'lodash/findIndex';
import { mapState } from 'vuex';
import EditLeft from './edit-left';
import EditRightTop from './edit-right-top';
import SqlSetting from './setting/sql-setting';
import CheckTable from './setting/check-table';
import DescribeSetting from './setting/describe-setting';
import BatchSetting from './setting/batch-setting';
import GeoSetting from './setting/geo-setting';
import ComputeSetting from './setting/compute-setting';
import RenameSetting from './setting/rename-setting';
import UnionSetting from './setting/union-setting';
import CreateView from './setting/create-view';
import PanelItem from './panel-item';
import FieldAggregator from './setting/field-handler/field-aggregator';
import FieldFilterSort from './setting/field-handler/field-filter-sort';
import { hasPermission } from '@/utils/permission';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import DimensionsIcon from '@/assets/images/icon_dimension.png';
import MeasureIcon from '@/assets/images/icon_measure.png';
import debounce from 'lodash/debounce';
// const setting = [
//   {
//     key: '1',
//     last_name: 'authorityEntityType'
//   }
// ]

export default {
  components: {
    EditLeft,
    EditRightTop,
    SqlSetting, // 添加SQL语句
    CheckTable, // 查看宽表
    DescribeSetting, // 设置描述
    BatchSetting, // 批量设置字段
    GeoSetting, // 设置地理位置
    ComputeSetting, // 设置维度度量
    RenameSetting, // 维度度量重命名
    UnionSetting, // 表上下合并
    PanelItem,
    CreateView, // 创建视图
    FieldAggregator, // 数据筛选
    FieldFilterSort, // 数据排序
  },
  provide() {
    return {
      rootInstance: this,
      nodeStatus: this.globalStatus,
      NUMBER_LIST: this.NUMBER_LIST,
      AGGREGATOR_LIST: [
        // 聚合方式及中文映射
        { name: '求和', value: 'SUM' },
        { name: '平均', value: 'AVG' },
        { name: '最大值', value: 'MAX' },
        { name: '最小值', value: 'MIN' },
        { name: '计数', value: 'COUNT' },
        { name: '去重计数', value: 'COUNTD' },
      ],
    };
  },
  data() {
    return {
      NUMBER_LIST: ['Int64', 'Float64', 'Decimal64(2)'],
      DimensionsIcon,
      MeasureIcon,
      modelForm: this.$form.createForm(this, { name: 'modelForm' }),
      spinning: false,
      detailInfo: '',
      datasourceName: '',
      isDatabase: false, // 是否是SQL数据源, 控制自定义SQL渲染
      tableSearch: '', // 表搜索关键字
      searchList: [],
      databaseName: '', // 当前数据库
      leftMenuList: [],
      rightMenuList: [],
      sqlForm: {},
      modalStatus: 'new',
      globalStatus: {
        dragType: '',
        dragNode: {},
        dropNode: {},
        event: null,
      },
      unionNode: {}, // 选择合并的树节点
      measures: '',
      cacheMeasures: [], // 缓存自定义度量
      measuresActiveKey: [],
      dimensions: '',
      cacheDimensions: [], // 缓存自定义维度
      cacheFields: [], // 缓存操作过的维度度量字段(每次增删表的时候, 将获取的字段替换为该数组里的字段)
      dimensionsActiveKey: [],
      panelData: {}, // 选中的维度或度量
      customStyle: 'border: 0',
      // setting,
      activeIndex: 0,
      modalName: '',
      visible: false, // 设置弹窗(描述, 宽表, 批量, 地理, 维度度量)
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      computeType: '', // 新建计算字段类型(维度, 度量)
      databaseList: [], // 数据库列表
      createViewName: '',
    };
  },
  computed: {
    ...mapState({
      modelId: state => state.dataModel.modelId, // 选中的菜单id
      addModelId: state => state.dataModel.addModelId, // 新增的模型id
      parentId: state => state.dataModel.parentId, // 选中的文件夹id
      datasource: state => state.dataModel.datasource, // 数据源
      privileges: state => state.common.privileges,
      datasourceId: state => state.dataModel.datasourceId, // 数据源
    }),
    model() {
      return this.$route.query.type;
    },
    tableSearchList() {
      return this.tableSearch ? this.searchList : this.leftMenuList;
    },
    tableFields() {
      if (this.detailInfo.pivotSchema) {
        let arry = [
          ...this.detailInfo.pivotSchema.dimensions,
          ...this.detailInfo.pivotSchema.measures,
          ...this.cacheDimensions,
          ...this.cacheMeasures,
        ];
        arry = arry.map(x => ({
          ...x,
          convertType: x.convertType === null ? x.dataType : x.convertType,
        }));
        return groupBy(arry, 'tableNo');
      } else {
        return [];
      }
    },
    disableByDetailInfo() {
      if (this.detailInfo === '') {
        return true;
      }

      return this.detailInfo.config.tables && this.detailInfo.config.tables.length === 0;
    },
    hasBtnPermissionSave() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.edit);
    },
  },
  async mounted() {
    this.handleGetDatabaseList();
    if (this.model === 'add') {
      await this.handleGetAddModelDatamodel();
    } else if (this.model === 'edit') {
      await this.handleGetData(this.$route.query.modelId);
      this.$store.dispatch('dataModel/setModelId', this.$route.query.modelId);
      this.$store.commit('common/SET_MENUSELECTID', this.$route.query.modelId);
    }
    this.$EventBus.$on('tableUnion', this.handleTableUnion);
  },
  beforeDestroy() {
    this.$EventBus.$off('deleteBelongCustom', this.handleDeleteCustomDimMea);
    this.$EventBus.$off('tableUnion', this.handleTableUnion);
    this.$store.dispatch('dataModel/setAddModelId', -1);
    this.$store.commit('common/SET_MENUSELECTID', -1);
  },
  methods: {
    /** 组合右键菜单 */
    handleComboContextmenus(type) {
      const arry = [
        {
          name: '重命名',
          onClick: (event, handler, vm) => {
            this.panelData = vm.itemData;
            this.openModal('rename-setting');
          },
        },
        {
          name: '编辑',
          type: 'custom',
          onClick: this.handleEditField,
        },
        {
          name: '删除',
          type: 'custom',
          onClick: this.handleDeleField,
        },
        {
          name: '复制字段',
          onClick: this.handleCopyField,
        },
        {
          name: '转换数据类型',
          children: [
            {
              name: '转换为整数',
              dataType: 'Int64',
              onClick: this.switchFieldType,
            },
            {
              name: '转换为小数',
              dataType: 'Float64',
              onClick: this.switchFieldType,
            },
            // {
            //   name: '转换为数值',
            //   dataType: 'Decimal64(2)',
            //   onClick: this.switchFieldType
            // },
            {
              name: '转换为字符串',
              dataType: 'String',
              onClick: this.switchFieldType,
            },
            {
              name: '转换为日期',
              dataType: 'Date',
              onClick: this.switchFieldType,
            },
            {
              name: '转换为日期时间',
              dataType: 'DateTime',
              onClick: this.switchFieldType,
            },
          ],
        },
        {
          name: type === 'dimensions' ? '转换为度量' : '转换为维度',
          onClick: (event, handler, vm) => {
            this.handleSwitchRole(type, vm);
          },
        },
      ];

      return arry;
    },
    handleOpenComputeSetting(type) {
      this.panelData = {};
      this.openModal('compute-setting', type);
    },
    // 将新的维度度量列表和缓存的已修改字段做替换
    handleReplaceCacheFields(pivotSchema) {
      pivotSchema.dimensions.forEach((item, index) => {
        const target = this.cacheFields.find(f => f.id === item.id);
        if (target) {
          pivotSchema.dimensions.splice(index, 1, target);
        }
      });
      pivotSchema.measures.forEach((item, index) => {
        const target = this.cacheFields.find(f => f.id === item.id);
        if (target) {
          pivotSchema.measures.splice(index, 1, target);
        }
      });
      // this.cacheFields = []
      return pivotSchema;
    },
    // 存储修改过的字段
    handleCacheFields(field) {
      const index = this.cacheFields.findIndex(item => item.id === field.id);
      if (index > -1) {
        this.cacheFields.splice(index, 1, field);
      } else {
        this.cacheFields.push(field);
      }
    },
    switchFieldType(e, item, vm) {
      let dataType = item.dataType;
      vm.itemData.convertType = dataType;
      this.handleCacheFields(vm.itemData);
      // 转换类型后, 需要同步更新筛选排序列表的状态
      this.handleFilterSort();
    },
    handleEditField(event, handler, vm) {
      const role = vm.itemData.role;
      this.panelData = vm.itemData;
      let computeType = '';
      if (role === 1) {
        computeType = '维度';
      } else if (role === 2) {
        computeType = '度量';
      }
      if (vm.itemData.isGroupFlag !== 0 && vm.itemData.isGroupFlag !== null) {
        this.openModal('field-aggregator', computeType);
      } else {
        this.openModal('compute-setting', computeType);
      }
    },
    handleDeleField(event, handler, vm) {
      const role = vm.itemData.role;
      const isDimension = role === 1;
      const isMeasures = role === 2;
      let index = -1;
      if (isDimension) {
        index = this.cacheDimensions.findIndex(item => item.id === vm.itemData.id);
        if (index > -1) {
          this.cacheDimensions.splice(index, 1);
          this.handleDimensions();
        }
      } else if (isMeasures) {
        index = this.cacheMeasures.findIndex(item => item.id === vm.itemData.id);
        if (index > -1) {
          this.cacheMeasures.splice(index, 1);
          this.handleMeasures();
        }
      }
      this.handleFilterSort();
      this.handleGroupField();
    },
    async handleGetDatabaseList() {
      if (!this.$route.query.datasourceId) return (this.datasourceName = '');
      const result = await this.$server.dataModel.getDatabaseList(this.$route.query.datasourceId);
      if (result.code === 200) {
        const baseBalck = [11, 12]; // 黑名单
        const type = result.data.type;
        this.isDatabase = !baseBalck.some(item => item === type);
        this.datasourceName = result.data.name;
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * 新增时获取空模型
     */
    async handleGetAddModelDatamodel() {
      const result = await this.$server.dataModel.getAddModelDatamodel();
      if (result.code === 200) {
        this.detailInfo = result.data;
        // 如果之前没有筛选排序, 则初始化一个对象
        if (!this.detailInfo.modelPivotschemaRule) {
          this.detailInfo.modelPivotschemaRule = {
            sortRules: [],
            filterRules: [],
          };
        }
        this.$store.dispatch('dataModel/setAddModelId', result.data.id);
        this.$store.commit('common/SET_PRIVILEGES', [0]); // 新增赋予所有权限
        this.$nextTick(() => {
          this.handleGetDatabase();
        });
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * 根据数据源获取数据库(暂时只支持显示第一个库)
     */
    async handleGetDatabase() {
      const len = this.detailInfo.config.tables ? this.detailInfo.config.tables.length : 0;
      let tableId = '';
      if (len > 0) {
        tableId = this.detailInfo.config.tables[len - 1].tableId;
      }
      if (!this.$route.query.datasourceId) {
        this.databaseList = [];
        this.databaseName = '';
        return;
      }
      const result = await this.$server.dataModel.getDataBaseDataInfoList(this.$route.query.datasourceId, tableId);

      if (result.code === 200) {
        this.databaseList = result.data;
        this.databaseName = this.databaseList.length && this.databaseList.length > 0 ? this.databaseList[0].name : '';
        if (this.databaseList.length && this.databaseList.length > 0) {
          this.handleGetDatabaseTable(result.data[0].id);
        }
        // this.handleDimensions()
        // this.handleMeasures()
      } else {
        this.$message.error(result.msg);
      }
    },
    // 获取当前库下的表
    async handleGetDatabaseTable(id) {
      const listResult = await this.$server.dataModel.getTableListById(id);
      if (listResult.code === 200) {
        this.leftMenuList = [].concat(
          listResult.data.filter(item => {
            item.type = +item.type;
            return item.type === 0;
          }),
        );
        this.rightMenuList = [].concat(listResult.data.filter(item => item.type === 1));
        this.$store.dispatch('dataModel/setDatabaseId', id);
      } else {
        this.$message.error(listResult.msg);
      }
    },
    handleSearchTable: debounce(function (event) {
      const value = event.target.value;
      this.tableSearch = value ? value.trim() : value;
      this.searchList = this.leftMenuList.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
    }, 400),
    /**
     * 切换数据库
     */
    async handleChangeDatabase(value, data) {
      this.handleGetDatabaseTable(data.key);
      this.$store.dispatch('dataModel/setDatabaseId', data.key);
    },
    // 表上下合并
    handleTableUnion(node) {
      this.unionNode = node;
      this.openModal('union-setting');
    },
    // 转换维度度量
    handleSwitchRole(type, vm) {
      let tableName = vm.itemData.tableName;
      const role = vm.itemData.role === 1 ? 2 : 1;
      if (vm.itemData.tableNo === 0) {
        tableName = role === 1 ? '自定义维度' : '自定义度量';
      }
      if (vm.itemData.tableNo === 0) {
        tableName = role === 1 ? '自定义维度' : '自定义度量';
      }
      const data = {
        ...vm.itemData,
        tableName,
        role,
      };
      let index;
      if (type === 'dimensions') {
        // 维度 转去 度量
        index = this.getTargetIndex(
          vm.itemData.tableNo === 0 ? this.cacheDimensions : this.detailInfo.pivotSchema.dimensions,
          vm.itemData.alias,
        );
        if (vm.itemData.tableNo === 0) {
          // 如果是自定义
          this.cacheMeasures.push(data);
          this.cacheDimensions.splice(index, 1);
        } else {
          this.detailInfo.pivotSchema.dimensions.splice(index, 1);
          this.detailInfo.pivotSchema.measures.push(data);
        }
      } else {
        // 度量 转去 维度
        index = this.getTargetIndex(
          vm.itemData.tableNo === 0 ? this.cacheMeasures : this.detailInfo.pivotSchema.measures,
          vm.itemData.alias,
        );
        if (vm.itemData.tableNo === 0) {
          // 如果是自定义
          this.cacheDimensions.push(data);
          this.cacheMeasures.splice(index, 1);
        } else {
          this.detailInfo.pivotSchema.measures.splice(index, 1);
          this.detailInfo.pivotSchema.dimensions.push(data);
        }
      }
      this.handleCacheFields(vm.itemData);
      this.handleSameName();
      this.handleDimensions();
      this.handleMeasures();
      this.handleGroupField();
    },
    getTargetIndex(list, target) {
      return list.findIndex(item => item.alias === target);
    },
    // 复制维度度量
    async handleCopyField(event, handler, vm) {
      const role = vm.itemData.role;
      const isDimension = role === 1;
      const isMeasures = role === 2;
      let newField = {
        ...vm.itemData,
        datamodelId: this.model === 'add' ? this.addModelId : this.modelId,
        expr: vm.itemData.produceType === 0 ? `$$${vm.itemData.id}` : vm.itemData.expr,
        raw_expr: vm.itemData.produceType === 0 ? `[${vm.itemData.alias}]` : vm.itemData.raw_expr,
      };
      const result = await this.$server.dataModel.addCustomizModelPivotschema(newField);
      if (result.code === 200) {
        newField = {
          ...newField,
          ...result.data,
        };
        const arry = [
          ...this.detailInfo.pivotSchema.dimensions,
          ...this.detailInfo.pivotSchema.measures,
          ...this.cacheDimensions,
          ...this.cacheMeasures,
        ];
        newField.alias = this.handleAddCustomField(arry, newField, newField.alias);
        if (isDimension) {
          this.cacheDimensions.push(newField);
          this.handleSameName();
          this.handleDimensions();
          this.handleGroupField();
        } else if (isMeasures) {
          this.cacheMeasures.push(newField);
          this.handleSameName();
          this.handleMeasures();
          this.handleGroupField();
        } else {
          this.$message.error('无法复制字段, 请刷新重试');
        }
      } else {
        this.$message.error(result.msg || '请求错误');
      }
    },
    /** 复制字段时候添加 */
    handleAddCustomField(list, field, source, hasNumber = 1) {
      if (list && list.length) {
        let len = list.length;
        let hasFind = true;
        while (len >= 0 && hasFind) {
          field.alias = `${source}(${hasNumber})`;
          const hasSame = list.some(item => item.alias === field.alias);
          hasFind = hasSame;
          if (hasFind) {
            hasNumber++;
          }
          len--;
        }
        return `${source}(${hasNumber})`;
      } else {
        if (hasNumber === 1) {
          return `${source}(${hasNumber})`;
        }
        return field.alias;
      }
    },
    /**
     * 同字段名处理
     */
    handleSameName() {
      const list = [].concat(this.handleConcatDimensions(), this.handleConcatMeasures());
      if (Array.isArray(list) && list.length > 1) {
        const map = new Map();
        const cacheFields = list.map(item => item.alias);
        list.forEach(element => {
          if (element.tableNo !== 0) {
            // this.changeAlias(map, element.alias, element, cacheFields)
            this.renameAlias(map, element.alias, element, cacheFields);
          }
        });
      }
      return list;
    },
    changeAlias(map, alias, element, cacheFields) {
      if (map.has(alias)) {
        const target = map.get(alias);
        let value = target.value;
        if (value === 1 && target.tableName !== element.tableName) {
          // 不同表名同字段
          alias = `${element.alias}(${element.tableName})`;
        } else if (value > 1 && target.tableName === element.tableName) {
          // 同表名同字段且已经存在过(value > 1)
          const newAlias = `${element.alias}(${element.tableName})(${value})`;
          if (cacheFields.includes(newAlias)) {
            alias = `${element.alias}(${element.tableName})(${value + 1})`;
          } else {
            alias = newAlias;
          }
        } else {
          // 同表名同字段
          const newAlias = `${element.alias}(${value})`;
          if (cacheFields.includes(newAlias)) {
            alias = `${element.alias}(${value + 1})`;
          } else {
            alias = newAlias;
          }
        }
        if (map.has(alias)) {
          value++;
          map.set(alias, {
            value,
            tableName: element.tableName,
          });
          this.changeAlias(map, alias, element, cacheFields);
        } else {
          map.set(alias, {
            value: 1,
            tableName: element.tableName,
          });
          element.alias = alias;
        }
      } else {
        map.set(element.alias, {
          value: 1,
          tableName: element.tableName,
        });
      }
    },
    renameAlias(map, alias, element, cacheFields) {
      if (map.has(alias)) {
        const target = map.get(alias);
        let value = target.value;
        if (target.tableName === element.tableName) {
          // 同表名同字段, 直接+1
          let newAlias = `${alias}(${value++})`;
          // 先检验自定义表有没有重名, 重名再+1
          while (cacheFields.includes(newAlias)) {
            newAlias = `${alias}(${value++})`;
          }
          element.alias = newAlias;
          map.set(alias, {
            value,
            tableName: element.tableName,
          });
        } else if (target.tableName !== element.tableName) {
          // 不同表名同字段, 后面跟表名
          const newAlias = `${alias}(${element.tableName})`;
          // 若还有重复则再+1, 没重复则录入map
          this.renameAlias(map, newAlias, element, cacheFields);
        }
      } else {
        // 未出现重复, 则直接重写alias
        element.alias = alias;
        map.set(element.alias, {
          value: 1,
          tableName: element.tableName,
        });
      }
    },
    /**
     * 合并维度数据
     */
    handleConcatDimensions() {
      return [...this.cacheDimensions, ...this.detailInfo.pivotSchema.dimensions];
    },
    /**
     * 维度数据处理
     */
    handleDimensions() {
      const arry = this.handleConcatDimensions();
      // this.handleSameName(arry);
      this.dimensions = groupBy(arry, 'tableNo');
      this.dimensionsActiveKey = keys(this.dimensions);
    },
    /**
     * 合并度量数据
     */
    handleConcatMeasures() {
      return [...this.cacheMeasures, ...this.detailInfo.pivotSchema.measures];
    },
    /**
     * 度量数据处理
     */
    handleMeasures() {
      const arry = this.handleConcatMeasures();
      // this.handleSameName(arry);
      this.measures = groupBy(arry, 'tableNo');
      this.measuresActiveKey = keys(this.measures);
    },
    /**
     * 合并维度度量数据
     */
    handleConcat() {
      return {
        dimensions: this.handleConcatDimensions(true),
        measures: this.handleConcatMeasures(true),
      };
    },
    // 判断字段是否为数值类型
    isNumber(data) {
      return this.NUMBER_LIST.includes(data.convertType || data.dataType);
    },
    // 判断字段是否为时间日期类型
    isDate(data) {
      return (data.convertType || data.dataType) === 'Date';
    },
    // 判断字段是否为时间日期类型
    isTimestamp(data) {
      return (data.convertType || data.dataType) === 'DateTime';
    },
    // 判断字段是否为文本类型
    isVarchar(data) {
      return (data.convertType || data.dataType) === 'String';
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
              item.expr = field.expr;
              item.alias = field.alias;
              item.role = field.role;
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
              } else if (
                this.isNumber(item) !== this.isNumber(field) ||
                this.isDate(item) !== this.isDate(field) ||
                this.isTimestamp(item) !== this.isTimestamp(field) ||
                this.isVarchar(item) !== this.isVarchar(field)
              ) {
                // 字段类型修改, 不是转成同类型的, 需标黄
                item.status = 3;
              } else {
                item.status = 0;
              }
              item.expr = field.expr;
              item.alias = field.alias;
              item.role = field.role;
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
    /**
     * 编辑时获取模型数据
     */
    async handleGetData(id) {
      this.spinning = true;
      const result = await this.$server.dataModel.getDataModelDetailInfo(id).finally(() => {
        this.spinning = false;
      });

      if (result.code === 200) {
        // this.$message.success('获取数据成功')
        this.createViewName = result.data.alias;
        this.detailInfo = result.data;
        // 如果之前没有筛选排序, 则初始化一个对象
        if (!this.detailInfo.modelPivotschemaRule) {
          this.detailInfo.modelPivotschemaRule = {
            sortRules: [],
            filterRules: [],
          };
        }
        // 将自定义维度度量剥离处理
        this.detailInfo.pivotSchema.dimensions = this.handlePeelCustom(
          this.detailInfo.pivotSchema.dimensions,
          this.cacheDimensions,
        );
        this.detailInfo.pivotSchema.measures = this.handlePeelCustom(
          this.detailInfo.pivotSchema.measures,
          this.cacheMeasures,
        );
        // 校验缺失字段
        this.doWithMissing(this.cacheDimensions, result.data.pivotSchema);
        this.doWithMissing(this.cacheMeasures, result.data.pivotSchema);

        this.$store.commit('common/SET_PRIVILEGES', result.data.privileges || []);

        this.handleSameName();
        this.handleDimensions();
        this.handleMeasures();
        this.handleGroupField();
        this.$nextTick(() => {
          this.handleGetDatabase();
        });
      } else {
        this.$message.error(result.msg);
      }
    },
    // 替换为缺失文案
    doWithMissing(list, pivotSchema) {
      list.forEach(field => {
        // 判断是否是指定聚合
        const isGroup = field.groupByFunc;
        // 根据id判断字段是否还存在
        const matchs = field.expr.match(/(?<=\$\$)(\d)+/g);
        // 非指定聚合
        if (!isGroup) {
          if (matchs) {
            matchs.forEach(value => {
              const pairList = [...pivotSchema.dimensions, ...pivotSchema.measures];
              const missing = pairList.filter(item => item.id === value).pop();
              if (!missing) {
                field.status = 1;
                field.raw_expr = field.raw_expr.replace(value, '<此位置字段丢失>');
              } else {
                field.status = 0;
              }
            });
          }
        } else {
          // 制定聚合
          // let rawExpr = {}
          // try {
          //   rawExpr = JSON.parse(field.raw_expr)
          // } catch (error) {}

          const pairList = [
            ...this.cacheDimensions,
            ...pivotSchema.dimensions,
            ...this.cacheMeasures,
            ...pivotSchema.measures,
          ];

          // matchs.forEach(value => {
          //   const missing = pairList.filter(item => item.id === value).pop()
          //   if (!missing) {
          //     field.status = 1
          //     rawExpr.field = ''
          //     field.raw_expr = JSON.stringify(rawExpr)
          //   } else {
          //     field.status = 0
          //   }
          // })
          matchs.forEach(value => {
            const missing = pairList.filter(item => item.id === value).pop();
            if (!missing) {
              field.status = 1;
              field.expr = field.expr.replace(/(?<=\$\$)(\d)+/g, '');
            } else {
              field.status = 0;
            }
          });
        }
      });
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
    handleLeftDragLeave() {
      this.$refs.rightTopRef.handleMapRemoveClass();
    },
    openModal(modalName, computeType) {
      this.modalName = modalName;
      this.$nextTick(() => {
        this.visible = true;
      });
      if (computeType) this.computeType = computeType;
    },
    handleAddSQL(type, item) {
      this.modalStatus = type;
      this.visible = true;
      this.modalName = 'sql-setting';
      if (this.modalStatus === 'edit') {
        this.$nextTick(() => {
          this.$refs.componentRef.handleGetDetail(item);
        });
      }
    },
    handleSQLDelete(item) {
      this.$server.dataModel
        .deleCustomSql({
          name: item.name,
          tableId: item.id,
        })
        .then(res => {
          if (res.code === 200) {
            const tables = (this.detailInfo && this.detailInfo['config'] && this.detailInfo.config['tables']) || [];

            if (Array.isArray(tables) && tables.some(table => table.id === item.id)) {
              return this.$message.error('资源有被其他资源依赖，不能被删除。');
            }

            const index = this.rightMenuList.indexOf(item);
            this.rightMenuList.splice(index, 1);
          } else {
            this.$message.error(res.msg);
          }
        });
    },
    close() {
      this.visible = false;
    },
    // 确认筛选排序后, 先保存, 不然查看宽表拿不到条件
    handleSaveFilterSort({ fieldFilterList, fieldSortList }) {
      if (this.modalName === 'field-filter-sort') {
        // 保存筛选排序字段
        this.detailInfo.modelPivotschemaRule.sortRules = fieldSortList;
        this.detailInfo.modelPivotschemaRule.filterRules = fieldFilterList;
      }
    },
    componentSuccess(data) {
      if (this.modalName === 'sql-setting') {
        this.doWithSqlSetting(data);
      }
      if (this.modalName === 'union-setting') {
        this.doWithUnionSetting(data);
      }

      if (this.modalName === 'batch-setting') {
        this.doWithBatchSetting(data);
      }

      if (this.modalName === 'compute-setting' || this.modalName === 'field-aggregator') {
        this.doWithComputeSetting(data);
      }

      // if (this.modalName === 'field-aggregator') {
      //   this.doWithFieldAggregator(data)
      // }

      if (this.modalName === 'create-view') {
        this.doWithCreateView(data);
      }

      this.close();
    },
    doWithSqlSetting(data) {
      data.type = +data.type;
      if (this.modalStatus === 'new') {
        this.handleSQLAdd(data);
      }
      if (this.modalStatus === 'edit') {
        this.handleUpdateSQL(data);
      }
    },
    doWithUnionSetting(data) {
      const tables = this.detailInfo.config.tables;
      this.unionNode.setField('alias', data.form.name);
      this.unionNode.setField('type', 2);
      this.unionNode.setField('union', data.union);

      const node = this.unionNode;
      const index = findIndex(tables, {
        id: node.props.id,
      });
      this.detailInfo.config.tables.splice(index, 1, {
        ...tables[index],
        ...node.props,
      });

      // 由于层次过深，需要set
      this.$set(this.detailInfo.config.tables[index]['union'], 'connectType', data.union.connectType);
      this.$set(this.detailInfo.config.tables[index]['union'], 'tableList', [...data.union.tableList]);

      // 处理更改名字
      this.detailInfo.pivotSchema.dimensions = this.handleChangeTableName(
        this.detailInfo.pivotSchema.dimensions,
        node.props.tableNo,
        data.form.name,
      );
      this.detailInfo.pivotSchema.measures = this.handleChangeTableName(
        this.detailInfo.pivotSchema.measures,
        node.props.tableNo,
        data.form.name,
      );

      this.handleSameName();
      this.handleDimensions();
      this.handleMeasures();
      this.handleFilterSort();
      this.handleGroupField();
    },
    doWithBatchSetting(data) {
      if (data) {
        const cacheDimensions = [];
        const cacheMeasures = [];
        Object.keys(data).forEach(item => {
          const list = data[item];
          list.forEach(field => {
            this.handleCacheFields(field);
            if (field.role === 1) {
              cacheDimensions.push(field);
            } else if (field.role === 2) {
              cacheMeasures.push(field);
            }
          });
        });

        this.cacheDimensions = [];
        this.cacheMeasures = [];
        // 将自定义维度度量剥离处理
        this.detailInfo.pivotSchema.dimensions = this.handlePeelCustom(cacheDimensions, this.cacheDimensions);
        this.detailInfo.pivotSchema.measures = this.handlePeelCustom(cacheMeasures, this.cacheMeasures);
        this.handleSameName();
        this.handleDimensions();
        this.handleMeasures();
        this.handleFilterSort();
        this.handleGroupField();
      }
    },
    doWithComputeSetting(data) {
      let list;
      if (this.computeType === '维度') {
        list = this.cacheDimensions;
      } else {
        list = this.cacheMeasures;
      }
      let index = list.findIndex(item => item.id === data.id);
      if (index < 0) {
        list.push(data);
      } else {
        list.splice(index, 1, data);
      }
      this.handleSameName();
      this.handleDimensions();
      this.handleMeasures();
      this.handleGroupField();
    },
    doWithCreateView(data) {
      this.createViewName = data;
      this.detailInfo.alias = data;
    },
    handleChangeTableName(list, tableNo, name) {
      if (list && list.length) {
        return list.map(item => {
          if (item.tableNo === tableNo || `${item.tableNo}` === tableNo) {
            item.tableName = name;
          }
          return item;
        });
      }
      return list;
    },
    handleSQLAdd(data) {
      this.rightMenuList.push(data);
    },
    handleUpdateSQL(data) {
      const index = findIndex(this.rightMenuList, {
        id: data.id,
      });
      this.rightMenuList.splice(index, 1, data);
    },
    exit() {
      this.$router.push({
        name: 'modelShow',
      });
    },
    handleSave() {
      let formAllRight = true;
      if (this.model === 'add') {
        this.modelForm.validateFields((err, values) => {
          if (!err) {
            this.detailInfo.name = values.name;
            formAllRight = true;
          } else {
            formAllRight = false;
          }
        });
      }
      if (!formAllRight) return;
      if (formAllRight && this.detailInfo.config.tables.length === 0) {
        this.$message.error('请关联左侧表');
        return;
      }

      if (this.detailInfo.config.tables.length > 1) {
        const hasEmpty = this.detailInfo.config.tables.slice(1).some(table => {
          return table.join.conditions.length === 0;
        });
        if (hasEmpty) {
          this.$message.error('还有表未关联');
          return;
        }
      }

      if (this.$refs.rightTopRef.errorTables.length > 0) {
        const hasError = this.detailInfo.config.tables.some(table => {
          return this.$refs.rightTopRef.errorTables.some(errorNo => errorNo === table.tableNo);
        });
        if (hasError) {
          this.$message.error('模型中部分关联表无法关联，请修改字段数据类型');
          return;
        }
      }

      const { dimensions, measures } = this.handleConcat(); // 处理维度度量
      const params = {
        ...this.detailInfo,
        pivotSchema: {
          dimensions: dimensions.map(item => {
            if (item.isGroupFlag === null) {
              // 兼容老数据
              item.isGroupFlag = 0;
            }
            return item;
          }),
          measures: measures.map(item => {
            if (item.isGroupFlag === null) {
              // 兼容老数据
              item.isGroupFlag = 0;
            }
            return item;
          }),
        },
        parentId: this.parentId,
      };
      this.actionSaveModel(params, true);
      // 现版本只要保存就覆盖
      // if (this.model === 'add') {
      //   this.actionSaveModel(params, false)
      // } else {
      //   this.$confirm({
      //     title: '确认提示?',
      //     content: '是否覆盖大屏的数据',
      //     okText: '覆盖',
      //     cancelText: '仅保存',
      //     onOk: () => {
      //       this.actionSaveModel(params, true)
      //     },
      //     onCancel: () => {
      //       this.actionSaveModel(params, false)
      //     }
      //   })
      // }
    },
    /**
     * 模型保存接口 cover: 是否覆盖大屏
     */
    async actionSaveModel(params, cover) {
      let result;
      this.spinning = true;
      if (cover) {
        result = await this.$server.dataModel.saveModelCover(params).finally(() => {
          this.spinning = false;
        });
      } else {
        result = await this.$server.dataModel.saveModel(params).finally(() => {
          this.spinning = false;
        });
      }
      if (result.code === 200) {
        if (this.model === 'add') {
          await this.handleSaveModelSourceId();
        }
        this.$message
          .success({
            content: this.model === 'add' ? '保存成功' : '编辑成功',
            duration: 0.5,
          })
          .then(() => {
            this.$store.commit('dataModel/SET_MODELID', result.data.id);
            this.$store.commit('common/SET_MENUSELECTID', result.data.id);
            this.exit();
          });
      } else {
        this.$message.error(result.msg);
      }
      this.$store.dispatch('dataModel/setParentId', '');
    },
    /**
     * 保存模型后再保存关联的数据源信息
     */
    async handleSaveModelSourceId() {
      this.$server.dataModel.saveDatasource({
        sourceDatasourceList: new Array(this.datasource),
        dataModelId: this.model === 'add' ? this.addModelId : this.modelId,
      });
    },
    handleGetFetchParams() {
      if (this.modalName === 'sql-setting') {
        if (!this.$route.query.datasourceId) return;
        this.$refs.componentRef.pushFetchParam({
          sourceId: this.$route.query.datasourceId,
          databaseName: this.databaseName,
          databaseId: this.databaseList.length > 0 ? this.databaseList[0].id : '',
          dataModelId: this.model === 'add' ? this.addModelId : this.modelId,
        });
      }
    },
  },
};
</script>

<style lang="styl" scope>
@import "./Model-Edit.styl";
</style>
