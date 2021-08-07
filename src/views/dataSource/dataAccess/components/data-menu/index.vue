<template>
  <div class="menu" id="menuRef">
    <div class="menu_title">
      <span class="m-t-s">数据接入</span>
      <a-dropdown v-if="hasPermissionSourceAdd || hasPermissionFolderAdd" :trigger="['click']" placement="bottomLeft">
        <a class="ant-dropdown-link">
          <a-icon type="plus-square" class="menu_icon" />
        </a>
        <a-menu slot="overlay" class="drow_menu">
          <a-menu-item v-if="hasPermissionSourceAdd" v-on:click="showModal">
            添加连接
          </a-menu-item>
          <a-menu-item v-if="hasPermissionFolderAdd" key="1" @click="handleAddNewFolder">
            新建文件夹
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <a-modal
        v-model="visible"
        title="添加连接"
        :footer="null"
        :bodyStyle="{
          maxHeight: `calc( 100vh - 160px )`,
          overflowY: 'auto'
        }"
      >
        <a-row :gutter="[8, 8]">
          <template v-if="modelList.length > 0">
            <a-col v-for="item in modelList" :key="item.type" :span="24 / 3">
              <a-card
                hoverable
                :bodyStyle="{ padding: '10px 0', fontSize: '12px' }"
                @click="handleSelectModelType($event, item)"
              >
                <img
                  slot="cover"
                  :alt="item.name"
                  class="card-img"
                  :src="item.imgurl"
                />
                <div class="card-title">{{ item.name }}</div>
              </a-card>
            </a-col>
          </template>
          <a-empty v-else description="暂无数据源类别权限"></a-empty>
        </a-row>
      </a-modal>
    </div>
    <div class="menu_search">
      <a-input placeholder="搜索数据接入名称" @input="handleSearchMenu">
        <a-icon class="icon_search" slot="suffix" type="search" />
      </a-input>
    </div>
    <a-empty v-if="menuList.length === 0" class="table_list-_empty">
      <span slot="description">暂无数据库连接</span>
    </a-empty>
    <template v-else>
      <!-- <p class="menu_tips">右键文件夹或选项有添加，重命名等操作</p> -->
      <div class="menu-wrap scrollbar" @dragover.stop="handleDragOver" @drop="handleWrapDrop">
        <div
          class="group"
          :class="handleIsFolder(folder, 'items') ? 'is-folder' : ''"
          v-for="(folder, index) in menuList"
          :key="folder.id"
        >
          <template v-if="handleIsFolder(folder, 'items')">
            <menu-folder
              :folder="folder"
              :index="index"
              :contextmenus="folderContenxtMenu"
              @fileDrop="handleFileDrop"
            >
              <template v-slot:file="slotProps">
                <menu-file
                  icon="dataSource"
                  :file="slotProps.file"
                  :index="slotProps.index"
                  :parent="folder"
                  :isSelect='fileSelectId === slotProps.file.id'
                  :contextmenus="fileContenxtMenu"
                  @fileSelect="handleFileSelect"
                  @fileDrag="handleFileDrag"
                ></menu-file>
              </template>
            </menu-folder>
          </template>
          <template v-else>
            <ul class="items">
              <menu-file
                icon="dataSource"
                :file="folder"
                :index="index"
                :isSelect='fileSelectId === folder.id'
                :contextmenus="fileContenxtMenu"
                @fileSelect="handleFileSelect"
                @fileDrag="handleFileDrag"
              ></menu-file>
            </ul>
          </template>
        </div>
      </div>
    </template>
    <reset-name-modal
      ref="resetNameForm"
      :visible="resetNameVisible"
      :reset-type="1"
      :reset-name="resetName"
      @cancel="handleResetNameCancel"
      @create="handleResetNameCreate"
    ></reset-name-modal>
    <move-file-modal
      :visible="moveFileVisible"
      :selected="selectFile"
      :menuList="folderList"
      @cancel="moveFileVisible = false"
      @create="handleFileMoveCreate"
    ></move-file-modal>
  </div>
</template>

<script>
import ResetNameModal from '../data-main/data-menu/resetName'
import MoveFileModal from '../data-main/data-menu/moveFile'
import { mapState } from 'vuex'
import { menuSearchLoop } from '@/utils/menuSearch'
import { checkActionPermission, hasPermission } from '@/utils/permission'
import { fetchTableInfo, fetchDeleteMenuById } from '../../../../../api/dataAccess/api'
import MenuFile from '@/components/dataSource/menu-group/file'
import MenuFolder from '@/components/dataSource/menu-group/folder'
import debounce from 'lodash/debounce'

