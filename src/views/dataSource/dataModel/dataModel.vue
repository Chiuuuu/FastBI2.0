<template>
  <div class="data-model screen-manage">
    <Menu @getModelInfo="handleEmitMainGetData"></Menu>
    <Main ref="modelMainRef"></Main>
  </div>
</template>

<script>
import Menu from './components/model-menu'
import Main from './components/model-main/main'
import { mapState } from 'vuex'
export default {
  components: {
    Menu,
    Main
  },
  computed: {
    ...mapState({
      fileSelectId: state => state.common.menuSelectId
    })
  },
  mounted() {
    if (this.fileSelectId !== -1) {
      this.handleEmitMainGetData(this.fileSelectId)
    }
  },
  beforeDestroy() {
    this.$store.dispatch('dataModel/setModelId', -1)
    this.$store.commit('dataModel/SET_MODELNAME', '')
    this.$store.commit('common/SET_MENUSELECTID', -1)
  },
  methods: {
    handleEmitMainGetData(id) {
      this.$refs.modelMainRef.handleGetData(id)
    }
  }
}
</script>

<style lang="styl" scoped>
.data-model {
    display: flex;
    justify-content: space-between;
}
</style>
