import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ShapeLine,
  setting: {
    style: {
      size: {
        height: 100,
        width: 400,
      },
      background: {
        // 背景
        color: 'transparent',
      },
      echart: {
        border: {
          style: 'solid',
          color: '#fff',
          width: 2,
        },
        opacity: 1,
        rotate: 0,
        boxShadow: '',
        shadowColor: '#fff',
      },
    },
  },
});
