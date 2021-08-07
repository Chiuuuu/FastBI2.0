<template>
  <a-modal
    :visible="visible"
    :title="title"
    cancelText="取消"
    okText="确定"
    :afterClose="handleAfterClose"
    @cancel="
      () => {
        $emit('cancel');
      }
    "
    @ok="handleOk"
  >
    <a-form-model :model="form" :rules="rules" ref="resetNameForm" class="resetNameForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
      <a-form-model-item label="名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入文件夹名称" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
export default {
  name: 'roleResetName',
  props: ['visible', 'resetName', 'resetType', 'showTitle'],
  computed: {
    title() {
      let title = this.resetName.type === 'reset' ? '重命名' : '新建'
      const fileType = this.resetName.item.fileType
      if (this.resetType === 1) {
        title += (fileType === 1 ? this.showTitle : '文件夹')
      } else if (this.resetType === 2) {
        title += (fileType === 1 ? this.showTitle : '文件夹')
      }
      return title
    }
  },
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
  watch: {
    visible(newValue, oldValue) {
      if (newValue) {
        const type = this.resetName.type
        const name = type === 'reset' ? this.resetName.item.name : ''
        this.$set(this.form, 'name', name)
      }
    }
  },
  methods: {
    /**
     * 弹出框完成关闭后
    */
    handleAfterClose() {
      this.$refs.resetNameForm.resetFields()
    },
    handleOk() {
      this.$refs.resetNameForm.validate()
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
