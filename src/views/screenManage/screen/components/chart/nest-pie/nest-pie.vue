<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
/**
 * @description 嵌套饼图
 */
export default {
  name: `${BoardType.ChartNestPie}View`,
  extends: BaseChart,
  methods: {
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
    doWithLabelLayout(labelLayout, chartInstaneWidth, params) {
      if (this.options.style.echart.customSeries.label.position !== 'outside') return;

      const isLeft = params.labelRect.x < chartInstaneWidth / 2;
      const points = params.labelLinePoints;

      if (!points) return;

      // 更新节点.
      points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
      return Object.assign({}, labelLayout, {
        labelLinePoints: points,
      });
    },
    /**
     * @description 处理标签线
     */
    doWithLabelLine() {
      return {
        length: 15,
        length2: 0,
        maxSurfaceAngle: 80,
      };
    },
    /**
     * @description 处理标签字体等
     */
    doWithLabel(label) {
      const { fontSize } = label;
      return Object.assign(label, {
        minMargin: fontSize,
        edgeDistance: 1.5 * fontSize,
        lineHeight: 1.5 * fontSize,
      });
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

      const legendArry = [];
      const series = [];
      const cacheData = Object.keys(fetchData);
      const len = cacheData.length;
      const radius = echart.customRadius;

      cacheData.forEach((key, index) => {
        const arry = fetchData[key];
        let item;
        if (index === 0 && series.length === 0) {
          item = this.createSeriesUnit(arry, [`0%`, `${radius / len}%`], echart);
        } else {
          const pre = series[index - 1];
          const preRadius = pre.radius;
          const value = +preRadius[1].split('%').shift() + (1 / 9) * radius;
          item = this.createSeriesUnit(arry, [`${value}%`, `${value + (1 / 6) * radius}%`], echart);
        }
        series.push(item);
        arry.forEach(item => legendArry.push(item));
      });

      const options = merge({}, echart, {
        legend: {
          data: legendArry,
        },
        series: series,
      });

      return options;
    },
    createSeriesUnit(data, radius, echart) {
      const seriesData = { ...omit(echart.customSeries, ['label', 'labelLayout']) };
      return {
        type: 'pie',
        // center: this.doWithCenter(echart.customCenter),
        radius: radius,
        label: this.doWithLabel(echart.customSeries.label),
        labelLayout: this.doWithLabelLayout.bind(this, echart.customSeries.labelLayout, this.chartInstane.getWidth()),
        labelLine: this.doWithLabelLine(),
        data: data,
        ...seriesData,
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
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');
      this.serverData = {
        data: [
          { value: 16237, name: '其它' },
          { value: 3399, name: '西南' },
          { value: 1796, name: '西北' },
          { value: 5146, name: '华北' },
          { value: 11115, name: '华东' },
          { value: 10000, name: '华南' },
        ],
        row: [
          { value: 234, name: '广告' },
          { value: 3100, name: '邮件营销' },
          { value: 2340, name: '联盟广告' },
          { value: 1350, name: '视频广告' },
        ],
      };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    updateChartStyle() {
      if (!this.chartInstane) return;
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.chartInstane.setOption(newOptions, {
        replaceMerge: ['series'],
      });
    },
  },
};
</script>
