<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">普通柱状图</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel
                  class="content-item"
                  panel="dimension"
                  header="维度"
                >
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
                <CollapsePanel
                  class="content-item"
                  panel="measure"
                  header="度量"
                >
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
                <CollapsePanel
                  class="content-item"
                  panel="dataFilter"
                  header="数据筛选"
                >
                  <!-- 数据筛选 start -->
                  <UnitDataFilter class="setting-unit-content">
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
                <CollapsePanel
                  class="content-item"
                  panel="position"
                  :isTogger="false"
                >
                  <!-- 位置 start -->
                  <UnitPosition
                    class="setting-unit-content"
                    :position="currentCom.setting.style.position"
                    @change="position => handleChange('position', position)"
                  ></UnitPosition>
                  <!-- 位置 end -->
                </CollapsePanel>
                <CollapsePanel
                  class="content-item"
                  panel="size"
                  :isTogger="false"
                >
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
                <CollapsePanel
                  class="content-item"
                  panel="bgAndBorder"
                  header="背景和边框"
                >
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
                <CollapsePanel
                  class="content-item"
                  panel="chartStyle"
                  header="图表样式"
                >
                  <!-- 图表样式 start -->
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">形状</div>
                      </a-col>

                      <!-- 形状 方式 start -->
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          :value="currentCom.setting.style.echart.customStack"
                          @change="
                            event =>
                              handleShape('customStack', event.target.value)
                          "
                        >
                          <a-radio :value="false">
                            分布
                          </a-radio>
                          <a-radio :value="true">
                            堆叠
                          </a-radio>
                        </a-radio-group>
                      </a-col>
                      <!-- 形状 方式 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">方向</div>
                      </a-col>

                      <!-- 形状 方式 start -->
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          :value="currentCom.setting.style.echart.customShape"
                          @change="
                            event =>
                              handleShape('customShape', event.target.value)
                          "
                        >
                          <a-radio value="horizontal">
                            水平
                          </a-radio>
                          <a-radio value="vertical">
                            垂直
                          </a-radio>
                        </a-radio-group>
                      </a-col>
                      <!-- 形状 方式 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel
                  class="content-item"
                  panel="setStyle"
                  header="样式设置"
                >
                  <div class="setting-unit-content">
                    <UnitBackgroundColor
                      class="mb-8"
                      v-if="currentCom.setting.data.measures.length <= 1"
                      :color="
                        currentCom.setting.style.echart.customBarColors[0]
                      "
                      label="颜色"
                      @change="color => handleBarColor(color)"
                    ></UnitBackgroundColor>
                    <a-row v-else class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">逐条颜色</div>
                      </a-col>
                      <!-- 柱状条 颜色 start -->
                      <a-col :span="16">
                        <div
                          class="color-select-box"
                          @click="handleOpenColorModal"
                        >
                          颜色选择
                        </div>
                      </a-col>
                      <!-- 柱状条 颜色 end -->
                    </a-row>
                    <a-row class="unit-show-block">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">尺寸(%)</div>
                      </a-col>
                      <!-- 柱状条 颜色 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="
                            currentCom.setting.style.echart.customBarWidth
                          "
                          @change="val => handleBarWidthChange(val)"
                        ></a-input-number>
                      </a-col>
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel
                  class="content-item"
                  panel="drawing"
                  header="绘图区"
                >
                  <UnitDrawing
                    :grid="currentCom.setting.style.echart.grid"
                    :xAxis="currentCom.setting.style.echart.xAxis"
                    :yAxis="currentCom.setting.style.echart.yAxis"
                    @change="(key, value) => handleChange(key, value)"
                  ></UnitDrawing>
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
                <CollapsePanel
                  class="content-item"
                  panel="legend"
                  header="标签"
                >
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
                      <a-col :span="4">
                        <div class="unit-block-title">字体</div>
                      </a-col>

                      <!-- 标签 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="
                              currentCom.setting.style.echart.customLabel.color
                            "
                            @change="color => handleLabel('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 标签 字体 颜色 end -->

                      <!-- 标签 字体 大小 start -->
                      <a-col :span="16">
                        <a-input-number
                          :value="
                            currentCom.setting.style.echart.customLabel.fontSize
                          "
                          :min="0"
                          @change="
                            fontSize => handleLabel('fontSize', fontSize)
                          "
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
                        :value="
                          currentCom.setting.style.echart.customLabel.position
                        "
                        @change="
                          event => handleLabel('position', event.target.value)
                        "
                      >
                        <a-radio value="inside">
                          内部
                        </a-radio>
                        <a-radio value="outside">
                          外部
                        </a-radio>
                      </a-radio-group>
                      <!-- 标签 位置 end -->
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel
                  class="content-item"
                  panel="legend"
                  header="图例"
                >
                  <UnitLegend
                    :legend="currentCom.setting.style.echart.legend"
                    @change="
                      (key, value, isReset, beforeExecute, afterExecute) =>
                        handleChange(
                          key,
                          value,
                          isReset,
                          beforeExecute,
                          afterExecute
                        )
                    "
                  ></UnitLegend>
                </CollapsePanel>
                <CollapsePanel
                  class="content-item"
                  panel="reset"
                  :isTogger="false"
                >
                  <!-- 恢复默认配置 start -->
                  <div class="setting-unit-content">
                    <a-button
                      class="btn-ghost reset"
                      type="link"
                      icon="redo"
                      block
                      @click="handleClickReset"
                    >
                      恢复默认配置
                    </a-button>
                  </div>
                  <!-- 恢复默认配置 end -->
                </CollapsePanel>
              </Collapse>
            </TabPanel>
            <TabPanel tab="interaction" label="交互">
              <Collapse>
                <CollapsePanel
                  class="content-item"
                  panel="connect"
                  header="图表联动"
                >
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
    <a-modal
      v-model="colorModal"
      title="编辑离散颜色"
      cancelText="取消"
      okText="确定"
      wrapClassName="color-modal-wrap"
      @ok="handleColorModalSubmit"
      @cancel="handleCloseColorModal"
    >
      <div class="color-modal-body reset-scrollbar">
        <template v-for="(item, index) in currentCom.setting.data.measures">
          <UnitBackgroundColor
            class="mb-5"
            :key="item.id"
            :color="cacheBarColors[index]"
            :label="item.name"
            @change="color => handleModalBarColor(color, index)"
          ></UnitBackgroundColor>
        </template>
      </div>
    </a-modal>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import StyleMethodMixin from '@/views/screenManage/screen/setting/style-method-mixin'
