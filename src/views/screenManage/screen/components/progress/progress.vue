<template>
  <div class="board-chart-unit-wrapper board-progress">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit progress-unit" :style="chartStyle" ref="js-board-chart-unit">
      <div class="board-progress-content">
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
      if (current < min) {
        percent = 0;
      } else if (current > max) {
        percent = 100;
      } else if (min === max) {
        percent = 100;
      } else {
        let result = ((current - min) / (max - min)) * 100;
        percent = result.toFixed(customFixed);
      }

      return {
        value: current.toFixed(customFixed),
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
      // 保证三个数据都有内容
      return typeof data.targe !== 'string' && typeof data.max !== 'string' && typeof data.min !== 'string';
    },
    /**
     * @description 判断是否有填入图表数据
     */
    isInputData() {
      const { data } = this.options;
      // TODO:只要其中一个是数组类型就要去网络请求数据
      // 不然就是填写的不需要请求
      return typeof data.targe === 'number' && typeof data.max === 'number' && typeof data.min === 'number';
    },
    /**
     * @description 图表获取数据
     */
    getChartData() {
      if (this.isServerData()) {
        this.getData();
      } else {
        this.getDefaultData();
      }
    },
    /**
     * @description 处理填入的数据
     */
    handleInputData() {
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
     * @description 图表获取服务端数据
     */
    async getData() {
      // 都是手填收据不需要请求
      if (this.isInputData()) {
        this.handleInputData();
        return;
      }
      const orginList = ['targe', 'max', 'min'];
      const handleList = orginList.filter(key => Array.isArray(this.options.data[key]));
      const { dimensions, measures } = this.handleGetDataParmas(handleList);
      const params = {
        id: this.shapeUnit.component.id,
        tabId: this.shapeUnit.component.tabId,
        type: this.shapeUnit.component.type,
        ...this.options.data,
        dimensions, // 拼装维度
        measures, // 拼装度量
      };
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common.getData('/screen/graph/v2/getData', params).finally(() => {
        this.shapeUnit.changeLodingChart(false);
      });
      if (res.code === 200) {
        this.dataState = res.data && res.data.length ? 'normal' : 'empty';
        if (this.dataState === 'empty') {
          return;
        }
        const data = res.data[0];
        this.serverData = {
          current: handleList.includes('targe') ? data[this.options.data.targe[0].alias] : this.options.data.targe,
          max: handleList.includes('max') ? data[this.options.data.max[0].alias] : this.options.data.max,
          min: handleList.includes('min') ? data[this.options.data.min[0].alias] : this.options.data.min,
        };
        const result = this.doWithData(this.serverData);
        this.progressStyle = Object.assign({}, this.progressStyle, {
          width: `${result.percent}%`,
        });
        this.result = this.doWithFormatter(result);
      } else {
        this.$message.error(res.msg);
      }
    },
    /**
     * @description 拼装维度度量
     */
    handleGetDataParmas(handleList) {
      let dimensions = [];
      let measures = [];
      handleList.forEach(key => {
        this.options.data[key].forEach(item => {
          if (item.role === 1) {
            dimensions.push(item);
          } else {
            measures.push(item);
          }
        });
      });
      return { dimensions, measures };
    },
    /**
     * @description 图表获取默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.dataState = 'normal';
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
      if (this.dataState === 'empty') {
        return;
      }
      this.doWithOptions();
      const result = this.doWithData(this.serverData ? this.serverData : defaultData);
      this.progressStyle = Object.assign({}, this.progressStyle, {
        width: `${result.percent}%`,
      });
      this.result = this.doWithFormatter(result);
    },
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      let list = [];
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          list = list.concat(data[key]);
        }
      });
      return list;
    },
  },
};
</script>
<style lang="less" scoped>
.board-progress {
  padding: 10px 25px;
}
.progress-unit {
  display: flex;
  align-items: center;
}
.progress {
  width: 80%;
  height: 100%;
}
.progress-value {
  position: absolute;
}
.board-progress-content {
  width: 100%;
  position: relative;
}
</style>
