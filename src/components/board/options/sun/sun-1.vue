<template>
  <!-- 指标设置 -->
  <div>
    <gui-field label="显示内容"></gui-field>
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
    <gui-field label="显示位置">
      <gui-inline>
        <a-radio-group :value="selfConfig.series.label.position" size="small">
          <a-radio-button
            value="inside"
            @click.native.stop="
              onRadioChange($event, selfConfig.series.label, 'position')
            "
            >内部</a-radio-button
          >
          <a-radio-button
            value="outside"
            @click.native.stop="
              onRadioChange($event, selfConfig.series.label, 'position')
            "
            >外部</a-radio-button
          >
        </a-radio-group>
      </gui-inline>
    </gui-field>
    <gui-field label="排列">
      <gui-inline>
        <a-radio-group :value="selfConfig.series.label.orient" size="small">
          <a-radio-button
            value="vertical"
            @click.native.stop="
              onRadioChange($event, selfConfig.series.label, 'orient')
            "
            >垂直</a-radio-button
          >
          <a-radio-button
            value="horizontal"
            @click.native.stop="
              onRadioChange($event, selfConfig.series.label, 'orient')
            "
            >水平</a-radio-button
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
