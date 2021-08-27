import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

const fontSize = 14;
export default merge(cloneDeep(BASE), {
  type: BoardType.ChartNestPie,
  graphName: '嵌套饼图',
  setting: {
    data: {
      outerIng: [], // 外圈
      innerIng: [], // 内圈
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
          trigger: 'item',
        },
        legend: {
          // 图例
          show: true,
          orient: 'horizontal',
          textStyle: {
            color: '#ffffff',
            fontSize: 16,
          },
          align: 'left',
          itemGap: 12,
          icon: 'circle',
          position: 'left-top',
          left: 'left',
          top: 'top',
        },
        // 系列
        customSeries: {
          label: {
            show: true,
            alignTo: 'edge',
            color: '#fff',
            position: 'outside', // outside || inside
            formatter: '{b}\n{c}',
            fontSize,
            minMargin: fontSize,
            edgeDistance: 1.5 * fontSize,
            lineHeight: 1.5 * fontSize,
          },
          labelLayout: {
            // 标签是否允许重叠
            hideOverlap: false,
          },
          center: ['50%', '50%'], // 坐标中心点
        },
        customRadius: 90, // 整体半径
        customFormatterWay: 'nv',
      },
    },
  },
});
