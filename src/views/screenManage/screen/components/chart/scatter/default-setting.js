import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartScatter,
  name: '散点图',
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
          top: 70,
          right: 60,
          bottom: 50,
          containLabel: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        tooltip: {
          show: true,
          trigger: 'item',
        },
        legend: {
          // 图例
          show: true,
          orient: 'horizontal',
          type: 'scroll', // 可滚动翻页
          pageIconColor: '#fff',
          pageTextStyle: {
            color: '#fff',
          },
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
          // X轴
          type: 'value',
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
            verticalAlign: 'top',
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
          symbolSize: 15,
          label: {
            // 标签
            show: true,
            color: 'inherit',
            fontSize: 16,
            position: 'top',
            fontFamily: 'sans-serif',
            formatter: '{@2} ({@0},{@1})',
            offset: [-10, 0],
          },
        },
        customScatterColor: '1', // 散点颜色 0单色 1按维度
        customScatterSize: '', // 散点大小  0：按度量1  1：按度量2  默认空，为无
        customScatterLabel: ['{@2}', '({@0},{@1})'], // 指标-显示内容
        customArrange: 'horizontal', // 指标-排列 horizontal水平  vertical垂直
        customScatterTargetColor: '0', // 0使用图例 1：自定义
        customTooltipFormatter: ['dimensions', 'xaxis', 'yaxis'], //鼠标移入内容显示
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
