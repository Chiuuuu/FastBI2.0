<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">环形饼图</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel class="content-item" panel="measure" header="度量">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn mt-8"
                      label="目标值配置"
                      :value="currentCom.setting.style.echart.customTarge"
                      @change="value => handleTarge(value)"
                    ></UnitCheckbox>
                    <!-- 度量 start -->
                    <UnitField
                      receive="measure"
                      type="progress"
                      label="拖入进度值"
                      backgroundColor="#40c0a8"
                      openAggre
                      limit
                      :list="currentCom.setting.data.progress"
                    ></UnitField>
                    <!-- 度量 end -->
                    <UnitField
                      v-if="currentCom.setting.style.echart.customTarge"
                      receive="measure"
                      type="targe"
                      label="拖入目标值"
                      backgroundColor="#40c0a8"
                      openAggre
                      limit
                      :list="currentCom.setting.data.targe"
                    ></UnitField>
                  </div>
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
                <CollapsePanel class="content-item" panel="legend" header="图形属性">
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

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customInRadius"
                          @change="customInRadius => handleRadius('customInRadius', customInRadius)"
                        ></a-input-number>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">外半径(%)</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.customOutRadius"
                          @change="customOutRadius => handleRadius('customOutRadius', customOutRadius)"
                        ></a-input-number>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="指标设置">
                  <div class="setting-unit-content">
                    <!-- 指标是否显示 start -->
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.customSeries.label.show"
                      @change="show => handleLabel('show', show)"
                    ></UnitCheckbox>
                    <!-- 指标是否显示 end -->

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
                          <a-select-option value="name">名称</a-select-option>
                          <a-select-option value="value">值</a-select-option>
                          <a-select-option value="percent">百分比</a-select-option>
                          <a-select-option value="nv">名称+值</a-select-option>
                          <a-select-option value="np">名称+百分比</a-select-option>
                          <a-select-option value="vp">值+百分比</a-select-option>
                          <a-select-option value="all">全部</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                    <!-- 小数位数 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">小数位数</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customFixed"
                          :min="0"
                          :max="5"
                          @change="customFixed => this.handleChange('echart', { customFixed })"
                        />
                      </a-col>
                    </a-row>
                    <!-- 小数位数 end -->

                    <!-- 指标相关设置 start -->
                    <!-- 文本 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">文本</div>
                      </a-col>
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.customSeries.label.color"
                            @change="color => this.handleLabel('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customSeries.label.fontSize"
                          :min="0"
                          @change="fontSize => this.handleLabel('fontSize', fontSize)"
                        />
                      </a-col>
                    </a-row>
                    <!-- 文本 end -->

                    <!-- 字体 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">字体</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.customSeries.label.fontFamily"
                          @change="fontFamily => this.handleLabel('fontFamily', fontFamily)"
                        >
                          <a-select-option :value="item.value" v-for="(item, index) in fontFamily" :key="index">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 字体 end -->

                    <!-- 粗细 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">粗细</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.customSeries.label.fontWeight"
                          @change="fontWeight => this.handleLabel('fontWeight', fontWeight)"
                        >
                          <a-select-option value="normal">正常</a-select-option>
                          <a-select-option value="bolder">加粗</a-select-option>
                          <a-select-option value="lighter">更细</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 粗细 end -->

                    <!-- 显示位置 start -->
                    <a-row class="unit-show-block mb-10">
                      <a-col :span="5" class="unit-show-block position">
                        <div class="unit-block-title">位置</div>
                      </a-col>
                      <a-radio-group
                        class="float-right"
                        :value="currentCom.setting.style.echart.customSeries.label.position"
                        @change="e => this.handleLabel('position', e.target.value)"
                      >
                        <a-radio-button value="center">中心</a-radio-button>
                        <a-radio-button value="outside">外部</a-radio-button>
                        <a-radio-button value="inside">内部</a-radio-button>
                      </a-radio-group>
                    </a-row>
                    <!-- 显示位置 end -->
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="legend" header="颜色设置">
                  <div class="setting-unit-content">
                    <!-- 数值 颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="数值颜色"
                      :color="currentCom.setting.style.echart.customColors[0]"
                      @change="color => handleColorChange(color, 0)"
                    ></UnitBackgroundColor>
                    <!-- 数值 颜色 end -->

                    <!-- 背景 颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.echart.customColors[1]"
                      @change="color => handleColorChange(color, 1)"
                    ></UnitBackgroundColor>
                    <!-- 背景 颜色 end -->
                  </div>
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
import fontFamily from '@/utils/fontFamily';
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
      fontFamily, // 字体
    };
  },
  methods: {
    /**
     * @description 指标设置
     */
    handleLabel(key, value) {
      this.doWithSeries('label', {
        [key]: value,
      });
    },
    /**
     * @description 是否启用目标值配置
     */
    handleTarge(value) {
      this.handleChange('echart', {
        customTarge: value,
      });
    },
    /**
     * @description 内容显示方式
     */
    handleFormatterWay(way) {
      this.handleChange('echart', {
        customFormatterWay: way,
      });
    },
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
    /**
     * @description 处理颜色
     */
    handleColorChange(color, index) {
      const colors = [].concat(this.currentCom.setting.style.echart.customColors);
      colors.splice(index, 1, color);
      this.handleChange('echart', {
        customColors: colors,
      });
    },
  },
};
</script>
