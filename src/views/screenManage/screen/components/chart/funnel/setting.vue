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
                    :limit="true"
                    :limitNum="1"
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
                    :limit="true"
                    :limitNum="1"
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
                    <div>
                      <p class="mt-4">边距</p>
                      <div class="unit-content-radius">
                        <a-row v-for="item in chartMargin" :key="item.prop" class="unit-show-block mb-4">
                          <a-col :span="8" class="unit-show-block">
                            <div class="unit-block-title">{{ item.name }}</div>
                          </a-col>
                          <a-col :span="16">
                            <a-input-number
                              :min="0"
                              :value="currentCom.setting.style.echart.customSeries[item.prop]"
                              @change="value => doWithSeries(item.prop, value)"
                            ></a-input-number>
                          </a-col>
                        </a-row>
                      </div>
                    </div>
                    <!-- 边距 end -->
                    <!-- 转化率/到达率 样式配置  start -->
                    <div class="unit-content-link">
                      <a-row class="unit-show-block mb-2 mt-4">
                        <a-col :span="12" class="unit-show-block">
                          <div class="unit-block-title">展示环节</div>
                        </a-col>
                        <a-col :span="12">
                          <UnitCheckbox
                            class="show-btn"
                            style="top: 0"
                            label="显示"
                            :value="currentCom.setting.style.echart.customRate.show"
                            @change="value => handleCustomRateChange('show', value)"
                          ></UnitCheckbox>
                        </a-col>
                      </a-row>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="24" class="unit-show-block">
                          <div class="unit-block-title">显示内容</div>
                        </a-col>
                        <a-col :span="24">
                          <a-select
                            mode="tags"
                            :value="currentCom.setting.style.echart.customRate.labelContent"
                            style="width: 100%"
                            @change="value => handleCustomRateChange('labelContent', value)"
                          >
                            <a-select-option v-for="item in concatDimAndMea" :key="item.value" :value="item.value">
                              {{ item.name }}
                            </a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <!-- 文本 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="4">
                          <div class="unit-block-title">文本</div>
                        </a-col>

                        <!-- 展示环节 字体 颜色 start -->
                        <a-col :span="4">
                          <div class="font-color">
                            <ColorPicker
                              :value="currentCom.setting.style.echart.customRate.color"
                              @change="value => handleCustomRateChange('color', value)"
                            ></ColorPicker>
                          </div>
                        </a-col>
                        <!-- 展示环节 字体 颜色 end -->

                        <!-- 展示环节 字体 大小 start -->
                        <a-col :span="16">
                          <a-input-number
                            :min="0"
                            :value="currentCom.setting.style.echart.customRate.fontSize"
                            @change="value => handleCustomRateChange('fontSize', value)"
                          />
                        </a-col>
                        <!-- 展示环节 字体 大小 end -->
                      </a-row>
                      <!-- 文本 end -->
                      <!-- 字体 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8">
                          <div class="unit-block-title">字体</div>
                        </a-col>
                        <a-col :span="16">
                          <a-select
                            style="width: 100%"
                            :value="currentCom.setting.style.echart.customRate.fontFamily"
                            @change="value => handleCustomRateChange('fontFamily', value)"
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
                        <a-col :span="8">
                          <div class="unit-block-title">粗细</div>
                        </a-col>
                        <a-col :span="16">
                          <a-select
                            style="width: 100%"
                            :value="currentCom.setting.style.echart.customRate.fontWeight"
                            @change="value => handleCustomRateChange('fontWeight', value)"
                          >
                            <a-select-option value="normal">正常</a-select-option>
                            <a-select-option value="bolder">加粗</a-select-option>
                            <a-select-option value="lighter">更细</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <!-- 粗细 end -->
                      <!-- 显示位置 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8">
                          <div class="unit-block-title">显示位置</div>
                        </a-col>
                        <a-col :span="16">
                          <a-radio-group
                            name="radioGroup"
                            class="float-right"
                            :value="currentCom.setting.style.echart.customRate.position"
                            @change="event => handleCustomRateChange('position', event.target.value)"
                          >
                            <a-radio-button value="left">左</a-radio-button>
                            <a-radio-button value="right">右</a-radio-button>
                          </a-radio-group>
                        </a-col>
                      </a-row>
                      <!-- 显示位置 end -->
                      <!-- 排列 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8">
                          <div class="unit-block-title">排列</div>
                        </a-col>
                        <a-col :span="16">
                          <a-radio-group
                            name="radioGroup"
                            class="float-right"
                            :value="currentCom.setting.style.echart.customRate.arrange"
                            @change="event => handleCustomRateChange('arrange', event.target.value)"
                          >
                            <a-radio-button value="horizontal">水平</a-radio-button>
                            <a-radio-button value="vertical">垂直</a-radio-button>
                          </a-radio-group>
                        </a-col>
                      </a-row>
                      <!-- 排列 end -->
                    </div>
                    <!-- 转化率/到达率 样式配置  end -->
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="chartStyle" header="指标设置">
                  <!-- 图形属性 start -->
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.customSeries.label.show"
                      @change="show => doWithSeries('label', { show })"
                    ></UnitCheckbox>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24" class="unit-show-block">
                        <div class="unit-block-title">显示内容</div>
                      </a-col>
                      <a-col :span="24">
                        <a-select
                          mode="tags"
                          :value="currentCom.setting.style.echart.customFormatterWay"
                          style="width: 100%"
                          @change="customFormatterWay => handleChange('echart', { customFormatterWay })"
                        >
                          <a-select-option v-for="item in concatDimAndMea" :key="item.value" :value="item.value">
                            {{ item.name }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 文本 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">文本</div>
                      </a-col>

                      <!-- 展示环节 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.customSeries.label.color"
                            @change="color => doWithSeries('label', { color })"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 展示环节 字体 颜色 end -->

                      <!-- 展示环节 字体 大小 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.customSeries.label.fontSize"
                          @change="fontSize => doWithSeries('label', { fontSize })"
                        />
                      </a-col>
                      <!-- 展示环节 字体 大小 end -->
                    </a-row>
                    <!-- 文本 end -->
                    <!-- 字体 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">字体</div>
                      </a-col>
                      <a-col :span="16">
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
                    <!-- 粗细 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">粗细</div>
                      </a-col>
                      <a-col :span="16">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.customSeries.label.fontWeight"
                          @change="fontWeight => doWithSeries('label', { fontWeight })"
                        >
                          <a-select-option value="normal">正常</a-select-option>
                          <a-select-option value="bolder">加粗</a-select-option>
                          <a-select-option value="lighter">更细</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 粗细 end -->
                    <!-- 排列 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">粗细</div>
                      </a-col>
                      <a-col :span="16">
                        <a-radio-group
                          name="radioGroup"
                          class="float-right"
                          :value="currentCom.setting.style.echart.customLabelArrange"
                          @change="event => handleChange('echart', { customLabelArrange: event.target.value })"
                        >
                          <a-radio-button value="horizontal">水平</a-radio-button>
                          <a-radio-button value="vertical">垂直</a-radio-button>
                        </a-radio-group>
                      </a-col>
                    </a-row>
                    <!-- 排列 end -->
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
                <CollapsePanel class="content-item" panel="chartStyle" header="鼠标移入提示">
                  <!-- 鼠标移入提示 start -->
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.tooltip.show"
                      @change="show => handleChange('echart', { tooltip: { show } })"
                    ></UnitCheckbox>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24" class="unit-show-block">
                        <div class="unit-block-title">显示内容</div>
                      </a-col>
                      <a-col :span="24">
                        <a-select
                          mode="tags"
                          :value="currentCom.setting.style.echart.customTooltipFormatter"
                          style="width: 100%"
                          @change="customTooltipFormatter => handleChange('echart', { customTooltipFormatter })"
                        >
                          <a-select-option v-for="item in concatDimAndMea" :key="item.value" :value="item.value">
                            {{ item.name }}
                          </a-select-option>
                        </a-select>
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
import fontFamily from '@/utils/fontFamily';
export default {
  name: `${BoardType.ChartFunnel}Setting`,
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
      fontFamily, //字体
      labelPositionList: [
        //标签位置
        { name: '内部', value: 'inside' },
        { name: '外部', value: 'outside' },
      ],
      chartMargin: [
        {
          prop: 'top',
          name: '上',
        },
        {
          prop: 'right',
          name: '右',
        },
        {
          prop: 'bottom',
          name: '下',
        },
        {
          prop: 'left',
          name: '左',
        },
      ],
    };
  },
  computed: {
    // 维度度量合并列表
    concatDimAndMea() {
      const { dimensions = [], measures = [] } = this.currentCom.setting.data;
      if (dimensions.concat(measures).length >= 2) {
        return [
          { name: dimensions[0].alias, value: 'name' },
          { name: measures[0].alias, value: 'value' },
          { name: '转化率', value: 'converse' },
          { name: '到达率', value: 'arrive' },
        ];
      } else {
        return [
          { name: '维度', value: 'name' },
          { name: '度量', value: 'value' },
          { name: '转化率', value: 'converse' },
          { name: '到达率', value: 'arrive' },
        ];
      }
    },
  },
  methods: {
    /**
     * @description 更改形状
     */
    handleShape(key, value) {
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
     * @description 展示环节 - 转化率/到达率 配置配置
     */
    handleCustomRateChange(key, value) {
      this.handleChange('echart', {
        customRate: {
          [key]: value,
        },
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
.unit-content-radius {
  display: flex;
  flex-wrap: wrap;
  & > .unit-show-block {
    width: 50%;
    &:nth-of-type(2n) {
      padding-left: 10px;
    }
  }
}
</style>