const modelList = [
  { name: 'mysql', type: '1' },
  { name: 'oracle', type: '2' },
  { name: 'hive', type: '5' },
  { name: 'excel', type: '11' },
  { name: 'csv', type: '12' }
]
export default {
  name: 'dataMenu',
  props: {
    menuData: {
      type: String,
      default: ''
    }
  },
  components: {
    ResetNameModal,
    MoveFileModal,
    MenuFile,
    MenuFolder
  },
  data() {
    return {
      searchValue: '', // 关键词搜索
      searchList: [], // 搜索结果
      // fileSelectId: '', // 选中左侧菜单
      resetNameVisible: false, // 重命名弹窗显示
      resetName: {
        item: '',
        type: '',
        parentId: ''
      }, // 选中文件夹
      selectFile: null, // 选中文件
      dragFile: null, // 选中文件
      moveFileVisible: false, // 移动文件夹弹窗
      menuNode: {
        // 存储节点
        targetNode: {}, // 目标节点
        parentNode: {} // 父级节点
      },
      folderContenxtMenu: [
        {
          name: '添加连接',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.add,
            OBJECT: this.$PERMISSION_CODE.OBJECT.datasource
          },
          onClick: this.showModal
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
            OBJECT: this.$PERMISSION_CODE.OBJECT.sourceFolder
          },
          onClick: this.handleFolderResetName
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove,
            OBJECT: this.$PERMISSION_CODE.OBJECT.sourceFolder
          },
          onClick: this.handleFolderDelete
        }
      ],
      fileContenxtMenu: [
        {
          name: '移动到',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit
          },
          onClick: this.handleFilemoveFile
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit
          },
          onClick: this.handleFileResetName
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove
          },
          onClick: this.handleFileDelete
        }
      ],
      icon: false,
      visible: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    }
  },
  computed: {
    ...mapState({
      tableList: state => state.dataAccess.menuList,
      sourceType: state => state.user.sourceType,
      roles: state => state.user.roles
    }),
    modelList() {
      let isAll = false
      let whiteList = []
      // 有黑名单的列表长度<总角色长度, 说明有全类别权限的角色, 直接返回所有
      // if (this.sourceType.length !== this.roles.length) {
      //   isAll = true
      // } else { // 否则先将黑名单转成白名单, 再取并集
        for (const source of this.sourceType) {
          if (typeof source === 'string') {
            const white = source.split(',')
            whiteList = whiteList.concat(modelList.filter(item => white.indexOf(item.type) < 0))
          } else {
            isAll = true
            break
          }
        }
      // }
      // 将并集去重
      let list = []
      if (isAll) {
        list = modelList
      } else {
        list = whiteList.filter((item, index, self) => self.indexOf(item) === index)
      }
      return list.map(function(item) {
        // 弹窗选项列表
        return Object.assign(item, {
          imgurl: require(`@/assets/images/icon_${item.name}.png`)
        })
      })
    },
    menuList() {
      return this.searchValue ? this.searchList : this.tableList
    },
    folderList() {
      return this.tableList.filter(item => item.fileType === 0)
    },
    fileSelectId: {
      get () {
        return this.$store.state.common.menuSelectId
      },
      set (value) {
        this.$store.commit('dataAccess/SET_MODELID', value)
        this.$store.commit('common/SET_MENUSELECTID', value)
      }
    },
    hasPermissionFolderAdd() {
      return checkActionPermission(this.$PERMISSION_CODE.OBJECT.sourceFolder, this.$PERMISSION_CODE.OPERATOR.add)
    },
    hasPermissionSourceAdd() {
      return checkActionPermission(this.$PERMISSION_CODE.OBJECT.datasource, this.$PERMISSION_CODE.OPERATOR.add)
    }
  },
  mounted() {
    this.handleGetMenuList()
    this.$on('fileSelect', this.handleFileSelect)
  },
  methods: {
    /**
    * 获取左侧菜单数据
    */
    handleGetMenuList() {
      this.$store.dispatch('dataAccess/getMenuList', this)
    },
    /**
     * @description 获取表详情信息
    */
    async getTableInfo(url, callback) {
      const result = await this.$server.common.getDetailByMenuId(url)
      if (result.code === 200) {
        if (callback && (callback instanceof Function)) {
          callback(result)
        }
        this.$EventBus.$emit('setFormData')
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 搜索目录列表
     */
    handleSearchMenu: debounce(function(event) {
      const value = event.target.value
      this.searchValue = value
      if (value) {
        this.handleGetSearchList(value)
      }
    }, 400),
    handleGetSearchList(value) {
      let result = []
      this.tableList.map(item => {
        const newItem = menuSearchLoop(item, value)
        if (newItem) result.push(newItem)
      })
      this.searchList = result
      console.log('搜索结果', this.searchList)
    },
    /**
    * 选择左侧菜单
    */
    handleFileSelect(file) {
      if (this.fileSelectId === file.id) return
      this.fileSelectId = file.id
      this.getTableInfo(`/datasource/${file.id}`, result => {
        if (result.code === 200) {
          if (result.data.type === 1) {
            this.$store.dispatch('dataAccess/setModelType', 'mysql')
          } else if (result.data.type === 2) {
            this.$store.dispatch('dataAccess/setModelType', 'oracle')
          } else if (result.data.type === 5) {
            this.$store.dispatch('dataAccess/setModelType', 'hive')
          } else if (result.data.type === 11) {
            this.$store.dispatch('dataAccess/setModelType', 'excel')
          } else if (result.data.type === 12) {
            this.$store.dispatch('dataAccess/setModelType', 'csv')
          }
          this.$store.dispatch('dataAccess/setModelInfo', result.data.properties)
          this.$store.dispatch('dataAccess/setModelName', result.data.name)
        } else {
          this.$store.dispatch('dataAccess/setModelInfo', {})
          this.$store.dispatch('dataAccess/setModelName', '')
        }
      })
      this.$store.commit('dataAccess/SET_DATABASENAME', '')
      this.$store.commit('common/SET_PRIVILEGES', file.privileges || [])
      this.$store.dispatch('dataAccess/setModelId', file.id)
      this.$store.dispatch('dataAccess/setParentId', file.parentId)
      this.$store.dispatch('dataAccess/setFirstFinished', true)
      this.$emit('on-menuChange-componet', 'Main')
      this.$EventBus.$emit('set-tab-index', '1')
    },
    /**
    * 删除菜单
    */
    handleFileDelete(event, item, { file }) {
      this.$confirm({
        title: '确认提示',
        content: '确定删除该数据接入?',
        onOk: async () => {
          const result = await this.$server.common.deleMenuById(`/datasource/catalog/delete/${file.id}`)
          if (result.code === 200) {
            this.handleGetMenuList()
            this.$message.success('删除成功')
            const isSame = file.id === this.fileSelectId
            if (isSame) {
              this.$store.dispatch('dataAccess/setModelType', '')
              this.$store.dispatch('dataAccess/setFirstFinished', false)
            }
          } else {
            this.$message.error(result.msg)
          }
        }
      })
    },
    /**
     * 文件夹删除
     */
    handleFolderDelete(event, index, { folder }) {
      if (folder.children && folder.children.length > 0) {
        return this.$message.error('文件夹下存在数据接入不可删除')
      }
      this.$confirm({
        title: '确认提示',
        content: '确定删除该文件夹?',
        onOk: async () => {
          const result = await this.$server.common.deleMenuById(`/datasource/catalog/delete/${folder.id}`)
          if (result.code === 200) {
            this.handleGetMenuList()
            this.$message.success('删除成功')
            const isSame = folder.id === this.fileSelectId
            if (isSame) this.$store.dispatch('dataAccess/setModelType', '')
          } else {
            this.$message.error(result.msg)
          }
        }
      })
    },
    /**
     * 打开数据类型弹窗
     */
    showModal(e, calle, vm) {
      this.visible = true
      this.$store.dispatch('dataAccess/setModelSelectType', 'new')
      this.$store.dispatch('dataAccess/setParentId', vm ? vm.folder.id : 0)
    },
    /**
    * 修改文件夹名称
    */
    handleFolderResetName(event, item, { folder }) {
      this.resetNameVisible = true
      this.resetName.type = 'reset'
      this.resetName.item = folder
      this.resetName.parentId = 0
    },
    /**
     * 菜单重命名
    */
    handleFileResetName(mouseEvent, event, { file, parent }) {
      this.resetName.type = 'reset'
      this.resetNameVisible = true
      this.resetName.item = file
      this.resetName.parentId = parent ? parent.id : 0
    },
    /**
     * 添加新文件夹
     */
    handleAddNewFolder() {
      this.resetNameVisible = true
      this.resetName.type = 'new'
    },
    /**
     * 是否为文件夹
     */
    handleIsFolder(item) {
      // return item.hasOwnProperty('items')
      return item.fileType === 0
    },
    /**
     * 拖动左侧菜单
     */
    handleFileDrag(file) {
      this.dragFile = file
    },
    /**
     * 拖动后投放到目标文件夹
     */
    async handleFileDrop(folder) {
      if (!this.dragFile || this.dragFile.parentId === folder.id) return
      const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
        fileType: this.dragFile.fileType,
        id: this.dragFile.id,
        name: this.dragFile.name,
        parentId: folder.id,
        type: 1
      })
      if (result.code === 200) {
        this.handleGetMenuList()
        this.$message.success('移动成功')
      } else {
        this.$message.error(result.msg)
      }
    },
    handleDragOver(e) {
      e.preventDefault()
    },
    /**
     * 拖动后投放到最外层目录
     */
    async handleWrapDrop(e) {
      const className = e.toElement.className
      if (className.indexOf('menu-wrap') > -1 && this.dragFile.parentId !== 0) {
        const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
          fileType: this.dragFile.fileType,
          id: this.dragFile.id,
          name: this.dragFile.name,
          parentId: 0,
          type: 1
        })
        if (result.code === 200) {
          this.handleGetMenuList()
          this.$message.success('移动成功')
        } else {
          this.$message.error(result.msg)
        }
      }
    },
    /**
     * 移动文件夹
     */
    handleFilemoveFile(event, index, { parent, file }) {
      this.selectFile = file
      this.moveFileVisible = true
    },
    /**
     * 选择移动文件夹弹窗确认
     */
    async handleFileMoveCreate(parentId) {
      const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
        fileType: this.selectFile.fileType,
        id: this.selectFile.id,
        name: this.selectFile.name,
        parentId: parentId,
        type: 1
      })
      if (result.code === 200) {
        this.handleGetMenuList()
        this.$message.success('移动成功')
      } else {
        this.$message.error(result.msg)
      }

      this.moveFileVisible = false
    },
    /**
     * 选择哪个类型的数据接入
     */
    handleSelectModelType(event, item) {
      event.stopPropagation()
      console.log('model-type', item.name)
      this.visible = false
      this.$store.dispatch('dataAccess/setModelType', item.name)
      this.$store.dispatch('dataAccess/setFirstFinished', false)
      this.$store.dispatch('dataAccess/setModelId', 0)
      this.$store.dispatch('dataAccess/setModelInfo', {})
      this.$store.dispatch('dataAccess/setModelName', '')
      this.$store.commit('dataAccess/SET_DATABASENAME', '')
      this.$store.commit('common/SET_PRIVILEGES', [0])
      this.$EventBus.$emit('resetForm')
      this.$emit('on-menuChange-componet', 'Main')
      this.$EventBus.$emit('set-tab-index', '1')
      this.$store.dispatch('dataAccess/setModelSelectType', '')
    },
    /**
     * 重命名弹窗显示
     */
    handleResetNameModalShow(event, options) {
      this.resetNameVisible = true
    },
    /**
     * 重命名弹窗隐藏
     */
    handleResetNameCancel() {
      this.resetNameVisible = false
    },
    /**
     * 重命名弹窗确定
     */
    handleResetNameCreate(values) {
      if (this.resetName.type === 'new') {
        this.handleAddItem(values)
      } else if (this.resetName.type === 'reset') {
        this.handleResetName(values)
      }
    },
    /**
     * 新增文件夹
     */
    async handleAddItem(values) {
      // const isHas = this.handleHasName(this.tableList, values)
      // if (isHas) return this.$message.error('已存在')
      // const item = {
      //   id: this.tableList.length + 1,
      //   name: values.name,
      //   items: []
      // }
      // this.tableList.push(item)
      const result = await this.$server.common.addMenuFolder('/datasource/catalog', {
        fileType: 0,
        name: values.name,
        parentId: 0,
        type: 1
      })
      if (result.code === 200) {
        this.handleGetMenuList()
        this.$message.success('新建成功')
        this.resetNameVisible = false
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 修改文件夹及菜单名称
     */
    async handleResetName(values) {
      // const target = this.menuNode.targetNode
      // if (values.name === target.name) {
      //   return this.$message.error('名称重复')
      // }

      // const isHas = this.handleHasName(this.tableList, values)
      // if (isHas) return this.$message.error('已存在')

      // this.menuNode.targetNode = Object.assign(target, {
      //   name: values.name
      // })
      const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
        fileType: this.resetName.item.fileType,
        id: this.resetName.item.id,
        name: values.name,
        parentId: this.resetName.parentId || 0,
        type: 1
      })
      if (result.code === 200) {
        this.handleGetMenuList()
        if (this.resetName.item.id === this.fileSelectId) {
          this.$store.commit('dataAccess/SET_MODELNAME', values.name)
        }
        this.$message.success('修改成功')
        this.resetNameVisible = false
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 判断是否有相同名称
     */
    handleHasName(list, values) {
      const isHas = list.filter(item => {
        return item.name === values.name
      })
      console.log(isHas)
      return !!(isHas && isHas.length > 0)
    },
    mouseenter(icon) {
      this.icon = true
    },
    mouseleave() {
      this.icon = false
    }
  }
}
</script>

<style lang="styl" scope>
@import "./menu.styl";
</style>
