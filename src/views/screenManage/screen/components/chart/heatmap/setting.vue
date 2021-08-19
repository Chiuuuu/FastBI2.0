<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">矩形热力图</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel class="content-item" panel="dimension" header="维度">
                  <!-- 维度 start -->
                  <UnitField
                    class="setting-unit-content"
                    type="xaxis"
                    label="拖入X轴"
                    receive="dimension"
                    backgroundColor="#4a90e2"
                    openAggre
                    limit
                    :list="currentCom.setting.data.xaxis"
                  ></UnitField>
                  <UnitField
                    class="setting-unit-content"
                    type="yaxis"
                    label="拖入Y轴"
                    receive="dimension"
                    backgroundColor="#4a90e2"
                    openAggre
                    limit
                    :list="currentCom.setting.data.yaxis"
                  ></UnitField>
                  <!-- 维度 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="measure" header="度量">
                  <!-- 度量 start -->
                  <UnitField
                    class="setting-unit-content"
                    type="measure"
                    label="拖入度量"
                    receive="measure"
                    backgroundColor="#40c0a8"
                    limit
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
                <CollapsePanel class="content-item" panel="style" header="图形属性">
                  <div class="setting-unit-content">
                    <!-- 边距 start -->
                    <UnitGridMargin
                      label="边距"
                      :grid="currentCom.setting.style.echart.grid"
                      @change="(key, value) => handleChange(key, value)"
                    ></UnitGridMargin>
                    <!-- 展示数值 start -->
                    <UnitLabel
                      label="指标"
                      :seriesLabel="currentCom.setting.style.echart.customSeries.label"
                      :labelPositionList="labelPositionList"
                      @change="(key, value) => doWithSeries(key, value)"
                    ></UnitLabel>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24">
                        <div class="unit-block-title">指标内容</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="24">
                        <a-select :value="currentCom.setting.style.echart.customFormatterWay" style="width: 100%">
                          <!-- <a-select-option value="name">维度</a-select-option>
                          <a-select-option value="value">值</a-select-option>
                          <a-select-option value="all">全部</a-select-option> -->
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="图例设置">
                  <UnitLegend
                    :legend="currentCom.setting.style.echart.visualMap"
                    @change="(key, value) => handleVisulMap(key, value)"
                  ></UnitLegend>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="xaxis" header="X轴">
                  <!-- X轴 start -->
                  <UnitXaxis
                    :axis="currentCom.setting.style.echart.xAxis"
                    type="xAxis"
                    @change="(key, value) => handleChange(key, value)"
                  ></UnitXaxis>
                  <!-- X轴 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="yaxis" header="Y轴">
                  <!-- Y轴 start -->
                  <UnitYaxis
                    :axis="currentCom.setting.style.echart.yAxis"
                    type="yAxis"
                    @change="(key, value) => handleChange(key, value)"
                  ></UnitYaxis>
                  <!-- Y轴 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="bgAndBorder" header="背景设置">
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
                <CollapsePanel class="content-item" panel="drawing" header="绘图区">
                  <UnitDrawing
                    :grid="currentCom.setting.style.echart.grid"
                    :xAxis="currentCom.setting.style.echart.xAxis"
                    :yAxis="currentCom.setting.style.echart.yAxis"
                    @change="(key, value) => handleChange(key, value)"
                  ></UnitDrawing>
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
  name: `${BoardType.ChartHeatmap}Setting`,
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
      dataCollapseActive: ['dimension', 'measure', 'dataFilter'],
      styleCollapseActive: [],
      labelPositionList: [
        //标签位置
        { name: '内部', value: 'inside' },
        { name: '外部', value: 'outside' },
      ],
    };
  },
  methods: {
    /**
     * @description 标签设置
     */
    doWithLabel(key, value) {
      this.handleChange('echart', {
        [key]: value,
      });
    },
    /**
     * @description 标签设置
     */
    handleLabel(key, value) {
      this.doWithSeries('label', {
        [key]: value,
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
