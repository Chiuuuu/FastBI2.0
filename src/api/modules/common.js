import $axios from '@/axios'

export default {
  /**
   * @description 新增文件夹
   * @param {Object} params 请求参数
   * @param {string} params.name 名称
   * @returns
   */
  addMenuFolder(url, params) {
    return $axios.post(url, params)
  },
  /**
   * @description 根据id删除菜单
   * @param {String} url 请求地址
   * @returns
   */
  deleMenuById(url) {
    return $axios.get(url)
  },
  /**
   * @description 修改文件夹(重命名, 移动)
   * @param {Object} params 请求参数
   * @param {string} params.name 名称
   * @param {string} params.parentId 父节点id
   * @returns
   */
  putMenuFolderName(url, params) {
    return $axios.post(url, params)
  },
  /**
   * @description 删除文件夹
   * @param {string} url 请求地址
   * @param {Object} params 请求参数
   */
  deleMenuFolder(url, params) {
    return $axios.get(url, params)
  },
  /**
   * @description 获取左侧菜单
   * @param {String} url 请求地址
   * @returns
   */
  getMenuList(url) {
    return $axios.get(url)
  },
  /**
   * @description 根据菜单id获取对应详细信息
   * @param {String} url 请求地址
   * @param {String | Number} id 菜单id
   * @returns {Object} 详细信息
   */
  getDetailByMenuId(url) {
    return $axios.get(url)
  }
}
