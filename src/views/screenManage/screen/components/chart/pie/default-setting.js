import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

const fontSize = 14;
export default merge(cloneDeep(BASE), {
  type: BoardType.ChartPie,
  name: '普通饼图',
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
          trigger: 'item',
        },
        legend: {
          // 图例
          show: true,
          type: 'scroll', // 可滚动翻页
          pageIconColor: '#fff',
          pageTextStyle: {
            color: '#fff',
          },
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
        customLimit: 5,
        customFormatterWay: 'nv',
        // 系列
        customSeries: {
          // 标签
          label: {
            show: true,
            color: '#fff',
            position: 'outside', // outside || inside
            formatter: '{b} {c}',
            fontSize,
          },
        },
        customRoseType: {
          show: false,
          type: 'radius', // radius || area
        },
        customInRadius: 0, // 内半径
        customOutRadius: 70, // 外半径
        customCenter: [50, 50], // 坐标中心点
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
