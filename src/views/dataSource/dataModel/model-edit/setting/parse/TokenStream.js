import { ChartStream } from './CharStream'
export class TokenStream {
  ASSIGN_REGEX = />=|<=|==|!=/
  PUNC_REGEX = /[(){},:+\-*%^\\/><=]/
  SIMPLE_STRING = /[_a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]/
  KEY_WORDS = [
    'by',
    'in',
    'or',
    'if',
    'asc',
    'not',
    'and',
    'let',
    'then',
    'else',
    'case',
    'when',
    'desc',
    'fixed',
    'along',
    'order',
    'x-axis',
    'y-axis',
    'include',
    'exclude',
    'empty-dimensions',
    'row-dimensions',
    'mark-dimensions',
    'column-dimensions'
  ];
  AGGREGATORS = [
    {
      name: 'SUM',
      got: 1
    },
    {
      name: 'MIN',
      got: 1
    },
    {
      name: 'MAX',
      got: 1
    },
    {
      name: 'COUNT',
      got: 1
    },
    {
      name: 'COUNTD',
      got: 1
    },
    // {
    //   name: 'ATTR',
    //   got: 1
    // },
    {
      name: 'AVG',
      min: 1
    }
  ];
  FNAME = [
    {
      name: 'DATEADD',
      got: 3
    },
    {
      name: 'MINIMUM',
      min: 2
    },
    {
      name: 'ABS', // 绝对值
      got: 1
    },
    {
      name: 'ROUND', // 四舍五入
      max: 2
    },
    // {
    //   name: 'INT', // 向下取整
    //   got: 1
    // },
    // {
    //   name: 'CURRENT_DATE', // 今天日期
    //   got: 0
    // },
    // {
    //   name: 'CURRENT_TIMESTAMP', // 现在时间
    //   got: 0
    // },
    // {
    //   name: 'LENGTH', // 字符串长度
    //   got: 1 // string
    // },
    // {
    //   name: 'AND', // 逻辑与
    //   min: 1
    // },
    // {
    //   name: 'OR', // 逻辑或
    //   min: 1
    // },
    // {
    //   name: 'PMT', // 年金函数PMT(财务)
    //   got: 5 // (Rate: float, Nper: integer, Pv: float | integer, Fv: float | integer, Type: 0 | 1)
    // }
  ]

  constructor(source, skipSpace) {
    this.source = new ChartStream(source)
    this.current = null
    this.skipSpace = skipSpace || false
  }

  isSimpleChar(ch) {
    return this.SIMPLE_STRING.test(ch || '')
  }

  /**
   * 是否为空格
   *
   * @param {*} ch
   * @return {*}
   * @memberof TokenStream
   */
  isSpace(ch) {
    return ' \t\n'.indexOf(ch) >= 0
  }

  /**
   * 是否为字母
   *
   * @param {*} ch
   * @return {*}
   * @memberof TokenStream
   */
  isLetter(ch) {
    return /[a-zA-Z]/.test(ch)
  }

  /**
   * 是否为数字
   *
   * @param {*} ch
   * @return {*}
   * @memberof TokenStream
   */
  isDigit(ch) {
    return /[0-9]/.test(ch)
  }

  isIdChar(ch) {
    return this.isLetter(ch) || this.isDigit(ch) || ch === '_'
  }

  skipComment() {
    this.source.next()
    return this.readNext()
  }

  tokenNext() {
    const tok = this.current
    this.current = null
    return tok || this.readNext()
  }

  tokenPeek() {
    return this.current || (this.current = this.readNext())
  }

  tokenEof() {
    return this.tokenPeek() === null
  }

  tokenRaiseError(msg) {
    this.source.raiseError(msg)
  }

  getTokenArray() {
    let tokens = []
    while (!this.tokenEof()) {
      tokens.push(this.tokenNext())
    }
    return tokens
  }

  /**
   * 截取字符串
   * @param {*} end
   * @memberof Scanner
   */
  lookahead(end) {
    // end = this.source.subscript + parseInt(end);
    end = parseInt(end)
    return this.source.input.substr(this.source.subscript, end)
  }

