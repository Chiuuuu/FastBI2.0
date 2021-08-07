<template>
  <div
    :class="{ 'board-options': true, 'is-expand': optionsExpand }"
    :style="config.style"
  >
    <div class="header-title" v-if="config.title && config.title.enable">
      <span v-if="!currentSelected">{{ config.title.text }}</span>
      <div class="tabs" v-else>
        <div
          class="tab-item"
          :class="{ active: tabsType === 0 }"
          @click="tabsTypeChange(0)"
        >
          样式
        </div>
        <div
          class="tab-item"
          v-if="
            currSelected.setting.name !== 've-image' &&
              currSelected.setting.name !== 'figure'
          "
          :class="{ active: tabsType === 1 }"
          @click="tabsTypeChange(1)"
        >
          数据
        </div>
        <!--维度度量都有的图才可以创建交互(暂时排除地图、嵌套饼图)-->
        <div
          class="tab-item"
          v-if="
            currSelected.setting.type === '1' &&
              currSelected.setting.name !== 've-map' &&
              currSelected.setting.chartType !== 'v-multiPie'
          "
          :class="{ active: tabsType === 2 }"
          @click="tabsTypeChange(2)"
        >
          交互
        </div>
      </div>
    </div>
    <div class="options-body scrollbar">
      <!-- <b-scrollbar style="height: 100%;"> -->
      <div class="page-config" v-if="!currentSelected">
        <gui-field label="页面尺寸" hasPadding>
          <div class="gui-inline">
            <a-input-number
              v-model="globalSettings.width"
              size="small"
              :formatter="value => `宽 ${value}`"
              class="f-clear-width"
              @change="setPageSetting"
            ></a-input-number>
          </div>
          <div class="gui-inline">
            <a-input-number
              v-model="globalSettings.height"
              size="small"
              :formatter="value => `高 ${value}`"
              class="f-clear-width"
              @change="setPageSetting"
            ></a-input-number>
          </div>
        </gui-field>
        <!-- <gui-field label="背景颜色">
            <el-color-picker v-model="globalSettings.backgroundColor" show-alpha
                             @change="setPageSetting"></el-color-picker>
        </gui-field>-->
        <gui-field label="背景设置" hasPadding>
          <a-radio-group
            v-model="globalSettings.backgroundType"
            name="radioGroup"
          >
            <a-radio
              :style="radioStyle"
              value="1"
              @click.native.stop="
                globalBgChange($event, globalSettings, 'backgroundType')
              "
            >
              <gui-field label="背景颜色">
                <el-color-picker
                  v-model="globalSettings.backgroundColor"
                  show-alpha
                  @change="setPageSetting"
                ></el-color-picker>
              </gui-field>
            </a-radio>
            <a-radio
              :style="radioStyle"
              value="2"
              @click.native.stop="
                globalBgChange($event, globalSettings, 'backgroundType')
              "
            >
              <gui-field label="背景图片">
                <div>
                  <a-button
                    size="small"
                    @click.native.stop="addGlobalPhoto"
                    :disabled="globalSettings.backgroundType !== '2'"
                    >上传</a-button
                  >
                  <input
                    id="globalPhoto"
                    ref="img_input1"
                    type="file"
                    name
                    accept="image/png, image/jpeg, image/gif"
                    style="display: none"
                    @change="
                      selectPhoto($event, globalSettings, 'globalSettings')
                    "
                  />
                </div>
              </gui-field>
            </a-radio>
          </a-radio-group>
        </gui-field>

        <gui-field label="栅格间距" hasPadding>
          <a-input-number
            v-model="globalSettings.gridStep"
            size="small"
            :min="2"
            :max="20"
            @change="setPageSetting"
          ></a-input-number>
        </gui-field>
        <a-collapse defaultActiveKey="refresh" :bordered="false">
          <a-collapse-panel key="refresh" header="定时刷新">
            <a-switch
              slot="extra"
              v-model="globalSettings.refresh.isRefresh"
              default-checked
              @change="refreshChange"
              size="small"
            />
            <div style="display: flex">
              <a-input-number
                v-model="globalSettings.refresh.frequency"
                :min="1"
                @change="frequencyChange"
                size="small"
                class="f-flex1"
                style="margin-right: 10px"
              />
              <a-select
                v-model="globalSettings.refresh.unit"
                placeholder="请选择"
                @change="unitChange"
                size="small"
                class="f-flex1"
              >
                <a-select-option
                  v-for="(item, index) in refreshList"
                  :key="index"
                  :value="item.value"
                  >{{ item.name }}</a-select-option
                >
              </a-select>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <gui-field label="重置" hasPadding>
          <a-button type="primary" size="small" @click="resetSetting"
            >恢复默认配置</a-button
          >
        </gui-field>
      </div>
      <div class="block-config" v-else>
        <div v-if="tabsType === 0">
          <gui-field label="位置" hasPadding>
            <gui-inline>
              <a-input-number
                v-model="baseProperty.x"
                size="small"
                :formatter="value => `X ${value}`"
                :parser="value => value.replace(/\X\s?|(,*)/g, '')"
                class="f-clear-width"
                @change="setBaseProperty"
              ></a-input-number>
            </gui-inline>
            <gui-inline>
              <a-input-number
                v-model="baseProperty.y"
                size="small"
                :formatter="value => `Y ${value}`"
                :parser="value => value.replace(/\Y\s?|(,*)/g, '')"
                class="f-clear-width"
                @change="setBaseProperty"
              ></a-input-number>
            </gui-inline>
          </gui-field>
          <gui-field label="尺寸" hasPadding>
            <gui-inline>
              <a-input-number
                v-model="baseProperty.width"
                size="small"
                :formatter="value => `W ${value}`"
                :parser="value => value.replace('W', '')"
                class="f-clear-width"
                @change="setBaseProperty"
              ></a-input-number>
            </gui-inline>
            <gui-inline>
              <a-input-number
                v-model="baseProperty.height"
                size="small"
                :max="selfConfig.title === '直线' ? 20 : Infinity"
                :formatter="value => `H ${value}`"
                :parser="value => value.replace(/\H\s?|(,*)/g, '')"
                class="f-clear-width"
                @change="setBaseProperty"
              ></a-input-number>
            </gui-inline>
          </gui-field>

          <high-chart-pie
            :HighConfig="currSelected"
            v-if="currSelected.setting.chartType === 'high-pie'"
          ></high-chart-pie>

          <high-chart-bar
            :HighConfig="currSelected"
            v-if="currSelected.setting.chartType === 'high-column'"
          ></high-chart-bar>

          <a-collapse
            v-model="collapseActive"
            v-if="
              (currSelected.setting.chartType !== 'high-pie') &
                (currSelected.setting.chartType !== 'high-column')
            "
          >
            <!--标题 noTitle图片没有标题-->
            <template v-if="selfConfig.title && !selfConfig.noTitle && !isRing">
              <a-collapse-panel key="title" :header="isText ? '文本' : '标题'">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('title') > -1 && !isText"
                  v-model="selfConfig.title.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <gui-field label="标题名">
                  <a-input
                    v-model="selfConfig.title.content"
                    v-if="!('text' in selfConfig.title)"
                    size="small"
                    :maxLength="20"
                    @change="setSelfProperty"
                  ></a-input>
                  <a-input
                    v-model="selfConfig.title.text"
                    v-else
                    size="small"
                    :maxLength="20"
                    @change="setSelfProperty"
                  ></a-input>
                </gui-field>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.title.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="100"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.title.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="字体">
                  <a-select
                    v-model="selfConfig.title.textStyle.fontFamily"
                    style="width: 164px"
                    size="small"
                    @change="setSelfProperty"
                  >
                    <a-select-option
                      :value="font.value"
                      v-for="(font, index) in fontFamilyList"
                      :key="index"
                      >{{ font.label }}</a-select-option
                    >
                  </a-select>
                </gui-field>
                <gui-field label="粗细">
                  <a-select
                    v-model="selfConfig.title.textStyle.fontWeight"
                    style="width: 164px"
                    size="small"
                    @change="setSelfProperty"
                  >
                    <a-select-option value="normal">正常</a-select-option>
                    <a-select-option value="bolder">加粗</a-select-option>
                    <a-select-option value="lighter">更细</a-select-option>
                  </a-select>
                </gui-field>
                <gui-field label="对齐方式">
                  <a-radio-group
                    :value="selfConfig.title.textAlign || selfConfig.title.left"
                    size="small"
                  >
                    <a-tooltip placement="top" title="左对齐">
                      <a-radio-button
                        value="left"
                        @click.native.stop="
                          onAlignChange(selfConfig.title, 'left')
                        "
                      >
                        <a-icon type="align-left" value="left" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="居中">
                      <a-radio-button
                        value="center"
                        @click.native.stop="
                          onAlignChange(selfConfig.title, 'center')
                        "
                      >
                        <a-icon type="align-center" value="center" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="右对齐">
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onAlignChange(selfConfig.title, 'right')
                        "
                      >
                        <a-icon type="align-right" value="right" />
                      </a-radio-button>
                    </a-tooltip>
                  </a-radio-group>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--标题 只用于环形图，vchart读取title会覆盖api的title，标题用chartTitle对象控制-->
            <template v-if="isRing">
              <a-collapse-panel key="title" header="标题">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('title') > -1"
                  v-model="selfConfig.topTitle.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <gui-field label="标题名">
                  <a-input
                    v-model="selfConfig.topTitle.content"
                    size="small"
                    :maxLength="20"
                    @change="setSelfProperty"
                  ></a-input>
                </gui-field>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.topTitle.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="100"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.topTitle.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="字体">
                  <a-select
                    v-model="selfConfig.topTitle.textStyle.fontFamily"
                    style="width: 164px"
                    size="small"
                    @change="setSelfProperty"
                  >
                    <a-select-option
                      :value="font.value"
                      v-for="(font, index) in fontFamilyList"
                      :key="index"
                      >{{ font.label }}</a-select-option
                    >
                  </a-select>
                </gui-field>
                <gui-field label="粗细">
                  <a-select
                    v-model="selfConfig.topTitle.textStyle.fontWeight"
                    style="width: 164px"
                    size="small"
                    @change="setSelfProperty"
                  >
                    <a-select-option value="normal">正常</a-select-option>
                    <a-select-option value="bolder">加粗</a-select-option>
                    <a-select-option value="lighter">更细</a-select-option>
                  </a-select>
                </gui-field>
                <gui-field label="对齐方式">
                  <a-radio-group
                    :value="selfConfig.topTitle.textAlign"
                    size="small"
                  >
                    <a-tooltip placement="top" title="左对齐">
                      <a-radio-button
                        value="left"
                        @click.native.stop="
                          onAlignChange(selfConfig.topTitle, 'left')
                        "
                      >
                        <a-icon type="align-left" value="left" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="居中">
                      <a-radio-button
                        value="center"
                        @click.native.stop="
                          onAlignChange(selfConfig.topTitle, 'center')
                        "
                      >
                        <a-icon type="align-center" value="center" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="右对齐">
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onAlignChange(selfConfig.topTitle, 'right')
                        "
                      >
                        <a-icon type="align-right" value="right" />
                      </a-radio-button>
                    </a-tooltip>
                  </a-radio-group>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--grid-->
            <template v-if="showGrid">
              <a-collapse-panel key="grid" header="图形属性">
                <gui-field label="边距">
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.top"
                      size="small"
                      :formatter="value => `上 ${value}`"
                      :parser="value => value.replace(/\上\s?|(,*)/g, '')"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.bottom"
                      size="small"
                      :formatter="value => `下 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.left"
                      size="small"
                      :formatter="value => `左 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.right"
                      size="small"
                      :formatter="value => `右 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="200"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label="区域透明度" v-if="isLine">
                  <a-input-number
                    v-model="selfConfig.series.areaStyle.opacity"
                    size="small"
                    :max="1"
                    :min="0"
                    :step="0.1"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="曲线" v-if="isLine">
                  <a-switch
                    v-model="selfConfig.series.smooth"
                    size="small"
                    @change="setSelfProperty"
                  ></a-switch>
                </gui-field>
                <!-- <gui-field label="标记点" v-if="isLine"> {{selfConfig.series.symbol}}
                            <a-switch v-model="selfConfig.series.symbol" size="small" @change="setSelfProperty"></a-switch>
                        </gui-field>-->
                <gui-field label="线宽" v-if="isLine">
                  <a-input-number
                    v-model="selfConfig.series.lineStyle.width"
                    size="small"
                    :min="0"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="展示数值" v-if="!isScatter">
                  <a-switch
                    v-model="selfConfig.series.label.show"
                    size="small"
                    @change="setSelfProperty"
                  ></a-switch>
                </gui-field>
                <gui-field label="数值显示位置" width="80px" v-if="isBar">
                  <gui-inline>
                    <a-radio-group
                      :value="selfConfig.series.label.position"
                      size="small"
                    >
                      <a-radio-button
                        value="inside"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.series.label,
                            'position'
                          )
                        "
                        >中</a-radio-button
                      >
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.series.label,
                            'position'
                          )
                        "
                        >右</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field label="文本" v-if="!isScatter">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.series.label.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.series.label.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <div v-if="isHistogram">
                  <gui-field label="柱条宽度">
                    <a-input
                      size="small"
                      @change="setSelfProperty"
                      v-model="selfConfig.series.barWidth"
                      clearable
                    ></a-input>
                  </gui-field>
                  <gui-field label="柱形圆角">
                    <a-switch
                      v-model="selfConfig.radius"
                      size="small"
                      @change="setHistogramRadius($event)"
                    ></a-switch>
                  </gui-field>
                  <gui-field label="柱条间隔">
                    <a-input
                      size="small"
                      @change="setSelfProperty"
                      v-model="selfConfig.series.barGap"
                      clearable
                    ></a-input>
                  </gui-field>
                  <!-- <gui-field label="柱条间隔(同系列)">
                            <a-input
                              size="small"
                              @change="setSelfProperty"
                              v-model="selfConfig.series.barCategoryGap"
                              clearable
                            ></a-input>
                          </gui-field> -->
                  <gui-field label="堆叠柱状图">
                    <a-switch
                      v-model="selfConfig.stack"
                      size="small"
                      @change="setHistogramStack($event)"
                    ></a-switch>
                  </gui-field>
                </div>
                <!-- 散点图 -->
                <div v-if="isScatter">
                  <gui-field label="散点颜色">
                    <a-select
                      v-model="apis.scatterColor"
                      style="width: 164px"
                      size="small"
                      @change="scatterColorChange"
                    >
                      <a-select-option
                        :value="font.value"
                        v-for="(font, index) in scatterColorList"
                        :key="index"
                        >{{ font.label }}</a-select-option
                      >
                    </a-select>
                  </gui-field>
                  <gui-field label="散点大小">
                    <a-select
                      v-model="apis.scatterSize"
                      style="width: 164px"
                      size="small"
                      @change="scatterSizeChange"
                    >
                      <a-select-option
                        :value="font.value"
                        v-for="(font, index) in scatterSizeList_"
                        :key="index"
                        >{{ font.label }}</a-select-option
                      >
                    </a-select>
                  </gui-field>
                </div>
              </a-collapse-panel>
            </template>
            <!-- 散点图独有 -->
            <template>
              <a-collapse-panel
                key="indicatorscatter"
                header="指标设置"
                v-if="isScatter"
              >
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('indicatorscatter') > -1"
                  v-model="selfConfig.series.label.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                指标颜色
                <div>
                  <!-- 指标颜色 -->
                  <a-radio-group :value="apis.scatterTargetColor" size="small">
                    <a-radio
                      value="0"
                      @click.native.stop="scatterTargetColorChange($event)"
                      >使用图例</a-radio
                    >
                    <a-radio
                      value="1"
                      @click.native.stop="scatterTargetColorChange($event)"
                      >自定义</a-radio
                    >
                  </a-radio-group>
                  <el-color-picker
                    v-model="selfConfig.series.label.color"
                    @change="setSelfProperty"
                    v-show="apis.scatterTargetColor == '1'"
                  ></el-color-picker>
                </div>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.series.label.fontSize"
                      style="width: 70px"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="字体">
                    <!-- <el-color-picker
                      v-model="selfConfig.series.label.color"
                      @change="setSelfProperty"
                    ></el-color-picker> -->
                    <a-select
                      v-model="selfConfig.title.textStyle.fontFamily"
                      style="width: 100px"
                      size="small"
                      @change="setSelfProperty"
                    >
                      <a-select-option
                        :value="font.value"
                        v-for="(font, index) in fontFamilyList"
                        :key="index"
                        >{{ font.label }}</a-select-option
                      >
                    </a-select>
                  </gui-inline>
                </gui-field>
                <!--  -->
                <gui-field label="指标偏移">
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.series.label.offset[0]"
                      size="small"
                      :formatter="value => `水平 ${value}`"
                      class="f-clear-width"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.series.label.offset[1]"
                      size="small"
                      :formatter="value => `垂直 ${value}`"
                      class="f-clear-width"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>

                显示内容
                <a-select
                  mode="multiple"
                  v-model="apis.scatterLabel"
                  placeholder="选择显示内容"
                  style="width: 100%"
                  @change="onChange"
                >
                  <a-select-option
                    v-for="i in scatterFormatList_"
                    :key="i.label"
                    :value="i.value"
                  >
                    {{ i.label }}
                  </a-select-option>
                </a-select>

                <gui-field label="显示位置">
                  <a-radio-group
                    :value="selfConfig.series.label.position"
                    size="small"
                  >
                    <a-radio-button
                      value="top"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >顶部</a-radio-button
                    >
                    <a-radio-button
                      value="inside"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >内部</a-radio-button
                    >
                    <a-radio-button
                      value="bottom"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >底部</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
                <gui-field label="排列" v-if="this.chartType !== 'v-heatmap'">
                  <a-radio-group :value="apis.arrange" size="small">
                    <a-radio-button
                      value="vertical"
                      @click.native.stop="scatterArrangeChange($event)"
                      >垂直</a-radio-button
                    >
                    <a-radio-button
                      value="horizontal"
                      @click.native.stop="scatterArrangeChange($event)"
                      >水平</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!-- 图形独有 -->
            <template v-if="selfConfig.name === 'figure'">
              <a-collapse-panel key="properties" header="图形属性">
                <Figure
                  :config.sync="selfConfig"
                  :view.sync="baseProperty"
                  @refreshSelf="setSelfProperty"
                  @refreshBase="setBaseProperty"
                />
              </a-collapse-panel>
            </template>

            <!-- 饼图独有 -->
            <template>
              <a-collapse-panel
                key="properties"
                header="图形属性"
                v-if="
                  (isPie || isSun || isRing || isMultiPie) && selfConfig.series
                "
              >
                <gui-field label="中心坐标">
                  <gui-inline>
                    <a-input
                      v-model="selfConfig.series.center[0]"
                      size="small"
                      placeholder="默认50%"
                      @change="setSelfProperty"
                    >
                      <span slot="prefix">x</span>
                    </a-input>
                  </gui-inline>
                  <gui-inline>
                    <a-input
                      v-model="selfConfig.series.center[1]"
                      size="small"
                      placeholder="默认50%"
                      @change="setSelfProperty"
                    >
                      <span slot="prefix">y</span>
                    </a-input>
                  </gui-inline>
                </gui-field>
                <gui-field label="内环大小" v-if="selfConfig.series.radius">
                  <a-input
                    v-model="selfConfig.series.radius[0]"
                    size="small"
                    placeholder="默认0"
                    @change="setSelfProperty"
                  ></a-input>
                </gui-field>
                <gui-field label="外径大小" v-if="selfConfig.series.radius">
                  <a-input
                    v-model="selfConfig.series.radius[1]"
                    size="small"
                    placeholder="默认50%"
                    @change="setSelfProperty"
                  ></a-input>
                </gui-field>
                <gui-field label="玫瑰图" v-if="this.chartType === 'v-pie'">
                  <!-- <a-switch
                    v-model="selfConfig.series.roseType"
                    size="small"
                    @change="switchChange"
                  ></a-switch> -->
                  <a-radio-group
                    :value="selfConfig.series.roseType"
                    size="small"
                  >
                    <a-radio-button
                      :value="false"
                      @click.native.stop="
                        onRadioChange($event, selfConfig.series, 'roseType')
                      "
                      >无</a-radio-button
                    >
                    <a-radio-button
                      value="radius"
                      @click.native.stop="
                        onRadioChange($event, selfConfig.series, 'roseType')
                      "
                      >半径</a-radio-button
                    >
                    <a-radio-button
                      value="area"
                      @click.native.stop="
                        onRadioChange($event, selfConfig.series, 'roseType')
                      "
                      >区域</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
                <gui-field label="外径大小" v-if="isMultiPie">
                  <a-input
                    v-model="apis.radius"
                    size="small"
                    placeholder="默认100"
                    @change="setApis"
                  ></a-input>
                </gui-field>
              </a-collapse-panel>
              <a-collapse-panel
                key="indicator"
                header="指标设置"
                v-if="isPie || isMultiPie"
              >
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('indicator') > -1"
                  v-model="selfConfig.series.label.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <!-- <gui-field label="显示内容"> -->
                显示内容
                <a-select
                  mode="multiple"
                  placeholder="选择显示内容"
                  v-model="selfConfig.series.label.formatterSelect"
                  style="width: 100%"
                  @change="onChange"
                >
                  <a-select-option
                    v-for="i in formatList"
                    :key="i.label"
                    :value="i.alias"
                  >
                    {{ i.label }}
                  </a-select-option>
                </a-select>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.series.label.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.series.label.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="显示位置">
                  <a-radio-group
                    :value="selfConfig.series.label.position"
                    size="small"
                  >
                    <a-radio-button
                      value="inside"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >内部</a-radio-button
                    >
                    <a-radio-button
                      value="outside"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >外部</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!-- 矩形树图独有 -->
            <template v-if="isTreemap">
              <a-collapse-panel key="treemap1" header="图形属性">
                <Treemap1 :self-config="selfConfig" />
              </a-collapse-panel>
              <a-collapse-panel key="treemap2" header="鼠标移入提示">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('treemap2') > -1"
                  v-model="selfConfig.series.tooltip.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Treemap2 :self-config="selfConfig" />
              </a-collapse-panel>
              <a-collapse-panel key="treemap3" header="图例设置">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('treemap3') > -1"
                  v-model="selfConfig.visualMap.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Treemap3 :self-config="selfConfig" />
              </a-collapse-panel>
            </template>

            <!-- 矩形热力图独有 -->
            <template v-if="isHeatmap">
              <a-collapse-panel key="heatmap1" header="图形属性">
                <Heatmap1 :self-config="selfConfig" />
              </a-collapse-panel>
              <a-collapse-panel key="heatmap2" header="鼠标移入提示">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('heatmap2') > -1"
                  v-model="selfConfig.series.tooltip.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Heatmap2 :self-config="selfConfig" />
              </a-collapse-panel>
              <a-collapse-panel key="heatmap3" header="图例设置">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('heatmap3') > -1"
                  v-model="selfConfig.visualMap.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Heatmap3 :self-config="selfConfig" />
              </a-collapse-panel>
            </template>

            <!-- 旭日图独有 -->
            <template v-if="isSun">
              <a-collapse-panel key="sun1" header="指标设置">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('sun1') > -1"
                  v-model="selfConfig.series.label.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Sun1 :self-config="selfConfig" />
              </a-collapse-panel>
              <a-collapse-panel key="sun2" header="鼠标移入提示">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('sun2') > -1"
                  v-model="selfConfig.series.tooltip.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Sun2 :self-config="selfConfig" />
              </a-collapse-panel>
              <a-collapse-panel key="sun3" header="图例设置">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('sun3') > -1"
                  v-model="selfConfig.visualMap.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <Sun3 :self-config="selfConfig" />
              </a-collapse-panel>
            </template>

            <!--图例-->
            <template
              v-if="
                selfConfig.legend &&
                  !isRing &&
                  !isGauge &&
                  !isMap &&
                  !isTreemap &&
                  !isHeatmap
              "
            >
              <a-collapse-panel key="legend" header="图例设置">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('legend') > -1"
                  v-model="selfConfig.legend.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.legend.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.legend.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="图例间隔">
                  <a-input-number
                    v-model="selfConfig.legend.itemGap"
                    size="small"
                    class="f-clear-width"
                    :min="0"
                    :max="50"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="图例形状">
                  <a-select
                    v-model="selfConfig.legend.icon"
                    style="width: 90px"
                    size="small"
                    @change="setSelfProperty"
                  >
                    <a-select-option value="circle">圆形</a-select-option>
                    <a-select-option value="rect">矩形</a-select-option>
                    <a-select-option value="roundRect">圆矩形</a-select-option>
                    <a-select-option value="diamond">菱形</a-select-option>
                  </a-select>
                </gui-field>
                <gui-field label="位置">
                  <gui-inline>
                    <a-radio-group :value="selfConfig.legend.left" size="small">
                      <a-radio-button
                        value="left"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'left')
                        "
                        >左</a-radio-button
                      >
                      <a-radio-button
                        value="center"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'left')
                        "
                        >中</a-radio-button
                      >
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'left')
                        "
                        >右</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field>
                  <gui-inline>
                    <a-radio-group :value="selfConfig.legend.top" size="small">
                      <a-radio-button
                        value="top"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'top')
                        "
                        >顶部</a-radio-button
                      >
                      <a-radio-button
                        value="middle"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'top')
                        "
                        >居中</a-radio-button
                      >
                      <a-radio-button
                        value="bottom"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'top')
                        "
                        >底部</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field label="图标位置">
                  <gui-inline>
                    <a-radio-group
                      :value="selfConfig.legend.align"
                      size="small"
                    >
                      <a-radio-button
                        value="left"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'align')
                        "
                        >左</a-radio-button
                      >
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'align')
                        "
                        >右</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field label="排列">
                  <gui-inline>
                    <a-radio-group
                      :value="selfConfig.legend.orient"
                      size="small"
                    >
                      <a-radio-button
                        value="horizontal"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'orient')
                        "
                        >水平</a-radio-button
                      >
                      <a-radio-button
                        value="vertical"
                        @click.native.stop="
                          onRadioChange($event, selfConfig.legend, 'orient')
                        "
                        >垂直</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--图例（地图)分图层配置-->
            <template v-if="isMap">
              <a-collapse-panel key="legend" header="图例设置">
                <a-collapse v-model="mapActive">
                  <!-- 图例填充配置（实际上是视觉映射） -->
                  <a-collapse-panel
                    key="map"
                    header="填充层"
                    v-if="selfConfig.visualMap"
                  >
                    <a-switch
                      slot="extra"
                      v-model="selfConfig.visualMap.show"
                      default-checked
                      size="small"
                      @change="switchChange"
                    />
                    <gui-field label="类型">
                      <a-radio-group
                        :value="selfConfig.visualMap.type"
                        size="small"
                      >
                        <a-radio-button
                          value="piecewise"
                          @click.native.stop="
                            onRadioChange($event, selfConfig.visualMap, 'type')
                          "
                          >分段型</a-radio-button
                        >
                        <a-radio-button
                          value="continuous"
                          @click.native.stop="
                            onRadioChange($event, selfConfig.visualMap, 'type')
                          "
                          >连续型</a-radio-button
                        >
                      </a-radio-group>
                    </gui-field>
                    <gui-field label="文本">
                      <gui-inline label="字号">
                        <a-input-number
                          v-model="selfConfig.visualMap.textStyle.fontSize"
                          size="small"
                          :min="12"
                          :max="40"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                      <gui-inline label="颜色">
                        <el-color-picker
                          v-model="selfConfig.visualMap.textStyle.color"
                          @change="setSelfProperty"
                        ></el-color-picker>
                      </gui-inline>
                    </gui-field>
                    <gui-field
                      v-show="selfConfig.visualMap.type === 'piecewise'"
                      label="图例间隔大小"
                    >
                      <a-input-number
                        v-model="selfConfig.visualMap.itemGap"
                        size="small"
                        @change="setSelfProperty"
                      ></a-input-number>
                    </gui-field>
                    <!-- <gui-field
                      label="图例形状"
                      v-show="selfConfig.visualMap.type === 'piecewise'"
                    >
                      <a-select
                        v-model="selfConfig.visualMap.itemSymbol"
                        style="width: 90px"
                        size="small"
                        @change="setSelfProperty"
                      >
                        <a-select-option value="circle">圆形</a-select-option>
                        <a-select-option value="rect">矩形</a-select-option>
                        <a-select-option value="roundRect"
                          >圆矩形</a-select-option
                        >
                        <a-select-option value="diamond">菱形</a-select-option>
                      </a-select>
                    </gui-field> -->
                    <gui-field label="位置">
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.visualMap.left"
                          size="small"
                        >
                          <a-radio-button
                            value="left"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'left'
                              )
                            "
                            >左</a-radio-button
                          >
                          <a-radio-button
                            value="center"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'left'
                              )
                            "
                            >中</a-radio-button
                          >
                          <a-radio-button
                            value="right"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'left'
                              )
                            "
                            >右</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field>
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.visualMap.top"
                          size="small"
                        >
                          <a-radio-button
                            value="top"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.visualMap, 'top')
                            "
                            >顶部</a-radio-button
                          >
                          <a-radio-button
                            value="middle"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.visualMap, 'top')
                            "
                            >居中</a-radio-button
                          >
                          <a-radio-button
                            value="bottom"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.visualMap, 'top')
                            "
                            >底部</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field
                      label="图标位置"
                      v-show="selfConfig.visualMap.type === 'piecewise'"
                    >
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.visualMap.align"
                          size="small"
                        >
                          <a-radio-button
                            value="left"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'align'
                              )
                            "
                            >左</a-radio-button
                          >
                          <a-radio-button
                            value="right"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'align'
                              )
                            "
                            >右</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field label="排列">
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.visualMap.orient"
                          size="small"
                        >
                          <a-radio-button
                            value="horizontal"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'orient'
                              )
                            "
                            >水平</a-radio-button
                          >
                          <a-radio-button
                            value="vertical"
                            @click.native.stop="
                              onRadioChange(
                                $event,
                                selfConfig.visualMap,
                                'orient'
                              )
                            "
                            >垂直</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field label="范围">
                      <gui-inline label="最小值">
                        <a-input-number
                          v-model="selfConfig.visualMap.min"
                          size="small"
                          :min="0"
                          style="width: 60px"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                      <gui-inline label="最大值">
                        <a-input-number
                          v-model="selfConfig.visualMap.max"
                          size="small"
                          :min="0"
                          style="width: 60px"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                    </gui-field>
                    <!-- <gui-field label="图元大小">
                      <gui-inline label="最小值">
                        <a-input-number
                          v-model="selfConfig.visualMap.inRange.symbolSize[0]"
                          size="small"
                          :min="0"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                      <gui-inline label="最大值">
                        <a-input-number
                          v-model="selfConfig.visualMap.inRange.symbolSize[1]"
                          size="small"
                          :min="0"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                    </gui-field> -->
                    <!-- <gui-field label="图元颜色">
                      <div>
                        <gui-colors
                          v-for="(c, index) of selfConfig.visualMap.inRange
                            .color"
                          :key="index + c"
                        >
                          <el-color-picker
                            v-model="selfConfig.visualMap.inRange.color[index]"
                            :predefine="predefineColors"
                            @change="setSelfProperty"
                          ></el-color-picker>
                        </gui-colors>
                      </div>
                    </gui-field> -->
                  </a-collapse-panel>
                  <!-- 图例标记点配置 -->
                  <a-collapse-panel key="label" header="标记点">
                    <a-switch
                      slot="extra"
                      v-if="collapseActive.indexOf('legend') > -1"
                      v-model="selfConfig.legend.show"
                      default-checked
                      @change="switchChange"
                      size="small"
                    />
                    <gui-field label="图例颜色">
                      <el-color-picker
                        v-model="selfConfig.legend.itemStyle.color"
                        @change="setSelfProperty"
                      ></el-color-picker>
                    </gui-field>

                    <gui-field label="文本">
                      <gui-inline label="字号">
                        <a-input-number
                          class="longwidth"
                          v-model="selfConfig.legend.textStyle.fontSize"
                          size="small"
                          :min="12"
                          :max="40"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                      <gui-inline label="颜色">
                        <el-color-picker
                          v-model="selfConfig.legend.textStyle.color"
                          @change="setSelfProperty"
                        ></el-color-picker>
                      </gui-inline>
                    </gui-field>
                    <gui-field label="图例间隔">
                      <a-input-number
                        v-model="selfConfig.legend.itemGap"
                        size="small"
                        class="f-clear-width"
                        :min="0"
                        :max="50"
                        @change="setSelfProperty"
                      ></a-input-number>
                    </gui-field>
                    <gui-field label="图例形状">
                      <a-select
                        v-model="selfConfig.legend.icon"
                        style="width: 90px"
                        size="small"
                        @change="setSelfProperty"
                      >
                        <a-select-option value="circle">圆形</a-select-option>
                        <a-select-option value="rect">矩形</a-select-option>
                        <a-select-option value="roundRect"
                          >圆矩形</a-select-option
                        >
                        <a-select-option value="diamond">菱形</a-select-option>
                      </a-select>
                    </gui-field>
                    <gui-field label="位置">
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.legend.left"
                          size="small"
                        >
                          <a-radio-button
                            value="left"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'left')
                            "
                            >左</a-radio-button
                          >
                          <a-radio-button
                            value="center"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'left')
                            "
                            >中</a-radio-button
                          >
                          <a-radio-button
                            value="right"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'left')
                            "
                            >右</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field>
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.legend.top"
                          size="small"
                        >
                          <a-radio-button
                            value="top"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'top')
                            "
                            >顶部</a-radio-button
                          >
                          <a-radio-button
                            value="middle"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'top')
                            "
                            >居中</a-radio-button
                          >
                          <a-radio-button
                            value="bottom"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'top')
                            "
                            >底部</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field label="图标位置">
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.legend.align"
                          size="small"
                        >
                          <a-radio-button
                            value="left"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'align')
                            "
                            >左</a-radio-button
                          >
                          <a-radio-button
                            value="right"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'align')
                            "
                            >右</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                    <gui-field label="排列">
                      <gui-inline>
                        <a-radio-group
                          :value="selfConfig.legend.orient"
                          size="small"
                        >
                          <a-radio-button
                            value="horizontal"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'orient')
                            "
                            >水平</a-radio-button
                          >
                          <a-radio-button
                            value="vertical"
                            @click.native.stop="
                              onRadioChange($event, selfConfig.legend, 'orient')
                            "
                            >垂直</a-radio-button
                          >
                        </a-radio-group>
                      </gui-inline>
                    </gui-field>
                  </a-collapse-panel>
                </a-collapse>
              </a-collapse-panel>
            </template>

            <!-- 单独的旭日图 -->
            <!-- <template v-if="currSelected.setting.chartType=='v-sun'">
              <a-collapse-panel key="sun-tuxin" header='图形属性'>
                <gui-field label="外经大小">
                  <gui-inline label='' style="width:100%">
                    <a-input
                      v-model="selfConfig.series.radius[1]"
                      size="small"
                      class="f-clear-width"
                      @change="setSelfProperty">
                    </a-input>
                  </gui-inline>
                </gui-field>
                <gui-field label="内经大小">
                   <gui-inline label='' style="width:100%">
                    <a-input
                      v-model="selfConfig.series.radius[0]"
                      size="small"
                      class="f-clear-width"
                      @change="setSelfProperty">
                    </a-input>
                  </gui-inline>
                </gui-field>
                <gui-field label="环间距">
                  <gui-inline label='' style="width:100%">
                    <a-input-number
                      v-model="selfConfig.series.itemStyle.borderWidth"
                      size="small"
                      :min="0"
                      :max="8"
                      class="f-clear-width"
                      @change="setSelfProperty">
                    </a-input-number>
                  </gui-inline>
                </gui-field>
              </a-collapse-panel>
            </template> -->

            <!--雷达图独有-->
            <template v-if="isRadar">
              <a-collapse-panel key="radar" header="图形属性">
                <gui-field label="中心坐标">
                  <gui-inline>
                    <a-input
                      v-model="selfConfig.radar.center[0]"
                      size="small"
                      placeholder="支持百分比或像素"
                      @change="setSelfProperty"
                    >
                      <span slot="prefix">x</span>
                    </a-input>
                  </gui-inline>
                  <gui-inline>
                    <a-input
                      v-model="selfConfig.radar.center[1]"
                      size="small"
                      placeholder="支持百分比或像素"
                      @change="setSelfProperty"
                    >
                      <span slot="prefix">y</span>
                    </a-input>
                  </gui-inline>
                </gui-field>
                <gui-field label="雷达图半径">
                  <a-input
                    v-model="selfConfig.radar.radius"
                    size="small"
                    @change="setSelfProperty"
                  ></a-input>
                </gui-field>
                <gui-field label="雷达图类型">
                  <a-radio-group :value="selfConfig.radar.shape" size="small">
                    <a-radio-button
                      value="circle"
                      @click.native.stop="
                        onRadioChange($event, selfConfig.radar, 'shape')
                      "
                      >圆形</a-radio-button
                    >
                    <a-radio-button
                      value="polygon"
                      @click.native.stop="
                        onRadioChange($event, selfConfig.radar, 'shape')
                      "
                      >三角形</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
                <gui-field label="指标">
                  <a-switch
                    v-model="selfConfig.series.label.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                <gui-field label="指标文本" v-if="selfConfig.series.label.show">
                  <gui-inline label="字号">
                    <a-input-number
                      v-model="selfConfig.series.label.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.series.label.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="指标位置" v-if="selfConfig.series.label.show">
                  <a-radio-group
                    :value="selfConfig.series.label.position"
                    size="small"
                  >
                    <a-radio-button
                      value="inside"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >内部</a-radio-button
                    >
                    <a-radio-button
                      value="top"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.series.label,
                          'position'
                        )
                      "
                      >顶部</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
                <gui-field label="区域透明度">
                  <a-input-number
                    v-model="selfConfig.series.areaStyle.opacity"
                    size="small"
                    :min="0"
                    :max="1"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--仪表盘独有-->
            <template v-if="isGauge">
              <a-collapse-panel key="gauge" header="图形属性">
                <gui-field label="中心坐标">
                  <gui-inline>
                    <a-input
                      v-model="selfConfig.series.center[0]"
                      size="small"
                      placeholder="默认50%"
                      @change="setSelfProperty"
                    >
                      <span slot="prefix">X</span>
                    </a-input>
                  </gui-inline>
                  <gui-inline>
                    <a-input
                      v-model="selfConfig.series.center[1]"
                      size="small"
                      placeholder="默认50%"
                      @change="setSelfProperty"
                    >
                      <span slot="prefix">Y</span>
                    </a-input>
                  </gui-inline>
                </gui-field>
                <gui-field label="进度条宽度">
                  <a-input-number
                    v-model="selfConfig.series.axisLine.lineStyle.width"
                    size="small"
                    @change="setSelfProperty"
                    :min="1"
                    :max="100"
                  ></a-input-number>
                </gui-field>
                <gui-field label="进度条背景色" width="80px">
                  <el-color-picker
                    v-model="selfConfig.series.axisLine.lineStyle.color[0][1]"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="显示值">
                  <a-switch
                    v-model="selfConfig.series.detail.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                <gui-field label="刻度">
                  <a-switch
                    v-model="selfConfig.series.splitLine.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                <gui-field label="刻度值">
                  <a-switch
                    v-model="selfConfig.series.axisLabel.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                <gui-field
                  label="刻度值文本"
                  v-if="selfConfig.series.axisLabel.show"
                >
                  <gui-inline label="字号">
                    <a-input-number
                      v-model="selfConfig.series.axisLabel.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.series.axisLabel.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="刻度大小">
                  <div class="gui-inline">
                    <a-input-number
                      v-model="selfConfig.series.splitLine.length"
                      size="small"
                      :formatter="value => `长 ${value}`"
                      class="f-clear-width"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </div>
                  <div class="gui-inline">
                    <a-input-number
                      v-model="selfConfig.series.splitLine.lineStyle.width"
                      size="small"
                      :formatter="value => `宽 ${value}`"
                      class="f-clear-width"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </div>
                </gui-field>
                <gui-field label="角度">
                  <div class="gui-inline">
                    <a-input-number
                      v-model="selfConfig.series.startAngle"
                      size="small"
                      :formatter="value => `起 ${value}`"
                      class="f-clear-width"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </div>
                  <div class="gui-inline">
                    <a-input-number
                      v-model="selfConfig.series.endAngle"
                      size="small"
                      :formatter="value => `终 ${value}`"
                      class="f-clear-width"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </div>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--地图独有-->
            <template v-if="isMap">
              <a-collapse-panel
                key="mapIndicator"
                header="图形属性"
                v-if="selfConfig.series.length > 0"
              >
                <gui-field label="边距">
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.top"
                      size="small"
                      :formatter="value => `上 ${value}`"
                      :parser="value => value.replace(/\上\s?|(,*)/g, '')"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.bottom"
                      size="small"
                      :formatter="value => `下 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.left"
                      size="small"
                      :formatter="value => `左 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.grid.right"
                      size="small"
                      :formatter="value => `右 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="200"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label="底色">
                  <el-color-picker
                    ref="areaColor"
                    v-model="selfConfig.geo.itemStyle.normal.areaColor"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="底色透明度">
                  <a-input-number
                    v-model="selfConfig.geo.itemStyle.normal.opacity"
                    size="small"
                    :max="1"
                    :min="0"
                    :step="0.1"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="悬停区域色">
                  <el-color-picker
                    v-model="selfConfig.geo.itemStyle.emphasis.areaColor"
                    @change="changeAreaColor"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="区域边框色">
                  <el-color-picker
                    v-model="selfConfig.geo.itemStyle.normal.borderColor"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
              </a-collapse-panel>
              <!-- 填充配置 -->
              <a-collapse-panel
                key="fill"
                header="填充层设置"
                v-if="
                  selfConfig.series[0] && selfConfig.series[0].type === 'map'
                "
              >
                <gui-field label="填充色">
                  <div
                    class="el-color-picker el-color-picker--small"
                    @click.stop="showColorSelect = true"
                  >
                    <div class="el-color-picker__trigger">
                      <span class="el-color-picker__color"
                        ><span
                          class="el-color-picker__color-inner"
                          :style="{
                            backgroundColor: selfConfig.series[0].themeColor
                          }"
                        ></span></span
                      ><span
                        class="el-color-picker__icon el-icon-arrow-down"
                      ></span>
                    </div>
                    <!-- 颜色选择下拉 -->
                    <!-- 透明遮罩 -->
                    <div
                      v-show="showColorSelect"
                      style="position:fixed;top:0;left:0;width:100vw;height:100vh;"
                      @click.stop="showColorSelect = false"
                    ></div>
                    <div
                      class="el-color-dropdown el-color-picker__panel"
                      style="position:absolute;right:0;width:80px"
                      v-show="showColorSelect"
                    >
                      <div class="el-color-predefine__colors">
                        <div
                          :class="[
                            'el-color-predefine__color-selector',
                            {
                              selected:
                                color === selfConfig.series[0].themeColor
                            }
                          ]"
                          v-for="(color, index) in themeColors"
                          :key="index"
                          @click.stop="selectThemeColor(color)"
                        >
                          <div :style="{ backgroundColor: color }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </gui-field>
                <gui-field label="区域展示指标">
                  <a-switch
                    v-model="selfConfig.series[0].label.normal.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                指标内容
                <a-select
                  mode="multiple"
                  placeholder="选择显示内容"
                  v-model="selfConfig.series[0].pointShowList"
                  style="width: 100%"
                  @change="setSelfProperty"
                >
                  <a-select-option
                    v-for="i in mapFillPointSelectList"
                    :key="i.alias"
                    :value="i.alias"
                  >
                    {{ i.alias }}
                  </a-select-option>
                </a-select>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.series[0].label.normal.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.series[0].label.normal.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="排列">
                  <gui-inline>
                    <a-radio-group
                      :value="selfConfig.series[0].label.normal.orient"
                      size="small"
                    >
                      <a-radio-button
                        value="horizontal"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.series[0].label.normal,
                            'orient'
                          )
                        "
                        >水平</a-radio-button
                      >
                      <a-radio-button
                        value="vertical"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.series[0].label.normal,
                            'orient'
                          )
                        "
                        >垂直</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field label="鼠标移入提示">
                  <a-switch
                    v-model="selfConfig.series[0].tooltip.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                显示内容
                <a-select
                  mode="multiple"
                  placeholder="选择显示内容"
                  v-model="selfConfig.series[0].tooltipShowList"
                  style="width: 100%"
                  @change="setSelfProperty"
                >
                  <a-select-option
                    v-for="i in mapFillTooltipSelectList"
                    :key="i.alias"
                    :value="i.alias"
                  >
                    {{ i.alias }}
                  </a-select-option>
                </a-select>
                <!-- <gui-field label="阴影">
                      <gui-inline label="颜色" style="width: auto">
                        <el-color-picker
                          ref="areaColor"
                          show-alpha
                          v-model="
                            selfConfig.series[0].itemStyle.normal.shadowColor
                          "
                          @change="setSelfProperty"
                        ></el-color-picker>
                      </gui-inline>
                      <gui-inline label="模糊大小" style="width: auto">
                        <a-input-number
                          v-model="
                            selfConfig.series[0].itemStyle.normal.shadowBlur
                          "
                          size="small"
                          :min="0"
                          :max="200"
                          @change="setSelfProperty"
                        ></a-input-number>
                      </gui-inline>
                    </gui-field> -->
                <!-- <gui-field label="边框宽度">
                  <a-input-number
                    v-model="selfConfig.series[0].itemStyle.normal.borderWidth"
                    size="small"
                    :max="10"
                    :min="0"
                    :step="1"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field> -->
              </a-collapse-panel>
              <!-- 标记点配置 -->
              <a-collapse-panel
                key="label"
                header="标记层设置"
                v-if="scatterList.length > 0"
              >
                <gui-field label="标记点">
                  <a-switch
                    v-model="scatterList[0].itemStyle.normal.showSeries"
                    size="small"
                    @change="mapShowScatter"
                  ></a-switch>
                </gui-field>
                <gui-field label="标记点颜色">
                  <el-color-picker
                    v-model="scatterList[0].itemStyle.normal.color"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="区域展示指标">
                  <a-switch
                    v-model="scatterList[0].label.normal.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                指标内容
                <a-select
                  mode="multiple"
                  placeholder="选择显示内容"
                  v-model="scatterList[0].pointShowList"
                  style="width: 100%"
                  @change="setSelfProperty"
                >
                  <a-select-option
                    v-for="i in mapLabelPointSelectList"
                    :key="i.alias"
                    :value="i.alias"
                  >
                    {{ i.alias }}
                  </a-select-option>
                </a-select>
                <gui-field label="文本样式">
                  <gui-inline label="字号">
                    <a-input-number
                      v-model="scatterList[0].label.normal.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="scatterList[0].label.normal.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="显示位置">
                  <gui-inline>
                    <a-radio-group
                      :value="scatterList[0].label.normal.position"
                      size="small"
                    >
                      <a-radio-button
                        value="top"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            scatterList[0].label.normal,
                            'position'
                          )
                        "
                        >顶部</a-radio-button
                      >
                      <a-radio-button
                        value="bottom"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            scatterList[0].label.normal,
                            'position'
                          )
                        "
                        >底部</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field label="排列">
                  <gui-inline>
                    <a-radio-group
                      :value="scatterList[0].label.normal.orient"
                      size="small"
                    >
                      <a-radio-button
                        value="horizontal"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            scatterList[0].label.normal,
                            'orient'
                          )
                        "
                        >水平</a-radio-button
                      >
                      <a-radio-button
                        value="vertical"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            scatterList[0].label.normal,
                            'orient'
                          )
                        "
                        >垂直</a-radio-button
                      >
                    </a-radio-group>
                  </gui-inline>
                </gui-field>
                <gui-field label="鼠标移入提示">
                  <a-switch
                    v-model="scatterList[0].tooltip.show"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                显示内容
                <a-select
                  mode="multiple"
                  placeholder="选择显示内容"
                  v-model="scatterList[0].tooltipShowList"
                  style="width: 100%"
                  @change="setSelfProperty"
                >
                  <a-select-option
                    v-for="i in mapLabelTooltipSelectList"
                    :key="i.alias"
                    :value="i.alias"
                  >
                    {{ i.alias }}
                  </a-select-option>
                </a-select>
                <gui-field label="形状">
                  <a-select
                    style="width: 120px"
                    v-model="scatterList[0].symbol"
                    size="small"
                    @change="setSelfProperty"
                  >
                    <a-select-option value="circle">圆形</a-select-option>
                    <a-select-option value="rent">方形</a-select-option>
                    <a-select-option value="pin">水滴</a-select-option>
                    <a-select-option value="triangle">三角形</a-select-option>
                    <a-select-option value="arrow">箭头</a-select-option>
                  </a-select>
                </gui-field>
                <gui-field label="大小">
                  <a-input-number
                    v-model="scatterList[0].symbolSize"
                    size="small"
                    :min="0"
                    :max="40"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--x轴-->
            <template v-if="showXAxis">
              <a-collapse-panel key="xAxis" header="x轴">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('xAxis') > -1"
                  v-model="selfConfig.xAxis.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <gui-field label="轴名称">
                  <a-input
                    v-model="selfConfig.xAxis.name"
                    @change="setSelfProperty"
                    size="small"
                  ></a-input>
                </gui-field>
                <gui-field label="标题文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.xAxis.nameTextStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.xAxis.nameTextStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field
                  label="标题位置"
                  v-if="selfConfig.xAxis.nameLocation"
                >
                  <a-radio-group
                    :value="selfConfig.xAxis.nameLocation"
                    size="small"
                  >
                    <a-radio-button
                      value="middle"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.xAxis,
                          'nameLocation',
                          'xAxis'
                        )
                      "
                      >中部</a-radio-button
                    >
                    <a-radio-button
                      value="end"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.xAxis,
                          'nameLocation',
                          'xAxis'
                        )
                      "
                      >末尾</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
                <gui-field label="标题边距">
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.xAxis.nameTextStyle.padding[0]"
                      size="small"
                      :formatter="value => `上 ${value}`"
                      :parser="value => value.replace(/\上\s?|(,*)/g, '')"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.xAxis.nameTextStyle.padding[2]"
                      size="small"
                      :formatter="value => `下 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.xAxis.nameTextStyle.padding[3]"
                      size="small"
                      :formatter="value => `左 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.xAxis.nameTextStyle.padding[1]"
                      size="small"
                      :formatter="value => `右 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="200"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label="x轴文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.xAxis.axisLabel.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.xAxis.axisLabel.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="x轴颜色">
                  <el-color-picker
                    v-model="selfConfig.xAxis.axisLine.lineStyle.color"
                    show-alpha
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="显示轴刻度">
                  <a-switch
                    v-model="selfConfig.xAxis.axisTick.show"
                    default-checked
                    @change="switchChange"
                    size="small"
                  />
                </gui-field>
                <gui-field label="倾斜角度">
                  <a-input-number
                    v-model="selfConfig.xAxis.axisLabel.rotate"
                    size="small"
                    :min="0"
                    :max="90"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="是否网格线">
                  <a-switch
                    v-model="selfConfig.xAxis.splitLine.show"
                    default-checked
                    @change="switchChange"
                    size="small"
                  />
                </gui-field>
                <gui-field
                  label="网格线颜色"
                  v-if="selfConfig.xAxis.splitLine.show"
                >
                  <el-color-picker
                    v-model="selfConfig.xAxis.splitLine.lineStyle.color"
                    show-alpha
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="网格线线型">
                  <a-select
                    style="width: 90px"
                    v-model="selfConfig.xAxis.splitLine.lineStyle.type"
                    @change="setSelfProperty"
                    placeholder="无"
                    size="small"
                  >
                    <a-select-option value="solid">实线</a-select-option>
                    <a-select-option value="dotted">点状</a-select-option>
                    <a-select-option value="dashed">虚线</a-select-option>
                  </a-select>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--y轴-->
            <template v-if="showYAxis">
              <a-collapse-panel key="yAxis" header="y轴">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('yAxis') > -1"
                  v-model="selfConfig.yAxis.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <gui-field label="轴名称">
                  <a-input
                    v-model="selfConfig.yAxis.name"
                    @change="setSelfProperty"
                    size="small"
                  ></a-input>
                </gui-field>
                <gui-field label="标题文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.yAxis.nameTextStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.yAxis.nameTextStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field
                  label="标题位置"
                  v-if="selfConfig.yAxis.nameLocation"
                >
                  <a-radio-group
                    :value="selfConfig.yAxis.nameLocation"
                    size="small"
                  >
                    <a-radio-button
                      value="middle"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.yAxis,
                          'nameLocation',
                          'yAxis'
                        )
                      "
                      >中部</a-radio-button
                    >
                    <a-radio-button
                      value="end"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.yAxis,
                          'nameLocation',
                          'yAxis'
                        )
                      "
                      >末尾</a-radio-button
                    >
                  </a-radio-group>
                </gui-field>
                <gui-field label="标题边距">
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.yAxis.nameTextStyle.padding[0]"
                      size="small"
                      :formatter="value => `上 ${value}`"
                      :parser="value => value.replace(/\上\s?|(,*)/g, '')"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.yAxis.nameTextStyle.padding[2]"
                      size="small"
                      :formatter="value => `下 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.yAxis.nameTextStyle.padding[3]"
                      size="small"
                      :formatter="value => `左 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="60"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline>
                    <a-input-number
                      v-model="selfConfig.yAxis.nameTextStyle.padding[1]"
                      size="small"
                      :formatter="value => `右 ${value}`"
                      class="f-clear-width"
                      :min="0"
                      :max="200"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                </gui-field>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      class="longwidth"
                      v-model="selfConfig.yAxis.axisLabel.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.yAxis.axisLabel.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="轴线颜色">
                  <el-color-picker
                    v-model="selfConfig.yAxis.axisLine.lineStyle.color"
                    show-alpha
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="显示轴刻度">
                  <a-switch
                    v-model="selfConfig.yAxis.axisTick.show"
                    default-checked
                    @change="switchChange"
                    size="small"
                  />
                </gui-field>
                <gui-field label="是否网格线">
                  <a-switch
                    v-model="selfConfig.yAxis.splitLine.show"
                    default-checked
                    @change="switchChange"
                    size="small"
                  />
                </gui-field>
                <gui-field
                  label="网格线颜色"
                  v-if="selfConfig.yAxis.splitLine.show"
                >
                  <el-color-picker
                    v-model="selfConfig.yAxis.splitLine.lineStyle.color"
                    show-alpha
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field
                  label="网格线线型"
                  v-if="selfConfig.yAxis.splitLine.show"
                >
                  <a-select
                    style="width: 90px"
                    v-model="selfConfig.yAxis.splitLine.lineStyle.type"
                    @change="setSelfProperty"
                    placeholder="无"
                    size="small"
                  >
                    <a-select-option value="solid">实线</a-select-option>
                    <a-select-option value="dotted">点状</a-select-option>
                    <a-select-option value="dashed">虚线</a-select-option>
                  </a-select>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!--颜色数组-->
            <template v-if="selfConfig.color">
              <a-collapse-panel key="colors" header="颜色设置">
                <div style="padding: 5px 13px;">
                  <gui-colors
                    v-for="(c, index) of selfConfig.color"
                    :key="index + c"
                  >
                    <el-color-picker
                      v-model="selfConfig.color[index]"
                      :predefine="predefineColors"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-colors>
                </div>
              </a-collapse-panel>
            </template>

            <!-- 图片 -->
            <template v-if="isImage">
              <a-collapse-panel key="images" header="图片">
                <gui-field label="上传">
                  <div class="photo" @click.stop="addPhote">
                    <a-icon type="plus" />
                    <input
                      id="upload_photo"
                      ref="img_input1"
                      type="file"
                      name
                      accept="image/png, image/jpeg, image/gif"
                      style="display: none"
                      @change="selectPhoto($event, selfConfig, 'selfConfig')"
                    />
                  </div>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!-- 表格 -->
            <template v-if="isTables && selfConfig.header">
              <a-collapse-panel key="header" header="表头">
                <a-switch
                  slot="extra"
                  v-if="collapseActive.indexOf('header') > -1"
                  v-model="selfConfig.header.show"
                  default-checked
                  @change="switchChange"
                  size="small"
                />
                <gui-field label="背景颜色">
                  <el-color-picker
                    v-model="selfConfig.header.backgroundColor"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      v-model="selfConfig.header.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.header.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="对齐方式">
                  <a-radio-group
                    :value="selfConfig.header.textStyle.textAlign"
                    size="small"
                  >
                    <a-tooltip placement="top" title="左对齐">
                      <a-radio-button
                        value="left"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.header.textStyle,
                            'textAlign'
                          )
                        "
                      >
                        <a-icon type="align-left" value="left" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="居中">
                      <a-radio-button
                        value="center"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.header.textStyle,
                            'textAlign'
                          )
                        "
                      >
                        <a-icon type="align-center" value="center" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="右对齐">
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.header.textStyle,
                            'textAlign'
                          )
                        "
                      >
                        <a-icon type="align-right" value="right" />
                      </a-radio-button>
                    </a-tooltip>
                  </a-radio-group>
                </gui-field>
              </a-collapse-panel>
              <a-collapse-panel key="table" header="表格">
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      v-model="selfConfig.table.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.table.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="对齐方式">
                  <a-radio-group
                    :value="selfConfig.table.textStyle.textAlign"
                    size="small"
                  >
                    <a-tooltip placement="top" title="左对齐">
                      <a-radio-button
                        value="left"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.table.textStyle,
                            'textAlign'
                          )
                        "
                      >
                        <a-icon type="align-left" value="left" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="居中">
                      <a-radio-button
                        value="center"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.table.textStyle,
                            'textAlign'
                          )
                        "
                      >
                        <a-icon type="align-center" value="center" />
                      </a-radio-button>
                    </a-tooltip>
                    <a-tooltip placement="top" title="右对齐">
                      <a-radio-button
                        value="right"
                        @click.native.stop="
                          onRadioChange(
                            $event,
                            selfConfig.table.textStyle,
                            'textAlign'
                          )
                        "
                      >
                        <a-icon type="align-right" value="right" />
                      </a-radio-button>
                    </a-tooltip>
                  </a-radio-group>
                </gui-field>
                <gui-field label="奇行">
                  <el-color-picker
                    v-model="selfConfig.table.oddBackgroundColor"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <gui-field label="偶行">
                  <el-color-picker
                    v-model="selfConfig.table.evenBackgroundColor"
                    @change="setSelfProperty"
                  ></el-color-picker>
                </gui-field>
                <!-- <gui-field label="自动换行">
                  <a-switch
                    v-model="selfConfig.table.ellipsis"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field> -->
              </a-collapse-panel>
            </template>

            <!--进度条-->
            <template v-if="isSteepBar">
              <a-collapse-panel key="steepBar" header="进度条">
                <gui-field label="高度">
                  <a-input-number
                    v-model="selfConfig.common.height"
                    size="small"
                    :min="0"
                    :max="40"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="目标值">
                  <a-input-number
                    v-model="selfConfig.common.targetValue"
                    size="small"
                    :min="1"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="显示值">
                  <a-switch
                    v-model="selfConfig.common.isShowValue"
                    size="small"
                    @change="switchChange"
                  ></a-switch>
                </gui-field>
                <gui-field label="文本">
                  <gui-inline label="字号">
                    <a-input-number
                      v-model="selfConfig.common.textStyle.fontSize"
                      size="small"
                      :min="12"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.common.textStyle.color"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="进度条背景">
                  <gui-inline label="圆角">
                    <a-input-number
                      v-model="selfConfig.buttonBar.borderRadius"
                      size="small"
                      :min="0"
                      :max="40"
                      @change="setSelfProperty"
                    ></a-input-number>
                  </gui-inline>
                  <gui-inline label="颜色">
                    <el-color-picker
                      v-model="selfConfig.buttonBar.background"
                      @change="setSelfProperty"
                    ></el-color-picker>
                  </gui-inline>
                </gui-field>
                <gui-field label="进度条圆角">
                  <a-input-number
                    v-model="selfConfig.valueBar.borderRadius"
                    size="small"
                    :min="0"
                    :max="40"
                    @change="setSelfProperty"
                  ></a-input-number>
                </gui-field>
                <gui-field label="进度条颜色">
                  <a-radio-group
                    v-model="selfConfig.valueBar.backgroundType"
                    name="radioGroup"
                  >
                    <a-radio
                      :style="radioStyle"
                      value="1"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.valueBar,
                          'backgroundType'
                        )
                      "
                    >
                      <gui-field label="单色">
                        <el-color-picker
                          v-model="selfConfig.valueBar.background"
                          show-alpha
                          @change="setSelfProperty"
                        ></el-color-picker>
                      </gui-field>
                    </a-radio>
                    <a-radio
                      :style="radioStyle"
                      value="2"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.valueBar,
                          'backgroundType'
                        )
                      "
                    >
                      <gui-field label="线性渐变">
                        <gui-inline label="左">
                          <el-color-picker
                            v-model="selfConfig.valueBar.lineColor[0]"
                            @change="setSelfProperty"
                          ></el-color-picker>
                        </gui-inline>
                        <gui-inline label="右">
                          <el-color-picker
                            v-model="selfConfig.valueBar.lineColor[1]"
                            @change="setSelfProperty"
                          ></el-color-picker>
                        </gui-inline>
                      </gui-field>
                    </a-radio>
                    <a-radio
                      :style="radioStyle"
                      value="3"
                      @click.native.stop="
                        onRadioChange(
                          $event,
                          selfConfig.valueBar,
                          'backgroundType'
                        )
                      "
                    >
                      <gui-field label="径向渐变">
                        <gui-inline label="左">
                          <el-color-picker
                            v-model="selfConfig.valueBar.radialColor[0]"
                            @change="setSelfProperty"
                          ></el-color-picker>
                        </gui-inline>
                        <gui-inline label="右">
                          <el-color-picker
                            v-model="selfConfig.valueBar.radialColor[1]"
                            @change="setSelfProperty"
                          ></el-color-picker>
                        </gui-inline>
                      </gui-field>
                    </a-radio>
                  </a-radio-group>
                </gui-field>
              </a-collapse-panel>
            </template>

            <!-- 背景设置-除素材库和图形外 -->
            <a-collapse-panel
              key="background"
              header="背景设置"
              v-if="!isMaterial && selfConfig.name !== 'figure'"
            >
              <a-radio-group
                v-model="backgroundApi.backgroundType"
                name="radioGroup"
              >
                <a-radio
                  :style="radioStyle"
                  value="1"
                  @click.native.stop="
                    onBgChange($event, backgroundApi, 'backgroundType')
                  "
                >
                  <gui-field label="背景颜色">
                    <el-color-picker
                      v-model="backgroundApi.backgroundColor"
                      show-alpha
                      @change="setBackGround"
                    ></el-color-picker>
                  </gui-field>
                </a-radio>
                <a-radio
                  :style="radioStyle"
                  value="2"
                  @click.native.stop="
                    onBgChange($event, backgroundApi, 'backgroundType')
                  "
                >
                  <gui-field label="背景图片">
                    <a-button
                      size="small"
                      @click.native.stop="addbgPhoto"
                      :disabled="backgroundApi.backgroundType !== '2'"
                      >上传</a-button
                    >
                    <input
                      id="bgPhoto"
                      ref="img_input1"
                      type="file"
                      name
                      accept="image/png, image/jpeg, image/gif"
                      style="display: none"
                      @change="
                        selectPhoto($event, backgroundApi, 'backgroundApi')
                      "
                    />
                  </gui-field>
                </a-radio>
              </a-radio-group>
              <gui-field label="边框颜色">
                <el-color-picker
                  v-model="backgroundApi.borderColor"
                  show-alpha
                  @change="setBackGround"
                ></el-color-picker>
              </gui-field>
              <gui-field label="边框大小">
                <a-input-number
                  v-model="backgroundApi.borderWidth"
                  size="small"
                  :formatter="value => `${value}px`"
                  :parser="value => value.replace('px', '')"
                  @change="setBackGround"
                ></a-input-number>
              </gui-field>
              <gui-field label="边框线型">
                <a-select
                  style="width: 90px"
                  v-model="backgroundApi.borderStyle"
                  @change="setBackGround"
                  placeholder="无"
                  size="small"
                >
                  <a-select-option value="solid">实线</a-select-option>
                  <a-select-option value="dotted">点状</a-select-option>
                  <a-select-option value="dashed">虚线</a-select-option>
                </a-select>
              </gui-field>
              <gui-field label="圆角大小">
                <a-input-number
                  v-model="backgroundApi.borderRadius"
                  size="small"
                  :formatter="value => `${value}px`"
                  :parser="value => value.replace('px', '')"
                  @change="setBackGround"
                ></a-input-number>
              </gui-field>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <div v-else-if="tabsType === 1">
          <data-source @setChartTimer="setChartTimer"></data-source>
          <!-- <gui-group group-name="数据映射">
              <gui-field label="x">
                <a-input v-model="apis.labelMap.x" size="small" @change="setApiLabelMap"></a-input>
              </gui-field>
              <gui-field label="y">
                <a-input v-model="apis.labelMap.y" size="small" @change="setApiLabelMap"></a-input>
              </gui-field>
              <gui-field label="s">
                <a-input v-model="apis.labelMap.s" size="small" @change="setApiLabelMap"></a-input>
              </gui-field>
            </gui-group>
            <gui-group group-name="数据源">
              <div style="padding: 6px;">
                <a-input v-model="dataSource" type="textarea" @on-keyup.delete.stop autoSize
                         placeholder="enter json data..." @change="dataSourceChange"></a-input>
              </div>
          </gui-group>-->
        </div>
        <div v-else>
          <div flex="main:center"><Interactive /></div>
        </div>
      </div>
      <!-- </b-scrollbar> -->
    </div>
    <div class="expand-hover" @click="$emit('on-toggle')">
      <div class="inner">
        <b-icon
          :name="optionsExpand ? 'ios-arrow-forward' : 'ios-arrow-back'"
        ></b-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { setBaseProperty } from '../../../api/canvasMaps/canvas-maps-request'
