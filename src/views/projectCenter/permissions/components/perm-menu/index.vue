<template>
  <div class="menu" id="menuRef">
    <div class="menu_title">
      <span class="m-t-s">数据权限管理</span>
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
        :footer="null"
        :bodyStyle="{
          maxHeight: `calc( 100vh - 160px )`,
          overflowY: 'auto'
        }"
      >
        <a-form-model
          :model="form"
          :rules="rules"
          width="500px"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 12 }"
        >
          <a-form-model-item label="角色名称" prop="name">
            <a-input placeholder="请输入角色名称"></a-input>
          </a-form-model-item>
          <a-form-model-item label="角色描述" prop="description">
            <a-input placeholder="请输入角色描述"></a-input>
          </a-form-model-item>
          <a-form-model-item label="存储位置" prop="parantId">
            <a-select v-model="form.parentId">
              <a-select-option v-for="item in folderList" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-form-model>
      </a-modal>
    </div>
    <div class="menu_search">
      <a-input placeholder="搜索数据接入名称" @input="handleSearchMenu">
        <a-icon class="icon_search" slot="suffix" type="search" />
      </a-input>
    </div>
    <a-empty v-if="menuList.length === 0" class="table_list-_empty">
      <span slot="description">暂无角色</span>
    </a-empty>
    <template v-else>
      <!-- <p class="menu_tips">右键文件夹或选项有添加，重命名等操作</p> -->
      <div
        class="menu-wrap scrollbar"
        @dragover.stop="handleDragOver"
        @drop="handleWrapDrop"
      >
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
                  :isSelect="fileSelectId === slotProps.file.id"
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
                :isSelect="fileSelectId === folder.id"
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
      show-title="数据权限"
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
  name: 'permMenu',
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
        parentId: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入权限名称'
          },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '请输入1-20个字的权限名称'
          }
        ],
        description: [
          {
            required: true,
            message: '请输入权限描述'
          },
          {
            type: 'string',
            max: 200,
            min: 1,
            message: '请输入200字以内的权限描述'
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
          name: '重命名',
          onClick: this.handleFileResetName
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
      tableList: state => state.projectPermissions.menuList
    }),
    menuList() {
      return this.searchValue ? this.searchList : this.tableList
    },
    folderList() {
      return this.tableList.filter(item => item.fileType === 0)
    },
    fileSelectId: {
      get() {
        return this.$store.state.projectPermissions.permissionId
      },
      set(value) {
        this.$store.commit('projectPermissions/SET_PERMISSIONID', value)
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
      this.$store.dispatch('projectPermissions/getMenuList', this)
    },
    /**
     * @description 获取表详情信息
     */
    async getTableInfo(url, callback) {
      const result = await this.$server.common.getDetailByMenuId(url)
      if (result.code === 200) {
        if (callback && callback instanceof Function) {
          callback(result)
        }
        this.$EventBus.$emit('setFormData')
      } else {
        this.$message.error(result.msg)
      }
    },
    /**
     * 打开弹窗
     */
    showModal() {
      this.visible = true
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
      // this.getTableInfo(`/datasource/${file.id}`, result => {
      //   this.$store.commit('projectPermissions/SET_PERMISSION_INFO', result.data)
      // })
      this.$store.commit('projectPermissions/SET_PERMISSIONID', file.id)
      this.$store.commit('projectPermissions/SET_PARENTID', file.parentId)
    },
    /**
     * 删除菜单
     */
    handleFileDelete(event, item, { file }) {
      this.$confirm({
        title: '确认提示',
        content: '确定删除该数据接入?',
        onOk: async () => {
          // const result = await this.$server.common.deleMenuById(`/datasource/catalog/delete/${file.id}`)
          // if (result.code === 200) {
          //   this.handleGetMenuList()
          //   this.$message.success('删除成功')
          //   const isSame = file.id === this.fileSelectId
          //   if (isSame) {
          //     this.$store.commit('projectPermissions/SET_PERMISSIONID', 0)
          //   }
          // } else {
          //   this.$message.error(result.msg)
          // }
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
          // const result = await this.$server.common.deleMenuById(`/datasource/catalog/delete/${file.id}`)
          // if (result.code === 200) {
          //   this.handleGetMenuList()
          //   this.$message.success('删除成功')
          //   const isSame = folder.id === this.fileSelectId
          // } else {
          //   this.$message.error(result.msg)
          // }
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
      // eslint-disable-next-line no-useless-return
      if (!this.dragFile || this.dragFile.parentId === folder.id) return
      // const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
      //   fileType: this.dragFile.fileType,
      //   id: this.dragFile.id,
      //   name: this.dragFile.name,
      //   parentId: folder.id,
      //   type: 1
      // })
      // if (result.code === 200) {
      //   this.handleGetMenuList()
      //   this.$message.success('移动成功')
      // } else {
      //   this.$message.error(result.msg)
      // }
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
        // const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
        //   fileType: this.dragFile.fileType,
        //   id: this.dragFile.id,
        //   name: this.dragFile.name,
        //   parentId: 0,
        //   type: 1
        // })
        // if (result.code === 200) {
        //   this.handleGetMenuList()
        //   this.$message.success('移动成功')
        // } else {
        //   this.$message.error(result.msg)
        // }
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
      // const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
      //   fileType: this.selectFile.fileType,
      //   id: this.selectFile.id,
      //   name: this.selectFile.name,
      //   parentId: parentId,
      //   type: 1
      // })
      // if (result.code === 200) {
      //   this.handleGetMenuList()
      //   this.$message.success('移动成功')
      // } else {
      //   this.$message.error(result.msg)
      // }

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
        this.handleAddItem(values)
      } else if (this.resetName.type === 'reset') {
        this.handleResetName(values)
      }
      this.resetNameVisible = false
    },
    /**
     * 新增文件夹
     */
    async handleAddItem(values) {
      // const result = await this.$server.common.addMenuFolder('/datasource/catalog', {
      //   fileType: 0,
      //   name: values.name,
      //   parentId: 0,
      //   type: 1
      // })
      // if (result.code === 200) {
      //   this.handleGetMenuList()
      //   this.$message.success('新建成功')
      // } else {
      //   this.$message.error(result.msg)
      // }

      this.resetNameVisible = false
    },
    /**
     * 修改文件夹及菜单名称
     */
    async handleResetName(values) {
      // const result = await this.$server.common.putMenuFolderName('/datasource/catalog/update', {
      //   fileType: this.resetName.item.fileType,
      //   id: this.resetName.item.id,
      //   name: values.name,
      //   parentId: this.resetName.parentId || 0,
      //   type: 1
      // })
      // if (result.code === 200) {
      //   this.handleGetMenuList()
      //   this.$message.success('修改成功')
      // } else {
      //   this.$message.error(result.msg)
      // }

      this.resetNameVisible = false
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
