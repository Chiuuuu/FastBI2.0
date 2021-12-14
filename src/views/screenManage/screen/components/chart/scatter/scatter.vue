<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 散点图
 */
export default {
  name: `${BoardType.ChartScatter}View`,
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
      return [].concat(data.dimensions).concat(data.xaxis).concat(data.yaxis);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.dataModelId && data.dimensions.length && data.xaxis.length && data.yaxis.length;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { dimensions, xaxis, yaxis },
      } = this.options;
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.pagination,
          ...omit(this.options.data, ['expands', 'xaxis', 'yaxis']),
          measures: [].concat(xaxis).concat(yaxis),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        if (res.msg === 'IsChanged') {
          const keys = ['dimensions', 'xaxis', 'yaxis', 'filter', 'sort'];
          this.handleRedList(res.data, keys);
        }
        this.$message.error(res.msg);
        return;
      }
      this.dataState = res.data && res.data.length ? 'normal' : 'empty';
      if (this.dataState === 'empty') {
        return;
      }
      const datas = res.data || [];
      // 截取前50条数据展示
      if (datas.length > 50) {
        datas.length = 50;
        const title = this.options.style.title.text;
        this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
      }
      this.serverData = {
        fieidName: [
          `${xaxis[0].defaultAggregator}_${xaxis[0].alias}`,
          `${yaxis[0].defaultAggregator}_${yaxis[0].alias}`,
          dimensions[0].alias,
        ],
        data: datas,
        xMax: Math.max(...datas.map(item => item[`${xaxis[0].defaultAggregator}_${xaxis[0].alias}`])),
        yMax: Math.max(...datas.map(item => item[`${yaxis[0].defaultAggregator}_${yaxis[0].alias}`])),
      };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.dataState = 'normal';
      const options = this.doWithOptions(defaultData);
      this.updateSaveChart(options);
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
    doWithlegend(series, name) {
      return series.map(item => item[name]);
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const series = [];
      let fieidName = fetchData.fieidName;
      const fieidAlias = fieidName.map((item, index) => {
        // 最后一个是维度，没有聚合区分
        return index === 2 ? item.replace(/(.*?)_/, '') : item;
      });
      fetchData.data.forEach(data => {
        // 每组数据格式：[度量1值，度量2值，维度值，度量1字段名，度量2字段名，维度字段名]
        const ary = [data[fieidName[0]], data[fieidName[1]], data[fieidName[2]]].concat(fieidAlias);
        const item = this.createScatterUnit(data[fieidName[2]], [ary], echart);

        // 处理散点大小
        this.handleScatterSize(item, echart.customScatterSize, fetchData.xMax, fetchData.yMax);
        series.push(item);
      });
      const legend = this.doWithlegend(fetchData.data, fieidName[2]);

      const options = merge({}, echart, {
        legend: {
          data: legend,
        },
        tooltip: {
          formatter: this.hanleTooltipFormatter(echart.customTooltipFormatter),
        },
        series,
      });
      // 散点颜色设置
      this.handleScatterColor(options, echart.customScatterColor);
      return options;
    },
    createScatterUnit(name, data, echart) {
      const seriesData = { ...omit(echart.customSeries, []) };

      return {
        name,
        type: 'scatter',
        ...seriesData,
        data: data,
      };
    },
    updateChartStyle() {
      if (this.dataState === 'empty' || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.updateSaveChart(newOptions);
    },
    /**
     * @description 处理鼠标移入提示
     */
    hanleTooltipFormatter(customTooltipFormatter = []) {
      return function (params) {
        let val = params.value;
        if (val.length < 6) {
          return '';
        }
        let ways = {
          // 格式: 字段名：值
          dimensions: `${val[5]}：${val[2]}<br/>`, // 维度
          xaxis: `${val[3]}：${val[0]}<br/>`, //度量1
          yaxis: `${val[4]}：${val[1]}<br/>`, //度量2
        };
        let formatter = [];
        customTooltipFormatter.forEach(item => {
          formatter.push(ways[item]);
        });
        return formatter.join('');
      };
    },
    /**
     * @description 处理散点大小
     * @param {Object} item 当前系列
     * @param {String} customScatterSize 散点大小类型 0：按度量1  1：按度量2  默认空，为无
     * @param {String} xMax 度量1最大值
     * @param {String} yMax 度量2最大值
     */
    handleScatterSize(item, customScatterSize, xMax, yMax) {
      // 散点图大小设置
      if (customScatterSize) {
        let max = customScatterSize === '0' ? xMax : yMax;
        item.symbolSize = function (val) {
          let num = val[customScatterSize];
          return max === 0 ? 8 : (20 / max) * num + 8;
        };
      }
    },
    /**
     * @description 处理散点颜色
     * @param {Object} options
     * @param {String} customScatterColor  散点颜色 0单色 1按维度
     */
    handleScatterColor(options, customScatterColor) {
      if (customScatterColor === '0') {
        options.color = options.color.length > 0 ? options.color[0] : '#68ABDA';
      }
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
      // 重置图表
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
      setLinkageData(e.data[2], this.shapeUnit.component);
    },
    /**
     * @description 处理图表点击事件(点击非数据区域重置)
     */
    handleChartClick(params) {
      let hasSelected = this.currentDataIndex || this.currentDataIndex === 0;
      // 没有选中数据不需要执行重置
      if (typeof params.target === 'undefined' && hasSelected) {
        // 重置图表
        // 这里重新获取options，不然条形图设置改不到
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
