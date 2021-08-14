import { Loading } from 'element-ui';
import { message } from 'ant-design-vue';
import server from '@/api';
const state = {};
const mutations = {};
const actions = {
  getScreenDetailById(state, { screenId, tabId }) {
    return new Promise(async (resolve, reject) => {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage'),
      });
      // 先获取大屏对应的页签信息
      const result = await server.screenManage
        .getScreenDetailById(screenId, tabId)
        .finally(() => {
          loadingInstance.close();
        })
        .catch(error => {
          reject(error);
        });
      if (result && result.code === 200) {
        resolve(result.data);
      } else {
        message.error(result.msg || '请求错误');
      }
    });
  },
};

export default {
  namespaced: true, // 用于在全局引用此文里的方法时标识这一个的文件名
  state,
  mutations,
  actions,
};
