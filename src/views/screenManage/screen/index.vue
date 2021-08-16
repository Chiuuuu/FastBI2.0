<template>
  <div class="drawing-board-wrapper" :class="drawingBoardClass">
    <div class="drawing-board-app">
      <!-- 头部 start -->
      <DrawingBoardHeader :screenInfo="screenInfo" @changeName="changeName"></DrawingBoardHeader>
      <!-- 头部 end -->

      <!-- 侧边栏 start -->
      <!-- open 是打开 -->
      <DrawingBoardSide></DrawingBoardSide>
      <!-- 侧边栏 end -->

      <!-- 内容编辑区 start -->
      <DrawingBoardContent :components="components" :type="parameter.EDIT"></DrawingBoardContent>
      <!-- 内容编辑区 end -->

      <!-- 内容编辑区工具栏 start -->
      <DrawingBoardPageTools :tabs="tabs" v-model="tabActive" :type="parameter.EDIT"></DrawingBoardPageTools>
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
      screenInfo: {
        // 大屏信息
        name: '',
      },
      tabs: [],
      tabActive: '',
    };
  },
  mounted() {
    const {
      query: { model, id, tabId },
    } = this.$route;
    const funs = {
      add: this.handleAddScreen,
      edit: this.handleEditScreen,
    };

    const fun = funs[model];
    if (!fun) return console.error(`don not has method: ${model}`);

    fun({
      id,
      tabId,
    });
  },
  methods: {
    /**
     * @description 修改大屏名称
     */
    changeName(name) {
      this.screenInfo.name = name;
    },
    /**
     * @description 加载完成后新建大屏
     */
    handleAddScreen({ id, tabId }) {
      this.tabs.push({
        id: tabId,
        name: '页面1',
      });
      this.tabActive = tabId;
      this.getScreenDetailByTabId(id, tabId);
    },
    /**
     * @description 加载完成后编辑大屏
     */
    handleEditScreen({ id, tabId }) {
      this.getScreenTabsById(id, tabId);
    },
    /**
     * @description 获取大屏分页
     */
    async getScreenTabsById(screenId, tabId = '') {
      // 先获取大屏对应的页签信息
      const result = await this.$server.screenManage.getScreenTabs(screenId);
      if (result && result.code === 200) {
        this.tabs = [].concat(result.data.screenTabList);
        this.tabActive = tabId || this.tabs[0].id;
        this.getScreenDetailByTabId(result.data.id, this.tabActive);
      } else {
        result.msg && this.$message.error(result.msg);
      }
    },
    /**
     * @description 获取大屏分页详情
     */
    async getScreenDetailByTabId(screenId, tabId) {
      const result = await this.$store.dispatch('screen/getScreenDetailById', { screenId, tabId });
      if (result) {
        this.screenInfo.name = result.screenName;

        this.$store.commit(boardMutaion.RESETSTATE, {
          components: result.screenGraphs,
          page: result.setting,
        });
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
