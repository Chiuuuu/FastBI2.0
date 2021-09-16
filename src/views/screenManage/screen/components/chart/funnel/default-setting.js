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
          show: true,
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
          top: 70,
          right: 170,
          bottom: 60,
          left: 50,
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            position: 'center',
          },
        },
        customFormatterWay: ['name'], // 指标内容选择
        customLabelArrange: 'horizontal', // 排列 horizontal vertical
        customTooltipFormatter: ['name', 'value', 'converse', 'arrive'], //鼠标移入显示
        // 展示环节-转化率/到达率 配置
        customRate: {
          show: true,
          color: '#fff',
          fontSize: 16,
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          labelContent: ['converse'], //显示内容
          position: 'right', //位置 left right
          arrange: 'vertical', // 排列 horizontal vertical
        },
        customIsOpenDataLink: false, // 是否开启图表联动
        customInteractive: {}, // 保存联动数据
      },
    },
  },
});
