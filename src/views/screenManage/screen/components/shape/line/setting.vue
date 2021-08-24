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
                    :heightMax="300"
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
                    <div class="unit-border">
                      <UnitBackgroundColor
                        class="mb-8"
                        label="线条颜色"
                        :color="currentCom.setting.style.echart.border.color"
                        @change="color => handleChange('echart', { border: { color } })"
                      ></UnitBackgroundColor>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8">
                          <div class="unit-block-title">线型</div>
                        </a-col>
                        <!-- 线型 start -->
                        <a-col :span="16">
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
                        <!-- 线型 end -->
                      </a-row>
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="8">
                          <div class="unit-block-title">线宽</div>
                        </a-col>
                        <!-- 线型 start -->
                        <a-col :span="16">
                          <a-input-number
                            :value="currentCom.setting.style.size.height"
                            :min="0"
                            :max="20"
                            @change="height => handleChange('size', { height })"
                          />
                        </a-col>
                        <!-- 线型 end -->
                      </a-row>
                    </div>
                    <!-- 线条阴影 -->
                    <div class="unit-boxShadow">
                      <a-row class="unit-show-block mb-8">
                        <a-col :span="6">
                          <div class="unit-block-title">线条阴影</div>
                        </a-col>
                        <!-- 线条阴影 start -->
                        <a-col :span="16" :offset="2">
                          <UnitCheckbox
                            class="show-btn"
                            label="启用"
                            style="top: -3px"
                            :value="currentCom.setting.style.echart.boxShadow ? true : false"
                            @change="value => handleBoxShadowChange(value)"
                          ></UnitCheckbox>
                        </a-col>
                        <!-- 线条阴影 end -->
                      </a-row>
                      <a-row class="unit-show-block mb-8" v-if="currentCom.setting.style.echart.boxShadow">
                        <a-col :span="6">
                          <div class="unit-block-title">阴影颜色</div>
                        </a-col>
                        <!-- 阴影颜色 start -->
                        <a-col :span="16" :offset="2">
                          <div class="shadow-color">
                            <ColorPicker
                              :value="currentCom.setting.style.echart.shadowColor"
                              @change="color => handleshadowColorChange(color)"
                            ></ColorPicker>
                          </div>
                        </a-col>
                        <!-- 阴影颜色 end -->
                      </a-row>
                    </div>
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">透明度</div>
                      </a-col>
                      <!-- 透明度 start -->
                      <a-col :span="16">
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
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="8">
                        <div class="unit-block-title">角度设置</div>
                      </a-col>
                      <!-- 角度设置 start -->
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.rotate"
                          :min="0"
                          :max="360"
                          @change="rotate => handleRotate(rotate)"
                        />
                      </a-col>
                      <!-- 角度设置 end -->
                    </a-row>
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
     * @description 线条阴影 启用设置
     */
    handleBoxShadowChange(value, color) {
      let boxShadow = '';
      if (value || color) {
        boxShadow = `0 ${this.currentCom.setting.style.size.height / 2}px ${
          this.currentCom.setting.style.size.height
        }px ${this.currentCom.setting.style.echart.shadowColor}`;
      }
      this.handleChange('echart', {
        boxShadow,
      });
    },
    /**
     * @description 线条颜色
     */
    handleshadowColorChange(shadowColor) {
      this.handleChange('echart', {
        shadowColor,
      });
      this.handleBoxShadowChange('', shadowColor);
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
<style lang="less" scoped>
@import url('@/assets/less/mixins/set-color-picker.less');
.shadow-color {
  .set-color-picker();
  height: 26px;
}
</style>
