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
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="7">
                        <div class="unit-block-title">中心点(%)</div>
                      </a-col>

                      <!-- 中心点 X坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">X</div>
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customCenter[0]"
                          @change="value => handleCenter(value, 0)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 X坐标 end -->
                      <!-- 中心点 Y坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">Y</div>
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customCenter[1]"
                          @change="value => handleCenter(value, 1)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">内半径(%)</div>
                      </a-col>

                      <!-- 内半径 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customInRadius"
                          @change="customInRadius => handleRadius('customInRadius', customInRadius)"
                        ></a-input-number>
                      </a-col>
                      <!-- 内半径 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">外半径(%)</div>
                      </a-col>

                      <!-- 外半径 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customOutRadius"
                          @change="customOutRadius => handleRadius('customOutRadius', customOutRadius)"
                        ></a-input-number>
                      </a-col>
                      <!-- 外半径 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="10" class="unit-show-block">
                        <div class="unit-block-title">区域透明度</div>
                      </a-col>
                      <a-col :span="14">
                        <a-input-number
                          :min="0"
                          :max="1"
                          :step="0.1"
                          :value="currentCom.setting.style.echart.customSeries.areaStyle.opacity"
                          @change="opacity => doWithSeries('areaStyle', { opacity })"
                        />
                      </a-col>
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">展示</div>
                      </a-col>

                      <!-- 展示类型 方式 start -->
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          class="float-right"
                          :value="currentCom.setting.style.echart.radar.shape"
                          @change="event => handleRadar('shape', event.target.value)"
                        >
                          <a-radio-button value="polygon">多边</a-radio-button>
                          <a-radio-button value="circle">圆形</a-radio-button>
                        </a-radio-group>
                      </a-col>
                      <!-- 展示类型 方式 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">外圈字体</div>
                      </a-col>
                      <!-- 外圈字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.radar.axisName.color"
                            @change="color => handleRadar('axisName', { color })"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 外圈字体 颜色 end -->

                      <!-- 外圈字体 大小 start -->
                      <a-col :span="12">
                        <a-input-number
                          :value="currentCom.setting.style.echart.radar.axisName.fontSize"
                          :min="0"
                          @change="fontSize => handleRadar('axisName', { fontSize })"
                        />
                      </a-col>
                      <!-- 外圈字体 大小 end -->
                    </a-row>
                    <!-- 指标 start -->
                    <UnitLabel
                      label="指标"
                      :seriesLabel="currentCom.setting.style.echart.customSeries.label"
                      :labelPositionList="labelPositionList"
                      @change="(key, value) => doWithSeries(key, value)"
                    ></UnitLabel>
                    <!-- 指标 end -->
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
                <CollapsePanel class="content-item" panel="split" header="分割设置">
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">段数</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.radar.splitNumber"
                          @change="splitNumber => handleRadar('splitNumber', splitNumber)"
                        />
                      </a-col>
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="线设置"
                      :value="currentCom.setting.style.echart.radar.splitLine.show"
                      @change="show => handleRadar('splitLine', { show })"
                    ></UnitCheckbox>
                    <a-row class="unit-show-block mb-4">
                      <!-- 分割线 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.radar.splitLine.lineStyle.color"
                            @change="
                              color =>
                                handleRadar('splitLine', {
                                  lineStyle: { color },
                                })
                            "
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 分割线 类型 start -->
                      <a-col :span="9">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.radar.splitLine.lineStyle.type"
                          @change="
                            type =>
                              handleRadar('splitLine', {
                                lineStyle: { type },
                              })
                          "
                        >
                          <a-select-option value="solid">实线</a-select-option>
                          <a-select-option value="dashed">虚线</a-select-option>
                          <a-select-option value="dotted">点线</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 分割线 类型 end -->
                      <a-col :span="10" :offset="1">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.radar.splitLine.lineStyle.width"
                          @change="
                            width =>
                              handleRadar('splitLine', {
                                lineStyle: { width },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">透明度</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="1"
                          :step="0.1"
                          :value="currentCom.setting.style.echart.radar.splitLine.lineStyle.opacity"
                          @change="
                            opacity =>
                              handleRadar('splitLine', {
                                lineStyle: { opacity },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="区域设置"
                      :value="currentCom.setting.style.echart.radar.splitArea.show"
                      @change="show => handleRadar('splitArea', { show })"
                    ></UnitCheckbox>
                    <UnitBackgroundColor
                      class="mb-4"
                      :color="currentCom.setting.style.echart.radar.splitArea.areaStyle.color[0]"
                      label="奇数颜色"
                      @change="color => handleAreaColor(color, 0)"
                    ></UnitBackgroundColor>
                    <UnitBackgroundColor
                      class="mb-4"
                      :color="currentCom.setting.style.echart.radar.splitArea.areaStyle.color[1]"
                      label="偶数颜色"
                      @change="color => handleAreaColor(color, 1)"
                    ></UnitBackgroundColor>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">透明度</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="1"
                          :step="0.1"
                          :value="currentCom.setting.style.echart.radar.splitArea.areaStyle.opacity"
                          @change="
                            opacity =>
                              handleRadar('splitArea', {
                                areaStyle: { opacity },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="axis" header="轴线设置">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.radar.axisLine.show"
                      @change="show => handleRadar('axisLine', { show })"
                    ></UnitCheckbox>
                    <a-row class="unit-show-block mb-8">
                      <!-- 分割线 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.radar.axisLine.lineStyle.color"
                            @change="
                              color =>
                                handleRadar('axisLine', {
                                  lineStyle: { color },
                                })
                            "
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 分割线 类型 start -->
                      <a-col :span="9">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.radar.axisLine.lineStyle.type"
                          @change="
                            type =>
                              handleRadar('axisLine', {
                                lineStyle: { type },
                              })
                          "
                        >
                          <a-select-option value="solid">实线</a-select-option>
                          <a-select-option value="dashed">虚线</a-select-option>
                          <a-select-option value="dotted">点线</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 分割线 类型 end -->
                      <a-col :span="10" :offset="1">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.radar.axisLine.lineStyle.width"
                          @change="
                            width =>
                              handleRadar('axisLine', {
                                lineStyle: { width },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">透明度</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="1"
                          :step="0.1"
                          :value="currentCom.setting.style.echart.radar.axisLine.lineStyle.opacity"
                          @change="
                            opacity =>
                              handleRadar('axisLine', {
                                lineStyle: { opacity },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                    </a-row>
                  </div>
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
  name: `${BoardType.ChartRadar}Setting`,
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
      labelPositionList: [
        //标签位置
        { name: '内部', value: 'inside' },
        { name: '顶部', value: 'top' },
      ],
    };
  },
  methods: {
    /**
     * @description 处理半径
     */
    handleRadius(key, value) {
      this.handleChange('echart', {
        [key]: value,
      });
    },
    /**
     * @description 处理中心点
     */
    handleCenter(value, index) {
      const center = [].concat(this.currentCom.setting.style.echart.customCenter);
      center.splice(index, 1, value);
      this.handleChange('echart', {
        customCenter: center,
      });
    },
    handleAreaColor(color, index) {
      const colors = [].concat(this.currentCom.setting.style.echart.radar.splitArea.areaStyle.color);
      colors.splice(index, 1, color);
      this.handleRadar('splitArea', {
        areaStyle: {
          color: colors,
        },
      });
    },
    handleRadar(key, value) {
      this.handleChange('echart', {
        radar: {
          [key]: value,
        },
      });
    },
  },
};
</script>
