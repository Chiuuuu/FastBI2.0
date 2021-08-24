<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">普通饼图</h2>
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
                    :list="currentCom.setting.data.filter.sort"
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
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="7">
                        <div class="unit-block-title">中心坐标</div>
                      </a-col>

                      <!-- 中心点 X坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">X</div>
                        <a-input
                          :value="currentCom.setting.style.echart.customSeries.center[0]"
                          @change="e => handleCenter(e.target.value, 0)"
                        ></a-input>
                      </a-col>
                      <!-- 中心点 X坐标 end -->
                      <!-- 中心点 Y坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">Y</div>
                        <a-input
                          :value="currentCom.setting.style.echart.customSeries.center[1]"
                          @change="e => handleCenter(e.target.value, 1)"
                        ></a-input>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>
                    <!-- 内环大小 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">内环半径</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input
                          :value="currentCom.setting.style.echart.customSeries.radius[0]"
                          @change="e => handleRadius(e.target.value, 0)"
                        ></a-input>
                      </a-col>
                    </a-row>
                    <!-- 内环大小 end -->
                    <!-- 外环大小 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">外环半径</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input
                          :value="currentCom.setting.style.echart.customSeries.radius[1]"
                          @change="e => handleRadius(e.target.value, 1)"
                        ></a-input>
                      </a-col>
                    </a-row>
                    <!-- 外环大小 end -->
                    <a-row class="unit-show-block mb-6">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">扇形个数</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.customLimit"
                          @change="customLimit => handleChange('echart', { customLimit })"
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="玫瑰图设置"
                      :value="currentCom.setting.style.echart.customRoseType.show"
                      @change="value => handleRose('show', value)"
                    ></UnitCheckbox>
                    <a-row class="unit-show-block mb-8 mt-3" v-if="currentCom.setting.style.echart.customRoseType.show">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">展示</div>
                      </a-col>
                      <!-- 形状 方式 start -->
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          class="float-right"
                          :value="currentCom.setting.style.echart.customRoseType.type"
                          @change="event => handleRose('type', event.target.value)"
                        >
                          <a-radio-button value="radius">半径</a-radio-button>
                          <a-radio-button value="area">面积</a-radio-button>
                        </a-radio-group>
                      </a-col>
                      <!-- 形状 方式 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="label" header="指标设置">
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
                          <a-select-option value="percent">百分比</a-select-option>
                          <a-select-option value="nv">维度+值</a-select-option>
                          <a-select-option value="np">维度+百分比</a-select-option>
                          <a-select-option value="vp">值+百分比</a-select-option>
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
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">位置</div>
                      </a-col>
                      <!-- 标签 位置 start -->
                      <a-radio-group
                        name="radioGroup"
                        class="float-right"
                        :value="currentCom.setting.style.echart.customSeries.label.position"
                        @change="event => handleLabel('position', event.target.value)"
                      >
                        <a-radio-button value="inside">内部</a-radio-button>
                        <a-radio-button value="outside">外部</a-radio-button>
                      </a-radio-group>
                      <!-- 标签 位置 end -->
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
  name: `${BoardType.ChartPie}Setting`,
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
      const ways = {
        name: '{b}\n',
        value: '{c}\n',
        percent: '{d}%\n',
        nv: '{b}\n{c}',
        np: '{b}\n{d}%',
        vp: '{c}\n{d}%',
        all: '{b}\n{c} ({d})%',
      };
      const formatter = ways[value] || '{b}\n';
      this.handleChange('echart', {
        customFormatterWay: value,
        customSeries: {
          label: {
            formatter,
          },
        },
      });
    },
    /**
     * @description 处理半径
     */
    handleRadius(value, index) {
      const radius = [].concat(this.currentCom.setting.style.echart.customSeries.radius);
      radius.splice(index, 1, value);
      this.doWithSeries('radius', radius);
    },
    /**
     * @description 处理中心点
     */
    handleCenter(value, index) {
      const center = [].concat(this.currentCom.setting.style.echart.customCenter);
      center.splice(index, 1, value);
      this.doWithSeries('center', center);
    },
    handleRose(key, value) {
      this.handleChange('echart', {
        customRoseType: {
          [key]: value,
        },
      });
    },
  },
};
</script>
