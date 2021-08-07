/**
 * 对对象列表某一字段求和(arr:原数组|key:需要求和的字段)
 */
export function sum(arr, key) {
  return (
    arr.reduce((pre, current) => {
      let val = current[key] ? pre + current[key] : pre
      return +val.toFixed(2)
    }, 0) || 0
  )
}

/**
 * 分类汇总(arr:原数组|keyValue:分类的字段|countValue:分类后需要求和的字段)
 */
export function summary(arr, keyValue, countValue) {
  let container = []
  arr.forEach(item => {
    // 两个维度的返回结果有可能是null,null的不汇总
    if (!item[keyValue]) return
    container[item[keyValue]] = container[item[keyValue]] || []
    container[item[keyValue]].push(item)
  })
  let summaryList = []
  Object.keys(container).forEach(key => {
    let total = sum(container[key], countValue)
    summaryList.push({
      name: key,
      value: total
    })
  })
  return summaryList
}
