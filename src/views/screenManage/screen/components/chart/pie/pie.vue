<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import { mutationTypes as boardMutation } from '@/store/modules/board';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 饼图
 */
export default {
  name: `${BoardType.ChartPie}View`,
  extends: BaseChart,
  data() {
    return {
      currentIndex: null, // 图表联动选中的下标
    };
  },
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
    doWithRoseType(customRoseType) {
      const { show, type } = customRoseType;
      return {
        show,
        type,
      };
    },
    /**
     * @description 扇形个数限制
     */
    doWithLimit(data, customLimit) {
      return data.slice(0, customLimit);
    },
    /**
     * @description 处理图例
     */
    doWithlegend(series) {
      return series.map(item => item.name);
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

      const data = this.doWithLimit(fetchData.data, echart.customLimit);
      const legend = this.doWithlegend(data);
      const roseType = this.doWithRoseType(echart.customRoseType);
      const radius = this.doWithRadius(echart.customInRadius, echart.customOutRadius);
      const center = this.doWithCenter(echart.customCenter);
      const seriesData = { ...omit(echart.customSeries, []) };

      const options = merge({}, echart, {
        legend: {
          data: legend,
        },
        tooltip: {
          formatter: param => this.dowithFormatterToolTip(param),
        },
        series: [
          {
            type: 'pie',
            roseType: roseType.show ? roseType.type : false,
            radius,
            center,
            data: data,
            ...seriesData,
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
      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customLimit: defaultData.data.length,
          },
        },
        updateCom: this.shapeUnit.component,
      });
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { dimensions, measures },
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
          ...omit(this.options.data, ['expands']),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code !== 200) {
        if (res.code === 1054) {
          const keys = ['dimensions', 'measures', 'filter', 'sort'];
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
      // 截取前50条数据展示
      if (this.isEditMode && datas.length >= 50) {
        datas.length = 50;
        const title = this.options.style.title.text;
        this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
      }
      const data = datas.map(row => {
        return {
          name: row[dimensions[0].alias],
          value: row[`${measures[0].defaultAggregator}_${measures[0].alias}`],
          origin: row, //原数据，鼠标移入显示内容有用
        };
      });
      this.serverData = { data };

      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            // customLimit: this.serverData.data.length,
          },
        },
        updateCom: this.shapeUnit.component,
      });
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
      if (e.dataIndex === this.currentIndex) {
        // 重置图表
        this.resetChartSelect(options);
        return;
      }
      let self = this;
      // series添加颜色回调函数控制，选中
      const formatterFn = function (params) {
        return params.dataIndex === e.dataIndex
          ? options.color[params.dataIndex]
          : self.hexToRgba(options.color[params.dataIndex], 0.4);
      };
      options.series.forEach(item => {
        item.itemStyle = Object.assign(item.itemStyle, { color: formatterFn });
      });
      this.chartInstane.setOption(options);
      // 记录当前选择数据的index
      this.currentIndex = e.dataIndex;
      setLinkageData(e.name, this.shapeUnit.component);
    },
    /**
     * @description 处理图表点击事件(点击非数据区域重置)
     */
    handleChartClick(params) {
      // 没有选中数据不需要执行重置
      let hasSelected = this.currentIndex || this.currentIndex === 0;
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
      this.currentIndex = '';
    },
  },
};
</script>
