<template>
  <div class="menu" id="menuRef">
    <div class="menu_title">
      <span class="m-t-s">素材库</span>
      <!-- 管理按钮 -->
      <span class="menu-manager" @click="showModal">
        <a-icon type="setting" /><span> 管理分组</span>
      </span>
    </div>

    <!-- 分组管理弹窗 -->
    <MenuManager
      :options="modalOptions"
      @refresh="handleGetMenuList"
      @close="modalOptions.visible = false"
    />

    <!-- 搜索栏 -->
    <div class="menu_search">
      <a-input placeholder="搜索分组名称" @input="handleSearchMenu">
        <a-icon class="icon_search" slot="suffix" type="search" />
      </a-input>
    </div>

    <!-- 空数据显示 -->
    <a-empty v-if="menuList.length === 0" class="table_list-_empty">
      <span slot="description">暂无分组</span>
    </a-empty>

    <template v-else>
      <!-- <p class="menu_tips">右键文件夹或选项有添加，重命名等操作</p> -->
      <div class="menu-wrap scrollbar" @dragover.stop="handleDragOver">
        <div class="group" v-for="(folder, index) in menuList" :key="folder.id">
          <ul class="items">
            <MenuFile
              :file="folder"
              :index="index"
              :isSelect="categoryId === folder.id"
              @fileSelect="handleFileSelect"
            ></MenuFile>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { menuSearchLoop } from '@/utils/menuSearch'
import MenuFile from '@/components/dataSource/menu-group/file'
import debounce from 'lodash/debounce'
import MenuManager from '@/components/modal-list-manager'

export default {
  name: 'material-menu',
  props: {
    categoryId: {
      type: String,
      default: ''
    },
    categoryList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  components: {
    MenuFile,
    MenuManager
  },
  data() {
    return {
      searchValue: '', // 关键词搜索
      searchList: [], // 搜索结果
      modalOptions: {
        visible: false,
        title: '分组',
        max: 10,
        list: this.categoryList.slice(1),
        add: this.handleCategoryAdd,
        delete: this.handleCategoryDelete,
        update: this.handleCategoryUpdate
      }
    }
  },
  computed: {
    menuList() {
      return this.searchValue ? this.searchList : this.categoryList
    }
  },
  mounted() {
    this.handleGetMenuList()
  },
  methods: {
    /**
     * 获取左侧菜单数据
     */
    async handleGetMenuList() {
      const result = await this.$server.screenMaterial.getMaterialCategoryList()
      if (result.code === 200) {
        this.$emit('update:categoryList', result.data)
        this.$emit('update:categoryId', result.data[0].id)
        this.modalOptions.list = result.data.slice(1)
      } else {
        this.$message.error(result.msg || '查询分组失败')
      }
    },
    /**
     * 搜索目录列表
     */
    handleSearchMenu: debounce(function (event) {
      const value = event.target.value
      this.searchValue = value
      if (value) {
        this.handleGetSearchList(value)
      }
    }, 400),
    handleGetSearchList(value) {
      let result = []
      this.categoryList.map((item) => {
        const newItem = menuSearchLoop(item, value)
        if (newItem) result.push(newItem)
      })
      this.searchList = result
    },
    /**
     * 选择左侧菜单
     */
    handleFileSelect(file) {
      if (this.categoryId === file.id) return
      this.$emit('update:categoryId', file.id)
    },
    /**
     * 打开数据类型弹窗
     */
    showModal() {
      this.modalOptions = Object.assign({}, this.modalOptions, {
        visible: true,
        list: this.categoryList.slice(1)
      })
    },
    /**
     * 是否为文件夹
     */
    handleIsFolder(item) {
      return item.fileType === 0
    },
    // 添加分组
    handleCategoryAdd(params) {
      if (params.name === '默认分组') {
        return Promise.resolve('组名重复,请重新输入')
      } else if (this.categoryList.length >= 20) {
        return Promise.resolve('最多只能创建20个分组')
      }
      return this.$server.screenMaterial.addCategory(params)
    },
    // 更新分组
    handleCategoryUpdate(params) {
      if (params.name === '默认分组') {
        return Promise.resolve('组名重复,请重新输入')
      }
      return this.$server.screenMaterial.updateCategory(params)
    },
    // 删除分组
    handleCategoryDelete(params) {
      return this.$server.screenMaterial.deleCategory(params.id)
    }
  }
}
</script>

<style lang="styl" scoped>
@import '../../../dataSource/dataAccess/components/data-menu/menu.styl';
.menu-manager {
  cursor: pointer;
  margin-right: 8px;
}
</style>
