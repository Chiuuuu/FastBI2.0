import $axios, {
  requestGet,
  requestPost2,
  requestPut
} from '../api_request'

const login = {
  /**
 * 新建文件夹
 * @param {*} params
 */
  login(params) {
    return requestPost2('/admin/dev-api/login', params)
  }
}

export default login
