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
              <Collapse>
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
                <CollapsePanel class="content-item" panel="content" header="文本">
                  <div class="setting-unit-content">
                    <!-- 标题 字体 end -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">标题</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-input
                          :value="currentCom.setting.style.title.text"
                          :maxLength="20"
                          @blur="event => handleTitleChange('text', event.target.value)"
                        ></a-input>
                      </a-col>
                    </a-row>
                    <!-- 标题 粗细 end -->

                    <!-- 标题 文本 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="4">
                        <div class="unit-block-title">文本</div>
                      </a-col>
                      <a-col :span="4">
                        <div class="font-color">
                          <ColorPicker
                            :value="currentCom.setting.style.echart.text.color"
                            @change="color => handleSelect('color', color)"
                          ></ColorPicker>
                        </div>
                      </a-col>
                      <a-col :span="16">
                        <a-input-number
                          :value="currentCom.setting.style.echart.text.fontSize"
                          :min="0"
                          @change="size => handleSelect('fontSize', size)"
                        />
                      </a-col>
                    </a-row>
                    <!-- 标题 文本 end -->

                    <!-- 标题 字体 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">字体</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.text.fontFamily"
                          @change="family => handleSelect('fontFamily', family)"
                        >
                          <a-select-option :value="item.value" v-for="(item, index) in fontFamily" :key="index">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 标题 字体 end -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="6">
                        <div class="unit-block-title">粗细</div>
                      </a-col>
                      <a-col :span="16" :offset="2">
                        <a-select
                          style="width: 100%"
                          :value="currentCom.setting.style.echart.text.fontWeight"
                          @change="weight => handleSelect('fontWeight', weight)"
                        >
                          <a-select-option value="normal">正常</a-select-option>
                          <a-select-option value="bolder">加粗</a-select-option>
                          <a-select-option value="lighter">更细</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                    <!-- 标题 粗细 end -->

                    <!-- 标题 对齐 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="12">
                        <div class="unit-block-title">对齐</div>
                      </a-col>
                      <template v-for="item in align">
                        <a-col :span="4" :key="item">
                          <div
                            class="font-align"
                            :class="item === currentCom.setting.style.echart.text.textAlign ? 'selected' : ''"
                            @click="handleSelect('textAlign', item)"
                          >
                            <a-icon :type="`align-${item}`" />
                          </div>
                        </a-col>
                      </template>
                    </a-row>
                    <!-- 标题 对齐 end -->
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
  name: `${BoardType.Text}Setting`,
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
      dataCollapseActive: ['dataFilter'], // 折叠打开选项data() {
      align: ['left', 'center', 'right'], // 对齐方式
      fontFamily, //字体
    };
  },
  methods: {
    /**
     * @description 处理图例样式
     */
    handleSelect(key, value) {
      this.handleChange('echart', {
        text: {
          [key]: value,
        },
      });
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
