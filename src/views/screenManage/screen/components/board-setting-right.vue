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
  },
  watch: {
    modelList(list) {
      if (list && list.length) {
        // 如果模型菜单没有选中，初始化的时候默认选中第一个
        this.modelSelected = list[0];
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
        this.accessSelected = list[0];
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
      } else {
        this.$message.error(result.msg || '获取维度度量失败');
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
      const id = item.id;
      const index = this[dele].findIndex(n => n.id === id);
      if (index > -1) {
        const target = this[dele].splice(index, 1)[0];
        this[add].push(target);
      }
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
  height: calc(100% - 88px);
  position: absolute;
  top: @tabWrapperHeight;
}
</style>
