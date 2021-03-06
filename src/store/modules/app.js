import screenManage from '../../api/modules/screenManage';
import { message } from 'ant-design-vue';
import merge from 'lodash/merge';
import boardSetting from '@/views/screenManage/screen/setting';
import cloneDeep from 'lodash/cloneDeep';
// import { handleRefreshData } from '@/utils/handleRefreshData';
// import { deepClone } from '@/utils/deepClone';

let orginPageSettings = {
  width: 1920,
  height: 1080,
  backgroundColor: '#0d2a42',
  gridStep: 1,
  backgroundSrc: '',
  backgroundType: '1',
  opacity: 1,
  refresh: { frequency: '', isRefresh: false },
};
const app = {
  state: {
    screenInfo: {
      // 当前tab页的所有信息
      screenName: '', // 大屏名称
      screenId: '', // 大屏id
      tabId: '', // 当前tab页id
      tabName: '', // 当前tab页名称
      accessList: [], // 数据接入列表
      modelList: [], // 数据模型列表
      privileges: [], // 大屏权限
      screenGraphs: [], // 大屏图表
      setting: cloneDeep(boardSetting['Page']), // 画布样式配置(背景, 宽高)
      resourceType: '', // 数据类型，文本框请求用
    },
    modelMeasures: [], // 度量列表，文本框插入用，校验保存的图表数据
    modelDimensions: [], // 维度列表，用来校验保存的图表数据
    resourceTypeStr: '', // 数据类型，文本框请求用
    polymerizeType: [
      // 聚合方式及中文映射
      { name: '求和', value: 'SUM' },
      { name: '平均', value: 'AVG' },
      { name: '最大值', value: 'MAX' },
      { name: '最小值', value: 'MIN' },
      { name: '计数', value: 'COUNT' },
      { name: '去重计数', value: 'COUNTD' },
    ],
    // 资源类型
    resourceType: {
      model: 8, // 数据模型
      access: 3, // 数据接入
    },
    tabs: [], // tab页列表
    orginPageSettings,
    pageSettings: orginPageSettings,
    // 状态数据
    canvasRange: 0.65, // 画布缩放
    optionsExpand: true, // 参数面板打开关闭
    modelExpand: true, // 8-14数据模型面板
    coverageExpand: false, // 图层面板打开关闭
    isScreen: false, // 是否全屏
    parentId: '', // 大屏父id
    screenDataModels: [],
    currentPageId: '',
    isPublish: '', // 大屏是否已发布
  },
  mutations: {
    SET_CANVAS_RANGE: (state, val) => {
      state.canvasRange = val;
    },
    SET_OPTIONS_EXPAND: state => {
      state.optionsExpand = !state.optionsExpand;
    },
    SET_MODEL_EXPAND: state => {
      state.modelExpand = !state.modelExpand;
    },
    SET_COVERAGE_EXPAND: state => {
      state.coverageExpand = !state.coverageExpand;
    },
    SET_PAGE_SETTING: (state, setting) => {
      state.screenInfo.setting = merge(state.screenInfo.setting, setting);
    },
    SET_SCREEN_INFO: (state, screenInfo) => {
      state.screenInfo = Object.assign({}, state.screenInfo, screenInfo);
    },
    SET_SCREEN_ID(state, res) {
      state.screenInfo.screenId = res;
    },
    SET_TAB_ID(state, id) {
      state.screenInfo.tabId = id;
    },
    SET_MODEL_MEASURE(state, measures) {
      state.modelMeasures = measures;
    },
    SET_MODEL_DIMENSION(state, dimensions) {
      state.modelDimensions = dimensions;
    },
    SET_RESOURCE_TYPE(state, resourceType) {
      state.resourceTypeStr = resourceType;
    },
    SET_TABS(state, tabs) {
      state.tabs = tabs;
    },
    SET_IS_SCREEN: (state, val) => {
      state.isScreen = val;
    },
    SET_FILE_NAME(state, val) {
      state.fileName = val;
    },
    SET_PARENT_ID(state, id) {
      state.parentId = id;
    },
    SET_IS_PUBLISH(state, isPublish) {
      state.isPublish = isPublish;
    },
  },
  actions: {
    SetCanvasRange: ({ commit }, val) => {
      commit('SET_CANVAS_RANGE', val);
    },
    ToggleOptionsExpand: ({ commit }) => {
      commit('SET_OPTIONS_EXPAND');
    },
    ToggleModelExpand: ({ commit }) => {
      commit('SET_MODEL_EXPAND');
    },
    ToggleCoverageExpand: ({ commit }) => {
      commit('SET_COVERAGE_EXPAND');
    },
    SetScreenInfo: ({ commit }, screenInfo) => {
      commit('SET_SCREEN_INFO', screenInfo);
    },
    SetPageSettings: ({ commit }, setting) => {
      commit('SET_PAGE_SETTING', setting);
    },
    SetIsScreen: ({ commit }, val) => {
      commit('SET_IS_SCREEN', val);
    },
    SetScreenId: ({ commit }, val) => {
      commit('SET_SCREEN_ID', val);
    },
    SetFileName({ commit }, val) {
      commit('SET_FILE_NAME', val);
    },
    SetParentId({ commit }, id) {
      commit('SET_PARENT_ID', id);
    },
    SetTabs({ commit }, tabs) {
      commit('SET_TABS', tabs);
    },
    SetTabId({ commit }, id) {
      commit('SET_TAB_ID', id);
    },
    SetModelMeasures({ commit }, measures) {
      commit('SET_MODEL_MEASURE', measures);
    },
    SetModelDimensions({ commit }, dimensions) {
      commit('SET_MODEL_DIMENSION', dimensions);
    },
    SetResourceType({ commit }, resourceType) {
      commit('SET_RESOURCE_TYPE', resourceType);
    },
    SetIsPublish({ commit }, isPublish) {
      commit('SET_IS_PUBLISH', isPublish);
    },
    // 保存大屏页面设置
    async renameScreenData({ state }, obj) {
      let params = {};
      // 重命名
      if (obj) {
        let { id, name } = obj;
        params.id = id;
        params.newName = name;
      } else {
        params.id = state.screenId;
      }
      return screenManage
        .renameScreen(params)
        .then(res => {
          if (res.code === 200) {
            // res.msg && message.success(res.msg)
            return true;
          }
          res.msg && message.error(res.msg);
        })
        .catch(err => {
          // 需要捕获错误 否则无法传递给commit
          err && message.error(err);
        });
    },
    // 保存页面配置
    async saveScreenData({ rootGetters, state }) {
      let params = {};
      // 普通保存
      // 保存图层排序列表，图层操作，新增，删除顺序会变，所以这三个操作要调这个接口
      //   state.pageSettings.idList = rootGetters.canvasMapIdList // 复制大屏id列表会失效
      params.id = state.currentPageId;
      params.setting = state.pageSettings;
      return screenManage
        .saveScreen(params)
        .then(res => {
          if (res.code === 200) {
            // res.msg && message.success(res.msg)
            // 保存图层顺序
            let charts = rootGetters.canvasMap.concat();
            charts.forEach((item, index) => {
              item.setting.sortIndex = index + 1; // +1方便判断seriesIndex是否存在
            });
            screenManage.saveAllChart(charts);
            return true;
          }
          res.msg && message.error(res.msg);
        })
        .catch(err => {
          // 需要捕获错误 否则无法传递给commit
          err && message.error(err);
        });
    },
    // 获取大屏详情
    async getScreenDetail({ dispatch, commit }, { id, tabId, needRefresh }) {
      return screenManage.getScreenDetailById(id, tabId).then(res => {
        if (res.code === 200) {
          this.screenData = res.data;
          dispatch('SetFileName', res.data ? res.data.name : '');
          dispatch('SetPageSettings', res.data ? res.data.setting : {});
          // 地图加上json
          let graphs = res.data ? res.data.screenGraphs : [];
          //   // 根据id列表对本身顺序进行重排 ----复制大屏会失效
          //   list = list.sort((prev, next) => {
          //     return idList.indexOf(prev.id) - idList.indexOf(next.id)
          //   })
          // 按图层排序
          graphs = graphs.sort((prev, next) => {
            return prev.setting.sortIndex && next.setting.sortIndex
              ? prev.setting.sortIndex - next.setting.sortIndex
              : 0;
          });
          dispatch('InitCanvasMaps', graphs);
          dispatch('dataModel/setSelectedModelList', res.list);
          commit('common/SET_PRIVILEGES', res.data.privileges || []);
          commit('SET_IS_PUBLISH', res.data.isPublish);
          if (needRefresh) {
            return dispatch('refreshScreen', {
              charSeted: false,
              needLoading: false,
            });
          }
          return true;
        }
      });
    },
  },
};

export default app;
