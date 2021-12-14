<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';

const GAUGE = 'gauge';

/**
 * @description 仪表盘
 */
export default {
  name: `${BoardType.ChartGauge}View`,
  extends: BaseChart,
  methods: {
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      let list = [];
      Object.keys(data).forEach(key => {
        if (key !== 'dataLink' && Array.isArray(data[key])) {
          list = list.concat(data[key]);
        }
      });
      return list;
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.progress && data.progress.length;
    },
    /**
     * @description 拼接度量数据
     */
    handleMeasures() {
      return ['progress', 'target', 'max', 'min'].reduce((pre, current) => {
        if (Array.isArray(this.options.data[current])) {
          return pre.concat(this.options.data[current]);
        }
        return pre;
      }, []);
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { progress, targe, max, min },
      } = this.options;
      const measures = this.handleMeasures();
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.options.data,
          ...this.pagination,
          measures,
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        if (res.msg === 'IsChanged') {
          const keys = ['progress', 'targe', 'min', 'max', 'filter'];
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
      this.serverData = {
        current: {
          value: datas[0][`${progress[0].defaultAggregator}_${progress[0].alias}`],
          name: progress[0].alias,
        },
        min: !Array.isArray(min) ? min : datas[0][`${min[0].defaultAggregator}_${min[0].alias}`],
        max: !Array.isArray(max) ? max : datas[0][`${max[0].defaultAggregator}_${max[0].alias}`],
        target: !Array.isArray(targe) ? targe : datas[0][`${targe[0].defaultAggregator}_${targe[0].alias}`],
      };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    /**
     * @description 处理中心点
     */
    doWithCenter(center) {
      return [`${center[0]}%`, `${center[1]}%`];
    },
    /**
     * @description 处理半径
     */
    doWithRadius(type) {
      const { customRadius, customGap } = this.options.style.echart;
      const radius = +(customRadius + customGap);
      return type === GAUGE ? `${customRadius}%` : `${radius}%`;
    },
    /**
     * @description 处理仪表盘
     */
    doWithGauge(cur, min, max) {
      const { customOptions, customValue, customFixed } = this.options.style.echart;
      let current = Object.assign({}, cur);

      if (customValue === 'percentage') {
        // 开启百分比显示, 计算数值百分比
        const totalProgress = max - min;
        if (totalProgress <= 0) {
          current.value = 100;
        } else {
          // 如果展示值小于最小值, 显示为0
          if (cur.value < min) {
            current.value = 0;
          } else {
            current.value = ((current.value - min) / totalProgress) * 100;
          }
        }
        // 开启百分比显示, 最大值恒为100
        max = 100;
        // 开启百分比显示, 最小值恒为0
        min = 0;
      } else {
        // 如果没有最大值，则设置为2倍的进度值
        max = max || 2 * cur.value;
        // 如果没有最小值，则设置为0
        min = min || 0;
        // 如果展示值小于最小值, 显示为0
        if (cur.value < min) current.value = 0;
      }

      const options = merge({}, customOptions, {
        name: GAUGE,
        radius: this.doWithRadius(GAUGE),
        min: min,
        max: max,
        detail: {
          formatter(value = 0) {
            // 数据格式为百分比
            if (customValue === 'percentage') {
              return value.toFixed(customFixed) + '%';
            }
            return value.toFixed(customFixed);
          },
        },
        axisLabel: {
          formatter(value = 0) {
            // 百分比显示
            if (customValue === 'percentage') {
              value = Math.round((value / max) * 100);
            }
            return value;
          },
        },
      });

      options.data = [current];
      return options;
    },
    /**
     * @description 处理目标值
     */
    doWithTarget(gauge, targetValue) {
      const omitArry = ['axisLine', 'progress', 'pointer', 'axisTick', 'axisLabel', 'detail', 'data'];

      const { customTarget } = this.options.style.echart;

      const options = merge({}, omit(gauge, omitArry), {
        name: 'target',
        radius: this.doWithRadius('target'),
        itemStyle: {
          color: customTarget.color,
        },
        progress: {
          // 展示当前进度
          show: true,
          width: 8,
        },
        zlevel: 2,
        axisLine: {
          // 仪表盘轴线相关配置
          show: false,
        },
        pointer: {
          // 指针
          show: false,
        },
        splitLine: {
          // 分割样式
          show: false,
        },
        axisTick: {
          // 刻度样式
          show: false,
        },
        axisLabel: {
          // 刻度标签
          show: false,
        },
        detail: {
          // 数据
          show: false,
        },
        title: {
          show: false,
        },
      });

      options.data = [
        {
          value: targetValue,
        },
      ];

      return options;
    },
    /**
     * @description 处理目标值
     */
    doWithTargetBG(target) {
      const { customTarget } = this.options.style.echart;

      const options = merge({}, omit(target, 'data'), {
        name: 'targetBG', // 目标值背景
        zlevel: 1,
        itemStyle: {
          color: customTarget.backgroundColor,
        },
        data: [
          {
            value: target.max,
          },
        ],
      });

      return options;
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
    doWithOptions(fetchData) {
      // 1. 先构建底层仪表盘
      const gauge = this.doWithGauge(fetchData.current, fetchData.min, fetchData.max);

      // 2. 依赖仪表盘构建目标值
      const target = this.doWithTarget(gauge, fetchData.target);

      // 3. 依赖目标值构建目标值的背景
      const targetBG = this.doWithTargetBG(target);

      const series = fetchData.target ? [gauge, target, targetBG] : [gauge, targetBG];
      const options = {
        series,
      };

      return options;
    },
    updateChartStyle() {
      if (this.dataState === 'empty' || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.chartInstane.setOption(newOptions);
    },
  },
};
</script>
