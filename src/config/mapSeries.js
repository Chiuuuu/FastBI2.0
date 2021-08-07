// 视觉映射
export const visualMapConfig = {
  show: false,
  type: 'piecewise',
  min: 0,
  max: 1000,
  seriesIndex: 0,
  inRange: {
    color: ['rgb(79,174,255)', 'rgb(55,115,205)', 'rgb(32,56,156)'],
    // color: ['#50a3ba', '#eac736', '#d94e5d'],
    symbolSize: [10, 16]
  },
  calculable: true,
  textStyle: {
    color: '#fff',
    fontSize: 12
  },
  left: 'left',
  top: 'bottom',
  itemGap: 10,
  itemSymbol: 'roundRect',
  align: 'left',
  orient: 'vertical'
}

// 填充图层
export const mapSeries = {
  type: 'map',
  map: 'guangzhou',
  aspectScale: 0.75,
  showLegendSymbol: false,
  zoom: 1.1,
  roam: false,
  legendHoverLink: false,
  mapLocation: {
    x: 'left',
    y: 'top'
  },
  tooltip: {
    show: true,
    trigger: 'item',
    confine: true
  },
  label: {
    normal: {
      show: false,
      fontSize: 12,
      color: '#fff',
      formatter: '{b}',
      orient: 'vertical'
    },
    emphasis: {
      show: false
    }
  },
  themeColor: 'blue', // 填充色数组标识
  pointShowList: [], // 指标显示
  tooltipShowList: [], // 提示框显示
  itemStyle: {
    normal: {
      areaColor: 'transparent', // 'rgba(1, 33, 92, 0.45)',
      borderColor: 'transparent', // '#215495',
      borderWidth: 1,
      opacity: 1
    },
    emphasis: {
      borderColor: 'transparent', //'#073684',
      areaColor: '#061E3D'
    }
  },
  data: []
}

// 散点图层
export const dotSeries = {
  type: 'scatter', // scatter,effectScatter
  name: '人口',
  coordinateSystem: 'geo',
  symbol: 'circle',
  symbolSize: 10,
  //   aspectScale: 0.75,
  hoverAnimation: true,
  showEffectOn: 'render',
  rippleEffect: {
    brushType: 'stroke',
    scale: 3
  },
  tooltip: {
    show: true,
    trigger: 'item',
    confine: true
  },
  label: {
    normal: {
      show: false,
      fontSize: 12,
      color: '#fff',
      position: 'bottom', // 可选inside
      formatter: '{b} ：{a} : {c}',
      orient: 'vertical'
    },
    emphasis: {
      show: true
    }
  },
  pointShowList: [], // 指标显示
  tooltipShowList: [], // 提示框显示
  itemStyle: {
    normal: {
      color: '#60b8f6',
      opacity: 1,
      showSeries: true
    },
    emphasis: {
      borderColor: '#fff',
      borderWidth: 1
    }
  },
  zlevel: 1,
  data: []
}
export function tooltipFormatter(params) {
  let data = params.data
  return `${params.seriesName}<br />${data.name}：${data.value[2] ||
    data.value}`
}
export function labelFormatter(params) {
  return params.data.value[2].toFixed(2)
}
