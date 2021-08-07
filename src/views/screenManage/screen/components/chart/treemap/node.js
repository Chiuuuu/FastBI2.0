export default class Node {
  constructor(props = null) {
    this.props = props // 自身的属性
    this.name = null // 名称
    this.value = 0 // 当前值
    this.parentValue = 0 // 父级值
    this.children = [] // 子节点
  }
  add(node) {
    this.children.push(node)
  }
  setField(key, value) {
    this[key] = value
  }
  getProps() {
    return this.props
  }
}
