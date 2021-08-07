import { TokenStream } from './TokenStream'

export class Parse {
  FALSE = {
    type: 'boolean',
    value: false
  }
  PRECEDENCE = {
    '=': 1,
    'OR': 2,
    'AND': 3,
    '<': 7,
    '>': 7,
    '<=': 7,
    '>=': 7,
    '==': 7,
    '!=': 7,
    '+': 10,
    '-': 10,
    '*': 20,
    '/': 20,
    '%': 20
  }
  constructor(tokenStream, dm) {
    this.tokenStream = new TokenStream(tokenStream, true)
    this.pairList = dm || []
    // this.tokenStream = tokenStream;
  }
  isSpace(ch) {
    const tok = this.tokenStream.tokenPeek()
    return tok && tok.type === 'spaces' && (!ch || tok.value === ch) && tok
  }
  skipSpaces(ch) {
    if (this.isSpace(ch)) {
      // 如果匹配成功就跳过
      this.tokenStream.tokenNext()
    } else {
      this.tokenStream.tokenRaiseError(`语法错误: 缺失${ch}`)
    }
  }
  // 特殊字符
  isSpecial(ch) {
    const tok = this.tokenStream.tokenPeek()
    return tok && tok.type === 'special' && (!ch || tok.value === ch) && tok
  }
  // 跳过匹配的特殊的字符，用于闭合
  skipSpecial(ch) {
    if (this.isSpecial(ch)) {
      // 如果匹配成功就跳过
      this.tokenStream.tokenNext()
    } else {
      this.tokenStream.tokenRaiseError(`语法错误: 缺失${ch}`)
    }
  }
  // 未知错误
  unexpected() {
    this.tokenStream.tokenRaiseError(
      'Unexpected token: ' + JSON.stringify(this.tokenStream.tokenPeek())
    )
  }

  parseAST() {
    let prog = []
    while (!this.tokenStream.tokenEof()) {
      prog.push(this.parseExpression())
    }
    return {
      type: 'prog',
      prog
    }
  }

  parseExpression() {
    return this.maybeCall(() => {
      return this.maybeBinary(this.parseAtom(), 0)
    })
  }

  maybeCall(expr) {
    if (expr && expr instanceof Function) {
      expr = expr()
      return this.isSpecial('(') ? this.parseFname(expr) : expr
    } else {
      throw Error(`${expr} is must be function`)
    }
  }

  maybeBinary(left, myPrec) {
    const tok = this.isSpecial()
    if (tok) {
      const hasPrec = this.PRECEDENCE[tok.value]
      if (hasPrec > myPrec) {
        this.tokenStream.tokenNext()
        return this.maybeBinary(
          {
            type: tok.value === '=' ? 'assign' : 'binary',
            operator: tok.value,
            left: left,
            right: this.maybeBinary(this.parseAtom(), hasPrec)
          },
          myPrec
        )
      }
    }
    return left
  }

  parseAtom() {
    return this.maybeCall(() => {
      if (this.isSpecial('(')) {
        this.tokenStream.tokenNext()
        const expr = this.parseExpression()
        this.skipSpecial(')')
        return expr
      }
      if (this.isSpecial('{')) {
        return this.parseProg()
      }

      if (this.isSpecial('IF')) return this.parseIf()

      if (this.isSpecial('-')) return this.parseNegNum()

      let tok = this.tokenStream.tokenNext()

      if (!tok) this.tokenStream.tokenRaiseError('语法错误')

      switch (tok.type) {
        case 'string':
          return this.parseString(tok.value)
        case 'float':
          return this.parseFloat(tok.value)
        case 'dateLit':
          return this.parseDate(tok.value)
        case 'integer':
          return this.parseInteger(tok.value)
        case 'boolean': {
          const bool = tok.value.toLowerCase() === 'true'
          return this.parseBoolean(bool)
        }
        case 'fname':
          return this.parseFname(tok)
        case 'aggregator':
          return this.parseAggregator(tok)
        case 'alias':
          return this.parseAlias(tok)
        case 'letRef':
          return this.parseLetRef(tok.value)
        case 'special':
          return this.parseSepcial(tok)
        case 'tail':
          return this.parseTail(tok.value)
        default:
          return this.unexpected()
      }
    })
  }

  parseProg() {
    const prog = this.delimited('{', '}', '\n', this.parseExpression)
    if (prog.length === 0) return this.FALSE
    if (prog.length === 1) return prog[0]
    return {
      type: 'prog',
      value: prog
    }
  }

  parseIf() {
    this.skipSpecial('IF')
    const cond = this.parseExpression()
    this.skipSpecial('THEN')
    if (!this.tokenStream.tokenPeek()) {
      this.tokenStream.tokenRaiseError(`语法错误: THEN后面缺失参数等`)
    }
    const then = this.parseExpression()
    const result = {
      type: 'if',
      cond,
      then
    }
    if (this.isSpecial('ELSE')) {
      this.tokenStream.tokenNext()
      if (!this.tokenStream.tokenPeek()) {
        this.tokenStream.tokenRaiseError(`语法错误: ELSE后面缺失参数等`)
      }
      result.else = this.parseExpression()
    }
    return result
  }

