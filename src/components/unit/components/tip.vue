<template>
  <div class="unit-tip">{{ content }}</div>
</template>
<script>
/**
 * @description 提示
 */
export default {
  name: 'UnitTip',
  props: {
    content: {
      // 提示内容
      type: String,
      default: '',
    },
  },
};
</script>
<style lang="less">
.unit-tip {
  text-align: center;
  margin-top: 16px;
  color: #8f8f8f;
}
</style>
