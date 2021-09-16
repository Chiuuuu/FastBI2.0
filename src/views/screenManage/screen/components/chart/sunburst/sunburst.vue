<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 旭日图
 */
export default {
  name: `${BoardType.ChartSunburst}View`,
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
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...omit(this.options.data, ['expands']),
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code === 500) {
        this.$message.error('isChange');
        return;
      }
      this.isEmpty = res.data && res.data.length ? false : true;
      if (this.isEmpty) {
        return;
      }
      const datas = res.data || [];
      // 截取前50条数据展示
      if (datas.length > 50) {
        datas.length = 50;
        const title = this.options.style.title.text;
        this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
      }
      let valueArr = this.getValueArr(datas, 'value', 'children');

      this.serverData = {
        data: datas,
        maxValue: Math.max(...valueArr),
        minValue: Math.min(...valueArr),
      };
      const options = this.doWithOptions(this.serverData);
      this.updateSaveChart(options);
    },
    /**
     * @description 递归遍历树形json数据，根据属性获取所有节点值
     * @param data 原始Json数据
     * @param key 属性
     * @param subChirld 子节点数组
     */
    getValueArr(data = [], key = 'value', subChirld = 'children') {
      let arr = [];
      data.forEach(item => {
        arr.push(item[key]);
        if (item[subChirld] && item[subChirld].length > 0) {
          arr = arr.concat(this.getValueArr(item[subChirld], key, subChirld));
        }
      });
      return arr;
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.isEmpty = false;
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
    doWithVisualMap(echart, fetchData) {
      return Object.assign({}, echart.visualMap, {
        // 右侧视觉映射组件
        type: 'continuous',
        max: fetchData.maxValue,
        min: fetchData.minValue,
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

      const visualMap = this.doWithVisualMap(echart, fetchData);
      const radius = this.doWithRadius(echart.customInRadius, echart.customOutRadius);
      const center = this.doWithCenter(echart.customCenter);
      const formatter = this.doWithFormatter(echart.customFormatterWay);
      const tooltipFormatter = this.doWithFormatter(echart.customTooltipFormatter);
      const options = merge({}, echart, {
        visualMap,
        tooltip: {
          formatter: `${tooltipFormatter}`,
        },
        series: {
          type: 'sunburst',
          nodeClick: false,
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
      if (this.isEmpty || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const newOptions = this.doWithOptions(this.serverData ? this.serverData : defaultData);
      this.updateSaveChart(newOptions);
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
      // 记录当前选择数据的index
      this.currentDataIndex = e.dataIndex;
      this.currentSeriesIndex = e.seriesIndex;
      setLinkageData(e.name, this.shapeUnit.component);
    },
    /**
     * @description 处理图表点击事件(点击非数据区域重置)
     */
    handleChartClick(params) {
      let hasSelected = this.currentDataIndex || this.currentDataIndex === 0;
      // 没有选中数据不需要执行重置
      if (typeof params.target === 'undefined' && hasSelected) {
        // 重置图表
        const options = this.chartInstane.getOption();
        this.resetChartSelect(options);
      }
    },
    /**
     * @description 取消选中
     */
    resetChartSelect(options) {
      // 还原数据
      resetOriginData(this.shapeUnit.component);
      this.chartInstane.clear();
      this.chartInstane.setOption(options);
      this.currentDataIndex = this.currentSeriesIndex = '';
    },
  },
};
</script>
