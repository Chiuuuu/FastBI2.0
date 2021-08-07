import html2canvas from 'html2canvas'
import JSPDF from 'jspdf'
import json2csv from 'json2csv'

let chartInstanceIdMap = {}

// 暴露echart实例,设置图表id实例映射
export function setChartInstanceIdMap(chartObj, id) {
  chartInstanceIdMap[id] = chartObj
}

// 分类控件（是否echart图表）
function classifyControl(chart) {
  let chartType = chart.setting.chartType
  if (
    chartType === 'v-text' ||
    chartType === 'v-image' ||
    chartType === 'v-tables' ||
    chartType === 'material' ||
    chartType === 'steepBar'
  ) {
    return false
  }
  return true
}

// 图标类控件生成复制出来的图像结点
function createCanvas(chartId, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  var ctx = canvas.getContext('2d')
  // echart导出cavas内容
  var offcanvas = chartInstanceIdMap[chartId].getRenderedCanvas()
  ctx.drawImage(offcanvas, 0, 0)
  return canvas
}

// 处理截图的dom,复制控件(不受transform影响) // targetDom(全屏:preview-wrap/编辑:dv-wrapper)
function handleShootedDom(chart, targetDom) {
  // 非图表控件 && hightcharts可以直接深拷贝
  if (!classifyControl(chart) || chart.setting.name === 'high-pie') {
    const domObjClone = targetDom.cloneNode(true)
    domObjClone.setAttribute('id', 'cloneShotTarget')
    return domObjClone
  }
  // 获取显示框(全屏:preview-wrap/编辑:dv-wrapper)
  const domObjClone = targetDom.cloneNode()
  // 修改id
  domObjClone.setAttribute('id', 'cloneShotTarget')
  // 旭日图热力图dom结构只有一层
  if (chart.setting.name === 've-sun' || chart.setting.name === 've-heatmap') {
    let {
      clientWidth: orginWidth,
      clientHeight: orginHeight
    } = targetDom.childNodes[0]
    const canvas = createCanvas(chart.id, orginWidth, orginHeight)
    domObjClone.appendChild(canvas)
    return domObjClone
  }
  // 图表控件
  // 添加dv-chart
  const dvChart = targetDom.childNodes[0]
  domObjClone.appendChild(dvChart.cloneNode())
  // 添加title
  const title = dvChart.childNodes[0]
  domObjClone.childNodes[0].appendChild(title.cloneNode(true))
  // 添加canvas
  // 获取原echart图表部分尺寸
  let {
    clientWidth: orginWidth,
    clientHeight: orginHeight
  } = dvChart.childNodes[1]
  const canvas = createCanvas(chart.id, orginWidth, orginHeight)
  domObjClone.childNodes[0].appendChild(canvas)
  return domObjClone
}

// 截图复制出来的dom
function actionShoot(domClone, backColor, name) {
  // 如果图表背景透明，按大屏背景色作为背景
  if (!domClone.style.backgroundColor) {
    domClone.style.backgroundColor = backColor
  }
  document.body.appendChild(domClone)
  html2canvas(domClone, {
    width: domClone.clientWidth,
    height: domClone.clientHeight,
    scale: 1,
    dpi: 300,
    letterRendering: true,
    scrollY: 0,
    scrollX: 0,
    useCORS: true // 【重要】开启跨域配置
  }).then(canvas => {
    document.body.removeChild(domClone)
    download(canvas, name + '.png', 'img')
  })
}

// 导出图表图片
export function exportImg(chartId, chart, pageSettings) {
  let domObj = document.getElementById(chartId)
  // 处理截图的dom
  const domClone = handleShootedDom(chart, domObj)
  if (!domClone) {
    return
  }
  // 截图
  actionShoot(domClone, pageSettings.backgroundColor, chart.name)
}

// 预览导出图表图片
export function exportForFull(chartId, chart, pageSettings) {
  let domObj = document.getElementById(chartId)
  // 处理截图的dom
  const domClone = handleShootedDom(chart, domObj.childNodes[0]) // 预览图表多出一层preview-box
  // 截图
  actionShoot(domClone, pageSettings.backgroundColor, chart.name)
}

// 导出整个大屏
export function exportScreen(name) {
  const domObjs = document.querySelectorAll('.dv-screen')
  const domObj = domObjs[1] || domObjs[0]
  html2canvas(domObj, {
    width: domObj.clientWidth,
    height: domObj.clientHeight,
    scale: 1,
    dpi: 300,
    letterRendering: true,
    scrollY: 0,
    scrollX: 0,
    useCORS: true, // 【重要】开启跨域配置
    onclone: documentClone => {
      // 去掉右键菜单结点
      const cloneDom = documentClone.querySelector('.dv-screen')
      if (cloneDom.childNodes[2]) {
        cloneDom.childNodes[2].remove()
      }
    }
  }).then(canvas => {
    exportPdf(canvas, name)
  })
}

// 导出成pdf
function exportPdf(canvas, name) {
  // 开始将图片转换为PDF
  var pdf = new JSPDF('p', 'mm', 'a4') // A4纸，纵向
  var ctx = canvas.getContext('2d')
  console.log(canvas.height)
  var a4w = 170
  var a4h = 257 // A4大小，210mm x 297mm，四边各保留20mm的边距，显示区域170x257
  var imgHeight = Math.floor((a4h * canvas.width) / a4w) // 按A4显示比例换算一页图像的像素高度
  var renderedHeight = 0

  while (renderedHeight < canvas.height) {
    var page = document.createElement('canvas')
    page.width = canvas.width
    page.height = Math.min(imgHeight, canvas.height - renderedHeight) // 可能内容不足一页

    // 用getImageData剪裁指定区域，并画到前面创建的canvas对象中
    page
      .getContext('2d')
      .putImageData(
        ctx.getImageData(
          0,
          renderedHeight,
          canvas.width,
          Math.min(imgHeight, canvas.height - renderedHeight)
        ),
        0,
        0
      )
    pdf.addImage(
      page.toDataURL('image/jpeg', 1.0),
      'JPEG',
      10,
      10,
      a4w,
      Math.min(a4h, (a4w * page.height) / page.width)
    ) // 添加图像到页面，保留10mm边距

    renderedHeight += imgHeight
    if (renderedHeight < canvas.height) {
      pdf.addPage()
    } // 如果后面还有内容，添加空白页
  }
  pdf.save(`${name}.pdf`)
}

// 下载图片
function download(content, name, type) {
  let a = document.createElement('a')
  a.style.display = 'none'
  if (type === 'img') {
    let blob = dataURLToBlob(content.toDataURL('image/png'))
    a.setAttribute('href', URL.createObjectURL(blob))
  } else {
    a.setAttribute('href', encodeURI(content))
  }
  // 这块是保存图片操作  可以设置保存的图片的信息
  a.setAttribute('download', name)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
// 图片格式转换方法
function dataURLToBlob(dataurl) {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

export function exportCsv(datas, fields, name) {
  const result = json2csv.parse(datas, {
    fields
  })
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + result
  download(csvContent, name + '.csv')
}
