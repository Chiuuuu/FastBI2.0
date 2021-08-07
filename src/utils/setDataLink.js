import screenManage from '@/api/modules/screenManage'
import { message } from 'ant-design-vue'
import Vue from 'vue'
import { deepClone } from '../utils/deepClone'
import TreeGroupBy from '@/components/board/options/treemap/tree-groupby'
import store from '@/store'
// 设置联动的图标的数据
export async function setLinkageData(id, e, canvasMap) {
  let selected = canvasMap.find(item => item.id === id)
  let apiData = selected.setting.api_data
  let bindCharts = apiData.interactive.bindedList
  const type = selected.setting.chartType
  // 没有关联图表不需要联动
  if (!bindCharts) {
    return
  }
  // 获取需要筛选的维度信息
  let dimensionData = apiData.dimensions[0]
  dimensionData.value = [e.name]
  // 矩形树图热力图旭日图取最后一个维度
  if (type === 'v-treemap' || type === 'v-sun') {
    dimensionData.value = [e.treePathInfo[1].name]
  }
  if (type === 'v-heatmap') {
    dimensionData.value = e.value[0] ? [e.value[0]] : [e.value[1]]
  }
  // 散点图q筛选值是seriesName
  if (type === 'v-scatter') {
    dimensionData.value = [e.seriesName]
  }
  // 关联的每个图表进行数据筛选
  for (let chartId of bindCharts) {
    let chart = canvasMap.find(item => item.id === chartId)
    if (!chart) {
      continue
    }
    getBindData(chart, dimensionData)
  }
}
// 获取联动数据筛选数据,不需要保存
async function getBindData(chart, dimensionData) {
  let apiData = chart.setting.api_data
  // 进行过数据筛选的不再执行联动
  if (apiData.options.fileList && apiData.options.fileList.length && apiData.options.fileList.length > 0) {
    return
  }
  let { pivotschemaId, dataType, value, name } = dimensionData
  let dimensionsLimit = [{ pivotschemaId, type: 1, dataType, value, name }]
  apiData.dataLink = { dimensionsLimit }
  let res = await screenManage.getDataLink(chart)
  if (res.code === 200) {
    let columns = []
    let rows = []
    let dimensionKeys = [] // 度量key
    for (let m of apiData.dimensions) {
      dimensionKeys.push(m.alias)
      columns.push(m.alias) // 默认columns第二项起为指标
    }

    let measureKeys = [] // 度量key
    for (let m of apiData.measures) {
      measureKeys.push(m.alias)
      columns.push(m.alias) // 默认columns第二项起为指标
    }
    res.rows.map((item, index) => {
      let obj = {}
      for (let item2 of dimensionKeys) {
        obj[item2] = item[item2]
      }
      for (let item2 of measureKeys) {
        obj[item2] = item[item2]
      }
      rows.push(obj)
    })

    let selectData = {
      columns,
      rows
    }
    // 矩形树图改变series.data
    if (chart.setting.chartType === 'v-treemap') {
      let config = deepClone(chart.setting.config)
      const tree = new TreeGroupBy(
        res.rows,
        chart.setting.api_data.dimensions.map(item => item.alias),
        chart.setting.api_data.measures
      )
      TreeGroupBy.handleLeafValue(tree.tree)
      selectData = {
        data: tree.tree,
        pieces: TreeGroupBy.handlePieces(
          tree.tree,
          config.series.recDimensionIndex
        )
      }
    } else if (chart.setting.chartType === 'v-sun') {
      selectData = {
        rows: new TreeGroupBy(
          res.rows,
          chart.setting.api_data.dimensions.map(item => item.alias),
          chart.setting.api_data.measures
        ).tree
      }
    }
    // 构造联动选择的数据
    Vue.set(apiData, 'selectData', selectData)
  } else {
    message.error(res.msg)
  }
}
// 重置被联动的图标数据
export function resetOriginData(id, canvasMap) {
  let selected = canvasMap.find(item => item.id === id)
  let bindCharts = selected.setting.api_data.interactive.bindedList
  for (let chartId of bindCharts) {
    let chart = canvasMap.find(item => item.id === chartId)
    if (!chart) {
      continue
    }
    // 删除联动数据
    let apiData = chart.setting.api_data
    Vue.delete(apiData, 'selectData')
  }
}
