<template>
  <div class="main">
    <a-spin class="main-box" :spinning="spinning">
      <div class="right">
        <a-tabs class="tabs" @change="handleChangeModule">
          <a-tab-pane key="person" tab="人员管理">
            <person-manage ref="person" />
          </a-tab-pane>
          <!-- <a-tab-pane key="user" tab="用户属性">
            <user-prop ref="user" />
          </a-tab-pane> -->
        </a-tabs>
      </div>
    </a-spin>
  </div>
</template>

<script>
import PersonManage from '../persn-content/personManage'
// import UserProp from '../persn-content/userProp'

export default {
  name: 'userMain',
  components: {
    PersonManage
    // UserProp
  },
  data() {
   return {
      spinning: false,
      detailInfo: {}
    }
  },
  methods: {
    handleChangeModule(key) {
      const tab = this.$refs[`${key}`]
      if (tab) {
        tab.handleGetData()
      }
    },
    handleSwitch(value, record) {
      record.enable = value
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../main.less";
</style>
