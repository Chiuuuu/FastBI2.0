<template>
  <div class="tab scrollbar">
    <a-row class="line" style="padding-left: 16px">
      <a-col span="2">{{ roleTitle }}</a-col>
      <a-col>
        <a-checkbox-group
          :value="options.permissions"
          :options="options.header"
          :disabled="status === 'show' ? true : false"
          @change="onCheck"
        ></a-checkbox-group>
        <a-button
          v-if="roleTitle === '数据接入'"
          style="margin-left:10px"
          size="small"
          type="primary"
          @click="handleSetVisibleSource"
        >类型</a-button>
      </a-col>
    </a-row>
    <a-row class="title">
      <a-col span="14">
        <span>所有目录</span>
      </a-col>
      <a-col span="2" align="left" v-for="item in injectActionList" :key="item.permission">{{item.name}}</a-col>
      <a-col span="2" align="left" v-if="injectRoleTab === 3">
        <span>可见库组</span>
      </a-col>
    </a-row>
    <div class="checkbox-all">
      <a-row>
        <a-col :span="14">
          <span style="margin-right: 8px">全选</span>
          <a-checkbox :disabled="status === 'show'" :checked="checkAll" @change="handleCheckAll"></a-checkbox>
        </a-col>
        <a-col :span="8">
          <a-checkbox-group :value="injectAllPermission" style="width:100%">
            <a-row>
              <a-col span="5" v-for="(subitem,subindex) in injectActionList" :key="subitem.permission" :style="{
                width: `${100 / injectActionList.length}%`
              }">
                <a-checkbox
                  :class="`custom-checkbox-${subindex+1}`"
                  :value="subitem.permission"
                  @change="(e) => handleCheckbox(subitem, e)"
                  :disabled="status === 'show'"></a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-col>
      </a-row>
    </div>
    <div class="content scrollbar">
      <limit-tree ref="tree" v-on="$listeners" @setTable="handleSetVisibleTable"></limit-tree>
    </div>

    <!-- 可见库组模态框 -->
    <TableSetting ref="table" :visible.sync="visibleTable" v-on="$listeners" />

    <!-- 数据源类型勾选模态框 -->
    <SourceTypeSetting ref="source" :visible.sync="visibleSourceType" v-on="$listeners" />
  </div>
</template>

<script>
import LimitTree from './limit-tree'
import TableSetting from './table-setting.vue'
import SourceTypeSetting from './source-type-setting.vue'
export default {
  name: 'roleLimit',
  inject: [
    'status',
    'getCurrentAllPermission',
    'getProvideActionList',
    'getCurrentRoleTab',
    'getProvideTreeData'
  ],
  props: {
    roleTitle: String,
    options: Object
  },
  data() {
    return {
      visibleSourceType: false,
      visibleTable: false
    }
  },
  components: {
    LimitTree,
    TableSetting,
    SourceTypeSetting
  },
  computed: {
    checkAll() {
      return this.injectAllPermission.length === this.injectActionList.length
    },
    indeterminate() {
      return (
        this.injectAllPermission.length > 0 &&
        this.injectAllPermission.length < this.injectActionList.length
      )
    },
    injectAllPermission() {
      return this.getCurrentAllPermission()
    },
    injectActionList() {
      return this.getProvideActionList()
    },
    injectRoleTab() {
      return this.getCurrentRoleTab()
    },
    injectTreeData() {
      return this.getProvideTreeData()
    }
  },
  methods: {
    // 勾选具体的操作权限
    onCheck(value) {
      this.options.permissions = value
      this.$emit('setBasePrivilege', value, this.injectRoleTab + '')
    },
    // 点击设置具体的库组权限
    handleSetVisibleTable(sourceInfo) {
      this.$refs.table && this.$refs.table.handleSetVisibleTable(sourceInfo)
    },
    // 点击设置具体的数据源类型权限
    handleSetVisibleSource() {
      this.$refs.source && this.$refs.source.handleSetVisibleSource()
    },
    // 根据业务转换成文件权限
    changePermissionToFolder(permission) {
      switch (permission) {
        case 'read':
          return 'folderRead'
        case 'edit':
          return 'folderEdit'
        case 'remove':
          return 'folderRemove'
        default:
          return 'null'
      }
    },
    // 点击全选
    handleCheckAll(e) {
      this.injectActionList.map((item) => {
        this.handleCheckbox(item, e)
      })
    },
    // 处理全选栏按钮
    handleCheckbox({ permission }, e) {
      const checked = e.target.checked
      // 调用limit-tree组件的递归方法赋值权限
      const handleCheckbox = this.$refs.tree.handleCheckbox
      // 遍历树结构
      this.injectTreeData.map((item) => {
        // 文件夹权限和菜单不一致, 分开处理
        if (item.fileType === 0) {
          const perm = this.changePermissionToFolder(permission)
          if (perm !== 'null') {
            handleCheckbox(perm, checked, item)
          }
          // 有子节点则继续遍历
          if (
            item.children &&
            item.children.length &&
            item.children.length > 0
          ) {
            item.children.map((node) => {
              handleCheckbox(permission, checked, node)
            })
          }
        } else if (item.fileType === 1) {
          handleCheckbox(permission, checked, item)
        }
      })

      // 处理全选栏的逻辑
      if (!checked) {
        if (this.injectAllPermission.includes(permission)) {
          if (permission === 'read') {
            this.injectAllPermission.splice(0)
          } else {
            const index = this.injectAllPermission.indexOf(permission)
            this.injectAllPermission.splice(index, 1)
          }
        }
      } else {
        if (!this.injectAllPermission.includes(permission)) {
          this.injectAllPermission.push(permission)
          if (
            permission !== 'read' &&
            !this.injectAllPermission.includes('read')
          ) {
            this.injectAllPermission.push('read')
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.checkbox-all {
  margin-top: 10px;
  margin-left:40px;
  padding: 0 5px;
}
</style>
