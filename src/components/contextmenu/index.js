import Vue from 'vue';
import isFunction from 'lodash/isFunction';
import tml from './contextMenu.vue';

var _ContextMenu = Vue.extend(tml);
var instance = '';
var ContextMenu = function (options) {
  var defaultOpitons = options || {};
  let mark = document.createElement('div');
  mark.id = 'js-context-menu-mark';
  mark.className = 'm-window mask-transparent';
  mark.style.zIndex = '1001';

  mark.onclick = handleRemove;

  defaultOpitons.remove = handleRemove;
  // 生成组件
  instance = new _ContextMenu({
    propsData: defaultOpitons,
  });
  // 组件需要挂载在dom元素上
  instance.vm = instance.$mount();

  function handleRemove() {
    if (isFunction(defaultOpitons['handleMarkCancel'])) {
      defaultOpitons.handleMarkCancel();
    }
    mark.remove();
    instance.vm.$el.remove();
  }
  mark.oncontextmenu = function (e) {
    e.preventDefault();
  };
  if (defaultOpitons.markDom) {
    defaultOpitons.markDom.appendChild(mark);
  } else {
    document.body.appendChild(mark);
  }
  if (defaultOpitons.containerDom) {
    defaultOpitons.containerDom.appendChild(instance.vm.$el);
  } else {
    // append到body
    document.body.appendChild(instance.vm.$el);
  }
  return instance.vm;
};

export default ContextMenu;
