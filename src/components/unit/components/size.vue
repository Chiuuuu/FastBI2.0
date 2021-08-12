<template>
  <div class="unit-size">
    <a-row class="unit-show-block">
      <a-col :span="3">
        <div class="unit-block-title">尺寸</div>
      </a-col>
      <a-col :span="10" class="col-offset">
        <div class="unit-block-title">W</div>
        <a-input-number :value="size.width" :min="0" @change="val => handleChange('width', val)" />
      </a-col>
      <a-col :span="10" class="col-offset">
        <div class="unit-block-title">H</div>
        <a-input-number :value="size.height" :min="0" :max="heightMax" @change="val => handleChange('height', val)" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
/**
 * @description 尺寸设置
 */
export default {
  name: 'UnitSize',
  props: {
    size: {
      // 尺寸配置
      type: Object,
      required: true,
    },
    // 高度最大值设置
    heightMax: {
      type: Number,
      default: () => Number.POSITIVE_INFINITY,
    },
  },
  methods: {
    handleChange(key, val) {
      this.$emit('change', {
        [key]: val,
      });
    },
  },
};
</script>
