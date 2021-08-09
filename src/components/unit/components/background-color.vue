<template>
  <a-row class="unit-show-block">
    <!-- 名称 start -->
    <a-col :span="8">
      <div class="unit-block-title">{{ label }}</div>
    </a-col>
    <!-- 名称 end -->
    <!-- 样式 start -->
    <a-col :span="16">
      <div class="background-color">
        <ColorPicker :value="color" @change="color => handleChange(color)"></ColorPicker>
      </div>
    </a-col>
    <!-- 样式 end -->
  </a-row>
</template>
<script>
/**
 * @description 背景颜色设置
 */
export default {
  name: 'UnitBackgroundColor',
  props: {
    color: {
      // 颜色值
      type: String,
      required: true,
    },
    label: {
      // 名称
      type: String,
      default: '背景颜色',
    },
  },
  methods: {
    handleChange(value) {
      this.$emit('change', value);
    },
  },
};
</script>
<style lang="less" scoped>
@import url('../../../assets/less/mixins/set-color-picker.less');
.background-color {
  .set-color-picker();
  height: 26px;
}
</style>
