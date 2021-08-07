import { hasPermission } from '@/utils/permission'
function checkPermission(el, binding) {
    const { arg, value } = binding
    if (arg && value) {
        const isPermission = hasPermission(value, arg)
        if (!isPermission) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    } else {
        throw new Error(`need roles, like v-hasPermission:[PERMISSION_CODE.OPERATOR.add]="PERMISSION_CODE.OBJECT.datasource"`)
    }
}

export default {
    inserted(el, binding) {
        checkPermission(el, binding)
    },
    update(el, binding) {
        checkPermission(el, binding)
    }
}
