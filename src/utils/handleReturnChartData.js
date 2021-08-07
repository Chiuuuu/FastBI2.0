import _ from 'lodash'

// 返回空或null字段图表报错
export default function handleReturnChartData(
  returnData,
  setting,
  isLabel = false,
  formatTableColumns
) {
  let promise = new Promise(resolve => {
    let apiData = setting.api_data
    let dimensions = isLabel ? 'labelDimensions' : 'dimensions'
    let measures = isLabel ? 'labelMeasures' : 'measures'
    // 获取所有数据的key
    let keys = apiData[`${dimensions}`]
      .concat(apiData[`${measures}`])
      .map(item => {
        return { role: item.role, alias: item.alias }
      })
    for (let rowDatas of returnData) {
      // 统计空数据数量，如果整行字段都是空需要过滤
      let nullNumber = 0
      // 行内存在空字段
      for (let key of keys) {
        if (!rowDatas) {
          continue
        }
        if (!rowDatas[key.alias]) {
          nullNumber++
          // 维度才显示空
          if (key.role === 1) {
            rowDatas[key.alias] = '空'
          }
          // 表格赋值null
          if (setting.chartType === 'v-tables') {
            rowDatas[key.alias] = ''
          }
        }
        // 数据导出时, 度量需要拼接聚合方式
        if (formatTableColumns) {
          const hasFormatKey = formatTableColumns.find(
            item => item.alias === key.alias
          )
          if (hasFormatKey) {
            rowDatas[hasFormatKey.colName] = rowDatas[key.alias]
            delete rowDatas[key.alias]
          }
        }
        // 如果整行字段都是空把整行置空过滤
        if (nullNumber === keys.length) {
          rowDatas = null
        }
      }
    }
    // 过滤null行
    returnData = returnData.filter(item => item)
    // 去掉排序的数据
    if (apiData.options.sort && apiData.options.sort.length) {
      returnData = handleSortData(apiData, returnData)
    }
    resolve(returnData)
  })
  return promise
}

// 去掉排序的数据
function handleSortData(apiData, datas) {
  let filterArr = []
  apiData.options.sort.forEach(item => {
    filterArr.push(`sort_${item.alias}`)
  })
  datas = datas.map(item => _.omit(item, filterArr))
  return datas
}
