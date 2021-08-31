import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartFunnel,
  name: '漏斗图',
  setting: {
    data: {
      dimensions: [], // 维度
      measures: [], // 度量
    },
    style: {
      echart: {
        // 图表配置
        grid: {
          // 网格设置
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
          trigger: 'axis',
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
          top: 70,
          right: 100,
          bottom: 60,
          left: 80,
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            position: 'outside',
          },
        },
        customConverseRate: {
          //转化率
          show: true,
          color: '#fff',
          fontSize: 16,
          digit: 0, //小数位数
        },
        customArriveRate: {
          //到达率
          show: true,
          color: '#fff',
          fontSize: 16,
          digit: 0, //小数位数
        },
        customConverseRateDigit: 0, //转化率小数位数
        customArriveRateDigit: 0, //到达率小数位数
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
