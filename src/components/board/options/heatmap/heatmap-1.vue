<template>
  <!-- 图形属性 -->
  <div>
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
    <gui-field label="展示指标">
      <a-switch
        v-model="selfConfig.series.label.show"
        size="small"
        @change="switchChange"
      ></a-switch>
    </gui-field>
    <gui-field label="指标内容"></gui-field>
    <a-select
      mode="tags"
      placeholder="选择显示内容"
      v-model="selfConfig.series.labelShowList"
      style="width: 100%"
      @change="setSelfProperty"
    >
      <a-select-option
        v-for="i in concatDimAndMea"
        :key="i.alias"
        :value="i.alias"
        >{{ i.alias }}</a-select-option
      >
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
    <gui-field label="位置">
      <gui-inline>
        <a-radio-group :value="selfConfig.visualMap.left" size="small">
          <a-radio-button
            value="left"
            @click.native.stop="
              onRadioChange($event, selfConfig.visualMap, 'left')
            "
            >左</a-radio-button
          >
          <a-radio-button
            value="center"
            @click.native.stop="
              onRadioChange($event, selfConfig.visualMap, 'left')
            "
            >中</a-radio-button
          >
          <a-radio-button
            value="right"
            @click.native.stop="
              onRadioChange($event, selfConfig.visualMap, 'left')
            "
            >右</a-radio-button
          >
        </a-radio-group>
      </gui-inline>
    </gui-field>
    <gui-field>
      <gui-inline>
        <a-radio-group :value="selfConfig.visualMap.top" size="small">
          <a-radio-button
            value="top"
            @click.native.stop="onRadioChange($event, selfConfig.visualMap, 'top')"
            >顶部</a-radio-button
          >
          <a-radio-button
            value="middle"
            @click.native.stop="onRadioChange($event, selfConfig.visualMap, 'top')"
            >居中</a-radio-button
          >
          <a-radio-button
            value="bottom"
            @click.native.stop="onRadioChange($event, selfConfig.visualMap, 'top')"
            >底部</a-radio-button
          >
        </a-radio-group>
      </gui-inline>
    </gui-field>
    <gui-field label="排列">
      <gui-inline>
        <a-radio-group :value="selfConfig.visualMap.orient" size="small">
          <a-radio-button
            value="horizontal"
            @click.native.stop="
              onRadioChange($event, selfConfig.visualMap, 'orient')
            "
            >水平</a-radio-button
          >
          <a-radio-button
            value="vertical"
            @click.native.stop="
              onRadioChange($event, selfConfig.visualMap, 'orient')
            "
            >垂直</a-radio-button
          >
        </a-radio-group>
      </gui-inline>
    </gui-field>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GuiField from '../gui-field'
import GuiInline from '../gui-inline'
export default {
  data() {
    return {}
  },
  inject: ['switchChange', 'setSelfProperty', 'onRadioChange'],
  props: {
    selfConfig: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters(['currSelected']),
    // 维度度量合并列表
    concatDimAndMea() {
      const {
        dimensions = [],
        measures = []
      } = this.currSelected.setting.api_data
      return dimensions.concat(measures)
    }
  },
  methods: {
  },
  components: {
    GuiField,
    GuiInline
  }
}
</script>

<style scoped></style>
