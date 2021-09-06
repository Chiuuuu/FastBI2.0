<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 折线图
 */
export default {
  name: `${BoardType.ChartLine}View`,
  extends: BaseChart,
  data() {
    return {
      currentSeriesIndex: null, // 图表联动选中的下标
      currentDataIndex: null, // 图表联动选中的下标
    };
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
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');
      const {
        data: { dimensions, measures },
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
      const datas = res.data || [];
      const categoryData = datas.map(row => row[dimensions[0].alias]);
      let series = [];
      measures.forEach(measure => {
        series.push({ type: 'line', name: measure.alias, data: datas.map(row => row[measure.alias]) });
      });
      this.serverData = { categoryData, series };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      const options = this.doWithOptions(defaultData);
      this.chartInstane.setOption(options);
    },
    /**
     * @description 处理 图表样式 线形
     */
    doWithSmooth(item, customLinear) {
      if (customLinear === 'curve') {
        item['step'] = false;
        item['smooth'] = true;
      } else if (customLinear === 'trapezoidal') {
        item['step'] = 'start';
        item['smooth'] = false;
      } else {
        item['step'] = false;
        item['smooth'] = false;
      }
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
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name);
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      fetchData.series.forEach(item => {
        this.doWithSmooth(item, echart.customLinear);
        // 系列配置
        for (let i in echart.customSeries) {
          this.doWithKeyValue(item, i, echart.customSeries[i]);
        }
      });

      const legend = this.doWithlegend(fetchData.series);

      const options = merge({}, echart, {
        xAxis: {
          data: fetchData.categoryData,
        },
        legend: {
          data: legend,
        },
        series: fetchData.series,
      });
      return options;
    },
    updateChartStyle() {
      if (!this.chartInstane) return;
      const options = this.chartInstane.getOption();

      const data = {
        categoryData: options.xAxis[0].data,
        series: options.series,
      };

      const newOptions = this.doWithOptions(data);
      this.chartInstane.setOption(newOptions);
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
      // series添加标记点回调函数控制，选中
      const formatterSybolSizeFn = function (value, params) {
        return params.dataIndex === e.dataIndex && params.seriesIndex === e.seriesIndex ? 10 : 1;
      };
      options.series.forEach((item, index) => {
        item.symbolSize = formatterSybolSizeFn;
        const color = index === e.seriesIndex ? options.color[index] : this.hexToRgba(options.color[index], 0.4);
        item.lineStyle = Object.assign(item.lineStyle, { color });
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
      // 没有选中数据不需要执行重置
      let hasSelected = this.currentDataIndex || this.currentDataIndex === 0;
      if (typeof params.target === 'undefined' && hasSelected) {
        const options = this.chartInstane.getOption();
        // 重置图表
        this.resetChartSelect(options);
      }
    },
    /**
     * @description 取消选中
     */
    resetChartSelect(options) {
      options.series.forEach(item => {
        item.lineStyle.color && delete item.lineStyle.color;
        item.symbolSize = this.options.style.echart.customShowSymbol ? 4 : 0;
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
