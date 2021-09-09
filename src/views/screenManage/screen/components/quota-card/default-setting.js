import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.QuatoCard,
  name: '指标卡',
  setting: {
    data: {
      totalQuota: [], // 主指标
      secondaryQuota: [], // 次指标
    },
    style: {
      size: {
        width: 286,
        height: 170,
      },
      title: {
        marginBottom: 34,
      },
      background: {
        // 背景
        color: '#1A224E',
      },
      echart: {
        // 图表配置
        totalQuatoTitle: {
          text: '总获取量', // 自定义的标题
          show: true,
          color: '#fff',
          size: 16,
          family: 'sans-serif',
          weight: 'normal',
          align: 'left',
        },
        totalQuatoValue: {
          color: '#677cf7',
          size: 36,
          family: 'sans-serif',
          weight: 'normal',
          align: 'left',
          marginBottom: 20,
        },
        showSecondaryQuato: true,
        secondaryQuatoTitleLine: {
          align: 'flex-start',
          marginBottom: 10,
        },
        secondaryQuatoTitle: {
          text: [], // 自定义的标题
          show: true,
          color: '#fff',
          size: 16,
          family: 'sans-serif',
          weight: 'normal',
          marginRight: 10,
        },
        secondaryQuatoValue: {
          color: '#677cf7',
          size: 12,
          family: 'sans-serif',
          weight: 'normal',
        },
        border: {
          width: 1,
          style: 'solid',
          color: '#9ed1ef',
        },
        background: {
          color: '#9ed1ef',
        },
      },
    },
  },
});
