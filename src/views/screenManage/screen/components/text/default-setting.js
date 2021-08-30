import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.Text,
  graphName: '文本选择框',
  setting: {
    data: {
      measures: [],
      htmlText: '',
    },
    style: {
      echart: {
        text: {
          fontSize: 16,
          textAlign: 'left',
          fontFamily: 'sans-serif',
          color: 'rgb(217, 217, 217)',
          fontWeight: 'normal',
          verticalAlign: 'top',
        },
      },
    },
  },
});
