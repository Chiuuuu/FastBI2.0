import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

const fontSize = 16;
export default merge(cloneDeep(BASE), {
  type: BoardType.ChartRingPie,
  setting: {
    data: {
      progress: [], // 进度
      targe: [], // 目标
    },
    style: {
      echart: {
        // 图表配置
        grid: {
          // 网格
          show: true,
          left: 50,
          top: 60,
          right: 50,
          bottom: 50,
          containLabel: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        customTarge: true, // 是否启用目标值配置
        customFormatterWay: 'np',
        // 系列
        customSeries: {
          // 标签
          label: {
            show: true,
            color: '#fff',
            position: 'center', // outside || inside
            fontSize,
            fontWeight: 'normal',
            fontFamily: 'sans-serif',
            rich: {
              sub: {
                show: true,
                color: '#fff',
                fontSize: 0.8 * fontSize,
                fontWeight: 'normal',
                fontFamily: 'sans-serif',
              },
            },
            formatter: '',
          },
        },
        customFixed: 0, // 小数位
        customCenter: [50, 50], // 坐标中心点
        customInRadius: 60, // 内半径
        customOutRadius: 70, // 外半径
        customColors: ['#0185fe', '#9ed1ef'], // 颜色
      },
    },
  },
});
