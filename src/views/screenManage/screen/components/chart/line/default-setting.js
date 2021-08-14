import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartLine,
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
        xAxis: {
          // X轴
          type: 'category',
          boundaryGap: true,
          nameLocation: 'middle',
          nameGap: 10,
          name: '12312',
          cache: {
            // 控制缓存数据
            name: '12312',
          },
          nameShow: true,
          nameTextStyle: {
            color: '#fff',
            fontSize: '12',
            align: 'center',
            padding: [30, 0, 0, 0],
          },
          axisLabel: {
            // X轴 标签
            show: true,
            color: '#fff',
            fontSize: 12,
            rotate: 0,
          },
          axisLine: {
            // X轴 线
            show: true,
            lineStyle: {
              color: '#fff',
              width: 1,
              type: 'solid',
            },
          },
          splitLine: {
            // 垂直网格线
            show: false,
            lineStyle: {
              width: 1,
              type: 'solid',
              color: '#fff',
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          // Y轴设置
          type: 'value',
          position: 'left',
          name: '名称',
          cache: {
            // 控制缓存数据
            name: '名称',
          },
          nameShow: true,
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#fff',
            fontSize: 12,
            padding: [0, 0, 40, 0],
          },
          axisLabel: {
            // Y轴 标签
            show: true,
            color: '#fff',
            fontSize: 12,
            rotate: 0,
          },
          axisLine: {
            // Y轴 线
            show: true,
            lineStyle: {
              color: '#fff',
              width: 1,
              type: 'solid',
            },
          },
          splitLine: {
            // 水平网格线
            show: true,
            lineStyle: {
              width: 1,
              type: 'solid',
              color: '#fff',
            },
          },
          axisTick: {
            show: true,
          },
        },
        // 系列
        customSeries: {
          label: {
            // 标签
            show: true,
            color: '#fff',
            fontSize: 16,
            position: 'top',
          },
          labelLayout: {
            // 标签是否允许重叠
            hideOverlap: true,
          },
          symbolSize: 4, //标记点大小
          //区域填充样式设置
          areaStyle: {
            opacity: 0, //图形透明度
          },
          lineStyle: {
            width: 2,
          },
          // smooth: false,
        },
        customShowSymbol: true, // 是否显示标记点,
        customLinear: 'line', // 线形 line || curve || trapezoidal
        customIsOpenDataLink: false, // 是否开启图表联动
      },
    },
  },
});
