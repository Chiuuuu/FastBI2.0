<template>
  <a-tree
    class="limitTree"
    :tree-data="injectTreeData"
    :replace-fields="replaceFields"
    :selectable="false"
    :blockNode="true"
  >
    <template slot="custom" slot-scope="item" style="color: #f00;width: 100%">
      <a-row>
        <a-col span="14">
          <a-icon style="margin-right:8px" v-if="item.fileType === 0" type="folder" />
          <a-icon style="margin-right:8px" v-else type="file" />
          <span>{{item.title}}</span>
        </a-col>
        <a-col v-if="item.fileType === 0" :span="injectActionList.length * 2">
          <a-checkbox-group :value="item.permissions" style="width:100%">
            <a-row>
              <a-col
                span="5"
                v-for="(subitem,subindex) in injectFolderHeader"
                :key="subitem.permission"
                :style="{
                width: `${100 / injectActionList.length}%`
              }"
              >
                <a-checkbox
                  :class="`custom-checkbox-${subindex+1}`"
                  :value="subitem.permission"
                  @change="(e) => onChange(subitem, e, item)"
                  :disabled="isDisabled"
                ></a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-col>
        <a-col v-if="item.fileType === 1" :span="injectActionList.length * 2">
          <a-checkbox-group :value="item.permissions" style="width:100%">
            <a-row>
              <a-col
                span="5"
                v-for="(subitem,subindex) in injectActionList"
                :key="subitem.permission"
                :style="{
                width: `${100 / injectActionList.length}%`
              }"
              >
                <a-checkbox
                  :class="`custom-checkbox-${subindex+1}`"
                  :value="subitem.permission"
                  @change="(e) => onChange(subitem, e, item)"
                  :disabled="isDisabled"
                ></a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-col>
        <a-col v-if="injectRoleTab === 3 && item.fileType === 1" span="2">
          <a-button
            style="margin-left:10px"
            size="small"
            type="primary"
            @click="$emit('setTable', item)"
          >查看</a-button>
        </a-col>
      </a-row>
    </template>
  </a-tree>
</template>

<script>
export default {
  name: 'limitTree',
  inject: [
    'status',
    'getProvideActionList',
    'getProvideTreeData',
    'getCurrentRoleTab',
    'getFolderHeader'
  ],
  data() {
    return {
      replaceFields: {
        key: 'id'
      }
    }
  },
  computed: {
    isDisabled() {
      return this.status === 'show'
    },
    injectActionList() {
      return this.getProvideActionList()
    },
    injectTreeData() {
      return this.getProvideTreeData()
    },
    injectRoleTab() {
      return this.getCurrentRoleTab()
    },
    injectFolderHeader() {
      return this.getFolderHeader()
    }
  },
  methods: {
    handleCheckbox(permission, checked, item) {
      const readKey = item.fileType === 0 ? 'folderRead' : 'read'
      if (permission === readKey && !checked) {
        // 取消查看则清空
        item.permissions.splice(0)
        // 如果去除了文件的查看权限, 则子节点所有权限全部删除
        if (item.fileType === 0 && item.children && item.children.length > 0) {
          item.children.map((leaf) => {
            this.handleCheckbox('read', checked, leaf)
          })
        } else if (item.fileType === 1 && item.dataBasePri) { // 将数据源的库权限清空
          item.dataBasePri.splice(0)
        }
      }

      if (checked) {
        if (
          item.permissions.length === 0 ||
          (!item.permissions.includes(readKey) &&
            !item.permissions.includes(permission))
        ) {
          item.permissions.push(readKey)
          if (permission !== readKey) item.permissions.push(permission)
          // 勾选查看时将数据源的库组权限都勾上
          if (item.fileType === 1 && item.dataBasePri) {
            item.dataBasePri.splice(0)
            item.dataBasePri.push(item.id)
          }
        } else if (
          item.permissions.includes(readKey) &&
          !item.permissions.includes(permission)
        ) {
          item.permissions.push(permission)
        }

        // 如果子节点勾选了权限, 则父节点(文件夹)也要相应勾上查看权限
        if (item.fileType === 1 && +item.parentId) {
          const parent = this.injectTreeData.find((p) => p.id === item.parentId)
          !parent.permissions.includes('folderRead') &&
            this.handleCheckbox('folderRead', checked, parent)
        }
      } else {
        const index = item.permissions.indexOf(permission)
        item.permissions.splice(index, 1)
      }
      this.$emit('getChangeItem', this.injectRoleTab, item)
    },
    onChange(data, e, item) {
      const { permission } = data
      const checked = e.target.checked
      this.handleCheckbox(permission, checked, item)
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';
.limitTree {
  padding-left: 16px;
  @{deep} li ul {
    padding: 0;
  }
}
</style>
