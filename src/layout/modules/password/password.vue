<template>
  <a-modal title="修改密码" :visible="modalShow" destroyOnClose :maskClosable="false" @cancel="handleModalCancel">
    <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-model-item label="旧密码" prop="oldPassword">
        <a-input-password v-model="form.oldPassword" style="width: 100%" placeholder="请输入密码"></a-input-password>
      </a-form-model-item>
      <a-form-model-item label="新密码" prop="newPassword">
        <a-input-password v-model="form.newPassword" style="width: 100%" placeholder="请输入新密码"></a-input-password>
      </a-form-model-item>
      <a-form-model-item label="确认密码" prop="confirmPassword">
        <a-input-password
          v-model="form.confirmPassword"
          style="width: 100%"
          placeholder="请输入确认密码"
        ></a-input-password>
      </a-form-model-item>
    </a-form-model>
    <template #footer>
      <a-button key="back" @click="handleModalCancel">取消</a-button>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">确认</a-button>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: 'password',
  data() {
    return {
      modalShow: false,
      confirmLoading: false, // 模态窗口确定按钮 loading
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      rules: {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码' },
          {
            type: 'string',
            max: 20,
            min: 6,
            message: '请输入6-20个字符的密码',
          },
          { validator: this.newPasswordValidate, trigger: 'blur' },
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码' },
          { validator: this.confirmPasswordValidate, trigger: 'change' },
        ],
      },
    };
  },
  methods: {
    // 新密码输入校验
    newPasswordValidate(rule, value, callback) {
      if (/[\u4e00-\u9fa5]/.test(value)) {
        callback(new Error('暂不支持中文密码'));
      } else if (value.length > 20 || value.length < 6) {
        callback(new Error('请输入6~20位密码'));
      } else {
        this.$refs.form.validateField('confirmPassword');
        callback();
      }
    },
    // 确认密码输入校验
    confirmPasswordValidate(rule, value, callback) {
      if (/[\u4e00-\u9fa5]/.test(value)) {
        callback(new Error('暂不支持中文密码'));
      } else if (value !== this.form.newPassword) {
        callback(new Error('确认密码与新密码不一致'));
      } else {
        callback();
      }
    },
    // 初始化
    init() {
      this.modalShow = true;
      this.form = this.$options.data().form;
    },
    // 取消
    handleModalCancel() {
      this.form = this.$options.data().form;
      this.$refs.form.resetFields();
      this.confirmLoading = false;
      this.modalShow = false;
      this.$nextTick(() => {
        this.$emit('close');
      });
    },
    // 确认
    handleOk() {
      this.confirmLoading = true;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.handleUpdatePassword();
        } else {
          this.confirmLoading = false;
        }
      });
    },
    // 修改密码
    async handleUpdatePassword() {
      const params = {
        ...this.form,
      };
      const res = await this.$server.common.resetPassword('business/user/resetPwd', params).finally(() => {
        this.confirmLoading = false;
      });
      if (res.code === 200) {
        this.$message.success('修改成功，请重新登录');
        this.$emit('updateOk');
      } else {
        this.$message.error(res.msg);
      }
    },
  },
};
</script>

<style></style>
