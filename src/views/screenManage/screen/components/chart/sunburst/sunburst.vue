<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
/**
 * @description 旭日图
 */
export default {
  name: `${BoardType.ChartSunburst}View`,
  extends: BaseChart,
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
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');
      this.serverData = {
        data: [
          {
            name: '加拿大',
            value: 30,
            children: [
              {
                name: 'Uncle Leo',
                value: 15,
                children: [
                  {
                    name: 'Cousin Jack',
                    value: 5,
                  },
                  {
                    name: 'Cousin Mary',
                    value: 5,
                    children: [
                      {
                        name: 'Jackson',
                        value: 2,
                      },
                    ],
                  },
                  {
                    name: 'Cousin Ben',
                    value: 5,
                  },
                ],
              },
              {
                name: 'Father',
                value: 30,
                children: [
                  {
                    name: 'Me',
                    value: 5,
                  },
                  {
                    name: 'Brother Peter',
                    value: 5,
                  },
                ],
              },
            ],
          },
          {
            name: 'Nancy',
            value: 10,
            children: [
              {
                name: 'Uncle Nike',
                value: 6,
                children: [
                  {
                    name: 'Cousin Betty',
                    value: 4,
                  },
                  {
                    name: 'Cousin Jenny',
                    value: 2,
                  },
                ],
              },
            ],
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
     * @description 根据key处理value值
     * @param {object} item 数据
     * @param {string} key 字段
     * @param {any} value 对应字段值
     */
    doWithKeyValue(item, key, value) {
      item[key] = value;
    },
    doWithFormatter(way) {
      const ways = {
        name: '{b}\n',
        value: '{c}\n',
        nv: '{b}\n{c}',
      };
      const formatter = ways[way] || ways.nv;
      return formatter;
    },
    doWithVisualMap(echart) {
      return Object.assign({}, echart.visualMap, {
        // 右侧视觉映射组件
        type: 'continuous',
        max: echart.customMax,
        min: echart.customMin,
        calculable: true,
        orient: 'vertical', // vertical
        left: 'right', // 左 中 右
        top: 'bottom', // 上 中 下
        inRange: {
          color: ['#ffc53d', '#13c2c2', '#1890ff', '#73d13d'],
        },
        textStyle: {
          color: '#fff',
          fontSize: 15,
        },
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
    /**
     * @description 处理图表配置项
     */
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const visualMap = this.doWithVisualMap(echart);
      const radius = this.doWithRadius(echart.customInRadius, echart.customOutRadius);
      const center = this.doWithCenter(echart.customCenter);
      const formatter = this.doWithFormatter(echart.customFormatterWay);
      const options = merge({}, echart, {
        visualMap,
        series: {
          type: 'sunburst',
          emphasis: {
            //  高亮状态配置
            focus: 'ancestor',
          },
          center, // 中心位置
          radius, // 内外半径
          label: Object.assign({}, echart.customSeries.label, {
            formatter: `${formatter}`,
          }),
          labelLayout: echart.customSeries.labelLayout,
          itemStyle: {
            //  区块设置
            borderColor: '#fff',
            borderWidth: 1,
          },
          data: fetchData.data,
        },
      });
      return options;
    },
    updateChartStyle() {
      if (!this.chartInstane) return;
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.updateSaveChart(newOptions);
    },
  },
};
</script>
