import cloneDeep from 'lodash/cloneDeep'
import assignIn from 'lodash/assignIn'
import BaseCommand from './base'
export default class DataCommand extends BaseCommand {
  /**
   * Creates an instance of StyleCommand.
   * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
   * @param {*} receiver
   * @param {object} data 数据属性
   * @param {object} store 整个store
   * @memberof StyleCommand
   */
  constructor(receiver, { data, store, beforeExecute, afterExecute }) {
    super(receiver, { store, beforeExecute, afterExecute })
    this.oldData = cloneDeep(this.receiver.setting.data)
    this.newData = data
  }
  executeFun() {
    this.receiver.setting.data = assignIn(
      this.receiver.setting.data,
      this.newData
    )
    this.setCurCom()
  }
  undoFun() {
    this.receiver.setting.data = assignIn(
      this.receiver.setting.data,
      this.oldData
    )
    this.setCurCom()
  }
}
