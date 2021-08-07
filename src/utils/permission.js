import store from '@/store'
import keys from 'lodash/keys'

/**
 * @export checkObejctPermission 对象模块权限校验
 * @example v-if="checkObejctPermission('1')"
 * @param {String} obj 对象权限
 * @returns {Boolean} 是否有权限
 */
export function checkObejctPermission(value) {
    if (value && typeof value === 'string') {
        const objPermissions = keys(store.state.user.objectModule)
        const hasPermission = objPermissions.includes(value)
        if (!hasPermission && value !== '0000') {
            return checkObejctPermission('0000')
        }
        return hasPermission
    } else {
        return false
    }
}

export function hasPermission(perssionArry, target) {
    let checkType = true
    checkType = perssionArry && Array.isArray(perssionArry)
    if (!checkType) {
        throw Error(`perrssionArry类型应该是数组`)
    }
    checkType = target && typeof target === 'number'
    if (!checkType) {
        throw Error(`target类型应该是数字`)
    }
    if (checkType) {
        let hasPermission = perssionArry.includes(0) || perssionArry.includes(target)
        return hasPermission
    } else {
        return false
    }
}

/**
 * @export checkActionPermission 按钮权限校验
 * @example v-if="checkActionPermission('1', 1 || [1])"
 * @param {String} obj 对象权限
 * @param {Number} value 对象操作权限
 * @returns {Boolean} 是否有权限
 */
export function checkActionPermission(obj, value) {
    const hasObjPermission = checkObejctPermission(obj)
    if (hasObjPermission && value) {
        const actionPermissions = store.state.user.objectModule[obj]
        if (!actionPermissions && obj !== '0000') {
            // 当没有对应的对象权限的时候
            return checkActionPermission('0000', value)
        }
        if (actionPermissions.some(action => action === 0)) {
            // 优先判断是否有全部权限
            return true
        }
        let hasPermission
        if (typeof value === 'number') {
            hasPermission = actionPermissions.includes(value)
        } else if (Array.isArray(value)) {
            hasPermission = actionPermissions.some(action => value.includes(action))
        }
        if (!hasPermission && obj !== '0000') {
            // 当对应的对象权限的时候
            return checkActionPermission('0000', value)
        }
        return hasPermission
    } else {
        return false
    }
}

/**
 *
 * @export getPermissionByTree 根据对应的key获取权限
 * @param {Object} permissionTree 后台返回权限树
 * @param {String} key 关键字
 * @returns
 */
export function getPermissionByTree(permissionTree, key) {
    if (permissionTree && typeof permissionTree === 'object') {
        if (permissionTree.hasOwnProperty(key)) {
            return permissionTree[key]
        } else {
            throw Error(`pemissionTree has't the ${key}`)
        }
    }
}

/**
 *
 * @export getRenderRouter 渲染菜单路由
 * @param {Array} routes 动态的路由
 * @returns
 */
export function getRenderRouter(routes) {
  routes = routes
    .filter(item => {
      if (item.path === '/') {
        return item
      }
    })
    .pop()
  const { children } = routes
  return {
      routes,
      children
  }
}
