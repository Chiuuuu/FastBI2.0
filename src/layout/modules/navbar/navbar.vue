<template>
  <a-row class="navbar" type="flex" justify="end" align="middle">
    <a-select
      :value="selectProject"
      style="min-width: 120px;margin-right:20px;"
      @change="handleChangeProject"
    >
      <a-select-option v-for="item in projectList" :key="item.id">{{
        item.name
      }}</a-select-option>
    </a-select>
    <div class="user">
      <a-dropdown>
        <span
          >{{ userInfo.name
          }}<img src="@/assets/images/icon_head_portrait.png" alt=""
        /></span>
        <a-menu slot="overlay">
          <a-menu-item>
            <a href="javascript:;" @click="quitBtn">退出登录</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </a-row>
</template>
<script>
import { mapState } from 'vuex'
export default {
  inject: ['reload'],
  computed: {
    // 侧边栏展开收起
    sidebarUnfold() {
      return this.$store.state.common.sidebarUnfold
    },
    ...mapState({
      selectProject: state => state.user.selectProject,
      projectList: state => state.user.projectList,
      userInfo: state => state.user.info
    })
  },
  methods: {
    handleChangeProject(value) {
      this.$confirm({
        title: '确认提示',
        content: '是否切换项目?',
        onOk: async () => {
          const result = await this.$server.user.actionSwitchProject(value)
          if (result.code === 200) {
            await this.$store.dispatch('user/changeRole')
            // this.reload()
            // window.location.reload() // 重刷方法1,但是会闪白

            if (this.$route.name === 'dataAccess') { // 如果刚好是数据接入界面, 刷新路由
              this.reload()
            } else {
              this.$router.replace('/')
            }
            this.$store.commit('common/SET_MENUSELECTID', -1)
          } else {
            this.$message.error(result.msg || '请求错误')
          }
        }
      })
    },
    // 退出登录按钮
    quitBtn() {
      this.$store.dispatch('common/set_token', '')
      window.sessionStorage.clear()
      window.localStorage.clear()
      this.$store.commit('user/CLEAR_PERMISSIONS')
      this.$router.push({
        path: '/login'
      })
    },

    // 点击收起展开侧边栏
    sidebarUnfoldBtn() {
      if (this.sidebarUnfold === true) {
        this.$store.commit('common/set_sidebarUnfold', false)
      } else {
        this.$store.commit('common/set_sidebarUnfold', true)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "./navbar.styl";
</style>
