<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
/**
 * @description 环形饼图
 */
export default {
  name: `${BoardType.ChartPie}View`,
  extends: BaseChart,
  data() {
    return {
      cacheServerData: '', // 用来缓存上次的结果
    };
  },
  methods: {
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data, style } = this.options;
      if (style.echart.customTarge) {
        return data.dataModelId && data.progress.length && data.targe.length;
      } else {
        return data.dataModelId && data.progress.length;
      }
    },
    /**
     * @description 处理标签字体等
     */
    doWithLabel(label) {
      const { fontSize } = label;
      return Object.assign({}, label, {
        rich: {
          title: {
            fontSize: 2.5 * fontSize,
          },
          sub: {
            fontSize: 0.8 * fontSize,
          },
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
     * @description 处理数据的占比
     */
    doWithData(data) {
      return {
        value: data[1].value - data[0].value,
        name: data[1].name,
      };
    },
    doWithFormatter(data, way) {
      let percent = 0;

      if (this.options.style.echart.customTarge && data.length > 1) {
        percent = +((data[0].value / data[1].value) * 100).toFixed(2);
      } else {
        // 如果不开启目标值设置，以1为基准
        percent = +((data[0].value / 1) * 100).toFixed(2);
      }
      const name = data[0].name;
      const value = data[0].value;
      const ways = {
        name: `${name}`,
        value: `${value}`,
        percent: `${percent}%`,
        nv: `${value}\n\n{sub|${name}}`,
        np: `${percent}%\n\n{sub|${name}}`,
        vp: `${percent}%\n\n{sub|${value}}`,
        all: `${percent}%\n\n{sub|${name}}\n{sub|${value}}`,
      };
      const formatter = ways[way] || `${percent}%\n\n{sub|${name}}`;
      return formatter;
    },
    doWithOptions(data) {
      const { customInRadius, customOutRadius, customColors, customFormatterWay, customTarge } =
        this.options.style.echart;
      const { label } = this.options.style.echart.customSeries;
      data = [].concat(data);
      const radius = this.doWithRadius(customInRadius, customOutRadius);
      const formatter = this.doWithFormatter(data, customFormatterWay);

      if (customTarge) {
        // 1.开启目标值需要处理数据
        if (data.length > 1) {
          data.splice(1, 1, this.doWithData(data));
        }
      } else {
        // 2.不开启目标值只需要一个数据
        if (data.length > 1) {
          data.shift();
        }
      }

      const series = [
        {
          type: 'pie',
          radius,
          label: Object.assign({}, label, {
            formatter: `${formatter}`,
          }),
          color: customColors,
          data: data,
          emphasis: {
            scale: false,
          },
        },
      ];

      const options = merge({}, this.options.style.echart, {
        series: series,
      });
      return options;
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      const dataOption = this.doWithOptions(defaultData.data);
      this.updateSaveChart(dataOption);
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');

      this.serverData = {
        data: this.options.style.echart.customTarge
          ? [
              {
                value: 8,
                name: '就业率',
              },
              {
                value: 10,
                name: '总人数',
              },
            ]
          : [
              {
                value: 5,
                name: '就业率',
              },
            ],
      };

      if (!this.options.style.echart.customTarge) {
        if (this.options.data.targe && this.options.data.targe.length) {
          const data = this.cacheServerData && this.cacheServerData.data;
          if (data && data.length > 1) {
            this.serverData.data.push(data[1]);
          }
        }
      }

      this.cacheServerData = this.serverData;

      const options = this.doWithOptions(this.serverData.data);
      this.updateSaveChart(options);
    },
    updateChartStyle() {
      if (!this.chartInstane) return;
      const data = this.serverData ? this.serverData.data : defaultData.data;
      const newOptions = this.doWithOptions(data);
      this.chartInstane.setOption(newOptions);
    },
  },
};
</script>
