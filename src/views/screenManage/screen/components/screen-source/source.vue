<template>
  <div class="board-image" :style="ImageStyle">
    <img v-if="isValidUrl" :src="handleImgUrl(result.imgUrl)" :alt="result.name" />
    <a-icon v-else type="file-image" />
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
  name: `${BoardType.Source}View`,
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
      isValidUrl: false,
      result: {},
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
    this.getChartData();
  },
  methods: {
    /**
     * @description 处理图片url
     */
    handleImgUrl(url) {
      return process.env.VUE_APP_SERVICE_URL + url;
    },
    /**
     * @description 判断当前的图片url是否能加载
     */
    validImgUrl() {
      const { imgUrl } = this.result;
      if (!imgUrl) return (this.isValidUrl = false);
      const image = new Image();
      image.onload = () => (this.isValidUrl = true);
      image.onerror = () => (this.isValidUrl = false);
      image.src = this.handleImgUrl(imgUrl);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return !data.imgUrl;
    },
    /**
     * @description 图表获取数据
     */
    getChartData() {
      this.isServerData() ? this.getServerData() : this.getDefaultData();
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      this.serverData = {};
      const result = this.doWithData(this.serverData);
      this.result = this.doWithFormatter(result);
      this.validImgUrl();
    },
    doWithData() {},
    /**
     * @description 图表获取默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.result = {
        imgUrl: this.options.data.imgUrl,
        name: this.options.data.name,
      };
      this.validImgUrl();
    },
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
          echart: { background, opacity },
        },
      } = this.options;

      const checkProps = {
        background,
      };

      let style = {
        opacity,
      };

      style = getStyle(style, checkProps, ['width'], ['background']);

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
    height: 100%;
  }
  /deep/ .anticon {
    font-size: 65px;
    color: #fff;
  }
}
</style>
