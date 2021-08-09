import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import BaseCommand from './base';
export default class StyleCommand extends BaseCommand {
  /**
   * Creates an instance of StyleCommand.
   * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
   * @param {*} receiver
   * @param {boolean} isPage 是否是页面设置
   * @param {object} style 样式属性
   * @param {object} store 整个store
   * @memberof StyleCommand
   */
  constructor(receiver, { isPage, style, store, beforeExecute, afterExecute }) {
    super(receiver, { store, beforeExecute, afterExecute });
    this.isPage = isPage || false;
    this.oldStyle = this.isPage ? cloneDeep(this.receiver) : cloneDeep(this.receiver.setting.style);
    this.newStyle = style;
  }
  executeFun() {
    // 由于 JavaScript 的限制，Vue 不能检测数组和对象的变化，因此使用深拷贝
    this.receiver.setting.style = cloneDeep(merge(this.receiver.setting.style, this.newStyle));
    this.setCurCom();
  }
  undoFun() {
    this.receiver.setting.style = cloneDeep(merge(this.receiver.setting.style, this.oldStyle));
    this.setCurCom();
  }
  execute() {
    if (this.isPage) {
      this.receiver = merge(this.receiver, this.newStyle);
    } else {
      if (this.beforeExecute && isFunction(this.beforeExecute)) {
        this.beforeExecute();
      }
      this.executeFun();
      if (this.afterExecute && isFunction(this.afterExecute)) {
        this.afterExecute();
      }
    }
  }
  undo() {
    if (this.isPage) {
      this.receiver = merge(this.receiver, this.oldStyle);
    } else {
      if (this.beforeExecute && isFunction(this.beforeExecute)) {
        this.beforeExecute();
      }
      this.undoFun();
      if (this.afterExecute && isFunction(this.afterExecute)) {
        this.afterExecute();
      }
    }
  }
}
