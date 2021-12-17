<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 嵌套饼图
 */
export default {
  name: `${BoardType.ChartNestPie}View`,
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
      return [].concat(data.outerIng).concat(data.innerIng).concat(data.measures);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.dataModelId && data.outerIng.length && data.innerIng.length && data.measures.length;
    },
    /**
     * @description 处理标签对齐
     */
    // doWithLabelLayout(labelLayout, chartInstaneWidth, params) {
    //   if (this.options.style.echart.customSeries.label.position !== 'outside') return;

    //   const isLeft = params.labelRect.x < chartInstaneWidth / 2;
    //   const points = params.labelLinePoints;

    //   if (!points) return;

    //   // 更新节点.
    //   points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
    //   return Object.assign({}, labelLayout, {
    //     labelLinePoints: points,
    //   });
    // },
    /**
     * @description 处理标签线
     */
    // doWithLabelLine() {
    //   return {
    //     length: 15,
    //     length2: 0,
    //     maxSurfaceAngle: 80,
    //   };
    // },
    /**
     * @description 处理标签字体等
     */
    // doWithLabel(label) {
    //   const { fontSize } = label;
    //   return Object.assign(label, {
    //     minMargin: fontSize,
    //     edgeDistance: 1.5 * fontSize,
    //     lineHeight: 1.5 * fontSize,
    //   });
    // },
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
    /**
     * @description 处理鼠标移入提示内容
     */
    dowithFormatterToolTip(param) {
      let label = [];
      if (param.data.origin) {
        //服务数据显示
        Object.keys(param.data.origin).forEach(item => {
          label.push(item + '：' + param.data.origin[item]);
        });
      } else {
        //默认数据显示
        label.push('name：' + param.data.name);
        label.push('value：' + param.data.value);
      }
      return label.join('<br/>');
    },
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const legendArry = [];
      const series = [];
      const cacheData = Object.keys(fetchData);
      const len = cacheData.length;
      const radius = echart.customRadius;

      cacheData.forEach((key, index) => {
        const arry = fetchData[key];
        let item;
        if (index === 0 && series.length === 0) {
          item = this.createSeriesUnit(arry, [`0%`, `${radius / len}%`], echart, index);
        } else {
          const pre = series[index - 1];
          const preRadius = pre.radius;
          const value = +preRadius[1].split('%').shift() + (1 / 9) * radius;
          item = this.createSeriesUnit(arry, [`${value}%`, `${value + (1 / 6) * radius}%`], echart, index);
        }
        series.push(item);
        arry.forEach(item => legendArry.push(item));
      });

      const options = merge({}, echart, {
        legend: {
          data: legendArry,
        },
        tooltip: {
          formatter: param => this.dowithFormatterToolTip(param),
        },
        series: series,
      });

      return options;
    },
    createSeriesUnit(data, radius, echart, index) {
      const seriesData = { ...omit(echart.customSeries, ['']) };
      return {
        type: 'pie',
        zlevel: index === 0 ? 2 : 1,
        center: this.doWithCenter(echart.customCenter),
        radius: radius,
        // label: this.doWithLabel(echart.customSeries.label),
        // labelLayout: this.doWithLabelLayout.bind(this, echart.customSeries.labelLayout, this.chartInstane.getWidth()),
        labelLine: {
          length: echart.customlabelLineLen[index],
        },
        data: data,
        ...seriesData,
      };
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
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log({ id: this.shapeUnit.component.id, type: this.shapeUnit.component.type, data: this.options.data });
      console.log('从这里获取服务端数据');
      const {
        data: { measures, outerIng, innerIng },
      } = this.options;
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.pagination,
          ...omit(this.options.data, ['expands', 'outerIng', 'innerIng']),
          dimensions: [].concat(outerIng).concat(innerIng),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        if (res.msg === 'IsChanged') {
          const keys = ['outerIng', 'innerIng', 'measures', 'filter', 'sort'];
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
      if (this.isEditMode && datas.length >= 50) {
        datas.length = 50;
        const title = this.options.style.title.text;
        this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
      }
      let series = [];
      []
        .concat(outerIng)
        .concat(innerIng)
        .forEach(outerInnerIng => {
          series.push([]);
          datas.forEach(datas => {
            series[series.length - 1].push({
              name: datas[outerInnerIng.alias],
              value: datas[`${measures[0].defaultAggregator}_${measures[0].alias}`],
              origin: {
                [outerInnerIng.alias]: datas[outerInnerIng.alias],
                [measures[0].alias]: datas[`${measures[0].defaultAggregator}_${measures[0].alias}`],
              },
            });
          });
        });
      this.serverData = { data: series[0], row: series[1] };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    updateChartStyle() {
      if (this.dataState === 'empty' || !this.chartInstane) return;
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
          ? options.color[params.dataIndex]
          : self.hexToRgba(options.color[params.dataIndex], 0.4);
      };
      options.series.forEach(item => {
        item.itemStyle = Object.assign(item.itemStyle, { color: formatterFn });
      });
      this.chartInstane.setOption(options);
      // 记录当前选择数据的index
      this.currentDataIndex = e.dataIndex;
      this.currentSeriesIndex = e.seriesIndex;
      // 嵌套饼图series顺序由外到内
      const pickField = this.currentSeriesIndex === 0 ? 'outerIng' : 'innerIng';
      setLinkageData(null, this.shapeUnit.component, [{ pickField, pickValue: [e.name] }]);
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
