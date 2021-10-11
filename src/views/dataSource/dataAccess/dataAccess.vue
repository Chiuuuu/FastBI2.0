<template>
  <a-row :gutter="16" class="screen-manage">
    <a-col class="gutter-row screen-manage" :span="5">
      <Menu ref="menu" @on-menuChange-componet="handleMenuChangeComponet"></Menu>
    </a-col>
    <a-col class="gutter-row screen-manage" :span="19">
      <component
        :is="showWhat"
        @on-change-componet="handleChangeComponet"
        :tabindex="tabindex"
        :fieldInfo="fieldInfo"
      ></component>
    </a-col>
  </a-row>
</template>
<script>
import Menu from './components/data-menu';
import Main from './components/data-main/main';
import Setting from './setting/dataAccess-setting';
export default {
  components: {
    Menu,
    Main,
    Setting,
  },
  data() {
    return {
      showWhat: 'Main',
      tabindex: '1',
      fieldInfo: {},
    };
  },
  provide() {
    return {
      accessInstance: this,
    };
  },
  watch: {
    '$store.state.common.menuSelectId'(newValue) {
      if (newValue === -1) {
        this.showWhat = 'Main';
        this.tabindex = '1';
      }
    },
  },
  methods: {
    handleChangeComponet(componentName, row) {
      this.showWhat = componentName;
      if (componentName === 'Main') {
        this.tabindex = '2';
      } else if (componentName === 'Setting') {
        this.fieldInfo = Object.assign(this.fieldInfo, row);
      }
    },
    handleMenuChangeComponet(componentName) {
      this.showWhat = componentName;
      this.tabindex = '1';
    },
  },
  beforeDestroy() {
    this.$store.dispatch('dataAccess/setModelType', '');
    this.$store.dispatch('dataAccess/setModelId', 0);
    this.$store.dispatch('dataAccess/setFirstFinished', false);
    this.$store.commit('common/SET_MENUSELECTID', -1);
  },
};
</script>
