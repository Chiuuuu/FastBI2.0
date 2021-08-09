/**
 * @description 组件列表添加命令
 * @export
 * @class AddCommand
 */
export default class AddCommand {
  constructor(receiver, { item, index }) {
    this.receiver = receiver;
    this.item = item;
    this.index = index;
  }
  execute() {
    if (typeof this.index === 'undefined') {
      this.receiver.components.push(this.item);
    } else {
      this.receiver.components.splice(this.index, 0, this.item);
    }
    this.receiver.currentCom = this.item;
  }
  undo() {
    if (typeof this.index === 'undefined') {
      this.index = this.receiver.components.findIndex(rec => rec.id === this.item.id);
    }
    this.receiver.components.splice(this.index, 1);
    this.receiver.currentCom = null;
  }
}
