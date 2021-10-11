<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import registerMap from './registerMap';
import { mutationTypes as boardMutation } from '@/store/modules/board';
import guangzhou from '@/utils/guangzhou.json';
import reverseAddressResolution from './reverseAddressResolution';
import omit from 'lodash/omit';
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
    getFieldList(type) {
      const { data } = this.options;
      if (type === 'fillList') {
        return [].concat(data.dimensions).concat(data.measures);
      } else if (type === 'labelList') {
        return [].concat(data.labelDimensions).concat(data.labelMeasures);
      }
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.dataModelId && (this.isFillData() || this.isLabelData());
    },
    isFillData() {
      const { data } = this.options;
      const isFillArea = data.dimensions.length && data.measures.length;
      const isFillDot = data.longitude.length && data.latitude.length && data.measures.length;
      return isFillArea || isFillDot;
    },
    isLabelData() {
      const { data } = this.options;
      const isLabelArea = data.labelDimensions.length && data.labelMeasures.length;
      const isLabelDot = data.labelLongitude.length && data.labelLatitude && data.labelMeasures;
      return isLabelArea || isLabelDot;
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series[scatterSeries] && series[scatterSeries].name
        ? [series[scatterSeries].name.replace(/(.*?)_/, '')]
        : [];
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
      this.doWithMap(fetchData.series[mapSeries], echart.mapStyle, echart.geo);
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
    doWithMap(series, mapStyle, geo) {
      // 处理区域悬停
      series.itemStyle = Object.assign({}, defaultData.series[mapSeries].itemStyle, {
        emphasis: { areaColor: geo.itemStyle.emphasis.areaColor },
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
      series = Object.assign(series, omit(geo, ['label', 'itemStyle', 'roam']));
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
     * @description 引入amap
     */
    setAmap() {
      // 引入amap
      return new Promise(resolve => {
        let script = null;
        if (window.AMap) {
          resolve(true);
        } else {
          script = document.createElement('script');
          script.id = 'amapscript';
          script.async = 'true';
          script.type = 'text/javascript';
          script.src = 'https://webapi.amap.com/maps?v=1.4.15&key=692514d9fd33baea548298e394890763';
          document.head.appendChild(script);
          window.initMap = () => {
            resolve(true);
          };
        }
      });
    },
    /**
     * @description 处理填充数据
     */
    async handleFillList(fillList) {
      // 填充层数据条件不满足不处理
      const noDataObj = { fillList: [], fillName: '', fillCustomPointShowList: [], fillCustomTooltipShowList: [] };
      const { customFillDataType: dataType, dimensions, measures, longitude, latitude } = this.options.data;
      if (!fillList || !measures.length) {
        return noDataObj;
      }
      if (dataType === 'area' && !dimensions.length) {
        return noDataObj;
      }
      if (dataType === 'dot' && (!longitude.length || !latitude.length)) {
        return noDataObj;
      }

      if (this.options.data.customFillDataType === 'area') {
        // 地区
        return this.handleFillArea(fillList);
      }
      // 经纬度
      return await this.handleFillDot(fillList);
    },
    /**
     * @description 处理填充地区
     */
    handleFillArea(fillList) {
      const { dimensions, measures } = this.options.data;
      const measureAlias = `${measures[0].defaultAggregator}_${measures[0].alias}`;
      const dimensionAlias = dimensions[0].alias;
      let datas = fillList.map(data => {
        return {
          name: data[dimensionAlias],
          value: data[measureAlias],
          // 构造映射数据，给指标提示框内容显示
          [`地区名/${dimensionAlias}`]: data[dimensionAlias], // 地区名/维度
          [dimensionAlias]: data[dimensionAlias], // 维度
          [measureAlias.replace(/(.*?)_/, '')]: data[measureAlias], // 度量
        };
      });
      let pointShowList = [];
      let tooltipList = [];
      // 非初始化才重置格式
      if (this.dataState !== 'default') {
        pointShowList = [`地区名/${dimensionAlias}`];
        tooltipList = [dimensionAlias, measureAlias.replace(/(.*?)_/, '')];
      } else {
        pointShowList = [].concat(this.options.style.echart.mapStyle.customPointShowList);
        tooltipList = [].concat(this.options.style.echart.mapStyle.customTooltipShowList);
      }
      return {
        fillList: datas,
        fillName: measureAlias.replace(/(.*?)_/, ''),
        fillCustomPointShowList: pointShowList,
        fillCustomTooltipShowList: tooltipList,
      };
    },
    /**
     * @description 处理填充经纬度
     */
    async handleFillDot(fillList) {
      const { latitude, longitude, measures } = this.options.data;
      const measureAlias = `${measures[0].defaultAggregator}_${measures[0].alias}`;
      //经纬度
      let datas = [];
      for (let data of fillList) {
        // 获取位置信息
        try {
          let positionMsg = await reverseAddressResolution([data[longitude[0].alias], data[latitude[0].alias]]);
          let datacontent = {
            name: positionMsg.district,
            value: data[measureAlias],
            // 构造映射数据，给指标提示框内容显示
            [latitude[0].alias]: data[latitude[0].alias], // 经度
            [longitude[0].alias]: data[longitude[0].alias], // 维度
            地区名: positionMsg.district, // 地区名
            [measureAlias.replace(/(.*?)_/, '')]: data[measureAlias], // 度量
          };
          // 已有地图数据直接累加
          let areaData = datas.find(item => item.name === datacontent.name);
          if (areaData) {
            areaData[measureAlias] += datacontent[measureAlias];
            areaData.value += datacontent.value;
          } else {
            datas.push(datacontent);
          }
        } catch (err) {
          continue;
        }
      }
      if (fillList.length && !datas.length) {
        this.$message.error('经纬度解析失败');
      }
      let pointShowList = [];
      let tooltipList = [];
      // 非初始化才重置格式
      if (this.dataState !== 'default') {
        pointShowList = [`地区名`];
        tooltipList = [longitude[0].alias, latitude[0].alias, measureAlias.replace(/(.*?)_/, '')];
      } else {
        pointShowList = [].concat(this.options.style.echart.mapStyle.customPointShowList);
        tooltipList = [].concat(this.options.style.echart.mapStyle.customTooltipShowList);
      }
      return {
        fillList: datas,
        fillName: measureAlias.replace(/(.*?)_/, ''),
        fillCustomPointShowList: pointShowList,
        fillCustomTooltipShowList: tooltipList,
      };
    },
    /**
     * @description 处理标点数据
     */
    async handleLabelList(labelList) {
      // 散点层数据条件不满足不处理
      const noDataObj = {
        labelList: [],
        labelName: '',
        labelCustomPointShowList: [],
        labelCustomTooltipShowList: [],
      };
      const {
        customLabelDataType: dataType,
        labelDimensions,
        labelMeasures,
        labelLongitude,
        labelLatitude,
      } = this.options.data;
      if (!labelList || !labelMeasures.length) {
        return noDataObj;
      }
      if (dataType === 'area' && !labelDimensions.length) {
        return noDataObj;
      }
      if (dataType === 'dot' && (!labelLongitude.length || !labelLatitude.length)) {
        return noDataObj;
      }

      // 地区
      if (this.options.data.customLabelDataType === 'area') {
        return this.handleLabelArea(labelList);
      }
      // 经纬度
      return await this.handleLabelDot(labelList);
    },
    /**
     * @description 处理填充地区
     */
    handleLabelArea(labelList) {
      const { labelDimensions, labelMeasures } = this.options.data;
      const dimensionAlias = labelDimensions[0].alias;
      const measureAlias = `${labelMeasures[0].defaultAggregator}_${labelMeasures[0].alias}`;
      let datas = [];
      for (let data of labelList) {
        // 抓取区域坐标
        const center = this.getCenterCoordinate(data[dimensionAlias]);
        // 找不到对应坐标跳过
        if (!center) {
          continue;
        }
        datas.push({
          name: data[dimensionAlias],
          value: center.concat(data[measureAlias]),
          // 构造映射数据，给指标提示框内容显示
          [`地区名/${dimensionAlias}`]: data[dimensionAlias], // 地区名/维度
          [dimensionAlias]: data[dimensionAlias], // 维度
          [measureAlias.replace(/(.*?)_/, '')]: data[measureAlias], // 度量
        });
      }
      // 每个区域标记点超过20个要进行截取
      if (datas.length > 20) {
        let overload = false;
        datas.map(item => {
          if (item.value.length && item.value.length > 20) {
            datas.length = 20;
            overload = true;
          }
        });
        if (overload) {
          const title = this.options.style.title.text;
          this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
        }
      }
      let pointShowList = [];
      let tooltipList = [];
      // 非初始化才重置格式
      if (this.dataState !== 'default') {
        pointShowList = [`地区名/${dimensionAlias}`];
        tooltipList = [dimensionAlias, measureAlias.replace(/(.*?)_/, '')];
      } else {
        pointShowList = [].concat(this.options.style.echart.scatterStyle.customPointShowList);
        tooltipList = [].concat(this.options.style.echart.scatterStyle.customTooltipShowList);
      }
      return {
        labelList: datas,
        labelName: measureAlias.replace(/(.*?)_/, ''),
        labelCustomPointShowList: pointShowList,
        labelCustomTooltipShowList: tooltipList,
      };
    },
    /**
     * @description 处理填充经纬度
     */
    async handleLabelDot(labelList) {
      const { labelLatitude, labelLongitude, labelMeasures } = this.options.data;
      const measureAlias = `${labelMeasures[0].defaultAggregator}_${labelMeasures[0].alias}`;
      //经纬度
      let datas = [];
      for (let data of labelList) {
        // 获取位置信息
        try {
          const position = [data[labelLongitude[0].alias], data[labelLatitude[0].alias]];
          let positionMsg = await reverseAddressResolution(position);
          // 获取位置信息
          datas.push({
            name: positionMsg.district,
            value: [parseFloat(position[0]), parseFloat(position[1])].concat(data[measureAlias]),
            // 构造映射数据，给指标提示框内容显示
            [labelLatitude[0].alias]: data[labelLatitude[0].alias], // 经度
            [labelLongitude[0].alias]: data[labelLongitude[0].alias], // 维度
            地区名: positionMsg.district, // 地区名
            [measureAlias.replace(/(.*?)_/, '')]: data[measureAlias], // 度量
          });
        } catch (err) {
          continue;
        }
      }
      if (labelList.length && !datas.length) {
        this.$message.error('经纬度解析失败');
      }
      // 每个区域标记点超过20个要进行截取
      if (datas.length > 20) {
        let overload = false;
        datas.map(item => {
          if (item.value.length && item.value.length > 20) {
            datas.length = 20;
            overload = true;
          }
        });
        if (overload) {
          const title = this.options.style.title.text;
          this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
        }
      }
      let pointShowList = [];
      let tooltipList = [];
      // 非初始化才重置格式
      if (this.dataState !== 'default') {
        pointShowList = [`地区名`];
        tooltipList = [labelLongitude[0].alias, labelLatitude[0].alias, measureAlias.replace(/(.*?)_/, '')];
      } else {
        pointShowList = [].concat(this.options.style.echart.scatterStyle.customPointShowList);
        tooltipList = [].concat(this.options.style.echart.scatterStyle.customTooltipShowList);
      }
      return {
        labelList: datas,
        labelName: measureAlias.replace(/(.*?)_/, ''),
        labelCustomPointShowList: pointShowList,
        labelCustomTooltipShowList: tooltipList,
      };
    },
    /**
     * @description 抓取区中心点
     */
    getCenterCoordinate(name) {
      const dataList = guangzhou.features;
      const countryside = dataList.find(item => item.properties.name === name);
      if (!countryside) {
        return null;
      }
      return countryside.properties.centroid;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.tabId,
          type: this.shapeUnit.component.type,
          ...this.options.data,
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        if (res.msg === 'IsChanged') {
          const keys = [
            'dimensions',
            'measures',
            'longitude',
            'latitude',
            'labelDimensions',
            'labelMeasures',
            'labelLongitude',
            'labelLatitude',
          ];
          this.handleRedList(res.data, keys);
        }
        this.$message.error(res.msg);
        return;
      }
      if (res.code === 80002) {
        this.$message.error(res.msg);
        return;
      }

      const [fillResult, labelResult] = await Promise.all([
        this.handleFillList(res.data.fillList),
        this.handleLabelList(res.data.labelList),
      ]);
      const { fillList, fillName, fillCustomPointShowList, fillCustomTooltipShowList } = fillResult;
      const { labelList, labelName, labelCustomPointShowList, labelCustomTooltipShowList } = labelResult;

      // 修改状态
      this.dataState = 'normal';

      const data = defaultData.series;
      this.serverData = {
        series: [
          Object.assign({}, data[mapSeries], {
            name: fillName,
            data: fillList,
          }),
          Object.assign({}, data[scatterSeries], {
            name: labelName,
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
            mapStyle: Object.assign({}, this.options.style.echart.mapStyle, {
              customPointShowList: fillCustomPointShowList,
              customTooltipShowList:
                fillCustomTooltipShowList || this.options.style.echart.mapStyle.customTooltipShowList,
            }),
            scatterStyle: Object.assign({}, this.options.style.echart.scatterStyle, {
              customPointShowList:
                labelCustomPointShowList || this.options.style.echart.scatterStyle.customPointShowLis,
              customTooltipShowList:
                labelCustomTooltipShowList || this.options.style.echart.scatterStyle.customTooltipShowList,
            }),
          },
        },
        replaceMerge: ['mapStyle', 'scatterStyle'],
        updateCom: this.shapeUnit.component,
      });
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
      if (!this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.chartInstane.setOption(newOptions, {
        replaceMerge: ['series'],
      });
    },
    /**
     * @description 初始化Echart图表
     */
    async initChart() {
      const dom = this.$refs['js-board-chart-unit'];
      this.chartInstane = this.$echarts.init(dom);
      if (!this.chartInstane) return console.error(`echart init fail`);
      // 改调接口拿数据
      registerMap(this.options.style.echart.geo.map);
      await this.setAmap();
      const {
        style: { echart },
      } = this.options;
      this.chartInstane.setOption(echart);
      this.screenAdapter();
    },
  },
};
</script>
