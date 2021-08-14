<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">矩形树图</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel class="content-item" panel="dimension" header="维度">
                  <!-- 维度 start -->
                  <div class="setting-unit-content">
                    <UnitField
                      receive="dimension"
                      type="dimension"
                      label="拖入维度"
                      backgroundColor="#4a90e2"
                      limit
                      :limitNum="5"
                      :list="currentCom.setting.data.dimensions"
                    ></UnitField>
                    <UnitTip class="mt-5" content="最多5个维度"></UnitTip>
                  </div>
                  <!-- 维度 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="measure" header="度量">
                  <!-- 度量 start -->
                  <UnitField
                    receive="measure"
                    class="setting-unit-content"
                    type="measure"
                    label="拖入度量"
                    backgroundColor="#40c0a8"
                    limit
                    openAggre
                    :list="currentCom.setting.data.measures"
                  ></UnitField>
                  <!-- 度量 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="dataFilter" header="数据筛选">
                  <!-- 数据筛选 start -->
                  <UnitDataFilter
                    class="setting-unit-content"
                    type="dataFilter"
                    label="拖入字段"
                    limit
                    :list="currentCom.setting.data.options.fileList"
                  >
                    <template #tip>
                      <UnitTip content="应用于当前图层"></UnitTip>
                    </template>
                  </UnitDataFilter>
                  <!-- 数据筛选 end -->
                </CollapsePanel>
              </Collapse>
            </TabPanel>
            <TabPanel tab="style" label="样式">
              <Collapse v-model="styleCollapseActive">
                <CollapsePanel class="content-item" panel="position" :isTogger="false">
                  <!-- 位置 start -->
                  <UnitPosition
                    class="setting-unit-content"
                    :position="currentCom.setting.style.position"
                    @change="position => handleChange('position', position)"
                  ></UnitPosition>
                  <!-- 位置 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="size" :isTogger="false">
                  <!-- 尺寸 start -->
                  <UnitSize
                    class="setting-unit-content"
                    :size="currentCom.setting.style.size"
                    @change="size => handleChange('size', size)"
                  ></UnitSize>
                  <!-- 尺寸 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="title" header="标题">
                  <!-- 标题 start -->
                  <UnitTitle
                    class="setting-unit-content"
                    :title="currentCom.setting.style.title"
                    @change="(key, value) => handleChange(key, value)"
                  ></UnitTitle>
                  <!-- 标题 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="bgAndBorder" header="背景和边框">
                  <div class="setting-unit-content">
                    <!-- 背景图片 start -->
                    <UnitBackgroundImage
                      class="mb-8"
                      :background="currentCom.setting.style.background"
                      @change="value => handleChange('background', value)"
                    ></UnitBackgroundImage>
                    <!-- 背景图片 end -->
                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.background.color"
                      @change="color => handleChange('background', { color })"
                    ></UnitBackgroundColor>
                    <!-- 背景颜色 end -->
                    <!-- 边框设置 start -->
                    <UnitBorder
                      :border="currentCom.setting.style.border"
                      @change="(key, value) => handleChange(key, value)"
                    ></UnitBorder>
                    <!-- 边框设置 end -->
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="style" header="样式设置">
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">展示方式</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.customShowWay"
                          style="width: 100%"
                          @change="customShowWay => handleChange('echart', { customShowWay })"
                        >
                          <a-select-option value="measure">按度量</a-select-option>
                          <a-select-option value="average">按等比</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">颜色分配</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.customPiecesIndex"
                          style="width: 100%"
                          @change="customPiecesIndex => handleChange('echart', { customPiecesIndex })"
                        >
                          <template v-if="hasServeData && hasServeData.length">
                            <a-select-option v-for="(item, index) in hasServeData" :key="item.id" :value="index">
                              {{ item.name }}
                            </a-select-option>
                          </template>
                          <template v-else>
                            <a-select-option :value="0">公司</a-select-option>
                            <a-select-option :value="1">部门名称</a-select-option>
                            <a-select-option :value="2">员工姓名</a-select-option>
                            <a-select-option :value="3">bumenTableid</a-select-option>
                          </template>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="label" header="标签">
                  <div class="setting-unit-content">
                    <!-- 标签是否显示 start -->
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.customSeries.label.show"
                      @change="show => handleLabel('show', show)"
                    ></UnitCheckbox>
                    <!-- 标签是否显示 end -->

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">显示内容</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.customFormatterWay"
                          style="width: 100%"
                          @change="handleFormatterWay"
                        >
                          <a-select-option value="name">维度</a-select-option>
                          <a-select-option value="value">值</a-select-option>
                          <a-select-option value="all">全部</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">字体</div>
                      </a-col>

                      <!-- 标签 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.customSeries.label.color"
                            @change="color => handleLabel('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 标签 字体 颜色 end -->

                      <!-- 标签 字体 大小 start -->
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customSeries.label.fontSize"
                          :min="0"
                          @change="fontSize => handleLabel('fontSize', fontSize)"
                        />
                      </a-col>
                      <!-- 标签 字体 大小 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="图例">
                  <UnitLegend
                    :legend="currentCom.setting.style.echart.visualMap"
                    @change="(key, value) => handleVisulMap(key, value)"
                  ></UnitLegend>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="reset" :isTogger="false">
                  <!-- 恢复默认配置 start -->
                  <div class="setting-unit-content">
                    <a-button class="btn-ghost reset" type="link" icon="redo" block @click="handleClickReset">
                      恢复默认配置
                    </a-button>
                  </div>
                  <!-- 恢复默认配置 end -->
                </CollapsePanel>
              </Collapse>
            </TabPanel>
          </Tabs>
        </div>
        <!-- Tab切换栏 end -->
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import StyleMethodMixin from '@/views/screenManage/screen/setting/style-method-mixin';
export default {
  name: `${BoardType.ChartTreemap}Setting`,
  mixins: [StyleMethodMixin],
  props: {
    currentCom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tabAcitve: 'style', // tab选项栏活动目标
      dataCollapseActive: ['dimension', 'measure', 'dataFilter'], // 折叠打开选项
      styleCollapseActive: [],
    };
  },
  computed: {
    hasServeData() {
      if (
        this.currentCom.setting.data &&
        this.currentCom.setting.data.dataModelId &&
        this.currentCom.setting.data.dimensions.length &&
        this.currentCom.setting.data.measures.length
      ) {
        return [...this.currentCom.setting.data.dimensions, ...this.currentCom.setting.data.measures];
      } else {
        return [];
      }
    },
  },
  methods: {
    /**
     * @description 标签设置
     */
    handleLabel(key, value) {
      this.doWithSeries('label', {
        [key]: value,
      });
    },
    /**
     * @description 内容显示方式
     */
    handleFormatterWay(value) {
      this.handleChange('echart', {
        customFormatterWay: value,
      });
    },
    /**
     * @description 图例设置
     */
    handleVisulMap(key, value) {
      const val = value['legend'];
      this.handleChange('echart', {
        visualMap: {
          ...val,
        },
      });
    },
  },
};
</script>
