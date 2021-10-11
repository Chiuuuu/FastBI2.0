<template>
  <div class="data-setting">
    <div class="setting-wrapper">
      <Tabs :value="tabAcitve" @change="handleChangeTab">
        <TabPanel tab="model" label="数据模型">
          <!-- 数据模型菜单 start -->
          <DataModelMenu
            :list="modelList"
            :selected="modelSelected"
            :searchList="searchList"
            @open="show => handleOpenListPanel(show, 'modelListPanelShow')"
            @select="handleModelMenuSelected"
            @selectSearchFiled="handleSelectSearchFiled"
            @delete="item => handleDeleteMenuItem(item, 'model')"
          ></DataModelMenu>
          <!-- 数据模型菜单 end -->
        </TabPanel>
        <TabPanel tab="access" label="数据接入">
          <!-- 数据接入菜单 start -->
          <DataAccessMenu
            :list="accessList"
            :searchList="searchList"
            :selected="accessSelected"
            @open="show => handleOpenListPanel(show, 'accessListPanelShow')"
            @select="handleAccessMenuSelected"
            @selectSearchFiled="handleSelectSearchFiled"
            @delete="item => handleDeleteMenuItem(item, 'access')"
          ></DataAccessMenu>
          <!-- 数据接入菜单 end -->
        </TabPanel>
      </Tabs>

      <!-- 数据模型列表 start -->
      <DataModelListPanel
        :show="modelListPanelShow"
        :selectedList="modelList"
        @close="handleCloseListPanel"
        @select="item => handleListSelect(item, 'model')"
      ></DataModelListPanel>
      <!-- 数据模型列表 end -->

      <!-- 数据接入列表 start -->
      <DataAccessListPanel
        :show="accessListPanelShow"
        :selectedList="accessList"
        @close="handleCloseListPanel"
        @select="item => handleListSelect(item, 'access')"
      ></DataAccessListPanel>
      <!-- 数据接入列表 end -->

      <!-- 数据总面板 start -->
      <a-spin class="data-panel-box" :spinning="spinning">
        <DataPanel
          :dimension="panelDimension"
          :measure="panelMeasure"
          :selectFiled="selectFiled"
          @cancelSelect="handleCancelSelect"
          @changeRole="handleChangeFieldRole"
        ></DataPanel>
      </a-spin>
      <!-- 数据总面板 end -->
    </div>
    <!-- <div class="toolbar-more">
      <a-icon type="more" />
    </div> -->
  </div>
</template>
<script>
import groupBy from 'lodash/groupBy';
import DataPanel from './data-access-model/data-panel';
import DataModelMenu from './data-access-model/data-model-menu';
import DataAccessMenu from './data-access-model/data-access-menu';
import DataModelListPanel from './data-access-model/data-model-list-panel';
import DataAccessListPanel from './data-access-model/data-access-list-panel';
import { mapState } from 'vuex';
/**
 * @description 编辑大屏配置区的最右侧数据模型
 */
