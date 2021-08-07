import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'
// 路由数据

import BinUI from 'bin-ui'
import { Modal } from 'ant-design-vue'

import { commonRoutes } from '@/router/routes'
Vue.use(BinUI)

Vue.use(VueRouter)

const whiteList = ['/login']

const createRouter = () => new VueRouter({
  base: process.env.BASE_URL,
  routes: commonRoutes
})

const router = createRouter()

/**
 * @export 重置路由
 */
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

router.beforeEach(async (to, from, next) => {
  BinUI.LoadingBar.start()
  Modal.destroyAll()
  store.dispatch('SingleSelected', null)
  store.commit('common/SET_PRIVILEGES', [])

  const hasToken = store.state.common.adminToken

  if (hasToken) {
    if (to.path === '/login') {
      next()
      BinUI.LoadingBar.done()
    } else {
      const hasRouterPermission = store.state.user.routesModule && store.state.user.routesModule.length > 0
      if (hasRouterPermission) {
        const { redirectedFrom, name } = to
        // 当切换项目重定向找不到的时候再跳转到首页
        if (redirectedFrom && name === '404' && from.path === '/') { // 重刷方法1,但是会闪白
        // if(redirectedFrom && name === '404' && from.path === redirectedFrom) {
          next({ path: '/' })
        } else {
          next()
        }
        BinUI.LoadingBar.done()
      } else {
        try {
          // 获取用户的对应的路由权限
          const { routesModule } = await store.dispatch('user/getInfo')
          // 先在添加之前先清空之前的路由防止重复添加
          resetRouter()
          // 根据路由权限动态设置路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', routesModule)
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch (error) {
          next(`/login?redirect=${to.fullPath}`)
          BinUI.LoadingBar.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      BinUI.LoadingBar.done()
    }
  }
})

router.afterEach(() => {
  BinUI.LoadingBar.done()
})

export default router
