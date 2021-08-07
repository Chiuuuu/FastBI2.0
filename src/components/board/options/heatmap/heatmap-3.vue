<template>
  <div>
    <gui-field label="图例颜色">
      <el-color-picker
        v-for="(color, index) in selfConfig.visualMap.inRange.color"
        :key="index"
        v-model="selfConfig.visualMap.inRange.color[index]"
        @change="setSelfProperty"
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
    ...mapGetters(['currSelected'])
  },
  components: {
    GuiField,
    GuiInline
  },
  data() {
    return {}
  },
  methods: {
  }
}
</script>

<style scoped></style>
