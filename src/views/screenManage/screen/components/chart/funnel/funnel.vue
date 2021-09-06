<template>
  <div class="board-chart-unit-wrapper">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit" :style="chartStyle" ref="js-board-chart-unit"></div>
    <!-- 转化率、到达率 -->
    <div class="board-rate" :style="rateStyle.boardRate">
      <div class="board-rate-item" :style="rateStyle.boardRateItem"></div>
      <div class="board-rate-item" :style="rateStyle.boardRateItem" v-for="(item, index) in rateList" :key="index">
        <span :style="rateStyle.line"></span>
        <p v-show="converseShow">转化率：{{ item.converse }}</p>
        <p v-show="arriveShow">到达率：{{ item.arrive }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 漏斗图
 */
export default {
  name: `${BoardType.ChartFunnel}View`,
  extends: BaseChart,
  data() {
    return {
      currentSeriesIndex: null, // 图表联动选中的下标
      currentDataIndex: null, // 图表联动选中的下标
      rateStyle: {
        boardRate: {},
        boardRateItem: {},
        line: {},
      },
    };
  },
  computed: {
    // 转化率、到达率聚合
    rateList() {
      if (this.isServerData()) {
        return this.serverData ? this.serverData.rate : [];
      }
      return defaultData.rate;
    },
    converseShow() {
      return this.options.style.echart.customRate.labelContent.includes('converse');
    },
    arriveShow() {
      return this.options.style.echart.customRate.labelContent.includes('arrive');
    },
  },
  methods: {
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      return [].concat(data.dimensions).concat(data.measures);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.dataModelId && data.dimensions.length && data.measures.length;
    },
    /**
     * @description 根据key处理value值
     * @param {object} item 数据
     * @param {string} key 字段
     * @param {any} value 对应字段值
     */
    doWithKeyValue(item, key, value) {
      item[key] = value;
    },
    /**
     * @description 指标内容显示
     * @param {array} way 指标显示选择
     * @param {array} arrange 排列 horizontal水平 vertical垂直
     */
    doWithFormatter(way = [], arrange) {
      const ways = {
        name: '{b}',
        value: '{c}',
      };
      let formatter = [];
      way.forEach(item => {
        formatter.push(ways[item]);
      });
      return arrange === 'horizontal' ? formatter.join(' ') : formatter.join('\n');
    },
    /**
     * @description 鼠标移入显示
     * @param {array} way 鼠标移入显示选择
     */
    doWithTooltipFormatter(way = []) {
      const ways = {
        name: '{b}',
        value: '{c}',
      };
      let formatter = [];
      way.forEach(item => {
        formatter.push(ways[item]);
      });
      return formatter.join(' ');
    },
    /**
     * @description 数组根据数组对象中的某个属性值进行排序的方法
     * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
     * @param attr 排序的属性 如number属性
     * @param rev true表示升序排列，false降序排序
     */
    sortBy(attr, rev) {
      // 第二个参数没有传递 默认升序排列
      if (rev === undefined) {
        rev = 1;
      } else {
        rev = rev ? 1 : -1;
      }
      return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) {
          return rev * -1;
        }
        if (a > b) {
          return rev * 1;
        }
        return 0;
      };
    },
    /**
     * @description 漏斗图
     */
    dowithSeriesFunnelSort(data) {
      if (data[0].value > data[data.length - 1].value) {
        return 'descending'; //降序
      }
      return 'ascending'; //升序
    },
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;
      this.dowithRateStyle(fetchData);
      const formatter = this.doWithFormatter(echart.customFormatterWay, echart.customLabelArrange);
      const tooltipFormatter = this.doWithTooltipFormatter(echart.customTooltipFormatter);
      const seriesData = { ...omit(echart.customSeries, ['label']) };
      const options = merge({}, echart, {
        tooltip: {
          formatter: `${tooltipFormatter}`,
        },
        series: {
          name: '',
          type: 'funnel',
          sort: this.dowithSeriesFunnelSort(fetchData.data),
          label: Object.assign({}, echart.customSeries.label, {
            formatter: `${formatter}`,
          }),
          ...seriesData,
          data: fetchData.data,
        },
      });
      return options;
    },
    /**
     * @description 处理转化率、到达率样式配置
     */
    dowithRateStyle(fetchData) {
      if (!fetchData || !fetchData.rate || fetchData.rate.length === 0) return;
      // 计算转化率、到达率最大字符长度
      let rateMaxLen = 0,
        arriveRateMaxLen = 0,
        converseRateMaxLen = 0;
      fetchData.rate.forEach(item => {
        rateMaxLen = Math.max(rateMaxLen, item.arrive.length, item.converse.length);
        arriveRateMaxLen = Math.max(arriveRateMaxLen, item.arrive.length);
        converseRateMaxLen = Math.max(converseRateMaxLen, item.converse.length);
      });

      const {
        style: {
          title,
          echart: { customSeries, customRate },
        },
      } = this.options;
      let boardRate = {
        color: `${customRate.color}`,
        fontSize: `${customRate.fontSize}px`,
        fontWeight: `${customRate.fontWeight}`,
        fontFamily: `${customRate.fontFamily}`,
        [customRate.position]: customRate.position === 'left' ? '40px' : '15px',
        marginTop: `${customSeries.top + title.marginBottom}px`,
        height: `calc(100% - 40px - ${title.marginBottom}px - ${customSeries.top}px - ${customSeries.bottom}px)`,
        display: customRate.show && (this.arriveShow || this.converseShow) ? 'block' : 'none', //是否展示
      };
      let boardRateItem = {
        height: `${100 / (fetchData.rate.length + 1)}%`,
      };
      let line = {
        [customRate.position === 'left' ? 'right' : 'left']: customRate.position === 'left' ? '-30px' : '-40px',
      };
      if (customRate.arrange === 'horizontal') {
        let len = (this.converseShow && converseRateMaxLen + 4) + (this.arriveShow && arriveRateMaxLen + 4); //一行的文本字符长度
        let paddingLeft = this.converseShow && this.arriveShow ? 20 : 10; //p标签的padding-left值
        boardRate.width = `${customRate.fontSize * 0.75 * len + paddingLeft}px`;
        boardRateItem.display = `flex`;
        boardRateItem.top = `-${customRate.fontSize * 0.6}px`;
        line.marginTop = `${customRate.fontSize * 0.6 + 2}px`;
      } else {
        let len = rateMaxLen + 4; //一行的文本字符长度
        boardRate.width = `${customRate.fontSize * 0.75 * len + 10}px`; // 10为p标签的padding-right值
        boardRateItem.top = `-${customRate.fontSize * 0.6 + 15}px`;
        line.marginTop = `${customRate.fontSize * 0.6 + 15 + 2}px`;
      }
      this.rateStyle.boardRate = boardRate;
      this.rateStyle.boardRateItem = boardRateItem;
      this.rateStyle.line = line;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { dimensions, measures, sort },
      } = this.options;
      const res = await this.$server.common.getData('/screen/graph/v2/getData', {
        id: this.shapeUnit.component.id,
        tabId: this.shapeUnit.component.tabId,
        type: this.shapeUnit.component.type,
        ...omit(this.options.data, ['expands']),
      });
      if (res.code === 500) {
        this.$message.error('isChange');
        return;
      }
      let datas = res.data || [];
      // 默认排序为降序
      if (sort.length === 0) {
        datas.sort(this.sortBy(measures[0].alias, false));
      }
      let rate = [];
      const data = datas.map((row, index) => {
        if (index !== 0) {
          const preRowData = datas[index - 1][measures[0].alias];
          const firstRowData = datas[0][measures[0].alias];
          rate.push({
            converse: preRowData === 0 ? '100%' : ((row[measures[0].alias] / preRowData) * 100).toFixed(2) + '%',
            arrive: firstRowData === 0 ? '100%' : ((row[measures[0].alias] / firstRowData) * 100).toFixed(2) + '%',
          });
        }
        return { name: row[dimensions[0].alias], value: row[measures[0].alias] };
      });
      this.serverData = { data, rate };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      const options = this.doWithOptions(defaultData);
      this.updateSaveChart(options);
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (!this.chartInstane) return;
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.updateSaveChart(newOptions);
    },
    /**
     * @description 添加点击事件(图表联动)
     */
    addClick() {
      // 设置点击数据进行联动
      this.chartInstane.on('click', this.handleDataClick);
      // 设置点击空白重置联动
      this.chartInstane.getZr().on('click', this.handleChartClick);
    },
    /**
     * @description 处理点击数据显示选中效果
     */
    handleDataClick(e) {
      const options = this.chartInstane.getOption();
      if (!this.options.style.echart.customIsOpenDataLink) {
        return;
      }
      // 重复点击选中项
      if (e.dataIndex === this.currentDataIndex && e.seriesIndex === this.currentSeriesIndex) {
        // 重置图表
        this.resetChartSelect(options);
        return;
      }
      let self = this;
      // series添加颜色回调函数控制，选中
      const formatterFn = function (params) {
        return params.dataIndex === e.dataIndex && params.seriesIndex === e.seriesIndex
          ? options.color[params.seriesIndex]
          : self.hexToRgba(options.color[params.seriesIndex], 0.4);
      };
      options.series.forEach(item => {
        item.itemStyle = Object.assign(item.itemStyle, { color: formatterFn });
      });
      this.chartInstane.setOption(options);
      // 记录当前选择数据的index
      this.currentDataIndex = e.dataIndex;
      this.currentSeriesIndex = e.seriesIndex;
      setLinkageData([e.name], this.shapeUnit.component);
    },
    /**
     * @description 处理图表点击事件(点击非数据区域重置)
     */
    handleChartClick(params) {
      let hasSelected = this.currentDataIndex || this.currentDataIndex === 0;
      // 没有选中数据不需要执行重置
      if (typeof params.target === 'undefined' && hasSelected) {
        // 重置图表
        const options = this.chartInstane.getOption();
        this.resetChartSelect(options);
      }
    },
    /**
     * @description 取消选中
     */
    resetChartSelect(options) {
      options.series.forEach(item => {
        item.itemStyle.color && delete item.itemStyle.color;
      });
      // 还原数据
      resetOriginData(this.shapeUnit.component);
      this.chartInstane.clear();
      this.chartInstane.setOption(options);
      this.currentDataIndex = this.currentSeriesIndex = '';
    },
  },
};
</script>
<style lang="less" scoped>
.board-chart-unit-wrapper {
  position: relative;
}
.board-rate {
  position: absolute;
  top: 40px;
  color: #fff;
}
.board-rate-item {
  position: relative;
  span {
    width: 25px;
    height: 2px;
    background: #fff;
    position: absolute;
  }
  p {
    margin: 0;
    text-align: left;
    padding-right: 10px;
  }
}
</style>