  doWithNegNum() {
    const result = this.parseAtom()

    return result.type === 'fun'
      ? {
          ...result,
          type: 'neg'
        }
      : {
          ...result,
          type: 'neg',
          value: -result.value
        }
  }
  parseNegNum(skip) {
    if (!skip) {
      this.skipSpecial('-')
    }

    if (this.isSpecial('-')) {
      throw Error('语法错误')
    }

    const parse = this.parseAtom()

    if (parse.type === 'fun') {
      return {
        ...parse,
        isNeg: !parse['isNeg']
      }
    }

    if (parse.type === 'integer') {
      return {
        type: 'neg',
        value: parseInt(`-${parse.value}`)
      }
    }

    if (parse.type === 'float') {
      return {
        type: 'neg',
        value: parseFloat(`-${parse.value}`)
      }
    }

    if (parse.type === 'neg') {
      return {
        type: 'neg',
        value: -parse.value
      }
    }

    if (parse.type === 'alias') {
      parse.specialAlias = true
      return {
        ...parse,
        type: 'neg'
      }
    }

    return parse
  }

  parseString(value) {
    return {
      type: 'string',
      value
    }
  }

  parseFloat(value) {
    return {
      type: 'float',
      value
    }
  }

  parseDate(value) {
    return {
      type: 'dateLit',
      value
    }
  }

  parseInteger(value) {
    return {
      type: 'integer',
      value
    }
  }

  parseBoolean(value) {
    return {
      type: 'boolean',
      value
    }
  }

  parseFname(func) {
    const filterItem = this.tokenStream.FNAME.filter(item => {
      if (func.value.toUpperCase() === item.name) {
        return item
      }
    }).pop()

    if (!filterItem) throw Error(`未知函数: ${func.value}`)

    func = {
      ...func,
      ...filterItem
    }

    return {
      type: 'fun',
      func: func,
      args: this.delimited('(', ')', ',', this.parseExpression, func)
    }
  }

  parseAggregator(func) {
    const filterItem = this.tokenStream.AGGREGATORS.filter(item => {
      if (func.value.toUpperCase() === item.name) {
        return item
      }
    }).pop()

    if (!filterItem) throw Error(`未知聚合: ${func.value}`)

    func = {
      ...func,
      ...filterItem
    }

    return {
      type: 'fun',
      func: func,
      args: this.delimited('(', ')', ',', this.parseExpression, func)
    }
  }

  identifyNum(num) {
    if (parseInt(num) === parseFloat(num)) {
      if ((num + '').indexOf('.') !== -1) {
        return parseFloat(num)
      }
      return parseInt(num)
    }
    if (parseInt(num) < parseFloat(num)) {
      return parseFloat(num)
    }
  }

  parseAlias(token) {
    let matchStr = ''
    if (token.specialAlias) {
      const matchs = token.value.match(/(\[)(.+)(\])/)
      if (matchs) {
        matchStr = matchs[2]
      }
    }

    const item = this.pairList.filter(item => {
      return item.alias === matchStr
    }).pop()

    if (item) {
      return {
        type: 'alias',
        value: item,
        name: matchStr
      }
    }

    // if (alias[token.value] || alias[matchStr]) {
    //   return {
    //     type: 'alias',
    //     value: token.specialAlias
    //       ? this.identifyNum(alias[matchStr])
    //       : this.identifyNum(alias[token.value]),
    //     name: token.specialAlias ? matchStr : token.value
    //   }
    // }

    throw Error(`未知名称: ${token.specialAlias ? matchStr : token.value}`)
  }

  parseLetRef(value) {
    return {
      type: 'letRef',
      value
    }
  }

  parseSepcial(tok) {
    return {
      type: 'special',
      value: tok.value
    }
  }

  parseTail(value) {
    return {
      type: 'tail',
      value
    }
  }
  /**
   * 解析作用域内的
   * @param {*} start 开始解析的字符
   * @param {*} stop 结束解析的字符
   * @param {*} separator 忽略的字符
   * @param {*} parse 解析规则
   * @param {*} func 方法对象
   * @returns
   * @memberof Parse
   */
  delimited(start, stop, separator, parse, func) {
    let args = []
    let first = true
    this.skipSpecial(start)
    while (!this.tokenStream.tokenEof()) {
      if (this.isSpecial(stop)) break
      if (first) {
        first = false
      } else {
        this.skipSpecial(separator)
        if (this.isSpecial(')')) {
          this.tokenStream.tokenRaiseError(`语法错误: 缺失参数`)
          break
        }
      }
      if (this.isSpecial(stop)) break
      args.push(parse.call(this))
    }

    this.skipSpecial(stop)

    if (func && 'got' in func && args.length !== func.got) {
      throw new Error(
        `参数个数错误：方法${func.value}，应该符合${func.got}个参数，而不是${
          args.length
        }个`
      )
    }
    if (func && 'min' in func && args.length < func.min) {
      throw new Error(
        `参数个数错误：方法${func.value}，至少有${func.min}个参数，而不是${
          args.length
        }个`
      )
    }
    if (func && 'max' in func && args.length > func.max) {
      throw new Error(
        `参数个数错误：方法${func.value}，最多有${func.max}个参数，而不是${
          args.length
        }个`
      )
    }

    if (func && func.type === 'aggregator') {
      this.argsValidata(func, args)
    }

    return args
  }

  argsValidata(func, args) {
    args.forEach(arg => {
      if (arg.type === 'fun') {
        if (arg.func.type === 'aggregator') {
          this.tokenStream.tokenRaiseError(
            `聚合粒度错误：方法${func.value},不能用于已聚合`
          )
        }
      }
    })
  }

  limited(start, stop, parse) {
    let args = []
    this.skipSpecial(start)
    while (!this.tokenStream.tokenEof()) {
      if (this.isSpecial(stop)) break
      args.push(parse.call(this))
    }
    this.skipSpecial(stop)
    return args
  }
}
