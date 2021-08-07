export class ChartStream {
  /**
   * Creates an instance of ChartStream.
   * @param {*} str 输入的字符串
   * @memberof ClassStream
   */
  constructor(str) {
    this.input = str || ''
    this.subscript = 0 // 下标
    this.row = 1 // 行
    this.col = 0 // 列
  }

  /**
   * 读取下一个字符
   *
   * @memberof ChartStream
   */
  next() {
    const ch = this.input.charAt(this.subscript++)
    if (ch === '\n') {
      // 是否换行
      this.row++
      this.col = 0
    } else {
      this.col++
    }
    return ch
  }

  peek(subscript) {
    return this.input.charAt(subscript || this.subscript)
  }

  eof() {
    return this.peek() === ''
  }

  raiseError(msg) {
    throw new Error(`第${this.row}行:第${this.col}列——${msg}`)
  }
}
