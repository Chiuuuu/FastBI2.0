<template>
  <a-row :gutter="16" class="screen-manage">
    <a-col class="gutter-row screen-manage" :span="5">
      <Menu :category-list.sync="categoryList" :category-id.sync="categoryId" />
    </a-col>
    <a-col class="gutter-row screen-manage" :span="19">
      <Main ref="main" />
    </a-col>
  </a-row>
</template>
<script>
import Menu from './components/material-menu'
import Main from './components/main-content'
export default {
  name: 'ScreenMaterial',
  components: {
    Menu,
    Main
  },
  provide() {
    return {
      getCategoryId: this.getCategoryId,
      getCategoryList: this.getCategoryList
    }
  },
  data() {
    return {
      categoryId: '',
      categoryList: []
    }
  },
  watch: {
    categoryId() {
      this.$refs.main && this.$refs.main.handleGetData()
    }
  },
  methods: {
    getCategoryId() {
      return this.categoryId
    },
    getCategoryList() {
      return this.categoryList
    }
  }
}
</script>
