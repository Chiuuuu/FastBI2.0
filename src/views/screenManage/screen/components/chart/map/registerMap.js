import Vue from 'vue';

import guangzhou from '@/utils/guangzhou.json';
const areaMap = {
  guangzhou,
};
export default function registerMap(area) {
  Vue.prototype.$echarts.registerMap(area, areaMap[area]);
}
