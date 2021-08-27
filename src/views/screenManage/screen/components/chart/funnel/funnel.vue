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
      const seriesData = { ...omit(echart.customSeries, []) };
      const options = merge({}, echart, {
        series: {
          name: '',
          type: 'funnel',
          ...seriesData,
          data: fetchData.data,
        },
      });
      return options;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log({ id: this.shapeUnit.component.id, type: this.shapeUnit.component.type, data: this.options.data });
      console.log('从这里获取服务端数据');
      const {
        data: { dimensions, measures },
      } = this.options;
      const res = await this.$server.common.getData('/screen/getData', {
        id: this.shapeUnit.component.id,
        type: this.shapeUnit.component.type,
        ...omit(this.options.data, ['expands']),
      });
      if (res.code === 500) {
        this.$message.error('isChange');
        return;
      }
      const datas = res.rows;
      const categoryData = datas.map(row => row[dimensions[0].alias]);
      let series = [];
      measures.forEach(measure => {
        series.push({ type: 'bar', name: measure.alias, data: datas.map(row => row[measure.alias]) });
      });
      this.serverData = { categoryData, series };
      //   this.serverData = {
      //     categoryData: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)'],
      //     series: [
      //       {
      //         name: '2022年',
      //         type: 'bar',
      //         selectedMode: 'single',
      //         data: [18203, 23489, 29034, 104970, 131744, 630230],
      //       },
      //       {
      //         name: '2023年',
      //         type: 'bar',
      //         selectedMode: 'single',
      //         data: [19325, 23438, 31000, 121594, 134141, 681807],
      //       },
      //     ],
      //   };
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
