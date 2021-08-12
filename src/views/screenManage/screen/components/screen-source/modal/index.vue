<template>
  <a-modal
    :visible="visible"
    width="80vw"
    title="素材库"
    :bodyStyle="bodyStyle"
    :footer="null"
    @cancel="$emit('close')"
  >
    <a-row :gutter="16" class="screen-manage">
      <a-col class="gutter-row screen-manage" :span="5">
        <Menu :category-list.sync="categoryList" :category-id.sync="categoryId" />
      </a-col>
      <a-col class="gutter-row screen-manage" :span="19">
        <Main ref="main" v-on="$listeners" />
      </a-col>
    </a-row>
  </a-modal>
</template>

<script>
import Menu from './modal-menu';
import Main from './modal-main';
export default {
  name: 'screenSourceModal',
  components: {
    Menu,
    Main,
  },
  provide() {
    return {
      getCategoryId: () => this.categoryId,
      getCategoryList: () => this.categoryList,
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      categoryId: '',
      categoryList: [],
      bodyStyle: {
        height: 'calc(80vh - 120px)',
        padding: '15px',
      },
    };
  },
  watch: {
    categoryId(newValue) {
      console.log(newValue);
      this.$refs.main && this.$refs.main.handleGetData();
    },
  },
  methods: {},
};
</script>

<style scoped></style>
