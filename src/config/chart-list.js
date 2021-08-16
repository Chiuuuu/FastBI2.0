import BoardType from '@/views/screenManage/screen/setting/default-type';
const chartList = [
  {
    name: '折线图',
    type: BoardType.ChartLine,
  },
  {
    name: '柱状图',
    type: BoardType.ChartBar,
  },
  {
    name: '饼图',
    type: BoardType.ChartPie,
    sub: [
      {
        name: '普通饼图',
        type: BoardType.ChartPie,
      },
      {
        name: '环形饼图',
        type: BoardType.ChartRingPie,
      },
      {
        name: '嵌套饼图',
        type: BoardType.ChartNestPie,
      },
    ],
  },
  {
    name: '雷达图',
    type: BoardType.ChartRadar,
  },
  {
    name: '仪表盘',
    type: BoardType.ChartGauge,
  },
  {
    name: '散点图',
    type: BoardType.ChartScatter,
  },
  {
    name: '旭日图',
    type: BoardType.ChartSunburst,
  },
  {
    name: '矩形树图',
    type: BoardType.ChartTreemap,
  },
  {
    name: '矩形热力图',
    type: BoardType.ChartHeatmap,
  },
  {
    name: '进度条',
    type: BoardType.ChartProgress,
  },
  {
    name: '表格',
    type: BoardType.ChartTable,
  },
  {
    name: '地图',
    type: BoardType.ChartMap,
  },
];

export default chartList;
