<template>
  <a-row class="unit-show-block color-list-flex">
    <!-- 颜色列表 start -->
    <ColorPicker
      class="item-color"
      v-for="(item, index) in color"
      :key="index"
      :value="item"
      @change="color => handleChangeColor(color, index)"
    ></ColorPicker>
    <!-- 颜色列表 end -->
  </a-row>
</template>
<script>
/**
 * @description 背景颜色设置
 */
export default {
  name: 'UnitChartColor',
  props: {
    color: {
      // 颜色值
      type: Array,
      required: true,
    },
    label: {
      // 名称
      type: String,
      default: '颜色',
    },
  },
  methods: {
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
    handleChangeColor(item, index) {
      const color = [].concat(this.color);
      color[index] = item;
      this.handleChange('echart', {
        color,
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import url('../../../assets/less/mixins/set-color-picker.less');
.color-list-flex {
  display: flex;
  flex-wrap: wrap;
  margin-left: 15px;
  margin-bottom: 10px;
}
.item-color {
  .set-color-picker();
  height: 26px;
  width: 26px;
  margin: 4px;
}
</style>
