export default {
  'high-pie': [{
    type: 'pie',
    name: '图形占比',
    //模块名和所占比，也可以{name: '测试1',y: 12}
    data: [{
        name: 'Chrome',
        y: 61.41
      },
      {
        name: 'IE',
        y: 11.84
      },
      {
        name: 'Firefox',
        y: 10.85
      },
      {
        name: 'Edge',
        y: 4.67
      },
      {
        name: 'Safari',
        y: 4.18
      },
      {
        name: 'Other',
        y: 7.05
      }
    ]
  }],
  'high-column': [{
    // type: 'pie',
    name: '图形占比',
    //模块名和所占比，也可以{name: '测试1',y: 12}
    data: [{
        name: 'Chrome',
        y: 61.41
      },
      {
        name: 'Internet Explorer',
        y: 11.84
      },
      {
        name: 'Firefox',
        y: 10.85
      },
      {
        name: 'Edge',
        y: 4.67
      },
      {
        name: 'Safari',
        y: 4.18
      },
      {
        name: 'Other',
        y: 7.05
      }
    ]
  }],
  'v-sun': {
    title: {
      show: true,
      content: '旭日图',
      text: '旭日图',
      left: 'left',
      textStyle: {
        color: '#ffffff',
        fontSize: 20,
        fontFamily: 'not specified',
        fontWeight: 'normal'
      }
    },
    // grid: {
    //   left: 20,
    //   top: 60,
    //   right: "20%",
    //   bottom: 30
    // },
    tooltip: {
      trigger: 'item'
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: 100,
      show: true,
      calculable: true,
      orient: 'vertical', // vertical
      left: 'right', // 左 中 右
      top: 'bottom', // 上 中 下
      // bottom: '5%',
      inRange: {
        color: ['#f69f2e', '#0fabf1', '#ed8693', '#ffff0d', '#0d8686']
      },
      textStyle: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'not specified'
      }
    },
    series: {
      type: 'sunburst',
      nodeClick: false,
      sort: null,
      emphasis: {
        focus: 'ancestor'
      },
      center: ['50%', '50%'],
      radius: [0, '80%'],
      labelShowList: [], // 记录指标显示的字段
      tooltipShowList: [], // 记录气泡显示的字段
      tooltip: {
        show: true,
        formatter: '{b}',
        position: 'top'
      },
      label: {
        show: true,
        fontSize: 12,
        color: '#fff',
        formatter: '{b}',
        position: 'inside',
        rotate: 'radial',
        orient: 'vertical'
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      data: [{
        name: '张明1',
        value: 78,
        children: [{
          name: '男',
          value: 78,
          children: []
        }]
      },
      {
        name: '张明2',
        value: 42,
        children: [{
          name: '男',
          value: 42,
          children: []
        }]
      },
      {
        name: '张明3',
        value: 88,
        children: [{
          name: '男',
          value: 88,
          children: []
        }]
      },
      {
        name: '张明4',
        value: 32,
        children: [{
          name: '男',
          value: 32,
          children: []
        }]
      },
      {
        name: '张明5',
        value: 20,
        children: [{
          name: '男',
          value: 20,
          children: []
        }]
      }
      ]
    }
    // series: {
    //   label: {
    //     show: true,
    //     color: '',
    //     fontSize: 12,
    //     position: 'outside', // 可选inside
    //     formatter: '{b}: {@2012} ({d}%)'
    //   },
    //   center: ['50%', '50%'] // 饼图可选
    // },
  },
  'v-heatmap': {
    title: {
      show: true,
      content: '',
      text: '矩形热力图',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 20,
        fontFamily: 'not specified',
        fontWeight: 'normal'
      }
    },
    grid: {
      left: 60,
      top: 60,
      right: 80,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      show: true,
      // data: ['1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12a'],
      nameLocation: 'middle',
      nameGap: 20,
      nameTextStyle: {
        color: '#fff',
        fontSize: '12',
        align: 'right',
        padding: [30, 0, 0, 0]
      },
      axisLabel: {
        show: true,
        color: '#ffffff',
        fontSize: 12,
        rotate: 0
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        show: false,
        lineStyle: {
          type: 'solid',
          color: '#fff'
        }
      },
      axisTick: {
        show: true
      },
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      show: true,
      // data: ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday'],
      position: 'left',
      nameLocation: 'middle',
      nameTextStyle: {
        color: '#fff',
        fontSize: 12,
        padding: [0, 0, 40, 0]
      },
      axisLabel: {
        show: true,
        color: '#ffffff',
        fontSize: 12
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        show: false,
        lineStyle: {
          type: 'solid',
          color: '#fff'
        }
      },
      axisTick: {
        show: false
      },
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      show: true,
      calculable: true,
      orient: 'vertical', // vertical ,horizontal
      left: 'right', // 左 中 右
      top: 'bottom', // 上 中 下
      bottom: '5%',
      inRange: {
        color: ['#ffff35', '#f69f2e']
      },
      textStyle: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'not specified'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    series: {
      name: '',
      type: 'heatmap',
      center: ['50%', '50%'],
      data: [
        ['1a', 'Sunday', 2],
        ['2a', 'Saturday', 4],
        ['3a', 'Friday', 6],
        ['4a', 'Saturday', 8],
        ['5a', 'Thursday', 10],
        ['6a', 'Saturday', 1],
        ['7a', 'Wednesday', 2],
        ['8a', 'Saturday', 3],
        ['9a', 'Tuesday', 24],
        ['10a', 'Saturday', 5],
        ['11a', 'Monday', 20],
        ['12a', 'Saturday', 12]
      ],
      labelShowList: [], // 记录指标显示的字段
      tooltipShowList: [], // 记录气泡显示的字段
      tooltip: {
        show: true,
        formatter: '{b}',
        position: 'top'
      },
      label: {
        show: true,
        color: '#fff',
        fontSize: 14,
        position: 'inside',
        formatter: '{b}',
        offset: [0, 0]
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
    // color: DEFAULT_COLORS
  },
  'v-treemap': {
    title: {
      show: true,
      content: '矩形树图',
      textAlign: 'left',
      textStyle: {
        color: '#ffffff',
        fontSize: 20,
        fontFamily: 'not specified',
        fontWeight: 'normal',
        overflow: 'break'
      }
    },
    grid: {
      left: 50,
      top: 60,
      right: 50,
      bottom: 50
    },
    legend: {
      show: false,
      orient: 'horizontal',
      // 加翻页
      type: 'scroll',
      pageIconColor: '#fff',
      pageTextStyle: {
        color: '#fff'
      },
      textStyle: {
        color: '#ffffff',
        fontSize: 12
      },
      itemGap: 12,
      icon: '',
      left: 'center',
      top: 'top',
      right: 'auto',
      bottom: 'auto'
    },
    visualMap: {
      show: true,
      type: 'piecewise',
      orient: 'horizontal',
      dimension: 1,
      max: 0,
      textStyle: {
        color: '#ffffff',
        fontSize: 12
      },
      inRange: {
        color: ['#f69f2e', '#0fabf1', '#ed8693', '#ffff0d', '#0d8686']
      },
      pieces: [
        { label: '广州市', value: 800 },
        { label: '深圳市', value: 100 },
        { label: '东莞市', value: 100 },
        { label: '南京市', value: 700 },
        { label: '苏州市', value: 200 },
        { label: '无锡市', value: 100 }
      ],
      itemGap: 12,
      left: 'center',
      top: 'auto',
      right: 'auto',
      bottom: 'auto'
    },
    xAxis: {
      type: 'value',
      name: '',
      show: true,
      nameLocation: 'middle',
      nameGap: 20,
      nameTextStyle: {
        color: '#fff',
        fontSize: '12',
        align: 'right',
        padding: [30, 0, 0, 0]
      },
      axisLabel: {
        show: false,
        color: '#ffffff',
        fontSize: 12,
        rotate: 0
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      show: true,
      name: '',
      position: 'left',
      nameLocation: 'middle',
      nameTextStyle: {
        color: '#fff',
        fontSize: 12,
        padding: [0, 0, 40, 0]
      },
      axisLabel: {
        show: false,
        color: '#ffffff',
        fontSize: 12
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: {
      name: '矩形树图',
      type: 'treemap',
      recSize: 'value', // 矩形大小依据度量等比或所有矩形等大(none)
      recDimensionIndex: 0, // 矩形颜色(即视觉映射的维度)
      visualMaxList: [],
      // 由于visualMap数组中的颜色定义, 即使隐藏了也会优先取piecewise的颜色集, 所以这里才去分开记录重新赋值到visualMap的方式解决
      continuousColors: ['#ffff0d', '#f69f2e'],
      piecewiseColors: [
        '#f69f2e',
        '#0fabf1',
        '#ed8693',
        '#ffff0d',
        '#0d8686'
      ],
      nodeClick: false,
      roam: false,
      breadcrumb: {
        show: false
      },
      tooltip: {
        show: true,
        formatter: '{b} {c}'
      },
      // 由于JSON.stringfy不支持转换function类型, 所以需要2个数组记录formatter的字段
      tooltipShowList: [], // 记录tooltip需要展示的字段
      labelShowList: [], // 记录label需要展示的字段
      label: {
        show: true,
        align: 'center',
        position: 'inside',
        fontSize: 12,
        color: '#fff',
        ellipsis: true,
        formatter: '{b}'
      },
      emphasis: {
        upperLabel: {
          show: true,
          align: 'center',
          position: 'inside',
          height: 30
        }
      },
      itemStyle: {
        color: 'transparent',
        borderWidth: 0.2
      },
      data: [{
        name: '广东省',
        value: [1000, 1000],
        children: [{
          name: '广州市',
          value: [800, 800]
        },
        {
          name: '深圳市',
          value: [100, 100]
        },
        {
          name: '东莞市',
          value: [100, 100]
        }
        ]
      },
      {
        name: '江苏省',
        value: [1000, 1000],
        children: [{
          name: '南京市',
          value: [700, 700]
        },
        {
          name: '苏州市',
          value: [200, 200]
        },
        {
          name: '无锡市',
          value: [100, 100]
        }
        ]
      }
      ]
    }
  }
}
