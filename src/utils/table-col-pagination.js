export default class ColPagination {
  constructor(config = { total: 0, size: 50, page: 1 }) {
    this.config = config
    this.pageList = []
    this.columns = []
    this.tableData = []
    this.currentCol = []
  }

  /**
   * @description 考虑到今后有可能有跳页和改变size的情况, 先实现一个方法缓存记录
   * 设置一个长度为total的数组, 请求的区间缓存到数组, 下请求前做校验
   * @param {Array} colList 列数组
   * @param {Array} rowList 行数组
   * @returns
   */
  handleColCache(colList, rowList) {
    const { size, page, total } = this.config
    const start = size * (page - 1)
    const end = size * page > total ? total - 1 : size * page - 1
    if (this.pageList.length < 1) {
      this.pageList.length = total
      this.columns.length = total
    }
    // 将当前区间数据写入缓存
    for (let s = start; s <= end; s++) {
      this.pageList.splice(s, 1, s)
      this.columns.splice(s, 1, colList[s - start])
    }
    if (this.tableData.length > 0) {
      this.tableData.map((item, index) => {
        return Object.assign(item, rowList[index])
      })
    } else {
      this.tableData = rowList
    }
    this.currentCol = this.columns.slice((page - 1) * size, page * size)
  }

  // 校验当前缓存区间
  validPageSection() {
    const { size, page, total } = this.config
    const start = size * (page - 1)
    const end = size * page > total ? total - 1 : size * page - 1
    if (total < 1) return false
    // 遍历当前区间是否存在缓存
    for (let s = start; s <= end; s++) {
      if (this.pageList[s] === undefined) {
        return false
      }
    }
    this.currentCol = this.columns.slice((page - 1) * size, page * size)
    return true
  }
}
