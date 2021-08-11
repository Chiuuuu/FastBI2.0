<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">旭日图</h2>
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
                <CollapsePanel class="content-item" panel="dataSort" header="排序">
                  <!-- 数据排序 start -->
                  <UnitDataSort
                    class="setting-unit-content"
                    type="dataSort"
                    label="拖入字段"
                    limit
                    :openAggre="true"
                    :list="currentCom.setting.data.options.sort"
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
                <CollapsePanel class="content-item" panel="bgAndBorder" header="背景和边框">
                  <div class="setting-unit-content">
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
                <CollapsePanel class="content-item" panel="legend" header="样式设置">
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
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="radius" header="半径">
                  <div class="setting-unit-content">
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
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="label" header="标签">
                  <div class="setting-unit-content">
                    <!-- 标签是否显示 start -->
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.customLabel.show"
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
                          <a-select-option value="nv">维度+值</a-select-option>
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
                            :value="currentCom.setting.style.echart.customLabel.color"
                            @change="color => handleLabel('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 标签 字体 颜色 end -->

                      <!-- 标签 字体 大小 start -->
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customLabel.fontSize"
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
                        :value="currentCom.setting.style.echart.customLabel.position"
                        @change="event => handleLabel('position', event.target.value)"
                      >
                        <a-radio value="inside">内部</a-radio>
                        <a-radio value="outside">外部</a-radio>
                      </a-radio-group>
                      <!-- 标签 位置 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">旋转</div>
                      </a-col>

                      <!-- 标签 位置 start -->
                      <a-radio-group
                        name="rotateGroup"
                        :value="currentCom.setting.style.echart.customLabel.rotate"
                        @change="event => handleLabel('rotate', event.target.value)"
                      >
                        <a-radio value="radial">径向</a-radio>
                        <a-radio value="tangential">切向</a-radio>
                      </a-radio-group>
                      <!-- 标签 位置 end -->
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="是否允许标签重叠"
                      :value="!currentCom.setting.style.echart.customLabelLayout.hideOverlap"
                      @change="
                        hideOverlap =>
                          handleChange('echart', {
                            customLabelLayout: {
                              hideOverlap: !hideOverlap,
                            },
                          })
                      "
                    ></UnitCheckbox>
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
            <TabPanel tab="interaction" label="交互">
              <Collapse>
                <CollapsePanel class="content-item" panel="connect" header="图表联动">
                  <!-- 图表联动 start -->
                  <UnitConnect class="setting-unit-content"></UnitConnect>
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
  name: `${BoardType.ChartSunburst}Setting`,
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
      this.handleChange('echart', {
        customLabel: {
          [key]: value,
        },
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
     * @description 内容显示方式
     */
    handleFormatterWay(value) {
      this.handleChange('echart', {
        customFormatterWay: value,
      });
    },
  },
};
</script>
