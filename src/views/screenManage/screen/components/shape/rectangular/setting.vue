<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">矩形</h2>
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
                <CollapsePanel class="content-item" panel="board" header="样式设置">
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

                    <!-- 边框设置 start -->
                    <UnitBorder
                      :border="currentCom.setting.style.echart.border"
                      @change="handleBorderChange"
                    ></UnitBorder>
                    <!-- 边框设置 end -->
                  </div>
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
  name: `${BoardType.ShapeRectangular}Setting`,
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
    handleBorderChange(key, value) {
      this.handleChange('echart', {
        [key]: value,
      });
    },
  },
};
</script>
