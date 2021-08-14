import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartTreemap,
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
      },
    },
  },
});
