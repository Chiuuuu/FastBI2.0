/**
 * 数组添加/插入数据
 * @export
 * @param {array} list
 * @param {any} data
 * @param {number} index
 */
export function arrayAddData(list, data, index) {
  if (typeof index === 'undefined') {
    list.push(data)
  } else {
    list.splice(index, 0, data)
  }
}

/**
 * 数组删除数据
 * @export
 * @param {array} list
 * @param {any} data
 * @param {number} index
 */
export function arrayDeleData(list, data, key = 'id', index) {
  if (typeof index === 'undefined') {
    index = list.findIndex(item => item[key] === data[key])
  }
  list.splice(index, 1)
}

/**
 * 以全屏模式查看元素
 * @export
 * @param {any} element dom元素
 */
export function requestFullScreen(element) {
  // 判断各种浏览器，找到正确的方法
  if (!element) return console.error(`The element does not exist`)
  var requestMethod =
    element.requestFullScreen || // W3C
    element.webkitRequestFullScreen || // FireFox
    element.mozRequestFullScreen || // Chrome等
    element.msRequestFullScreen // IE11
  if (requestMethod) {
    requestMethod.call(element)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // for Internet Explorer
    // eslint-disable-next-line no-undef
    var wscript = new ActiveXObject('WScript.Shell')
    if (wscript !== null) {
      wscript.SendKeys('{F11}')
    }
  }
}

/**
 * 检查是否为全屏状态
 * @export
 * @return {boolean} 是否为全屏状态
 */
export function checkFullScreen() {
  const isSupportFullScreen = document.fullscreenEnabled
  if (!isSupportFullScreen) { return console.log(`Your browser does not support full screen`) }
  let isFull =
    window.fullScreen ||
    document.webkitIsFullScreen ||
    document.msFullscreenEnabled
  if (typeof isFull === 'undefined') {
    isFull = false
  }
  return isFull
}

/**
 * 是否匹配关键字
 */
export function isSearchMatch(item, value) {
  value = typeof value === 'string' ? value.trim() : value
  return item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
}
/**
 * 递归搜索
 */
export function menuSearchLoop(item, value) {
  // 不是文件夹且匹配直接写入数组
  if (item.fileType === 1) {
    if (isSearchMatch(item, value)) {
      return item
    }
  } else {
    // 递归遍历文件夹
    if (isSearchMatch(item, value)) {
      // 文件夹名字匹配, 返回整个文件夹
      return Object.assign({}, item)
    } else if (item.children && item.children.length > 0) {
      // 不匹配, 则找到下面匹配的文件
      let newChildren = []
      item.children.map(child => {
        // 遍历子节点
        const newChild = menuSearchLoop(child, value)
        if (newChild) newChildren.push(newChild)
      })
      // 拷贝新的节点并写入子节点数组
      if (newChildren.length > 0) {
        return Object.assign({}, item, { children: newChildren })
      }
    }
  }
}

/**
 * @description 首字母大写
 */
export function firstToUpper(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(str[0], str[0].toUpperCase())
}

/**
 * @description 转换驼峰
 * @param {string} prefix 前缀
 * @param {prop} prop 属性
 */
export function conversionHump(prefix, prop) {
  const capitalLetter = firstToUpper(prop)
  return `${prefix}${capitalLetter}`
}

/**
 * @description 获取style样式
 * @param {object} style 属性
 * @param {object} props 需要校验的
 * @param {array} units 需要添加单位的属性key
 * @param {array} humpPrefix 需要转成驼峰的属性key
 */
export function getStyle(style, props, units, humpPrefix) {
  Object.keys(props).forEach(curProp => {
    const curPropValues = props[curProp]
    Object.keys(curPropValues).forEach(prop => {
      const _value = curPropValues[prop]
      if (units.includes(prop)) {
        // 需要添加px单位
        if (humpPrefix.includes(curProp)) {
          // 需要驼峰的样式
          const key = conversionHump(curProp, prop)
          style[key] = `${_value}px`
        } else {
          style[prop] = `${_value}px`
        }
      } else {
        // 不需要添加px单位
        if (humpPrefix.includes(curProp)) {
          const key = conversionHump(curProp, prop)
          style[key] = `${_value}`
        } else {
          style[prop] = `${_value}`
        }
      }
    })
  })

  return style
}
