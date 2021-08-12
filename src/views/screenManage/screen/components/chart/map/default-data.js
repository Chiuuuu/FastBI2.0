export default {
  series: [
    {
      type: 'map',
      map: 'guangzhou',
      aspectScale: 0.75,
      showLegendSymbol: false,
      zoom: 1.1,
      roam: false,
      legendHoverLink: false,
      mapLocation: {
        x: 'left',
        y: 'top',
      },
      tooltip: {
        show: true,
        trigger: 'item',
        confine: true,
      },
      label: {
        normal: {
          show: false,
          fontSize: 12,
          color: '#fff',
          formatter: '{b}',
          orient: 'vertical',
        },
        emphasis: {
          show: false,
        },
      },
      itemStyle: {
        normal: {
          areaColor: 'transparent', // 'rgba(1, 33, 92, 0.45)',
          borderColor: 'transparent', // '#215495',
          borderWidth: 1,
          opacity: 1,
        },
        emphasis: {
          borderColor: 'transparent', //'#073684',
          areaColor: '#061E3D',
        },
      },
      data: [],
    },
    {
      type: 'scatter', // scatter,effectScatter
      coordinateSystem: 'geo', // 设置坐标系
      symbol: 'circle',
      symbolSize: 10,
      hoverAnimation: true,
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke',
        scale: 3,
      },
      tooltip: {
        show: true,
        trigger: 'item',
        confine: true,
      },
      label: {
        normal: {
          show: false,
          fontSize: 12,
          color: '#fff',
          position: 'bottom', // 可选inside
          formatter: '{b} ：{a} : {c}',
          orient: 'vertical',
        },
        emphasis: {
          show: true,
        },
      },
      itemStyle: {
        normal: {
          color: '#60b8f6',
          opacity: 1,
        },
        emphasis: {
          borderColor: '#fff',
          borderWidth: 1,
        },
      },
      zlevel: 1,
      data: [],
    },
  ],
};
