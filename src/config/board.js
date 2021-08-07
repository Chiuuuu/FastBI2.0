// 画板默认布局配置
export default {
  // 编辑器功能：头部组件
  header: {
    // 标题配置
    title: {
      text: '当前工作空间'
    },
    // 该功能数据源
    data: [],
    // 初始化数据
    initData: []
  },
  // 左侧功能栏
  coverage: {
    // 是否启用该功能，true: 启用 false: 不启用
    enable: true,
    // 标题配置
    title: {
      enable: true,
      text: '图层'
    },
    // 样式
    style: {
      width: '50px',
      flex: '0 0 50px'
    }
  },
  // 表单元素配置组件
  options: {
    // 标题配置
    title: {
      enable: true,
      text: '页面配置'
    },
    style: {
      width: '290px'
    }
  },
  // 8-14 数据模型侧栏
  model: {
    // 是否启用该功能，true: 启用 false: 不启用
    // enable: true,
    // 标题配置
    title: {
      enable: true,
      text: '大屏数据'
    },
    // 样式
    style: {
      width: '220px'
      // flex: '0 0 180px'
    }
  }
}
