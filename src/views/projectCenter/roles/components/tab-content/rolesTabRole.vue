<template>
  <div class="middle">
    <div class="title">角色权限</div>
    <a-tabs class="tabs scrollbar" @change="handleChangeTab">
      <a-tab-pane
        forceRender
        :key="1"
        tab="数据大屏"
      >
        <a-spin :spinning="spinning1">
          <role-limit
            v-on="$listeners"
            ref="module1"
            role-title="数据大屏"
            :options="modulePermission[1] || {}"
          />
        </a-spin>
      </a-tab-pane>
      <a-tab-pane
        forceRender
        :key="2"
        tab="数据模型"
      >
        <a-spin :spinning="spinning2">
          <role-limit
            v-on="$listeners"
            ref="module2"
            role-title="数据模型"
            :options="modulePermission[2] || {}"
          />
        </a-spin>
      </a-tab-pane>
      <a-tab-pane
        forceRender
        :key="3"
        tab="数据接入"
      >
        <a-spin :spinning="spinning3">
          <role-limit
            v-on="$listeners"
            ref="module3"
            role-title="数据接入"
            :options="modulePermission[3] || {}"
          />
        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import RoleLimit from '../limitTree/role-limit'
export default {
  name: 'rolesTabRole',
  provide() {
    return {
      getProvideActionList: () => this.actionList,
      getProvideTreeData: () => this.treeData,
      getCurrentRoleTab: () => this.currentTab,
      getFolderHeader: () => this.folderHeader,
      getCurrentAllPermission: () => this.moduleListAll[this.currentTab],
      getSourceTypeList: () => this.sourceTypeList,
      status: this.status
    }
  },
  props: {
    status: {
      type: String,
      requried: true,
      default: 'show'
    }
  },
  computed: {
    ...mapState({
      roleId: state => state.projectRoles.roleId
    }),
    actionList() {
      return this.moduleList[this.currentTab]
    },
    treeData() {
      return this.treeList[this.currentTab]
    }
  },
  components: {
    RoleLimit
  },
  data() {
    return {
      spinning1: false,
      spinning2: false,
      spinning3: false,
      currentTab: 1,
      modulePermission: {}, // 模块权限
      // 模块对应的业务权限
      moduleList: {
        1: [],
        2: [],
        3: []
      },
      // 模块对应的全选业务权限
      moduleListAll: {
        1: [],
        2: [],
        3: []
      },
      treeList: {}, // 模块对应的树节点
      folderHeader: [], // 文件夹权限
      sourceTypeList: 'all'
    }
  },
  mounted() {
    if (this.$route.params.id) {
      this.handleGetData()
    }
    this.$EventBus.$on('roleFileSelect', this.handleGetData)
  },
  beforeDestroy() {
    this.handleReset()
    this.$EventBus.$off('roleFileSelect', this.handleGetData)
  },
  methods: {
    handleChangeTab(activeKey) {
      this.currentTab = activeKey
    },
    handleGetFolderPermissions() {
      this.$server.projectCenter.getFolderHeader().then(res => {
        if (res.code === 200) {
          this.folderHeader = res.data
        } else {
          this.$message.error('获取文件夹权限失败')
        }
      })
    },
    handleGetSourceType() {
      this.$server.projectCenter.getRoleSourceType(this.$store.state.projectRoles.roleId)
        .then(res => {
          if (res && res.code === 200) {
            let list = 'all'
            if (res.data && res.data.forbiddenType) {
              list = res.data.forbiddenType || 'all'
            }
            this.sourceTypeList = list
            this.$emit('setSourceType', list) // 先初始化类型
          } else {
            this.$message.error(res.msg || '请求错误')
          }
        })
    },
    handleReset() {
      this.data = this.$options.data()
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
    // 初始化模块全选栏按钮
    initAllCheckbox(index) {
      this.moduleList[index].map(({ permission }) => {
        let stop = false
        for (let i = 0; i < this.treeList[index].length; i++) {
          if (stop) break
          const item = this.treeList[index][i]
          if (item.fileType === 0) {
            const perm = this.changePermissionToFolder(permission)
            if (perm !== 'null' && !item.permissions.includes(perm)) {
              stop = true
              break
            } else if (
              item.children &&
              item.children.length &&
              item.children.length > 0
            ) {
              for (let j = 0; j < item.children.length; j++) {
                const node = item.children[j]
                if (!node.permissions.includes(permission)) {
                  stop = true
                  break
                }
              }
            }
          } else if (item.fileType === 1) {
            if (!item.permissions.includes(permission)) {
              stop = true
              break
            }
          }
        }
        if (!stop) {
          this.moduleListAll[index].push(permission)
        }
      })
    },
    async handleGetData() {
      this.handleReset()
      await this.handleGetFolderPermissions()
      await this.handleGetSourceType()
      // 顺序加载
      this.spinning1 = true
      this.spinning2 = true
      this.spinning3 = true
      for (let i = 1; i < 4; i++) {
        if (!this.roleId && !this.$route.params.id) {
          this.spinning1 = false
          this.spinning2 = false
          this.spinning3 = false
          return
        }
        const result = await this.$server.projectCenter
          .getRoleTree(this.roleId || this.$route.params.id, i)
          .finally(() => {
            this['spinning' + i] = false
          })
        if (result.code === 200) {
          if (result.data) {
            this.$set(this.modulePermission, i, result.data.basePrivilege)
            this.$set(this.moduleList, i, [].concat(result.data.header))
            this.$set(this.treeList, i, [].concat(result.data.folder))
            this.$emit(
              'setBasePrivilege',
              this.modulePermission[i].permissions,
              i + ''
            )
            // 初始化时先记录勾选过的对象
            if (this.status === 'edit') {
              const folder = result.data.folder
              if (Array.isArray(folder)) {
                const list = []
                const addItem = item => {
                  if (item.permissions.length > 0) {
                    // const params = {
                    //   id: item.id,
                    //   permissions: item.permissions,
                    //   name: item.title
                    // }
                    // if (i === 3 && item.fileType === 1) {
                    //   params.dataBasePri = item.dataBasePri
                    // }
                    // list.push(params)
                    list.push(item)
                  }
                }
                folder.map(item => {
                  if (item.permissions.length > 0) {
                    addItem(item)
                  }
                  if (item.children && item.children.length > 0) {
                    item.children.map(leaf => {
                      addItem(leaf)
                    })
                  }
                })
                this.$emit('getChangeItem', i, list)
              }
            }
            // 初始化全选栏
            this.initAllCheckbox(i)
          }
        } else {
          this.$message.error(result.msg || '请求错误')
        }
      }
    }
  }
}
</script>
