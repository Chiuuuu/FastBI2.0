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
                <CollapsePanel class="content-item" panel="targe" header="进度值">
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
                <CollapsePanel class="content-item" panel="style" header="进度条">
                  <!-- 样式设置 start -->
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">宽度(%)</div>
                      </a-col>
                      <!-- 宽度 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.size.width"
                          @change="
                            width =>
                              handleChange('echart', {
                                size: {
                                  width,
                                },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                      <!-- 宽度 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">高度</div>
                      </a-col>
                      <!-- 高度 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.size.height"
                          @change="
                            height =>
                              handleChange('echart', {
                                size: {
                                  height,
                                },
                              })
                          "
                        ></a-input-number>
                      </a-col>
                      <!-- 宽度 end -->
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">边框</div>
                      </a-col>
                      <!-- 边框 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.border.color"
                            @change="color => handleBorder('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 边框 颜色 end -->
                      <a-col :span="16">
                        <a-row>
                          <!-- 边框 类型 start -->
                          <a-col :span="13">
                            <a-select
                              style="width: 100%"
                              :value="currentCom.setting.style.echart.border.style"
                              @change="style => handleBorder('style', style)"
                            >
                              <a-select-option value="solid">实线</a-select-option>
                              <a-select-option value="dashed">虚线</a-select-option>
                              <a-select-option value="dotted">点线</a-select-option>
                            </a-select>
                          </a-col>
                          <!-- 边框 end -->
                          <a-col :span="10" :offset="1">
                            <a-input-number
                              :min="0"
                              :max="20"
                              :value="currentCom.setting.style.echart.border.width"
                              @change="width => handleBorder('width', width)"
                            ></a-input-number>
                          </a-col>
                        </a-row>
                      </a-col>
                    </a-row>

                    <!-- 颜色类型 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">颜色类型</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.customColor"
                          style="width: 100%"
                          @change="customColor => handleChange('echart', { customColor })"
                        >
                          <a-select-option value="single">单色</a-select-option>
                          <a-select-option value="linear">线性渐变</a-select-option>
                          <a-select-option value="radial">径向渐变</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 内容显示 end -->
                    </a-row>
                    <!-- 颜色类型 end -->

                    <!-- 进度条颜色 start -->
                    <a-row class="unit-show-block mb-8">
                      <!-- 进度值 颜色 start -->
                      <!-- 单色 -->
                      <UnitBackgroundColor
                        v-if="currentCom.setting.style.echart.customColor === 'single'"
                        class="mb-8"
                        label="进度颜色"
                        :color="currentCom.setting.style.echart.progress.background.color"
                        @change="color => handleProgress('background', { color })"
                      ></UnitBackgroundColor>
                      <!-- 渐变色 -->
                      <template v-else>
                        <a-col :span="6">
                          <div class="unit-block-title">进度颜色</div>
                        </a-col>
                        <a-col :span="4" :offset="10">
                          <div class="font-color">
                            <!-- 进度值 颜色1 start -->
                            <ColorPicker
                              class="mb-8"
                              :value="currentCom.setting.style.echart.customGradient[0]"
                              @change="color => handleProgressColor(color, 0)"
                            ></ColorPicker>
                            <!-- 进度值 颜色1 end -->
                          </div>
                        </a-col>
                        <a-col :span="4">
                          <div class="font-color">
                            <!-- 进度值 颜色2 start -->
                            <ColorPicker
                              class="mb-8"
                              :value="currentCom.setting.style.echart.customGradient[1]"
                              @change="color => handleProgressColor(color, 1)"
                            ></ColorPicker>
                            <!-- 进度值 颜色2 end -->
                          </div>
                        </a-col>
                      </template>
                    </a-row>
                    <!-- 进度条颜色 end -->
                    <a-row class="unit-show-block">
                      <!-- 底部 颜色 start -->
                      <UnitBackgroundColor
                        class="mb-8"
                        label="底部颜色"
                        :color="currentCom.setting.style.echart.background.color"
                        @change="color => handleChange('echart', { background: { color } })"
                      ></UnitBackgroundColor>
                      <!-- 底部 颜色 end -->
                    </a-row>
                    <!-- 圆角设置 -->
                    <div>
                      <p>圆角设置</p>
                      <div class="unit-content-radius">
                        <a-row v-for="item in radius" :key="item.prop" class="unit-show-block mb-4">
                          <a-col :span="8" class="unit-show-block">
                            <div class="unit-block-title">{{ item.name }}</div>
                          </a-col>
                          <!-- 圆角 start -->
                          <a-col :span="16">
                            <a-input-number
                              :min="0"
                              :max="100"
                              :value="currentCom.setting.style.echart.radius[item.prop]"
                              @change="value => handleRadius(item.prop, value)"
                            ></a-input-number>
                          </a-col>
                          <!-- 圆角 end -->
                        </a-row>
                      </div>
                    </div>
                    <!-- 内边距设置 -->
                    <div>
                      <p class="mt-4">内边距设置</p>
                      <div class="unit-content-radius">
                        <a-row v-for="item in padding" :key="item.prop" class="unit-show-block mb-4">
                          <a-col :span="8" class="unit-show-block">
                            <div class="unit-block-title">{{ item.name }}</div>
                          </a-col>
                          <!-- 内边距 start -->
                          <a-col :span="16">
                            <a-input-number
                              :min="0"
                              :value="currentCom.setting.style.echart.padding[item.prop]"
                              @change="value => handlePadding(item.prop, value)"
                            ></a-input-number>
                          </a-col>
                          <!-- 内边距 end -->
                        </a-row>
                      </div>
                    </div>
                  </div>
                  <!-- 样式设置 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="label" header="指标设置">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn"
                      label="显示"
                      :value="currentCom.setting.style.echart.label.show"
                      @change="show => handleLabel('show', show)"
                    ></UnitCheckbox>

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">显示内容</div>
                      </a-col>

                      <!-- 内容显示 start -->
                      <a-col :span="16">
                        <a-select
                          :value="currentCom.setting.style.echart.showWay"
                          style="width: 100%"
                          @change="showWay => handleChange('echart', { showWay })"
                        >
                          <a-select-option value="value">值</a-select-option>
                          <a-select-option value="percent">百分比</a-select-option>
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
                            :value="currentCom.setting.style.echart.label.color"
                            @change="color => this.handleLabel('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.label.fontSize"
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
                          :value="currentCom.setting.style.echart.label.fontFamily"
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
                          :value="currentCom.setting.style.echart.label.fontWeight"
                          @change="fontWeight => this.handleLabel('fontWeight', fontWeight)"
                        >
                          <a-select-option value="normal">正常</a-select-option>
                          <a-select-option value="bolder">加粗</a-select-option>
                          <a-select-option value="lighter">更细</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 粗细 end -->
                    <!-- 指标相关设置 end -->

                    <!-- 位置设置 start -->
                    <div class="axis-name-box mb-8">
                      <p class="mb-4">调整位置</p>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8" class="unit-show-block">
                          <div class="unit-block-title">距左侧</div>
                        </a-col>
                        <!-- 内边距 start -->
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.echart.label.position.left"
                            @change="left => handleLabel('position', { left })"
                          ></a-input-number>
                        </a-col>
                      </a-row>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8" class="unit-show-block">
                          <div class="unit-block-title">距顶部</div>
                        </a-col>
                        <!-- 内边距 start -->
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.echart.label.position.top"
                            @change="top => handleLabel('position', { top })"
                          ></a-input-number>
                        </a-col>
                      </a-row>
                    </div>
                    <!-- 位置设置 end -->
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
  name: `${BoardType.ChartProgress}Setting`,
  mixins: [StyleMethodMixin],
  props: {
    currentCom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      padding: [
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
      radius: [
        {
          prop: 'topLeft',
          name: '左上',
        },
        {
          prop: 'topRight',
          name: '右上',
        },
        {
          prop: 'bottomLeft',
          name: '左下',
        },
        {
          prop: 'bottomRight',
          name: '右下',
        },
      ],
      tabAcitve: 'style', // tab选项栏活动目标
      dataCollapseActive: ['targe', 'range', 'dataFilter'],
      styleCollapseActive: [],
      fontFamily, //字体
    };
  },
  methods: {
    handleBorder(key, value) {
      this.handleChange('echart', {
        border: {
          [key]: value,
        },
      });
    },
    handleRadius(key, value) {
      this.handleChange('echart', {
        radius: {
          [key]: value,
        },
      });
    },
    handlePadding(key, value) {
      this.handleChange('echart', {
        padding: {
          [key]: value,
        },
      });
    },
    handleProgress(key, value) {
      this.handleChange('echart', {
        progress: {
          [key]: value,
        },
      });
    },
    handleProgressColor(item, index) {
      const color = this.currentCom.setting.style.echart.customGradient;
      color[index] = item;
      this.handleProgress('customGradient', color);
    },
    handleLabel(key, value) {
      this.handleChange('echart', {
        label: {
          [key]: value,
        },
      });
    },
  },
};
</script>
<style lang="less" scoped>
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
