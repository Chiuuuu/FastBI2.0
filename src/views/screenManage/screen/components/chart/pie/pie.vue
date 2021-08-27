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
    /**
     * @description 处理标签对齐
     */
    doWithLabelLayout(chartInstaneWidth, params) {
      if (this.options.style.echart.customSeries.label.position !== 'outside') return;

      const isLeft = params.labelRect.x < chartInstaneWidth / 2;
      const points = params.labelLinePoints;

      if (!points) return;

      // 更新节点.
      points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
      return {
        labelLinePoints: points,
      };
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
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;

      const data = this.doWithLimit(fetchData.data, echart.customLimit);
      const legend = this.doWithlegend(data);
      const roseType = this.doWithRoseType(echart.customRoseType);

      const label = this.doWithLabel(echart.customSeries.label);

      const seriesData = { ...omit(echart.customSeries, ['label']) };

      const options = merge({}, echart, {
        legend: {
          data: legend,
        },
        series: [
          {
            type: 'pie',
            roseType: roseType.show ? roseType.type : false,
            label: label,
            labelLine: this.doWithLabelLine(),
            labelLayout: this.doWithLabelLayout.bind(this, this.chartInstane.getWidth()),
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
      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customLimit: defaultData.data.length,
          },
        },
        updateCom: this.shapeUnit.component,
      });
      const options = this.doWithOptions(defaultData);
      this.updateSaveChart(options);
    },
    /*
     * 处理图表联动数据
     */
    handleSelectData() {
      //   let res = await screenManage.getDataLink(chart);
      //   if (res.code === 200) {
      // 构造联动选择的数据
      // this.handleData(res.rows)
      //   } else {
      //     message.error(res.msg);
      //   }
      const data = defaultData.data.filter(item => item.name === this.options.data.dataLink[0].value[0]);
      const options = this.doWithOptions({ data });
      this.updateSaveChart(options);
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      console.log('从这里获取服务端数据');
      const {
        data: { dimensions, measures },
      } = this.options;
      const res = await this.$server.common.getData('/screen/getData', {
        id: this.shapeUnit.component.id,
        type: this.shapeUnit.component.type,
        data: this.options.data,
      });
      if (res.code === 500) {
        this.$message.error('isChange');
        return;
      }
      const datas = res.rows;
      const data = datas.map(row => {
        return { name: row[dimensions[0].alias], value: row[measures[0].alias] };
      });
      this.serverData = { data };
      //   this.serverData = {
      //     data: [
      //       { value: 16237, name: '其它' },
      //       { value: 3399, name: '西南' },
      //       { value: 1796, name: '西北' },
      //       { value: 5146, name: '华北' },
      //       { value: 11115, name: '华东' },
      //       { value: 10000, name: '华南' },
      //     ],
      //   };

      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            customLimit: this.serverData.data.length,
          },
        },
        updateCom: this.shapeUnit.component,
      });
    },
    updateChartStyle() {
      if (!this.chartInstane) return;
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
      setLinkageData([e.name], this.shapeUnit.component);
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
