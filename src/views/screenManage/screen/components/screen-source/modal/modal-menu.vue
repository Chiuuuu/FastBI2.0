<template>
  <div class="menu-area" id="menuRef">
    <!-- 搜索栏 -->
    <div class="search">
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
      <div class="wrap scrollbar">
        <div class="group" v-for="item in menuList" :key="item.id">
          <ul class="items">
            <li :class="{ active: categoryId === item.id }" @click="handleFileSelect(item)">{{ item.name }}</li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { menuSearchLoop } from '@/utils/menuSearch';
import debounce from 'lodash/debounce';

export default {
  name: 'screenSourceMenu',
  props: {
    categoryId: {
      type: String,
      default: '',
    },
    categoryList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      searchValue: '', // 关键词搜索
      searchList: [], // 搜索结果
    };
  },
  computed: {
    menuList() {
      return this.searchValue ? this.searchList : this.categoryList;
    },
  },
  mounted() {
    this.handleGetMenuList();
  },
  methods: {
    /**
     * 获取左侧菜单数据
     */
    async handleGetMenuList() {
      const result = await this.$server.screenMaterial.getMaterialCategoryList();
      if (result.code === 200) {
        this.$emit('update:categoryList', result.data);
        this.$emit('update:categoryId', result.data[0].id);
      } else {
        this.$message.error(result.msg || '查询分组失败');
      }
    },
    /**
     * 搜索目录列表
     */
    handleSearchMenu: debounce(function (event) {
      const value = event.target.value;
      this.searchValue = value;
      if (value) {
        this.handleGetSearchList(value);
      }
    }, 400),
    handleGetSearchList(value) {
      let result = [];
      this.categoryList.map(item => {
        const newItem = menuSearchLoop(item, value);
        if (newItem) result.push(newItem);
      });
      this.searchList = result;
    },
    /**
     * 选择左侧菜单
     */
    handleFileSelect(file) {
      if (this.categoryId === file.id) return;
      this.$emit('update:categoryId', file.id);
    },
  },
};
</script>

<style lang="less" scoped>
.menu-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  .search {
    padding: 0 4px;
    margin-bottom: 10px;
  }
  .wrap {
    flex: 1;
    overflow-y: auto;
    ul {
      margin: 0;
      padding: 0;
    }
    li {
      cursor: pointer;
      padding: 4px;
      &:hover,
      &.active {
        background: #103ffa;
        color: #fff;
      }
    }
  }
}
</style>
