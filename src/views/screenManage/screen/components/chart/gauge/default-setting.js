import BoardType from '@/views/screenManage/screen/setting/default-type'
import BASE from '@/views/screenManage/screen/setting/default-base'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartGauge,
  setting: {
    data: {
      progress: [], // 进度
      targe: '', // 目标
      min: '', // 最小值
      max: '' // 最大值
    },
    style: {
      echart: {
        // 图表配置
        grid: {
          // 网格设置
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          containLabel: true
        },
        customOptions: {
          type: 'gauge',
          center: ['50%', '60%'],
          zlevel: 0,
          startAngle: 225,
          endAngle: -45,
          axisLine: {
            // 仪表盘轴线相关配置
            show: true,
            lineStyle: {
              width: 30,
              color: [[1, '#fd666d']]
            }
          },
          progress: {
            // 展示当前进度
            show: true,
            width: 30,
            itemStyle: {
              color: 'rgb(73,146,255)'
            }
          },
          pointer: {
            // 指针
            show: true,
            length: '50%',
            width: 6,
            offsetCenter: ['0%', '0%'], // 相对于仪表盘中心的偏移位置
            itemStyle: {
              color: 'rgb(73,146,255)',
              opacity: 1
            }
          },
          axisTick: {
            // 刻度样式
            show: true,
            splitNumber: 2, // 分隔线之间分割的刻度数
            length: 40,
            distance: -30, // 刻度线与轴线的距离
            lineStyle: {
              color: '#fff',
              width: 1,
              type: 'solid'
            }
          },
          axisLabel: {
            // 刻度标签
            show: true,
            distance: 45, // 标签与刻度线的距离
            color: '#fff',
            fontSize: 20
          },
          detail: {
            // 数据
            show: true,
            fontSize: 30,
            color: 'rgb(73,146,255)',
            valueAnimation: true,
            formatter: '{value}',
            offsetCenter: ['0%', '40%']
          },
          title: {
            show: true,
            color: 'rgb(73,146,255)',
            fontSize: 16,
            offsetCenter: ['0%', '20%']
          }
        },
        customGap: 0, // 目标值距仪表盘的间隙
        customRadius: 100, // 半径
        customTarget: {
          color: 'yellow',
          backgroundColor: 'red'
        }
      }
    }
  }
})
