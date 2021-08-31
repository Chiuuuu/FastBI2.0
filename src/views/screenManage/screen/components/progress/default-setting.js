import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartProgress,
  name: '进度条',
  setting: {
    data: {
      targe: '', // 目标
      min: '', // 最小值
      max: '', // 最大值
    },
    style: {
      size: {
        height: 100,
      },
      title: {
        marginBottom: 0,
      },
      background: {
        // 背景
        color: 'transparent',
      },
      echart: {
        // 图表配置
        grid: {
          // 网格设置
          show: true,
          left: 50,
          top: 60,
          right: 50,
          bottom: 50,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        size: {
          width: 100, // 宽度为百分比
          height: 5, // 高度为px
        },
        showWay: 'percent', // 值 || 百分比
        label: {
          show: true,
          color: '#fff',
          fontSize: 14,
          fontWeight: 'normal',
          fontFamily: 'sans-serif',
          position: {
            left: 0,
            top: 0,
          },
        },
        border: {
          width: 1,
          style: 'solid',
          color: '#9ed1ef',
        },
        radius: {
          topLeft: 0,
          topRight: 0,
          bottomLeft: 0,
          bottomRight: 0,
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        background: {
          color: '#9ed1ef',
        },
        progress: {
          background: {
            color: '#0185fe',
            image: '',
            size: 0,
          },
        },
        customFixed: 0,
        customColor: 'single', // linear || radial
        customGradient: ['#0185fe', '#87d068'],
      },
    },
  },
});
