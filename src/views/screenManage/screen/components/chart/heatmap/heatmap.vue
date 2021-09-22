<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 矩形热力图
 */
export default {
  name: `${BoardType.ChartHeatmap}View`,
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
      return [].concat(data.measures).concat(data.xaxis).concat(data.yaxis);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.dataModelId && data.measures.length && data.xaxis.length && data.yaxis.length;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { measures, xaxis, yaxis },
      } = this.options;
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...omit(this.options.data, ['expands', 'xaxis', 'yaxis']),
          dimensions: [].concat(xaxis, yaxis),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        this.$message.error('isChange');
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
        fieldName: {
          xaxis: xaxis[0].alias,
          yaxis: yaxis[0].alias,
          measures: measures[0].alias,
        },
        data: datas,
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
     * @description 处理视觉映射组件
     */
    doWithVisualMap(max, min) {
      const {
        style: { echart },
      } = this.options;
      return Object.assign({}, echart.visualMap, {
        max,
        min,
      });
    },
    /**
     * @description 处理数据
     */
    doWithData(data, xaxis, yaxis, measures) {
      return data.map(item => {
        return [item[xaxis.name], item[yaxis.name], item[measures.name]];
      });
    },
    /**
     * @description 指标内容显示
     */
    doWithLabelShow(param, customFormatterWay = []) {
      let label = [];
      customFormatterWay.forEach(item => {
        label.push(param.value[item]);
      });
      return label.join(',');
    },
    /**
     * @description 鼠标移入内容显示
     */
    doWithTooltipShow(param, customTooltipFormatter = []) {
      let label = [];
      let fieldName = this.isServerData()
        ? [this.serverData.fieldName.xaxis, this.serverData.fieldName.yaxis, this.serverData.fieldName.measures]
        : ['x轴', 'y轴', '度量'];
      customTooltipFormatter.forEach(item => {
        label.push(fieldName[item] + '：' + param[0].value[item]);
      });
      return label.join('<br/>');
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const xaxis = {
        name: fetchData.fieldName['xaxis'],
      };
      const yaxis = {
        name: fetchData.fieldName['yaxis'],
      };
      const measures = {
        name: fetchData.fieldName['measures'],
      };

      const key = measures.name;
      let max = 0;
      let min = 0;
      if (fetchData.data.length) {
        max = maxBy(fetchData.data, key)[key];
        min = minBy(fetchData.data, key)[key];
      }
      const visualMap = this.doWithVisualMap(max, min);
      const data = this.doWithData(fetchData.data, xaxis, yaxis, measures);
      const options = merge({}, echart, {
        visualMap,
        tooltip: {
          formatter: param => {
            return this.doWithTooltipShow(param, echart.customTooltipFormatter);
          },
        },
        series: [
          {
            type: 'heatmap',
            data,
            label: Object.assign({}, echart.customSeries.label, {
              formatter: param => {
                return this.doWithLabelShow(param, echart.customFormatterWay);
              },
            }),
          },
        ],
      });

      return options;
    },
    updateChartStyle() {
      if (this.dataState === 'empty' || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const options = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.updateSaveChart(options);
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

      // 记录当前选择数据的index
      this.currentDataIndex = e.dataIndex;
      this.currentSeriesIndex = e.seriesIndex;
      setLinkageData(null, this.shapeUnit.component, [
        { pickField: 'xaxis', pickValue: [e.name] },
        { pickField: 'yaxis', pickValue: [e.data[1]] },
      ]);
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
      // 还原数据
      resetOriginData(this.shapeUnit.component);
      this.chartInstane.clear();
      this.chartInstane.setOption(options);
      this.currentDataIndex = this.currentSeriesIndex = '';
    },
  },
};
</script>
