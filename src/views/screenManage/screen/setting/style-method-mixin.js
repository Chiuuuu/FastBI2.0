import boardSetting from '@/views/screenManage/screen/setting';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

const StyleMethodMixin = {
  methods: {
    /*
     * 还原默认配置项
     * 1. 先复制一份当前配置
     * 2. 再复制一份当前类型新的配置
     * 3. 重置添加图表功能的配置(在drawing-board-header.vue文件)
     */
    handleClickReset() {
      const component = merge(cloneDeep(this.currentCom), cloneDeep(boardSetting[this.currentCom.type]), {
        id: this.currentCom.id,
        setting: {
          style: {
            title: {
              text: `未命名图表${this.currentCom.id}`,
            },
            position: {
              ...this.currentCom.setting.style.position,
            },
            size: {
              ...this.currentCom.setting.style.size,
            },
          },
        },
      });

      const newStyle = component.setting.style;
      this.handleChange(null, newStyle, true);
    },
    /**
     * 样式改变
     * @param {string} key 字段
     * @param {object} val 字段值
     * @param {boolean} isReset 是否重置
     * @param {function} beforeExecute 执行之前
     * @param {function} afterExecute 执行之后
     */
    handleChange(key, val, isReset = false, beforeExecute, afterExecute) {
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Style',
        target: this.currentCom,
        store: this.$store,
        beforeExecute,
        style: isReset
          ? val
          : {
              [key]: val,
            },
        afterExecute: afterExecute ? afterExecute : () => {},
      });
    },
  },
};

export default StyleMethodMixin;
