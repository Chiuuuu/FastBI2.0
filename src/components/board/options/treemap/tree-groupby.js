/**
 * 将聚合后的列表处理成树结构
 * 注意事项:
 * 1. 最外层叶子节点的value值, 需要将每个维度的值都插入到列表中(按照最外层维度在最后的顺序)
 * 2. value[0]控制矩形的大小
 * 3. 默认的dimension值为1, 即度量值
 */
class TreeGroupBy {
  // 遍历树结构获取pieces列表(视觉映射)
  static handlePieces(tree, index) {
    let result = []
    let i = 0
    if (index === 0) {
      return tree.map(item => ({
        label: item.name,
        value: 'valueBackup' in item ? item.valueBackup : item.value
      }))
    } else {
      loop(tree)
      return result
    }
    function loop(list) {
      list.map(item => {
        if (i === index) {
          result.push({
            label: item.name,
            value: 'valueBackup' in item ? item.valueBackup : item.value
          })
        } else {
          i++
          loop(item.children)
        }
      })
      i-- // 循环结束, 指针回退
    }
  }

  // 递归遍历树结构, 并修改value值(区分矩形等分还是按比例)
  static loopSetTreeValue(tree, isEqual) {
    tree.forEach(node => {
      if (node.children && node.children.length > 0) {
        if (isEqual) {
          node.value = 1
        } else {
          node.value = 'valueBackup' in node ? node.valueBackup : node.value
        }
        this.loopSetTreeValue(node.children, isEqual)
      } else {
        if (isEqual) {
          node.value[0] = 1
        } else {
          node.value[0] = 'valueBackup' in node ? node.valueBackup : node.value
        }
      }
    })
  }

  // 遍历整棵树, 赋值最终叶子节点的value值(视觉映射的dimension)
  static handleLeafValue(datas) {
    let chain = []
    function loop(list) {
      list.forEach(item => {
        chain.push(item.value)
        item.valueBackup = item.value
        if (item.children && item.children.length > 0) {
          loop(item.children)
        } else {
          item.value = chain.concat([item.valueBackup])
          item.value.reverse()
          chain = chain.slice(0, -1)
        }
      })
      chain = chain.slice(0, -1)
    }
    loop(datas)
  }

  constructor(datas, dimensionList, measures) {
    this.max = [0] // 记录每个维度的最大值(用于视觉映射)
    this.tree = [] // 最终输出的树
    this.datas = datas // 数据列表
    this.dimensionList = dimensionList // 维度列表
    this.measures = measures // 度量列表
    this.dimensionIndex = 0 // 当前维度顺序下标
    this.measureKey = this.measures[0].alias // 度量字段名
    /**
     * 生成一个链表, 记录当前根到叶节点的路径
     * chian: { value: any, index: number }[]
     * value: list中的key对应行数据中的值, index: 父节点children中的索引值
    */
    this.chain = [] // 链表
    this.treeGroupBy()
  }

  treeGroupBy() {
    // 遍历
    for (const record of this.datas) {
      // this.max[0] = Math.ceil(Math.max(this.max[0], record[this.measureKey]))
      // 进入遍历, 首先判断当前链表到哪个层级
      this.dimensionIndex = this.chain.length - 1
      while (this.dimensionIndex >= 0 && record[this.dimensionList[this.dimensionIndex]] != this.chain[this.dimensionIndex].value) {
        this.dimensionIndex--
      }

      let node = {}
      // 没找到相同节点, 从根节点开始push
      if (this.dimensionIndex < 0) {
        this.dimensionIndex = 0
        const curKey = this.dimensionList[0]
        const newNode = {
          name: record[curKey],
          column: curKey,
          value: 0,
          parent: {},
          children: []
        }
        // 重置链表
        this.chain.splice(0)
        this.chain.push({
          value: record[curKey],
          index: this.tree.length
        })

        // 插入叶子结点
        this.tree.push(newNode)
        node = newNode
      } else { // 有相同节点, 从该节点开始
        // 获取key后, 查询当前层级有没有生成过该key值的子节点
        let targetNode = this.tree[this.chain[0].index]
        for (let i = 1; i < this.dimensionIndex + 1; i++) {
          targetNode = targetNode.children[this.chain[i].index]
        }
        this.chain = this.chain.slice(0, this.dimensionIndex + 1)
        node = targetNode
      }
      // 已经是最外层节点, 直接在节点里叠加value
      if (this.chain.length === this.dimensionList.length) {
        this.addValue(+record[this.measureKey])
      } else {
        // 找到相同的节点后, 递归遍历该节点的子节点, 然后插入数据
        this.loop(node, record)
      }
    }
  }

  // 递归查询
  loop(parent, record) {
    let len = parent.children.length
    // 寻找当前节点下的子节点是否有已插入的相同节点, 有则value相加
    for (let i = 0; i < len; i++) {
      const item = parent.children[i]
      // 如果有相同节点, 继续往下查询
      if (item.name === record[this.dimensionList[this.dimensionIndex + 1]]) {
        this.dimensionIndex++
        this.chain.push({
          value: item.name,
          index: i
        })
        this.loop(item, record)
        return
      }
    }
    // 没有找到, 就从父节点插入该树
    this.handleNode(parent, record, this.dimensionIndex)
  }

  // 从当前相同的树节点开始生成新的子节点, 插入到节点的children
  handleNode(parent, record, index) {
    index++
    // 创建子节点
    const node = {
      name: record[this.dimensionList[index]],
      column: this.dimensionList[index],
      value: 0,
      parent: {
        name: parent.name,
        column: parent.column,
        parent: parent.parent
      },
      children: []
    }
    // 插入到父节点
    parent.children.push(node)
    // 链表记录层数+1
    this.chain.push({
      value: node.name,
      index: parent.children.length - 1
    })

    // 还没到最底层维度就继续递归
    if (index < this.dimensionList.length - 1) {
      this.handleNode(node, record, index)
    } else if (index === this.dimensionList.length - 1) {
      // 到最外层叶子节点时, 根据链表路径, 把父节点的value都叠加一遍
      this.addValue(+record[this.measureKey])
    }
  }

  // 叠加父节点value值
  addValue(value) {
    let target = this.tree
    this.chain.forEach((item, index) => {
      if (index === 0) {
        target = this.tree[item.index]
      } else {
        target = target.children[item.index]
      }
      // target.value[0] += value
      // target.value[1] += value
      target.value += value
      // 记录当前维度的max值(用于视觉映射)
      const curMax = this.max[this.dimensionList.length - index - 1] || 0
      this.max[this.dimensionList.length - index - 1] = Math.ceil(Math.max(curMax, value))
    })
    this.chain = this.chain.slice(0, -1)
  }

}

export default TreeGroupBy
