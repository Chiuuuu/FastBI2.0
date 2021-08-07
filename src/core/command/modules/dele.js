export default class DeleCommand {
  constructor(receiver, { item, index }) {
    this.receiver = receiver
    this.item = item
    this.index = index
  }
  execute() {
    if (typeof this.index === 'undefined') {
      this.index = this.receiver.findIndex(rec => rec.id === this.item.id)
    }
    this.receiver.splice(this.index, 1)
  }
  undo() {
    if (typeof this.index === 'undefined') {
      this.receiver.push(this.item)
    } else {
      this.receiver.splice(this.index, 0, this.item)
    }
  }
}
