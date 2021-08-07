<template>
  <div class="Model-Edit">
    <div class="left">
      <div class="menu_title">
        <span>数据接入</span>
      </div>
      <!-- 临时方案, 不写class了 -->
      <div
        :title="datasourceName"
        style="width: calc(100% - 30px);
        color: #01040f;
        margin: 0 15px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;"
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
      <a-select
        v-model="databaseName"
        class="menu_select"
        @change="handleChangeDatabase"
      >
        <a-select-option
          v-for="database in databaseList"
          :key="database.id"
          :value="database.name"
          >{{ database.name }}</a-select-option
        >
      </a-select>
      <a-divider />
      <div class="table_list" :class="{ 'no-sql': !isDatabase }">
        <div class="menu_search">
          <span class="search_span">表</span>
          <a-input
            placeholder="请输入关键词搜索"
            :value="tableSearch"
            @change="handleSearchTable"
            class="search_input"
          >
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
          <a-icon
            class="view_icon"
            type="plus-square"
            @click="handleAddSQL('new')"
          />
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
        <a-form
          :form="modelForm"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 12 }"
        >
          <a-form-item label="数据模型名称">
            <a-input
              v-decorator="[
                'name',
                {
                  rules: [
                    {
                      required: true,
                      message: '请填写名称'
                    },
                    {
                      type: 'string',
                      min: 1,
                      max: 20,
                      message: '请输入1-20个字的名称'
                    }
                  ]
                }
              ]"
            />
          </a-form-item>
        </a-form>
      </div>
      <div class="description">
        <span class="d-s" :title="detailInfo.description"
          >描述： {{ detailInfo.description }}</span
        >
        <a-icon
          type="edit"
          v-on:click="openModal('describe-setting')"
          class="d-s-icon"
        />
      </div>
      <p class="tips">
        <a-icon
          theme="filled"
          type="exclamation-circle"
          style="margin-right: 2px;"
        />下方表显示红色表示表在数据源已被删除，请您删除此表。表显示黄色表示表中列字段发生了变动，请您重新构建表关联关系。
      </p>
      <div class="draw_board scrollbar">
        <edit-right-top
          ref="rightTopRef"
          :detailInfo="detailInfo"
        ></edit-right-top>
      </div>
      <div class="detail scrollbar">
        <div class="detail_header">
          <span
            >数据模型详情<span class="sub">{{
              createViewName ? `(已导入BI库-表名: ${createViewName})` : ''
            }}</span></span
          >
          <div class="detail_btn">
            <a-button
              v-on:click="openModal('create-view')"
              :disabled="disableByDetailInfo"
              >导入BI库</a-button
            >
            <a-button
              v-on:click="openModal('check-table')"
              :disabled="disableByDetailInfo"
              >查看宽表</a-button
            >
            <a-button
              v-on:click="openModal('batch-setting')"
              :disabled="disableByDetailInfo"
              >批量编辑字段</a-button
            >
          </div>
        </div>
        <div class="detail_main">
          <div class="dimensionality">
            <div class="dim_title">
              <span class="dim_span">维度</span>
              <div class="dim_operation">
                <a
                  v-on:click="handleOpenComputeSetting('维度')"
                  style="color:#627CFF;line-height:38px"
                  >新建计算维度</a
                >
                <a-divider type="vertical" />
                <!-- <a v-on:click="openModal('geo-setting')" style="color:#627CFF;">设置地理位置</a> -->
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
                  style="color:#627CFF;margin-right:20px;line-height:38px"
                  >新建计算度量</a
                >
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
        @get-fetch-param="handleGetFetchParams"
        @close="close"
        @success="data => componentSuccess(data)"
      />
      <div class="submit_btn">
        <!-- <a-button :disabled="!detailInfo">保存并新建报告</a-button> -->
        <a-button
          v-if="hasBtnPermissionSave"
          type="primary"
          @click="handleSave"
          :disabled="!detailInfo"
          >保 存</a-button
        >
        <a-button v-on:click="exit">退 出</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import findIndex from 'lodash/findIndex'
