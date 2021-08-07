<template>
  <a-modal
    :visible="visible"
    :title="title"
    cancelText="取消"
    okText="确定"
    :afterClose="handleAfterClose"
    @cancel="
      () => {
        $emit('cancel')
      }
    "
    @ok="handleOk"
  >
    <a-form-model
      :model="form"
      :rules="rules"
      ref="resetNameForm"
      class="resetNameForm"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 12 }"
    >
      <a-form-model-item label="名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入文件夹名称" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
export default {
  name: 'newFolder',
  props: ['visible', 'title'],
  data() {
    return {
      form: {
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请填写名称'
          },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '请输入1-20个字的文件夹名称'
          }
        ]
      }
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'form_in_modal' })
  },
  methods: {
    /**
     * 弹出框完成关闭后
     */
    handleAfterClose() {
      this.$refs.resetNameForm.resetFields()
    },
    handleOk() {
      this.$refs.resetNameForm
        .validate()
        .then(res => {
          this.$emit('create', this.form)
        })
        .catch(err => err)
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .resetNameForm .ant-form-explain {
  margin-left: 0;
}
</style>
