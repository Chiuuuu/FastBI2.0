<template>
  <div class="tree-block scrollbar">
    <!-- 全选按钮 -->
    <a-checkbox
      v-if="checkable"
      :checked="totalCheckedKeys.length === fieldList.length"
      @change="handleCheckAll($event, 'dimension')"
    >
      {{ checkAllText }}
    </a-checkbox>
    <a-tree
      :checkedKeys="checkedKeys"
      :selectedKeys="checkedKeys"
      :checkable="checkable"
      :tree-data="treeData"
      defaultExpandAll
      @check="onCheck"
      @select="onSelect"
    />
  </div>
</template>

<script>
import loadsh from 'lodash';
import groupBy from 'lodash/groupBy';
export default {
  name: '',
  props: {
    checkable: Boolean,
    checkAllText: {
      type: String,
      default: '全选',
    },
    keyword: {
      type: String,
      default: '',
    },
    fieldList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      checkedNodes: [],
    };
  },
  computed: {
    // 过滤查询前的所有选中项
    totalCheckedKeys() {
      return this.checkedNodes.map(item => item.id);
    },
    // 搜索结果
    searchResultFields() {
      const word = this.keyword.trim().toLowerCase();
      return this.fieldList.filter(item => {
        let alias = item.alias || '';
        return alias.toLowerCase().indexOf(word) > -1;
      });
    },
    // 当前搜索结果的选中项(如果不过滤会报错)
    checkedKeys() {
      const list = [];
      this.searchResultFields.forEach(item => {
        if (this.totalCheckedKeys.includes(item.id)) {
          list.push(item.id);
        }
      });
      return list;
    },
    // 根据搜索关键词变化, 获取新的树节点
    treeData() {
      const treeData = [];
      const arr = groupBy(this.searchResultFields, 'tableNo');
      Object.values(arr).map((parent, index) => {
        treeData.push({
          title: parent[0].tableName,
          key: index,
          alias: parent[0].tableName,
          children: parent.map(item => ({
            // 由于需要判断disabled值, 要遍历一遍列表, 不能直接指向parent
            ...item,
            title: item.alias,
            key: item.id,
            disabled: !item.visible,
          })),
        });
      });
      return treeData;
    },
  },
  watch: {
    checkedNodes(nodes) {
      this.$emit('updateNodes', nodes);
    },
  },
  methods: {
    onSelect(checkedKeys, info) {
      if (this.checkable) return;
      const nodeData = info.node.dataRef;
      if (!nodeData.children) {
        this.$emit('updateNodes', new Array(nodeData));
      }
    },
    onCheck(checkedKeys, info) {
      const nodeData = info.node.dataRef;
      let nodes = [];
      // 非叶子结点
      if (nodeData.children) {
        nodes = nodeData.children;
      } else {
        nodes = new Array(nodeData);
      }
      this.updateNodes(nodes, info.checked);
    },
    // 点击全选
    handleCheckAll(event) {
      const value = event.target.checked;
      this.checkedNodes = value ? this.fieldList : [];
    },
    // 更新选中的节点
    updateNodes(nodes, checked) {
      if (checked) {
        this.checkedNodes = loadsh.uniqBy(this.checkedNodes.concat(nodes), 'id');
      } else {
        const backup = [].concat(this.checkedNodes);
        loadsh.remove(backup, item => nodes.some(n => n.id === item.id));
        this.checkedNodes = backup;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.tree-block {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  padding: 10px;
}
</style>
