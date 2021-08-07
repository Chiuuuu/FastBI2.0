/**
 *创建axios服务实例
 * 为方便起见，为所有支持的请求方法提供了别名
 * @example
  axios.get(url[, config])
  axios.delete(url[, config])
  axios.post(url[, data[, config]])
  axios.put(url[, data[, config]])
  注意
  在使用别名方法时， url、method、data 这些属性都不必在配置中指定。
*/
import axios from 'axios'
import baseURL from '@/api/base'
import store from '@/store'
import router from '@/router'
// import { messages } from 'bin-ui'
import { message } from 'ant-design-vue'

const service = axios.create({
  baseURL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 60000 // 请求超时时间
})

const errorHandle = {
  401: function(msg) {
    // message.error(msg || '未登录状态，跳转登录页')
    store.dispatch('common/set_token', '')
    window.sessionStorage.clear()
    window.localStorage.clear()
    store.commit('user/CLEAR_PERMISSIONS')
    router.replace({
      path: '/login',
      query: {
        redirect: router.currentRoute.fullPath
      }
    })
  },
  403: function(msg) {
    message.error(msg || '没有权限，请联系管理员授权')
  },
  404: function(msg) {
    message.error(msg || '请求资源不存在')
  }
  // 500: function(msg) {
  //   message.error(msg || '请求异常')
  // }
}

// 添加请求拦截器
service.interceptors.request.use(
  function(config) {
    const { adminToken } = store.state.common
    if (adminToken) {
      if (config.url !== '/login') {
        // 判断token是否存在，如果存在则每个请求都带上token
        // Bearer是JWT的认证头部信息
        config.headers.common['Authorization'] = `Bearer ${adminToken}`
      }
    }

    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)

/**
 * respone拦截器
 */
service.interceptors.response.use(
  response => {
    const { code, msg } = response.data
    if (code !== 200) {
      const errorHandleFun = errorHandle[code]
      if (errorHandleFun instanceof Function) {
        errorHandleFun(msg)
        return Promise.reject(msg)
      }
    }

    if (response.headers['content-type'] === 'application/json;charset=UTF-8' && response.config.responseType === 'blob') {
      // 如果是下载xlsx且数据出错的情况
      return {
        code: 500,
        data: response.data
      }
    } else {
      // 正常情况
      return response.data
    }
  },
  error => {
    const { response } = error
    message.error(response && response.data ? (response.data.msg || '请求错误') : '请求错误')
    return Promise.reject(error)
  }
)

export default service
