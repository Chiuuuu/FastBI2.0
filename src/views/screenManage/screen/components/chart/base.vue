<template>
  <div class="board-chart-unit-wrapper">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit" :style="chartStyle" ref="js-board-chart-unit" v-show="dataState !== 'empty'"></div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import { parameter } from '@/store/modules/board';

/**
 * @description chart的公共组件
 */
export default {
  name: 'BaseChart',
  data() {
    return {
      parameter,
      chartInstane: null, // 图表实例
      serverData: null, // 服务端数据
      dataState: 'default', //  // 数据状态("empty":数据为空(服务器返回[])|'default':初始化| 'normal':有数据)
      pagination: {
        // 分页参数
        pageSize: 50,
        pageNo: 1,
        rowsNum: 0,
      },
    };
  },
  inject: ['shapeUnit'],
  props: {
    options: {
      // 配置项信息
      type: [Object, String],
      default: '',
    },
  },
  computed: {
    ...mapState({
      // 当前组件状态
      currentComState: state => state.board.currentComState,
      model: state => state.board.model,
      tabId: state => state.app.screenInfo.tabId,
    }),
    ...mapGetters(['polymerizeType']),
    isEditMode() {
      return this.model === this.parameter.EDIT;
    },
    titleStyle() {
      // 标题样式
      const { style } = this.options;
      return {
        color: `${style.title.font.color}`,
        fontSize: `${style.title.font.size}px`,
        textAlign: `${style.title.font.align}`,
        marginBottom: `${style.title.marginBottom}px`,
        fontWeight: `${style.title.font.weight}`,
        fontFamily: `${style.title.font.family}`,
      };
    },
    chartStyle() {
      // 图表样式
      const { style } = this.options;
      if (style.title.show) {
        return {
          height: `calc(100% - ${style.title.marginBottom + 40}px)`,
        };
      } else {
        return {
          height: '100%',
        };
      }
    },
  },
  mounted() {
    this.initChart();
    this.getChartData();
    window.addEventListener('resize', this.screenAdapter);
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
  },
  watch: {
    'options.style': {
      deep: true,
      immediate: false,
      handler(opt) {
        // 1. 状态要是是停止（移动或者缩放情况下不更变）
        // 2. 配置项发生改变
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.updateChartStyle();
            this.screenAdapter();
          });
        }
      },
    },
    'options.data': {
      deep: true,
      immediate: false,
      handler(opt) {
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.getChartData();
          });
        }
      },
    },
    currentComState(newState, oldState) {
      // 如果只是单纯移动位置不需要更新图表
      // 更新图表：state change from zoom to stop
      if (oldState === 'zoom' && newState === 'stop') {
        this.$nextTick(() => {
          this.screenAdapter();
        });
      }
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
      this.screenAdapter();
      this.addClick();
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {},
    /**
     * @description 图表获取数据
     */
    getChartData() {
      this.isServerData() ? this.getServerData() : this.getDefaultData();
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {},
    /**
     * @description 图表获取默认数据
     */
    getDefaultData() {
      this.serverData = null;
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (!this.chartInstane) return;
      const {
        style: { echart },
      } = this.options;
      this.chartInstane.setOption(echart);
    },
    /**
     * @description 更新保存图表配置
     */
    updateSaveChart(options, replaceMerge = ['series']) {
      if (!this.chartInstane) return;
      if (options) {
        this.chartInstane.setOption(options, {
          replaceMerge,
        });
      }
    },
    /**
     * @description 屏幕变化
     */
    screenAdapter() {
      if (!this.chartInstane) return;
      this.chartInstane.resize();
    },
    /**
     * @description 重置图表
     */
    resetChart() {
      if (!this.chartInstane) return;
      this.chartInstane.dispose();
      this.$nextTick(() => {
        this.initChart();
        this.screenAdapter();
      });
    },
    /**
     * @description 处理点击(图表联动)
     */
    addClick() {},
    /**
     * @description 点击时其他数据变透明(图表联动)
     */
    hexToRgba(hex, opacity) {
      return hex && hex.replace(/\s+/g, '').length === 7
        ? `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt('0x' + hex.slice(3, 5))},${parseInt(
            '0x' + hex.slice(5, 7),
          )},${opacity})`
        : '';
    },
    /**
     * @description 获取拖入的维度度量列数据
     * 各个图表文件里重写该方法
     */
    getFieldList() {
      // const { data } = this.options;
      // return [].concat(data.dimensions).concat(data.measures);
    },
    /**
     * @description 处理isChanged标红(约定特殊返回码1054)
     * @description 返回当前模型或源中存在且可见的字段列表, 和图表引用的字段作对比
     */
    handleRedList(list, keys) {
      // 如果存在对应列表id，替换成红色
      if (list) {
        keys.forEach(key => {
          if (key === 'filter') {
            this.options.data[key].fileList.forEach(item => {
              const target = list.find(t => t.pivotschemaId === item.pivotschemaId);
              // 字段不存在or被隐藏
              if (!target) {
                item.IsChanged = true;
              }

              // 维度度量发生改变
              if (target && target.role !== item.role) {
                item.IsChanged = true;
              }
            });
          }
          if (Array.isArray(this.options.data[key])) {
            this.options.data[key].forEach(item => {
              const target = list.find(t => t.pivotschemaId === item.pivotschemaId);
              // 字段不存在or被隐藏
              if (!target) {
                item.IsChanged = true;
              }

              // 维度度量发生改变
              if (target && target.role !== item.role) {
                item.IsChanged = true;
              }
            });
          }
        });
      }
    },
    /**
     * @description 处理表头名字显示
     * @param {*} item 当前列
     */
    formatAggregator(item) {
      const fun = this.polymerizeType.find(x => x.value === item.defaultAggregator);
      if (item.role === 2 && fun) {
        return `${item.alias} (${fun.name})`;
      } else {
        return item.alias;
      }
    },
    /**
     * @description 查看数据 -- 处理表头, 按拖入的维度度量顺序排列
     * @param { array } keys 列名
     * @param { string } mapKey 地图类别(填充 || 标记)
     */
    handleTableColumns(keys, mapKey) {
      let fieldList = this.getFieldList(mapKey);
      // 度量key要加上聚合前缀
      const column = [];
      fieldList.map(item => {
        const alias = item.role === 2 ? `${item.defaultAggregator}_${item.alias}` : item.alias;
        if (keys.includes(alias)) {
          column.push({
            alias: alias,
            colName: this.formatAggregator(item),
            role: item.role,
          });
        }
      });
      return column;
    },
  },
};
</script>
