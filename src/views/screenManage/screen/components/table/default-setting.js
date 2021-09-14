import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartTable,
  name: '表格',
  setting: {
    data: {
      fields: [],
    },
    style: {
      size: {
        // 尺寸
        width: 430,
        height: 317,
      },
      background: {
        // 背景
        color: 'transparent',
      },
      echart: {
        thead: {
          show: true,
          background: {
            color: 'rgba(255,255,255,0.08)',
          },
          font: {
            size: 16,
            color: '#fff',
            family: 'sans-serif',
            weight: 'normal',
          },
          text: {
            align: 'center',
          },
          height: 38,
          autoWrap: true, //自动换行
        },
        tbody: {
          odd: 'transparent', // 奇数行
          even: 'transparent', // 偶数行
          font: {
            size: 16,
            color: '#fff',
            family: 'sans-serif',
            weight: 'normal',
          },
          text: {
            align: 'center',
          },
          height: 38,
          autoWrap: true, //自动换行
        },
      },
    },
  },
});
