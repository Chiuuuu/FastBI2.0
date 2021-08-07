import $axios, {
  requestGet,
  requestPost2,
  requestGetNoData
} from '../api_request'

/**
 *  左边菜单栏
 */
export function fetchMenuList(options) {
  return requestGetNoData(options.url)
}

/**
 * 删除菜单
 */
export function fetchDeleteMenuById(options) {
  return requestGetNoData(options.url)
}

/**
 * 根据id获取对应表单信息
 */
export function fetchTableInfo(options) {
  return requestGetNoData(options.url)
}

/**
 * 读取数据库
 */
export function fetchReadeTable(options) {
  return requestPost2(options.url, options.data)
}

/**
 * 获取具体表字段
*/
export function fetchGetTableField(opions) {
  return requestPost2(opions.url, opions.data)
}

/**
 * 保存数据表
*/
export function fetchWriteTable(options) {
  return requestPost2(options.url, options.data)
}

/**
 * 保存修改具体表字段
*/
export function fetchSaveTableField(options) {
  return requestPost2(options.url, options.data)
}

/**
 * 连接操作
 */
export function fetchConnect(opions) {
  return requestPost2(opions.url, opions.data)
}

/**
 * 获取默认数据库
 */
export function fetchGetDBList(options) {
  return requestGet(options.url, options.data)
}

/**
 * 保存数据表
 */
export function fetchSave(options) {
  return requestPost2(options.url, options.data)
}

/**
 * 全部抽取
*/
export function fetchSaveExtract(options) {
  return requestPost2(options.url, options.data)
}
