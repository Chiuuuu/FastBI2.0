import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.Source,
  name: '素材库',
  setting: {
    data: {
      imgUrl: '',
      name: '',
    },
    style: {
      size: {
        width: 400,
        height: 400,
      },
      background: {
        // 背景
        color: 'transparent',
      },
      echart: {
        border: {
          width: 1,
          style: 'solid',
          color: '#fff',
        },
        background: {
          color: 'transparent',
        },
        opacity: 1,
      },
    },
  },
});
