import { requestPost2, requestGetNoData } from '../api_request'

/**
 * 获取菜单
*/
export function fetchMenuList(options) {
    return requestGetNoData(options.url)
}

/**
 * 修改文件夹名称
*/
export function fetchChangeFolderName(options) {
    return requestPost2(options.url, options.data)
}

/**
 * 文件夹删除
*/
export function fetchFolderDeleteById(options) {
    return requestPost2(options.url, options.data)
}

/**
 * 新增文件夹
*/
export function fetchAddNewFolder(options) {
    return requestPost2(options.url, options.data)
}

/**
 * 删除数据模型
*/
export function fetchDeleteFile(options) {
    return requestGetNoData(options.url)
}

/**
 * 获取具体数据模型信息
*/
export function fetchModelInfoById(options) {
    return requestGetNoData(options.url, options.data)
}

/**
 * 编辑状态，获取左侧表的列表
*/
export function fetchGetTableList(options) {
    return requestGetNoData(options.url)
}

/**
 * 编辑状态，左右间关系
*/
export function fetchGetJoin(options) {
    return requestPost2(options.url, options.data)
}

/**
 * 编辑状态，返回整体信息
*/
export function fetchAllTableInfo(options) {
    return requestPost2(options.url, options.data)
}

/**
 * 进行拖拉更新等操作
*/
export function fetchUpdate(options) {
    return requestPost2(options.url, options.data)
}

/**
 * 新增数据模型的时候
*/
export function fetchCreateModel(options) {
    return requestGetNoData(options.url)
}

/**
 * 保存
*/
export function fetchSaveData(options) {
    return requestPost2(options.url, options.data)
}
