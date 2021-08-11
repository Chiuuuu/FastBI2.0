<template>
  <div class="data-setting">
    <Tabs v-model="tabAcitve" @change="handleChangeTab">
      <TabPanel tab="showDataModel" label="数据模型" style="height: 100%">
        <div class="setting-wrapper">
          <!-- 数据模型菜单 start -->
          <DataModelMenu
            @open="v => handleDataModel(v, 'showDataModel')"
            :selected-list="savedModels"
            :current-selected.sync="currentModel"
            :dimension="dimension"
            :measure="measure"
            @selectSearchFiled="handleSelectSearchFiled"
          ></DataModelMenu>
          <!-- 数据模型菜单 end -->

          <!-- 数据总面板 start -->
          <a-spin class="data-panel-box" :spinning="spinning">
            <DataPanel :dimension="dimension" :measure="measure" :selectFiled="selectFiled"></DataPanel>
          </a-spin>
          <!-- 数据总面板 end -->
        </div>
        <!-- 数据模型列表 start -->
        <DataModelListPanel
          ref="showDataModel"
          :selected-list="savedModels"
          :current-selected.sync="currentModel"
          :show="showDataModel"
          @close="v => handleDataModel(v, 'showDataModel')"
        ></DataModelListPanel>
        <!-- 数据模型列表 end -->
      </TabPanel>
      <TabPanel tab="showDataSource" label="数据接入" style="height: 100%">
        <div class="setting-wrapper">
          <!-- 数据模型菜单 start -->
          <DataSourceMenu
            @open="v => handleDataModel(v, 'showDataSource')"
            :selected-list="savedSources"
            :current-selected.sync="currentSource"
            :dimension="dimension"
            :measure="measure"
            @selectSearchFiled="handleSelectSearchFiled"
          ></DataSourceMenu>
          <!-- 数据模型菜单 end -->

          <!-- 数据总面板 start -->
          <a-spin class="data-panel-box" :spinning="spinning">
            <DataPanel :dimension="dimension" :measure="measure" :selectFiled="selectFiled"></DataPanel>
          </a-spin>
          <!-- 数据总面板 end -->
        </div>
        <!-- 数据模型列表 start -->
        <DataSourceListPanel
          ref="showDataSource"
          :selected-list="savedSources"
          :current-selected.sync="currentSource"
          :show="showDataSource"
          @close="v => handleDataModel(v, 'showDataSource')"
        ></DataSourceListPanel>
        <!-- 数据模型列表 end -->
      </TabPanel>
    </Tabs>
    <!-- <div class="toolbar-more">
      <a-icon type="more" />
    </div> -->
  </div>
</template>
<script>
import DataPanel from './data-source-model/data-panel';
import DataModelMenu from './data-source-model/data-model-menu';
import DataModelListPanel from './data-source-model/data-model-list-panel';
import DataSourceMenu from './data-source-model/data-source-menu';
import DataSourceListPanel from './data-source-model/data-source-list-panel';

import { mapGetters } from 'vuex';

/**
 * @description 编辑大屏配置区的最右侧数据模型
 */
export default {
  name: 'BoardSettingRight',
  components: {
    DataPanel,
    DataModelMenu,
    DataModelListPanel,
    DataSourceMenu,
    DataSourceListPanel,
  },
  provide() {
    return {
      getResourceType: () => this.resourceType,
    };
  },
  data() {
    return {
      showDataModel: false, // 是否显示数据模型列表
      showDataSource: false, // 是否显示数据接入列表
      resourceType: 8, // 8是模型, 3是接入(只用于传参时给后端判断, 不是数据库字段)
      tabAcitve: 'showDataModel', //  选中的tabKey
      selectFiled: {}, // 搜索字段选中的字段
      currentModel: null, // 当前选中的模型
      currentSource: null, // 当前选中的接入表格
      spinning: false, // 获取维度度量时的loading
      modelDimension: [],
      modelMeasure: [],
      sourceDimension: [],
      sourceMeasure: [],
    };
  },
  computed: {
    ...mapGetters([
      'modelExpand',
      'dataModel',
      'screenId',
      'selectedModelList',
      'currentSelected',
      'currSelected',
      'canvasMap',
    ]),
    // 过滤模型列表
    savedModels() {
      return this.selectedModelList.filter(item => item.resourceType === 8);
    },
    // 过滤接入列表
    savedSources() {
      return this.selectedModelList.filter(item => item.resourceType === 3);
    },
    dimension() {
      if (this.tabAcitve === 'showDataModel') {
        return this.modelDimension;
      } else if (this.tabAcitve === 'showDataSource') {
        return this.sourceDimension;
      } else {
        return [];
      }
    },
    measure() {
      if (this.tabAcitve === 'showDataModel') {
        return this.modelMeasure;
      } else if (this.tabAcitve === 'showDataSource') {
        return this.sourceMeasure;
      } else {
        return [];
      }
    },
  },
  watch: {
    // 监听选中模型, 并获取维度度量
    currentModel(newValue) {
      if (newValue && 'id' in newValue) {
        this.handleGetPivoSchemaList(newValue.id);
      }
    },
    // 监听选中接入的表格, 并获取维度度量
    currentSource(newValue) {
      if (newValue && 'id' in newValue) {
        this.handleGetPivoSchemaList(newValue.id);
      }
    },
  },
  methods: {
    /**
     * @description 切换tab栏
     */
    handleChangeTab(key) {
      // 切换时, 默认恢复成列表窗口
      this[key] = false;
      // 切换时, 维度度量也要相应切换(没有选中值时显示为空)
      if (key === 'showDataModel') {
        this.resourceType = 8;
      } else if (key === 'showDataSource') {
        this.resourceType = 3;
      }
    },
    /**
     * @description 打开/关闭 数据模型列表
     */
    handleDataModel(val, type) {
      if (val && this.$refs[type]) {
        this.$refs[type].handleGetData();
      }
      this[type] = val;
    },
    /**
     * @description 设置搜索字段选中的字段
     */
    handleSelectSearchFiled(value) {
      this.selectFiled = Object.assign({}, value);
    },
    /**
     * @description 根据当前选中项获取维度度量
     */
    async handleGetPivoSchemaList(id) {
      this.spinning = true;
      const res = await this.$server.screenManage.getPivoSchemaList(id, this.screenId).finally(() => {
        this.spinning = false;
      });
      let dimension = [];
      let measure = [];
      if (res && res.code === 200) {
        dimension = res.data.dimensions || [];
        measure = res.data.measure || [];
      } else {
        this.dimension = [];
        this.measure = [];
        this.$message.error(res.msg || res.message || '请求错误');
      }
      if (this.tabAcitve === 'showDataModel') {
        this.modelDimension = dimension;
        this.modelMeasure = measure;
      } else if (this.tabAcitve === 'showDataSource') {
        this.sourceDimension = dimension;
        this.sourceMeasure = measure;
      }
    },
  },
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .tabs-wrapper .tabs-content {
  overflow: hidden;
}
.data-panel-box {
  height: calc(100% - 88px);
}
</style>
