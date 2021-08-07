<template>
  <a-modal
    :visible="isShow"
    :title="'重命名 ' + renameData.alias"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <a-form-model ref="form" :model="form" :rules="rules">
      <a-form-model-item prop="rename">
        <a-input
          v-model="form.rename"
        />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
export default {
  name: 'renameSetting',
  props: {
    isShow: Boolean,
    renameData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {
        rename: this.renameData.alias
      },
      rules: {
        rename: [
          { required: true, message: '命名不能为空' },
          { min: 1, max: 20, message: '请输入1-20个字符的名称' }
        ]
      }
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form.rename = this.renameData.alias
        }
      }
    }
  },
  methods: {
    handleSave() {
      this.$refs.form.validate((ok) => {
        if (ok) {
          let valid = true
          Object.values(this.$parent.tableFields).forEach(list => {
            if (list.some(item => item.alias === this.form.rename)) {
              valid = false
            }
          })
          if (valid) {
            this.renameData.alias = this.form.rename
            this.$message.success('修改成功')
            this.handleClose()
          } else {
            this.$message.error('存在同名字段, 请重新命名')
          }
        }
      })
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>
