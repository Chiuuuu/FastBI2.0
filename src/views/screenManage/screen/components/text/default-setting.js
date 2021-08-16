import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.Text,
  setting: {
    data: {
      measures: [],
    },
    style: {
      echart: {
        text: {
          fontSize: 16,
          fontAlign: 'left',
          fontFamily: 'sans-serif',
          fontColor: 'rgb(217, 217, 217)',
          fontWeight: 'normal',
        },
      },
    },
  },
});
