export default class PositionCommand {
  constructor(receiver, { method, index }) {
    this.receiver = receiver
    this.method = method
    this.index = index
  }
  moveup() {
    const item = this.receiver.components
      .splice(this.index + 1, 1, this.receiver.components[this.index])
      .pop()
    this.receiver.components.splice(this.index, 1, item)
  }
  movedown() {
    const item = this.receiver.components
      .splice(this.index - 1, 1, this.receiver.components[this.index])
      .pop()
    this.receiver.components.splice(this.index, 1, item)
  }
  execute() {
    if (
      this.method === 'top' &&
      this.index !== this.receiver.components.length - 1
    ) {
      this.receiver.components.push(this.receiver.components[this.index])
      this.receiver.components.splice(this.index, 1)
    } else if (this.method === 'bottom' && this.index !== 0) {
      this.receiver.components.unshift(this.receiver.components[this.index])
      this.receiver.components.splice(this.index + 1, 1)
    } else if (
      this.method === 'up' &&
      this.index !== this.receiver.components.length - 1
    ) {
      this.moveup()
    } else if (this.method === 'down' && this.index !== 0) {
      this.movedown()
    }
  }
  undo() {
    if (
      this.method === 'top' &&
      this.index !== this.receiver.components.length - 1
    ) {
      const item = this.receiver.components.pop()
      this.receiver.components.splice(this.index, 0, item)
    } else if (this.method === 'bottom' && this.index !== 0) {
      const item = this.receiver.components.shift()
      this.receiver.components.splice(this.index, 0, item)
    } else if (
      this.method === 'up' &&
      this.index !== this.receiver.components.length - 1
    ) {
      this.moveup()
    } else if (this.method === 'down' && this.index !== 0) {
      this.movedown()
    }
  }
}
