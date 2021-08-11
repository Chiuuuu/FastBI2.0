import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.Text,
  setting: {
    data: {
      options: {
        //数据筛选、排序
        imensionsLimit: [], // 数据筛选 -- 拖入的维度
        measuresLimit: [], // 数据筛选 -- 拖入的度量
        fileList: [], // 数据筛选 -- 拖入的维度、度量
        sort: [], //数据排序
      },
    },
  },
});
