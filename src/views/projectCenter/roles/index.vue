<template>
  <a-row :gutter="16" class="screen-manage">
    <a-col class="gutter-row screen-manage" :span="5">
      <Menu @handleChangeTab="handleChangeTab" />
    </a-col>
    <a-col class="gutter-row screen-manage" :span="19">
      <Main ref="main" />
    </a-col>
  </a-row>
</template>
<script>
import Menu from './components/role-menu'
import Main from './components/role-main'

import { mapState } from 'vuex'
export default {
  name: 'roles',
  components: {
    Menu,
    Main
  },
  data() {
    return {

    }
  },
  methods: {
    handleChangeTab(key) {
      this.$refs.main.activeTab = key
    }
  },
  beforeDestroy() {
    this.$store.commit('projectRoles/SET_ROLEID', 0)
    this.$store.commit('common/SET_MENUSELECTID', -1)
  }
}
</script>
