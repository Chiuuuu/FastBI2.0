import cloneDeep from "lodash/cloneDeep"
export function deepClone (obj) {
//   return JSON.parse(JSON.stringify(obj))
// return Object.assign({},obj)
return cloneDeep(obj)
}
