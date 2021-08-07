<template>
  <a-modal
    title="导入BI库表名设置"
    :visible="isShow"
    destroyOnClose
    :confirmLoading="loading"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <a-spin :spinning="spinning">
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-model-item label="表名名称" prop="name">
          <a-input placeholder="请输入表名名称" v-model="form.name"></a-input>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
export default {
  name: 'CreateView',
  props: {
    isShow: Boolean,
    detailInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.form = this.$options.data().form
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      spinning: false,
      form: {
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入视图名称'
          },
          {
            pattern: new RegExp('^[_a-zA-Z0-9]*$'),
            message: '只能填英文字母数字下划线'
          },
          {
            max: 20,
            message: '请输入1-20个字符的表名名称'
          }
        ]
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    async handleSave() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true
          const params = {
            ...this.detailInfo,
            pivotSchema: {
              ...this.$parent.handleConcat() // 处理维度度量
            },
            viewName: this.form.name
          }
          const result = await this.$server.dataModel.addDataModelTable(params).finally(() => {
            this.loading = false
          })
          if (result.code === 200) {
            this.$message.success({
              content: '创建成功',
              duration: 0.5
            }).then(() => {
              this.$emit('success', result.data.wideTableName)
            })
          } else {
            this.$message.error(result.msg)
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
