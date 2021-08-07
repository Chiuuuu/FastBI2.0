import {
  addCanvasMap,
  bottomCanvasMap,
  copyCanvasMap,
  downCanvasMap,
  removeCanvasMap,
  topCanvasMap,
  upCanvasMap
} from '../../api/canvasMaps/canvas-maps-request'
import { toFirst, toLast, upGo, downGo } from '../../utils/arr-utils'
import { deepClone } from '../../utils/deepClone'

const canvasMaps = {
  state: {
    canvasMap: [], // 画布中的组件，默认插入一个用于调试可动态添加，暂时写死，后期用lowdb缓存
    singleSelected: null, // 单选选中的可拖拽组件id
    contextMenuInfo: { x: 0, y: 0, isShow: false }
  },
  mutations: {
    SET_CANVAS_MAPS(state, maps) {
      if (JSON.stringify(maps) !== '{}') {
        state.canvasMap = [...maps]
      } else {
        state.canvasMap = []
      }
    },
    ADD_CANVAS_MAP(state, nodeInfo) {
      state.canvasMap.push(nodeInfo)
    },
    DEL_CANVAS_MAP(state, chartId) {
      let index = state.canvasMap.findIndex(item => item.id === chartId)
      state.canvasMap.splice(index, 1)
    },
    UPD_CANVAS_MAP(state, { index, newData }) {
      state.canvasMap[index] = newData
    },
    // 单选组件
    SINGLE_SELECT(state, item) {
      if (state.singleSelected === item) return
      state.singleSelected = item
      if (state.singleSelected) {
        console.warn('===single select===' + item)
      }
    },
    // 设置右键菜单信息
    SET_CONTEXT_MENU_INFO(state, info) {
      state.contextMenuInfo = info
    },
    // 设置当前选中的基本属性
    SET_CURRENT_BASE_PROPERTY(state, transformData) {
      let current = state.canvasMap.find(item => {
        return item.id === state.singleSelected
      })
      if (current) {
        current.setting.view = { ...transformData }
      }
    },
    // 设置当前选中的自有属性
    SET_CURRENT_SELF(state, { data, property }) {
      let current = state.canvasMap.find(item => {
        return item.id === state.singleSelected
      })
      if (current) {
        current.setting[property] = { ...data }
      }
    }
  },
  actions: {
    InitCanvasMaps({ commit }, list) {
      commit('SET_CANVAS_MAPS', list)
    },
    AddCanvasMap({ commit }, nodeInfo) {
      commit('ADD_CANVAS_MAP', nodeInfo)
    },
    DelCanvasMap({ commit }, chartId) {
      commit('DEL_CANVAS_MAP', chartId)
    },
    UpdCanvasMap({ commit }, { index, newData }) {
      commit('UPD_CANVAS_MAP', { index, newData })
    },
    SingleSelected({ commit }, selectItem) {
      commit('SINGLE_SELECT', selectItem)
    },
    ToggleContextMenu({ commit }, info) {
      let len = info ? document.body.clientHeight - info.y : 0
      let menuInfo = info
        ? Object.assign({}, info, {
            isShow: true,
            y: len > 223 ? info.y : info.y - len // 223是列表的高
          })
        : { x: 0, y: 0, isShow: false }
      commit('SET_CONTEXT_MENU_INFO', menuInfo)
    },
    HideContextMenu({ commit }) {
      commit('SET_CONTEXT_MENU_INFO', { x: 0, y: 0, isShow: false })
    },
    async ContextMenuCommand({ commit, dispatch, state }, order) {
      commit('SET_CONTEXT_MENU_INFO', { x: 0, y: 0, isShow: false })
      switch (order) {
        case 'top':
          // 如果是置顶
          let topArr = state.canvasMap
          let topIndex = topArr.findIndex(item => {
            return item.id === state.singleSelected
          })
          if (topIndex !== topArr.length - 1) {
            let newArr = toLast(topArr, topIndex)
            topArr = newArr
          }
          commit('SET_CANVAS_MAPS', topArr)
          dispatch('saveScreenData')
          break
        case 'bottom':
          // 置底一个数据 即将数组元素排至开头位置
          let bottomArr = state.canvasMap
          let bottomIndex = bottomArr.findIndex(item => {
            return item.id === state.singleSelected
          })
          if (bottomIndex !== 0) {
            let newArr = toFirst(bottomArr, bottomIndex)
            bottomArr = newArr
          }
          commit('SET_CANVAS_MAPS', bottomArr)
          dispatch('saveScreenData')
          break
        case 'up':
          let upArr = state.canvasMap
          let upIndex = upArr.findIndex(item => {
            return item.id === state.singleSelected
          })
          if (upIndex !== upArr.length - 1) {
            let newArr = downGo(upArr, upIndex)
            upArr = newArr
          }
          commit('SET_CANVAS_MAPS', upArr)
          dispatch('saveScreenData')
          break
        case 'down':
          let downArr = state.canvasMap
          let downIndex = downArr.findIndex(item => {
            return item.id === state.singleSelected
          })
          if (downIndex !== 0) {
            let newArr = upGo(downArr, downIndex)
            downArr = newArr
          }
          commit('SET_CANVAS_MAPS', downArr)

          // 保存图层顺序
          dispatch('saveScreenData')
          break
        case 'copy':
          let current = state.canvasMap.find(item => {
            return item.id === state.singleSelected
          })
          let newMap = deepClone(current) // 深拷贝一个对象并修改默认信息，
          // 修改复制出来的位置信息
          newMap.setting.view.x += 20
          newMap.setting.view.y += 20
          // 新增图表
          let res = await dispatch('addChartData', newMap)
          if (res) {
            commit(
              'SINGLE_SELECT',
              state.canvasMap[state.canvasMap.length - 1].id
            )
          }
          break
      }
    },
    SetBaseProperty({ commit, state }, transformData) {
      if (state.singleSelected) {
        commit('SET_CURRENT_BASE_PROPERTY', transformData)
      }
    },
    SetSelfProperty({ commit, state }, config) {
      if (state.singleSelected) {
        commit('SET_CURRENT_SELF', { data: config, property: 'config' })
      }
    },
    SetApis({ commit, state }, apis) {
      if (state.singleSelected) {
        commit('SET_CURRENT_SELF', { data: apis, property: 'apis' })
      }
    },
    SetSelfDataSource({ commit, state }, source) {
      if (state.singleSelected) {
        commit('SET_CURRENT_SELF', { data: source, property: 'api_data' })
      }
    },
    SetBackGround({ commit, state }, background) {
      if (state.singleSelected) {
        commit('SET_CURRENT_SELF', { data: background, property: 'background' })
      }
    },
    SetModelId({ commit, state }, modelId) {
      if (state.singleSelected) {
        commit('SET_CURRENT_SELF', modelId)
      }
    }
  }
}
export default canvasMaps
