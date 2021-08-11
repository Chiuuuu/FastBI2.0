<template>
  <div class="drawing-board-wrapper" :class="drawingBoardClass">
    <div class="drawing-board-app">
      <!-- 头部 start -->
      <DrawingBoardHeader></DrawingBoardHeader>
      <!-- 头部 end -->

      <!-- 侧边栏 start -->
      <!-- open 是打开 -->
      <DrawingBoardSide></DrawingBoardSide>
      <!-- 侧边栏 end -->

      <!-- 内容编辑区 start -->
      <DrawingBoardContent :components="components" :type="parameter.EDIT"></DrawingBoardContent>
      <!-- 内容编辑区 end -->

      <!-- 内容编辑区工具栏 start -->
      <DrawingBoardPageTools :tabs="tabs" v-model="tabActive"></DrawingBoardPageTools>
      <!-- 内容编辑区工具栏 end-->

      <!-- 配置设置栏 start -->
      <DrawingBoardSetting></DrawingBoardSetting>
      <!-- 配置设置栏 end -->
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import DrawingBoardHeader from './container/drawing-board-header';
import DrawingBoardSide from './container/drawing-board-side';
import DrawingBoardContent from './container/drawing-board-content';
import DrawingBoardPageTools from './container/drawing-board-page-tools';
import DrawingBoardSetting from './container/drawing-board-setting';
import { Loading } from 'element-ui';

/**
 * @description 编辑大屏
 */
export default {
  name: 'EditorScreen',
  components: {
    DrawingBoardHeader,
    DrawingBoardSide,
    DrawingBoardContent,
    DrawingBoardPageTools,
    DrawingBoardSetting,
  },
  computed: {
    ...mapState({
      // 组件列表
      components: state => state.board.components,
    }),
    drawingBoardClass() {
      if (this.$store.state.board.model === this.parameter.EDIT) {
        return 'drawing-board-editor';
      } else {
        return 'drawing-board-preview';
      }
    },
  },
  data() {
    return {
      parameter,
      tabs: [],
      tabActive: '',
    };
  },
  mounted() {
    // 1. 根据大屏id去获取tab的id
    // 2. 初始化为编辑模式
    this.$store.commit(boardMutaion.RESETSTATE);
    this.initEdit();
    this.$store.commit('SET_SCREEN_ID', this.$route.query.id);
    // // 初始化为编辑模式
    // this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
    //   model: this.parameter.EDIT,
    // });
  },
  methods: {
    initEdit() {
      const screenId = this.$route.query.id;
      if (!screenId) return;
      this.getScreenTabsById(screenId);
    },
    /**
     * @description 获取大屏分页
     */
    async getScreenTabsById(screenId) {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage'),
      });
      // 先获取大屏对应的页签信息
      const result = await this.$server.screenManage.getScreenTabs(screenId);
      if (result && result.code === 200) {
        this.tabs = [].concat(result.rows);
        this.tabActive = result.rows[0].id;
        this.getScreenDetailByTabId(screenId, this.tabActive);
      } else {
        result.msg && this.$message.error(result.msg);
      }
      loadingInstance.close();
    },
    /**
     * @description 获取大屏分页详情
     */
    async getScreenDetailByTabId(screenId, tabId) {
      const result = await this.$server.screenManage.getScreenDetailById(screenId, tabId);
      if (result && result.code === 200) {
        this.$store.commit('common/SET_PRIVILEGES', result.data.privileges || []);
      } else {
        this.$message.error(result.msg);
      }
    },
  },
};
</script>
<style lang="less">
@import url('../../../assets/styles/screen.less');
@import url('../../../assets/less/common/variables.less');
.@{board}-wrapper {
  position: relative;
  min-width: 1000px;
  width: 100%;
  height: 100vh;

  color: black;
  font-family: sans-serif;
  overflow: hidden;

  ol,
  ul,
  dl {
    padding: 0;
    margin: 0;
  }

  &.@{board}-editor {
    user-select: none;
  }
  .@{board}-app {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
  }
  .@{board}-header,
  .@{board}-content,
  .@{board}-side,
  .@{board}-page-tools,
  .@{board}-setting {
    position: absolute;
  }
  .@{board}-side ~ .@{board}-content,
  .@{board}-side ~ .@{board}-page-tools {
    left: 48px;
  }
  .@{board}-side.open ~ .@{board}-content,
  .@{board}-side.open ~ .@{board}-page-tools {
    left: 200px;
  }
}
</style>
