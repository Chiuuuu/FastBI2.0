<template>
  <div class="board-image" :style="ImageStyle">
    <img :src="imageUrl" alt="" v-if="imageUrl" />
    <a-icon type="file-image" v-else />
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import { getStyle } from '@/utils';
import { mapState } from 'vuex';
/**
 * @description 形状-图片
 */
export default {
  name: `${BoardType.Image}View`,
  props: {
    options: {
      // 配置项信息
      type: [Object, String],
      default: '',
    },
  },
  data() {
    return {
      ImageStyle: {},
      imageUrl: '',
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
      this.ImageStyle = Object.assign({}, style);
    },
    /**
     * @description 整合配置
     */
    doWithOptions() {
      const {
        style: {
          echart: { background, border, opacity, customImageUrl },
        },
      } = this.options;

      const checkProps = {
        background,
        border,
      };

      let style = {
        opacity,
      };

      style = getStyle(style, checkProps, ['width', 'radius'], ['background', 'border']);
      this.imageUrl = customImageUrl;

      return style;
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      this.initChart();
    },
  },
};
</script>
<style lang="less" scoped>
.board-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    display: inline-block;
    width: 100%;
  }
  /deep/ .anticon {
    font-size: 65px;
    color: #fff;
  }
}
</style>
