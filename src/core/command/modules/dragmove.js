import merge from 'lodash/merge'
import BaseCommand from './base'
export default class DragMoveCommand extends BaseCommand {
  constructor(
    receiver,
    { startStyle, endStyle, store, beforeExecute, afterExecute }
  ) {
    super(receiver, { store, beforeExecute, afterExecute })
    this.oldStyle = startStyle
    this.newStyle = endStyle
  }
  executeFun() {
    this.receiver.setting.style = merge(
      this.receiver.setting.style,
      this.newStyle
    )
    this.setCurCom()
  }
  undoFun() {
    this.receiver.setting.style = merge(
      this.receiver.setting.style,
      this.oldStyle
    )
    this.setCurCom()
  }
}
