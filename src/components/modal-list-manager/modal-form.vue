<template>
  <a-form-model ref="form" :model="form" :rules="rules">
    <a-row>
      <a-col :span="20">
        <a-form-model-item prop="name" class="item-name">
          <a-input :disabled="isEdit" v-model="form.name" />
        </a-form-model-item>
      </a-col>
      <a-col :span="4" class="text-center">
        <a-button type="link" v-show="isEdit" @click="handleEdit" :disabled="isDisabled">编辑</a-button>
        <a-popconfirm title="是否确定删除？" ok-text="确定" cancel-text="取消" @confirm="handleDelete">
          <a-button v-show="isEdit" type="link" style="margin-left:5px;">删除</a-button>
        </a-popconfirm>
        <a-button type="link" v-show="!isEdit" @click="handleSave">保存</a-button>
        <a-button type="link" v-show="!isEdit" @click="handleCancel" style="margin-left:5px;">取消</a-button>
      </a-col>
    </a-row>
  </a-form-model>
</template>
<script>
export default {
  name: 'ModalForm',
  props: {
    index: { // 当前的索引值
      type: Number,
      default: 0
    },
    activeIndex: { // 活动的索引值
      type: Number,
      default: -1
    },
    options: { // 允许输入最大字数
      type: Object,
      default() {
        return {
          title: '',
          max: 20
        }
      }
    },
    data: { // 数据
      type: Object,
      default: () => ({
        name: ''
      })
    }
  },
  data() {
    return {
      form: Object.assign({}, this.data),
      rules: {
        name: [
          { required: true, message: '请输入名称' },
          { max: this.options.max, min: 1, message: `请输入1-${this.options.max}个字的${this.options.title}名称` }
        ]
      }
    }
  },
  computed: {
    // 当前是否在编辑状态
    isEdit() {
      return this.activeIndex !== this.index
    },
    // 是否置灰
    isDisabled() {
      if (this.activeIndex === -1) {
        return false
      } else {
        return this.activeIndex !== this.index
      }
    }
  },
  methods: {
    // 点击编辑
    handleEdit() {
      this.$emit('edit', this.index)
    },
    // 点击保存
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('save', this.form, this.index)
        } else {
          return false
        }
      })
    },
    // 点击删除
    handleDelete() {
      this.$emit('delete', this.data, this.index)
    },
    // 点击取消
    handleCancel() {
      this.form.name = this.data.name
      this.$emit('cancel', this.data)
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .ant-btn-link {
  color: #617bff;
  padding: 0;
}
@{deep} .ant-btn-link[disabled] {
  color: rgba(0, 0, 0, 0.25);
}
@{deep} .ant-form-inline .ant-form-item-with-help {
  margin-bottom: 0;
}
@{deep} .ant-form-item-control {
  line-height: inherit;
}
</style>
