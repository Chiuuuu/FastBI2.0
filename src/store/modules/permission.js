import { commonRoutes, asyncRoutes } from '@/router/routes'
import { getRenderRouter } from '@/utils/permission'

/**
 * 通过meta.permissions判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  // 优先判断是否有全部权限
  if (roles.some(role => role === 0)) {
    return true
  }

  // 再根据实际判断权限
  if (route.meta && route.meta.permissions) {
    return roles.some(role => route.meta.permissions.includes(role))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = commonRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise((resolve, reject) => {
      let accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      const { routes, children } = getRenderRouter(accessedRoutes)
      if (children && children.length > 0) {
        setRedirect(routes)
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      } else {
        reject(new Error('菜单不存在'))
      }
    })
  }
}

/**
 * @description 设置重定向
 * @param {Object} routes 路由对象
 * @param {String} parent 父级重定向路由
 * @returns
 */
function setRedirect(routes, parent) {
  const { children } = routes
  if (children && children.length) {
    if (routes.path === '/') {
      routes['redirect'] = `${children[0].path}`
    } else {
      routes['redirect'] = `${parent}/${children[0].path}`
    }
    setRedirect(children[0], routes['redirect'])
  }
  return routes
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
