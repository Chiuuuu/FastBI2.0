<template>
  <div class="data-setting">
    <div class="setting-wrapper">
      <h2 class="title">数据模型</h2>
      <div class="toolbar-more">
        <a-icon type="more" />
      </div>
      <!-- 数据模型菜单 start -->
      <DataModelMenu
        @open="handleDataModel"
        :dimension="dimension"
        :measure="measure"
        @selectSearchFiled="handleSelectSearchFiled"
      ></DataModelMenu>
      <!-- 数据模型菜单 end -->

      <!-- 数据总面板 start -->
      <DataPanel :dimension="dimension" :measure="measure" :selectFiled="selectFiled"></DataPanel>
      <!-- 数据总面板 end -->
    </div>
    <!-- 数据模型列表 start -->
    <DataModelListPanel :show="showDataModel" @close="handleDataModel"></DataModelListPanel>
    <!-- 数据模型列表 end -->
  </div>
</template>
<script>
import DataModelMenu from './data-model-menu';
import DataPanel from './data-panel';
import DataModelListPanel from './data-model-list-panel';

/**
 * @description 编辑大屏配置区的最右侧数据模型
 */
export default {
  name: 'BoardSettingRight',
  components: {
    DataModelMenu,
    DataPanel,
    DataModelListPanel,
  },
  data() {
    return {
      showDataModel: false, // 是否显示数据模型列表
      selectFiled: {}, // 搜索字段选中的字段
      // 维度
      dimension: [
        {
          id: 1,
          name: '产品名称',
        },
        {
          id: 2,
          name: '制造商',
        },
        {
          id: 3,
          name: '发货日期',
        },
        {
          id: 4,
          name: '国家',
        },
        {
          id: 5,
          name: '地区',
        },
        {
          id: 6,
          name: '城市',
        },
        {
          id: 7,
          name: '子类别',
        },
        {
          id: 8,
          name: '客户名称',
        },
      ],
      // 度量
      measure: [
        {
          id: 1,
          name: '成本',
        },
        {
          id: 2,
          name: '折扣',
        },
        {
          id: 3,
          name: '数量',
        },
        {
          id: 4,
          name: '类别代码',
        },
        {
          id: 5,
          name: '销售额',
        },
      ],
    };
  },
  mounted() {
    // 根据数据模型id获取维度度量列表
  },
  methods: {
    /**
     * @description 打开/关闭 数据模型列表
     */
    handleDataModel(val) {
      this.showDataModel = val;
    },
    /**
     * @description 设置搜索字段选中的字段
     */
    handleSelectSearchFiled(value) {
      this.selectFiled = Object.assign({}, value);
    },
  },
};
</script>
