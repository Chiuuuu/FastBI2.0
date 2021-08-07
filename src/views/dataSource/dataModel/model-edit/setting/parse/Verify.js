import { isNumber } from 'lodash'
import { Methods } from './Methods'
export class Verify {
  constructor(type) {
    this.methods = new Methods(type)
  }

  validate(expr) {
    const { type } = expr
    switch (type) {
      // TODO: 暂时不支持日期，先屏蔽
      // case "dateLit":
      case 'string':
      case 'float':
      case 'integer':
      case 'decimal':
      case 'boolean':
      case 'fname':
      case 'aggregator':
      case 'letRef':
      case 'special':
        return expr
      case 'alias': {
        // TODO: 暂时不支持日期，先屏蔽
        if (expr && expr.value && (expr.value.dataType === 'DATE' || expr.value.dataType === 'TIMESTAMP')) {
          throw new Error(`暂不支持日期类型`)
        }
        return expr
      }
      // eslint-disable-next-line no-duplicate-case
      case 'dateLit': {
        throw new Error(`暂不支持日期类型`)
      }
      case 'neg': {
        if (expr.func) {
          expr.type = 'fun'
          const res = this.validate(expr)
          return {
            type: 'neg',
            value: -res
          }
        }
        return expr
      }
      case 'prog': {
        let allRight = false
        expr.prog.forEach(expr => {
          allRight = this.validate(expr)
        })
        if (allRight && expr.prog.length > 1) throw Error(`语法错误`)
        return allRight
      }
      case 'fun': {
        const func = this.validate(expr.func)
        if (func) {
          if (!this.methods[func.value]) {
            throw new Error(`暂无${func.value}函数实现`)
          }
          const result = this.methods[func.value].apply(
            this,
            expr.args.map((arg, index) => {
              if (this.argHasFun(arg)) {
                throw new Error('不支持嵌套函数')
              }
              return this.validateFun(arg, index, func)
            })
          )
          return expr.isNeg ? -result : result
        }
        return func
      }
      case 'binary': {
        // 如果是逻辑判断, 允许两端传入等式
        if (expr.operator === 'AND' || expr.operator === 'OR') {
          if (expr.left.type !== 'assign' && expr.left.type !== 'binary') {
            throw new Error('仅支持逻辑表达式判断')
          } else if (expr.right.type !== 'assign' && expr.right.type !== 'binary') {
            throw new Error('仅支持逻辑表达式判断')
          }
          return this.evaluate(
            expr.operator,
            expr.left.type === 'assign' ? this.validateCaseAssign(expr.left) : this.validate(expr.left),
            expr.right.type === 'assign' ? this.validateCaseAssign(expr.right) : this.validate(expr.right)
          )
        }

        if (expr.left.type === 'fun' && expr.left.func.type === 'aggregator') {
          if (expr.right.type !== 'fun' && expr.right.type !== 'aggregator') {
            throw Error(`聚合粒度错误: 方法 ${expr.operator} 不能应用于 已聚合,未聚合`)
          }
        } else if (expr.right.type === 'fun' && expr.right.func.type === 'aggregator') {
          if (expr.left.type !== 'fun' && expr.left.type !== 'aggregator') {
            throw Error(`聚合粒度错误: 方法 ${expr.operator} 不能应用于 未聚合,已聚合`)
          }
        }
        return this.evaluate(
          expr.operator,
          this.validate(expr.left),
          this.validate(expr.right)
        )
      }
      case 'if': {
        const cond = this.validate(expr.cond)
        if (cond && expr.then && !expr.else) {
          return this.validate(expr.then)
        } else {
          this.validate(expr.then)
        }
        return expr.else ? this.validate(expr.else) : false
      }
      case 'tail':
        throw new Error(`语法错误`)
      default:
        throw new Error('无法解析 ' + expr)
    }
  }

  // 判断参数中是否含有函数
  argHasFun(arg) {
    if (arg.left) {
      return this.argHasFun(arg.left) && this.argHasFun(arg.right)
    } else {
      return arg.type === 'fun'
    }
  }

