import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartHeatmap,
  name: '矩形热力图',
  setting: {
    data: {
      measures: [], // 度量
      xaxis: [], // X轴
      yaxis: [], // Y轴
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
          show: true,
          trigger: 'axis',
        },
        visualMap: {
          show: true,
          calculable: true,
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
          inRange: {
            color: ['#ffffff', '#f69f2e'],
          },
        },
        xAxis: {
          // X轴
          type: 'category',
          splitArea: {
            show: true,
          },
          boundaryGap: true,
          nameLocation: 'middle',
          nameGap: 10,
          name: 'X轴名称',
          cache: {
            // 控制缓存数据
            name: 'X轴名称',
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
          type: 'category',
          splitArea: {
            show: true,
          },
          name: 'Y轴名称',
          cache: {
            // 控制缓存数据
            name: 'Y轴名称',
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
            show: true,
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
        // 系列
        customSeries: {
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            position: 'inside',
          },
        },
        customVisualMapColor: 'gradient', // gradient: 按度量比例渐变, fullfilled: 不按度量渐变
        customFormatterWay: ['0', '1', '2'], // 指标内容
        customTooltipFormatter: ['0', '1', '2'], //鼠标移入显示
      },
    },
  },
});
