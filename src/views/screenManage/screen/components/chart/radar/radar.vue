<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
// TODO:优化逻辑和代码
/**
 * @description 雷达图
 */
export default {
  name: `${BoardType.ChartRadar}View`,
  extends: BaseChart,
  methods: {
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
      const series = [
        {
          type: 'radar',
          areaStyle: {
            opacity: echart.customOpacity,
          },
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
      this.serverData = {
        indicator: [
          { name: '销售（Sales）' },
          { name: '管理（Administration）' },
          { name: '信息技术（Information Technology）' },
          { name: '客服（Customer Support）' },
          { name: '研发（Development）' },
          { name: '市场（Marketing）' },
        ],
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: '预算分配（Allocated Budget）',
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: '实际开销（Actual Spending）',
          },
        ],
      };
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
    updateChartStyle() {
      if (!this.chartInstane) return;
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.chartInstane.setOption(newOptions);
    },
    /**
     * @description 添加点击事件(图表联动)
     */
    addClick() {
      const options = this.chartInstane.getOption();
      this.handleDataClick(options);
    },
    /**
     * @description 处理点击数据显示选中效果
     */
    handleDataClick(options) {
      let self = this;
      this.chartInstane.on('click', function (e) {
        if (!self.options.style.echart.customIsOpenDataLink) {
          return;
        }
        // 重复点击选中项
        if (e.dataIndex === self.currentDataIndex && e.seriesIndex === self.currentSeriesIndex) {
          // 重置图表
          self.resetChart(options);
          return;
        }
        // series添加标记点回调函数控制，选中
        // const formatterSybolSizeFn = function (value, params) {
        //   return params.dataIndex === e.dataIndex ? 10 : 1;
        // };
        options.series.forEach(item => {
          item.data.forEach((dataItem, index) => {
            // item.symbolSize = formatterSybolSizeFn;
            const color = index === e.dataIndex ? options.color[index] : self.hexToRgba(options.color[index], 0.4);
            dataItem.lineStyle = { color };
          });
        });
        self.chartInstane.setOption(options);
        // 记录当前选择数据的index
        self.currentDataIndex = e.dataIndex;
        self.currentSeriesIndex = e.seriesIndex;
        setLinkageData([e.name]);
        // 设置点击空白重置联动
        self.handleChartClick(options);
      });
    },
    /**
     * @description 处理图表点击事件(点击非数据区域重置)
     */
    handleChartClick(options) {
      let self = this;
      this.chartInstane.getZr().on('click', function (params) {
        // 没有选中数据不需要执行重置
        let hasSelected = self.currentDataIndex || self.currentDataIndex === 0;
        if (typeof params.target === 'undefined' && hasSelected) {
          // 重置图表
          self.resetChart(options);
        }
      });
    },
    /**
     * @description 取消选中
     */
    resetChart(options) {
      options.series.forEach(item => {
        item.data.forEach(dataItem => {
          dataItem.lineStyle.color && delete dataItem.lineStyle.color;
          dataItem.symbolSize && delete dataItem.symbolSize;
        });
      });
      // 还原数据
      resetOriginData();
      this.chartInstane.clear();
      this.chartInstane.setOption(options);
      this.currentDataIndex = this.currentSeriesIndex = '';
    },
  },
};
</script>
