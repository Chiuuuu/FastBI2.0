const getDefaultState = () => {
  return {
    status: '',
    dropType: '',
    mouseEvent: '',
    data: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESETSTATE(state) {
    Object.assign(state, getDefaultState())
  },
  SET_DRAG(state, playload) {
    state = Object.assign(state, playload)
  }
}

const actions = {}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
