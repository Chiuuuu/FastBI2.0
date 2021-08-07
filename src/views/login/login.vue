<template>
  <div class="login" flex="main:center cross:center">
    <div class="login_form_wrap">
      <div class="login_banner"></div>
      <div class="login_form" flex="dir:top">
        <!-- <span class="login_title">智能BI可视化平台</span> -->
        <img class="login_title" src="../../assets/images/login/login_logo3.png" />
        <div class="login_title_span">账号登录</div>
        <div class="login_main_form">
          <a-form
            id="components-form-demo-normal-login"
            :form="form"
            class="login-form"
            @submit="handleSubmit"
          >
            <a-form-item>
              <a-input
                size="large"
                v-decorator="[
                  'username',
                  { rules: [{ required: true, message: '请输入用户名！' }] }
                ]"
                placeholder="请输入用户名"
              >
                <a-icon
                  slot="prefix"
                  type="user"
                  style="color:rgba(64, 64, 66, 1);font-size:20px;opacity:0.6;"
                />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                size="large"
                v-decorator="[
                  'password',
                  { rules: [{ required: true, message: '请输入登录密码！' }] }
                ]"
                type="password"
                placeholder="请输入登录密码"
              >
                <a-icon
                  slot="prefix"
                  type="lock"
                  style="color:rgba(64, 64, 66, 1);font-size:20px;opacity:0.6;"
                />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-checkbox
                style="width:100%;height:40px"
                v-decorator="[
                  'remember',
                  {
                    valuePropName: 'checked',
                    initialValue: true
                  }
                ]"
              >
                记住登录状态
              </a-checkbox>
            </a-form-item>
            <a-form-item>
              <a-button
                style="width:100%;height: 50px;"
                size="large"
                type="primary"
                html-type="submit"
                class="login-form-button"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import omit from 'lodash/omit'
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this)
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        let params = {
          ...values
        }
        this.$server.login.actionLogin(params).then(res => {
          if (res.code === 200) {
            this.$store.dispatch('common/set_token', res.token)
            const { query } = this.$route
            const { redirect } = query
            this.$router.push({
              path: (redirect && redirect !== '/login') ? redirect : '/',
              query: (redirect && redirect !== '/login') ? omit(query, 'redirect') : ''
            })
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    }
  }
}
</script>
