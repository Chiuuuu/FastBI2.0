import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ShapeRectangular,
  name: '矩形',
  setting: {
    style: {
      background: {
        // 背景
        color: 'transparent',
      },
      echart: {
        border: {
          width: 1,
          style: 'solid',
          color: '#000',
          radius: 0,
        },
        background: {
          color: '#fff',
        },
        opacity: 1,
      },
    },
  },
});