  /**
   * 匹配获取对应的字符串
   * @param {*} fun
   * @returns
   * @memberof Scanner
   */
  loopMatchWithFun(fun) {
    let str = ''
    if (fun && fun instanceof Function) {
      while (!this.source.eof() && fun.call(this, this.source.peek())) {
        str += this.source.next()
      }
      return str
    } else {
      throw Error(`${fun} is must be function`)
    }
  }

  readNext() {
    if (this.skipSpace) {
      this.loopMatchWithFun(this.isSpace)
    }

    if (this.source.eof()) return null

    let ch = this.source.peek()

    // 空格
    if (!this.skipSpace && this.isSpace(ch)) return this.lexSpaces()

    // if (ch === "$") return this.lexId()

    // 日期
    if (ch === '#') return this.lexDate()

    // 字符串
    if (ch === '"') return this.lexString()

    // 局域
    if (ch === '@') return this.lexLetRef()

    // 数字
    if (this.isDigit(ch)) return this.lexNumber()

    // 字母
    if (this.isLetter(ch)) return this.lexIdentifier()

    // 别名即常量
    if (this.SIMPLE_STRING.test(ch)) return this.lexAliasAny()

    // 有[]的别名常量
    if (ch === '[') return this.lexAliasSquare()

    // 比较标识符
    if (this.ASSIGN_REGEX.test(this.lookahead(2))) {
      const ch = this.lookahead(2)
      this.source.subscript += 2
      return this.lexSpecial(ch)
    }

    // 注释
    if (this.lookahead(2) === '//') {
      return this.lexLineComment()
    }

    if (this.lookahead(2) === '/*') {
      return this.lexSegmentComment('/*')
    }

    if (this.PUNC_REGEX.test(ch)) {
      const ch = this.source.next()
      return this.lexSpecial(ch)
    }

    return this.lexFail()
  }

  // 消除配对[],{},""等成对出现的字符串
  escapeSquare(end) {
    let escaped = false
    let str = ''
    this.source.next()
    while (!this.source.eof()) {
      let ch = this.source.next()
      if (escaped) {
        str += ch
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === end) {
        escaped = true
        break
      } else {
        str += ch
      }
    }
    return {
      str,
      escaped
    }
  }

  /**
   * 配对[],{},""等成对出现的字符串
   * @param {*} end
   * @returns
   * @memberof Scanner
   */
  matchSquare(end) {
    let escaped = false
    let str = ''
    const ch = this.source.next()
    str += ch
    while (!this.source.eof()) {
      let ch = this.source.next()
      if (escaped) {
        str += ch
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === end) {
        str += ch
        escaped = true
        break
      } else {
        str += ch
      }
    }
    return {
      str,
      escaped
    }
  }

  lexSpaces() {
    const spaces = this.loopMatchWithFun(this.isSpace)
    return {
      type: 'spaces',
      value: spaces
    }
  }

