<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">{{ currentCom.name }}</h2>
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
                    limit
                    :list="currentCom.setting.data.xaxis"
                  ></UnitField>
                  <UnitField
                    class="setting-unit-content"
                    type="yaxis"
                    label="拖入Y轴"
                    receive="dimension"
                    backgroundColor="#4a90e2"
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

                    <a-row class="unit-show-block mb-3" v-if="labelPositionList.length">
                      <a-col :span="6">
                        <div class="unit-block-title">矩形颜色</div>
                      </a-col>

                      <!-- 标签 位置 start -->
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.customVisualMapColor"
                          @change="handleCustomVisualMapColor"
                        >
                          <a-select-option value="gradient">按度量</a-select-option>
                          <a-select-option value="fullfilled">不区分</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 标签 位置 end -->
                    </a-row>
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
                        <a-select
                          mode="tags"
                          :value="currentCom.setting.style.echart.customFormatterWay"
                          style="width: 100%"
                          @change="customFormatterWay => handleChange('echart', { customFormatterWay })"
                        >
                          <a-select-option v-for="(item, index) in concatDimAndMea" :key="item" :value="index + ''">
                            {{ item }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="style" header="鼠标移入提示">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.tooltip.show"
                      @change="value => handleChange('echart', { tooltip: { show: value } })"
                    ></UnitCheckbox>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24">
                        <div class="unit-block-title">指标内容</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="24">
                        <a-select
                          mode="tags"
                          :value="currentCom.setting.style.echart.customTooltipFormatter"
                          style="width: 100%"
                          @change="customTooltipFormatter => handleChange('echart', { customTooltipFormatter })"
                        >
                          <!-- select mode="tags"时，option的key和value必须是string -->
                          <a-select-option v-for="(item, index) in concatDimAndMea" :key="item" :value="index + ''">
                            {{ item }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="图例设置">
                  <UnitLegend
                    :legend="currentCom.setting.style.echart.visualMap"
                    :except="['itemGap', 'icon']"
                    @change="(key, value) => handleVisulMap(key, value)"
                  >
                    <div slot="conTop">
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8" class="mb-4">
                          <div class="unit-block-title">图例颜色</div>
                        </a-col>

                        <!-- 连续型 颜色设置 start -->
                        <a-col :span="16">
                          <div class="piecewise-colors float-right">
                            <div class="font-color">
                              <ColorPicker
                                :value="currentCom.setting.style.echart.visualMap.inRange.color[1]"
                                @change="color => handleInRangeColor(color, 1)"
                              ></ColorPicker>
                            </div>
                          </div>
                        </a-col>
                        <!-- 连续型 颜色设置 end -->
                      </a-row>
                    </div>
                  </UnitLegend>
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
            <TabPanel tab="interaction" label="交互">
              <Collapse>
                <CollapsePanel class="content-item" panel="connect" header="图表联动">
                  <!-- 图表联动 start -->
                  <UnitConnect
                    class="setting-unit-content"
                    @change="
                      value =>
                        handleChange('echart', {
                          customIsOpenDataLink: value,
                        })
                    "
                  ></UnitConnect>
                  <!-- 图表联动 end -->
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
  computed: {
    // 维度度量合并列表
    concatDimAndMea() {
      const { measures = [], xaxis = [], yaxis = [] } = this.currentCom.setting.data;
      if (xaxis.concat(yaxis, measures).length >= 3) {
        return xaxis.concat(yaxis, measures).map(item => item.alias);
      } else {
        return ['x轴', 'y轴', '度量'];
      }
    },
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
    /**
     * @description 图例颜色
     */
    handleInRangeColor(value, index) {
      let color = this.currentCom.setting.style.echart.visualMap.inRange.color;
      color[index] = value;
      this.handleChange('echart', {
        visualMap: {
          inRange: {
            color: color,
          },
        },
      });
    },
    /**
     * @description 是否按度量区分颜色
     */
    handleCustomVisualMapColor(customVisualMapColor) {
      // 不区分, 将前后颜色保持一致
      if (customVisualMapColor === 'fullfilled') {
        const color = this.currentCom.setting.style.echart.visualMap.inRange.color[1];
        this.handleInRangeColor(color, 0);
      } else {
        // 区分, 将头部颜色替换成白色
        this.handleInRangeColor('#ffffff', 0);
      }
      this.handleChange('echart', { customVisualMapColor });
    },
  },
};
</script>
<style lang="less" scoped>
.piecewise-colors {
  display: flex;
  .font-color {
    margin-left: 4px;
  }
}
</style>
