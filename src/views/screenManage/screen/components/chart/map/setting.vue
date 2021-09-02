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
                <!-- 填充层 start -->
                <CollapsePanel class="content-item" panel="mapSeriesPanel" header="填充层">
                  <!-- 类型切换 start -->
                  <a-radio-group
                    class="datatype-box"
                    name="radioGroup"
                    :value="currentCom.setting.data.customFillDataType"
                    @change="event => handleDataType('customFillDataType', event.target.value)"
                  >
                    <a-radio value="area">地区</a-radio>
                    <a-radio value="dot">经纬度</a-radio>
                    <!-- 类型切换 end -->
                  </a-radio-group>
                  <CollapsePanel class="content-item" panel="mapSeriesDimension" header="维度">
                    <!-- 维度 start -->
                    <UnitField
                      v-if="currentCom.setting.data.customFillDataType === 'area'"
                      class="setting-unit-content"
                      receive="dimension"
                      type="dimension"
                      label="拖入维度"
                      backgroundColor="#4a90e2"
                      limit
                      :list="currentCom.setting.data.dimensions"
                    ></UnitField>
                    <!-- 维度 end -->
                    <div v-else>
                      <!-- 拖入经度 start -->
                      <UnitField
                        class="setting-unit-content"
                        receive="dimension"
                        type="longitude"
                        label="拖入经度"
                        backgroundColor="#4a90e2"
                        limit
                        :list="currentCom.setting.data.longitude"
                      ></UnitField>
                      <!-- 拖入经度 end -->
                      <!-- 拖入纬度 start -->
                      <UnitField
                        class="setting-unit-content"
                        receive="dimension"
                        type="latitude"
                        label="拖入纬度"
                        backgroundColor="#4a90e2"
                        limit
                        :list="currentCom.setting.data.latitude"
                      ></UnitField>
                    </div>
                    <!-- 拖入纬度 end -->
                  </CollapsePanel>
                  <CollapsePanel class="content-item" panel="mapSeriesMeasure" header="度量">
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
                  <!-- 填充层 end -->
                </CollapsePanel>
                <!-- 标记层 start -->
                <CollapsePanel class="content-item" panel="scatterSeriesPanel" header="标记层">
                  <!-- 类型切换 start -->
                  <a-radio-group
                    class="datatype-box"
                    name="radioGroup"
                    :value="currentCom.setting.data.customLabelDataType"
                    @change="event => handleDataType('customLabelDataType', event.target.value)"
                  >
                    <a-radio value="area">地区</a-radio>
                    <a-radio value="dot">经纬度</a-radio>
                    <!-- 类型切换 end -->
                  </a-radio-group>
                  <CollapsePanel class="content-item" panel="scatterSeriesDimension" header="维度">
                    <!-- 维度 start -->
                    <UnitField
                      v-if="currentCom.setting.data.customLabelDataType === 'area'"
                      class="setting-unit-content"
                      receive="dimension"
                      type="labelDimension"
                      label="拖入维度"
                      backgroundColor="#4a90e2"
                      limit
                      :list="currentCom.setting.data.labelDimensions"
                    ></UnitField>
                    <div v-else>
                      <!-- 拖入经度 start -->
                      <UnitField
                        class="setting-unit-content"
                        receive="dimension"
                        type="labelLongitude"
                        label="拖入经度"
                        backgroundColor="#4a90e2"
                        limit
                        :list="currentCom.setting.data.labelLongitude"
                      ></UnitField>
                      <!-- 拖入经度 end -->
                      <!-- 拖入纬度 start -->
                      <UnitField
                        class="setting-unit-content"
                        receive="dimension"
                        type="labelLatitude"
                        label="拖入纬度"
                        backgroundColor="#4a90e2"
                        limit
                        :list="currentCom.setting.data.labelLatitude"
                      ></UnitField>
                    </div>
                    <!-- 维度 end -->
                  </CollapsePanel>
                  <CollapsePanel class="content-item" panel="scatterSeriesMeasure" header="度量">
                    <!-- 度量 start -->
                    <UnitField
                      class="setting-unit-content"
                      receive="measure"
                      type="labelMeasure"
                      label="拖入度量"
                      backgroundColor="#40c0a8"
                      openAggre
                      limit
                      :list="currentCom.setting.data.labelMeasures"
                    ></UnitField>
                    <!-- 度量 end -->
                  </CollapsePanel>
                  <!-- 标记层 end -->
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
                <!-- 图例 start -->
                <CollapsePanel class="content-item" panel="title" header="图例设置">
                  <!-- 填充层(视觉映射) start -->
                  <CollapsePanel class="content-item" panel="visualMap" header="填充层">
                    <div class="setting-unit-content">
                      <UnitCheckbox
                        class="show-btn"
                        label="显示"
                        :value="currentCom.setting.style.echart.visualMap.show"
                        @change="value => handleSelect('visualMap', 'show', value)"
                      ></UnitCheckbox>
                      <!-- 类型 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6" class="unit-show-block position">
                          <div class="unit-block-title">类型</div>
                        </a-col>
                        <a-col :span="18">
                          <a-radio-group
                            name="radioGroup"
                            :value="currentCom.setting.style.echart.visualMap.type"
                            @change="event => handleSelect('visualMap', 'type', event.target.value)"
                          >
                            <a-radio value="piecewise">分段</a-radio>
                            <a-radio value="continuous">连续</a-radio>
                          </a-radio-group>
                        </a-col>
                        <!-- 类型 end -->
                      </a-row>
                      <!-- 文本 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="4">
                          <div class="unit-block-title">文本</div>
                        </a-col>

                        <!-- 标签 字体 颜色 start -->
                        <a-col :span="4">
                          <div class="font-color">
                            <ColorPicker
                              :value="currentCom.setting.style.echart.visualMap.textStyle.color"
                              @change="color => handleVisualMapTextStyle('color', color)"
                            ></ColorPicker>
                          </div>
                        </a-col>
                        <!-- 标签 字体 颜色 end -->
                        <!-- 标签 字体 大小 start -->
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.echart.visualMap.textStyle.fontSize"
                            :min="0"
                            @change="fontSize => handleVisualMapTextStyle('fontSize', fontSize)"
                          />
                        </a-col>
                        <!-- 文本 end -->
                      </a-row>
                      <!-- 图标位置 start -->
                      <a-row
                        class="unit-show-block mb-8"
                        v-show="currentCom.setting.style.echart.visualMap.type === 'piecewise'"
                      >
                        <a-col :span="10" class="unit-show-block position">
                          <div class="unit-block-title">图标位置</div>
                        </a-col>
                        <a-col :span="14">
                          <a-radio-group
                            name="radioGroup"
                            :value="currentCom.setting.style.echart.visualMap.align"
                            @change="event => handleSelect('visualMap', 'align', event.target.value)"
                          >
                            <a-radio value="left">左</a-radio>
                            <a-radio value="right">右</a-radio>
                          </a-radio-group>
                        </a-col>
                        <!-- 图标位置 end -->
                      </a-row>
                      <!-- 图例间隔 start -->
                      <a-row
                        class="unit-show-block mb-8"
                        v-show="currentCom.setting.style.echart.visualMap.type === 'piecewise'"
                      >
                        <a-col :span="8">
                          <div class="unit-block-title">图例间隔</div>
                        </a-col>
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.echart.visualMap.itemGap"
                            :min="0"
                            @change="itemGap => handleSelect('visualMap', 'itemGap', itemGap)"
                          />
                        </a-col>
                        <!-- 图例间隔 end -->
                      </a-row>
                      <!-- 图例位置 start -->
                      <a-row>
                        <a-col :span="6" class="unit-show-block position">
                          <div class="unit-block-title">位置</div>
                        </a-col>
                        <a-col :span="18">
                          <a-radio-group
                            :value="currentCom.setting.style.echart.visualMap.left"
                            size="small"
                            @change="event => handleSelect('visualMap', 'left', event.target.value)"
                          >
                            <a-radio-button value="left">左边</a-radio-button>
                            <a-radio-button value="center">中间</a-radio-button>
                            <a-radio-button value="right">右边</a-radio-button>
                          </a-radio-group>
                        </a-col>
                      </a-row>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="18" :offset="6">
                          <a-radio-group
                            :value="currentCom.setting.style.echart.visualMap.top"
                            size="small"
                            @change="event => handleSelect('visualMap', 'top', event.target.value)"
                          >
                            <a-radio-button value="top">顶部</a-radio-button>
                            <a-radio-button value="middle">中部</a-radio-button>
                            <a-radio-button value="bottom">底部</a-radio-button>
                          </a-radio-group>
                        </a-col>
                      </a-row>
                      <!-- 排列 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6" class="unit-show-block position">
                          <div class="unit-block-title">排列</div>
                        </a-col>
                        <a-col :span="18">
                          <a-radio-group
                            name="radioGroup"
                            :value="currentCom.setting.style.echart.visualMap.orient"
                            @change="event => handleSelect('visualMap', 'orient', event.target.value)"
                          >
                            <a-radio value="horizontal">水平</a-radio>
                            <a-radio value="vertical">垂直</a-radio>
                          </a-radio-group>
                        </a-col>
                        <!-- 排列 end -->
                      </a-row>
                      <!-- 范围 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6">
                          <div class="unit-block-title">范围</div>
                        </a-col>

                        <!-- 最小值 start -->
                        <a-col :span="8" class="col-offset">
                          <a-input-number
                            :min="0"
                            :value="currentCom.setting.style.echart.visualMap.min"
                            @change="value => handleSelect('visualMap', 'min', value)"
                          ></a-input-number>
                        </a-col>
                        <!-- 最小值 end -->
                        <!-- 最大值 start -->
                        <a-col :span="8" class="col-offset">
                          <a-input-number
                            :min="0"
                            :value="currentCom.setting.style.echart.visualMap.max"
                            @change="value => handleSelect('visualMap', 'max', value)"
                          ></a-input-number>
                        </a-col>
                        <!-- 最大值 end -->
                      </a-row>
                      <!-- 填充层(视觉映射) end -->
                    </div>
                  </CollapsePanel>
                  <!-- 标记层 start -->
                  <CollapsePanel class="content-item" panel="legend" header="标记层">
                    <UnitLegend
                      :legend="currentCom.setting.style.echart.legend"
                      @change="
                        (key, value, isReset, beforeExecute, afterExecute) =>
                          handleChange(key, value, isReset, beforeExecute, afterExecute)
                      "
                    ></UnitLegend>
                    <div class="setting-unit-content">
                      <!-- 图例颜色 start -->
                      <UnitBackgroundColor
                        class="mb-8"
                        :color="currentCom.setting.style.echart.legend.itemStyle.color"
                        label="图例颜色"
                        @change="borderColor => handleSelect('legend', 'itemStyle', { color: borderColor })"
                      >
                        <!-- 图例颜色 end -->
                      </UnitBackgroundColor>
                      <!-- 图例间隔 start -->
                      <a-row
                        class="unit-show-block mb-8"
                        v-show="currentCom.setting.style.echart.visualMap.type === 'piecewise'"
                      >
                        <a-col :span="8">
                          <div class="unit-block-title">图例间隔</div>
                        </a-col>
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.echart.legend.itemGap"
                            :min="0"
                            @change="itemGap => handleSelect('legend', 'itemGap', itemGap)"
                          />
                        </a-col>
                        <!-- 图例间隔 end -->
                      </a-row>
                      <!-- 图例形状 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6">
                          <div class="unit-block-title">图例形状</div>
                        </a-col>
                        <a-col :span="16" :offset="2">
                          <a-select
                            style="width: 100%"
                            :value="currentCom.setting.style.echart.legend.icon"
                            @change="icon => handleSelect('legend', 'icon', icon)"
                          >
                            <a-select-option value="circle">圆形</a-select-option>
                            <a-select-option value="rect">矩形</a-select-option>
                            <a-select-option value="roundRect">圆矩形</a-select-option>
                            <a-select-option value="diamond">菱形</a-select-option>
                          </a-select>
                        </a-col>
                        <!-- 图例形状 end -->
                      </a-row>
                      <!-- 图标位置 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="10" class="unit-show-block position">
                          <div class="unit-block-title">图标位置</div>
                        </a-col>
                        <a-col :span="14">
                          <a-radio-group
                            name="radioGroup"
                            :value="currentCom.setting.style.echart.legend.align"
                            @change="event => handleSelect('legend', 'align', event.target.value)"
                          >
                            <a-radio value="left">左</a-radio>
                            <a-radio value="right">右</a-radio>
                          </a-radio-group>
                        </a-col>
                        <!-- 图标位置 end -->
                      </a-row>
                    </div>
                    <!-- 标记层 end -->
                  </CollapsePanel>
                  <!-- 图例 end -->
                </CollapsePanel>
                <!-- 图形属性 start -->
                <CollapsePanel class="content-item" panel="grid" header="图形属性">
                  <div class="setting-unit-content">
                    <!-- 透明度 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">透明度</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.geo.itemStyle.normal.opacity"
                          :max="1"
                          :min="0"
                          :step="0.1"
                          @change="value => handleGeoItemStyleNormal('opacity', value)"
                        />
                      </a-col>
                      <!-- 透明度 end -->
                    </a-row>
                    <!-- 底色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.echart.geo.itemStyle.normal.areaColor"
                      label="底色"
                      @change="color => handleGeoItemStyleNormal('areaColor', color)"
                    >
                      <!-- 底色 end -->
                    </UnitBackgroundColor>

                    <!-- 悬停区域色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.echart.geo.itemStyle.emphasis.areaColor"
                      label="悬停区域色"
                      @change="color => handleGeoItemStyleEmphasis('areaColor', color)"
                    >
                      <!-- 悬停区域色 end -->
                    </UnitBackgroundColor>
                    <!-- 区域边框色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.echart.geo.itemStyle.normal.borderColor"
                      label="区域边框色"
                      @change="borderColor => handleGeoItemStyleNormal('borderColor', borderColor)"
                    >
                      <!-- 区域边框色 end -->
                    </UnitBackgroundColor>
                  </div>
                  <!-- 标题 end -->
                </CollapsePanel>
                <!-- 填充层设置 start -->
                <CollapsePanel class="content-item" panel="mapStyle" header="填充层设置">
                  <div class="setting-unit-content">
                    <!-- 填充色 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">填充色</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <div class="color-select-bar">
                          <div
                            :class="[
                              'color-select',
                              color,
                              { selected: color === currentCom.setting.style.echart.mapStyle.customThemeColor },
                            ]"
                            v-for="(color, index) in themeColors"
                            :key="index"
                            @click="handleThemeColor(color)"
                          ></div>
                        </div>
                      </a-col>
                      <!-- 填充色 end -->
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="区域展示指标"
                      :value="currentCom.setting.style.echart.mapStyle.customShowLabel"
                      @change="value => handleSelect('mapStyle', 'customShowLabel', value)"
                    ></UnitCheckbox>
                    <!-- 指标内容 start -->
                    <a-row class="unit-show-block mb-8">
                      <div class="unit-block-title">指标内容</div>
                      <a-select
                        mode="multiple"
                        placeholder="选择显示内容"
                        style="width: 100%"
                        :value="currentCom.setting.style.echart.mapStyle.customPointShowList"
                        @change="value => handleSelect('mapStyle', 'customPointShowList', value)"
                      >
                        <a-select-option v-for="i in mapFillPointSelectList" :key="i.alias" :value="i.alias">
                          {{ i.alias }}
                        </a-select-option>
                      </a-select>
                      <!-- 指标内容 end -->
                    </a-row>
                    <!-- 文本 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">文本</div>
                      </a-col>

                      <!-- 标签 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.mapStyle.customTextColor"
                            @change="color => handleSelect('mapStyle', 'customTextColor', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 标签 字体 颜色 end -->
                      <!-- 标签 字体 大小 start -->
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.mapStyle.customTextSize"
                          :min="0"
                          @change="fontSize => handleSelect('mapStyle', 'customTextSize', fontSize)"
                        />
                      </a-col>
                      <!-- 文本 end -->
                    </a-row>
                    <!-- 排列 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">排列</div>
                      </a-col>
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          :value="currentCom.setting.style.echart.mapStyle.customOrient"
                          @change="event => handleSelect('mapStyle', 'customOrient', event.target.value)"
                        >
                          <a-radio value="horizontal">水平</a-radio>
                          <a-radio value="vertical">垂直</a-radio>
                        </a-radio-group>
                      </a-col>
                      <!-- 排列 end -->
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="鼠标移入提示"
                      :value="currentCom.setting.style.echart.mapStyle.customShowTooltip"
                      @change="value => handleSelect('mapStyle', 'customShowTooltip', value)"
                    ></UnitCheckbox>
                    <!-- 指标内容 start -->
                    <a-row class="unit-show-block mb-8">
                      <div class="unit-block-title">指标内容</div>
                      <a-select
                        mode="multiple"
                        placeholder="选择显示内容"
                        style="width: 100%"
                        :value="currentCom.setting.style.echart.mapStyle.customTooltipShowList"
                        @change="value => handleSelect('mapStyle', 'customTooltipShowList', value)"
                      >
                        <a-select-option v-for="i in mapFillTooltipSelectList" :key="i.alias" :value="i.alias">
                          {{ i.alias }}
                        </a-select-option>
                      </a-select>
                      <!-- 指标内容 end -->
                    </a-row>
                  </div>
                  <!-- 填充层设置 end -->
                </CollapsePanel>
                <!-- 标记层设置 start -->
                <CollapsePanel class="content-item" panel="scatterStyle" header="标记层设置">
                  <div class="setting-unit-content">
                    <UnitCheckbox
                      class="show-btn strict"
                      label="标记点"
                      :value="currentCom.setting.style.echart.scatterStyle.customShowItem"
                      @change="value => handleSelect('scatterStyle', 'customShowItem', value)"
                    ></UnitCheckbox>
                    <!-- 标记点颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.echart.scatterStyle.customItemColor"
                      label="标记点颜色"
                      @change="color => handleSelect('scatterStyle', 'customItemColor', color)"
                    >
                      <!-- 标记点颜色 end -->
                    </UnitBackgroundColor>
                    <!-- 形状 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">形状</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.scatterStyle.customItemSymbol"
                          @change="icon => handleSelect('scatterStyle', 'customItemSymbol', icon)"
                        >
                          <a-select-option value="circle">圆形</a-select-option>
                          <a-select-option value="rect">矩形</a-select-option>
                          <a-select-option value="roundRect">圆矩形</a-select-option>
                          <a-select-option value="diamond">菱形</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 形状 end -->
                    </a-row>
                    <!-- 尺寸 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">尺寸</div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.scatterStyle.customItemSize"
                          :min="10"
                          @change="value => handleSelect('scatterStyle', 'customItemSize', value)"
                        />
                      </a-col>
                      <!-- 尺寸 end -->
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="区域展示指标"
                      :value="currentCom.setting.style.echart.scatterStyle.customShowLabel"
                      @change="value => handleSelect('scatterStyle', 'customShowLabel', value)"
                    ></UnitCheckbox>
                    <!-- 指标内容 start -->
                    <a-row class="unit-show-block mb-8">
                      <div class="unit-block-title">指标内容</div>
                      <a-select
                        mode="multiple"
                        placeholder="选择显示内容"
                        style="width: 100%"
                        :value="currentCom.setting.style.echart.scatterStyle.customPointShowList"
                        @change="value => handleSelect('scatterStyle', 'customPointShowList', value)"
                      >
                        <a-select-option v-for="i in mapLabelPointSelectList" :key="i.alias" :value="i.alias">
                          {{ i.alias }}
                        </a-select-option>
                      </a-select>
                      <!-- 指标内容 end -->
                    </a-row>
                    <!-- 文本 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">文本</div>
                      </a-col>

                      <!-- 标签 字体 颜色 start -->
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.scatterStyle.customTextColor"
                            @change="color => handleSelect('scatterStyle', 'customTextColor', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <!-- 标签 字体 颜色 end -->
                      <!-- 标签 字体 大小 start -->
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.scatterStyle.customTextSize"
                          :min="0"
                          @change="fontSize => handleSelect('scatterStyle', 'customTextSize', fontSize)"
                        />
                      </a-col>
                      <!-- 文本 end -->
                    </a-row>
                    <!-- 排列 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6" class="unit-show-block position">
                        <div class="unit-block-title">排列</div>
                      </a-col>
                      <a-col :span="18">
                        <a-radio-group
                          name="radioGroup"
                          :value="currentCom.setting.style.echart.scatterStyle.customOrient"
                          @change="event => handleSelect('scatterStyle', 'customOrient', event.target.value)"
                        >
                          <a-radio value="horizontal">水平</a-radio>
                          <a-radio value="vertical">垂直</a-radio>
                        </a-radio-group>
                      </a-col>
                      <!-- 排列 end -->
                    </a-row>
                    <!-- 显示位置 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">显示位置</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.scatterStyle.customTextPosition"
                          @change="value => handleSelect('scatterStyle', 'customTextPosition', value)"
                        >
                          <a-select-option value="top">上</a-select-option>
                          <a-select-option value="bottom">下</a-select-option>
                          <a-select-option value="left">左</a-select-option>
                          <a-select-option value="right">右</a-select-option>
                          <a-select-option value="insideBottomRight">左上</a-select-option>
                          <a-select-option value="insideTopRight">左下</a-select-option>
                          <a-select-option value="insideBottomLeft">右上</a-select-option>
                          <a-select-option value="insideTopLeft">右下</a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 显示位置 end -->
                    </a-row>
                    <UnitCheckbox
                      class="show-btn strict"
                      label="鼠标移入提示"
                      :value="currentCom.setting.style.echart.scatterStyle.customShowTooltip"
                      @change="value => handleSelect('scatterStyle', 'customShowTooltip', value)"
                    ></UnitCheckbox>
                    <!-- 指标内容 start -->
                    <a-row class="unit-show-block mb-8">
                      <div class="unit-block-title">指标内容</div>
                      <a-select
                        mode="multiple"
                        placeholder="选择显示内容"
                        style="width: 100%"
                        :value="currentCom.setting.style.echart.scatterStyle.customTooltipShowList"
                        @change="value => handleSelect('scatterStyle', 'customTooltipShowList', value)"
                      >
                        <a-select-option v-for="i in mapLabelTooltipSelectList" :key="i.alias" :value="i.alias">
                          {{ i.alias }}
                        </a-select-option>
                      </a-select>
                      <!-- 指标内容 end -->
                    </a-row>
                  </div>
                  <!-- 标记层设置 end -->
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
import { mutationTypes as historyMutation } from '@/store/modules/history';
const themeColorNMap = {
  yellow: ['rgb(249,217,96)', 'rgb(249,159,61)', 'rgb(247,107,28)'],
  blue: ['rgb(79,174,255)', 'rgb(55,115,205)', 'rgb(32,56,156)'],
  green: ['rgb(180,236,81)', 'rgb(120,189,55)', 'rgb(66,147,33)'],
};
export default {
  name: `${BoardType.ChartBar}Setting`,
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
      dataCollapseActive: ['dimension', 'measure', 'reset'], // 折叠打开选项
      styleCollapseActive: [],
      legendCollapseActive: [],
      colorModal: false,
      cacheBarColors: [].concat(this.currentCom.setting.style.echart.customBarColors),
      themeColors: ['yellow', 'blue', 'green'], // 地图填充色色系选择
      mapFillPointSelectList: [], // 地图填充指标选择列表
      mapFillTooltipSelectList: [], // 地图填充提示框选择列表
      mapLabelPointSelectList: [], // 地图标记层指标选择列表
      mapLabelTooltipSelectList: [], // 地图标记层提示框内容选择列表
    };
  },
  watch: {
    'currentCom.setting.data': {
      handler(val) {
        this.handleMapFormatterSelect(val);
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    /**
     * @description 处理图例样式
     */
    handleSelect(property, key, value) {
      this.handleChange('echart', {
        [property]: {
          [key]: value,
        },
      });
      console.log('new', this.currentCom);
    },
    /**
     * @description 处理位置
     */
    handlePosition(prefix, suffix) {
      const position = [prefix, suffix].join('-');
      this.handleChange('echart', {
        legend: {
          position,
          left: prefix,
          top: suffix,
        },
      });
    },
    /**
     * @description 处理视觉映射文本
     */
    handleVisualMapTextStyle(key, value) {
      this.handleChange('echart', {
        visualMap: {
          textStyle: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 处理坐标系样式
     */
    handleGeoItemStyleNormal(key, value) {
      this.handleChange('echart', {
        geo: {
          itemStyle: {
            normal: {
              [key]: value,
            },
          },
        },
      });
    },
    /**
     * @description 处理坐标系悬停样式
     */
    handleGeoItemStyleEmphasis(key, value) {
      this.handleChange('echart', {
        geo: {
          itemStyle: {
            emphasis: {
              [key]: value,
            },
          },
        },
      });
    },
    /**
     * @description 处理填充层颜色数组(视觉映射)
     */
    handleThemeColor(color) {
      this.handleSelect('mapStyle', 'customThemeColor', color);
      this.handleSelect('visualMap', 'inRange', { color: themeColorNMap[color] });
    },
    /**
     * @description 处理类型切换
     */
    handleDataType(key, value) {
      // 清空数据
      const dataMap = {
        customFillDataType: { latitude: [], longitude: [], dimensions: [], measures: [], [key]: value },
        customLabelDataType: {
          labelLatitude: [],
          labelLongitude: [],
          labelDimensions: [],
          labelMeasures: [],
          [key]: value,
        },
      };
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Data',
        target: this.currentCom,
        store: this.$store,
        eventBus: this.$EventBus,
        data: dataMap[key],
      });
    },
    /**
     * @description 初始化地图指标显示内容列表
     */
    handleMapFormatterSelect(data) {
      // 填充
      let { dimensions, longitude, latitude, measures, customFillDataType } = data;
      if (customFillDataType === 'area') {
        // 地区添加地区名/维度
        let di = dimensions[0] ? dimensions[0].alias : '';
        this.mapFillPointSelectList = [{ alias: di ? `地区名/${di}` : '' }].concat(measures);
        this.mapFillTooltipSelectList = [{ alias: di }].concat(measures);
      } else {
        let dimensionList = longitude.concat(latitude);
        this.mapFillTooltipSelectList = dimensionList.concat(measures);
        this.mapFillPointSelectList = [{ alias: '地区名' }].concat(this.mapFillTooltipSelectList);
      }
      // 散点
      let { labelDimensions, labelLongitude, labelLatitude, labelMeasures, customLabelDataType } =
        this.currentCom.setting.data;
      if (customLabelDataType === 'area') {
        // 标记点添加维度
        let labelDi = labelDimensions[0] ? labelDimensions[0].alias : '';
        this.mapLabelPointSelectList = [{ alias: labelDi ? `地区名/${labelDi}` : '' }].concat(labelMeasures);
        this.mapLabelTooltipSelectList = [{ alias: labelDi }].concat(labelMeasures);
      } else {
        let dimensionList = labelLongitude.concat(labelLatitude);
        this.mapLabelTooltipSelectList = dimensionList.concat(labelMeasures);
        this.mapLabelPointSelectList = [{ alias: '地区名' }].concat(this.mapLabelTooltipSelectList);
      }
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
.color-select-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  .color-select {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    cursor: pointer;
    opacity: 0.3;
    &:hover {
      border: 2px solid black;
      opacity: 1;
    }
    &.selected {
      border: 2px solid black;
      opacity: 1;
    }
    &.yellow {
      background: yellow;
    }
    &.blue {
      background: blue;
    }
    &.green {
      background: green;
    }
  }
}
.datatype-box {
  display: flex;
  justify-content: space-between;
  margin: 0 10px;
}
</style>
