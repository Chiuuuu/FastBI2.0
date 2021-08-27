<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import registerMap from './registerMap';
import omit from 'lodash/omit';
import { mutationTypes as boardMutation } from '@/store/modules/board';
const mapSeries = 0;
const scatterSeries = 1;

/**
 * @description 地图
 */
export default {
  name: `${BoardType.ChartMap}View`,
  extends: BaseChart,
  methods: {
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      return [].concat(data.dimensions).concat(data.measures).concat(data.labelDimensions).concat(data.labelMeasures);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return (
        data.dataModelId &&
        ((data.dimensions.length && data.measures.length) || (data.labelDimensions.length && data.labelMeasures.length))
      );
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series[scatterSeries] ? [series[scatterSeries].name] : [];
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
      this.doWithMap(fetchData.series[mapSeries], echart.mapStyle, echart.geo.itemStyle.emphasis.areaColor);
      this.doWithScatter(fetchData.series[scatterSeries], echart.scatterStyle);
      const legendData = this.doWithlegend(fetchData.series);

      const options = merge({}, echart, {
        series: fetchData.series,
        legend: {
          data: legendData,
        },
      });

      return options;
    },
    /**
     * @description 处理填充层
     */
    doWithMap(series, mapStyle, chartEmphasisColor) {
      // 处理区域悬停
      series.itemStyle = Object.assign({}, defaultData.series[mapSeries].itemStyle, {
        emphasis: { areaColor: chartEmphasisColor },
      });
      let {
        customShowLabel: show,
        customTextSize: fontSize,
        customTextColor: color,
        customOrient,
        customPointShowList,
        customShowTooltip,
        customTooltipShowList,
      } = mapStyle;
      // 处理label属性
      this.doWithKeyValue(series.label, 'normal', { show, fontSize, color });
      series.tooltip.show = customShowTooltip;
      // 拼凑显示格式
      this.dowWithLabelFormatter(series, customPointShowList, customOrient);

      this.dowWithTooltipFormatter(series, customTooltipShowList);
    },
    /**
     * @description 处理散点层
     */
    doWithScatter(series, scatterStyle) {
      let {
        customShowItem,
        customItemColor: color,
        customItemSymbol,
        customItemSize,
        customShowLabel: show,
        customTextSize: fontSize,
        customTextColor,
        customTextPosition: position,
        customPointShowList,
        customOrient,
        customShowTooltip,
        customTooltipShowList,
      } = scatterStyle;
      // 处理item
      this.doWithKeyValue(series.itemStyle, 'normal', { opacity: customShowItem ? 1 : 0, color });
      series.symbol = customItemSymbol;
      series.symbolSize = customItemSize;
      // 处理label
      this.doWithKeyValue(series.label, 'normal', { show, fontSize, color: customTextColor, position });
      series.tooltip.show = customShowTooltip;
      // 拼凑显示格式
      this.dowWithLabelFormatter(series, customPointShowList, customOrient);
      this.dowWithTooltipFormatter(series, customTooltipShowList);
    },
    /**
     * @description 处理标签显示内容
     */
    dowWithLabelFormatter(series, showList, orient) {
      // 指标内容
      let isShowAreaName = showList.some(str => str.search('地区名') > -1);
      series.label.normal.formatter = function (params) {
        if (!params.data) {
          return isShowAreaName ? params.name : '';
        }
        let str = [];
        showList.forEach(item => {
          let val = params.data[item];
          if (!val) {
            return;
          }
          str.push(val);
        });
        str = orient === 'vertical' ? str.join('\n') : str.join(':');
        return str;
      };
    },
    /**
     * @description 处理提示框显示内容
     */
    dowWithTooltipFormatter(series, showList) {
      series.tooltip.formatter = function (params) {
        if (!params.data) {
          return params.name;
        }
        let str = [];
        showList.forEach(item => {
          let val = params.data[item];
          if (!val) {
            return;
          }
          str.push(`${item}：${val}`);
        });
        return str.join('<br />');
      };
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');
      let data = defaultData.series;
      let returnData = {
        fillList:
          this.options.data.dimensions.length && this.options.data.measures.length
            ? [
                {
                  '地区名/diqu': '海珠区',
                  diqu: '海珠区',
                  name: '海珠区',
                  renkoushuliang: 456,
                  value: 456,
                },
                {
                  '地区名/diqu': '花都区',
                  diqu: '花都区',
                  name: '花都区',
                  renkoushuliang: 111,
                  value: 111,
                },
              ]
            : [],
        labelList:
          this.options.data.labelDimensions.length && this.options.data.labelMeasures.length
            ? [
                {
                  '地区名/diqu': '花都区',
                  diqu: '花都区',
                  name: '花都区',
                  renkoushuliang: 111,
                  value: [
                    113.211184, // 经度
                    23.39205, // 纬度度
                    111, // 值
                  ],
                },
                {
                  '地区名/diqu': '增城区',
                  diqu: '增城区',
                  name: '增城区',
                  renkoushuliang: 3456,
                  value: [113.829579, 23.290497, 3456],
                },
              ]
            : [],
      };
      this.serverData = {
        series: [
          Object.assign({}, data[0], {
            data: returnData.fillList,
          }),
          Object.assign({}, data[1], {
            name: 'test',
            data: returnData.labelList,
          }),
        ],
      };
      // 获取数据之后需要更改visualMap范围
      const valueList = returnData.fillList.map(item => item.value);
      const selectListData = this.handleMapFormatterSelect({
        mapData: returnData.fillList,
        scatterData: returnData.labelList,
      });
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            visualMap: Object.assign({}, this.options.style.echart.visualMap, { max: Math.max(...valueList) }),
            ...selectListData,
          },
        },
      });

      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    /**
     * @description 初始化地图指标显示内容列表
     */
    handleMapFormatterSelect({ mapData, scatterData }) {
      // 填充
      const fillList = Object.keys(omit(mapData, ['name', 'value']));
      const mapSelectList = { pointSelectList: fillList, tooltipSelectList: fillList.concat().shift() };
      // 散点
      const scatterList = Object.keys(omit(scatterData, ['name', 'value']));
      const scatterSelectList = { pointSelectList: scatterList, tooltipSelectList: scatterList.concat().shift() };

      return {
        mapSelectList,
        scatterSelectList,
      };
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
      const options = this.chartInstane.getOption();

      const data = {
        series: options.series,
      };

      const newOptions = this.doWithOptions(data);
      this.chartInstane.setOption(newOptions, {
        replaceMerge: ['series'],
      });
    },
    /**
     * @description 初始化Echart图表
     */
    initChart() {
      const dom = this.$refs['js-board-chart-unit'];
      this.chartInstane = this.$echarts.init(dom);
      if (!this.chartInstane) return console.error(`echart init fail`);
      // 改调接口拿数据
      registerMap(this.options.style.echart.geo.map);
      const {
        style: { echart },
      } = this.options;
      this.chartInstane.setOption(echart);
      this.screenAdapter();
    },
  },
};
</script>
