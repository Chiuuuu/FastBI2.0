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
    <gui-field label="矩形颜色">
      <a-select
        v-model="selfConfig.series.recDimensionIndex"
        style="width: 164px"
        @change="changeDimension"
      >
        <a-select-option
          v-for="(item, index) in concatDimAndMea"
          :key="item.alias"
          :value="index"
          >{{ item.alias }}</a-select-option
        >
      </a-select>
    </gui-field>
    <gui-field label="矩形大小">
      <a-select
        v-model="selfConfig.series.recSize"
        style="width: 164px"
        @change="changeRecSize"
      >
        <a-select-option value="value">按度量</a-select-option>
        <a-select-option value="none">不区分</a-select-option>
      </a-select>
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TreeGroupBy from './tree-groupby'
import GuiField from '../gui-field'
import GuiInline from '../gui-inline'
export default {
  data() {
    return {}
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
  methods: {
    // 控制当前视觉映射的维度
    changeDimension(index) {
      // 选择了度量(视觉映射转为径向渐变)
      if (index === this.concatDimAndMea.length - 1) {
        this.selfConfig.visualMap.max = this.selfConfig.series.visualMaxList[0]
        this.selfConfig.visualMap.type = 'continuous'
        this.selfConfig.visualMap.inRange.color = this.selfConfig.series.continuousColors
      } else {
        // 获取当前指向哪个维度(视觉映射转为分块展示)
        let dimensionIndex = this.concatDimAndMea.length - index - 2
        dimensionIndex = dimensionIndex < 0 ? 0 : dimensionIndex
        this.selfConfig.visualMap.dimension = dimensionIndex + 1
        this.selfConfig.visualMap.max = this.selfConfig.series.visualMaxList[dimensionIndex]
        this.selfConfig.visualMap.type = 'piecewise'
        this.selfConfig.visualMap.inRange.color = this.selfConfig.series.piecewiseColors
        this.selfConfig.visualMap.pieces = TreeGroupBy.handlePieces(this.selfConfig.series.data, index)
      }
      // this.changeRecSize(this.selfConfig.series.recSize)
      this.setSelfProperty()
    },
    // 控制矩形大小是否等大或按照value值比例展示
    changeRecSize(value) {
      const data = this.selfConfig.series.data
      if (value === 'none') {
        TreeGroupBy.loopSetTreeValue(data, true)
      } else if (value === 'value') {
        TreeGroupBy.loopSetTreeValue(data, false)
      }
      this.setSelfProperty()
    },
    // 递归遍历树结构, 并修改value值
    loopSetTreeValue(list, isEqual) {
      list.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.loopSetTreeValue(node.children, isEqual)
        } else {
          if (isEqual) {
            node.value[0] = 1
          } else {
            node.value[0] = node.value[1]
          }
        }
      })
    }
  },
  components: {
    GuiField,
    GuiInline
  }
}
</script>

<style scoped></style>
