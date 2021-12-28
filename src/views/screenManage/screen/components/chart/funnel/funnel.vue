<template>
  <div class="board-chart-unit-wrapper">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit" :style="chartStyle" ref="js-board-chart-unit"></div>
    <!-- 转化率、到达率 -->
    <div class="board-rate" :style="rateStyle.boardRate">
      <!-- 顶层，展示环节：内容空，无转化率、到达率 -->
      <div class="board-rate-item" :style="rateStyle.boardRateItem"></div>

      <div class="board-rate-item" :style="rateStyle.boardRateItem" v-for="(item, index) in rateList" :key="index">
        <span :style="rateStyle.line"></span>
        <!-- 维度 -->
        <p v-show="dimensionsShow">{{ `${item.dimensions.label}：${item.dimensions.val}` }}</p>
        <!-- 度量 -->
        <p v-show="measuresShow">{{ `${item.measures.label}：${item.measures.val}` }}</p>
        <!-- 转化率 -->
        <p v-show="converseShow">{{ `${item.converse.label}：${item.converse.val}` }}</p>
        <!-- 到达率 -->
        <p v-show="arriveShow">{{ `${item.arrive.label}：${item.arrive.val}` }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../base';
import defaultData from './default-data';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
/**
 * @description 漏斗图
 */
export default {
  name: `${BoardType.ChartFunnel}View`,
  extends: BaseChart,
  data() {
    return {
      currentSeriesIndex: null, // 图表联动选中的下标
      currentDataIndex: null, // 图表联动选中的下标
      rateStyle: {
        boardRate: {},
        boardRateItem: {},
        line: {},
      },
      dataRate: defaultData,
      legendSelected: {},
    };
  },
  computed: {
    // 展示环节聚合
    rateList() {
      const { data } = this.options;
      let rate = cloneDeep(this.dataRate.rate);
      let seriesData = cloneDeep(this.dataRate.data);

      rate.forEach((item, index) => {
        item['dimensions'] = {
          label: this.isServerData() ? data.dimensions[0].alias : '维度',
          val: seriesData[index + 1].name,
        };
        item['measures'] = {
          label: this.isServerData() ? data.measures[0].alias : '度量',
          val: seriesData[index + 1].value,
        };
        item['converse'] = {
          label: '转化率',
          val: item.converse,
        };
        item['arrive'] = {
          label: '到达率',
          val: item.arrive,
        };
      });
      return rate;
    },
    // 展示环节 -- 转化率显示
    converseShow() {
      return this.options.style.echart.customRate.labelContent.includes('converse');
    },
    // 展示环节 -- 到达率显示
    arriveShow() {
      return this.options.style.echart.customRate.labelContent.includes('arrive');
    },
    // 展示环节 -- 维度显示
    dimensionsShow() {
      return this.options.style.echart.customRate.labelContent.includes('name');
    },
    // 展示环节 -- 度量显示
    measuresShow() {
      return this.options.style.echart.customRate.labelContent.includes('value');
    },
  },
  methods: {
    /**
     * @description 初始化Echart图表
     */
    initChart() {
      const dom = this.$refs['js-board-chart-unit'];
      this.chartInstane = this.$echarts.init(dom);
      if (!this.chartInstane) return console.error(`echart init fail`);
      const {
        style: { echart },
      } = this.options;
      this.chartInstane.setOption(echart);
      // 注册图例点击事件, 修改转化率
      this.chartInstane.on('legendselectchanged', params => {
        this.legendSelected = params.selected;
        this.dataRate = this.handleDataRate(this.isServerData() ? this.serverData : defaultData.data);
        this.$nextTick(() => {
          this.dowithRateStyle(this.rateList);
        });
      });
      this.screenAdapter();
      this.addClick();
    },
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
     * @description 根据key处理value值
     * @param {object} item 数据
     * @param {string} key 字段
     * @param {any} value 对应字段值
     */
    doWithKeyValue(item, key, value) {
      item[key] = value;
    },
    /**
     * @description 指标内容显示
     * @param {object} param 当前指标
     * @param {array} rateData 转达率/到达率数据
     * @param {array} way 指标显示选择
     * @param {array} arrange 排列 horizontal水平 vertical垂直
     * 最顶层没有到达率、转化率，即param.dataIndex=0
     */
    doWithFormatter(param = {}, rateData = [], way = [], arrange) {
      const ways = {
        name: param.data['name'],
        value: param.data['value'],
        converse: param.dataIndex === 0 ? '' : rateData[param.dataIndex - 1]['converse'],
        arrive: param.dataIndex === 0 ? '' : rateData[param.dataIndex - 1]['arrive'],
      };
      let formatter = [];
      way.forEach(item => {
        // dataIndex = 0时，为顶层，此层没有到达率、转化率
        if (param.dataIndex !== 0 || (param.dataIndex === 0 && !['converse', 'arrive'].includes(item))) {
          formatter.push(ways[item]);
        }
      });
      return arrange === 'horizontal' ? formatter.join(' ') : formatter.join('\n');
    },
    /**
     * @description 鼠标移入显示
     * @param {object} param 当前区域
     * @param {array} rateData 转达率/到达率数据
     * @param {array} way 鼠标移入显示选择
     * 最顶层没有到达率、转化率，即param.dataIndex=0
     */
    doWithTooltipFormatter(param = {}, rateData = [], way = []) {
      const ways = {
        name: {
          label: this.isServerData() ? this.options.data.dimensions[0].alias : '维度',
          val: param.data['name'],
        },
        value: {
          label: this.isServerData() ? this.options.data.measures[0].alias : '度量',
          val: param.data['value'],
        },
        converse: {
          label: '转化率',
          val: param.dataIndex === 0 ? '' : rateData[param.dataIndex - 1]['converse'],
        },
        arrive: {
          label: '到达率',
          val: param.dataIndex === 0 ? '' : rateData[param.dataIndex - 1]['arrive'],
        },
      };
      let formatter = [];
      way.forEach(item => {
        // dataIndex = 0时，为顶层，此层没有到达率、转化率
        if (param.dataIndex !== 0 || (param.dataIndex === 0 && !['converse', 'arrive'].includes(item))) {
          formatter.push(ways[item]['label'] + '：' + ways[item]['val']);
        }
      });
      return formatter.join('<br />');
    },
    /**
     * @description 数组根据数组对象中的某个属性值进行排序的方法
     * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
     * @param attr 排序的属性 如number属性
     * @param rev true表示升序排列，false降序排序
     */
    sortBy(attr, rev) {
      // 第二个参数没有传递 默认升序排列
      if (rev === undefined) {
        rev = 1;
      } else {
        rev = rev ? 1 : -1;
      }
      return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) {
          return rev * -1;
        }
        if (a > b) {
          return rev * 1;
        }
        return 0;
      };
    },
    /**
     * @description 漏斗图升降序
     * @param {Array} data 数据
     * 数组第一个值和最后一个值作比较，确定漏斗图的升降序
     */
    dowithSeriesFunnelSort(data) {
      if (data[0].value > data[data.length - 1].value) {
        return 'descending'; //降序
      }
      return 'ascending'; //升序
    },
    doWithOptions(fetchData) {
      const {
        style: { echart },
      } = this.options;
      this.dowithRateStyle(this.rateList);
      const seriesData = { ...omit(echart.customSeries, ['label']) };
      const options = merge({}, echart, {
        tooltip: {
          formatter: param => this.doWithTooltipFormatter(param, fetchData.rate, echart.customTooltipFormatter),
        },
        series: {
          name: '',
          type: 'funnel',
          sort: this.dowithSeriesFunnelSort(fetchData.data),
          label: Object.assign({}, echart.customSeries.label, {
            formatter: param =>
              this.doWithFormatter(param, fetchData.rate, echart.customFormatterWay, echart.customLabelArrange),
          }),
          ...seriesData,
          data: fetchData.data,
        },
      });
      return options;
    },
    /**
     * @description 展示环节内容样式配置
     */
    dowithRateStyle(rateList) {
      if (!rateList || rateList.length === 0) return;
      // 计算转化率、到达率、维度、度量最大字符长度
      let rateMaxLen = 0,
        arriveRateMaxLen = 0,
        converseRateMaxLen = 0,
        dimensionsMaxLen = 0,
        measuresMaxLen = 0;
      rateList.forEach(item => {
        rateMaxLen = Math.max(
          rateMaxLen,
          item.dimensions.label.length + item.dimensions.val.length,
          item.measures.label.length + item.measures.val.length,
          item.converse.label.length + item.converse.val.length,
          item.arrive.label.length + item.arrive.val.length,
        );
        dimensionsMaxLen = Math.max(dimensionsMaxLen, item.dimensions.label.length + item.dimensions.val.length);
        measuresMaxLen = Math.max(measuresMaxLen, item.measures.label.length + item.measures.val.length);
        converseRateMaxLen = Math.max(converseRateMaxLen, item.converse.label.length + item.converse.val.length);
        arriveRateMaxLen = Math.max(arriveRateMaxLen, item.arrive.label.length + item.arrive.val.length);
      });

      const {
        style: {
          title,
          echart: { customSeries, customRate },
        },
      } = this.options;
      let boardRate = {
        color: `${customRate.color}`,
        fontSize: `${customRate.fontSize}px`,
        fontWeight: `${customRate.fontWeight}`,
        fontFamily: `${customRate.fontFamily}`,
        [customRate.position]: customRate.position === 'left' ? '40px' : '15px',
        marginTop: `${customSeries.top + title.marginBottom}px`,
        height: `calc(100% - 40px - ${title.marginBottom}px - ${customSeries.top}px - ${customSeries.bottom}px)`,
        display:
          customRate.show && (this.arriveShow || this.converseShow || this.dimensionsShow || this.measuresShow)
            ? 'block'
            : 'none', //是否展示
      };
      let boardRateItem = {
        height: `${100 / (rateList.length + 1)}%`,
      };
      let line = {
        [customRate.position === 'left' ? 'right' : 'left']: customRate.position === 'left' ? '-30px' : '-40px',
      };
      if (customRate.arrange === 'horizontal') {
        //一行的文本字符长度,1为“字段名：值”中的冒号长度
        let len =
          (this.dimensionsShow && dimensionsMaxLen + 1) +
          (this.measuresShow && measuresMaxLen + 1) +
          (this.converseShow && converseRateMaxLen + 1) +
          (this.arriveShow && arriveRateMaxLen + 1);

        let paddingLeft = this.converseShow && this.arriveShow ? 20 : 10; //p标签的padding-left值
        boardRate.width = `${customRate.fontSize * 0.75 * len + paddingLeft}px`;
        boardRateItem.display = `flex`;
        boardRateItem.top = `-${customRate.fontSize * 0.6}px`;
        line.marginTop = `${customRate.fontSize * 0.6 + 2}px`;
      } else {
        let len = rateMaxLen + 1; //一行的文本字符长度,1为“字段名：值”中的冒号长度
        boardRate.width = `${customRate.fontSize * 0.75 * len + 10}px`; // 10为p标签的padding-right值
        boardRateItem.top = `-${customRate.fontSize * 0.6}px`;
        line.marginTop = `${customRate.fontSize * 0.6 + 2}px`;
      }
      this.rateStyle.boardRate = boardRate;
      this.rateStyle.boardRateItem = boardRateItem;
      this.rateStyle.line = line;
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      const {
        data: { measures, sort },
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
      let datas = res.data || [];
      // 截取前50条数据展示
      if (this.isEditMode && datas.length >= 50) {
        datas.length = 50;
        const title = this.options.style.title.text;
        this.$message.error(`图表${title}数据量过大, 已截取前50条展示`);
      }
      // 默认排序为降序
      if (sort.length === 0) {
        datas.sort(this.sortBy(`${measures[0].defaultAggregator}_${measures[0].alias}`, false));
      }
      this.serverData = datas;
      this.dataRate = this.handleDataRate(datas);
      const options = this.doWithOptions(this.dataRate);
      this.updateSaveChart(options);
    },
    /**
     * 处理服务数据格式
     */
    handleDataRate(datas) {
      const {
        data: { dimensions, measures },
      } = this.options;
      const rate = [];
      // 初始数据的key改了这里也要改
      let nameKey = 'name';
      let valueKey = 'value';
      if (this.isServerData() && dimensions[0]) {
        nameKey = dimensions[0].alias;
        valueKey = `${measures[0].defaultAggregator}_${measures[0].alias}`;
      }
      let interval = 1; // legend之间的间隔
      let firstIndex = 0; // 起始legend的位置
      const data = datas.map((row, index) => {
        const result = {
          name: row[nameKey],
          value: row[valueKey],
        };
        const unselectedLegend = row[nameKey] in this.legendSelected && !this.legendSelected[row[nameKey]];
        // 从未隐藏的第一个legend开始计算转化率
        if (index === firstIndex) {
          if (unselectedLegend) {
            firstIndex++;
            return result;
          }
        } else {
          const preRowData = datas[index - interval][valueKey];
          const firstRowData = datas[0][valueKey];
          // 当前legend被隐藏, 间隔+1后跳过
          if (unselectedLegend) {
            interval++;
            return result;
          } else {
            interval = 1;
          }
          rate.push({
            converse: preRowData === 0 ? '100%' : ((row[valueKey] / preRowData) * 100).toFixed(2) + '%',
            arrive: firstRowData === 0 ? '100%' : ((row[valueKey] / firstRowData) * 100).toFixed(2) + '%',
          });
        }
        return result;
      });
      return { data, rate };
    },
    /*
     * 处理默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.isEmpty = 'normal';
      const options = this.doWithOptions(defaultData);
      this.updateSaveChart(options);
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (this.dataState === 'empty' || !this.chartInstane) return;
      // 解决：已拖入维度/度量的图表，退出编辑大屏，再次进入时先显示默认图表数据，之后再显示已拖入的图表数据
      if (this.isServerData() && !this.serverData) {
        return;
      }
      const newOptions = this.doWithOptions(this.serverData ? this.dataRate : defaultData);
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
      let self = this;
      // series添加颜色回调函数控制，选中
      const formatterFn = function (params) {
        return params.dataIndex === e.dataIndex && params.seriesIndex === e.seriesIndex
          ? options.color[params.seriesIndex]
          : self.hexToRgba(options.color[params.seriesIndex], 0.4);
      };
      options.series.forEach(item => {
        item.itemStyle = Object.assign(item.itemStyle, { color: formatterFn });
      });
      this.chartInstane.setOption(options);
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
<style lang="less" scoped>
.board-chart-unit-wrapper {
  position: relative;
}
.board-rate {
  position: absolute;
  top: 40px;
  color: #fff;
}
.board-rate-item {
  position: relative;
  span {
    width: 25px;
    height: 2px;
    background: #fff;
    position: absolute;
  }
  p {
    margin: 0;
    text-align: left;
    padding-right: 10px;
  }
}
</style>
