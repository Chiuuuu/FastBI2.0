const options = {
  state: {
    dragFile: '', // 拖拽的维度
    dataModel: {}, // 选中的数据模型
    optionsTabsType: 0, // 页面设置选中项 样式/数据/交互
    modelFile: {},
    modelMeasures: [] // 当前度量
  },
  mutations: {
    SET_DRAG_FILE: (state, val) => {
      state.dragFile = val
    },
    SET_DATA_MODEL: (state, val) => {
      state.dataModel = val
    },
    SET_TABS_TYPE: (state, val) => {
      state.optionsTabsType = val
    },
    SET_MODEL_MEASURES: (state, val) => {
      state.modelMeasures = val
    }
  },
  actions: {
    SetDragFile: ({ commit }, val) => {
      commit('SET_DRAG_FILE', val)
    },
    SetDataModel: ({ commit }, val) => {
      commit('SET_DATA_MODEL', val)
    },
    SetTabsType: ({ commit }, val) => {
      commit('SET_TABS_TYPE', val)
    },
    SetModelMeasures: ({ commit }, val) => {
      commit('SET_MODEL_MEASURES', val)
    }
  }
}

export default options
