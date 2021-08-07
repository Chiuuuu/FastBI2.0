<template>
  <div class="unit-checkbox clearfix">
    <span class="label-title">{{ label }}</span>
    <input type="checkbox" :checked="value" @change="handleChange" />
  </div>
</template>
<script>
export default {
  name: 'UnitCheckbox',
  props: {
    label: {
      // 标题
      type: String,
      default: ''
    },
    value: {
      // 值
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  methods: {
    /*
     * 值变化
     */
    handleChange(event) {
      this.$emit('change', event.target.checked)
    }
  }
}
</script>
<style lang="less" scoped>
.unit-checkbox {
  height: 30px;
  line-height: 30px;
  .label-title {
    display: block;
    float: left;
    margin-right: 4px;
    margin-top: 2px;
  }
  > input[type='checkbox'] {
    position: relative;
    appearance: none;
    margin-top: 9px;
    float: right;
    width: 14px;
    height: 14px;
    outline: none;
    &:checked {
      &::before {
        border-color: #103ffa;
        background-color: #103ffa;
      }
      &::after {
        content: ' ';
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -2px;
        margin-left: -4px;
        width: 5.714286px;
        height: 9.142857px;
        display: table;
        border: 2px solid #fff;
        border-top: 0;
        border-left: 0;
        transform: rotate(45deg) scale(0.8) translate(-50%, -50%);
      }
    }
    &::before {
      display: inline-block;
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      border-radius: 2px;
      border: 1px solid #888;
    }
  }
}
</style>
