<template>
  <div class="footer">
    <div class="title">数据权限</div>
    <div class="content scrollbar" :class="status === 'show' ? 'show' : ''">
      <!-- <a-tree
        checkable
        :disabled="status === 'show' ? true : false"
        :default-checked-keys="['0-0-1-0', '0-0-0-0']"
        :tree-data="treeData"
        @select="onSelect"
        @check="onCheck"
      /> -->
    </div>
  </div>
</template>
<script>
const treeData = [
  {
    title: 'parent 133',
    key: '0-0',
    children: [
      {
        title: '张晨成',
        key: '0-0-0',
        children: [
          { title: 'leaf1', key: '0-0-0-0' },
          { title: 'leaf2', key: '0-0-0-1' }
        ]
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ key: '0-0-1-0', title: 'zcvc' }]
      }
    ]
  }
]
export default {
    name: 'rolesTabDataPermission',
    props: {
        status: {
            type: String,
            requried: true,
            default: 'show'
        }
    },
    data() {
        return {
            treeData
        }
    },
    methods: {
        onSelect(selectedKeys, info) {
            console.log('selected', selectedKeys, info)
        },
        onCheck(checkedKeys, info) {
            console.log('onCheck', checkedKeys, info)
        }
    }
}
</script>
