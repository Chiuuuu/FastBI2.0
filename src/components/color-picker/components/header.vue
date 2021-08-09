<template>
  <div class="header">
    <ul class="clearfix">
      <li class="pure active"></li>
      <li class="linear"></li>
      <li class="radial"></li>
      <li class="transparent" @click="handleSetTransparent">透明</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'ColorPickerHeader',
  inject: ['colorPicker'],
  methods: {
    handleSetTransparent() {
      this.colorPicker.setTransparent();
    },
  },
};
</script>
