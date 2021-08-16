import DEFAULT_COLORS from './default-colors';
/**
 * @description 默认公共配置项
 * tabs => 存放tab选项卡的
 * expands => 手风琴活动选项
 */
export default {
  id: '', // 图表的id
  type: '', // 图表的类型
  tabs: [],
  setting: {
    // 配置信息
    data: {
      // 数据
      expands: [],
      dataModelId: '11', // 数据模型id
      filter: {}, // 数据筛选
      options: {
        //数据筛选、排序
        dimensionsLimit: [], // 数据筛选 -- 拖入的维度
        measuresLimit: [], // 数据筛选 -- 拖入的度量
        fileList: [], // 数据筛选 -- 拖入的维度、度量
        sort: [], //数据排序
      },
    },
    style: {
      // 样式
      expands: [],
      position: {
        // 位置
        left: 780,
        top: 405,
      },
      size: {
        // 尺寸
        width: 530,
        height: 400,
      },
      border: {
        // 边框
        color: 'transparent',
        width: 1,
        style: 'solid',
        radius: 0,
      },
      background: {
        // 背景
        color: 'black',
        image: '',
        // 记录背景图url, 之前用background-size: 0px控制, 但是重绘有问题导致背景颜色没渲染
        customImgUrl: '',
      },
      title: {
        // 标题
        text: '',
        show: true,
        marginBottom: 10,
        font: {
          size: 16,
          align: 'center',
          family: 'sans-serif',
          color: 'rgb(217, 217, 217)',
          weight: 'normal',
        },
      },
      echart: {
        color: DEFAULT_COLORS,
      }, // 图表插件的配置
    },
    interaction: {
      // 交互
      expands: [],
    },
  },
};
