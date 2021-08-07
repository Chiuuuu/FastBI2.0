import { DEFAULT_COLORS } from './defaultColors'

function chartClick(e) {
  console.log(e)
}

const database = {
  app: {
    width: 1920,
    height: 1080, // 全局面包的宽高
    backgroundColor: '#0d2a42', // 背景颜色
    gridStep: 8, // 栅格间距
    backgroundType: 1,
    backgroundSrc: ''
  },
  canvasMaps: [
    {
      id: 'v-histogram',
      setting: {
        title: '柱状图',
        chartType: 'v-histogram',
        name: 've-histogram',
        icon: 'bar-chart',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '1/1', y: 375, s: '系列1' },
            { x: '1/2', y: 200, s: '系列1' },
            { x: '1/3', y: 25, s: '系列1' },
            { x: '1/4', y: 190, s: '系列1' },
            { x: '1/5', y: 90, s: '系列1' },
            { x: '1/6', y: 277, s: '系列1' },
            { x: '1/1', y: 123, s: '系列2' },
            { x: '1/2', y: 41, s: '系列2' },
            { x: '1/3', y: 112, s: '系列2' },
            { x: '1/4', y: 56, s: '系列2' },
            { x: '1/5', y: 122, s: '系列2' },
            { x: '1/6', y: 323, s: '系列2' }
          ]
        },
        apis: {
          labelMap: {
            x: '类目',
            y: '值',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '柱状图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          legend: {
            show: true,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          xAxis: {
            show: true,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12,
              rotate: 0
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            }
          },
          yAxis: {
            show: true,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#fff'
              }
            }
          },
          series: {
            label: {
              show: false,
              color: '#fff',
              fontSize: 12,
              position: 'top'
            },
            barWidth: 'auto' // 可选
          },
          color: DEFAULT_COLORS
        },
        view: { width: 500, height: 400, x: 80, y: 580, rotate: 0 }
      }
    },
    {
      id: 'v-line',
      setting: {
        title: '折线图',
        chartType: 'v-line',
        name: 've-line',
        icon: 'line-chart',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '1/1', y: 375 },
            { x: '1/2', y: 200 },
            { x: '1/3', y: 25 },
            { x: '1/4', y: 190 },
            { x: '1/5', y: 90 },
            { x: '1/6', y: 277 }
          ]
        },
        apis: {
          labelMap: { x: '类目', y: '值', s: '系列1' }
        },
        background: {
          backgroundType: 1,
          backgroundColor: '',
          borderColor: '',
          borderWidth: '',
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '折线图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          legend: {
            show: true,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          xAxis: {
            show: true,
            name: '',
            axisLabel: {
              color: '#ffffff',
              fontSize: 12,
              rotate: 0
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            }
          },
          yAxis: {
            show: true,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#fff'
              }
            }
          },
          series: {
            smooth: false, // 可选的
            // step: 'start', // step line
            step: false,
            symbol: 'circle', // 标记点
            lineStyle: {
              width: 1
            },
            label: {
              show: false,
              color: '#fff',
              fontSize: 12,
              position: 'top'
            },
            areaStyle: {
              // 可选的
              opacity: 0
            }
          },
          color: DEFAULT_COLORS
        },
        view: { width: 500, height: 400, x: 710, y: 580, rotate: 0 } // 计算中间值(1920-500)*0.5,(1080-400)*0.5
      }
    },
    {
      id: 'v-bar',
      setting: {
        title: '条形图',
        chartType: 'v-bar',
        name: 've-bar',
        icon: 'md-list',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '1/1', y: 375, s: '系列1' },
            { x: '1/2', y: 200, s: '系列1' },
            { x: '1/3', y: 25, s: '系列1' },
            { x: '1/4', y: 190, s: '系列1' },
            { x: '1/5', y: 90, s: '系列1' },
            { x: '1/6', y: 277, s: '系列1' },
            { x: '1/1', y: 123, s: '系列2' },
            { x: '1/2', y: 41, s: '系列2' },
            { x: '1/3', y: 112, s: '系列2' },
            { x: '1/4', y: 56, s: '系列2' },
            { x: '1/5', y: 122, s: '系列2' },
            { x: '1/6', y: 323, s: '系列2' }
          ]
        },
        apis: {
          labelMap: {
            x: '类目',
            y: '值',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '条形图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          legend: {
            show: true,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          xAxis: {
            show: true,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12,
              rotate: 0
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          yAxis: {
            show: true,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          series: {
            label: {
              show: false,
              color: '#fff',
              fontSize: 12,
              position: 'inside'
            },
            barWidth: 'auto' // 可选
          },
          color: DEFAULT_COLORS
        },
        view: { width: 500, height: 400, x: 1300, y: 580, rotate: 0 }
      }
    },
    {
      id: 'v-pie',
      setting: {
        title: '饼图',
        chartType: 'v-pie',
        name: 've-pie',
        icon: 'ios-pie',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '1/1', y: 1393, s: '系列1' },
            { x: '1/2', y: 3530, s: '系列1' },
            { x: '1/3', y: 2923, s: '系列1' },
            { x: '1/4', y: 1723, s: '系列1' },
            { x: '1/5', y: 3792, s: '系列1' },
            { x: '1/6', y: 4593, s: '系列1' }
          ]
        },
        apis: {
          level: [['1/1', '1/2', '1/3'], ['1/4', '1/5']],
          labelMap: {
            x: '类目',
            y: '值',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '饼图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          legend: {
            show: true,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          xAxis: {
            show: false,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12,
              rotate: 0
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          yAxis: {
            show: false,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          series: {
            label: {
              show: true,
              color: '',
              fontSize: 12,
              position: 'outside', // 可选inside
              formatter: '{b}: {@2012} ({d}%)'
            },
            roseType: false, // 饼图可选玫瑰图
            center: ['50%', '50%'], // 饼图可选
            radius: ['0', '70%'] // 饼图可选
          },
          color: DEFAULT_COLORS
        },
        chartEvents: {
          click: chartClick
        },
        view: { width: 400, height: 400, x: 136, y: 34, rotate: 0 }
      }
    },
    {
      id: 'v-map',
      setting: {
        title: '地图',
        chartType: 'v-map',
        name: 've-map',
        icon: 'ios-map',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '吉林', y: 178 },
            { x: '北京', y: 23 },
            { x: '上海', y: 122 },
            { x: '徐州', y: 98 },
            { x: '南京', y: 188 },
            { x: '兰州', y: 31 },
            { x: '乌鲁木齐', y: 122 },
            { x: '马鞍山', y: 32 },
            { x: '张家界', y: 55 },
            { x: '三门峡', y: 100 }
          ]
        },
        apis: {
          position: 'china',
          labelMap: {
            x: '位置',
            y: '人口',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '地图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          legend: {
            show: true,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          visualMap: {
            show: false,
            type: 'piecewise',
            min: 0,
            max: 200,
            inRange: {
              color: ['#50a3ba', '#eac736', '#d94e5d'],
              symbolSize: [10, 16]
            },
            textStyle: {
              color: '#fff',
              fontSize: 12
            }
          },
          xAxis: {
            show: false,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12,
              rotate: 0
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          yAxis: {
            show: false,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          // 地图独有的
          geo: {
            map: 'china',
            zoom: 1.2,
            label: {
              normal: {
                show: false,
                color: '#fff',
                fontSize: 12
              },
              emphasis: {
                show: false,
                color: '#fff',
                fontSize: 12
              }
            },
            itemStyle: {
              normal: {
                areaColor: '#282c3c',
                borderColor: '#1f9bff'
              },
              emphasis: {
                areaColor: '#1d2131',
                borderColor: '#1f9bff'
              }
            }
          },
          series: {
            type: 'scatter', // scatter,effectScatter
            coordinateSystem: 'geo',
            symbolSize: 10,
            aspectScale: 0.75,
            hoverAnimation: true,
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'stroke',
              scale: 3
            },
            label: {
              show: false,
              formatter: '{b}',
              color: '',
              fontSize: 12,
              position: 'inside' // 可选inside
            },
            itemStyle: {
              emphasis: {
                borderColor: '#fff',
                borderWidth: 1
              }
            },
            zlevel: 1
          },
          color: DEFAULT_COLORS
        },
        view: { width: 500, height: 500, x: 710, y: 34, rotate: 0 }
      }
    },
    {
      id: 'v-radar',
      setting: {
        title: '雷达图',
        chartType: 'v-radar',
        name: 've-radar',
        icon: 'ios-cellular',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '1/1', y: 1393, s: '指标1' },
            { x: '1/2', y: 3530, s: '指标1' },
            { x: '1/3', y: 2923, s: '指标1' },
            { x: '1/4', y: 1723, s: '指标1' },
            { x: '1/5', y: 3792, s: '指标1' },
            { x: '1/6', y: 4593, s: '指标1' },

            { x: '1/1', y: 1093, s: '指标2' },
            { x: '1/2', y: 3230, s: '指标2' },
            { x: '1/3', y: 2323, s: '指标2' },
            { x: '1/4', y: 1212, s: '指标2' },
            { x: '1/5', y: 5643, s: '指标2' },
            { x: '1/6', y: 872, s: '指标2' },

            { x: '1/1', y: 1232, s: '指标3' },
            { x: '1/2', y: 1452, s: '指标3' },
            { x: '1/3', y: 3532, s: '指标3' },
            { x: '1/4', y: 2234, s: '指标3' },
            { x: '1/5', y: 2345, s: '指标3' },
            { x: '1/6', y: 1111, s: '指标3' }
          ]
        },
        apis: {
          labelMap: {
            x: '类目',
            y: '值',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '雷达图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          legend: {
            show: true,
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          radar: {
            // 雷达图可选
            shape: 'circle', // polygon
            center: ['50%', '60%'],
            radius: '75%'
          },
          xAxis: {
            show: false,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12,
              rotate: 0
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          yAxis: {
            show: false,
            axisLabel: {
              color: '#ffffff',
              fontSize: 12
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#cccccc'
              }
            }
          },
          series: {
            label: {
              show: false,
              color: '',
              fontSize: 12,
              position: 'inside' // 可选inside
            },
            areaStyle: {
              // 可选的
              opacity: 0
            }
          },
          color: DEFAULT_COLORS
        },
        view: { width: 400, height: 400, x: 1364, y: 34, rotate: 0 }
      }
    },
    {
      id: 'v-gauge',
      setting: {
        title: '仪表盘',
        chartType: 'v-gauge',
        name: 've-gauge',
        icon: 'radar-chart',
        type: '1',
        modelId: '',
        api_data: {
          source: [{ x: 'type', y: 60, s: 'value' }]
        },
        apis: {
          labelMap: {
            x: '类目',
            y: '值',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '仪表盘',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          grid: { left: 20, top: 60, right: 20, bottom: 30 },
          xAxis: {
            show: false
          },
          yAxis: {
            show: false
          },
          legend: {
            show: false,
            data: [],
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          series: {
            name: '',
            type: 'gauge',
            center: ['50%', '50%'],
            radius: '80%',
            startAngle: 225,
            endAngle: -45,
            min: 0,
            max: 100,
            axisLine: {
              show: true,
              lineStyle: {
                // 属性lineStyle控制线条样式
                color: [[1, '#f5c942']],
                shadowColor: '#ccc',
                shadowBlur: 2,
                width: 15
              }
            },
            splitLine: {
              show: true,
              length: 10, // 刻度节点线长度
              lineStyle: {
                width: 2,
                color: '#fff'
              } // 刻度节点线
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true
            },
            // title: {
            //   show: true
            // },
            detail: {
              show: true
            },
            pointer: {
              // 指针样式
              length: '60%'
            }
          }
          // color: DEFAULT_COLORS
        },
        view: { width: 400, height: 400, x: 760, y: 340, rotate: 0 }
      }
    },
    {
      id: 'v-ring',
      setting: {
        title: '环形图',
        name: 've-ring',
        chartType: 'v-ring',
        icon: 'pie-chart',
        type: '1',
        modelId: '',
        api_data: {
          source: [
            { x: '1/1', y: 80, s: '系列1' },
            { x: '1/2', y: 20, s: '系列1' }
          ]
        },
        apis: {
          hoverAnimation: false,
          labelMap: {
            x: '类目',
            y: '值',
            s: '系列1'
          }
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            show: true,
            content: '环形图',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          tooltip: {
            show: false
          },
          grid: { left: 20, top: 20, right: 20, bottom: 30 },
          legend: {
            show: false,
            data: [],
            textStyle: {
              color: '#ffffff',
              fontSize: 12
            },
            itemGap: 12,
            icon: '',
            left: 'center',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
          },
          xAxis: {
            show: false
          },
          yAxis: {
            show: false
          },
          series: {
            radius: ['60%', '70%'],
            center: ['50%', '50%'],
            label: {
              normal: {
                show: false,
                formatter: function(val) {
                  console.log(val)
                },
                position: 'center',
                textStyle: {
                  fontSize: '30'
                }
              },
              emphasis: {
                show: false,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            }
          },
          color: DEFAULT_COLORS
        },
        chartEvents: {
          click: chartClick
        },
        view: { width: 400, height: 400, x: 760, y: 340, rotate: 0 }
      }
    },
    {
      id: 'v-text',
      setting: {
        title: '文本',
        chartType: 'v-text',
        name: 've-text',
        modelId: '',
        apiData: {},
        apis: {},
        canEdit: false,
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          title: {
            content: '',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          }
        },
        view: { width: 500, height: 400, x: 710, y: 580, rotate: 0 } // 计算中间值(1920-500)*0.5,(1080-400)*0.5
      }
    },
    {
      id: 'v-image',
      setting: {
        title: '图片',
        chartType: 'v-image',
        name: 've-image',
        icon: 'md-images',
        modelId: '',
        apiData: {},
        apis: {},
        config: {
          imageUrl: ''
        },
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        view: { width: 500, height: 400, x: 710, y: 580, rotate: 0 }
      }
    },
    {
      id: 'v-tables',
      setting: {
        title: '表格',
        chartType: 'v-tables',
        name: 've-tables',
        icon: 'table',
        type: '3',
        modelId: '',
        api_data: {
          source: {
            columns: [
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                scopedSlots: { customRender: 'name' },
                customHeaderCell: function() {}
              },
              {
                title: 'Age',
                dataIndex: 'age',
                key: 'age',
                width: 80,
                customHeaderCell: function() {}
              },
              {
                title: 'Address',
                dataIndex: 'address',
                key: 'address 1',
                ellipsis: true,
                customHeaderCell: function() {}
              },
              {
                title: '02',
                dataIndex: 'address',
                key: 'address 2',
                ellipsis: true,
                customHeaderCell: function() {}
              },
              {
                title: '03',
                dataIndex: 'address',
                key: 'address 3',
                ellipsis: true,
                customHeaderCell: function() {}
              },
              {
                title: '04',
                dataIndex: 'address',
                key: 'address 4',
                ellipsis: true,
                customHeaderCell: function() {}
              }
            ],
            rows: [
              {
                key: '1',
                name: 'John Brown',
                age: 32,
                address: 'New York'
              },
              {
                key: '2',
                name: 'Jim Green',
                age: 42,
                address: 'London'
              },
              {
                key: '3',
                name: 'Joe Black',
                age: 32,
                address: 'Sidney'
              },
              {
                key: '3',
                name: 'Joe Black',
                age: 32,
                address: 'Sidney'
              },
              {
                key: '3',
                name: 'Joe Black',
                age: 32,
                address: 'Sidney'
              },
              {
                key: '3',
                name: 'Joe Black',
                age: 32,
                address: 'Sidney'
              }
            ]
          }
        },
        apis: {},
        background: {
          backgroundType: '1',
          backgroundColor: '',
          borderColor: '',
          borderWidth: 0,
          borderStyle: '',
          borderRadius: 0
        },
        config: {
          index: {
            show: false
          },
          title: {
            show: true,
            content: '表格',
            textAlign: 'left',
            textStyle: {
              color: '#ffffff',
              fontSize: 20
            }
          },
          header: {
            show: true,
            textStyle: {
              color: '#000',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'left'
            },
            backgroundColor: ''
          },
          table: {
            textStyle: {
              color: '#000',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'left'
            },
            oddBackgroundColor: '',
            evenBackgroundColor: '',
            pageSize: 10,
            ellipsis: true
          }
        },
        view: { width: 500, height: 400, x: 710, y: 580, rotate: 0 }
      }
    }
  ]
}
export default database