export default {
  name: `${BoardType.ChartBar}Setting`,
  mixins: [StyleMethodMixin],
  props: {
    currentCom: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tabAcitve: 'style', // tab选项栏活动目标
      dataCollapseActive: ['dimension', 'measure', 'reset'], // 折叠打开选项
      styleCollapseActive: [],
      colorModal: false,
      cacheBarColors: [].concat(
        this.currentCom.setting.style.echart.customBarColors
      )
    }
  },
  methods: {
    /**
     * @description 更改形状
     */
    handleShape(key, value) {
      this.handleChange('echart', {
        [key]: value
      })
    },
    /**
     * @description 只有一条数据的时候，直接更改
     */
    handleBarColor(value) {
      this.cacheBarColors.splice(0, 1, value)
      this.handleChange('echart', {
        customBarColors: this.cacheBarColors
      })
    },
    /**
     * @description 打开颜色弹窗
     */
    handleOpenColorModal() {
      this.cacheBarColors = JSON.parse(
        JSON.stringify(this.currentCom.setting.style.echart.customBarColors)
      )
      this.$nextTick(() => {
        this.colorModal = true
      })
    },
    /**
     * @description 模态窗更改颜色
     */
    handleModalBarColor(value, index) {
      this.cacheBarColors.splice(index, 1, value)
    },
    /**
     * @description 模态窗确定
     */
    handleColorModalSubmit() {
      this.handleChange('echart', {
        customBarColors: this.cacheBarColors
      })
      this.handleCloseColorModal()
    },
    /**
     * @description 关闭模态窗
     */
    handleCloseColorModal() {
      this.colorModal = false
    },
    /**
     * @description 更改柱状条宽度
     */
    handleBarWidthChange(val) {
      this.handleChange('echart', {
        customBarWidth: val
      })
    },
    /**
     * @description 标签设置
     */
    handleLabel(key, value) {
      this.handleChange('echart', {
        customLabel: {
          [key]: value
        }
      })
    }
  }
}
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
