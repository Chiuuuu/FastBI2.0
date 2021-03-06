<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
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
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      return [].concat(data.progress).concat(data.targe);
    },
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
      const { fontSize, fontWeight, fontFamily } = label;
      return Object.assign({}, label, {
        rich: {
          title: {
            fontSize: 2.5 * fontSize,
            fontWeight,
            fontFamily,
          },
          sub: {
            fontSize: 0.8 * fontSize,
            fontWeight,
            fontFamily,
          },
        },
      });
    },
    /**
     * @description 处理中心点
     */
    doWithCenter(customCenter) {
      return [`${customCenter[0]}%`, `${customCenter[1]}%`];
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
      const value = data[1].value - data[0].value;
      return {
        value: value > 0 ? 0 : value,
        name: data[1].name,
      };
    },
    /**
     * @description 处理数据的占比
     */
    doWithLabelData(data) {
      return {
        value: data[1].value - data[0].value,
        name: data[1].name,
      };
    },
    doWithFormatter(data, way, customFixed, dataIndex) {
      let percent = 0;

      if (this.options.style.echart.customTarge && data.length > 1) {
        const labelData = [data[0], this.doWithLabelData(data)];
        // 使用abs()函数取绝对值
        if (labelData[1].value === 0) {
          percent = 100;
        } else {
          percent = Math.abs((labelData[dataIndex].value / labelData[1].value) * 100).toFixed(customFixed);
        }
      } else {
        // 如果不开启目标值设置，以1为基准
        percent = Math.abs((1 / 1) * 100).toFixed(customFixed);
      }
      const name = data[dataIndex].name;
      const value = data[dataIndex].value;
      const ways = {
        name: `${name}`,
        value: `${value}`,
        percent: `${percent}%`,
        nv: `${value}\n\n{sub|${name}}`,
        np: `${percent}%\n\n{sub|${name}}`,
        vp: `${percent}%\n\n{sub|${value}}`,
        all: `${percent}%\n\n{sub|${name}}\n\n{sub|${value}}`,
      };
      const formatter = ways[way] || `${percent}%\n\n{sub|${name}}`;
      return formatter;
    },
    doWithOptions(data) {
      const {
        customCenter,
        customInRadius,
        customOutRadius,
        customColors,
        customFixed,
        customFormatterWay,
        customTarge,
        customSeries,
      } = this.options.style.echart;
      let { label } = customSeries;
      label = this.doWithLabel(label);
      data = [].concat(data);
      const radius = this.doWithRadius(customInRadius, customOutRadius);
      const center = this.doWithCenter(customCenter);
      const seriesData = { ...omit(customSeries, ['label']) };
      let echartsData = data;

      if (customTarge) {
        // 1.开启目标值需要处理数据
        if (data.length > 1) {
          echartsData = [data[0], this.doWithData(data)];
        }
      } else {
        // 2.不开启目标值只需要一个数据
        // 默认数组第一是进度值、第二是目标值
        if (data.length > 1) {
          echartsData.pop();
        }
      }

      const series = [
        {
          type: 'pie',
          center,
          radius,
          label: Object.assign({}, label, {
            formatter: param => {
              if (label.position === 'center') {
                // 固定中间显示为目标值 -- 目前数据长度等于2时，数组下标为0的暂定为目标值
                return `${this.doWithFormatter(data, customFormatterWay, customFixed, 0)}`;
              } else {
                return `${this.doWithFormatter(data, customFormatterWay, customFixed, param.dataIndex)}`;
              }
            },
          }),
          color: customColors,
          data: echartsData,
          ...seriesData, // series其他配置
          emphasis: {
            scale: false,
            label: {
              show: true,
              formatter: param => {
                if (label.position === 'center') {
                  // 固定中间显示为目标值 -- 目前数据长度等于2时，数组下标为0的暂定为目标值
                  return `${this.doWithFormatter(data, customFormatterWay, customFixed, 0)}`;
                } else {
                  return `${this.doWithFormatter(data, customFormatterWay, customFixed, param.dataIndex)}`;
                }
              },
            },
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
      this.dataState = 'normal';
      const dataOption = this.doWithOptions(defaultData.data);
      this.updateSaveChart(dataOption);
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { progress, targe },
        style: {
          title: { text },
        },
      } = this.options;
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.pagination,
          ...omit(this.options.data, ['expands', 'progress', 'targe']),
          measures: [].concat(progress).concat(targe),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code !== 200) {
        if (res.code === 1054) {
          const keys = ['progress', 'targe', 'filter', 'sort'];
          this.handleRedList(res.data, keys);
          if (this.isEditMode) {
            this.$message.error(`${text}数据异常, 请处理标红字段`);
          }
          return;
        }
        return this.$message.error(res.msg || '请求错误');
      }
      this.dataState = res.data && res.data.length ? 'normal' : 'empty';
      if (this.dataState === 'empty') {
        return;
      }
      const datas = res.data || [];
      this.serverData = {
        data: [
          {
            value: datas[0][`${progress[0].defaultAggregator}_${progress[0].alias}`],
            name: progress[0].alias,
          },
          {
            value: datas[0][`${targe[0].defaultAggregator}_${targe[0].alias}`],
            name: targe[0].alias,
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
      if (this.dataState === 'empty' || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const data = this.serverData ? this.serverData.data : defaultData.data;
      const newOptions = this.doWithOptions(data);
      this.chartInstane.setOption(newOptions);
    },
  },
};
</script>
