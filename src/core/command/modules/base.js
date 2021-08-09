import isFunction from 'lodash/isFunction';
import { mutationTypes as boardMutation } from '@/store/modules/board';
export default class BaseCommand {
  constructor(receiver, { store, beforeExecute, afterExecute }) {
    if (typeof store === 'undefined') {
      return console.error(`store is must,but got undefined`);
    }
    this.receiver = receiver;
    this.store = store;
    this.beforeExecute = beforeExecute;
    this.afterExecute = afterExecute;
  }
  executeFun() {}
  undoFun() {}
  setCurCom() {
    this.store.commit(boardMutation.SET_CURCOM, {
      component: this.receiver,
    });
  }
  execute() {
    if (this.beforeExecute && isFunction(this.beforeExecute)) {
      this.beforeExecute();
    }
    this.executeFun();
    if (this.afterExecute && isFunction(this.afterExecute)) {
      this.afterExecute();
    }
  }
  undo() {
    if (this.beforeExecute && isFunction(this.beforeExecute)) {
      this.beforeExecute();
    }
    this.undoFun();
    if (this.afterExecute && isFunction(this.afterExecute)) {
      this.afterExecute();
    }
  }
}