import {
  resetPageSettings,
  setPageSettings
} from '../../../api/app/app-request'
import GuiGroup from './gui-group'
import GuiWrap from './gui-wrap'
import GuiField from './gui-field'
import GuiInline from './gui-inline'
import GuiColors from './gui-colors'
import DataSource from '../data-source/data-source'
import Interactive from './interactive'
import Figure from './figure'
import { DEFAULT_COLORS } from '../../../utils/defaultColors'
import { deepClone } from '../../../utils/deepClone'
import throttle from 'lodash/throttle'
import Treemap1 from './treemap/treemap-1.vue'
import Treemap2 from './treemap/treemap-2.vue'
import Treemap3 from './treemap/treemap-3.vue'
import Heatmap1 from './heatmap/heatmap-1.vue'
import Heatmap2 from './heatmap/heatmap-2.vue'
import Heatmap3 from './heatmap/heatmap-3.vue'
import Sun1 from './sun/sun-1.vue'
import Sun2 from './sun/sun-2.vue'
import Sun3 from './sun/sun-3.vue'
import HighChartPie from '@/components/board/options/highchart-pie'
import HighChartBar from '@/components/board/options/highchart-bar'
import { Divider } from 'ant-design-vue'

const themeColorNMap = {
  yellow: ['rgb(249,217,96)', 'rgb(249,159,61)', 'rgb(247,107,28)'],
  blue: ['rgb(79,174,255)', 'rgb(55,115,205)', 'rgb(32,56,156)'],
  green: ['rgb(180,236,81)', 'rgb(120,189,55)', 'rgb(66,147,33)']
}
export default {
  name: 'BoardOptions',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  provide() {
    return {
      // 地图删除维度的时候调用，重置样式指标设置选择的度量
      initTargetMeasure: () => {
        this.targetMeasure = this.selfConfig.series.filter(
          item => item.type === 'map'
        ).length
      },
      switchChange: this.switchChange,
      setSelfProperty: this.setSelfProperty,
      onRadioChange: this.onRadioChange
    }
  },
  data() {
    return {
      formatSunList: [
        { label: '维度', value: '{b}' },
        { label: '度量', value: '{@2012}' },
        { label: '占比', value: '({c}%)' }
      ],
      formatList: [
        { label: '维度', value: '{b}', alias: 'name' },
        { label: '度量', value: '{@2012}', alias: 'value' },
        { label: '占比', value: '({d}%)', alias: 'percent' }
      ],
      plainOptions: ['a', 'b', 'c'],
      formatShow: [],
      tabsType: 0, // 0：配置，1：数据，2：交互
      globalSettings: {
        width: 0,
        height: 0,
        backgroundColor: '',
        gridStep: 1,
        backgroundSrc: '',
        backgroundType: 1,
        opacity: 1
      },
      baseProperty: { width: 0, height: 0, x: 0, y: 0, rotate: 0 }, // 配置-基础属性,
      collapseActive: [],
      mapActive: [],
      selfConfig: {},
      apiData: {},
      apis: {},
      backgroundApi: {},
      predefineColors: DEFAULT_COLORS,
      dataSource: '',
      activeKey: ['1'],
      radioStyle: {
        display: 'flex',
        alignItems: 'center'
      }, // 单选radio样式
      showSlide: false, // 显示透明滑动条
      imageUrl: '', // 上传图片url
      loading: false, // 是否上传图片中
      refreshList: [
        { name: '分', value: 'min' },
        { name: '小时', value: 'hour' }
      ],
      timer: null,
      chartTimers: {},
      mapOpacity: false, // 地图区域思否透明
      fontFamilyList: [
        { label: '默认', value: 'not specified' },
        { label: 'simfang', value: 'simfang' },
        { label: '仿宋_GB2312', value: 'fangsong' },
        { label: 'times', value: 'times' },
        { label: '微软雅黑', value: 'msyh' },
        { label: 'simkai', value: 'simkai' },
        { label: '庞门正道标题体', value: 'pangmenzhengdao' },
        { label: 'HuXiaoBoNanShenTi-2', value: 'HuXiaoBoNanShenTi-2' },
        { label: '优设标题黑', value: 'youshe' },
        { label: 'digital-7-4', value: 'digital-7-4' }
      ],
      scatterColorList: [
        // 散点颜色
        { label: '单色', value: '0' },
        { label: '按维度', value: '1' }
      ],
      scatterSizeList: [
        // 散点大小
        { label: '无', value: '' },
        { label: '按度量1', value: '0' },
        { label: '按度量2', value: '1' }
      ],
      scatterFormatList: [
        { label: '无', value: '' },
        { label: '维度1', value: '{@5}：{@2}' },
        { label: '度量1', value: '{@3}：{@0}' },
        { label: '度量2', value: '{@4}：{@1}' },
        { label: '度量组', value: '({@0},{@1})' }
      ],
      scatterList: [], // 地图里散点图配置列表
      themeColors: ['yellow', 'blue', 'green'], // 地图填充色色系选择
      mapFillPointSelectList: [], // 地图填充指标选择列表
      mapFillTooltipSelectList: [], // 地图填充提示框选择列表
      mapLabelPointSelectList: [], // 地图标记层指标选择列表
      mapLabelTooltipSelectList: [], // 地图标记层提示框内容选择列表
      showColorSelect: false // 地图下拉选择颜色
    }
  },
  mounted() {
    if (!this.screenId) {
      this.resetSetting()
    }
    // if (this.$route.path === '/screen/edit') {
    //   this.setTimer()
    // }
  },
  destroyed() {
    clearInterval(this.timer)
    this.timer = null
    let keys = Object.keys(this.chartTimers)
    keys.forEach(id => {
      clearInterval(this.chartTimers[id])
    })
    this.chartTimers = {}
    this.showColorSelect = false
  },
  methods: {
    ...mapActions(['saveScreenData', 'updateChartData', 'refreshScreen']),
    tabsTypeChange(num) {
      this.tabsType = num
      this.$store.dispatch('SetTabsType', num)
    },
    // 设置全局配置
    setPageSetting() {
      // setPageSettings(this.globalSettings).then(res => {
      // })
      this.$store.dispatch('SetPageSettings', this.globalSettings)
      this.saveScreenData()
    },
    // 设置基本属性
    setBaseProperty() {
      this.$store.dispatch('SetBaseProperty', this.baseProperty)
      // 发送请求来保存数据
      setBaseProperty(this.currentSelected)
      this.updateChartData()
    },
    onChange(checkedValues) {
      if (this.isScatter) {
        // 散点图
        if (this.apis.arrange === 'horizontal') {
          this.selfConfig.series.label.formatter = checkedValues.join(' ')
        } else {
          this.selfConfig.series.label.formatter = checkedValues.join('\n\r')
        }
        this.setApis()
      } else if (this.chartType === 'v-sun') {
        this.selfConfig.series.label.formatter = checkedValues.join(' ')
      } else {
        this.selfConfig.series.label.formatterSelect = checkedValues
      }
      this.setSelfProperty()
      console.clear()
    },
    // 设置自有属性
    setSelfProperty() {
      // if(this.chartType=="v-sun"){
      //   let _center = this.selfConfig.series.center;
      //   let _one = _center[0].toString().endsWith("%")?_center[0]:`${_center[0]}%`;
      //   let _two = _center[1].toString().endsWith("%")?_center[1]:`${_center[1]}%`;
      //   this.selfConfig.series.center = [_one,_two];
      // }
      this.$store.dispatch('SetSelfProperty', this.selfConfig)
      // 发送请求来保存数据
      setBaseProperty(this.currentSelected)
      this.updateChartData()
    },
    // 设置数据映射
    setApis() {
      this.$store.dispatch('SetApis', this.apis)
      // 发送请求来保存数据
      setBaseProperty(this.currSelected)
      this.updateChartData()
    },
    setBackGround(val) {
      this.$store.dispatch('SetBackGround', this.backgroundApi)
      // 发送请求来保存数据
      setBaseProperty(this.currSelected)
      this.updateChartData()
    },
    // 重置全局配置
    resetSetting() {
      let pageSettings = this.orginPageSettings
      this.globalSettings = pageSettings
      this.$store.dispatch('SetPageSettings', pageSettings)
      this.saveScreenData()
    },
    // 全局刷新打开关闭
    refreshChange(checked, event) {
      // 阻止默认事件，取消收起
      event.stopPropagation()
      this.globalSettings.refresh.isRefresh = checked
      this.$store.dispatch('SetPageSettings', this.globalSettings)
      this.saveScreenData()
      this.setTimer()
    },
    frequencyChange() {
      if (this.globalSettings.refresh.isRefresh) {
        if (
          this.globalSettings.refresh.unit === 'min' &&
          this.globalSettings.refresh.frequency > 1440
        ) {
          this.$message.error('时间设置不超过1天, 请重新设置')
          this.resetSetting()
        }
        if (
          this.globalSettings.refresh.unit === 'hour' &&
          this.globalSettings.refresh.frequency > 24
        ) {
          this.$message.error('时间设置不超过24天, 请重新设置')
          this.resetSetting()
        }
      }
      this.$store.dispatch('SetPageSettings', this.globalSettings)
      this.saveScreenData()
      this.setTimer()
    },
    unitChange() {
      if (this.globalSettings.refresh.isRefresh) {
        if (
          this.globalSettings.refresh.frequency > 1440 &&
          this.globalSettings.refresh.unit === 'min'
        ) {
          this.$message.error('时间设置不超过1天, 请重新设置')
          this.resetSetting()
        }
        if (
          this.globalSettings.refresh.frequency > 24 &&
          this.globalSettings.refresh.unit === 'hour'
        ) {
          this.$message.error('时间设置不超过1天, 请重新设置')
          this.resetSetting()
        }
      }
      this.$store.dispatch('SetPageSettings', this.globalSettings)
      this.saveScreenData()
      this.setTimer()
    },
    // 数据源改变事件
    dataSourceChange() {
      try {
        let source = JSON.parse(this.dataSource)
        this.apiData.source = [...source]
        this.$store.dispatch('SetSelfDataSource', this.apiData)
        // 发送请求来保存数据
        setBaseProperty(this.currSelected)
      } catch (e) {
        console.warn('source is not a json string')
      }
    },

    // 点击添加图片
    addPhote() {
      document.getElementById('upload_photo').click()
    },

    // 点击上传全局背景图片
    addGlobalPhoto(e) {
      document.getElementById('globalPhoto').click()
    },

    // 点击上传图形背景图
    addbgPhoto() {
      document.getElementById('bgPhoto').click()
    },

    // 选择上传图片
    selectPhoto(e, data, key) {
      if (!e.target.files[0]) {
        return
      }
      const isLt2M = e.target.files[0].size / 1024 / 1024 < 5
      if (!isLt2M) {
        this.$message.error('图片大小不能超过5M!')
        return
      }
      var form = new FormData()
      form.append('avatarfile', e.target.files[0])
      this.$server.screenManage
        .actionUploadImage(form)
        .then(res => {
          if (res.code === 200) {
            let imageUrl = process.env.VUE_APP_SERVICE_URL + res.imgUrl
            if (key === 'globalSettings') {
              data['backgroundSrc'] = imageUrl
              this.setPageSetting()
            }
            if (key === 'selfConfig') {
              data['imageUrl'] = imageUrl
              this.setSelfProperty()
            }
            if (key === 'backgroundApi') {
              data['backgroundSrc'] = imageUrl
              data['backgroundImage'] = imageUrl
              this.setBackGround()
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 全局设置，选择背景设置
    globalBgChange(e, data, key) {
      if (e.target.value) {
        this.$set(data, key, e.target.value)
        this.setPageSetting()
      }
    },

    // 图表 点击选择背景
    onBgChange(e, data, key) {
      if (e.target.value) {
        this.$set(data, key, e.target.value)
        this.setBackGround()
      }
    },

    // 点击选择对齐方式
    onAlignChange(data, value) {
      if (
        (this.selfConfig.title && this.selfConfig.title.textAlign) ||
        (this.isRing && this.selfConfig.topTitle.textAlign)
      ) {
        this.$set(data, 'textAlign', value)
      } else {
        this.$set(data, 'left', value)
      }
      this.setSelfProperty()
    },

    // 点击显示/隐藏
    switchChange(checked, event) {
      // 阻止默认事件，取消收起
      event.stopPropagation()
      // 地图区域特殊处理区域透明
      //   if (this.mapOpacity) {
      //     this.selfConfig.geo.itemStyle.normal.areaColor = this.selfConfig.geo.itemStyle.normal.areaColor
      //     this.selfConfig.geo.itemStyle.normal.areaColor = 'transparent'
      //   } else {
      //     // 透明还原
      //     if (this.selfConfig.geo.itemStyle.normal.areaColor === 'transparent') {
      //       this.selfConfig.geo.itemStyle.normal.areaColor = this.selfConfig.geo.itemStyle.normal.areaColor
      //       //   this.selfConfig.geo.itemStyle.normal.areaColor = this.$refs.areaColor.color.value
      //     }
      //   }
      this.setSelfProperty()
    },

    onRadioChange(e, data, key, xYName) {
      let val = e.target.value
      if (val === 'false') {
        val = false
      }
      // x,y轴的标题位置发生变化时，设置默认标题镖局
      if (xYName) {
        if (xYName === 'xAxis') {
          val === 'middle' &&
            this.$set(this.selfConfig.xAxis.nameTextStyle, 'padding', [
              30,
              0,
              0,
              0
            ])
          val === 'end' &&
            this.$set(this.selfConfig.xAxis.nameTextStyle, 'padding', [
              60,
              0,
              0,
              0
            ])
        } else if (xYName === 'yAxis') {
          val === 'middle' &&
            this.$set(this.selfConfig.yAxis.nameTextStyle, 'padding', [
              0,
              0,
              40,
              0
            ])
          val === 'end' &&
            this.$set(this.selfConfig.yAxis.nameTextStyle, 'padding', [
              0,
              0,
              0,
              0
            ])
        }
      }
      this.$set(data, key, val)
      this.setSelfProperty()
    },
    changeAreaColor(color) {
      if (
        this.selfConfig.series[0] &&
        this.selfConfig.series[0].type === 'map'
      ) {
        this.selfConfig.series[0].itemStyle.emphasis.areaColor = this.selfConfig.geo.itemStyle.emphasis.areaColor
      }
      this.setSelfProperty()
    },

    // 圆角配置
    setHistogramStack(val) {
      // 堆叠柱状图
      if (val) {
        this.apis.stack = {
          用户: []
        }
        // 堆叠了把数值显示在右边防止挤在一起
        this.selfConfig.series.label.position = 'insideBottom'
      } else {
        this.apis.stack = {}
        this.selfConfig.series.label.position = 'top'
      }
      this.$store.dispatch('SetSelfProperty', this.selfConfig)
      this.setApis()
    },
    // 堆叠配置
    setHistogramRadius(val) {
      // 圆形柱状图
      if (val) {
        this.selfConfig.series.itemStyle.normal.barBorderRadius = [50, 50, 0, 0]
      } else {
        this.selfConfig.series.itemStyle.normal.barBorderRadius = [0]
      }
      this.$store.dispatch('SetSelfProperty', this.selfConfig)
      this.setApis()
    },
    // 混合柱状图
    setMixed(val) {},
    // 定时器设置
    setTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      // 所有条件都满足才开始倒计时刷新
      if (
        this.globalSettings.refresh.isRefresh &&
        this.globalSettings.refresh.unit &&
        this.globalSettings.refresh.frequency > 0
      ) {
        let count = 0
        if (this.globalSettings.refresh.unit === 'min') {
          count = this.globalSettings.refresh.frequency * 60 * 1000
        } else if (this.globalSettings.refresh.unit === 'hour') {
          count = this.globalSettings.refresh.frequency * 60 * 60 * 1000
        }
        this.timer = setInterval(() => {
          this.refreshData()
        }, count)
      }
    },
    setChartTimer(id) {
      if (this.chartTimers[id]) {
        clearInterval(this.chartTimers[id])
        this.chartTimers[id] = null
      }
      let selected = this.canvasMap.find(item => item.id === id)
      let refresh = selected.setting.api_data.refresh
      // 所有条件都满足才开始倒计时刷新
      if (refresh.isRefresh && refresh.unit && refresh.frequency > 0) {
        let count = 0
        if (refresh.unit === 'min') {
          count = refresh.frequency * 60 * 1000
        } else if (refresh.unit === 'hour') {
          count = refresh.frequency * 60 * 60 * 1000
        }
        this.chartTimers[id] = setInterval(() => {
          this.refreshData()
        }, count)
      }
    },
    // 散点图 -- 散点图大小设置
    scatterColorChange(val) {
      // if(val === ''){
      //   delete this.selfConfig.series.symbolSize;
      // }else{
      //   this.selfConfig.series.symbolSize = function (data) {
      //     return Math.sqrt(data[val]) / 5e2 * 1000;
      //   }
      // }
      this.setApis()
      this.setSelfProperty()
    },
    // 散点图 -- 散点图大小设置
    scatterSizeChange(val) {
      if (val === '') {
        this.selfConfig.series.symbolSize = 15
      } else {
        // this.selfConfig.series.symbolSize = function (data) {
        //   console.log(data)
        //   return Math.sqrt(data[val]) / 5e2 * 1000;
        // }
      }
      this.setApis()
      this.setSelfProperty()
    },
    scatterTargetColorChange(e) {
      let val = e.target.value
      if (val === '0') {
        this.selfConfig.series.label.color = null
      }
      this.apis.scatterTargetColor = val
      this.setApis()
      this.setSelfProperty()
    },
    // 散点图 -- 指标排序
    scatterArrangeChange(e) {
      let val = e.target.value
      // if(!val){ return; }
      if (val) {
        if (val === 'horizontal') {
          this.selfConfig.series.label.formatter = this.apis.scatterLabel.join(
            ' '
          )
        } else {
          this.selfConfig.series.label.formatter = this.apis.scatterLabel.join(
            '\n\r'
          )
        }
        this.apis.arrange = val
        this.setApis()
        this.setSelfProperty()
      }
    },

    // 选择地图填充色
    selectThemeColor(color) {
      this.selfConfig.series[0].themeColor = color
      this.selfConfig.visualMap.inRange.color = themeColorNMap[color]
      this.showColorSelect = false
      this.setSelfProperty()
    },
    mapShowScatter() {
      // 利用透明度控制series是否显示
      this.scatterList[0].itemStyle.normal.opacity = this.scatterList[0]
        .itemStyle.normal.showSeries
        ? 1
        : 0
      this.setSelfProperty()
    },
    // 刷新大屏
    refreshData: throttle(
      function() {
        this.refreshScreen({
          charSeted: false,
          needLoading: true
        })
      },
      1000,
      {
        leading: true,
        trailing: false
      }
    ),
    // 初始化地图指标显示内容列表
    handleMapFormatterSelect() {
      // 填充
      let measures = this.apiData.measures
      if (this.apiData.options.fillType === 'area') {
        // 地区添加地区名/维度
        let di = this.apiData.dimensions[0]
          ? this.apiData.dimensions[0].alias
          : ''
        this.mapFillPointSelectList = [{ alias: `地区名/${di}` }].concat(
          measures
        )
        this.mapFillTooltipSelectList = [{ alias: di }].concat(measures)
      } else {
        this.mapFillTooltipSelectList = this.apiData.dimensions.concat(measures)
        this.mapFillPointSelectList = [{ alias: '地区名' }].concat(
          this.mapFillTooltipSelectList
        )
      }
      // 散点
      let labelMeasures = this.apiData.labelMeasures
      if (this.apiData.options.labelType === 'area') {
        // 标记点添加维度
        let labelDi = this.apiData.labelDimensions[0]
          ? this.apiData.labelDimensions[0].alias
          : ''
        this.mapLabelPointSelectList = [{ alias: `地区名/${labelDi}` }].concat(
          labelMeasures
        )
        this.mapLabelTooltipSelectList = [{ alias: labelDi }].concat(
          labelMeasures
        )
      } else {
        this.mapLabelTooltipSelectList = this.apiData.labelDimensions.concat(
          labelMeasures
        )
        this.mapLabelPointSelectList = [{ alias: '地区名' }].concat(
          this.mapLabelTooltipSelectList
        )
      }
    }
  },
  watch: {
    currSelected: {
      handler(val) {
        if (val) {
          if (
            val.setting.type !== '1' ||
            val.setting.name === 've-image' ||
            val.setting.name === 'figure'
          ) {
            this.tabsType = 0
          }
          this.baseProperty = { ...val.setting.view }
          if (val.setting.config) {
            this.selfConfig = deepClone(val.setting.config)
            if (val.setting.chartType === 'v-map') {
              // 地图里散点图配置列表
              this.scatterList = this.selfConfig.series.filter(
                item => item.type === 'scatter'
              )
              this.targetMeasure = this.selfConfig.series.filter(
                item => item.type === 'map'
              ).length
            }
          }
          if (val.setting.api_data) {
            this.apiData = deepClone(val.setting.api_data)
            // 地区构造指标提示框内容选择列表
            if (val.setting.chartType === 'v-map') {
              this.handleMapFormatterSelect()
            }
          }
          if (val.setting.apis) {
            this.apis = deepClone(val.setting.apis)
          }
          if (this.apiData.source) {
            this.dataSource = JSON.stringify(this.apiData.source)
          }
          if (val.setting.background) {
            this.backgroundApi = deepClone(val.setting.background)
          }
        }
        this.showColorSelect = false
      },
      deep: true
    },
    pageSettings: {
      handler(val) {
        if (val) {
          let setting = val
          if (!setting.refresh) {
            setting.refresh = {
              frequency: '',
              isRefresh: false
            }
          }
          this.globalSettings = deepClone(setting)
          // 初始化定时刷新(调完getScreenDetail，保证isRefresh数据准确)
          if (setting.refresh.isRefresh && !this.timer) {
            this.setTimer()
          }
          for (let chart of this.canvasMap) {
            if (
              chart.setting.api_data.refresh &&
              chart.setting.api_data.refresh.isRefresh &&
              !this.chartTimers[chart.id]
            ) {
              this.setChartTimer(chart.id)
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapGetters([
      'pageSettings',
      'canvasRange',
      'optionsExpand',
      'currentSelected',
      'currSelected',
      'screenId',
      'canvasMap',
      'orginPageSettings'
    ]),
    chartType() {
      return this.currSelected ? this.currSelected.setting.chartType : ''
    },
    isLine() {
      return this.chartType === 'v-line'
    },
    isHistogram() {
      return this.chartType === 'v-histogram'
    },
    isBar() {
      return this.chartType === 'v-bar'
    },
    isPie() {
      return this.chartType === 'v-pie'
    },
    isMultiPie() {
      return this.chartType === 'v-multiPie'
    },
    isRadar() {
      return this.chartType === 'v-radar'
    },
    isGauge() {
      return this.chartType === 'v-gauge'
    },
    isRing() {
      return this.chartType === 'v-ring'
    },
    isMap() {
      return this.chartType === 'v-map'
    },
    isText() {
      return this.chartType === 'v-text'
    },
    isImage() {
      return this.chartType === 'v-image'
    },
    isTables() {
      return this.chartType === 'v-tables'
    },
    isMaterial() {
      return this.chartType === 'material'
    },
    isSteepBar() {
      return this.chartType === 'steepBar'
    },
    isScatter() {
      // return (this.chartType === 'v-scatter') | (this.chartType === 'v-heatmap')
      return this.chartType === 'v-scatter'
    },
    isHeatmap() {
      return this.chartType === 'v-heatmap'
    },
    isSun() {
      return this.chartType === 'v-sun'
    },
    // 是否为矩形树图
    isTreemap() {
      return this.chartType === 'v-treemap'
    },
    showGrid() {
      // return (
      //   this.selfConfig.grid &&
      //   (this.isLine || this.isHistogram || this.isBar || this.isScatter)
      // )
      return (
        this.selfConfig.grid &&
        (this.isLine || this.isHistogram || this.isBar || this.isScatter)
      )
    },
    showXAxis() {
      if (this.chartType === 'v-heatmap') {
        return true
      } else {
        return (
          this.selfConfig.xAxis &&
          (this.isLine || this.isHistogram || this.isBar || this.isScatter)
        )
      }
    },
    showYAxis() {
      if (this.chartType === 'v-heatmap') {
        return true
      } else {
        return (
          this.selfConfig.yAxis &&
          (this.isLine || this.isHistogram || this.isBar || this.isScatter)
        )
      }
    },
    sunVal() {
      let val = this.selfConfig.series.label.formatter
      if (val === '') {
        return []
      } else {
        return val.split(' ')
      }
    },
    scatterFormatList_() {
      let scatterFormatList = deepClone(this.scatterFormatList)
      if (
        this.currSelected.setting.api_data.dimensions.length === 1 &&
        this.currSelected.setting.api_data.measures.length === 2
      ) {
        scatterFormatList[1].label = this.currSelected.setting.api_data.dimensions[0].alias // 维度1
        scatterFormatList[2].label = this.currSelected.setting.api_data.measures[0].alias // 度量1
        scatterFormatList[3].label = this.currSelected.setting.api_data.measures[1].alias // 度量2
      }
      return scatterFormatList
    },
    scatterSizeList_() {
      let scatterSizeList = deepClone(this.scatterSizeList)
      if (
        this.currSelected.setting.api_data.dimensions.length === 1 &&
        this.currSelected.setting.api_data.measures.length === 2
      ) {
        scatterSizeList[1].label =
          '按' + this.currSelected.setting.api_data.measures[0].alias // 度量1
        scatterSizeList[2].label =
          '按' + this.currSelected.setting.api_data.measures[1].alias // 度量2
      }
      return scatterSizeList
    }
  },
  components: {
    GuiField,
    GuiInline,
    GuiColors,
    DataSource,
    Interactive,
    Figure,
    Treemap1,
    Treemap2,
    Treemap3,
    Heatmap1,
    Heatmap2,
    Heatmap3,
    Sun1,
    Sun2,
    Sun3,
    HighChartPie,
    HighChartBar
  }
}
</script>
