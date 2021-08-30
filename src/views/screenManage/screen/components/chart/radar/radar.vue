<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
// TODO:优化逻辑和代码
/**
 * @description 雷达图
 */
export default {
  name: `${BoardType.ChartRadar}View`,
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
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name);
    },
    /**
     * @description 处理半径
     */
    doWithRadius(inRadius, outRadius) {
      return [`${inRadius}%`, `${outRadius}%`];
    },
    /**
     * @description 处理中心点
     */
    doWithCenter(customCenter) {
      return [`${customCenter[0]}%`, `${customCenter[1]}%`];
    },
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const { indicator, data } = fetchData;

      const legend = this.doWithlegend(data);
      const radius = this.doWithRadius(echart.customInRadius, echart.customOutRadius);
      const center = this.doWithCenter(echart.customCenter);
      const seriesData = { ...omit(echart.customSeries, []) };
      const series = [
        {
          type: 'radar',
          ...seriesData,
          data,
        },
      ];

      const options = merge({}, echart);

      options.series = series;
      options.legend.data = legend;
      options.radar.radius = radius;
      options.radar.center = center;
      options.radar.indicator = indicator;

      return options;
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
      const datas = res.rows;
      const indicator = datas.map(row => row[dimensions[0].alias]);
      let data = [];
      measures.forEach(measure => {
        data.push({ name: measure, value: datas.map(row => row[measure.alias]) });
      });
      this.serverData = { indicator, data };
      //   this.serverData = {
      //     indicator: [
      //       { name: '销售（Sales）' },
      //       { name: '管理（Administration）' },
      //       { name: '信息技术（Information Technology）' },
      //       { name: '客服（Customer Support）' },
      //       { name: '研发（Development）' },
      //       { name: '市场（Marketing）' },
      //     ],
      //     data: [
      //       {
      //         value: [4200, 3000, 20000, 35000, 50000, 18000],
      //         name: '预算分配（Allocated Budget）',
      //       },
      //       {
      //         value: [5000, 14000, 28000, 26000, 42000, 21000],
      //         name: '实际开销（Actual Spending）',
      //       },
      //     ],
      //   };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options, ['radar', 'series']);
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      const options = this.doWithOptions(defaultData);
      this.updateSaveChart(options, ['radar', 'series']);
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
    updateChartStyle() {
      if (!this.chartInstane) return;
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
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
      // series添加标记点回调函数控制，选中
      // const formatterSybolSizeFn = function (value, params) {
      //   return params.dataIndex === e.dataIndex ? 10 : 1;
      // };
      options.series.forEach(item => {
        item.data.forEach((dataItem, index) => {
          // item.symbolSize = formatterSybolSizeFn;
          const color = index === e.dataIndex ? options.color[index] : this.hexToRgba(options.color[index], 0.4);
          dataItem.lineStyle = { color };
        });
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
        // 重置图表
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
        item.data.forEach(dataItem => {
          dataItem.lineStyle.color && delete dataItem.lineStyle.color;
          dataItem.symbolSize && delete dataItem.symbolSize;
        });
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
