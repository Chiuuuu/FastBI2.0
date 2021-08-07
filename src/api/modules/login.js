import $axios from '@/axios'

const login = {
  /**
 * 新建文件夹
 * @description 登录
 * @param {Object} params 登录参数
 */
  actionLogin(params) {
    return $axios.post('/login', params)
  }
}

export default login
