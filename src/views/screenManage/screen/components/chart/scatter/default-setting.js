import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartScatter,
  setting: {
    data: {
      dimensions: [], // 维度
      xaxis: [], // X轴度量
      yaxis: [], // Y轴度量
    },
    style: {
      echart: {
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
        tooltip: {
          trigger: 'item',
        },
        legend: {
          // 图例
          show: true,
          orient: 'horizontal',
          textStyle: {
            color: '#ffffff',
            fontSize: 16,
          },
          itemGap: 12,
          icon: 'circle',
          position: 'left-top',
          left: 'left',
          top: 'top',
        },
        xAxis: {
          // X轴
          type: 'value',
          nameLocation: 'middle',
          nameGap: 10,
          name: '12312',
          cache: {
            // 控制缓存数据
            name: '12312',
          },
          nameShow: true,
          nameTextStyle: {
            color: '#fff',
            fontSize: '12',
            align: 'center',
            padding: [30, 0, 0, 0],
          },
          axisLabel: {
            // X轴 标签
            show: true,
            color: '#fff',
            fontSize: 12,
            rotate: 0,
          },
          axisLine: {
            // X轴 线
            show: true,
            lineStyle: {
              color: '#fff',
              width: 1,
              type: 'solid',
            },
          },
          splitLine: {
            // 垂直网格线
            show: false,
            lineStyle: {
              width: 1,
              type: 'solid',
              color: '#fff',
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          // Y轴设置
          type: 'value',
          position: 'left',
          name: '名称',
          cache: {
            // 控制缓存数据
            name: '名称',
          },
          nameShow: true,
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#fff',
            fontSize: 12,
            padding: [0, 0, 40, 0],
          },
          axisLabel: {
            // Y轴 标签
            show: true,
            color: '#fff',
            fontSize: 12,
            rotate: 0,
          },
          axisLine: {
            // Y轴 线
            show: true,
            lineStyle: {
              color: '#fff',
              width: 1,
              type: 'solid',
            },
          },
          splitLine: {
            // 水平网格线
            show: false,
            lineStyle: {
              width: 1,
              type: 'solid',
              color: '#fff',
            },
          },
          axisTick: {
            show: true,
          },
        },
        customFormatterWay: 'nv',
        // 系列
        customSeries: {
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            position: 'top',
            formatter: '{a}\n({c})',
          },
        },
      },
    },
  },
});
