<template>
  <!-- 鼠标移入提示 -->
  <div>
    <gui-field label="指标内容"></gui-field>
    <a-select
      mode="multiple"
      placeholder="选择显示内容"
      v-model="selfConfig.series.tooltipShowList"
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuiField from '../gui-field'
export default {
  data() {
    return {
      tooltipShowList: []
    }
  },
  inject: ['switchChange', 'setSelfProperty'],
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
  components: {
    GuiField
  }
}
</script>

<style scoped></style>
