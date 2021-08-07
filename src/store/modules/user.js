import { message } from 'ant-design-vue'
import { getPermissionByTree } from '@/utils/permission'
import router, { resetRouter } from '@/router'
import server from '@/api'

const state = {
    routesModule: [],
    objectModule: '',
    selectProject: '',
    projectList: [],
    sourceType: [],
    roles: [],
    info: ''
}

const mutations = {
  SET_ROUTES_MODULE: (state, roleTree) => {
    state.routesModule = getPermissionByTree(roleTree, 'pages')
  },
  SET_OBJECT_MODULE: (state, roleTree) => {
    state.objectModule = getPermissionByTree(roleTree, 'permissions')
  },
  CLEAR_PERMISSIONS: (state) => {
    state.routesModule = []
    state.objectModule = ''
    state.projectList = []
    state.info = ''
    resetRouter()
  },
  SET_PROJECTLIST: (state, list) => {
    state.projectList = [].concat(list)
  },
  SET_SELECTPROJECT: (state, id) => {
    state.selectProject = id
  },
  SET_INFO: (state, params) => {
    state.info = Object.assign({}, params)
  },
  SET_ROLES: (state, params) => {
    state.roles = [].concat(params)
  },
  SET_SOURCE_TYPE: (state, params) => {
    state.sourceType = [].concat(params)
  }
}

const actions = {
  setRoutesModule({ commit }, roles) {
    return new Promise(resolve => {
      commit('SET_ROUTES_MODULE', roles)
      resolve()
    })
  },
  setObjectModule({ commit }, roles) {
    return new Promise(resolve => {
      commit('SET_OBJECT_MODULE', roles)
      resolve()
    })
  },
  getInfo({ commit, dispatch }) {
    // 获取用户信息同时获取数据源类型权限
    dispatch('getSourceType')
    return new Promise((resolve, reject) => {
      // 根据token获取对应的权限
      server.user.getUserInfo().then(respone => {
        if (respone.code === 200) {
          commit('SET_ROUTES_MODULE', respone)
          commit('SET_OBJECT_MODULE', respone)
          commit('SET_PROJECTLIST', respone.projects)
          commit('SET_SELECTPROJECT', respone.projectId)
          commit('SET_ROLES', respone.roles)
          commit('SET_INFO', respone.user)
          resolve(state)
        } else {
          message.error(respone.msg || '请求错误')
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  getSourceType({ commit }) {
    return new Promise((resolve, reject) => {
      // 根据token获取对应的权限
      server.user.getSourceType().then(respone => {
        if (respone.code === 200) {
          commit('SET_SOURCE_TYPE', respone.data)
        } else {
          message.error(respone.msg || '请求错误')
        }
      }).catch(error => {
        reject(error)
      })
    })
  },
  changeRole({ commit, dispatch }) {
    return new Promise(async resolve => {
      const { routesModule } = await dispatch('getInfo')
      resetRouter()
      const accessRoutes = await dispatch('permission/generateRoutes', routesModule, { root: true })
      router.addRoutes(accessRoutes)
      resolve()
    })
  },
  async reFreshProjectList({ commit }) {
    const result = await server.user.getProjectList()
    if (result.code === 200) {
      commit('SET_PROJECTLIST', result.projects)
      commit('SET_SELECTPROJECT', result.projectId)
    } else {
      message.error(result.msg || '请求错误')
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
