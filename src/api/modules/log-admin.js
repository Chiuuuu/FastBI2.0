import $axios from '@/axios';
export default {
  /**
   * @description 获取日志列表
   * @param {Object} [params={}] 请求参数
   * @returns
   */
  getOperaLogList(params = {}) {
    return $axios.post(`/system/operaLog/query`, params);
  },
  /**
   * @description 获取项目列表
   */
  getOperaLogProjectList() {
    return $axios.get(`/system/operaLog/projectList`);
  },
};
