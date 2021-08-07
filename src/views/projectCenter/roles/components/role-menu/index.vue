<template>
  <div class="menu" id="menuRef">
    <div class="menu_title">
      <span class="m-t-s">角色管理</span>
      <a-dropdown :trigger="['click']" placement="bottomLeft">
        <a class="ant-dropdown-link">
          <a-icon type="plus-square" class="menu_icon" />
        </a>
        <a-menu slot="overlay" class="drow_menu">
          <a-menu-item @click="showModal">
            新建角色
          </a-menu-item>
          <a-menu-item key="1" @click="handleAddNewFolder">
            新建文件夹
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <a-modal
        v-model="visible"
        title="添加角色"
        :bodyStyle="{
          maxHeight: `calc( 100vh - 160px )`,
          overflowY: 'auto'
        }"
        :confirmLoading="confirmLoading"
        @cancel="handleCancelModal"
        @ok="handleAddRole"
      >
        <a-form-model ref="addForm" :model="form" :rules="rules" width="500px" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
          <a-form-model-item label="角色名称" prop="name">
            <a-input v-model="form.name" placeholder="请输入角色名称"></a-input>
          </a-form-model-item>
          <a-form-model-item label="角色描述" prop="description">
            <a-input v-model="form.description" placeholder="请输入角色描述"></a-input>
          </a-form-model-item>
          <a-form-model-item label="存储位置" prop="parentId">
            <a-select v-model="form.parentId" placeholder="请选择存储位置" not-found-content="请先新建文件夹">
              <a-select-option v-for="item in folderList" :key="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-form-model>
      </a-modal>
    </div>
    <div class="menu_search">
      <a-input placeholder="搜索角色名称" @input="handleSearchMenu">
        <a-icon class="icon_search" slot="suffix" type="search" />
      </a-input>
    </div>
    <a-empty v-if="menuList.length === 0" class="table_list-_empty">
      <span slot="description">暂无角色</span>
    </a-empty>
    <template v-else>
      <!-- <p class="menu_tips">右键文件夹或选项有添加，重命名等操作</p> -->
      <div class="menu-wrap scrollbar" @dragover.stop="handleDragOver">
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
      show-title="角色"
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
import ResetNameModal from '@/views/projectCenter/components/menu/resetName'
import MoveFileModal from '@/views/projectCenter/components/menu/moveFile'
import { mapState } from 'vuex'
import { menuSearchLoop } from '@/utils/menuSearch'
import MenuFile from '@/components/dataSource/menu-group/file'
import MenuFolder from '@/components/dataSource/menu-group/folder'
import debounce from 'lodash/debounce'
export default {
  name: 'roleMenu',
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
      form: {
        name: '',
        description: '',
        parentId: undefined
      },
      confirmLoading: false,
      rules: {
        name: [
          {
            required: true,
            message: '请输入角色名称'
          },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '请输入1-20个字的角色名称'
          }
        ],
        description: [
          {
            required: true,
            message: '请输入角色描述'
          },
          {
            type: 'string',
            max: 200,
            min: 1,
            message: '请输入200字以内的角色描述'
          }
        ],
        parentId: [
          {
            required: true,
            message: '请选择存储位置'
          }
        ]
      },
      visible: false,
      selectFile: null, // 选中文件
      dragFile: null, // 选中文件
      moveFileVisible: false, // 移动文件夹弹窗
      folderContenxtMenu: [
        {
          name: '添加角色',
          onClick: this.showModal
        },
        {
          name: '重命名',
          onClick: this.handleFolderResetName
        },
        {
          name: '删除',
          onClick: this.handleFolderDelete
        }
      ],
      fileContenxtMenu: [
        {
          name: '移动到',
          onClick: this.handleFilemoveFile
        },
        {
          name: '编辑',
          onClick: this.handleEditRole
        },
        {
          name: '删除',
          onClick: this.handleFileDelete
        }
      ]
    }
  },
  computed: {
    ...mapState({
      tableList: state => state.projectRoles.menuList,
      roleId: state => state.projectRoles.roleId
    }),
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
        this.$store.commit('projectRoles/SET_ROLEID', value)
        this.$store.commit('common/SET_MENUSELECTID', value)
      }
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
      this.$store.dispatch('projectRoles/getMenuList', this)
    },
    /**
     * @description 获取角色详情信息
    */
    async getRoleInfo() {
      const roleInfo = await this.$server.projectCenter.getRoleInfo(this.fileSelectId)
      // const rolePermission = await this.$server.projectCenter.getRolePermission(this.fileSelectId)
      if (roleInfo.code === 200) {
        this.$store.commit('projectRoles/SET_ROLEINFO', roleInfo.data)
        this.$EventBus.$emit('setFormData')
        this.$EventBus.$emit('roleFileSelect')
      } else {
        this.$message.error(roleInfo.msg)
      }
      // if (rolePermission.code === 200) {
      //   this.$EventBus.$emit('setFormData')
      // } else {
      //   this.$message.error(roleInfo.msg)
      // }
    },
    /**
     * 打开弹窗
    */
    showModal(event, item, vm) {
      this.visible = true
      if (vm && vm.folder) {
        this.form.parentId = vm.folder.id
      } else {
        this.form.parentId = undefined
      }
    },
    /**
     * 模态窗取消
    */
    handleCancelModal() {
      this.form = this.$options.data().form
      this.$refs.addForm.resetFields()
      this.confirmLoading = false
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
    },
    /**
    * 选择左侧菜单
    */
    handleFileSelect(file) {
      if (this.fileSelectId === file.id) return
      this.fileSelectId = file.id
      this.getRoleInfo()
      this.$emit('handleChangeTab', 'permission')
      this.$store.commit('projectRoles/SET_PARENTID', file.parentId)
    },
    /**
    * 删除菜单
    */
    handleFileDelete(event, item, { file }) {
      this.$confirm({
        title: '确认提示',
        content: '确定删除该角色?',
        onOk: async () => {
          const result = await this.$server.common.deleMenuById(`/business/role/deleteRole/${file.id}`)
          if (result.code === 200) {
            this.handleGetMenuList()
            this.$message.success('删除成功')
            const isSame = file.id === this.fileSelectId
            if (isSame) {
              this.$store.commit('projectRoles/SET_ROLEID', 0)
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
        return this.$message.error('文件夹下存在角色不可删除')
      }
      this.$confirm({
        title: '确认提示',
        content: '确定删除该文件夹?',
        onOk: async () => {
          const result = await this.$server.common.deleMenuById(`/business/role/deleteCatalog/${folder.id}`)
          if (result.code === 200) {
            this.handleGetMenuList()
            this.$message.success('删除成功')
            const isSame = folder.id === this.fileSelectId
          } else {
            this.$message.error(result.msg)
          }
        }
      })
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
     * 编辑角色
     */
    handleEditRole(event, item, { file }) {
      // 切换至编辑模式
      this.$router.push({
          path: '/projectCenter/roles/edit/id=' + file.id
      })
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
      const result = await this.$server.common.putMenuFolderName('/business/role/editSycCatlog', {
        fileType: this.dragFile.fileType,
        id: this.dragFile.id,
        name: this.dragFile.name,
        parentId: folder.id
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
        const result = await this.$server.common.putMenuFolderName('/business/role/editSycCatlog', {
          fileType: this.dragFile.fileType,
          id: this.dragFile.id,
          name: this.dragFile.name,
          parentId: 0
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
      const result = await this.$server.common.putMenuFolderName('/business/role/editSycCatlog', {
        fileType: this.selectFile.fileType,
        id: this.selectFile.id,
        name: this.selectFile.name,
        parentId: parentId
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
        this.handleAddFolder(values)
      } else if (this.resetName.type === 'reset') {
        this.handleResetName(values)
      }
    },
    /**
     * 新增角色
     */
    handleAddRole() {
      this.$refs.addForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true
          const result = await this.$server.common.addMenuFolder('/business/role/addRole', {
            fileType: 1,
            name: this.form.name,
            description: this.form.description,
            parentId: this.form.parentId
          }).finally(() => {
            this.confirmLoading = false
          })
          if (result.code === 200) {
            this.handleGetMenuList()
            this.$message.success('新建成功')
            this.$store.commit('projectRoles/SET_ROLEID', result.data)
            this.$refs.addForm.resetFields()
            this.fileSelectId = result.data
            this.visible = false
            this.handleEditRole(null, null, { file: { id: result.data } })
          } else {
            this.$message.error(result.msg)
          }
        }
      })
    },
    /**
     * 新增文件夹
     */
    async handleAddFolder(values) {
      const result = await this.$server.common.addMenuFolder('/business/role/addCatalog', {
        fileType: 0,
        name: values.name,
        parentId: 0
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
     * 重命名文件夹
     */
    async handleResetName(values) {
      const result = await this.$server.common.putMenuFolderName('/business/role/editSycCatlog', {
        fileType: this.resetName.item.fileType,
        id: this.resetName.item.id,
        name: values.name,
        parentId: 0
      })
      if (result.code === 200) {
        this.handleGetMenuList()
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
    }
  }
}
</script>

<style lang="styl" scoped>
@import "../../../components/menu/menu.styl";
</style>
