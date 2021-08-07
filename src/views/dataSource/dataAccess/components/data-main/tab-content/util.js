export let validateIP = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入服务器ip地址'))
  } else {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    var bl = re.test(value)
    if (!bl) {
      callback(new Error('ip地址格式错误'))
    }
    callback()
  }
}

/**
 * excel文件(数据库对象)
 */
export class MapSheet {
  constructor(mapSheet) {
    this.sheetList = []
    this.tableList = []
    this.isNewFile = !Array.isArray(mapSheet)
    this.formatMapSheet(mapSheet)
  }

  formatMapSheet(mapSheet) {
    if (!mapSheet || Object.keys(mapSheet).length < 1) return
    if (this.isNewFile) {
      const list = Object.entries(mapSheet)
      this.formatSheet(list)
      this.formatTable(list)
    } else {
      this.formatSheet(mapSheet)
    }
  }

  formatSheet(list) {
    let sheetList = []
    if (this.isNewFile) {
      list.map(([key, value]) => {
        sheetList.push({
          name: key
        })
      })
    } else {
      sheetList = sheetList.concat(list)
    }
    this.sheetList = sheetList
  }

  formatTable(list) {
    let tableList = []
    list.map(([key, value]) => {
      tableList.push(value)
    })
    this.tableList = tableList
  }

  addSheet(sheet, index) {
    if (index !== undefined) {
      this.sheetList[index] = sheet
    } else {
      this.sheetList.push(sheet)
    }
  }

  addTable(table, index) {
    if (index !== undefined) {
      this.tableList[index] = table
    } else {
      this.tableList.push(table)
    }
  }
}

// export let findParentId = (menuid, menuList) => {
//     menuList.find(item => {
//         item.
//     })
// }
