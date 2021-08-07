import hasPermission from './hasPermission'

const install = function(Vue) {
    Vue.directive('hasPermission', hasPermission)
}

if (window.Vue) {
    window['hasPermission'] = hasPermission
    Vue.use(install)
}

hasPermission.install = install
export default hasPermission