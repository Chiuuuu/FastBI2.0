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
                      :labelPositionList="labelPositionList"
                      @change="(key, value) => doWithSeries(key, value)"
                    ></UnitLabel>
                    <!-- 展示数值 end -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="10" class="unit-show-block">
                        <div class="unit-block-title">柱条宽度(%)</div>
                      </a-col>
                      <!-- 柱条宽度 start -->
                      <a-col :span="14">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customBarWidth"
                          @change="value => handleChange('echart', { customBarWidth: value })"
                        ></a-input-number>
                      </a-col>
                      <!-- 柱条宽度 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">柱形圆角</div>
                      </a-col>
                      <!-- 圆角 start -->
                      <a-col :span="18">
                        <!-- 圆角是否启用 start -->
                        <UnitCheckbox
                          class="show-btn"
                          label="启用"
                          style="top: -6px"
                          :value="currentCom.setting.style.echart.customSeries.itemStyle.borderRadius ? true : false"
                          @change="value => handleItemStyle('borderRadius', value)"
                        ></UnitCheckbox>
                        <!-- 圆角是否启用 end -->
                      </a-col>
                      <!-- 圆角 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="10" class="unit-show-block">
                        <div class="unit-block-title">柱条间隔(%)</div>
                      </a-col>
                      <!-- 柱条间隔 start -->
                      <a-col :span="14">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customBarGap"
                          @change="value => handleChange('echart', { customBarGap: value })"
                        ></a-input-number>
                      </a-col>
                      <!-- 柱条间隔 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8 mt-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">形状</div>
                      </a-col>
                      <!-- 形状 方式 start -->
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          class="float-right"
                          :value="currentCom.setting.style.echart.customStack"
                          @change="event => handleShape('customStack', event.target.value)"
                        >
                          <a-radio-button :value="false">分布</a-radio-button>
                          <a-radio-button :value="true">堆叠</a-radio-button>
                        </a-radio-group>
                      </a-col>
                      <!-- 形状 方式 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">方向</div>
                      </a-col>

                      <!-- 方向 start -->
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          class="float-right"
                          :value="currentCom.setting.style.echart.customShape"
                          @change="event => handleShape('customShape', event.target.value)"
                        >
                          <a-radio-button value="horizontal">水平</a-radio-button>
                          <a-radio-button value="vertical">垂直</a-radio-button>
                        </a-radio-group>
                      </a-col>
                      <!-- 方向 end -->
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
  name: `${BoardType.ChartBar}Setting`,
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
      dataCollapseActive: ['dimension', 'measure', 'dataFilter', 'dataSort', 'reset'], // 折叠打开选项
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
     * @description 更改形状
     */
    handleShape(key, value) {
      // 方向改变时，若设置了圆角，则值也要相应变
      if (key === 'customShape' && this.currentCom.setting.style.echart.customSeries.itemStyle.borderRadius) {
        this.handleChange('echart', {
          [key]: value,
          customSeries: {
            itemStyle: {
              borderRadius: value === 'vertical' ? [50, 50, 0, 0] : [0, 50, 50, 0],
            },
          },
        });
        return;
      }
      this.handleChange('echart', {
        [key]: value,
      });
    },
    /**
     * @description 更改柱状条宽度
     */
    handleBarWidthChange(val) {
      this.handleChange('echart', {
        customBarWidth: val,
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
     * @description 图形样式设置
     */
    handleItemStyle(key, value) {
      // 圆角开启
      if (key === 'borderRadius') {
        let radiusVal =
          this.currentCom.setting.style.echart.customShape === 'vertical' ? [50, 50, 0, 0] : [0, 50, 50, 0];
        value = value === true ? radiusVal : 0;
      }
      this.doWithSeries('itemStyle', {
        [key]: value,
      });
    },
  },
};
</script>
<style lang="less">
@deep: ~'>>>';
.color-modal-wrap {
  .ant-modal-header {
    padding: 10px 24px;
    .ant-modal-title {
      font-size: 14px;
    }
    border-radius: 2px 2px 0 0;
  }
  .ant-modal-close-x {
    width: 43px;
    height: 43px;
    font-size: 14px;
    font-style: normal;
    line-height: 43px;
  }
  .color-modal-body {
    max-height: 250px;
    overflow-y: auto;
  }
  .ant-modal-footer {
    .ant-btn {
      border-radius: 2px;
      height: 28px;
      padding: 0 20px;
    }
  }
}
</style>
