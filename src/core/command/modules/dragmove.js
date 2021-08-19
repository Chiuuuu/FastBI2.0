import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import BaseCommand from './base';
export default class DragMoveCommand extends BaseCommand {
  constructor(receiver, { startStyle, endStyle, store, beforeExecute, afterExecute }) {
    super(receiver, { store, beforeExecute, afterExecute });
    this.oldStyle = startStyle;
    this.newStyle = endStyle;
  }
  customizer(objValue, srcValue) {
    if (isArray(objValue)) {
      return (objValue = srcValue);
    }
  }
  executeFun() {
    this.receiver.setting.style = mergeWith({}, this.receiver.setting.style, this.newStyle, this.customizer);
    this.setCurCom();
  }
  undoFun() {
    this.receiver.setting.style = mergeWith({}, this.receiver.setting.style, this.oldStyle, this.customizer);
    this.setCurCom();
  }
}
