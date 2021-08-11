<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">普通仪表盘</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel class="content-item" panel="progress" header="进度值">
                  <div class="setting-unit-content">
                    <!-- 度量 end -->
                    <UnitField
                      receive="measure"
                      type="progress"
                      label="拖入度量"
                      backgroundColor="#40c0a8"
                      openAggre
                      limit
                      :list="currentCom.setting.data.progress"
                    ></UnitField>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="range" header="范围">
                  <div class="setting-unit-content">
                    <!-- 最小值 start -->
                    <p>最小值</p>
                    <UnitInputField
                      receive="measure"
                      type="min"
                      label="输入值或拖入度量"
                      backgroundColor="#40c0a8"
                      openAggre
                      :list="currentCom.setting.data.min"
                    ></UnitInputField>
                    <!-- 最小值 end -->

                    <!-- 最大值 start -->
                    <p class="mt-8">最大值</p>
                    <UnitInputField
                      receive="measure"
                      type="max"
                      label="输入值或拖入度量"
                      backgroundColor="#40c0a8"
                      openAggre
                      :list="currentCom.setting.data.max"
                    ></UnitInputField>
                    <!-- 最大值 end -->
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="targe" header="目标值">
                  <div class="setting-unit-content">
                    <!-- 度量 end -->
                    <UnitInputField
                      receive="measure"
                      type="targe"
                      label="输入值或拖入度量"
                      backgroundColor="#40c0a8"
                      openAggre
                      :list="currentCom.setting.data.targe"
                    ></UnitInputField>
                  </div>
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

                <CollapsePanel class="content-item" panel="label" header="标签">
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">字体</div>
                      </a-col>

                      <!-- 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="gague.title.color"
                            @change="color => handleTarget('title', { color })"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 字体 颜色 end -->

                      <a-col :span="16">
                        <a-row>
                          <!-- 字体 大小 start -->
                          <a-col :span="14">
                            <a-input-number
                              :value="gague.title.fontSize"
                              :min="0"
                              @change="fontSize => handleTarget('title', { fontSize })"
                            />
                          </a-col>
                          <!-- 字体 大小 end -->

                          <a-col :span="10">
                            <UnitCheckbox
                              class="show-btn block-checkbox"
                              label="显示"
                              :value="gague.title.show"
                              @change="show => handleTarget('title', { show })"
                            ></UnitCheckbox>
                          </a-col>
                        </a-row>
                      </a-col>
                    </a-row>
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
                          :value="handleSplitPercent(gague.title.offsetCenter[0])"
                          @change="value => handleCenter('title', value, gague.title.offsetCenter, 0)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 X坐标 end -->
                      <!-- 中心点 Y坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">Y</div>
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="handleSplitPercent(gague.title.offsetCenter[1])"
                          @change="value => handleCenter('title', value, gague.title.offsetCenter, 1)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="current" header="进度值设置">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="gague.progress.show"
                      @change="value => handleTargetShow(value)"
                    ></UnitCheckbox>

                    <a-row class="unit-show-block mb-8">
                      <!-- 进度值 颜色 start -->
                      <UnitBackgroundColor
                        class="mb-8"
                        label="进度颜色"
                        :color="gague.progress.itemStyle.color"
                        @change="color => handleTarget('progress', { itemStyle: { color } })"
                      ></UnitBackgroundColor>
                      <!-- 进度值 颜色 end -->
                    </a-row>

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">字体</div>
                      </a-col>

                      <!-- 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="gague.detail.color"
                            @change="color => handleTarget('detail', { color })"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 字体 颜色 end -->

                      <a-col :span="16">
                        <a-row>
                          <!-- 字体 大小 start -->
                          <a-col :span="14">
                            <a-input-number
                              :value="gague.detail.fontSize"
                              :min="0"
                              @change="fontSize => handleTarget('detail', { fontSize })"
                            />
                          </a-col>
                          <!-- 字体 大小 end -->

                          <a-col :span="10">
                            <UnitCheckbox
                              class="show-btn block-checkbox"
                              label="显示"
                              :value="gague.detail.show"
                              @change="show => handleTarget('detail', { show })"
                            ></UnitCheckbox>
                          </a-col>
                        </a-row>
                      </a-col>
                    </a-row>
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
                          :value="handleSplitPercent(gague.detail.offsetCenter[0])"
                          @change="value => handleCenter('detail', value, gague.detail.offsetCenter, 0)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 X坐标 end -->
                      <!-- 中心点 Y坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">Y</div>
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="handleSplitPercent(gague.detail.offsetCenter[1])"
                          @change="value => handleCenter('detail', value, gague.detail.offsetCenter, 1)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>
                  </div>
                </CollapsePanel>

                <CollapsePanel class="content-item" panel="target" header="目标值设置">
                  <div class="setting-unit-content">
                    <!-- 进度颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="进度颜色"
                      :color="currentCom.setting.style.echart.customTarget.color"
                      @change="color => handleTargetColor('color', color)"
                    ></UnitBackgroundColor>
                    <!-- 进度颜色 end -->

                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="背景颜色"
                      :color="currentCom.setting.style.echart.customTarget.backgroundColor"
                      @change="color => handleTargetColor('backgroundColor', color)"
                    ></UnitBackgroundColor>
                    <!-- 背景颜色 end -->
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="pointer" header="指针设置">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn block-checkbox"
                      label="显示"
                      :value="gague.pointer.show"
                      @change="show => handleTarget('pointer', { show })"
                    ></UnitCheckbox>

                    <a-row class="unit-show-block mb-8">
                      <!-- 指针颜色 start -->
                      <UnitBackgroundColor
                        label="颜色"
                        :color="gague.pointer.itemStyle.color"
                        @change="
                          color =>
                            handleTarget('pointer', {
                              itemStyle: { color },
                            })
                        "
                      ></UnitBackgroundColor>
                      <!-- 指针颜色 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <!-- 指针宽度 start -->
                      <a-col :span="8">
                        <div class="unit-block-title">宽度</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :value="gague.pointer.width"
                          @change="width => handleTarget('pointer', { width })"
                        ></a-input-number>
                      </a-col>
                      <!-- 指针宽度 end -->
                    </a-row>

                    <a-row class="unit-show-block mb-8">
                      <!-- 指针高度 start -->
                      <a-col :span="8">
                        <div class="unit-block-title">长度(%)</div>
                      </a-col>

                      <!-- 中心点 X坐标 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="handleSplitPercent(gague.pointer.length)"
                          @change="value => handleTarget('pointer', { length: `${value}%` })"
                        ></a-input-number>
                      </a-col>
                      <!-- 指针高度 end -->
                    </a-row>

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="7">
                        <div class="unit-block-title">中心点(%)</div>
                      </a-col>

                      <!-- 中心点 X坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">X</div>
                        <a-input-number
                          :min="-100"
                          :max="100"
                          :value="handleSplitPercent(gague.pointer.offsetCenter[0])"
                          @change="value => handleCenter('pointer', value, gague.pointer.offsetCenter, 0)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 X坐标 end -->
                      <!-- 中心点 Y坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">Y</div>
                        <a-input-number
                          :min="-100"
                          :max="100"
                          :value="handleSplitPercent(gague.pointer.offsetCenter[1])"
                          @change="value => handleCenter('pointer', value, gague.pointer.offsetCenter, 1)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="style" header="样式设置">
                  <div class="setting-unit-content">
                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="背景颜色"
                      :color="gague.axisLine.lineStyle.color[0][1]"
                      @change="color => handleBG(color)"
                    ></UnitBackgroundColor>
                    <!-- 背景颜色 end -->

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">半径设置</div>
                      </a-col>

                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.customRadius"
                          :min="0"
                          :max="100"
                          @change="customRadius => handleChange('echart', { customRadius })"
                        />
                      </a-col>
                    </a-row>

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="7">
                        <div class="unit-block-title">中心点(%)</div>
                      </a-col>

                      <!-- 中心点 X坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">X</div>
                        <a-input-number
                          :min="-100"
                          :max="100"
                          :value="handleSplitPercent(gague.center[0])"
                          @change="value => handleStoreCenter(value, 0)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 X坐标 end -->
                      <!-- 中心点 Y坐标 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">Y</div>
                        <a-input-number
                          :min="-100"
                          :max="100"
                          :value="handleSplitPercent(gague.center[1])"
                          @change="value => handleStoreCenter(value, 1)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>
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
export default {
  name: `${BoardType.ChartGauge}Setting`,
  mixins: [StyleMethodMixin],
  props: {
    currentCom: {
      type: Object,
      required: true,
    },
  },
  computed: {
    gague() {
      return this.currentCom.setting.style.echart.customOptions;
    },
  },
  data() {
    return {
      tabAcitve: 'style', // tab选项栏活动目标
      dataCollapseActive: ['progress', 'range', 'targe', 'dataFilter'], // 折叠打开选项
      styleCollapseActive: [],
    };
  },
  methods: {
    handleTargetColor(key, value) {
      this.handleChange('echart', {
        customTarget: {
          [key]: value,
        },
      });
    },
    handleBG(value) {
      const ary = [].concat(this.gague.axisLine.lineStyle.color[0]);
      ary.splice(1, 1, value);
      this.handleChange('echart', {
        customOptions: {
          axisLine: {
            lineStyle: {
              color: [ary],
            },
          },
        },
      });
    },
    handleSplitPercent(value) {
      return value.split('%').shift();
    },
    handleCenter(key, value, ary, index) {
      ary = [].concat(ary);
      ary.splice(index, 1, `${value}%`);
      this.handleTarget(key, {
        offsetCenter: ary,
      });
    },
    handleStoreCenter(value, index) {
      const ary = [].concat(this.gague.center);
      ary.splice(index, 1, `${value}%`);
      this.handleTarget('center', ary);
    },
    handleTargetShow(value) {
      this.handleChange('echart', {
        customOptions: {
          progress: {
            show: value,
          },
          detail: {
            show: value,
          },
        },
      });
    },
    handleTarget(key, value) {
      this.handleChange('echart', {
        customOptions: {
          [key]: value,
        },
      });
    },
  },
};
</script>
