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
                    type="dimension"
                    label="拖入维度"
                    receive="dimension"
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
                    type="xaxis"
                    label="拖入X轴"
                    receive="measure"
                    backgroundColor="#40c0a8"
                    openAggre
                    limit
                    :list="currentCom.setting.data.xaxis"
                  ></UnitField>
                  <UnitField
                    class="setting-unit-content"
                    type="yaxis"
                    label="拖入Y轴"
                    receive="measure"
                    backgroundColor="#40c0a8"
                    openAggre
                    limit
                    :list="currentCom.setting.data.yaxis"
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
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">散点颜色</div>
                      </a-col>
                      <!-- 散点颜色 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.customScatterColor"
                          style="width: 100%"
                          @change="customScatterColor => handleChange('echart', { customScatterColor })"
                        >
                          <a-select-option :value="item.value" v-for="(item, index) in scatterColorList" :key="index">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 散点颜色 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">散点大小</div>
                      </a-col>

                      <!-- 散点大小 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.customScatterSize"
                          style="width: 100%"
                          @change="customScatterSize => handleChange('echart', { customScatterSize })"
                        >
                          <a-select-option :value="item.value" v-for="(item, index) in scatterSizeList_" :key="index">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 散点大小 end -->
                    </a-row>
                  </div>
                  <!-- 图形属性 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="指标设置">
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24" class="unit-show-block position">
                        <div class="unit-block-title">指标颜色</div>
                      </a-col>
                      <!-- 指标颜色 start -->
                      <a-col :span="22" class="unit-show-block">
                        <a-radio-group
                          name="radioGroup"
                          class="float-right"
                          :value="currentCom.setting.style.echart.customScatterTargetColor"
                          @change="event => handleScatterTargetColor('customScatterTargetColor', event.target.value)"
                        >
                          <a-radio value="0">使用图例</a-radio>
                          <a-radio value="1">自定义</a-radio>
                        </a-radio-group>
                      </a-col>
                      <a-col
                        :span="2"
                        class="unit-show-block"
                        v-if="currentCom.setting.style.echart.customScatterTargetColor === '1'"
                      >
                        <div class="font-color target-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.customSeries.label.color"
                            @change="color => doWithSeries('label', { color })"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 指标颜色 end -->
                    </a-row>
                    <!-- 字号 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="5">
                        <div class="unit-block-title">字号</div>
                      </a-col>
                      <a-col :span="19">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customSeries.label.fontSize"
                          :min="0"
                          @change="fontSize => doWithSeries('label', { fontSize })"
                        />
                      </a-col>
                    </a-row>
                    <!-- 字号 end -->
                    <!-- 字体 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="5">
                        <div class="unit-block-title">字体</div>
                      </a-col>
                      <a-col :span="19">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.customSeries.label.fontFamily"
                          @change="fontFamily => doWithSeries('label', { fontFamily })"
                        >
                          <a-select-option :value="item.value" v-for="(item, index) in fontFamily" :key="index">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 字体 end -->
                    <!-- 指标偏移 start -->
                    <a-row class="unit-show-block mb-2">
                      <a-col :span="8">
                        <div class="unit-block-title">指标偏移</div>
                      </a-col>
                      <a-col :span="15" class="float-right col-offset">
                        <div class="unit-block-title">水平</div>
                        <a-input-number
                          :value="currentCom.setting.style.echart.customSeries.label.offset[0]"
                          style="padding-left: 15px"
                          @change="value => handleLabelOffset(value, 0)"
                        />
                      </a-col>
                      <a-col :span="15" class="float-right col-offset mt-6">
                        <div class="unit-block-title">垂直</div>
                        <a-input-number
                          :value="currentCom.setting.style.echart.customSeries.label.offset[1]"
                          style="padding-left: 15px"
                          @change="value => handleLabelOffset(value, 1)"
                        />
                      </a-col>
                    </a-row>
                    <!-- 指标偏移 start -->
                    <a-row class="unit-show-block mb-10">
                      <a-col :span="24">
                        <div class="unit-block-title">显示内容</div>
                      </a-col>
                      <!-- 内容显示 start -->
                      <a-col :span="24">
                        <a-select
                          mode="multiple"
                          :value="currentCom.setting.style.echart.customScatterLabel"
                          style="width: 100%"
                          @change="formatter => handleScatterLabel(formatter)"
                        >
                          <a-select-option v-for="(item, index) in scatterFormatList_" :value="item.value" :key="index">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-10">
                      <a-col :span="5" class="unit-show-block position">
                        <div class="unit-block-title">位置</div>
                      </a-col>
                      <!-- 标签 位置 start -->
                      <a-radio-group
                        name="radioGroup"
                        class="float-right"
                        :value="currentCom.setting.style.echart.customSeries.label.position"
                        @change="event => doWithSeries('label', { position: event.target.value })"
                      >
                        <a-radio-button value="top">顶部</a-radio-button>
                        <a-radio-button value="inside">内部</a-radio-button>
                        <a-radio-button value="bottom">底部</a-radio-button>
                      </a-radio-group>
                      <!-- 标签 位置 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-10">
                      <a-col :span="5" class="unit-show-block position">
                        <div class="unit-block-title">排列</div>
                      </a-col>
                      <!-- 排列 start -->
                      <a-radio-group
                        name="radioGroup"
                        class="float-right"
                        :value="currentCom.setting.style.echart.customArrange"
                        @change="event => handleArrange('customArrange', event.target.value)"
                      >
                        <a-radio-button value="vertical">垂直</a-radio-button>
                        <a-radio-button value="horizontal">水平</a-radio-button>
                      </a-radio-group>
                      <!-- 排列 end -->
                    </a-row>
                  </div>
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
import cloneDeep from 'lodash/cloneDeep';
import fontFamily from '@/utils/fontFamily';
export default {
  name: `${BoardType.ChartScatter}Setting`,
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
      dataCollapseActive: ['dimension', 'measure', 'reset', 'dataFilter'], // 折叠打开选项
      styleCollapseActive: [],
      fontFamily, //字体
      scatterColorList: [
        // 散点颜色
        { label: '单色', value: '0' },
        { label: '按维度', value: '1' },
      ],
      scatterSizeList: [
        // 散点大小
        { label: '无', value: '' },
        { label: '按度量1', value: '0' },
        { label: '按度量2', value: '1' },
      ],
      // 标签显示内容
      scatterFormatList: [
        // { label: '无', value: '' },
        { label: '维度1', value: '{@5}：{@2}' },
        { label: '度量1', value: '{@3}：{@0}' },
        { label: '度量2', value: '{@4}：{@1}' },
        { label: '度量组', value: '({@0},{@1})' },
      ],
    };
  },
  computed: {
    // 显示内容选择列表
    scatterFormatList_() {
      let scatterFormatList = cloneDeep(this.scatterFormatList);
      if (
        this.currentCom.setting.data.dimensions.length === 1 &&
        this.currentCom.setting.data.xaxis.length === 1 &&
        this.currentCom.setting.data.yaxis.length === 1
      ) {
        scatterFormatList[0].label = this.currentCom.setting.data.dimensions[0].alias; //维度1
        scatterFormatList[1].label = this.currentCom.setting.data.xaxis[0].alias; //度量1
        scatterFormatList[2].label = this.currentCom.setting.data.yaxis[0].alias; //度量2
      }
      return scatterFormatList;
    },
    //  散点大小选择列表
    scatterSizeList_() {
      let scatterSizeList = cloneDeep(this.scatterSizeList);
      if (
        this.currentCom.setting.data.dimensions.length === 1 &&
        this.currentCom.setting.data.xaxis.length === 1 &&
        this.currentCom.setting.data.yaxis.length === 1
      ) {
        scatterSizeList[1].label = '按' + this.currentCom.setting.data.xaxis[0].alias; //度量1
        scatterSizeList[2].label = '按' + this.currentCom.setting.data.yaxis[0].alias; //度量2
      }
      return scatterSizeList;
    },
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
      });
    },
    /**
     * @description 处理 标签
     */
    doWithLabel(key, value) {
      this.handleChange('echart', {
        [key]: value,
      });
    },
    /**
     * @description 指标显示内容
     */
    handleScatterLabel(value) {
      let formatter = '';
      // 指标显示
      if (this.currentCom.setting.style.echart.customArrange === 'horizontal') {
        formatter = value.join(' ');
      } else {
        formatter = value.join('\n\r');
      }
      this.handleChange('echart', {
        customScatterLabel: value,
        customSeries: {
          label: {
            formatter,
          },
        },
      });
    },
    /**
     * @description 指标颜色
     */
    handleScatterTargetColor(key, value) {
      this.handleChange('echart', {
        [key]: value,
        customSeries: {
          label: {
            color: value === '0' ? 'inherit' : '#fff',
          },
        },
      });
    },
    /**
     * @description 指标偏移
     */
    handleLabelOffset(value, index) {
      let offset = this.currentCom.setting.style.echart.customSeries.label.offset;
      offset[index] = value;
      this.doWithSeries('label', {
        offset,
      });
    },
    /**
     * @description 排列
     */
    handleArrange(key, value) {
      // 指标显示
      let formatter = '';
      if (value === 'horizontal') {
        formatter = this.currentCom.setting.style.echart.customScatterLabel.join(' ');
      } else {
        formatter = this.currentCom.setting.style.echart.customScatterLabel.join('\n\r');
      }
      this.handleChange('echart', {
        [key]: value,
        customSeries: {
          label: {
            formatter,
          },
        },
      });
    },
  },
};
</script>
<style lang="less" scoped>
.target-color {
  position: relative;
  left: -10px;
  top: -4px;
}
</style>
