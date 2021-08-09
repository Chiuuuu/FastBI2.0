<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';
/**
 * @description 矩形热力图
 */
export default {
  name: `${BoardType.ChartHeatmap}View`,
  extends: BaseChart,
  methods: {
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
      console.log('从这里获取服务端数据');
      this.serverData = {
        categoryData: ['可口可乐', '百事可乐', '雪碧', '健力宝', '康师傅', '星巴克', '统一'],
        series: [
          {
            name: '销量',
            type: 'line',
            data: [1000, 5600, 3000, 2000, 1500, 4000, 300],
          },
          {
            name: '生产',
            type: 'line',
            data: [1500, 6100, 3500, 2500, 2000, 4500, 800],
          },
          {
            name: '退货',
            type: 'line',
            data: [10, 100, 50, 80, 70, 20, 40],
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
    doWithData(data, xaxis, yaxis, measure) {
      return data.map(item => {
        return [item[xaxis.name], item[yaxis.name], item[measure.name]];
      });
    },
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const xaxis = {
        name: 'USER_NAME',
      };
      const yaxis = {
        name: 'USER_BIRTHDAY',
      };
      const measure = {
        name: 'USER_AGE',
      };

      const key = measure.name;
      const max = maxBy(fetchData.data, key)[key];
      const min = minBy(fetchData.data, key)[key];
      const visualMap = this.doWithVisualMap(max, min);
      const data = this.doWithData(fetchData.data, xaxis, yaxis, measure);
      const options = merge({}, echart, {
        visualMap,
        series: [
          {
            type: 'heatmap',
            data,
            label: echart.customLabel,
          },
        ],
      });

      return options;
    },
    updateChartStyle() {
      if (!this.chartInstane) return;
      const options = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.updateSaveChart(options);
    },
  },
};
</script>
