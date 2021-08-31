import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartRadar,
  name: '普通雷达图',
  setting: {
    data: {
      dimensions: [], // 维度
      measures: [], // 度量
    },
    style: {
      echart: {
        tooltip: {
          show: true,
        },
        // 图表配置
        grid: {
          // 网格
          show: true,
          left: 50,
          top: 60,
          right: 50,
          bottom: 50,
          containLabel: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        legend: {
          // 图例
          show: true,
          orient: 'horizontal',
          textStyle: {
            color: '#ffffff',
            fontSize: 16,
          },
          align: 'left',
          itemGap: 12,
          icon: 'circle',
          position: 'left-top',
          left: 'left',
          top: 'top',
        },
        customInRadius: 0, // 内半径
        customOutRadius: 70, // 外半径
        customCenter: [50, 50], // 坐标中心点
        radar: {
          // 雷达图
          shape: 'circle', // polygon(多边形), circle(圆形)
          axisName: {
            // 外圈字体设置
            color: '#fff',
            fontSize: 16,
          },
          indicator: [], // 指标
          splitNumber: 4, // 分割段数
          splitLine: {
            show: true,
            lineStyle: {
              color: '#ccc',
              width: 1,
              type: 'solid',
              opacity: 1,
            },
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
              opacity: 1,
            },
          },
          axisLine: {
            // 每条分割中心线
            show: true,
            lineStyle: {
              color: '#ccc',
              width: 1,
              type: 'solid',
              opacity: 1,
            },
          },
        },
        // 系列配置
        customSeries: {
          label: {
            // 标签
            show: false,
            color: '#fff',
            fontSize: 16,
            position: 'top',
          },
          areaStyle: {
            opacity: 0,
          },
        },
        customOpacity: 0, // 透明度
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