  // 针对不同的函数作出调整
  validateFun(arg, index, func) {
    switch (func.value) {
      // 财务运算-年金函数
      case 'PMT': {
        const result = this.validate(arg)
        if (index === 0) {
          if (result.type !== 'float' && result.type !== 'integer') {
            throw new Error('Rate仅支持数字类型')
          }
        } else if (index === 1) {
          if (result.type !== 'integer') {
            throw new Error('Nper仅支持整数类型')
          }
        } else if (index === 2) {
          if (result.type !== 'float' && result.type !== 'integer') {
            throw new Error('Pv仅支持数字类型')
          }
        } else if (index === 3) {
          if (result.type !== 'float' && result.type !== 'integer') {
            throw new Error('Fv仅支持数字类型')
          }
        } else if (index === 4) {
          if (result.value !== 0 && result.value !== 1) {
            throw new Error('Type仅支持0或1')
          }
        }
        return {
          type: result.type,
          value: true
        }
      }
      // ROUND四舍五入
      case 'ROUND': {
        if (index === 1 && arg.type !== 'integer') {
          throw new Error('位数仅支持整数类型')
        }
        return this.validate(arg)
      }

      default:
        return this.validate(arg)
    }
  }

  // 暂时仅用于逻辑判断
  validateCaseAssign(expr) {
    if (expr.left.type === 'alias' && expr.left.value.role !== 2) {
      throw Error(`逻辑判断暂不支持维度字段`)
    } else if (expr.right.type === 'alias' && expr.right.value.role !== 2) {
      throw Error(`逻辑判断暂不支持维度字段`)
    }
    const left = this.validate(expr.left)
    const right = this.validate(expr.right)
    // 等式左边
    if (!['integer', 'float', 'decimal', 'neg', 'alias'].includes(left.type) || left.value === false) {
      throw Error(`等式左边表达式结果必须为数字类型`)
    }
    if (left.type === 'alias') {
      const type = left.value.dataType
      if (type !== 'BIGINT' && type !== 'DOUBLE' && type !== 'DECIMAL') {
        throw Error(`等式左边表达式结果必须为数字类型`)
      }
    }
    // 等式右边
    if (!['integer', 'float', 'decimal', 'neg', 'alias'].includes(right.type) || right.value === false) {
      throw Error(`等式右边表达式结果必须为数字类型`)
    }
    if (right.type === 'alias') {
      const type = right.value.dataType
      if (type !== 'BIGINT' && type !== 'DOUBLE' && type !== 'DECIMAL') {
        throw Error(`等式右边表达式结果必须为数字类型`)
      }
    }
    return right
  }

