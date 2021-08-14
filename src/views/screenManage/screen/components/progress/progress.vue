<template>
  <div class="board-chart-unit-wrapper">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit progress-unit" :style="chartStyle" ref="js-board-chart-unit">
      <!-- 内圈 -->
      <div class="progress-warpper" :style="wrapperStyle">
        <div class="progress" :style="progressStyle"></div>
      </div>
      <!-- 进度值 -->
      <div v-if="options.style.echart.label.show" class="progress-value" :style="labelStyle">
        {{ result }}
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../chart/base';
import { getStyle } from '@/utils';
import defaultData from './default-data';

export default {
  name: `${BoardType.ChartProgress}View`,
  extends: BaseChart,
  data() {
    return {
      labelStyle: '',
      progressStyle: '',
      wrapperStyle: '',
      result: '',
    };
  },
  destroyed() {},
  watch: {
    'options.style': {
      deep: true,
      immediate: false,
      handler(opt) {
        // 1. 状态要是是停止（移动或者缩放情况下不更变）
        // 2. 配置项发生改变
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.updateChartStyle();
          });
        }
      },
    },
    'options.data': {
      deep: true,
      immediate: false,
      handler(opt) {
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.getChartData();
          });
        }
      },
    },
  },
  methods: {
    /**
     * @description 处理标签配置
     */
    doWithLabel(echart) {
      const label = Object.assign({}, echart.label);
      const style = getStyle(
        {
          color: label.color,
          fontSize: `${label.fontSize}px`,
          fontWeight: label.fontWeight,
          fontFamily: label.fontFamily,
        },
        {
          position: label.position,
        },
        ['left', 'top'],
        [],
      );
      return style;
    },
    /**
     * @description 处理圆角配置
     */
    doWithRadius(echart) {
      const { radius } = echart;
      const borderRadius = {};
      Object.keys(radius).forEach(r => {
        const prop = r.trim().replace(r[0], r[0].toUpperCase());
        borderRadius[`border${prop}Radius`] = `${radius[r]}px`;
      });
      return borderRadius;
    },
    /**
     * @description 处理进度条配置
     */
    doWithProgress(echart) {
      let { background } = echart.progress;
      const borderRadius = this.doWithRadius(echart);
      background = this.doWithBackgroundColor(background, echart.customColor, echart.customGradient);
      const style = getStyle(
        {
          ...borderRadius,
        },
        {
          background,
        },
        [],
        ['background'],
      );
      return style;
    },
    /**
     * @description 处理进度条背景渐变色
     */
    doWithBackgroundColor(background, customColor, customGradient) {
      if (customColor === 'linear') {
        return Object.assign(background, {
          image: `linear-gradient(to right,${customGradient[0]},${customGradient[1]})`,
          size: 'auto',
        });
      } else if (customColor === 'radial') {
        return Object.assign(background, {
          image: `radial-gradient(${customGradient[0]},${customGradient[1]})`,
          size: 'auto',
        });
      } else {
        return Object.assign(background, { size: 0 });
      }
    },
    /**
     * @description 处理进度条外层配置
     */
    doWithWrapper(echart) {
      const { size, padding, background, border } = echart;

      const checkProps = {
        padding,
        background,
        border,
      };

      const borderRadius = this.doWithRadius(echart);

      const style = getStyle(
        {
          width: `${size.width}%`,
          height: `${size.height}px`,
          ...borderRadius,
        },
        checkProps,
        ['width', 'right', 'bottom', 'left', 'top'],
        ['background', 'border', 'padding'],
      );
      return style;
    },
    /**
     * @description 整合配置
     */
    doWithOptions() {
      const {
        style: { echart },
      } = this.options;
      this.labelStyle = this.doWithLabel(echart);
      this.progressStyle = this.doWithProgress(echart);
      this.wrapperStyle = this.doWithWrapper(echart);
    },
    doWithData(data) {
      const { current, max, min } = data;
      const customFixed = this.options.style.echart.customFixed; // 自定义小数位

      let percent;
      if (typeof current !== 'number' || typeof max !== 'number' || typeof min !== 'number') {
        return console.error(`data type must is number`);
      }

      if (current < min) {
        percent = 0;
      } else if (current > max) {
        percent = 100;
      } else if (min === max) {
        percent = 100;
      } else {
        let result = (current / (max - min)) * 100;
        percent = result.toFixed(customFixed);
      }

      return {
        value: current,
        percent,
      };
    },
    doWithFormatter(result) {
      const {
        style: { echart },
      } = this.options;

      const ways = {
        value: result.value,
        percent: `${result.percent}%`,
        all: `${result.value}(${result.percent})%`,
      };

      const formatter = ways[echart.showWay] || ways.percent;
      return formatter;
    },
    /**
     * @description 初始化Echart图表
     */
    initChart() {
      this.doWithOptions();
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      // TODO:只要其中一个是数组类型就要去网络请求数据
      // 不然就是填写的不需要请求
      return typeof data.targe === 'number' && typeof data.max === 'number' && typeof data.min === 'number';
    },
    /**
     * @description 图表获取数据
     */
    getChartData() {
      this.isServerData() ? this.getServerData() : this.getDefaultData();
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      this.serverData = {
        current: this.options.data.targe,
        max: this.options.data.max,
        min: this.options.data.min,
      };
      const result = this.doWithData(this.serverData);
      this.progressStyle = Object.assign({}, this.progressStyle, {
        width: `${result.percent}%`,
      });
      this.result = this.doWithFormatter(result);
    },
    /**
     * @description 图表获取默认数据
     */
    getDefaultData() {
      this.serverData = null;
      const result = this.doWithData(defaultData);
      this.progressStyle = Object.assign({}, this.progressStyle, {
        width: `${result.percent}%`,
      });
      this.result = this.doWithFormatter(result);
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      this.doWithOptions();
      const result = this.doWithData(this.serverData ? this.serverData : defaultData);
      this.progressStyle = Object.assign({}, this.progressStyle, {
        width: `${result.percent}%`,
      });
      this.result = this.doWithFormatter(result);
    },
  },
};
</script>
<style lang="less" scoped>
.progress-unit {
  position: relative;
}
.progress {
  width: 80%;
  height: 100%;
}
.progress-value {
  position: absolute;
}
</style>
