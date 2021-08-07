import $axios from '@/axios'
export default {
  /** ---------------------------------------素材分类------------------------------------------------------------------ */
  /**
   * @description 获取素材库分类
   * @returns
   */
  getMaterialCategoryList() {
    return $axios.get('/screen/material/groupList')
  },
  /**
   * @description 添加素材分类
   * @param {Object} [params={}] 请求参数
   * @param {string} params.name 素材名称
   * @returns
   */
  addCategory(params = {}) {
    return $axios.post(`/screen/material/addGroup`, params)
  },
  /**
   * @description 修改素材分类
   * @param {Object} [params={}] 请求参数
   * @param {string} params.id 素材id
   * @param {string} params.name 素材名称
   * @returns
   */
  updateCategory(params = {}) {
    return $axios.post(`/screen/material/renameGroup`, params)
  },
  /**
   * @description 获取素材库分类
   * @param {string} id 素材id
   * @returns
   */
  deleCategory(id) {
    return $axios.get('screen/material/delGroup/' + id)
  },
  /** ---------------------------------------素材分类end------------------------------------------------------------------ */

  /** ---------------------------------------素材------------------------------------------------------------------------ */
  /**
   * @description 过去当前分类下的素材列表
   * @param {Object} [params={}] 请求参数
   * @param {string} params.id 分类id
   * @param {string} params.current 当前页
   * @param {string} params.pageSize 页数
   * @returns
   */
  getMaterialList(params = {}) {
    return $axios.post(`/screen/material/picList`, params)
  },
  /**
   * @description 新增素材
   * @param {Object} [data={}] 请求参数
   * @param {string} data.parentId 素材分类id
   * @param {string} data.file 文件(图片)
   * @returns
   */
  addMaterial(data = {}) {
    return $axios({
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      url: '/screen/material/upload',
      data
    })
  },
  /**
   * @description 重命名素材
   * @param {Object} [params={}] 请求参数
   * @param {string} params.id 素材id
   * @param {string} params.parentId 分类id
   * @param {string} params.name 素材名称
   * @returns
   */
   updateMaterial(params = {}) {
    return $axios.post(`/screen/material/renamePic`, params)
  },
  /**
   * @description 移动素材
   * @param {Object} [params={}] 请求参数
   * @param {string} params.id 素材id
   * @param {string} params.parentId 新分类id
   * @param {string} params.oldGroupId 当前分类id
   * @param {string} params.name 素材名称
   * @returns
   */
   actionMoveMaterial(params = {}) {
    return $axios.post(`/screen/material/movePic`, params)
  },
  /**
   * @description 删除素材
   * @param {Object} [params={}] 请求参数
   * @param {string} params.id 素材id
   * @param {string} params.parentId 分类id
   * @param {string} params.name 素材名称
   * @returns
   */
   deleMaterial(params = {}) {
    return $axios.post(`/screen/material/delPic`, params)
  }
  /** ---------------------------------------素材end---------------------------------------------------------------------- */
}
