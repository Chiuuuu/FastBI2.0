const tokenInfo = JSON.parse(window.localStorage.getItem('tokenInfo'));
const state = {
  globalSpinning: false, // 全局loading框
  globalSpinTip: '', // 全局loading文案
  sidebarUnfold: false, // 侧边栏是否收起(true收起，false展开)
  navMenuActive: '1-1', // 导航菜单高亮
  adminToken: tokenInfo ? tokenInfo.token : '', // token
  username: '',
  privileges: [], // 当前模块权限列表
  menuSelectId: -1,
};

const mutations = {
  // 设置侧边栏展开收起
  set_sidebarUnfold(state, data) {
    state.sidebarUnfold = data;
  },

  // 设置导航菜单高亮
  set_navMenuActive(state, data) {
    state.navMenuActive = data;
  },

  // 设置token
  SET_TOKEN(state, token) {
    state.adminToken = token;
  },

  // 设置用户名
  set_username(state, data) {
    state.username = data;
  },

  // 设置当前模块权限
  SET_PRIVILEGES(state, privileges) {
    state.privileges = privileges;
  },

  // 设置当前模块权限
  SET_MENUSELECTID(state, id) {
    state.menuSelectId = id;
  },

  // 全局loading框
  SET_GLOBALSPINNING(state, paylod) {
    state.globalSpinning = paylod;
    // 关闭时清空提示语
    if (!paylod) {
      state.globalSpinTip = '';
    }
  },

  // 全局loading框文案
  SET_GLOBALSPINTIP(state, tip) {
    state.globalSpinTip = tip;
  },
};

const actions = {
  set_token(state, token) {
    state.commit('SET_TOKEN', token);
    window.localStorage.setItem('tokenInfo', JSON.stringify({ token: token }));
  },
  set_globalSpinTip(state, tip) {
    state.commit('SET_GLOBALSPINTIP', tip);
  },
  /**
   * @description 销毁右键菜单
   */
  destroy_context_menu() {
    const mark = document.querySelector('#js-context-menu-mark');
    if (mark) {
      mark.remove();
    }
    const contextmenu = document.querySelector('#js-context-menu');
    if (contextmenu) {
      contextmenu.remove();
    }
  },
};

export default {
  namespaced: true, // 用于在全局引用此文里的方法时标识这一个的文件名
  state,
  mutations,
  actions,
};
