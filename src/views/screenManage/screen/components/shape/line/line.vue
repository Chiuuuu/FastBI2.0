<template>
  <div class="shape-line" :style="lineStyle" ref="js-shape-line"></div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import { getStyle } from '@/utils';
import { mapState } from 'vuex';
/**
 * @description 形状-直线图
 */
export default {
  name: `${BoardType.ShapeLine}View`,
  props: {
    options: {
      // 配置项信息
      type: [Object, String],
      default: '',
    },
  },
  data() {
    return {
      lineStyle: {},
    };
  },
  computed: {
    ...mapState({
      // 当前组件状态
      currentComState: state => state.board.currentComState,
    }),
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
          });
        }
      },
    },
  },
  mounted() {
    this.initChart();
  },
  methods: {
    /**
     * @description 初始化
     */
    initChart() {
      const style = this.doWithOptions();
      this.lineStyle = Object.assign({}, style);
    },
    doWithOptions() {
      const {
        style: {
          size,
          echart: { border, opacity, boxShadow },
        },
      } = this.options;

      const checkProps = {
        border,
      };

      let style = {
        opacity,
        boxShadow,
      };

      style = getStyle(style, checkProps, [], ['border']);

      style.borderWidth = `${size.height}px 0 0 0`;
      return style;
    },
    updateChartStyle() {
      this.initChart();
      console.log(this.$refs['js-shape-line'].getBoundingClientRect());
    },
  },
};
</script>
<style lang="less" scoped>
.shape-line {
  height: 100%;
  width: 100%;
}
</style>
