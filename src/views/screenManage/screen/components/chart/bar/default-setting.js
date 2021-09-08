import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartBar,
  name: '普通柱状图',
  setting: {
    data: {
      dimensions: [], // 维度
      measures: [], // 度量
      resourceType: '',
    },
    style: {
      echart: {
        // 图表配置
        grid: {
          // 网格设置
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
          trigger: 'axis',
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
        xAxis: {
          // X轴设置
          type: 'category',
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
            align: 'right',
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
              width: 1,
              color: '#fff',
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
          boundaryGap: false,
          nameLocation: 'middle',
          name: 'Y轴名称',
          cache: {
            // 控制缓存数据
            name: 'Y轴名称',
          },
          nameShow: true,
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
              width: 1,
              color: '#fff',
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
            show: false,
          },
        },
        // 系列
        customSeries: {
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            position: 'outside',
          },
          itemStyle: {
            // 图形样式
            borderRadius: 0, //圆角半径
          },
        },
        customBarWidth: 40, //柱条宽度
        customBarGap: 40, //柱条间隔
        customShape: 'vertical', // vertical(垂直) || horizontal(水平)
        customStack: false, // 是否开启堆叠
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
