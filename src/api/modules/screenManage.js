import $axios from '@/axios'

const screenManage = {
  /**
   * @description 文件夹列表
   * @param {Object} params 请求参数
   * @returns
   */
  getFolderList(params) {
    return $axios.get('/screen/catalog/listScreenTree', params)
    // return $axios.get('/screen/folder/list', params)
  },
  /**
   * @description 新增大屏tab页签
   * @param {*} params
   * @returns
   */
  addScreenTab(params) {
    return $axios.post('/screen/bigscreen/addScreenTab', params)
  },
  /**
   * @description 查询大屏tab页签
   * @param {*} params
   * @returns
   */
  getScreenTabs(id) {
    return $axios.get(`/screen/bigscreen/screenTabList/${id}`)
  },
  /**
   * @description 重命名大屏tab页签
   * @param {*} params
   * @returns
   */
  renameScreenTab(params) {
    return $axios.post('/screen/bigscreen/editScreenTab', params)
  },
  /**
   * @description 复制大屏tab页签
   * @param {*} params
   * @returns
   */
  copyScreenTab(params) {
    return $axios.post('/screen/bigscreen/copyScreenTab', params)
  },
  /**
   * @description 删除大屏tab页签
   * @param {*} params
   * @returns
   */
  deleteScreenTab(id) {
    return $axios.get(`/screen/bigscreen/removeScreenTab/${id}`)
  },
  /**
   * @description 调整大屏tab页签顺序
   * @param {*} params
   * @returns
   */
  orderScreenTab(params) {
    return $axios.post(`/screen/bigscreen/updateScreenTabOrder`, params)
  },
  /**
   * @description 获取分享短链接
   * @param {*} params
   * @returns
   */
  getScreenLink(screenId) {
    return $axios.get(`/screen/bigscreen/getShortUrl/${screenId}`)
  },
  /**
   * @description 查看发布信息
   * @param {*} params
   * @returns
   */
  showScreenRelease(screenId) {
    return $axios.get(`/screen/bigscreen/getScreenShare/${screenId}`)
  },
  /**
   * @description 发布大屏
   * @param {*} params
   * @returns
   */
  releaseScreen(params) {
    return $axios.post('/screen/bigscreen/shareScreen', params)
  },
  /**
   * @description 重新发布大屏
   * @param {*} params
   * @returns
   */
  reShareScreen(params) {
    return $axios.post('/screen/bigscreen/reShareScreen', params)
  },
  /**
   * @description 撤销发布大屏
   * @param {*} screenId
   * @returns
   */
  delShareScreen(screenId) {
    return $axios.get(`/screen/bigscreen/removeScreenShare/${screenId}`)
  },
  /**
   * @description 新建大屏
   * @param {*} params
   * @returns
   */
  addScreen(params) {
    return $axios.post('/screen/bigscreen/addScreen', params)
  },
  /**
   * @description 复制大屏
   * @param {*} params
   * @returns
   */
  copyScreen(screenId) {
    return $axios.get(`/screen/bigscreen/copyScreen/${screenId}`)
  },
  /**
   * @description 重命名大屏
   * @param {*} params
   * @returns
   */
  renameScreen(params) {
    return $axios.post('/screen/bigscreen/saveScreen', params)
  },
  /**
   * @description 保存页签设置
   * @param {*} params
   * @returns
   */
  saveScreen(params) {
    return $axios.post('/screen/bigscreen/updateTab', params)
  },
  /**
   * @description 保存图表
   * @param {*} params
   * @returns
   */
  addChart(params) {
    return $axios.post('/screen/graph/addScreenGraph', params)
  },
  /**
   * @description 更新图表
   * @param {*} params
   * @returns
   */
  updateChart(params) {
    return $axios.post('/screen/graph/updateScreenGraph', params)
  },
  /**
   * @description 删除图表
   * @param {*} params
   * @returns
   */
  deleteChart(params) {
    return $axios.post('/screen/graph/delScreenGraph', params)
  },
  /**
   * @description 批量更新图表
   * @param {*} params
   * @returns
   */
  saveAllChart(params) {
    return $axios.post('/screen/graph/updateScreenGraphs', params)
  },
  /**
   * @description 大屏详细信息
   * @param {*} id
   * @param {*} tabId
   * @returns
   */
  getScreenDetailById(id, tabId) {
    return $axios.get(`/screen/bigscreen/${id}/${tabId}`)
    // return $axios.get(`/screen/data/${id}`)
  },
  /**
   * @description 刷新大屏
   * @param {*} params
   * @returns
   */
  actionRefreshScreen(params) {
    return $axios.get(`/screen/bigscreen/refresh`, params)
  },
  /**
   * @description 数据模型目录
   * @returns
   */
  getCatalogList() {
    return $axios.get(`/model/catalog/list/2`)
  },
  /**
   * @description 数据模型--维度、度量列表
   * @param {*} id
   * @returns
   */
  getPivoSchemaList(tableId, screenId) {
    // return $axios.get(`/model/pivotschema/selectModelPivotschemaListByRole/${id}`)
    return $axios.get(
      `/screen/pivotschema/selectModelPivotschemaListByRole/${tableId}/${screenId}`
    )
  },
  /**
   * @description 根据维度度量获取数据
   * @param {*} params
   * @returns
   */
  getData(params) {
    return $axios.post('/screen/graph/getData', params)
  },
  /**
   * @description 数据筛选(联动)
   * @param {*} params
   * @returns
   */
  getDataLink(params) {
    return $axios.post('/screen/graph/dataLink', params)
  },
  /**
   * @description 请求展示用的图表数据(导出/查看数据)
   * @param {*} params
   * @returns
   */
  getGraphInfo(params) {
    return $axios.post('  /screen/graph/graphInfo', params)
  },
  /**
   * @description 根据数据筛选数据列表
   * @param {*} params
   * @returns
   */
  getDataPick(params) {
    return $axios.post('/screen/graph/getLimitData', params)
  },
  /**
   *
   * @description 上传图片
   * @param {*} params
   * @returns
   */
  actionUploadImage(params) {
    return $axios.post('/screen/bigscreen/avatar', params)
  },
  /**
   * @description 保存当前大屏选中的数据模型
   * @param {*} params
   * @returns
   */
  screenModuleSave(params) {
    return $axios.post('/screen/pivotschema/ScreenModuleSave', params)
  },
  /**
   * 数据模型维度度量转换
   */
  screenModuleTransform(params) {
    return $axios.post('/screen/pivotschema/ScreenModuleTransform', params)
  },
  /**
   * 获取创建地理字段数据
   */
  getGeoData(params) {
    return $axios.post('/screen/pivotschema/initGeoInfo', params)
  },
  /**
   *保存创建地理字段
   */
  saveGeoData(params) {
    return $axios.post('/screen/pivotschema/setGeoInfo', params)
  },
  /**
   *获取省市级联数据
   */
  getprovinceListData() {
    return $axios.get('/system/geo/getGeoTreeList')
  },
  /**
   *获取素材库分组
   */
  getMaterialGroupList() {
    return $axios.get('/screen/material/groupList')
  },
  /**
   *获取素材库内容
   */
  getMaterials(params) {
    return $axios.post('/screen/material/picList', params)
  },

  /**
   * 获取图表数据
   */
  getGraphInfo(params) {
    return $axios.post('/screen/graph/graphInfo', params)
  }
}

export default screenManage
