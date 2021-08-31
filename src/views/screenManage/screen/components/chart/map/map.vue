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
      this.doWithMap(
        fetchData.series[mapSeries],
        echart.mapStyle,
        echart.geo.itemStyle.emphasis.areaColor,
        echart.geo.map,
      );
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
    doWithMap(series, mapStyle, chartEmphasisColor, map) {
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
      series.map = map;
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
     * @description 处理填充层
     */
    handleFillList(fillList) {
      const dimensionAlias = this.options.data.dimensions[0].alias;
      const measureAlias = this.options.data.measures[0].alias;
      let datas = fillList.map(data => {
        return {
          name: data[dimensionAlias],
          value: data[measureAlias],
          // 构造映射数据，给指标提示框内容显示
          [`地区名/${dimensionAlias}`]: data[dimensionAlias], // 地区名/维度
          [dimensionAlias]: data[dimensionAlias], // 维度
          [measureAlias]: data[measureAlias], // 度量
        };
      });
      return datas;
    },
    handleLabelList(labelList) {
      const dimensionAlias = this.options.data.labelDimensions[0].alias;
      const measureAlias = this.options.data.labelMeasures[0].alias;
      let datas = labelList.map(data => {
        return {
          name: data[dimensionAlias],
          value: data[measureAlias],
          // 构造映射数据，给指标提示框内容显示
          [`地区名/${dimensionAlias}`]: data[dimensionAlias], // 地区名/维度
          [dimensionAlias]: data[dimensionAlias], // 维度
          [measureAlias]: data[measureAlias], // 度量
        };
      });
      return datas;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const res = await this.$server.common.getData('/screen/graph/v2/getData', {
        id: this.shapeUnit.component.id,
        tabId: this.tabId,
        type: this.shapeUnit.component.type,
        ...omit(this.options.data, ['expands']),
      });
      if (res.code === 200) {
        let fillList = res.data.fillList ? this.handleFillList(res.data.fillList) : [];
        let labelList = res.data.labelList ? this.handleLabelList(res.data.labelList) : [];

        const data = defaultData.series;
        this.serverData = {
          series: [
            Object.assign({}, data[mapSeries], {
              name: this.options.data.measures[0].alias,
              data: fillList,
            }),
            Object.assign({}, data[scatterSeries], {
              name: this.options.data.labelMeasures[0].alias,
              data: labelList,
            }),
          ],
        };
        // 获取数据之后需要更改visualMap范围
        const valueList = fillList.map(item => item.value);
        this.$store.commit(boardMutation.SET_STYLE, {
          style: {
            echart: {
              visualMap: Object.assign({}, this.options.style.echart.visualMap, {
                max: Math.max(...valueList),
                min: Math.min(...valueList),
              }),
            },
          },
          updateCom: this.shapeUnit.component,
        });
      } else {
        this.$message.error(res.msg);
      }
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
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.chartInstane.clear();
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
