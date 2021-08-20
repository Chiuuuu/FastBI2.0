<template>
  <div class="setting-unit-content">
    <UnitCheckbox
      class="show-btn"
      label="显示"
      :value="legend.show"
      @change="value => handleLegend('show', value)"
    ></UnitCheckbox>

    <slot name="conTop"></slot>

    <!-- 图例 字体 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">文本</div>
      </a-col>
      <!-- 图例 字体 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker :value="legend.textStyle.color" @change="color => handleTextStyle('color', color)"></ColorPicker>
        </div>
      </a-col>
      <!-- 图例 字体 颜色 end -->

      <!-- 图例 字体 大小 start -->
      <a-col :span="16">
        <a-input-number
          :min="0"
          :value="legend.textStyle.fontSize"
          @change="fontSize => handleTextStyle('fontSize', fontSize)"
        />
      </a-col>
      <!-- 图例 字体 大小 end -->
    </a-row>
    <!-- 图例 字体 end -->

    <!-- 图例 间隔 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">图例间隔</div>
      </a-col>

      <a-col :span="16" :offset="2">
        <a-input-number :min="0" :value="legend.itemGap" @change="itemGap => handleLegend('itemGap', itemGap)" />
      </a-col>
    </a-row>
    <!-- 图例 间隔 end -->

    <!-- 图例 形状 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">图例形状</div>
      </a-col>

      <a-col :span="16" :offset="2">
        <a-select style="width: 100%" :value="legend.icon" @change="icon => handleLegend('icon', icon)">
          <a-select-option value="circle">圆形</a-select-option>
          <a-select-option value="rect">矩形</a-select-option>
          <a-select-option value="roundRect">圆矩形</a-select-option>
          <a-select-option value="diamond">菱形</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- 图例 形状 end -->

    <!-- 图例 位置 start -->
    <a-row>
      <a-col :span="6" class="unit-show-block position">
        <div class="unit-block-title">位置</div>
      </a-col>
      <a-col :span="18">
        <a-radio-group
          :value="handleCutting(legend.position).prefix"
          size="small"
          class="float-right"
          @change="handleSwitchHorizontalPosition"
        >
          <a-radio-button value="left">左边</a-radio-button>
          <a-radio-button value="center">中间</a-radio-button>
          <a-radio-button value="right">右边</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row class="mb-8">
      <a-col :span="18" :offset="6">
        <a-radio-group
          :value="handleCutting(legend.position).suffix"
          size="small"
          class="float-right"
          @change="handleSwitchVerticalPosition"
        >
          <a-radio-button value="top">顶部</a-radio-button>
          <a-radio-button value="middle">中部</a-radio-button>
          <a-radio-button value="bottom">底部</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <!-- 图例 位置 end -->

    <!-- 图例 图标位置 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="8" class="unit-show-block position">
        <div class="unit-block-title">图标位置</div>
      </a-col>

      <a-col :span="9" :offset="7">
        <a-radio-group
          name="radioGroup"
          size="small"
          class="float-right"
          :value="legend.align"
          @change="event => handleLegend('align', event.target.value)"
        >
          <a-radio-button value="left">左</a-radio-button>
          <a-radio-button value="right">右</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <!-- 图例 图标位置 end -->

    <!-- 图例 排列方式 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="8" class="unit-show-block position">
        <div class="unit-block-title">排列</div>
      </a-col>

      <a-col :span="12" :offset="4">
        <a-radio-group
          name="radioGroup"
          size="small"
          class="float-right"
          :value="legend.orient"
          @change="event => handleLegend('orient', event.target.value)"
        >
          <a-radio-button value="horizontal">水平</a-radio-button>
          <a-radio-button value="vertical">垂直</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <!-- 图例 排列方式 end -->
  </div>
</template>
<script>
/**
 * @description 图例设置
 */
export default {
  name: 'UnitLegend',
  props: {
    legend: {
      // 图例配置
      type: Object,
      required: true,
    },
  },
  methods: {
    /**
     * @description 分割位置
     */
    handleCutting(position) {
      const ary = position.split('-');
      if (ary.length !== 2) return console.error(`The format should be xx-xx`);
      return {
        prefix: ary[0],
        suffix: ary[1],
      };
    },
    /**
     * @description 处理水平
     */
    handleSwitchHorizontalPosition(event) {
      const prefix = event.target.value;
      const suffix = this.handleCutting(this.legend.position).suffix;
      this.handlePosition(prefix, suffix);
    },
    /**
     * @description 处理垂直
     */
    handleSwitchVerticalPosition(event) {
      const suffix = event.target.value;
      const prefix = this.handleCutting(this.legend.position).prefix;
      this.handlePosition(prefix, suffix);
    },
    /**
     * @description 处理位置
     */
    handlePosition(prefix, suffix) {
      const position = [prefix, suffix].join('-');
      this.handleChange('echart', {
        legend: {
          position,
          left: prefix,
          top: suffix,
        },
      });
    },
    /**
     * @description 处理图例的字体样式
     */
    handleTextStyle(key, value) {
      this.handleChange('echart', {
        legend: {
          textStyle: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 处理图例样式
     */
    handleLegend(key, value) {
      this.handleChange('echart', {
        legend: {
          [key]: value,
        },
      });
    },
    handleChange(key, value, isReset = false, beforeExecute, afterExecute) {
      this.$emit('change', key, value, isReset, beforeExecute, afterExecute);
    },
  },
};
</script>
