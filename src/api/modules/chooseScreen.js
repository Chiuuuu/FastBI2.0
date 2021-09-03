import $axios from '@/axios';

export default {
  /**
   * @description 选择大屏模版
   * @param {Object} params 请求参数
   * @param {string} params.name 名称
   * @returns
   */
  getScreenTemplates(params) {
    return $axios.get('/bigScreenTemplate/selBigScreenTemplates', params);
  },
  saveScreenData(screenId, parentId) {
    return $axios.get(`/bigScreenTemplate/saveBigScreenData?screenId=${screenId}&parentId=${parentId}`);
  },
};
