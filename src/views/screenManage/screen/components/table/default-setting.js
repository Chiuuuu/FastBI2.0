import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartTable,
  setting: {
    data: {
      fields: [],
      options: {
        //数据筛选、排序
        imensionsLimit: [], // 数据筛选 -- 拖入的维度
        measuresLimit: [], // 数据筛选 -- 拖入的度量
        fileList: [], // 数据筛选 -- 拖入的维度、度量
        sort: [], //数据排序
      },
    },
    style: {
      echart: {
        thead: {
          show: true,
          background: {
            color: '#355ee5',
          },
          font: {
            size: 12,
            color: '#fff',
          },
          text: {
            align: 'left',
          },
          height: 30,
        },
        tbody: {
          odd: 'transparent', // 奇数行
          even: '#283255', // 偶数行
          font: {
            size: 12,
            color: '#fff',
          },
          text: {
            align: 'left',
          },
          height: 32,
        },
      },
    },
  },
});
