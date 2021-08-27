<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">{{ currentCom.graphName }}}</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
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
                  <div class="setting-unit-content">
                    <!-- 标题 end -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24">
                        <a-input
                          :value="currentCom.setting.style.title.text"
                          :maxLength="20"
                          @blur="event => handleTitleChange('text', event.target.value)"
                        ></a-input>
                      </a-col>
                    </a-row>
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="board" header="图形属性">
                  <div class="setting-unit-content">
                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      label="圆形背景"
                      :color="currentCom.setting.style.echart.background.color"
                      @change="color => handleChange('echart', { background: { color } })"
                    ></UnitBackgroundColor>

                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">透明度</div>
                      </a-col>
                      <!-- 透明度 start -->
                      <a-col :span="16" :offset="2">
                        <a-input-number
                          :value="currentCom.setting.style.echart.opacity"
                          :min="0"
                          :step="0.1"
                          :max="1"
                          @change="opacity => handleChange('echart', { opacity })"
                        />
                      </a-col>
                      <!-- 透明度 end -->
                    </a-row>
                    <div class="unit-border">
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="4">
                          <div class="unit-block-title">边框</div>
                        </a-col>
                        <!-- 边框 颜色 start -->
                        <a-col :span="4">
                          <div class="font-color">
                            <ColorPicker
                              :value="currentCom.setting.style.echart.border.color"
                              @change="color => handleChange('echart', { border: { color } })"
                            ></ColorPicker>
                          </div>
                        </a-col>
                        <!-- 边框 颜色 end -->

                        <!-- 边框 大小 start -->
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.echart.border.width"
                            :min="0"
                            :max="20"
                            @change="width => handleChange('echart', { border: { width } })"
                          />
                        </a-col>
                        <!-- 边框 大小 end -->
                      </a-row>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6">
                          <div class="unit-block-title">边框类型</div>
                        </a-col>
                        <!-- 边框 类型 start -->
                        <a-col :span="16" :offset="2">
                          <a-select
                            style="width: 100%"
                            :value="currentCom.setting.style.echart.border.style"
                            @change="style => handleChange('echart', { border: { style } })"
                          >
                            <a-select-option value="solid">实线</a-select-option>
                            <a-select-option value="dashed">虚线</a-select-option>
                            <a-select-option value="dotted">点线</a-select-option>
                          </a-select>
                        </a-col>
                        <!-- 边框 类型 end -->
                      </a-row>
                    </div>
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
  name: `${BoardType.ShapeRound}Setting`,
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
      styleCollapseActive: [],
    };
  },
  methods: {
    /**
     * @description 设置标题
     */
    handleTitleChange(key, value) {
      this.handleChange('title', {
        [key]: value,
      });
    },
  },
};
</script>