export default {
  name: 'BoardSettingRight',
  inject: ['screenInstance'],
  components: {
    DataPanel,
    DataModelMenu,
    DataAccessMenu,
    DataModelListPanel,
    DataAccessListPanel,
  },
  provide() {
    return {
      boardSettingRightInstance: this,
    };
  },
  data() {
    return {
      tabAcitve: 'model', // tab栏活动页
      modelSelected: null, // 模型菜单选中
      accessSelected: null, // 接入菜单选中
      modelListPanelShow: false, // 模型列表面板开启|关闭
      accessListPanelShow: false, // 接入列表面板开启|关闭
      spinning: false, // 获取维度度量时的loading
      selectFiled: {}, // 字段搜索选中值
      dimension: [], // 维度列表
      measure: [], // 度量列表
      searchList: [],
    };
  },
  computed: {
    modelList() {
      // 模型列表
      return this.screenInstance.screenInfo.modelList || [];
    },
    accessList() {
      // 接入列表
      return this.screenInstance.screenInfo.accessList || [];
    },
    tabId() {
      // 页面
      return this.screenInstance.screenInfo.tabId;
    },
    panelDimension() {
      if (this.tabAcitve === 'model') {
        return groupBy(this.dimension, 'tableNo');
      } else {
        return [].concat(this.dimension) || [];
      }
    },
    panelMeasure() {
      if (this.tabAcitve === 'model') {
        return groupBy(this.measure, 'tableNo');
      } else {
        return [].concat(this.measure) || [];
      }
    },
    ...mapState({
      // 当前组件
      currentCom: state => state.board.currentCom,
    }),
  },
  watch: {
    modelList(list) {
      if (list && list.length) {
        // 如果模型菜单没有选中，初始化的时候默认选中第一个
        if (!this.modelSelected || !this.modelSelected.tableId) {
          this.modelSelected = list[0];
        }
        this.handleGetPivoSchemaList(this.modelSelected.tableId);
      } else {
        // 没有数据列表清空当前选择模型
        this.modelSelected = null;
        // 清空对应类型下模型数据
        if (this.tabAcitve === 'model') {
          this.dimension = [];
          this.measure = [];
        }
        // this.tabAcitve = 'access';
      }
    },
    accessList(list) {
      if (list && list.length && this.tabAcitve === 'access') {
        // 如果模型菜单没有数据
        // 并且接入菜单没有选中，初始化的时候默认选中第一个
        if (!this.accessSelected || !this.accessSelected.tableId) {
          this.accessSelected = list[0];
        }
        this.handleGetPivoSchemaList(this.accessSelected.tableId);
      } else {
        // 没有数据列表清空当前选择模型
        this.accessSelected = null;
        // 清空对应类型下模型数据
        if (this.tabAcitve === 'access') {
          this.dimension = [];
          this.measure = [];
        }
        // this.tabAcitve = 'model';
      }
    },
    dimension(val) {
      this.$store.dispatch('SetModelDimensions', val);
    },
    // 保存当前度量列表，文本框插入
    measure(val) {
      this.$store.dispatch('SetModelMeasures', val);
      this.$store.dispatch('SetResourceType', this.tabAcitve);
    },
  },
  methods: {
    /**
     * @description tab栏切换
     */
    handleChangeTab(value) {
      this.tabAcitve = value;
      const list = this.tabAcitve === 'model' ? this.modelList : this.accessList;
      let selected = this.tabAcitve === 'model' ? this.modelSelected : this.accessSelected;
      if (!selected && list && list.length) {
        selected = list[0];
        this.tabAcitve === 'model' ? this.handleModeMenulSelected(selected) : this.handleAccessMenuSelected(selected);
      } else if (selected) {
        this.handleGetPivoSchemaList(selected.tableId);
      } else {
        this.dimension = [];
        this.measure = [];
      }
    },
    /**
     * @description 打开数据列表
     */
    handleOpenListPanel(show, type) {
      ['modelListPanelShow', 'accessListPanelShow'].forEach(key => {
        this[key] = key === type;
      });
    },
    /**
     * @description 打开数据模型/接入列表
     */
    handleCloseListPanel() {
      this.modelListPanelShow = false;
      this.accessListPanelShow = false;
    },
    /**
     * @description 数据模型菜单选中
     */
    handleModelMenuSelected(selected) {
      this.modelSelected = {
        ...this.modelSelected,
        ...selected,
      };
      this.handleGetPivoSchemaList(this.modelSelected.tableId);
    },
    /**
     * @description 数据接入菜单选中
     */
    handleAccessMenuSelected(selected) {
      this.accessSelected = {
        ...this.accessSelected,
        ...selected,
      };
      this.handleGetPivoSchemaList(this.accessSelected.tableId);
    },
    /**
     * @description 数据模型/接入列表选中
     */
    handleListSelect(item, type) {
      const isModel = type === 'model';
      const list = isModel ? this.modelList : this.accessList;
      const cacheList = [].concat(list);
      cacheList.push(item);
      this.screenInstance.handleUpdateScreenInfo({
        [isModel ? 'modelList' : 'accessList']: cacheList,
      });
      isModel ? this.handleModelMenuSelected(item) : this.handleAccessMenuSelected(item);
    },
    /**
     * @description 选中图表时, 初始化该图表的模型/接入数据
     */
    handleChartPivoSchemaList(currentCom) {
      if (currentCom && currentCom.setting && currentCom.setting.data) {
        const { dataModelId, resourceType } = currentCom.setting.data;
        const isModel = resourceType === 8;
        const list = isModel ? this.modelList : this.accessList;
        const target = list.find(item => item.tableId === dataModelId);
        if (target) {
          const type = isModel ? 'model' : 'access';
          this.tabAcitve = type;
          this.$nextTick(() => {
            isModel ? this.handleModelMenuSelected(target) : this.handleAccessMenuSelected(target);
            // this.handleListSelect(target, type);
          });
        }
      }
    },
    /**
     * @description 删除菜单选项
     */
    async handleDeleteMenuItem(item, type) {
      const isModel = type === 'model';
      const selected = isModel ? this.modelSelected : this.accessSelected;
      let list = isModel ? this.modelList : this.accessList;
      list = list.filter(n => n.id !== item.id);

      const tabId = this.screenInstance.screenInfo.tabId;
      const tableId = item.tableId;
      const result = await this.$server.screenManage.deleteListDataByScreenIdAndTableId(tabId, tableId);
      if (result && result.code === 200) {
        if (item.id === selected.id) {
          // 如果删除的是当前选中的，则清空选中
          isModel ? (this.modelSelected = null) : (this.accessSelected = null);
        }

        if (list && list.length === 0) {
          // 如果全部都删除了，则置空
          this.dimension = [];
          this.measure = [];
        }

        this.screenInstance.handleUpdateScreenInfo({
          [isModel ? 'modelList' : 'accessList']: list,
        });
      } else {
        this.$message.error(result.msg || '删除失败');
      }
    },
    /**
     * @description 根据当前选中项获取维度度量
     */
    async handleGetPivoSchemaList(id) {
      this.spinning = true;
      let result;

      if (this.tabAcitve === 'model') {
        result = await this.$server.screenManage
          .getPivotschemaByModel(id, this.screenInstance.screenInfo.tabId)
          .finally(() => {
            this.spinning = false;
          });
      } else {
        result = await this.$server.screenManage
          .getPivotschemaByAccess(id, this.screenInstance.screenInfo.tabId)
          .finally(() => {
            this.spinning = false;
          });
      }

      if (result && result.code === 200) {
        this.searchList = [].concat(result.data.dimensions, result.data.measures);
        this.dimension = [].concat(result.data.dimensions) || [];
        this.measure = [].concat(result.data.measures) || [];

        // 检查保存的图表数据和新维度度量是否对应
        this.handleNewData();
      } else {
        this.$message.error(result.msg || '获取维度度量失败');
      }
    },
    /**
     * @description 检查保存的图表数据和新维度度量是否对应
     */
    handleNewData() {
      if (!this.currentCom) {
        return;
      }
      const options = this.currentCom.setting;
      const newList = this.dimension.concat(this.measure);
      const keys = Object.keys(options.data);
      let pivotschemaIdMap = {};
      for (let key of keys) {
        const datas = options.data[key];
        const actualDatas = key === 'filter' ? datas.fileList : datas;
        if (Array.isArray(actualDatas)) {
          actualDatas.forEach((data, index) => {
            // 更新最新拖入数据
            newList.forEach(item => {
              if (item.pivotschemaId === data.pivotschemaId && item.id !== data.id) {
                this.$set(actualDatas, index, item);
                // 文本框记录pivotschemaId对应的数据
                if (this.currentCom.type === 'BoardText') {
                  pivotschemaIdMap[item.pivotschemaId] = item;
                }
              }
            });
          });
        }
      }
      // 文本框富文本里的度量信息更新
      if (this.currentCom.type === 'BoardText' && Object.keys(pivotschemaIdMap).length) {
        const reg =
          /<span data-id="(.*?)" data-pivotschemaid="(.*?)" contenteditable="false" class="anchor-measure">\[(.*?)\((.{2,4})\)(&nbsp;){3}]<\/span>/g;
        let str = options.data.htmlText.replace(reg, (match, id, pivotschemaId, alias, aggregator) => {
          const pivotschemaIdData = pivotschemaIdMap[pivotschemaId];
          return `<span data-id="${pivotschemaIdData.id}" data-pivotschemaid="${pivotschemaId}" contenteditable="false" class="anchor-measure">[${pivotschemaIdData.alias}(${aggregator})&nbsp;&nbsp;&nbsp;]</span>`;
        });
        this.$set(options.data, 'htmlText', str);
      }
    },
    /**
     * @description 设置搜索字段选中的字段
     */
    handleSelectSearchFiled(value) {
      this.selectFiled = Object.assign({}, value);
    },
    /**
     * @description 取消选中搜索字段
     */
    handleCancelSelect() {
      this.selectFiled = {};
    },
    /**
     * @description 转为维度或度量
     */
    handleChangeFieldRole(item, dele, add) {
      // 调接口记录这次变化
      const { screenId, tabId } = this.screenInstance.screenInfo;
      const { role, pivotschemaId, screenTableId } = item;
      this.$server.screenManage
        .screenModuleTransform({
          screenId,
          tabId,
          role,
          pivotschemaId,
          screenTableId,
        })
        .then(res => {
          if (res.code === 200) {
            const id = item.id;
            const index = this[dele].findIndex(n => n.id === id);
            if (index > -1) {
              const target = this[dele].splice(index, 1)[0];
              this[add].push(target);
            }
          } else {
            this.$message.error('转换失败');
          }
        });
    },
  },
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';
@tabWrapperHeight: 125px;
@{deep} .tabs-wrapper .tabs-content {
  overflow: hidden;
}
.data-panel-box {
  height: calc(100% - 125px);
  position: absolute;
  top: @tabWrapperHeight;
}
</style>
