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

                <CollapsePanel class="content-item" panel="style" header="图形属性">
                  <div class="setting-unit-content">
                    <!-- 表盘中心 -->
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
                          :value="handleSplitPercent(gauge.center[0])"
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
                          :value="handleSplitPercent(gauge.center[1])"
                          @change="value => handleStoreCenter(value, 1)"
                        ></a-input-number>
                      </a-col>
                      <!-- 中心点 Y坐标 end -->
                    </a-row>

                    <!-- 表盘角度 -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="7">
                        <div class="unit-block-title">表盘角度</div>
                      </a-col>

                      <!-- 表盘角度 起点 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">起</div>
                        <a-input-number
                          :min="-360"
                          :max="360"
                          :value="gauge.startAngle"
                          @change="startAngle => handleTarget('startAngle', startAngle)"
                        ></a-input-number>
                      </a-col>
                      <!-- 表盘角度 起点 end -->
                      <!-- 表盘角度 终点 start -->
                      <a-col :span="8" class="col-offset">
                        <div class="unit-block-title">终</div>
                        <a-input-number
                          :min="-360"
                          :max="360"
                          :value="gauge.endAngle"
                          @change="endAngle => handleTarget('endAngle', endAngle)"
                        ></a-input-number>
                      </a-col>
                      <!-- 表盘角度 终点 end -->
                    </a-row>

                    <!-- 目标颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="目标颜色"
                      :color="currentCom.setting.style.echart.customTarget.color"
                      @change="color => handleTargetColor('color', color)"
                    ></UnitBackgroundColor>
                    <!-- 目标颜色 end -->

                    <!-- 预警颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="预警颜色"
                      :color="currentCom.setting.style.echart.customTarget.backgroundColor"
                      @change="color => handleTargetColor('backgroundColor', color)"
                    ></UnitBackgroundColor>
                    <!-- 预警颜色 end -->

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">进度条</div>
                      </a-col>
                      <a-col :span="10" :offset="10">
                        <UnitCheckbox
                          class="show-btn block-checkbox"
                          label="显示"
                          :value="gauge.progress.show"
                          @change="value => handleTargetShow(value)"
                        ></UnitCheckbox>
                      </a-col>
                    </a-row>

                    <!-- 进度条相关配置 start -->
                    <template v-if="gauge.progress.show">
                      <a-row class="unit-show-block">
                        <!-- 进度值 颜色 start -->
                        <UnitBackgroundColor
                          class="mb-8"
                          label="进度颜色"
                          :color="gauge.progress.itemStyle.color"
                          @change="color => handleTarget('progress', { itemStyle: { color } })"
                        ></UnitBackgroundColor>
                        <!-- 进度值 颜色 end -->
                      </a-row>
                    </template>
                    <!-- 进度条相关配置 end -->

                    <!-- 指针显示 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">指针</div>
                      </a-col>
                      <a-col :span="10" :offset="10">
                        <UnitCheckbox
                          class="show-btn block-checkbox"
                          label="显示"
                          :value="gauge.pointer.show"
                          @change="show => handleTarget('pointer', { show })"
                        ></UnitCheckbox>
                      </a-col>
                    </a-row>
                    <!-- 指针显示 end -->

                    <!-- 指针相关配置 start -->
                    <template v-if="gauge.pointer.show">
                      <a-row class="unit-show-block mb-8">
                        <!-- 指针颜色 start -->
                        <UnitBackgroundColor
                          label="颜色"
                          :color="gauge.pointer.itemStyle.color"
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
                            :value="gauge.pointer.width"
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
                            :value="handleSplitPercent(gauge.pointer.length)"
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
                            :value="handleSplitPercent(gauge.pointer.offsetCenter[0])"
                            @change="value => handleCenter('pointer', value, gauge.pointer.offsetCenter, 0)"
                          ></a-input-number>
                        </a-col>
                        <!-- 中心点 X坐标 end -->
                        <!-- 中心点 Y坐标 start -->
                        <a-col :span="8" class="col-offset">
                          <div class="unit-block-title">Y</div>
                          <a-input-number
                            :min="-100"
                            :max="100"
                            :value="handleSplitPercent(gauge.pointer.offsetCenter[1])"
                            @change="value => handleCenter('pointer', value, gauge.pointer.offsetCenter, 1)"
                          ></a-input-number>
                        </a-col>
                        <!-- 中心点 Y坐标 end -->
                      </a-row>
                    </template>
                    <!-- 指针相关配置 end -->

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">刻度</div>
                      </a-col>
                    </a-row>
                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="背景颜色"
                      :color="gauge.axisLine.lineStyle.color[0][1]"
                      @change="color => handleBG(color)"
                    ></UnitBackgroundColor>
                    <!-- 背景颜色 end -->

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">刻度宽度</div>
                      </a-col>

                      <!-- 中心点 X坐标 start -->
                      <a-col :span="16" :offset="2">
                        <a-input-number
                          :min="0"
                          :value="gauge.axisLine.lineStyle.width"
                          @change="width => handleAxisLineWidth(width)"
                        ></a-input-number>
                      </a-col>
                    </a-row>

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
                    <!-- 文本 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">文本</div>
                      </a-col>
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="gauge.axisLabel.color"
                            @change="color => this.handleTargetAxisLabelFont('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="gauge.axisLabel.fontSize"
                          :min="0"
                          @change="fontSize => this.handleTargetAxisLabelFont('fontSize', fontSize)"
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
                          :value="gauge.axisLabel.fontFamily"
                          @change="fontFamily => this.handleTargetAxisLabelFont('fontFamily', fontFamily)"
                        >
                          <a-select-option value="sans-serif">默认</a-select-option>
                          <a-select-option value="simfang">simfang</a-select-option>
                          <a-select-option value="fangsong">仿宋_GB2312</a-select-option>
                          <a-select-option value="times">times</a-select-option>
                          <a-select-option value="msyh">微软雅黑</a-select-option>
                          <a-select-option value="simkai">simkai</a-select-option>
                          <a-select-option value="pangmenzhengdao">庞门正道标题体</a-select-option>
                          <a-select-option value="HuXiaoBoNanShenTi">HuXiaoBoNanShenTi</a-select-option>
                          <a-select-option value="youshe">优设标题黑</a-select-option>
                          <a-select-option value="digital-7-4">digital-7-4</a-select-option>
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
                          :value="gauge.axisLabel.fontWeight"
                          @change="fontWeight => this.handleTargetAxisLabelFont('fontWeight', fontWeight)"
                        >
                          <a-select-option value="normal">正常</a-select-option>
                          <a-select-option value="bolder">加粗</a-select-option>
                          <a-select-option value="lighter">更细</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 粗细 end -->
                  </div>
                </CollapsePanel>

                <CollapsePanel class="content-item" panel="label" header="指标设置">
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">名称</div>
                      </a-col>
                      <a-col :span="10" :offset="10">
                        <UnitCheckbox
                          class="show-btn block-checkbox"
                          label="显示"
                          :value="gauge.title.show"
                          @change="show => handleTarget('title', { show })"
                        ></UnitCheckbox>
                      </a-col>
                    </a-row>

                    <!-- 名称相关配置 start -->
                    <template v-if="gauge.title.show">
                      <!-- 指标名称 中心点 start -->
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
                            :value="handleSplitPercent(gauge.title.offsetCenter[0])"
                            @change="value => handleLabelCenter('title', value, 0)"
                          ></a-input-number>
                        </a-col>
                        <!-- 中心点 X坐标 end -->
                        <!-- 中心点 Y坐标 start -->
                        <a-col :span="8" class="col-offset">
                          <div class="unit-block-title">Y</div>
                          <a-input-number
                            :min="0"
                            :max="100"
                            :value="handleSplitPercent(gauge.title.offsetCenter[1])"
                            @change="value => handleLabelCenter('title', value, 1)"
                          ></a-input-number>
                        </a-col>
                        <!-- 中心点 Y坐标 end -->
                      </a-row>
                      <!-- 指标名称 中心点 end -->

                      <!-- 文本 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="4">
                          <div class="unit-block-title">文本</div>
                        </a-col>

                        <!-- 字体 颜色 start -->
                        <a-col :span="4">
                          <div class="font-color">
                            <ColorPicker
                              :value="gauge.title.color"
                              @change="color => handleTarget('title', { color })"
                            ></ColorPicker>
                          </div>
                        </a-col>
                        <!-- 字体 颜色 end -->

                        <a-col :span="16">
                          <a-input-number
                            :value="gauge.title.fontSize"
                            :min="0"
                            @change="fontSize => handleTarget('title', { fontSize })"
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
                            :value="gauge.title.fontFamily"
                            @change="fontFamily => this.handleTarget('title', { fontFamily })"
                          >
                            <a-select-option value="sans-serif">默认</a-select-option>
                            <a-select-option value="simfang">simfang</a-select-option>
                            <a-select-option value="fangsong">仿宋_GB2312</a-select-option>
                            <a-select-option value="times">times</a-select-option>
                            <a-select-option value="msyh">微软雅黑</a-select-option>
                            <a-select-option value="simkai">simkai</a-select-option>
                            <a-select-option value="pangmenzhengdao">庞门正道标题体</a-select-option>
                            <a-select-option value="HuXiaoBoNanShenTi">HuXiaoBoNanShenTi</a-select-option>
                            <a-select-option value="youshe">优设标题黑</a-select-option>
                            <a-select-option value="digital-7-4">digital-7-4</a-select-option>
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
                            :value="gauge.title.fontWeight"
                            @change="fontWeight => this.handleTarget('title', { fontWeight })"
                          >
                            <a-select-option value="normal">正常</a-select-option>
                            <a-select-option value="bolder">加粗</a-select-option>
                            <a-select-option value="lighter">更细</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <!-- 粗细 end -->
                    </template>
                    <!-- 名称相关配置 end -->

                    <!-- 展示数值 -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="5">
                        <div class="unit-block-title">展示数值</div>
                      </a-col>
                      <a-col :span="10" :offset="9">
                        <UnitCheckbox
                          class="show-btn block-checkbox"
                          label="显示"
                          :value="gauge.detail.show"
                          @change="show => handleTarget('detail', { show })"
                        ></UnitCheckbox>
                      </a-col>
                    </a-row>
                    <!-- 数值相关配置 start -->
                    <template v-if="gauge.detail.show">
                      <!-- 数值 中心点 start -->
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
                            :value="handleSplitPercent(gauge.detail.offsetCenter[0])"
                            @change="value => handleLabelCenter('detail', value, 0)"
                          ></a-input-number>
                        </a-col>
                        <!-- 中心点 X坐标 end -->
                        <!-- 中心点 Y坐标 start -->
                        <a-col :span="8" class="col-offset">
                          <div class="unit-block-title">Y</div>
                          <a-input-number
                            :min="0"
                            :max="100"
                            :value="handleSplitPercent(gauge.detail.offsetCenter[1])"
                            @change="value => handleLabelCenter('detail', value, 1)"
                          ></a-input-number>
                        </a-col>
                        <!-- 中心点 Y坐标 end -->
                      </a-row>
                      <!-- 数值 中心点 end -->

                      <!-- 文本 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="4">
                          <div class="unit-block-title">文本</div>
                        </a-col>
                        <a-col :span="4">
                          <div class="font-color">
                            <ColorPicker
                              :value="gauge.detail.color"
                              @change="color => this.handleTarget('detail', { color })"
                            ></ColorPicker>
                          </div>
                        </a-col>
                        <a-col :span="16">
                          <a-input-number
                            :value="gauge.detail.fontSize"
                            :min="0"
                            @change="fontSize => this.handleTarget('detail', { fontSize })"
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
                            :value="gauge.detail.fontFamily"
                            @change="fontFamily => this.handleTarget('detail', { fontFamily })"
                          >
                            <a-select-option value="sans-serif">默认</a-select-option>
                            <a-select-option value="simfang">simfang</a-select-option>
                            <a-select-option value="fangsong">仿宋_GB2312</a-select-option>
                            <a-select-option value="times">times</a-select-option>
                            <a-select-option value="msyh">微软雅黑</a-select-option>
                            <a-select-option value="simkai">simkai</a-select-option>
                            <a-select-option value="pangmenzhengdao">庞门正道标题体</a-select-option>
                            <a-select-option value="HuXiaoBoNanShenTi">HuXiaoBoNanShenTi</a-select-option>
                            <a-select-option value="youshe">优设标题黑</a-select-option>
                            <a-select-option value="digital-7-4">digital-7-4</a-select-option>
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
                            :value="gauge.detail.fontWeight"
                            @change="fontWeight => this.handleTarget('detail', { fontWeight })"
                          >
                            <a-select-option value="normal">正常</a-select-option>
                            <a-select-option value="bolder">加粗</a-select-option>
                            <a-select-option value="lighter">更细</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <!-- 粗细 end -->

                      <!-- 数据格式 start -->
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6">
                          <div class="unit-block-title">数据格式</div>
                        </a-col>
                        <a-col :span="16" :offset="2">
                          <a-select
                            style="width: 100%"
                            :value="currentCom.setting.style.echart.customValue"
                            @change="customValue => this.handleTargetValue('customValue', customValue)"
                          >
                            <a-select-option value="percentage">百分比</a-select-option>
                            <a-select-option value="normal">数值</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                      <!-- 数据格式 end -->

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
                            @change="customFixed => this.handleTargetValue('customFixed', customFixed)"
                          />
                        </a-col>
                      </a-row>
                      <!-- 小数位数 end -->
                    </template>
                    <!-- 数值相关配置 end -->
                  </div>
                  <!-- 数值字体 end -->
                </CollapsePanel>

                <CollapsePanel class="content-item" panel="bgAndBorder" header="背景和边框">
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
    gauge() {
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
    // 进度条颜色
    handleTargetColor(key, value) {
      this.handleChange('echart', {
        customTarget: {
          [key]: value,
        },
      });
    },
    // 数值展示(百分比or数值, 保留小数位)
    handleTargetValue(key, value) {
      this.handleChange('echart', {
        [key]: value,
      });
    },
    // 指标字体设置
    handleLabelFont(type, font, value) {
      this.handleTarget(type, {
        [font]: value,
      });
    },
    // 表盘刻度字体设置
    handleTargetAxisLabelFont(type, value) {
      this.handleTarget('axisLabel', {
        [type]: value,
      });
    },
    // 背景层
    handleBG(value) {
      const ary = [].concat(this.gauge.axisLine.lineStyle.color[0]);
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
    // 处理百分比
    handleSplitPercent(value) {
      return value.split('%').shift();
    },
    // 指标中心偏移
    handleLabelCenter(key, value, index) {
      const offsetCenter = [].concat(this.gauge[key].offsetCenter);
      offsetCenter.splice(index, 1, `${value}%`);
      this.handleChange('echart', {
        customOptions: {
          [key]: {
            offsetCenter,
          },
        },
      });
    },
    // 指针中心偏移
    handleCenter(key, value, ary, index) {
      ary = [].concat(ary);
      ary.splice(index, 1, `${value}%`);
      this.handleTarget(key, {
        offsetCenter: ary,
      });
    },
    // 表盘中心偏移
    handleStoreCenter(value, index) {
      const ary = [].concat(this.gauge.center);
      ary.splice(index, 1, `${value}%`);
      this.handleTarget('center', ary);
    },
    // 显示进度条
    handleTargetShow(value) {
      this.handleChange('echart', {
        customOptions: {
          progress: {
            show: value,
          },
          // detail: {
          //   show: value,
          // },
        },
      });
    },
    // 表盘刻度and进度条宽度
    handleAxisLineWidth(width) {
      this.handleChange('echart', {
        customOptions: {
          axisLine: {
            lineStyle: { width },
          },
          progress: { width },
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