  evaluate(operator, left, right) {
    function num(x) {
      if (typeof x === 'number') {
        return x
      }

      if (isNumber(x.value) && typeof x.value === 'number') {
        return x.value
      } else {
        throw new Error('参数类型错误')
      }
    }

    /**
     * @description 是否整数
     * @param {Object} item
     * @returns
     */
    function isInteger(item) {
      return item.dataType === 'BIGINT'
    }

    /**
     * @description 是否数值
     * @param {Object} item
     * @returns
     */
    function isDecimal(item) {
      return item.dataType === 'DECIMAL'
    }

        /**
     * @description 是否字符串
     * @param {Object} item
     * @returns
     */
    function isString(item) {
      return item.dataType === 'VARCHAR'
    }

    /**
     * @description 转换类型
     * @param {String} type
     * @returns
     */
    function reverseType(type) {
      switch (type) {
        case 'VARCHAR':
          return 'string'
        case 'BIGINT':
          return 'integer'
        case 'DECIMAL':
          return 'decimal'
        case 'DOUBLE':
          return 'float'
        default:
          throw new Error(`不支持的类型`)
      }
    }

    /**
     * @description 转成中文类型
     * @param {String} type
     * @returns
     */
    function reverseCNType(type) {
      switch (type) {
        case 'VARCHAR':
        case 'string':
          return '文本'
        case 'BIGINT':
        case 'integer':
          return '整数'
        case 'DOUBLE':
        case 'float':
          return '小数'
        case 'DECIMAL':
        case 'decimal':
          return '数值'
        case 'TIMESTAMP':
        case 'DATE':
          return '时间'
        default:
          throw new Error(`不支持的类型`)
      }
    }

    /**
     * @description 是否为黑名单，不支持类型
     * @param {Object} item
     * @param {Object} item.dataType 类型
     * @returns
     */
    function isBlackList(item, operator = '+') {
      const list = ['TIMESTAMP', 'DATE']
      if (operator === '+') {
        return list.includes(item.dataType)
      } else {
        list.push('VARCHAR')
        return list.includes(item.dataType)
      }
    }

    /**
     * @description 是否为白名单，支持类型
     * @param {Object} item
     * @param {Object} item.dataType 类型
     * @returns
     */
    function isWhiteList(item, operator = '+') {
      const list = ['VARCHAR', 'DOUBLE', 'BIGINT', 'DECIMAL']
      if (operator === '+') {
        return list.includes(item.dataType)
      } else {
        list.shift()
        return list.includes(item.dataType)
      }
    }

    /**
     * @description 是否为解析树的类型，白名单
     * @param {String} type
     * @returns
     */
    function isOriginalWhiteList(type, operator = '+') {
      const list = ['string', 'integer', 'float', 'decimal', 'neg']
      if (operator === '+') {
        return list.includes(type)
      } else {
        list.shift()
        return list.includes(type)
      }
    }

    let leftType = left.type
    let rightType = right.type

    switch (operator) {
      case '+': {
        if (!leftType || !rightType) {
          throw new Error(`类型缺失`)
        }

        if (leftType === 'dateLit' || rightType === 'dateLit') {
          // TODO: 如果直接是日期则报错,暂时限制
          throw new Error(`暂不支持日期类型`)
        }

        // 如果都是别名，[]
        if (leftType === rightType && leftType === 'alias') {
          if (isBlackList(left.value) || isBlackList(right.value)) {
            // 不支持的类型
            throw new Error(`暂不支持日期类型`)
          } else if (isWhiteList(left.value)) {
            // 能识别的
            if (left.value.dataType === right.value.dataType) {
              // 返回转换后的类型
              return {
                type: reverseType(left.value.dataType),
                value: true
              }
            } else {
              // 如果类型不一样
              if ((isString(left.value) && !isString(right.value)) || (!isString(left.value) && isString(right.value))) {
                throw new Error(`${reverseCNType(left.value.dataType)}不能跟${reverseCNType(right.value.dataType)}相加`)
              } else {
                return {
                  type: 'float',
                  value: true
                }
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        }

        if (leftType === 'alias' && isOriginalWhiteList(rightType)) {
          // 如果left是别名，而right不是
          if (isBlackList(left.value)) {
            // 不支持的类型
            throw new Error(`暂不支持日期类型`)
          } else if (isWhiteList(left.value)) {
            if ((isString(left.value) && rightType !== 'string') || (!isString(left.value) && rightType === 'string')) {
              throw new Error(`${reverseCNType(left.value.dataType)}不能跟${reverseCNType(rightType)}相加`)
            } else if (isInteger(left.value) && rightType === 'integer') {
              return {
                type: 'integer',
                value: true
              }
            } else if (isDecimal(left.value) && rightType === 'decimal') {
              return {
                type: 'decimal',
                value: true
              }
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        } else if (isOriginalWhiteList(leftType) && rightType === 'alias') {
          if (isBlackList(right.value)) {
            // 不支持的类型
            throw new Error(`暂不支持日期类型`)
          } else if (isWhiteList(right.value)) {
            if ((leftType === 'string' && !isString(right.value)) || (leftType !== 'string' && isString(right.value))) {
              throw new Error(`${reverseCNType(leftType)}不能跟${reverseCNType(right.value.dataType)}相加`)
            } else if (leftType === 'integer' && isInteger(right.value)) {
              return {
                type: 'integer',
                value: true
              }
            } else if (leftType === 'decimal' && isDecimal(right.value)) {
              return {
                type: 'decimal',
                value: true
              }
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        }

        if (isOriginalWhiteList(leftType) && isOriginalWhiteList(rightType)) {
          // 如果是符合解析树的类型
          if (leftType === rightType) {
            // 如果类型一样
            return {
              type: leftType,
              value: true
            }
          } else {
            if ((leftType === 'string' && rightType !== 'string') || (leftType !== 'string' && rightType === 'string')) {
              throw new Error(`${reverseCNType(leftType)}不能跟${reverseCNType(rightType)}相加`)
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          }
        } else {
          // 解析树无法解析
          throw new Error(`无法解析类型`)
        }
      }
      case '-':
      case '*': {
        if (!leftType || !rightType) {
          throw new Error(`类型缺失`)
        }

        if (leftType === 'dateLit' || rightType === 'dateLit') {
          // TODO: 如果直接是日期则报错,暂时限制
          throw new Error(`暂不支持日期类型`)
        }

        if (leftType === 'string' || rightType === 'string') {
          // TODO: 如果直接是日期则报错,暂时限制
          throw new Error(`不支持文本类型`)
        }

        // 如果都是别名，[]
        if (leftType === rightType && leftType === 'alias') {
          if (isBlackList(left.value, '-') || isBlackList(right.value, '-')) {
            // 不支持的类型
            throw new Error(`不支持${reverseCNType(isBlackList(left.value, '-') ? left.value.dataType : right.value.dataType)}类型`)
          } else if (isWhiteList(left.value, '-')) {
            // 能识别的
            if (left.value.dataType === right.value.dataType) {
              // 返回转换后的类型
              return {
                type: reverseType(left.value.dataType),
                value: true
              }
            } else {
              // 如果类型不一样
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        }

        if (leftType === 'alias' && isOriginalWhiteList(rightType, '-')) {
          // 如果left是别名，而right不是
          if (isBlackList(left.value, '-')) {
            // 不支持的类型
            throw new Error(`不支持${reverseCNType(left.value.dataType)}类型`)
          } else if (isWhiteList(left.value, '-')) {
            if (isInteger(left.value) && rightType === 'integer') {
              return {
                type: 'integer',
                value: true
              }
            } else if (isDecimal(left.value) && rightType === 'decimal') {
              return {
                type: 'decimal',
                value: true
              }
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        } else if (isOriginalWhiteList(leftType, '-') && rightType === 'alias') {
          if (isBlackList(right.value, '-')) {
            // 不支持的类型
            throw new Error(`不支持${reverseCNType(right.value.dataType)}类型`)
          } else if (isWhiteList(right.value, '-')) {
            if (leftType === 'integer' && isInteger(right.value)) {
              return {
                type: 'integer',
                value: true
              }
            } else if (leftType === 'decimal' && isDecimal(right.value)) {
              return {
                type: 'decimal',
                value: true
              }
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        }

        if (isOriginalWhiteList(leftType, '-') && isOriginalWhiteList(rightType, '-')) {
          // 如果是符合解析树的类型
          if (leftType === rightType) {
            // 如果类型一样
            return {
              type: leftType,
              value: true
            }
          } else {
            return {
              type: 'float',
              value: true
            }
          }
        } else {
          // 解析树无法解析
          throw new Error(`无法解析类型`)
        }
      }
      case '/': {
        if (!leftType || !rightType) {
          throw new Error(`类型缺失`)
        }

        if (leftType === 'dateLit' || rightType === 'dateLit') {
          // TODO: 如果直接是日期则报错,暂时限制
          throw new Error(`暂不支持日期类型`)
        }

        if (leftType === 'string' || rightType === 'string') {
          // TODO: 如果直接是日期则报错,暂时限制
          throw new Error(`不支持文本类型`)
        }

        // eslint-disable-next-line eqeqeq
        if (['integer', 'float', 'decimal', 'neg'].includes(rightType) && num(right.value) == 0) {
          throw new Error(`除数不能为0`)
        }

        // 如果都是别名，[]
        if (leftType === rightType && leftType === 'alias') {
          if (isBlackList(left.value, '/') || isBlackList(right.value, '/')) {
            // 不支持的类型
            throw new Error(`不支持${reverseCNType(isBlackList(left.value, '/') ? left.value.dataType : right.value.dataType)}类型`)
          } else if (isWhiteList(left.value, '/')) {
            // 能识别的
            if (left.value.dataType === right.value.dataType) {
              // 返回转换后的类型
              return {
                type: reverseType(left.value.dataType),
                value: true
              }
            } else {
              // 如果类型不一样
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        }

        if (leftType === 'alias' && isOriginalWhiteList(rightType, '/')) {
          // 如果left是别名，而right不是
          if (isBlackList(left.value, '/')) {
            // 不支持的类型
            throw new Error(`不支持${reverseCNType(left.value.dataType)}类型`)
          } else if (isWhiteList(left.value, '/')) {
            if (isInteger(left.value) && rightType === 'integer') {
              return {
                type: 'integer',
                value: true
              }
            } else if (isDecimal(left.value) && rightType === 'decimal') {
              return {
                type: 'decimal',
                value: true
              }
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        } else if (isOriginalWhiteList(leftType, '/') && rightType === 'alias') {
          if (isBlackList(right.value, '/')) {
            // 不支持的类型
            throw new Error(`不支持${reverseCNType(right.value.dataType)}类型`)
          } else if (isWhiteList(right.value, '/')) {
            if (leftType === 'integer' && isInteger(right.value)) {
              return {
                type: 'integer',
                value: true
              }
            } else if (leftType === 'decimal' && isDecimal(right.value)) {
              return {
                type: 'decimal',
                value: true
              }
            } else {
              return {
                type: 'float',
                value: true
              }
            }
          } else {
            // 未能识别的
            throw new Error(`未知类型`)
          }
        }

        if (isOriginalWhiteList(leftType, '/') && isOriginalWhiteList(rightType, '/')) {
          // 如果是符合解析树的类型
          if (leftType === rightType) {
            // 如果类型一样
            return {
              type: leftType,
              value: true
            }
          } else {
            return {
              type: 'float',
              value: true
            }
          }
        } else {
          // 解析树无法解析
          throw new Error(`无法解析类型`)
        }
      }
      case 'AND':
      case 'OR': {
        return left.value !== false ? left : right
      }
      // 逻辑判断(仅支持度量)
      case '>':
      case '>=':
      case '<':
      case '<=':
      case '!=': {
        // 等式判断两边仅支持数字类型
        const whiteList = ['integer', 'float', 'decimal', 'neg', 'alias']
        const numberList = ['BIGINT', 'DOUBLE', 'DECIMAL']
        if (!whiteList.includes(rightType) || !whiteList.includes(leftType)) {
          throw new Error(`等式判断两边仅支持数字类型`)
        } else {
          if (rightType === 'alias') {
            if (!numberList.includes(right.value.dataType)) {
              throw new Error(`等式判断两边仅支持数字类型`)
            } else if (right.value.role !== 2) {
              throw new Error(`逻辑判断暂不支持维度字段`)
            }
            return left
          } else if (leftType === 'alias') {
            if (!numberList.includes(left.value.dataType)) {
              throw new Error(`等式判断两边仅支持数字类型`)
            } else if (left.value.role !== 2) {
              throw new Error(`逻辑判断暂不支持维度字段`)
            }
            return right
          } else {
            return {
              type: 'integer',
              value: true
            }
          }
        }
      }
    }
    throw new Error("Can't apply operator " + operator)
  }
}
