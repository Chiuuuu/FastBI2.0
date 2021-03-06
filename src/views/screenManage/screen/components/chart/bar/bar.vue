<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 柱状图
 */
export default {
  name: `${BoardType.ChartBar}View`,
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
     * @description 柱条间隔
     */
    doWithBarGap(item, barGap = 0) {
      item['barGap'] = barGap + '%';
    },
    /**
     * @description 处理方向
     */
    doWithShape(echart, categoryData) {
      const { customShape } = echart;

      // 垂直（vertical） or 水平（horizontal）
      const isVertical = customShape === 'vertical';

      const xAxis = Object.assign({}, echart.xAxis, {
        type: isVertical ? 'category' : 'value',
        boundaryGap: isVertical,
        name: isVertical ? echart.xAxis.name : echart.yAxis.name,
        cache: isVertical ? echart.xAxis.cache : echart.yAxis.name,
      });

      const yAxis = Object.assign({}, echart.yAxis, {
        type: isVertical ? 'value' : 'category',
        boundaryGap: !isVertical,
        name: isVertical ? echart.yAxis.name : echart.xAxis.name,
        cache: isVertical ? echart.yAxis.cache : echart.xAxis.cache,
      });

      if (isVertical) {
        xAxis.data = categoryData;
      } else {
        yAxis.data = categoryData;
      }

      return {
        xAxis,
        yAxis,
      };
    },
    /**
     * @description 处理形状是否堆叠
     */
    doWithStack(item, customStack) {
      item['stack'] = customStack ? 'stack' : '';
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name);
    },
    /**
     * @description 处理柱状条宽度（数值/百分比）
     */
    doWithBarWidth(item, barWidth, length) {
      item['barWidth'] = `${barWidth / length}%`;
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
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const shape = this.doWithShape(echart, fetchData.categoryData);
      fetchData.series.forEach(item => {
        this.doWithBarGap(item, echart.customBarGap);
        this.doWithStack(item, echart.customStack);
        this.doWithBarWidth(item, echart.customBarWidth, fetchData.series.length);
        // 系列
        for (let i in echart.customSeries) {
          this.doWithKeyValue(item, i, echart.customSeries[i]);
        }
      });
      const legend = this.doWithlegend(fetchData.series);

      const options = merge({}, echart, {
        color: echart.customBarColors,
        xAxis: shape.xAxis,
        yAxis: shape.yAxis,
        series: fetchData.series,
        legend: {
          data: legend,
        },
      });

      return options;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { dimensions, measures },
        style: {
          title: { text },
        },
      } = this.options;
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.pagination,
          ...omit(this.options.data, ['expands']),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });

      if (res.code !== 200) {
        if (res.code === 1054) {
          const keys = ['dimensions', 'measures', 'filter', 'sort'];
          this.handleRedList(res.data, keys);
          if (this.isEditMode) {
            this.$message.error(`${text}数据异常, 请处理标红字段`);
          }
          return;
        }
        return this.$message.error(res.msg || '请求错误');
      }
      this.dataState = res.data && res.data.length ? 'normal' : 'empty';
      if (this.dataState === 'empty') {
        return;
      }
      const datas = res.data;
      // 截取前50条数据展示
      if (this.isEditMode && datas.length >= 50) {
        datas.length = 50;
        this.$message.error(`${text}数据量过大, 已截取前50条展示`);
      }
      const categoryData = datas.map(row => row[dimensions[0].alias]);
      let series = [];
      measures.forEach(measure => {
        series.push({
          type: 'bar',
          name: measure.alias,
          data: datas.map(row => row[`${measure.defaultAggregator}_${measure.alias}`]),
        });
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
      this.dataState = 'normal';
      const options = this.doWithOptions(defaultData);
      this.updateSaveChart(options);
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (this.dataState === 'empty' || !this.chartInstane) return;
      const options = this.chartInstane.getOption();

      const data = {
        categoryData: options.xAxis[0].data || options.yAxis[0].data,
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
      setLinkageData(e.name, this.shapeUnit.component);
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
