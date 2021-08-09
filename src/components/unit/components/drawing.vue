<template>
  <div class="setting-unit-content">
    <UnitBackgroundColor
      class="mb-8"
      :color="grid.backgroundColor"
      label="绘图背景"
      @change="backgroundColor => handleGridChange('backgroundColor', backgroundColor)"
    ></UnitBackgroundColor>
    <UnitBackgroundColor
      class="mb-8"
      :color="grid.borderColor"
      label="边框颜色"
      @change="borderColor => handleGridChange('borderColor', borderColor)"
    ></UnitBackgroundColor>
    <p>网格线设置</p>
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">水平</div>
      </a-col>
      <!-- 水平网格线 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker
            :value="yAxis.splitLine.lineStyle.color"
            @change="color => handleYaxis('lineStyle', { color })"
          ></ColorPicker>
        </div>
      </a-col>
      <!-- 水平网格线 颜色 end -->
      <a-col :span="16">
        <a-row>
          <!-- 水平网格线 类型 start -->
          <a-col :span="14">
            <a-select
              style="width: 100%"
              :value="yAxis.splitLine.lineStyle.type"
              @change="type => handleYaxis('lineStyle', { type })"
            >
              <a-select-option value="solid">实线</a-select-option>
              <a-select-option value="dashed">虚线</a-select-option>
              <a-select-option value="dotted">点线</a-select-option>
            </a-select>
          </a-col>
          <!-- 水平网格线 类型 end -->

          <a-col :span="10">
            <UnitCheckbox
              class="show-btn block-checkbox"
              label="显示"
              :value="yAxis.splitLine.show"
              @change="show => handleYaxis('show', show)"
            ></UnitCheckbox>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">垂直</div>
      </a-col>

      <!-- 垂直网格线 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker
            :value="xAxis.splitLine.lineStyle.color"
            @change="color => handleXaxis('lineStyle', { color })"
          ></ColorPicker>
        </div>
      </a-col>
      <!-- 垂直网格线 颜色 end -->

      <a-col :span="16">
        <a-row>
          <!-- 垂直网格线 类型 start -->
          <a-col :span="14">
            <a-select
              style="width: 100%"
              :value="xAxis.splitLine.lineStyle.type"
              @change="type => handleXaxis('lineStyle', { type })"
            >
              <a-select-option value="solid">实线</a-select-option>
              <a-select-option value="dashed">虚线</a-select-option>
              <a-select-option value="dotted">点线</a-select-option>
            </a-select>
          </a-col>
          <!-- 垂直网格线 类型 end -->

          <a-col :span="10">
            <UnitCheckbox
              class="show-btn block-checkbox"
              label="显示"
              :value="xAxis.splitLine.show"
              @change="show => handleXaxis('show', show)"
            ></UnitCheckbox>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>
<script>
/**
 * @description 绘图区设置
 */
export default {
  name: 'UnitDrawing',
  props: {
    grid: {
      // 网格配置
      type: Object,
      required: true,
    },
    xAxis: {
      // X轴
      type: Object,
      required: true,
    },
    yAxis: {
      // Y轴
      type: Object,
      required: true,
    },
  },
  methods: {
    /**
     * @description 网格线设置
     */
    handleGridChange(key, value) {
      this.handleChange('echart', {
        grid: {
          [key]: value,
        },
      });
    },
    /**
     * @description 垂直网格线设置
     */
    handleXaxis(key, value) {
      this.handleChange('echart', {
        xAxis: {
          splitLine: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 水平网格线设置
     */
    handleYaxis(key, value) {
      this.handleChange('echart', {
        yAxis: {
          splitLine: {
            [key]: value,
          },
        },
      });
    },
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
  },
};
</script>
