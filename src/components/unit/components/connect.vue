<template>
  <div class="unit-connect">
    <div class="btn btn-ghost">创建图表联动</div>
    <UnitCheckbox label="点击时进行图表联动" v-model="titleCheckbox"></UnitCheckbox>
  </div>
</template>
<script>
/**
 * @description 联动设置
 */
export default {
  name: 'UnitConnect',
  data() {
    return {
      titleCheckbox: true,
    };
  },
};
</script>
