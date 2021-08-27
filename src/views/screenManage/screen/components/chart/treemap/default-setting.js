import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartTreemap,
  graphName: '矩形树图',
  setting: {
    data: {
      dimensions: [], // 维度
      measures: [], // 度量
    },
    style: {
      echart: {
        customPiecesIndex: 0,
        customShowWay: 'average', // measure || average
        customFormatterWay: 'all', // 全部 || 维度 || 度量
        visualMap: {
          show: true,
          type: 'piecewise',
          orient: 'horizontal',
          textStyle: {
            color: '#ffffff',
            fontSize: 16,
          },
          inRange: {
            color: ['#f69f2e', '#0fabf1', '#ed8693', '#ffff0d', '#0d8686'],
          },
          align: 'left',
          itemGap: 12,
          icon: 'circle',
          position: 'left-top',
          left: 'left',
          top: 'top',
        },
        // 系列
        customSeries: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 16,
          },
        },
        // 由于visualMap数组中的颜色定义, 即使隐藏了也会优先取piecewise的颜色集, 所以这里才去分开记录重新赋值到visualMap的方式解决
        customContinuousColors: ['#ffff0d', '#f69f2e'],
        customPiecewiseColors: ['#f69f2e', '#0fabf1', '#ed8693', '#ffff0d', '#0d8686'],
      },
    },
  },
});
