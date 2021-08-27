<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">{{ currentCom.graphName }}</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel class="content-item" panel="dimension" header="维度">
                  <!-- 维度 start -->
                  <UnitField
                    class="setting-unit-content"
                    receive="dimension"
                    type="dimension"
                    label="拖入维度"
                    backgroundColor="#4a90e2"
                    limit
                    :list="currentCom.setting.data.dimensions"
                  ></UnitField>
                  <!-- 维度 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="measure" header="度量">
                  <!-- 度量 start -->
                  <UnitField
                    class="setting-unit-content"
                    receive="measure"
                    type="measure"
                    label="拖入度量"
                    backgroundColor="#40c0a8"
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
                    :list="currentCom.setting.data.filter.fileList"
                  >
                    <template #tip>
                      <UnitTip content="应用于当前图层"></UnitTip>
                    </template>
                  </UnitDataFilter>
                  <!-- 数据筛选 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="dataSort" header="排序">
                  <!-- 数据排序 start -->
                  <UnitDataSort
                    class="setting-unit-content"
                    type="dataSort"
                    label="拖入字段"
                    limit
                    :openAggre="true"
                    :list="currentCom.setting.data.sort"
                  >
                    <template #tip>
                      <UnitTip content="应用于当前图层"></UnitTip>
                    </template>
                  </UnitDataSort>
                  <!-- 数据排序 end -->
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
                <CollapsePanel class="content-item" panel="chartStyle" header="图形属性">
                  <!-- 图形属性 start -->
                  <div class="setting-unit-content">
                    <!-- 边距 start -->
                    <UnitGridMargin
                      label="边距"
                      :grid="currentCom.setting.style.echart.grid"
                      @change="(key, value) => handleChange(key, value)"
                    ></UnitGridMargin>
                    <!-- 边距 end -->
                    <!-- 展示数值 start -->
                    <UnitLabel
                      label="数值"
                      :seriesLabel="currentCom.setting.style.echart.customSeries.label"
                      @change="(key, value) => doWithSeries(key, value)"
                    ></UnitLabel>
                    <!-- 展示数值 end -->
                    <!-- 数值重叠 start -->
                    <UnitCheckbox
                      class="show-btn strict mb-3"
                      label="是否允许数值重叠"
                      :value="!currentCom.setting.style.echart.customSeries.labelLayout.hideOverlap"
                      @change="
                        hideOverlap =>
                          doWithSeries('labelLayout', {
                            hideOverlap: !hideOverlap,
                          })
                      "
                    ></UnitCheckbox>
                    <!-- 数值重叠 end -->
                    <a-row>
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">线形</div>
                      </a-col>
                      <a-col :span="18">
                        <a-radio-group
                          :value="currentCom.setting.style.echart.customLinear"
                          size="small"
                          class="float-right"
                          @change="event => doWithSmooth(event.target.value)"
                        >
                          <a-radio-button value="line">直线</a-radio-button>
                          <a-radio-button value="curve">曲线</a-radio-button>
                          <a-radio-button value="trapezoidal">梯形</a-radio-button>
                        </a-radio-group>
                      </a-col>
                    </a-row>
                    <!-- 线宽 start -->
                    <a-row class="mt-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">线宽</div>
                      </a-col>
                      <a-col :span="18">
                        <a-input-number
                          v-model="currentCom.setting.style.echart.customSeries.lineStyle.width"
                          size="small"
                          :min="0"
                          @change="width => doWithSeries('lineStyle', { width })"
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <!-- 线宽 end -->
                    <!-- 标记点 开启 start -->
                    <a-row>
                      <a-col :span="6" class="unit-show-block position mt-4 mb-4">
                        <div class="unit-block-title">标记点</div>
                      </a-col>
                      <a-col :span="18">
                        <UnitCheckbox
                          class="show-btn"
                          label="显示"
                          style="top: -0px"
                          :value="currentCom.setting.style.echart.customShowSymbol"
                          @change="value => doWithShowSymbol(value)"
                        ></UnitCheckbox>
                      </a-col>
                    </a-row>
                    <!-- 标记点 开启 end -->
                    <!-- 标记点大小 start -->
                    <a-row>
                      <a-col :span="10" class="unit-show-block position">
                        <div class="unit-block-title">标记点大小</div>
                      </a-col>
                      <a-col :span="14">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customSeries.symbolSize"
                          :min="0"
                          @change="symbolSize => doWithSeries('symbolSize', symbolSize)"
                        />
                      </a-col>
                    </a-row>
                    <!-- 标记点大小 end -->
                    <!-- 区域透明度 start -->
                    <a-row class="mt-8">
                      <a-col :span="10" class="unit-show-block position">
                        <div class="unit-block-title">区域透明度</div>
                      </a-col>
                      <a-col :span="14">
                        <a-input-number
                          v-model="currentCom.setting.style.echart.customSeries.areaStyle.opacity"
                          size="small"
                          :max="1"
                          :min="0"
                          :step="0.1"
                          @change="opacity => doWithSeries('areaStyle', { opacity })"
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <!-- 区域透明度 end -->
                  </div>
                  <!-- 图表样式 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="图例设置">
                  <UnitLegend
                    :legend="currentCom.setting.style.echart.legend"
                    @change="
                      (key, value, isReset, beforeExecute, afterExecute) =>
                        handleChange(key, value, isReset, beforeExecute, afterExecute)
                    "
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
                <CollapsePanel class="content-item" panel="yaxis" header="颜色设置">
                  <!-- 颜色 start -->
                  <UnitChartColor
                    :color="currentCom.setting.style.echart.color"
                    type="color"
                    @change="(key, value) => handleChange(key, value)"
                  ></UnitChartColor>
                  <!-- 颜色 end -->
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
            <!-- <TabPanel tab="interaction" label="交互">
              <Collapse>
                <CollapsePanel class="content-item" panel="connect" header="图表联动"> -->
            <!-- 图表联动 start -->
            <!-- <UnitConnect
                    class="setting-unit-content"
                    @change="
                      value =>
                        handleChange('echart', {
                          customIsOpenDataLink: value,
                        })
                    "
                  ></UnitConnect> -->
            <!-- 图表联动 end -->
            <!-- </CollapsePanel>
              </Collapse>
            </TabPanel> -->
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
  name: `${BoardType.ChartLine}Setting`,
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
      dataCollapseActive: ['dimension', 'measure', 'reset', 'dataFilter', 'dataSort'], // 折叠打开选项
      styleCollapseActive: [],
    };
  },
  methods: {
    /**
     * @description 处理 图表样式 线形
     */
    doWithSmooth(customLinear) {
      this.handleChange('echart', {
        customLinear,
      });
    },
    /**
     * @description 处理 图表样式 是否显示标记点
     */
    doWithShowSymbol(customShowSymbol) {
      this.handleChange('echart', {
        customShowSymbol,
        customSeries: {
          symbolSize: customShowSymbol ? 4 : 0,
        },
      });
    },
  },
};
</script>
