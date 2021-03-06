import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

const fontSize = 14;
export default merge(cloneDeep(BASE), {
  type: BoardType.ChartNestPie,
  name: '嵌套饼图',
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
          type: 'scroll', // 可滚动翻页
          pageIconColor: '#fff',
          pageTextStyle: {
            color: '#fff',
          },
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
            // alignTo: 'labelLine',
            color: '#fff',
            position: 'outside', // outside || inside
            formatter: '{b} {c}',
            fontSize,
          },
          labelLayout: {
            // 标签是否允许重叠
            hideOverlap: true,
          },
          // center: ['50%', '50%'], // 坐标中心点
        },
        customlabelLineLen: [55, 40], // 文本标签引导线
        customCenter: [50, 50], // 坐标中心点
        customRadius: 72, // 整体半径
        customFormatterWay: 'nv',
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
