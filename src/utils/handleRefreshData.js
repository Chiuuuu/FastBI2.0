import { sum, summary } from '@/utils/summaryList'
import handleReturnChartData from '@/utils/handleReturnChartData'
import reverseAddressResolution from '@/utils/reverseAddressResolution'
import geoJson from '@/utils/guangdong.json'
import { visualMapConfig, mapSeries, dotSeries } from '@/config/mapSeries'
import { message } from 'ant-design-vue'
// 处理大屏刷新数据
export async function handleRefreshData({ chart, newData }) {
  if (chart.setting.chartType === 'v-map') {
    // 假刷新获取不到null的值，遍历加上
    if (newData.fillList) {
      newData.fillList = await handleReturnChartData(newData.fillList, chart.setting)
    }
    if (newData.labelList) {
      newData.labelList = await handleReturnChartData(
        newData.labelList,
        chart.setting,
        true
      )
    }
    setMapData(chart, newData)
    return
  }
  let source = chart.setting.api_data.source
  if (!source) {
    return
  }
  let sourceRows = source.rows
  if (!sourceRows) {
    return
  }
  // 假刷新获取不到null的值，遍历加上
  newData = await handleReturnChartData(newData, chart.setting)
  if (chart.setting.type === '2') {
    chart.setting.api_data.returnData = newData // 记录返回的键值对，方便展示图表数据直接用
    sourceRows.forEach((row, index) => {
      // 按对应key重新取值
      if (index === 0) {
        row.value = newData[0][row.type]
      } else {
        row.value = newData[0][row.type] - newData[0][sourceRows[0].type]
      }
    })
    // 环形图
    if (chart.setting.chartType === 'v-ring') {
      let datas = newData[0]
      let keys = chart.setting.api_data.measures.map(measure => measure.alias)
      // 当前值段
      let rows = [
        {
          type: keys[0],
          value: datas[keys[0]]
        }
      ]
      // 剩余数
      let value = datas[keys[1]] - rows[0].value
      value = value > 0 ? value : 0
      // 剩余段,目标值-当前值
      rows.push({
        type: keys[1],
        value
      })
      chart.setting.api_data.source.rows = rows
      chart.setting.config.topTitle.text =
        +((rows[0].value / datas[keys[1]]) * 100).toFixed(2) + '%'
    }
    // 仪表盘
    if (
      chart.setting.chartType === 'v-gauge' &&
      chart.setting.api_data.measures[1]
    ) {
      chart.setting.config.series.max =
        newData[0][chart.setting.api_data.measures[1].alias]
    }
    // 文本框
    if (chart.setting.chartType === 'v-text') {
      chart.setting.api_data.refreshData = newData[0]
      chart.setting.api_data.source = newData[0]
    }
  } else if (chart.setting.chartType === 'v-multiPie') {
    // 嵌套饼图设置apis
    let rows = []
    let dimensionKeys = chart.setting.api_data.dimensions.map(
      item => item.alias
    )
    dimensionKeys.forEach(item => {
      // 根据当前维度分类得到的列表
      let list = summary(
        newData,
        item,
        chart.setting.api_data.measures[0].alias
      ) // 嵌套饼图度量只有一个，直接取第一个数
      rows = rows.concat(list) // 把所有维度分类出来的数组进行拼接（v-charts配置格式要求）
    })

    chart.setting.api_data.source.rows = rows
  } else {
    if (chart.setting.api_data.source) {
      chart.setting.api_data.source.rows = newData
    }
    // 雷达图
    if (chart.setting.chartType === 'v-radar') {
      // 格式例子cloumns:[度量，青瓜，土豆，菜心]
      // rows:[{度量:度量1,青瓜，土豆，菜心},{度量2,青瓜，土豆，菜心}]
      let metricsName = chart.setting.api_data.dimensions[0].alias
      let newColumns = ['measure']
      let newRows = []
      chart.setting.api_data.measures.forEach(measure => {
        let measureName = measure.alias
        let obj = {}
        newData.forEach(row => {
          newColumns.push(row[metricsName])
          obj.measure = measureName
          obj[row[metricsName]] = row[measureName]
        })
        newRows.push(obj)
      })

      chart.setting.api_data.source.columns = newColumns
      chart.setting.api_data.source.rows = newRows
    }
  }
}
async function setMapData(chart, newData) {
  let apiData = chart.setting.api_data
  let name = apiData.measures[0].alias
  let config = chart.setting.config
  let originMap = config.series.find(item => item.type === 'map')
  let originScatter = config.series.find(item => item.type === 'scatter')
  // 判断添加填充层
  if (newData.fillList) {
    let seriesObj = {}
    let datas = []
    let valueList = []
    if (apiData.options.fillType === 'area') {
      let alias = apiData.dimensions[0].alias
      let showName = `地区名/${alias}` // 指标显示用
      for (let item of newData.fillList) {
        datas.push({
          name: item[alias],
          value: item[name],
          // 构造映射数据，给指标提示框内容显示
          [showName]: item[alias], // 地区名/维度
          [alias]: item[alias], // 维度
          [name]: item[name] // 度量
        })
      }
      seriesObj = Object.assign(mapSeries, {
        data: datas,
        name: name + 'fill',
        pointShowList: [showName],
        tooltipShowList: [alias, name]
      })
      valueList = datas.map(item => item.value)
    } else {
      for (let item of newData.fillList) {
        let positionMsg = ''
        try {
          positionMsg = await reverseAddressResolution([
            item[apiData.latitude[0].alias],
            item[apiData.longitude[0].alias]
          ])

          datas.push({
            name: positionMsg.district,
            value: item[name],
            // 构造映射数据，给指标提示框内容显示
            [apiData.latitude[0].alias]: item[apiData.latitude[0].alias], // 经度
            [apiData.longitude[0].alias]: item[apiData.longitude[0].alias], // 维度
            地区名: positionMsg.district, // 地区名
            [name]: item[name] // 度量
          })
        } catch (err) {
          continue
        }
      }
      if (datas.length === 0) {
        message.error('经纬度解析失败')
        return
      }
      seriesObj = Object.assign(mapSeries, {
        data: datas,
        name: name + 'fill',
        pointShowList: ['地区名'],
        tooltipShowList: [
          apiData.latitude[0].alias,
          apiData.longitude[0].alias,
          name
        ]
      })
      valueList = datas.map(item => item.value)
    }
    // 本来有填充层改数据，没有加上
    if (originMap) {
      originMap.data = datas
    } else {
      chart.setting.config.series.unshift(seriesObj)
    }
    if (!chart.setting.config.visualMap) {
      chart.setting.config.visualMap = visualMapConfig
      chart.setting.visualMap.max = Math.max(...valueList)
      chart.setting.config.visualMap.min = Math.min(...valueList)
    }
  } else {
    delete chart.setting.config.visualMap
  }
  if (newData.labelList) {
    let seriesObj = {}
    let datas = []
    if (apiData.options.labelType === 'area') {
      // 只有一个维度，唯一名称
      let alias = apiData.labelDimensions[0].alias
      // 一个度量对应一个series.data
      let measure = apiData.labelMeasures[0]
      let showName = `地区名/${alias}` // 指标显示用
      for (let item of newData.labelList) {
        // 抓取区域坐标
        let center = getCenterCoordinate(item[alias])
        // 找不到对应坐标跳过
        if (!center) {
          continue
        }
        datas.push({
          name: item[alias],
          value: center.concat(item[measure.alias]), // 链接数组，坐标和值
          // 构造映射数据，给指标提示框内容显示
          [showName]: item[alias], // 地区名/维度
          [alias]: item[alias], // 维度
          [measure.alias]: item[measure.alias] // 度量
        })
      }
      seriesObj = Object.assign(dotSeries, {
        data: datas,
        name: measure.alias,
        pointShowList: [showName],
        tooltipShowList: [alias, measure.alias]
      })
    } else {
      let alias = apiData.labelMeasures[0].alias
      // 解析数据，获取经度，纬度，目标值
      for (let data of newData.labelList) {
        let positionMsg = ''
        try {
          // 获取位置信息
          let position = [
            data[apiData.labelLatitude[0].alias],
            data[apiData.labelLongitude[0].alias]
          ]
          positionMsg = await reverseAddressResolution(position)

          datas.push({
            name: positionMsg.district,
            value: [parseFloat(position[0]), parseFloat(position[1])].cancat(
              data[alias]
            ),
            // 构造映射数据，给指标提示框内容显示
            [apiData.labelLatitude[0].alias]:
              data[apiData.labelLatitude[0].alias], // 经度
            [apiData.labelLongitude[0].alias]:
              data[apiData.labelLongitude[0].alias], // 维度
            地区名: positionMsg.district, // 地区名
            [alias]: data[alias] // 度量
          })
        } catch (err) {
          continue
        }
      }
      if (datas.length === 0) {
        message.error('经纬点解析失败')
        return
      }
      seriesObj = Object.assign(dotSeries, {
        data: datas,
        name: alias,
        pointShowList: ['地区名'],
        tooltipShowList: [
          apiData.labelLatitude[0].alias,
          apiData.labelLongitude[0].alias,
          alias
        ]
      })
    }
    // 本来有散点层改数据，没有加上
    if (originScatter) {
      originScatter.data = datas
    } else {
      chart.setting.config.series.push(seriesObj)
    }
  }
}
function getCenterCoordinate(name) {
  let dataList = geoJson.features
  let countryside = dataList.find(item => item.properties.name === name)
  if (!countryside) {
    return null
  }
  return countryside.properties.center
}
