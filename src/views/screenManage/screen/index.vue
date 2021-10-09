<template>
  <div class="drawing-board-wrapper" :class="drawingBoardClass">
    <div class="drawing-board-app">
      <!-- 头部 start -->
      <DrawingBoardHeader @changeName="changeName"></DrawingBoardHeader>
      <!-- 头部 end -->

      <!-- 侧边栏 start -->
      <!-- open 是打开 -->
      <DrawingBoardSide></DrawingBoardSide>
      <!-- 侧边栏 end -->

      <!-- 内容编辑区 start -->
      <DrawingBoardContent ref="boardContent" :components="components" :type="parameter.EDIT"></DrawingBoardContent>
      <!-- 内容编辑区 end -->

      <!-- 内容编辑区工具栏 start -->
      <DrawingBoardPageTools
        ref="pageTools"
        :tabs="tabs"
        :type="parameter.EDIT"
        :value="tabActive"
        @change="handleTabChange"
        @add="handleAddNewTab"
        @delete="handleDeleteTab"
        @copy="handleCopyTab"
        @rename="handleRenameTab"
        @drag="handleTabDrag"
      ></DrawingBoardPageTools>
      <!-- 内容编辑区工具栏 end-->

      <!-- 配置设置栏 start -->
      <DrawingBoardSetting></DrawingBoardSetting>
      <!-- 配置设置栏 end -->
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import isFunction from 'lodash/isFunction';
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
  provide() {
    return {
      screenInstance: this,
    };
  },
  computed: {
    ...mapState({
      // 组件列表
      screenInfo: state => state.app.screenInfo,
      components: state => state.board.components,
      page: state => state.board.page,
      // 当前组件
      currentCom: state => state.board.currentCom,
    }),
    drawingBoardClass() {
      if (this.$store.state.board.model === this.parameter.EDIT) {
        return 'drawing-board-editor';
      } else {
        return 'drawing-board-preview';
      }
    },
    // 被图表引用的图表id集合(只针对当前表)
    beUsedDataIds() {
      let beUsedDataIds = [];
      if (!this.currentCom) {
        return beUsedDataIds;
      }
      const data = this.currentCom.setting.data;
      const keys = Object.keys(data);
      keys.forEach(key => {
        if (Array.isArray(data[key])) {
          const dataIds = data[key].map(data => data.id);
          beUsedDataIds = beUsedDataIds.concat(dataIds);
        }
      });
      return [...new Set(beUsedDataIds)];
    },
  },
  data() {
    return {
      parameter,
      tabs: [],
      tabActive: '',
    };
  },
  watch: {
    $route(to) {
      const {
        query: { id, tabId },
      } = to;
      if (id && tabId) {
        this.getScreenDetailByTabId(id, tabId);
      }
    },
    tabs(newValue) {
      this.$store.dispatch('SetTabs', newValue);
    },
  },
  mounted() {
    this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
      model: this.parameter.EDIT,
    });
    const {
      query: { id, tabId },
    } = this.$route;

    if (id && tabId) {
      this.getScreenInfo({
        id,
        tabId,
      });
    } else {
      console.error(`params is error`);
    }
  },
  methods: {
    /**
     * @description 修改大屏名称
     */
    async changeName(screenName) {
      if (this.screenInfo.screenName === screenName) return;
      this.$store.commit('SET_SCREEN_INFO', {
        ...this.screenInfo,
        screenName,
      });
    },
    /**
     * @description 加载完成后编辑大屏
     */
    getScreenInfo({ id, tabId }) {
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
        this.$store.dispatch('SetTabId', this.tabs[0].id);
        this.getScreenDetailByTabId(result.data.id, tabId || this.tabs[0].id);
        this.$nextTick(() => {
          this.$refs.pageTools && this.$refs.pageTools.handleResize();
        });
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
        this.$store.commit('history/RESETSTATE');

        this.tabActive = tabId || this.tabs[0].id;
        const modelList = result.modelList || [];
        const accessList = result.accessList || [];
        this.handleUpdateScreenInfo({
          ...result,
          modelList,
          accessList,
        });

        this.$store.commit(boardMutaion.RESETSTATE, {
          components: result.screenGraphs,
          page: result.setting,
        });
      }
    },
    async handleSave(callback, errorMsg) {
      // 先保存当前的tab页面再进行切换
      const param = {
        name: this.screenInfo.screenName,
        screenId: this.screenInfo.screenId,
        id: this.screenInfo.tabId,
        graphs: this.components,
        setting: this.page,
      };
      const result = await this.$server.screenManage.saveScreenTab(param);
      if (result && result.code === 200) {
        if (callback && isFunction(callback)) {
          callback(result);
        }
      } else {
        this.$message.error(result.msg || errorMsg);
      }
    },
    /**
     * @description 创建新tab页
     */
    async handleAddNewTab(params, callback) {
      params = {
        ...params,
        screenId: this.screenInfo.screenId,
      };
      const result = await this.$server.screenManage.addScreenTab(params);
      if (result && result.code === 200) {
        // 新增tab成功跳转到新tab
        this.tabs.push({
          id: result.data.tabId,
          name: params.name,
        });
        this.handleTabChange({
          screenId: params.screenId,
          tabId: result.data.tabId,
        });
        if (callback && isFunction(callback)) callback();
      } else {
        this.$message.error(result.msg || '创建页面失败');
      }
    },
    /**
     * @description 切换tab页面
     */
    async handleTabChange(params, needSave = true) {
      if (needSave) {
        // 先保存当前的tab页面再进行切换
        this.handleSave(() => {
          this.$store.dispatch('SetTabId', params.tabId);
          this.$router.push({
            query: {
              id: this.screenInfo.screenId,
              tabId: params.tabId,
            },
          });
        }, '切换失败');
      } else {
        this.$store.dispatch('SetTabId', params.tabId);
        this.$router.push({
          query: {
            id: this.screenInfo.screenId,
            tabId: params.tabId,
          },
        });
      }
    },
    /**
     * @description 拖动tab页面
     */
    async handleTabDrag(params) {
      // 把拖拽的块挤进来
      const newItems = [...this.tabs];
      const src = newItems.indexOf(params.dragItem);
      const dst = newItems.indexOf(params.currentItem);
      newItems.splice(dst, 0, ...newItems.splice(src, 1));
      const result = await this.$server.screenManage.orderScreenTab(newItems);
      if (result && result.code === 200) {
        this.tabs = newItems;
      } else {
        this.$message.error(result.msg || result.message || '拖动失败');
      }
    },
    /**
     * @description 复制tab页面
     */
    async handleCopyTab(params, callback) {
      this.handleSave(async () => {
        const result = await this.$server.screenManage.copyScreenTab({
          ...params,
          screenId: this.screenInfo.screenId,
          id: this.screenInfo.tabId,
          graphs: this.components,
          setting: this.page,
        });
        if (result && result.code === 200) {
          this.tabs.push({
            id: result.data.id,
            name: params.name,
          });
          this.handleTabChange(
            {
              screenId: params.screenId,
              tabId: result.data.id, // TODO:要修改成result.data.tabId
            },
            false,
          );
          if (callback && isFunction(callback)) callback();
        }
      }, '复制失败');
    },
    /**
     * @description 重命名tab页面
     */
    async handleRenameTab(params, callback) {
      const result = await this.$server.screenManage.renameScreenTab({
        ...params,
        screenId: this.screenInfo.screenId,
        id: this.screenInfo.tabId,
      });
      if (result && result.code === 200) {
        if (callback && isFunction(callback)) callback();
      }
    },
    /**
     * @description 删除tab页面
     */
    async handleDeleteTab(params, callback) {
      const { data, index } = params;
      const result = await this.$server.screenManage.deleteScreenTab(data.id);
      if (result && result.code === 200) {
        this.$message.success('删除成功');
        // 如果删除的是当前选中页面
        if (data.id === this.tabActive) {
          // 如果删除的是第一个页则取下一页，否则取上一页
          const data = index === 0 ? this.tabs[1] : this.tabs[index - 1];
          const params = {
            ...data,
            tabId: data.id,
          };
          this.handleTabChange(params, false);
        }
        // 删除的不是选中的直接删除不跳转
        this.tabs.splice(index, 1);
        if (callback && isFunction(callback)) callback();
      } else {
        result.msg && this.$message.error(result.msg);
      }
    },
    /**
     * @description 更新大屏信息
     */
    handleUpdateScreenInfo(data) {
      this.$store.dispatch('SetScreenInfo', {
        ...this.screenInfo,
        ...data,
      });
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
  .@{board}-setting {
    position: absolute;
  }
  .@{board}-page-tools{
    position: absolute;
    &.full-screen{
        position: fixed;
        left: 0;
        right: 0;
        bottom: 8px;
        opacity: 0;
        &:hover{
            opacity: 1;
        }
    }
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
