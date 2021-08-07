<template>
  <div>
    <gui-field v-if="isContinuous" label="图例颜色">
      <el-color-picker
        v-for="(color, index) in selfConfig.series.continuousColors"
        :key="index"
        v-model="selfConfig.series.continuousColors[index]"
        @change="changeColor"
      ></el-color-picker>
    </gui-field>
    <gui-field v-else label="图例颜色">
      <el-color-picker
        v-for="(color, index) in selfConfig.series.piecewiseColors"
        :key="index"
        v-model="selfConfig.series.piecewiseColors[index]"
        @change="changeColor"
      ></el-color-picker>
    </gui-field>
    <gui-field label="文本">
      <gui-inline label="字号">
        <a-input-number
          class="longwidth"
          v-model="selfConfig.visualMap.textStyle.fontSize"
          size="small"
          :min="12"
          :max="40"
          @change="setSelfProperty"
        ></a-input-number>
      </gui-inline>
      <gui-inline label="颜色">
        <el-color-picker
          v-model="selfConfig.visualMap.textStyle.color"
          @change="setSelfProperty"
        ></el-color-picker>
      </gui-inline>
    </gui-field>
    <gui-field label="样式">
      <gui-inline label="图例间隔">
        <a-input-number
          v-model="selfConfig.visualMap.itemGap"
          size="small"
          class="f-clear-width"
          :min="0"
          :max="50"
          @change="setSelfProperty"
        ></a-input-number>
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
import { mapGetters } from 'vuex'
import GuiField from '../gui-field'
import GuiInline from '../gui-inline'
export default {
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
    isContinuous() {
      return this.currSelected.setting.config.visualMap.type === 'continuous'
    }
  },
  components: {
    GuiField,
    GuiInline
  },
  data() {
    return {}
  },
  methods: {
    changeColor() {
      if (this.isContinuous) {
        this.selfConfig.visualMap.inRange.color = this.selfConfig.series.continuousColors
      } else {
        this.selfConfig.visualMap.inRange.color = this.selfConfig.series.piecewiseColors
      }
      this.setSelfProperty()
    }
  }
}
</script>

<style scoped></style>
