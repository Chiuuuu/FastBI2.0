<template>
  <div class="color-block" v-show="visible">
    <div
      class="box"
      v-for="color in colorList"
      :key="color"
      :style="`background: ${color}`"
      @click="handleSelectColor($event, color)"
    ></div>
  </div>
</template>
<script>
import { HexToRGB } from '../converColor';
export default {
  name: 'ColorPouList',
  inject: ['colorPicker'],
  props: {
    visible: {
      // 是否显示
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      colorList: '',
    };
  },
  mounted() {
    this.colorList = this.getColorList();
  },
  methods: {
    getColorList() {
      const list = [];
      addColor(list, 1);
      for (let i = 1; i < 5; i++) {
        const one = 0.2;
        const a = (i * one).toFixed(2);
        addColor(list, a, '#8c8c8c');
      }
      function addColor(list, a, replace) {
        const cache = ['#000000', '#ffffff', '#5677fc', '#e62a10', '#ffc107', '#259b24', '#673ab7', '#e91e63'];
        if (replace) {
          cache.splice(1, 1, replace);
        }
        cache.forEach(color => {
          const { r, g, b } = HexToRGB(color, false, true);
          list.push(`rgba(${r},${g},${b},${a})`);
        });
      }
      return list;
    },
    handleSelectColor(event, color) {
      this.colorPicker.handleSubmit(event, color);
    },
  },
};
</script>
