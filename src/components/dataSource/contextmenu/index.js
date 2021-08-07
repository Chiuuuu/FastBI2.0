import Vue from 'vue'
import isFunction from 'lodash/isFunction'
import tml from './contextMenu.vue'

var _ContextMenu = Vue.extend(tml)
var instance = ''
var ContextMenu = function(options) {
  var defaultOpitons = options || {}
  let mark = document.createElement('div')
  mark.className = 'm-window mask-transparent'
  mark.style.zIndex = '1001'

  mark.onclick = handleRemove

  defaultOpitons.remove = handleRemove
  // 生成组件
  instance = new _ContextMenu({
    propsData: defaultOpitons
  })
  // 组件需要挂载在dom元素上
  instance.vm = instance.$mount()

  function handleRemove() {
    if (isFunction(defaultOpitons['handleMarkCancel'])) {
      defaultOpitons.handleMarkCancel()
    }
    document.body.removeChild(mark)
    document.body.removeChild(instance.vm.$el)
  }
  mark.oncontextmenu = function(e) {
    e.preventDefault()
  }
  document.body.appendChild(mark)
  // append到body
  document.body.appendChild(instance.vm.$el)
  return instance.vm
}

export default ContextMenu
