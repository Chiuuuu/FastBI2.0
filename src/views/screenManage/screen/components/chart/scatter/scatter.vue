<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
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
      console.log('从这里获取服务端数据');
      this.serverData = {
        legend: ['可口可乐', '百事可乐', '雪碧', '健力宝', '康师傅', '星巴克', '统一'],
        data: [
          {
            man: 120,
            women: 150,
            name: '产品部',
          },
          {
            man: 130,
            women: 160,
            name: '市场部',
          },
          {
            man: 140,
            women: 170,
            name: '销售部',
          },
        ],
      };
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
    /*
     * 处理图表联动数据
     */
    handleSelectData() {
      //   let res = await screenManage.getDataLink(chart);
      //   if (res.code === 200) {
      // 构造联动选择的数据
      // this.handleData(res.rows)
      //   } else {
      //     message.error(res.msg);
      //   }
      const data = [];
      const options = this.doWithOptions(data);
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
    doWithlegend(series) {
      return series.map(item => item.name);
    },
    doWithFormatter(data, way) {
      const ways = {
        name: '{a}',
        value: '{c}',
        nv: '{a}\n({c})',
      };
      const formatter = ways[way] || ways.nv;
      return formatter;
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const series = [];
      fetchData.data.forEach(data => {
        const ary = [data.man, data.women];
        const item = this.createScatterUnit(data.name, [ary], echart);
        series.push(item);
      });

      const legend = this.doWithlegend(fetchData.data);

      const options = merge({}, echart, {
        legend: {
          data: legend,
        },
        series,
      });
      return options;
    },
    createScatterUnit(name, data, echart) {
      const formatter = this.doWithFormatter(data, echart.customFormatterWay);
      return {
        name,
        type: 'scatter',
        label: Object.assign({}, echart.customSeries.label, {
          formatter: `${formatter}`,
        }),
        data: data,
      };
    },
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
      setLinkageData([e.seriesName], this.shapeUnit.component);
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
