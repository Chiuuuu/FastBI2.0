import dataAccessApi from '../../../api/modules/common'
const state = {
  editType: 'row',
  permissionInfo: {}, // 角色信息
  permissionId: 0, // 选中的菜单id
  parentId: 0, // 文件夹id
  menuList: []
}

const mutations = {
  SET_EDITTYPE(state, type) {
    state.editType = type
  },
  SET_PERMISSIONID(state, id) {
    state.permissionId = id
  },
  SET_PERMISSIONINFO(state, info) {
    state.permissionInfo = info
  },
  SET_PARENTID(state, id) {
    state.parentId = id
  },
  SET_MENULIST(state, list) {
    state.menuList = list
  }
}

const actions = {
  async getMenuList({
    commit
  }, vm) {
    const result = await dataAccessApi.getMenuList('/datasource/catalog/list/1')
    if (result.code === 200) {
      commit('SET_MENULIST', result.rows)
    } else {
      vm.$message.error(result.msg)
    }
  }
}

export default {
  namespaced: true, // 用于在全局引用此文里的方法时标识这一个的文件名
  state,
  mutations,
  actions
}
