import BoardType from '@/views/screenManage/screen/setting/default-type';
import BASE from '@/views/screenManage/screen/setting/default-base';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(BASE), {
  type: BoardType.ChartMap,
  graphName: '地图',
  setting: {
    data: {
      dimensions: [], // 填充维度
      measures: [], // 填充度量
      longitude: [], // 经度
      latitude: [], // 纬度
      labelDimensions: [], // 散点维度
      labelMeasures: [], // 散点填充度量
      labelLongitude: [], // 散点经度
      labelLatitude: [], // 散点纬度
      customFillDataType: 'area', // 类型（地区:area | 经纬度:dot）
      customLabelDataType: 'area', // 类型（地区:area | 经纬度:dot）
    },
    style: {
      echart: {
        legend: {
          show: false,
          textStyle: {
            color: '#ffffff',
            fontSize: 12,
          },
          itemStyle: {
            color: '#60b8f6',
          },
          itemGap: 12,
          icon: 'roundRect',
          position: 'left-top',
          left: 'left',
          top: 'top',
          orient: 'horizontal',
          align: 'left',
          data: [],
        },
        // 地理坐标系
        geo: {
          type: 'map',
          map: 'guangzhou',
          aspectScale: 0.75,
          zoom: 1.1,
          roam: false,
          label: {
            normal: {
              show: false,
              color: '#fff',
            },
            emphasis: {
              show: false,
            },
          },
          itemStyle: {
            normal: {
              areaColor: 'rgba(1, 33, 92, 0.45)',
              borderColor: 'rgba(147, 235, 248, 1)',
              borderWidth: 2,
              opacity: 1,
            },
            emphasis: {
              borderColor: '#073684',
              areaColor: '#061E3D',
            },
          },
        },
        visualMap: {
          show: false,
          type: 'piecewise', // piecewise | continuous
          min: 0,
          max: 1000,
          seriesIndex: 0, // 对应map层
          inRange: {
            color: ['rgb(79,174,255)', 'rgb(55,115,205)', 'rgb(32,56,156)'],
          },
          calculable: true, // 开启范围控制摇杆
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          left: 'left',
          top: 'bottom',
          itemGap: 10,
          itemSymbol: 'roundRect',
          align: 'left',
        },
        mapStyle: {
          customThemeColor: 'blue', // 记录选择哪组颜色
          customShowLabel: false,
          customPointShowList: [], // 指标显示
          customTextSize: 12,
          customTextColor: '#fff',
          customOrient: 'vertical',
          customShowTooltip: false,
          customTooltipShowList: [], // 提示框显示
        },
        mapSelectList: {
          customPointSelectList: [],
          customTooltipSelectList: [],
        },
        scatterStyle: {
          customShowItem: true, // 展示标记点
          customItemColor: '#60b8f6',
          customItemSymbol: 'circle',
          customItemSize: 10,
          customPointShowList: [], // 指标显示
          customOrient: 'vertical',
          customShowTooltip: false,
          customTooltipShowList: [], // 提示框显示
          customShowLabel: false,
          customTextSize: 12,
          customTextColor: '#fff',
          customTextPosition: 'bottom',
        },
        scatterSelectList: {
          customPointSelectList: [],
          customTooltipSelectList: [],
        },
      },
    },
  },
});
