<template>
  <div class="setting-unit-content">
    <UnitCheckbox
      class="show-btn"
      label="显示"
      :value="legend.show"
      @change="value => handleLegend('show', value)"
    ></UnitCheckbox>

    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">设置</div>
      </a-col>
      <!-- 图例 字体 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker :value="legend.textStyle.color" @change="color => handleTextStyle('color', color)"></ColorPicker>
        </div>
      </a-col>
      <!-- 图例 字体 颜色 end -->

      <!-- 图例 字体 大小 start -->
      <a-col :span="12" :offset="1">
        <a-input-number
          :min="0"
          :value="legend.textStyle.fontSize"
          @change="fontSize => handleTextStyle('fontSize', fontSize)"
        />
      </a-col>
      <!-- 图例 字体 大小 end -->
    </a-row>
    <a-row class="unit-show-block mb-8">
      <a-col :span="6" class="unit-show-block position">
        <div class="unit-block-title">排列</div>
      </a-col>

      <!-- 图例 排列方式 start -->
      <a-col :span="18">
        <a-radio-group
          name="radioGroup"
          :value="legend.orient"
          @change="event => handleLegend('orient', event.target.value)"
        >
          <a-radio value="horizontal">水平</a-radio>
          <a-radio value="vertical">垂直</a-radio>
        </a-radio-group>
      </a-col>
      <!-- 图例 排列方式 end -->
    </a-row>

    <!-- 图例 位置 start -->
    <a-row>
      <a-col :span="6" class="unit-show-block position">
        <div class="unit-block-title">位置</div>
      </a-col>
      <a-col :span="18">
        <a-radio-group
          :value="handleCutting(legend.position).prefix"
          size="small"
          @change="handleSwitchHorizontalPosition"
        >
          <a-radio-button value="left">左边</a-radio-button>
          <a-radio-button value="center">中间</a-radio-button>
          <a-radio-button value="right">右边</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="18" :offset="6">
        <a-radio-group
          :value="handleCutting(legend.position).suffix"
          size="small"
          @change="handleSwitchVerticalPosition"
        >
          <a-radio-button value="top">顶部</a-radio-button>
          <a-radio-button value="middle">中部</a-radio-button>
          <a-radio-button value="bottom">底部</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <!-- 图例 位置 end -->
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