  isLeapYear(year) {
    year = parseInt(year)
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)
  }

  lexDate() {
    const { str, escaped } = this.matchSquare('#')
    if (escaped) {
      const subStr = str.substring(1, str.length - 1)
      const matchs = /^ *(\d{4})([-/.])(0?\d|1[0-2])\2(0?\d|[12]\d|3[01])( +(0?\d|1\d|2[0-3]):(0?\d|[1-5]\d):(0?\d|[1-5]\d))? *$/.exec(
        subStr
      )
      if (matchs) {
        let year = matchs[1]
        let month = matchs[3]
        let day = matchs[4]
        const lastDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        if (
          day <= lastDays[month - 1] ||
          (this.isLeapYear(year) &&
            (month === '2' || month === '02') &&
            day === '29')
        ) {
          return {
            type: 'dateLit',
            value: this.skipSpace ? subStr : str
          }
        }
      } else {
        return this.lexFail(str)
      }
    }
    return this.lexFail(str)
  }

  lexString() {
    const { str, escaped } = this.skipSpace
      ? this.escapeSquare('"')
      : this.matchSquare('"')
    if (escaped) {
      return {
        type: 'string',
        value: str
      }
    }
    return this.lexFail(str)
  }

  lexLetRef() {
    const ch = this.source.peek()
    this.source.subscript++
    if (this.isLetter(this.source.peek())) {
      const result = this.loopMatchWithFun(ch => {
        return this.isIdChar(ch)
      })
      return {
        type: 'letRef',
        value: `${ch}${result}`
      }
    }
    return this.lexFail(ch)
  }

  lexNumber() {
    let hasDot = false
    const number = this.loopMatchWithFun(ch => {
      if (ch === '.') {
        if (hasDot) return false
        hasDot = true
        return true
      }
      return this.isDigit(ch)
    })
    if (hasDot) {
      this.source.subscript-- // 注意要取上一个
      if (!this.isDigit(this.source.peek())) {
        return {
          type: 'integer',
          value: this.skipSpace
            ? parseInt(number)
            : number.substring(0, number.length - 1)
        }
      } else {
        this.source.subscript++ // 因为上面取上一个了，所以要把下标移正回去
        return {
          type: 'float',
          value: this.skipSpace ? parseFloat(number) : number
        }
      }
    }
    return {
      type: 'integer',
      value: this.skipSpace ? parseInt(number) : number
    }
  }

  lexIdentifier() {
    const result = this.loopMatchWithFun(ch => {
      return this.isIdChar(ch)
    })

    // 解析boolean类型
    if (result.toLowerCase() === 'true' || result.toLowerCase() === 'false') {
      return this.lexBoolean(result)
    }

    // 解析带-的关键字
    if (this.source.peek() === '-') {
      let index = this.source.subscript
      index++
      let str = ''
      while (
        !(index >= this.source.length) &&
        this.isLetter(this.source.peek(index))
      ) {
        str += this.source.peek(index)
        index++
      }
      const combination = `${result}${this.source.peek()}${str}`
      if (this.KEY_WORDS.some(item => combination.toLowerCase() === item)) {
        this.source.subscript = index
        return this.lexSpecial(combination)
      }
    }

    // 解析关键字
    if (this.KEY_WORDS.some(item => result.toLowerCase() === item)) {
      return this.lexSpecial(result)
    }

    // 解析聚合函数
    if (this.AGGREGATORS.some(item => result.toUpperCase() === item.name)) {
      return this.lexAggregator(result)
    }

    // 解析普通函数,并且函数名称要是字母
    if (this.source.peek() === '(' && this.isLetter(result)) {
      return this.lexFname(result)
    }

    return this.lexFail(result, 'alias')
  }

  lexLineComment() {
    const str = this.loopMatchWithFun(ch => {
      return ch !== '\n'
    })

    if (this.skipSpace) {
      return this.skipComment()
    }
    return {
      type: 'comment',
      value: `${str}`
    }
  }

  lexSegmentComment(prefix) {
    this.source.subscript += 2
    let str = ''
    let isRight = false
    while (!this.source.eof()) {
      const cur = this.source.peek()
      str += cur
      this.source.next()
      if (cur === '*' && this.source.peek() === '/') {
        str += this.source.peek()
        this.source.next()
        isRight = true
        break
      } else {
        isRight = false
      }
    }
    if (this.skipSpace) {
      return this.skipComment()
    }
    return isRight
      ? {
        type: 'comment',
        value: `${prefix}${str}`
      }
      : this.lexFail(`${prefix}${str}`)
  }

  lexBoolean(value) {
    return {
      type: 'boolean',
      value
    }
  }

  lexSpecial(value) {
    return {
      type: 'special',
      value
    }
  }

  lexAggregator(value) {
    return {
      type: 'aggregator',
      value
    }
  }

  lexFname(value) {
    return {
      type: 'fname',
      value
    }
  }

  lexAliasAny() {
    const result = this.loopMatchWithFun(this.isSimpleChar)
    return {
      type: 'alias',
      value: result,
      specialAlias: false
    }
  }

  lexAliasSquare() {
    const { str, escaped } = this.matchSquare(']')
    if (escaped) {
      return {
        type: 'alias',
        value: `${str}`,
        specialAlias: true
      }
    }
    return this.lexFail(str)
  }

  lexFail(str, type = 'tail') {
    if (type && str) {
      return {
        type: type,
        value: str
      }
    } else {
      const result = this.source.input.substr(this.source.subscript)
      this.source.subscript = this.source.input.length
      return {
        type: 'tail',
        value: result
      }
    }
  }
}
