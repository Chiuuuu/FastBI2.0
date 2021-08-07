<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">表格</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="data" label="数据">
              <Collapse v-model="dataCollapseActive">
                <CollapsePanel class="content-item" panel="targe" header="列">
                  <div class="setting-unit-content">
                    <UnitField
                      :receive="['measure', 'dimension']"
                      type="field"
                      label="拖入字段"
                      backgroundColor="#40c0a8"
                      :list="currentCom.setting.data.fields"
                    ></UnitField>
                  </div>
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
                <CollapsePanel class="content-item" panel="thead" header="表头">
                  <!-- 表头 start -->
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">高度</div>
                      </a-col>
                      <!-- 高度 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.thead.height"
                          @change="
                            height =>
                              handleChange('echart', {
                                thead: {
                                  height
                                }
                              })
                          "
                        ></a-input-number>
                      </a-col>
                      <!-- 高度 end -->
                    </a-row>
                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="
                        currentCom.setting.style.echart.thead.background.color
                      "
                      @change="
                        color =>
                          handleChange('echart', {
                            thead: { background: { color } }
                          })
                      "
                    ></UnitBackgroundColor>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">字体</div>
                      </a-col>
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="
                              currentCom.setting.style.echart.thead.font.color
                            "
                            @change="
                              color =>
                                handleChange('echart', {
                                  thead: { font: { color } }
                                })
                            "
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="
                            currentCom.setting.style.echart.thead.font.size
                          "
                          :min="12"
                          @change="
                            size =>
                              handleChange('echart', {
                                thead: { font: { size } }
                              })
                          "
                        />
                      </a-col>
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">对齐</div>
                      </a-col>
                      <template v-for="item in align">
                        <a-col :span="5" :offset="1" :key="item">
                          <div
                            class="font-align"
                            :class="
                              item ===
                              currentCom.setting.style.echart.thead.text.align
                                ? 'selected'
                                : ''
                            "
                            @click="handleTheadTextAlign('align', item)"
                          >
                            <a-icon :type="`align-${item}`" />
                          </div>
                        </a-col>
                      </template>
                    </a-row>
                  </div>
                  <!-- 表头 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="tbody" header="表格">
                  <!-- 表格 start -->
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8" class="unit-show-block">
                        <div class="unit-block-title">高度</div>
                      </a-col>
                      <!-- 高度 start -->
                      <a-col :span="16">
                        <a-input-number
                          :min="0"
                          :value="currentCom.setting.style.echart.tbody.height"
                          @change="
                            height =>
                              handleChange('echart', {
                                tbody: {
                                  height
                                }
                              })
                          "
                        ></a-input-number>
                      </a-col>
                      <!-- 高度 end -->
                    </a-row>
                    <!-- 奇数行颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="奇数行"
                      :color="currentCom.setting.style.echart.tbody.odd"
                      @change="
                        odd =>
                          handleChange('echart', {
                            tbody: { odd }
                          })
                      "
                    ></UnitBackgroundColor>
                    <!-- 奇数行颜色 end -->

                    <!-- 偶数行颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="偶数行"
                      :color="currentCom.setting.style.echart.tbody.even"
                      @change="
                        even =>
                          handleChange('echart', {
                            tbody: { even }
                          })
                      "
                    ></UnitBackgroundColor>
                    <!-- 奇数行颜色 end -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">字体</div>
                      </a-col>
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="
                              currentCom.setting.style.echart.tbody.font.color
                            "
                            @change="
                              color =>
                                handleChange('echart', {
                                  tbody: { font: { color } }
                                })
                            "
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="
                            currentCom.setting.style.echart.tbody.font.size
                          "
                          :min="12"
                          @change="
                            size =>
                              handleChange('echart', {
                                tbody: { font: { size } }
                              })
                          "
                        />
                      </a-col>
                    </a-row>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">对齐</div>
                      </a-col>
                      <template v-for="item in align">
                        <a-col :span="5" :offset="1" :key="item">
                          <div
                            class="font-align"
                            :class="
                              item ===
                              currentCom.setting.style.echart.tbody.text.align
                                ? 'selected'
                                : ''
                            "
                            @click="handleTbodyTextAlign('align', item)"
                          >
                            <a-icon :type="`align-${item}`" />
                          </div>
                        </a-col>
                      </template>
                    </a-row>
                  </div>
                  <!-- 表格 end -->
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
          </Tabs>
        </div>
        <!-- Tab切换栏 end -->
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type'
import StyleMethodMixin from '@/views/screenManage/screen/setting/style-method-mixin'
export default {
  name: `${BoardType.ChartTable}Setting`,
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
      dataCollapseActive: ['targe', 'range'],
      align: ['left', 'center', 'right'], // 对齐方式
      styleCollapseActive: []
    }
  },
  methods: {
    handleLabel(key, value) {
      this.handleChange('echart', {
        label: {
          [key]: value
        }
      })
    },
    handleTheadTextAlign(key, value) {
      this.handleChange('echart', {
        thead: {
          text: {
            [key]: value
          }
        }
      })
    },
    handleTbodyTextAlign(key, value) {
      this.handleChange('echart', {
        tbody: {
          text: {
            [key]: value
          }
        }
      })
    }
  }
}
</script>