import { mapState } from 'vuex'
import EditLeft from './edit-left'
import EditRightTop from './edit-right-top'
import SqlSetting from './setting/sql-setting'
import CheckTable from './setting/check-table'
import DescribeSetting from './setting/describe-setting'
import BatchSetting from './setting/batch-setting'
import GeoSetting from './setting/geo-setting'
import ComputeSetting from './setting/compute-setting'
import RenameSetting from './setting/rename-setting'
import UnionSetting from './setting/union-setting'
import CreateView from './setting/create-view'
import PanelItem from './panel-item'
import { Node, conversionTree } from '../util'
import { hasPermission } from '@/utils/permission'
import groupBy from 'lodash/groupBy'
import keys from 'lodash/keys'
import DimensionsIcon from '@/assets/images/icon_dimension.png'
import MeasureIcon from '@/assets/images/icon_measure.png'
import debounce from 'lodash/debounce'
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
    CreateView // 创建视图
  },
  provide() {
    return {
      nodeStatus: this.globalStatus
    }
  },
  data() {
    return {
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
        event: null
      },
      unionNode: {}, // 选择合并的树节点
      measures: '',
      cacheMeasures: [], // 缓存自定义度量
      measuresActiveKey: [],
      dimensions: '',
      cacheDimensions: [], // 缓存自定义维度
      dimensionsActiveKey: [],
      panelData: {}, // 选中的维度或度量
      customStyle: 'border: 0',
      // setting,
      activeIndex: 0,
      modalName: '',
      visible: false, // 设置弹窗(描述, 宽表, 批量, 地理, 维度度量)
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      },
      computeType: '', // 新建计算字段类型(维度, 度量)
      databaseList: [], // 数据库列表
      createViewName: ''
    }
  },
  computed: {
    ...mapState({
      modelId: state => state.dataModel.modelId, // 选中的菜单id
      addModelId: state => state.dataModel.addModelId, // 新增的模型id
      parentId: state => state.dataModel.parentId, // 选中的文件夹id
      datasource: state => state.dataModel.datasource, // 数据源
      privileges: state => state.common.privileges,
      datasourceId: state => state.dataModel.datasourceId // 数据源
    }),
    model() {
      return this.$route.query.type
    },
    tableSearchList() {
      return this.tableSearch ? this.searchList : this.leftMenuList
    },
    tableFields() {
      if (this.detailInfo.pivotSchema) {
        let arry = [
          ...this.detailInfo.pivotSchema.dimensions,
          ...this.detailInfo.pivotSchema.measures,
          ...this.cacheDimensions,
          ...this.cacheMeasures
        ]
        arry = arry.map(x => ({
          ...x,
          convertType: x.convertType === null ? x.dataType : x.convertType
        }))
        return groupBy(arry, 'tableNo')
      } else {
        return []
      }
    },
    disableByDetailInfo() {
      if (this.detailInfo === '') {
        return true
      }

      return (
        this.detailInfo.config.tables &&
        this.detailInfo.config.tables.length === 0
      )
    },
    hasBtnPermissionSave() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.edit)
    }
  },
  mounted() {
    this.handleGetDatabaseList()
    if (this.model === 'add') {
      this.handleGetAddModelDatamodel()
    } else if (this.model === 'edit') {
      this.handleGetData(this.$route.query.modelId)
      this.$store.dispatch('dataModel/setModelId', this.$route.query.modelId)
      this.$store.commit('common/SET_MENUSELECTID', this.$route.query.modelId)
    }
    this.$EventBus.$on('tableUnion', this.handleTableUnion)
  },
  beforeDestroy() {
    this.$EventBus.$off('deleteBelongCustom', this.handleDeleteCustomDimMea)
    this.$EventBus.$off('tableUnion', this.handleTableUnion)
    this.$store.dispatch('dataModel/setAddModelId', -1)
  },
  methods: {
    /** 组合右键菜单 */
    handleComboContextmenus(type) {
      const arry = [
        {
          name: '重命名',
          onClick: (event, handler, vm) => {
            this.panelData = vm.itemData
            this.openModal('rename-setting')
          }
        },
        {
          name: '编辑',
          type: 'custom',
          onClick: this.handleEditField
        },
        {
          name: '删除',
          type: 'custom',
          onClick: this.handleDeleField
        },
        {
          name: '复制字段',
          onClick: this.handleCopyField
        },
        {
          name: '转换数据类型',
          children: [
            {
              name: '转换为整数',
              dataType: 'BIGINT',
              onClick: this.switchFieldType
            },
            {
              name: '转换为小数',
              dataType: 'DOUBLE',
              onClick: this.switchFieldType
            },
            // {
            //   name: '转换为数值',
            //   dataType: 'DECIMAL',
            //   onClick: this.switchFieldType
            // },
            {
              name: '转换为字符串',
              dataType: 'VARCHAR',
              onClick: this.switchFieldType
            },
            {
              name: '转换为日期',
              dataType: 'DATE',
              onClick: this.switchFieldType
            },
            {
              name: '转换为日期时间',
              dataType: 'TIMESTAMP',
              onClick: this.switchFieldType
            }
          ]
        },
        {
          name: type === 'dimensions' ? '转换为度量' : '转换为维度',
          onClick: (event, handler, vm) => {
            this.handleSwitchRole(type, vm)
          }
        }
      ]

      return arry
    },
    handleOpenComputeSetting(type) {
      this.panelData = {}
      this.openModal('compute-setting', type)
    },
    switchFieldType(e, item, vm) {
      let dataType = item.dataType
      vm.itemData.convertType = dataType
    },
    handleEditField(event, handler, vm) {
      const role = vm.itemData.role
      this.panelData = vm.itemData
      const isDimension = role === 1
      const isMeasures = role === 2
      if (isDimension) {
        this.openModal('compute-setting', '维度')
      } else if (isMeasures) {
        this.openModal('compute-setting', '度量')
      }
    },
    handleDeleField(event, handler, vm) {
      const role = vm.itemData.role
      const isDimension = role === 1
      const isMeasures = role === 2
      let index = -1
      if (isDimension) {
        index = this.cacheDimensions.findIndex(
          item => item.id === vm.itemData.id
        )
        if (index > -1) {
          this.cacheDimensions.splice(index, 1)
          this.handleDimensions()
        }
      } else if (isMeasures) {
        index = this.cacheMeasures.findIndex(item => item.id === vm.itemData.id)
        if (index > -1) {
          this.cacheMeasures.splice(index, 1)
          this.handleMeasures()
        }
      }
    },
    async handleGetDatabaseList() {
      const result = await this.$server.dataModel.getDatabaseList(
        this.$route.query.datasourceId
      )
      if (result.code === 200) {
        const baseBalck = [11, 12] // 黑名单
        const type = result.data.type
        this.isDatabase = !baseBalck.some(item => item === type)
        this.datasourceName = result.data.name
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 新增时获取空模型
     */
    async handleGetAddModelDatamodel() {
      const result = await this.$server.dataModel.getAddModelDatamodel()
      if (result.code === 200) {
        this.detailInfo = result.data
        this.$store.dispatch('dataModel/setAddModelId', result.data.id)
        this.$store.commit('common/SET_PRIVILEGES', [0]) // 新增赋予所有权限
        this.$nextTick(() => {
          this.handleGetDatabase()
        })
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 根据数据源获取数据库(暂时只支持显示第一个库)
     */
    async handleGetDatabase() {
      const len = this.detailInfo.config.tables
        ? this.detailInfo.config.tables.length
        : 0
      let tableId = ''
      if (len > 0) {
        tableId = this.detailInfo.config.tables[len - 1].tableId
      }
      const result = await this.$server.dataModel.getDataBaseDataInfoList(
        this.$route.query.datasourceId,
        tableId
      )

      if (result.code === 200) {
        this.databaseList = result.data
        this.databaseName =
          this.databaseList.length && this.databaseList.length > 0
            ? this.databaseList[0].name
            : ''
        if (this.databaseList.length && this.databaseList.length > 0) {
          this.handleGetDatabaseTable(result.data[0].id)
        }
        // this.handleDimensions()
        // this.handleMeasures()
      } else {
        this.$message.error(result.msg)
      }
    },
    // 获取当前库下的表
    async handleGetDatabaseTable(id) {
      const listResult = await this.$server.dataModel.getTableListById(id)
      if (listResult.code === 200) {
        this.leftMenuList = [].concat(
          listResult.data.filter(item => {
            item.type = +item.type
            return item.type === 0
          })
        )
        this.rightMenuList = [].concat(
          listResult.data.filter(item => item.type === 1)
        )
        this.$store.dispatch('dataModel/setDatabaseId', id)
      } else {
        this.$message.error(listResult.msg)
      }
    },
    handleSearchTable: debounce(function(event) {
      const value = event.target.value
      this.tableSearch = value ? value.trim() : value
      this.searchList = this.leftMenuList.filter(
        item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
      )
    }, 400),
    /**
     * 切换数据库
     */
    async handleChangeDatabase(value, data) {
      this.handleGetDatabaseTable(data.key)
      this.$store.dispatch('dataModel/setDatabaseId', data.key)
    },
    // 表上下合并
    handleTableUnion(node) {
      this.unionNode = node
      this.openModal('union-setting')
    },
    // 转换维度度量
    handleSwitchRole(type, vm) {
      let tableName = vm.itemData.tableName
      const role = vm.itemData.role === 1 ? 2 : 1
      if (vm.itemData.tableNo === 0) {
        tableName = role === 1 ? '自定义维度' : '自定义度量'
      }
      if (vm.itemData.tableNo === 0) {
        tableName = role === 1 ? '自定义维度' : '自定义度量'
      }
      const data = {
        ...vm.itemData,
        tableName,
        role
      }
      let index
      if (type === 'dimensions') {
        // 维度 转去 度量
        index = this.getTargetIndex(
          vm.itemData.tableNo === 0
            ? this.cacheDimensions
            : this.detailInfo.pivotSchema.dimensions,
          vm.itemData.alias
        )
        if (vm.itemData.tableNo === 0) {
          // 如果是自定义
          this.cacheMeasures.push(data)
          this.cacheDimensions.splice(index, 1)
        } else {
          this.detailInfo.pivotSchema.dimensions.splice(index, 1)
          this.detailInfo.pivotSchema.measures.push(data)
        }
      } else {
        // 度量 转去 维度
        index = this.getTargetIndex(
          vm.itemData.tableNo === 0
            ? this.cacheMeasures
            : this.detailInfo.pivotSchema.measures,
          vm.itemData.alias
        )
        if (vm.itemData.tableNo === 0) {
          // 如果是自定义
          this.cacheDimensions.push(data)
          this.cacheMeasures.splice(index, 1)
        } else {
          this.detailInfo.pivotSchema.measures.splice(index, 1)
          this.detailInfo.pivotSchema.dimensions.push(data)
        }
      }
      this.handleDimensions()
      this.handleMeasures()
    },
    getTargetIndex(list, target) {
      return list.findIndex(item => item.alias === target)
    },
    // 复制维度度量
    async handleCopyField(event, handler, vm) {
      const role = vm.itemData.role
      const isDimension = role === 1
      const isMeasures = role === 2
      let newField = {
        ...vm.itemData,
        datamodelId: this.model === 'add' ? this.addModelId : this.modelId,
        expr:
          vm.itemData.produceType === 0
            ? `$$${vm.itemData.id}`
            : vm.itemData.expr,
        raw_expr:
          vm.itemData.produceType === 0
            ? `[${vm.itemData.alias}]`
            : vm.itemData.raw_expr
      }
      const result = await this.$server.dataModel.addCustomizModelPivotschema(
        newField
      )
      if (result.code === 200) {
        newField = {
          ...newField,
          ...result.data
        }
        const arry = [
          ...this.detailInfo.pivotSchema.dimensions,
          ...this.detailInfo.pivotSchema.measures,
          ...this.cacheDimensions,
          ...this.cacheMeasures
        ]
        newField.alias = this.handleAddCustomField(
          arry,
          newField,
          newField.alias
        )
        if (isDimension) {
          this.cacheDimensions.push(newField)
          this.handleDimensions()
        } else if (isMeasures) {
          this.cacheMeasures.push(newField)
          this.handleMeasures()
        } else {
          this.$message.error('无法复制字段, 请刷新重试')
        }
      } else {
        this.$message.error(result.msg || '请求错误')
      }
    },
    /** 复制字段时候添加 */
    handleAddCustomField(list, field, source, hasNumber = 1) {
      if (list && list.length) {
        let len = list.length
        let hasFind = true
        while (len >= 0 && hasFind) {
          field.alias = `${source}(${hasNumber})`
          const hasSame = list.some(item => item.alias === field.alias)
          hasFind = hasSame
          if (hasFind) {
            hasNumber++
          }
          len--
        }
        return `${source}(${hasNumber})`
      } else {
        if (hasNumber === 1) {
          return `${source}(${hasNumber})`
        }
        return field.alias
      }
    },
    /**
     * 同字段名处理
     */
    handleSameName(list) {
      if (Array.isArray(list) && list.length > 1) {
        const map = new Map()
        list.forEach(element => {
          if (element.tableNo !== 0) {
            this.changeAlias(map, element.alias, element)
          }
        })
      }
      return list
    },
    changeAlias(map, alias, element) {
      if (map.has(alias)) {
        const target = map.get(alias)
        let value = target.value
        if (value === 1 && target.tableName !== element.tableName) {
          // 不同表名同字段
          alias = `${element.alias}(${element.tableName})`
        } else if (value > 1 && target.tableName === element.tableName) {
          // 同表名同字段且已经存在过(value > 1)
          alias = `${element.alias}(${element.tableName})(${value})`
        } else {
          // 同表名同字段
          alias = `${element.alias}(${value})`
        }
        if (map.has(alias)) {
          value++
          map.set(alias, {
            value,
            tableName: element.tableName
          })
          this.changeAlias(map, alias, element)
        } else {
          map.set(alias, {
            value: 1,
            tableName: element.tableName
          })
          element.alias = alias
        }
      } else {
        map.set(element.alias, {
          value: 1,
          tableName: element.tableName
        })
      }
    },
    /**
     * 合并维度数据
     */
    handleConcatDimensions() {
      return [
        ...this.cacheDimensions,
        ...this.detailInfo.pivotSchema.dimensions
      ]
    },
    /**
     * 维度数据处理
     */
    handleDimensions() {
      const arry = this.handleConcatDimensions()
      this.handleSameName(arry)
      this.dimensions = groupBy(arry, 'tableNo')
      this.dimensionsActiveKey = keys(this.dimensions)
    },
    /**
     * 合并度量数据
     */
    handleConcatMeasures() {
      return [...this.cacheMeasures, ...this.detailInfo.pivotSchema.measures]
    },
    /**
     * 度量数据处理
     */
    handleMeasures() {
      const arry = this.handleConcatMeasures()
      this.handleSameName(arry)
      this.measures = groupBy(arry, 'tableNo')
      this.measuresActiveKey = keys(this.measures)
    },
    /**
     * 合并维度度量数据
     */
    handleConcat() {
      return {
        dimensions: this.handleConcatDimensions(),
        measures: this.handleConcatMeasures()
      }
    },
    /**
     * 编辑时获取模型数据
     */
    async handleGetData(id) {
      this.spinning = true
      const result = await this.$server.dataModel
        .getDataModelDetailInfo(id)
        .finally(() => {
          this.spinning = false
        })

      if (result.code === 200) {
        this.$message.success('获取数据成功')
        this.createViewName = result.data.alias
        this.detailInfo = result.data
        // 将自定义维度度量剥离处理
        this.detailInfo.pivotSchema.dimensions = this.handlePeelCustom(
          this.detailInfo.pivotSchema.dimensions,
          this.cacheDimensions
        )
        this.detailInfo.pivotSchema.measures = this.handlePeelCustom(
          this.detailInfo.pivotSchema.measures,
          this.cacheMeasures
        )

        // 校验缺失字段
        this.doWithMissing(this.cacheDimensions, result.data.pivotSchema)
        this.doWithMissing(this.cacheMeasures, result.data.pivotSchema)

        this.$store.commit(
          'common/SET_PRIVILEGES',
          result.data.privileges || []
        )

        this.handleDimensions()
        this.handleMeasures()
        this.$nextTick(() => {
          this.handleGetDatabase()
        })
      } else {
        this.$message.error(result.msg)
      }
    },
    // 替换为缺失文案
    doWithMissing(list, pivotSchema) {
      list.forEach(filed => {
        const matchs = filed.raw_expr.match(/(\[)(.*?)(\])/g)
        if (matchs) {
          matchs.forEach(value => {
            const matchStr = value.match(/(\[)(.+)(\])/)
            const key = matchStr[2] ? matchStr[2] : ''
            const pairList = [
              ...pivotSchema.dimensions,
              ...pivotSchema.measures
            ]
            const missing = pairList.filter(item => item.alias === key).pop()
            if (!missing) {
              filed.status = 1
              filed.raw_expr = filed.raw_expr.replace(value, '<此位置字段丢失>')
            }
          })
        }
      })
    },
    handlePeelCustom(list, cache) {
      if (list && list.length) {
        return list.filter(item => {
          if (item.tableNo === 0) {
            cache.push(item)
          } else {
            return item
          }
        })
      }
      return list
    },
    handleLeftDragLeave() {
      this.$refs.rightTopRef.handleMapRemoveClass()
    },
    openModal(modalName, computeType) {
      this.visible = true
      this.modalName = modalName
      if (computeType) this.computeType = computeType
    },
    handleAddSQL(type, item) {
      this.modalStatus = type
      this.visible = true
      this.modalName = 'sql-setting'
      if (this.modalStatus === 'edit') {
        this.$nextTick(() => {
          this.$refs.componentRef.handleGetDetail(item)
        })
      }
    },
    handleSQLDelete(item) {
      this.$server.dataModel
        .deleCustomSql({
          name: item.name,
          tableId: item.id
        })
        .then(res => {
          if (res.code === 200) {
            const tables =
              (this.detailInfo &&
                this.detailInfo['config'] &&
                this.detailInfo.config['tables']) ||
              []

            if (
              Array.isArray(tables) &&
              tables.some(table => table.id === item.id)
            ) {
              return this.$message.error('资源有被其他资源依赖，不能被删除。')
            }

            const index = this.rightMenuList.indexOf(item)
            this.rightMenuList.splice(index, 1)
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    close(data) {
      this.visible = false
    },
    componentSuccess(data) {
      if (this.modalName === 'sql-setting') {
        this.doWithSqlSetting(data)
      }
      if (this.modalName === 'union-setting') {
        this.doWithUnionSetting(data)
      }

      if (this.modalName === 'batch-setting') {
        this.doWithBatchSetting(data)
      }

      if (this.modalName === 'compute-setting') {
        this.doWithComputeSetting(data)
      }

      if (this.modalName === 'create-view') {
        this.doWithCreateView(data)
      }

      this.close()
    },
    doWithSqlSetting(data) {
      data.type = +data.type
      if (this.modalStatus === 'new') {
        this.handleSQLAdd(data)
      }
      if (this.modalStatus === 'edit') {
        this.handleUpdateSQL(data)
      }
    },
    doWithUnionSetting(data) {
      const tables = this.detailInfo.config.tables
      this.unionNode.setField('name', data.form.name)
      this.unionNode.setField('type', 2)
      this.unionNode.setField('union', data.union)

      const node = this.unionNode
      const index = findIndex(tables, {
        id: node.props.id
      })
      this.detailInfo.config.tables.splice(index, 1, {
        ...tables[index],
        ...node.props
      })

      // 由于层次过深，需要set
      this.$set(
        this.detailInfo.config.tables[index]['union'],
        'connectType',
        data.union.connectType
      )
      this.$set(this.detailInfo.config.tables[index]['union'], 'tableList', [
        ...data.union.tableList
      ])

      // 处理更改名字
      this.detailInfo.pivotSchema.dimensions = this.handleChangeTableName(
        this.detailInfo.pivotSchema.dimensions,
        node.props.tableNo,
        data.form.name
      )
      this.detailInfo.pivotSchema.measures = this.handleChangeTableName(
        this.detailInfo.pivotSchema.measures,
        node.props.tableNo,
        data.form.name
      )

      this.handleDimensions()
      this.handleMeasures()
    },
    doWithBatchSetting(data) {
      if (data) {
        const cacheDimensions = []
        const cacheMeasures = []
        Object.keys(data).forEach(item => {
          const list = data[item]
          list.forEach(field => {
            if (field.role === 1) {
              cacheDimensions.push(field)
            } else if (field.role === 2) {
              cacheMeasures.push(field)
            }
          })
        })

        this.cacheDimensions = []
        this.cacheMeasures = []
        // 将自定义维度度量剥离处理
        this.detailInfo.pivotSchema.dimensions = this.handlePeelCustom(
          cacheDimensions,
          this.cacheDimensions
        )
        this.detailInfo.pivotSchema.measures = this.handlePeelCustom(
          cacheMeasures,
          this.cacheMeasures
        )
        this.handleDimensions()
        this.handleMeasures()
      }
    },
    doWithComputeSetting(data) {
      let list
      if (this.computeType === '维度') {
        list = this.cacheDimensions
      } else {
        list = this.cacheMeasures
      }
      let index = list.findIndex(item => item.id === data.id)
      if (index < 0) {
        list.push(data)
      } else {
        list.splice(index, 1, data)
      }
      this.handleDimensions()
      this.handleMeasures()
    },
    doWithCreateView(data) {
      this.createViewName = data
      this.detailInfo.alias = data
    },
    handleChangeTableName(list, tableNo, name) {
      if (list && list.length) {
        return list.map(item => {
          if (item.tableNo === tableNo || `${item.tableNo}` === tableNo) {
            item.tableName = name
          }
          return item
        })
      }
      return list
    },
    handleSQLAdd(data) {
      this.rightMenuList.push(data)
    },
    handleUpdateSQL(data) {
      const index = findIndex(this.rightMenuList, {
        id: data.id
      })
      this.rightMenuList.splice(index, 1, data)
    },
    exit() {
      this.$router.push({
        name: 'modelShow'
      })
    },
    handleSave() {
      let formAllRight = true
      if (this.model === 'add') {
        this.modelForm.validateFields((err, values) => {
          if (!err) {
            this.detailInfo.name = values.name
            formAllRight = true
          } else {
            formAllRight = false
          }
        })
      }
      if (!formAllRight) return
      if (formAllRight && this.detailInfo.config.tables.length === 0) {
        this.$message.error('请关联左侧表')
        return
      }

      if (this.detailInfo.config.tables.length > 1) {
        const hasEmpty = this.detailInfo.config.tables.slice(1).some(table => {
          return table.join.conditions.length === 0
        })
        if (hasEmpty) {
          this.$message.error('还有表未关联')
          return
        }
      }

      if (this.$refs.rightTopRef.errorTables.length > 0) {
        const hasError = this.detailInfo.config.tables.some(table => {
          return this.$refs.rightTopRef.errorTables.some(
            errorNo => errorNo === table.tableNo
          )
        })
        if (hasError) {
          this.$message.error('模型中部分关联表无法关联，请修改字段数据类型')
          return
        }
      }

      this.detailInfo.config.tables.map(table => {
        table.alias = table.name
      })

      const params = {
        ...this.detailInfo,
        pivotSchema: {
          ...this.handleConcat() // 处理维度度量
        },
        parentId: this.parentId
      }
      if (!this.modelId) {
        this.actionSaveModel(params, false)
      } else {
        this.$confirm({
          title: '确认提示?',
          content: '是否覆盖大屏的数据',
          okText: '覆盖',
          cancelText: '仅保存',
          onOk: () => {
            this.actionSaveModel(params, true)
          },
          onCancel: () => {
            this.actionSaveModel(params, false)
          }
        })
      }
    },
    /**
     * 模型保存接口 cover: 是否覆盖大屏
     */
    async actionSaveModel(params, cover) {
      let result
      if (cover) {
        result = await this.$server.dataModel.saveModelCover(params)
      } else {
        result = await this.$server.dataModel.saveModel(params)
      }
      if (result.code === 200) {
        if (this.model === 'add') {
          await this.handleSaveModelSourceId()
        }
        this.$message
          .success({
            content: this.model === 'add' ? '保存成功' : '编辑成功',
            duration: 0.5
          })
          .then(() => {
            this.$store.commit('dataModel/SET_MODELID', result.data.id)
            this.exit()
          })
      } else {
        this.$message.error(result.msg)
      }
      this.$store.dispatch('dataModel/setParentId', '')
    },
    /**
     * 保存模型后再保存关联的数据源信息
     */
    async handleSaveModelSourceId() {
      this.$server.dataModel.saveDatasource({
        sourceDatasourceList: new Array(this.datasource),
        dataModelId: this.model === 'add' ? this.addModelId : this.modelId
      })
    },
    handleGetFetchParams(data) {
      if (this.modalName === 'sql-setting') {
        this.$refs.componentRef.pushFetchParam({
          sourceId: this.$route.query.datasourceId,
          databaseName: this.databaseName,
          databaseId:
            this.databaseList.length > 0 ? this.databaseList[0].id : '',
          dataModelId: this.model === 'add' ? this.addModelId : this.modelId
        })
      }
    }
  }
}
</script>

<style lang="styl" scope>
@import "./Model-Edit.styl";
</style>
