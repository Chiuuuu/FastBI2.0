const getters = {
  pageSettings: state => state.app.pageSettings, // 页面设置

  canvasRange: state => state.app.canvasRange, // 画布缩放参数

  optionsExpand: state => state.app.optionsExpand, // 参数面板展开

  modelExpand: state => state.app.modelExpand, // 8-14 数据模型展开

  coverageExpand: state => state.app.coverageExpand, // 图层面板展开

  canvasMap: state => state.canvasMaps.canvasMap, // 画布映射数组

  canvasMapIdList: state =>
    state.canvasMaps.canvasMap.length > 0
      ? state.canvasMaps.canvasMap.map(item => item.id)
      : [], // 画板图层id顺序列表

  currentSelected: state => state.canvasMaps.singleSelected, // 当前选中的组件

  currSelected: state =>
    state.canvasMaps.canvasMap.find(
      item => item.id === state.canvasMaps.singleSelected
    ), // 当前选中的组件

  contextMenuInfo: state => state.canvasMaps.contextMenuInfo, // 右键菜单信息

  isScreen: state => state.app.isScreen, // 是否全屏

  dragFile: state => state.options.dragFile, // 拖拽的字段类型

  dataModel: state => state.options.dataModel, // 选中的数据模型

  optionsTabsType: state => state.options.optionsTabsType, // 选中的项 样式/数据/交互

  screenId: state => state.app.screenId, // 大屏id

  fileName: state => state.app.fileName,

  parentId: state => state.app.parentId,

  modelFile: state => state.options.modelFile,

  selectedModelList: state => state.dataModel.selectedModelList, // 选中的数据模型列表

  orginPageSettings: state => state.app.orginPageSettings,

  pageList: state => state.app.pageList, // 页签列表

  isPublish: state => state.app.isPublish,

  modelMeasures: state => state.options.modelMeasures, // 当前度量列表

  currentPageId: state => state.app.currentPageId, // 当前度量列表

  polymerizeType: state => state.app.polymerizeType // 所有聚合方式及中文映射
}

export default getters
