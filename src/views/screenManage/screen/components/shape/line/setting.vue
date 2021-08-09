<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">直线</h2>
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
                      <UnitBackgroundColor
                        class="mb-8"
                        label="背景颜色"
                        :color="currentCom.setting.style.echart.border.color"
                        @change="color => handleChange('echart', { border: { color } })"
                      ></UnitBackgroundColor>
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
                <CollapsePanel class="content-item" panel="rotate" header="角度设置">
                  <div class="setting-unit-content">
                    <a-input-number
                      :value="currentCom.setting.style.echart.rotate"
                      :min="0"
                      :max="360"
                      @change="rotate => handleRotate(rotate)"
                    />
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
  name: `${BoardType.ShapeLine}Setting`,
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
  computed: {
    newOption() {
      const startDragInfo = {
        ...this.currentCom.setting.style.size,
        ...this.currentCom.setting.style.position,
      };
      return this.getOpition(startDragInfo, this.currentCom.setting.style.echart.rotate);
    },
  },
  methods: {
    getOpition(startDragInfo, rotate) {
      // 将角度化为弧度
      const angle = (Math.PI / 180) * rotate;

      const r = startDragInfo.width / 2;
      // 斜边乘cos值等于即可求出x坐标
      const x = Math.round(Math.cos(angle) * r);
      // 斜边乘sin值等于即可求出y坐标
      const y = Math.round(Math.sin(angle) * r);

      return {
        left: startDragInfo.left + startDragInfo.width / 2 - x,
        top: startDragInfo.top - y,
      };
    },
    handleRotate(rotate) {
      this.handleChange('echart', {
        rotate,
      });
    },
    /**
     * 求新坐标
     * @param {*} x 初始x坐标
     * @param {*} y 初始y坐标
     * @param {*} rotate 图标旋转后的角度
     */
    getTransform(rotate) {
      const { style } = this.currentCom.setting;

      const { size, position } = style;
      const { width, height } = size;
      const { left, top } = position;

      // 获取组件中心点位置
      const centerX = +(left + width / 2);
      const centerY = +(top + height / 2);
      return {
        centerX,
        centerY,
        rotate,
      };
    },
  },
};
</script>
