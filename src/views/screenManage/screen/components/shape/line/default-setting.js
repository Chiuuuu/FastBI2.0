import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ShapeLine,
  setting: {
    style: {
      size: {
        height: 20,
        width: 400,
      },
      echart: {
        border: {
          style: 'solid',
          color: '#fff',
        },
        opacity: 1,
        rotate: 0,
      },
    },
  },
});
