<template>
  <div class="board-chart-unit-wrapper">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit" :style="chartStyle" ref="js-board-chart-unit"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex';

/**
 * @description chart的公共组件
 */
export default {
  name: 'BaseChart',
  data() {
    return {
      chartInstane: null, // 图表实例
      serverData: null, // 服务端数据
    };
  },
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
    }),
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
  },
};
</script>
