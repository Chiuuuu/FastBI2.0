import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ShapeRectangular,
  setting: {
    style: {
      echart: {
        border: {
          width: 1,
          style: 'solid',
          color: '#fff',
          radius: 0,
        },
        background: {
          color: 'red',
        },
        opacity: 1,
      },
    },
  },
});
