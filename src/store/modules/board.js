import store from '@/store'
import { mutationTypes as historyMutation } from '@/store/modules/history'
import boardSetting from '@/views/screenManage/screen/setting'
import mergeWith from 'lodash/mergeWith'
import cloneDeep from 'lodash/cloneDeep'

export const mutationTypes = {
  RESETSTATE: 'board/RESETSTATE',
  ADD_COM: 'board/ADD',
  DELE_COM: 'board/DELE',
  SET_CURCOM: 'board/SET_CURCOM',
  SET_STYLE: 'board/SET_STYLE',
  SET_POSITION: 'board/SET_POSITION',
  SET_CURCOM_STATE: 'board/SET_CURCOM_STATE',
  SET_SHAPE_STYLE: 'board/SET_SHAPE_STYLE',
  SET_PAGE_STYLE: 'board/SET_PAGE_STYLE',
  SET_BOARD_SCALE: 'board/SET_BOARD_SCALE',
  SET_DRAG_MOVE: 'board/SET_DRAG_MOVE',
  SET_BOARD_MODEL: 'board/SET_BOARD_MODEL'
}

export const parameter = {
  EDIT: 'edit',
  PREVIEW: 'preview',
  FULLSCREEN: 'fullScreen'
}

// https://tahazsh.com/vuebyte-reset-module-state
const getDefaultState = () => {
  return {
    model: parameter.EDIT, // edit || preview
    components: [], // 存储画板组件列表
    currentCom: null, // 当前画板选中的组件
    currentComState: 'stop', // 当前画板选中的组件状态
    scale: 1, // 画板的比例
    page: cloneDeep(boardSetting['Page'])
  }
}

// TODO:需要记录上一个组件 prevCom
const state = getDefaultState()

/**
 * @description 合并样式
 * @param {object} state 状态
 * @param {object} style 将要合并的样式
 * @param {array} replaceMerge 替换合并的数组
 * @return {object}
 */
const mergeStyle = function(state, style, replaceMerge) {
  // https://www.lodashjs.com/docs/lodash.mergeWith
  return mergeWith(state.currentCom.setting.style, style, function(
    objValue,
    srcValue
  ) {
    if (replaceMerge && replaceMerge.length) {
      replaceMerge.forEach(key => {
        if (srcValue[key]) {
          objValue[key] = srcValue[key]
        }
      })
    }
  })
}

const mutations = {
  RESETSTATE(state) {
    Object.assign(state, getDefaultState())
  },
  /**
   * 组件列表添加
   * @param {object} Playload
   * @param {object} Playload.component 组件
   * @param {number} Playload.index 组件下标
   */
  ADD(state, { component, index }) {
    store.commit(historyMutation.COMMAND, {
      commandType: 'Add',
      target: state,
      item: component,
      index
    })
  },

  /**
   * 组件列表删除
   * @param {object} Playload
   * @param {object} Playload.component 组件
   * @param {number} Playload.index 组件下标
   */
  DELE(state, { component, index }) {
    store.commit(historyMutation.COMMAND, {
      commandType: 'Dele',
      target: state.components,
      item: component,
      index
    })
    state.currentCom = null
  },

  /**
   * 设置组件的位置
   * @param {object} Playload
   * @param {string} Playload.method 设置的方法
   * @param {number} Playload.index 组件下标
   */
  SET_POSITION(state, { method, index }) {
    store.commit(historyMutation.COMMAND, {
      commandType: 'Position',
      target: state,
      method,
      index
    })
  },
  /**
   * 设置当前组件
   * @param {object} Playload
   * @param {object} Playload.component 组件
   */
  SET_CURCOM(state, { component }) {
    state.currentCom = component
  },

  /**
   * 设置当前组件的状态
   * @param {object} Playload
   * @param {string} Playload.comState 状态
   */
  SET_CURCOM_STATE(state, { comState }) {
    state.currentComState = comState
  },

  /**
   * 设置移动状态下组件的样式
   * @param {object} Playload
   */
  SET_SHAPE_STYLE(state, { style, replaceMerge = ['series'] }) {
    // TODO:图表错乱 根据id对应去修改
    state.currentCom.setting.style = mergeWith(
      state.currentCom.setting.style,
      style,
      mergeStyle(state, style, replaceMerge)
    )
  },

  /**
   * 设置组件的样式
   * @param {object} Playload
   */
  SET_STYLE(state, { style, replaceMerge = ['series'] }) {
    state.currentCom.setting.style = cloneDeep(
      mergeStyle(state, style, replaceMerge)
    )
  },
  /**
   * 设置屏幕比例
   * @param {object} Playload
   * @param {number | string} Playload.scale 比例
   */
  SET_BOARD_SCALE(state, { scale }) {
    state.scale = scale
  },
  /**
   * 设置屏幕模式
   * @param {object} Playload
   * @param {number | string} Playload.model 模式
   */
  SET_BOARD_MODEL(state, { model }) {
    state.model = model
  }
}

const actions = {}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
