import $axios, {
  requestGet,
  requestPost2,
  requestPut
} from '../api_request'

const screenManage = {
  /**
 * 新建文件夹
 * @param {*} params
 */
  folderAdd(params) {
    return requestPost2('/admin/dev-api/screen/folder', params)
  },
  /**
   * 文件夹列表
   *
   */
  folderList(params) {
    return requestGet('/admin/dev-api/screen/folder/list', params)
  },
  /**
   * 删除文件夹
   */
  folderDel(params) {
    return requestGet('/admin/dev-api/screen/folder/screenDelete', params)
  },
  /**
   * 修改文件夹
   */
  folderput(params) {
    return requestPut('/admin/dev-api/screen/folder', params)
  },
  /**
   * 保存大屏
   * @param {*} params
   */
  screenSave(params) {
    return requestPost2('/admin/dev-api/screen/data/save', params)
  },
  /**
   * 大屏详细信息
   * @param {*} id
   */
  screenData(id) {
    return requestGet(`/admin/dev-api/screen/data/${id}`)
  },
  /**
   * 刷新大屏
   * @param {*} params
   */
  screenRefresh(params) {
    return requestGet(`/admin/dev-api/screen/data/refresh`, params)
  },
  /**
   * 数据模型目录
   */
  catalogList() {
    return requestGet(`/admin/dev-api/datamodel/catalog/list`)
  },
  /**
   * 数据模型--维度、度量列表
   */
  getPivoSchemaList(id) {
    return requestGet(`/admin/dev-api/datamodel/pivotschema/getPivoSchemaList/${id}`)
  },
  /**
   * 根据维度度量获取数据
   */
  getData(params) {
    return requestPost2('/admin/dev-api/screen/graph/getData', params)
  },

  /**
   * 上传图片
   * @param {*} params
   */
  uploadImage(params) {
    return requestPost2('/admin/dev-api/screen/data/avatar', params)
  }
}

export default screenManage
