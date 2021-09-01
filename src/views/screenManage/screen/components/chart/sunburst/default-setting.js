import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartSunburst,
  name: '旭日图',
  setting: {
    data: {
      dimensions: [], // 维度
      measures: [], // 度量
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
        tooltip: {
          show: true,
        },
        visualMap: {
          show: true,
        },
        customTooltipFormatter: 'nv', // 鼠标移入内容显示
        customFormatterWay: 'nv', // 指标内容选择
        // 系列
        customSeries: {
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            position: 'inside',
            formatter: '{a}\n({c})',
            rotate: 'radial', // 'radial' 表示径向旋转、'tangential' 表示切向旋转
          },
          labelLayout: {
            // 标签是否允许重叠
            hideOverlap: true,
          },
        },
        customMax: 100, // 最大值
        customMin: 0, // 最小值
        customInRadius: 0, // 内半径
        customOutRadius: 100, // 外半径
        customCenter: [50, 50], // 坐标中心点
      },
    },
  },
});
