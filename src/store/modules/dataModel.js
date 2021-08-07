import dataAccessApi from '../../api/modules/common'
const state = {
  parentId: '',
  modelId: -1, // 选中的菜单id
  modelName: '', // 模型名称
  addModelId: -1, // 新建的模型id
  menuList: [],
  databaseId: '', // 数据库id
  datasource: null, // 数据源
  datasourceId: '',
  selectedModelList: [], // 选中的数据模型
  //存储每个屏幕中使用的所有数据模型
}

const mutations = {
  SET_PARENTID(state, id) {
    state.parentId = id
  },
  SET_MODELID(state, id) {
    state.modelId = id
  },
  SET_MODELNAME(state, name) {
    state.modelName = name
  },
  SET_ADD_MODELID(state, id) {
    state.addModelId = id
  },
  SET_DATABASEID(state, id) {
    state.databaseId = id
  },
  SET_MENULIST(state, list) {
    state.menuList = list
  },
  SET_DATASOURCE(state, datasource) {
    state.datasource = datasource
  },
  SET_DATASOURCEID(state, id) {
    state.datasourceId = id
  },
  SET_SELECTEDMODELlIST(state, list) {
    state.selectedModelList = list || []
  }
}

const actions = {
  async getMenuList({ commit }, vm) {
    const result = await dataAccessApi.getMenuList('/model/catalog/list/2')
    if (result.code === 200) {
      commit('SET_MENULIST', result.data)
    } else {
      vm.$message.error(result.msg)
    }
  },
  setParentId({ commit }, id) {
    commit('SET_PARENTID', id)
  },
  setModelId({ commit }, id) {
    commit('SET_MODELID', id)
  },
  setAddModelId({ commit }, id) {
    commit('SET_ADD_MODELID', id)
  },
  setDatabaseId({ commit }, id) {
    commit('SET_DATABASEID', id)
  },
  setDatasource({ commit }, datasource) {
    commit('SET_DATASOURCE', datasource)
  },
  setDatasourceId({ commit }, id) {
    commit('SET_DATASOURCEID', id)
  },
  setSelectedModelList({ commit }, list) {
    commit('SET_SELECTEDMODELlIST', list)
  }
}

export default {
  namespaced: true, // 用于在全局引用此文里的方法时标识这一个的文件名
  state,
  mutations,
  actions
}
