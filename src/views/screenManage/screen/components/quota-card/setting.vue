<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">指标卡</h2>
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
                <!-- 样式设置 start -->
                <CollapsePanel class="content-item" panel="style" header="主指标">
                  <div class="setting-unit-content">
                    <!-- 显示标题 start -->
                    <UnitCheckbox
                      class="show-btn"
                      label="指标标题"
                      :value="currentCom.setting.style.echart.totalQuatoTitle.show"
                      @change="show => handleSelect('totalQuatoTitle', 'show', show)"
                    ></UnitCheckbox>
                    <!-- 显示标题 end -->
                    <a-button size="small" type="primary" block @click="open('totalQuota')">设置指标标题</a-button>
                  </div>
                  <!-- 文本设置 start -->
                  <UnitFont
                    label="文本"
                    :font="currentCom.setting.style.echart.totalQuatoTitle"
                    @change="(key, value) => handleSelect('totalQuatoTitle', key, value)"
                  ></UnitFont>
                  <!-- 文本设置 end -->
                  <p class="setting-unit-content">指标内容</p>
                  <!-- 文本设置 start -->
                  <UnitFont
                    label="文本"
                    :font="currentCom.setting.style.echart.totalQuatoValue"
                    @change="(key, value) => handleSelect('totalQuatoValue', key, value)"
                  ></UnitFont>
                  <!-- 文本设置 end -->
                  <!-- 与次指标间距 start -->
                  <div class="setting-unit-content">
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="10" class="unit-show-block">
                        <div class="unit-block-title">与次指标间距</div>
                      </a-col>
                      <a-col :span="14">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.totalQuatoValue.marginBottom"
                          @change="value => handleSelect('totalQuatoValue', 'marginBottom', value)"
                        ></a-input-number>
                      </a-col>
                    </a-row>
                  </div>
                  <!-- 与次指标间距 end -->
                  <!-- 样式设置 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="style" header="次指标">
                  <div class="setting-unit-content">
                    <!-- 显示标题 start -->
                    <UnitCheckbox
                      class="show-btn"
                      label="指标标题"
                      :value="currentCom.setting.style.echart.secondaryQuatoTitle.show"
                      @change="show => handleSelect('secondaryQuatoTitle', 'show', show)"
                    ></UnitCheckbox>
                    <!-- 显示标题 end -->
                    <a-button size="small" type="primary" block @click="open('secondaryQuato')">设置指标标题</a-button>
                  </div>
                  <!-- 文本设置 start -->
                  <UnitFont
                    label="文本"
                    :font="currentCom.setting.style.echart.secondaryQuatoTitle"
                    @change="(key, value) => handleSelect('secondaryQuatoTitle', key, value)"
                  ></UnitFont>
                  <!-- 文本设置 end -->
                  <p class="setting-unit-content">指标内容</p>
                  <!-- 文本设置 start -->
                  <UnitFont
                    label="文本"
                    :font="currentCom.setting.style.echart.secondaryQuatoValue"
                    @change="(key, value) => handleSelect('secondaryQuatoValue', key, value)"
                  ></UnitFont>
                  <!-- 文本设置 end -->

                  <div class="setting-unit-content">
                    <!-- 与次指标间距 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="10" class="unit-show-block">
                        <div class="unit-block-title">指标间距</div>
                      </a-col>
                      <a-col :span="14">
                        <a-input-number
                          :min="0"
                          :max="100"
                          :value="currentCom.setting.style.echart.secondaryQuatoValue.marginBottom"
                          @change="value => handleSelect('secondaryQuatoValue', 'marginBottom', value)"
                        ></a-input-number>
                      </a-col>
                    </a-row>
                    <!-- 与次指标间距 end -->
                  </div>

                  <!-- 样式设置 end -->
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
    <a-modal
      :title="`设置${type === 'totalQuota' ? '主' : '次'}指标标题`"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible = false"
    >
      <a-row class="unit-show-block mb-8" v-for="title in quotaTitles" :key="title.orgin">
        <a-col :span="10" class="unit-show-block">
          <div class="unit-block-title">{{ title.orgin }}</div>
        </a-col>
        <a-col :span="14">
          <a-input v-model="title.current" :maxLength="20"></a-input>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import StyleMethodMixin from '@/views/screenManage/screen/setting/style-method-mixin';
export default {
  name: `${BoardType.QuatoCard}Setting`,
  mixins: [StyleMethodMixin],
  props: {
    currentCom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      visible: false,
      tabAcitve: 'style', // tab选项栏活动目标
      dataCollapseActive: ['targe', 'range', 'dataFilter'],
      styleCollapseActive: [],
      type: '', // 弹窗标题
      quotaTitles: [], // 设置标题弹窗显示的列表
    };
  },
  methods: {
    /**
     * @description 处理图表样式
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
     * @description 设置标题弹窗
     */
    open(type) {
      this.type = type;
      if (type === 'totalQuota') {
        const orginAlias = this.currentCom.setting.data.totalQuota[0]
          ? this.currentCom.setting.data.totalQuota[0].alias
          : '总获取量';
        const currentAlias = this.currentCom.setting.style.echart.totalQuatoTitle.text;
        this.quotaTitles = [{ orgin: orginAlias, current: currentAlias || orginAlias }];
      } else {
        let titles = [];
        const orginAlias = this.currentCom.setting.data.secondaryQuota;
        const currentAlias = this.currentCom.setting.style.echart.secondaryQuatoTitle.text;
        for (let i = 0; i < orginAlias.length; i++) {
          const alias = orginAlias[i].alias;
          titles.push({ orgin: alias, current: currentAlias[i] || alias });
        }
        this.quotaTitles = titles;
      }
      this.visible = true;
    },
    /**
     * @description 设置标题弹窗
     */
    handleOk() {
      if (this.type === 'totalQuota') {
        this.handleSelect('totalQuatoTitle', 'text', this.quotaTitles[0].current);
      } else {
        this.handleSelect(
          'secondaryQuatoTitle',
          'text',
          this.quotaTitles.map(item => item.current),
        );
      }
      this.visible = false;
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
