<template>
  <div class="unit-border">
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">边框</div>
      </a-col>
      <!-- 边框 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker :value="border.color" @change="color => handleChange('border', { color })"></ColorPicker>
        </div>
      </a-col>
      <!-- 边框 颜色 end -->

      <!-- 边框 大小 start -->
      <a-col :span="16">
        <a-input-number
          :value="border.width"
          :min="1"
          :max="widthMax"
          @change="width => handleChange('border', { width })"
        />
      </a-col>
      <!-- 边框 大小 end -->
    </a-row>
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">边框类型</div>
      </a-col>
      <!-- 边框 类型 start -->
      <a-col :span="16" :offset="2">
        <a-select style="width: 100%" :value="border.style" @change="handleSelect">
          <a-select-option value="solid">实线</a-select-option>
          <a-select-option value="dashed">虚线</a-select-option>
          <a-select-option value="dotted">点线</a-select-option>
        </a-select>
      </a-col>
      <!-- 边框 类型 end -->
    </a-row>
    <a-row class="unit-show-block">
      <a-col :span="8">
        <div class="unit-block-title">边框圆角</div>
      </a-col>
      <a-col :span="16">
        <a-input-number
          :value="border.radius"
          :min="0"
          :max="radiusMax"
          @change="radius => handleChange('border', { radius })"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script>
/**
 * @description 边框设置
 */
export default {
  name: 'UnitBorder',
  props: {
    border: {
      // 边框配置
      type: Object,
      default: () => {},
    },
    // 边框宽度最大值设置
    widthMax: {
      type: Number,
      default: () => 20,
    },
    // 边框圆角最大值设置
    radiusMax: {
      type: Number,
      default: 100,
    },
  },
  methods: {
    /**
     * @description 边框类型选择
     */
    handleSelect(value) {
      this.handleChange('border', {
        style: value,
      });
    },
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
  },
};
</script>
