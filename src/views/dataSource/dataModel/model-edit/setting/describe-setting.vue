<template>
  <a-modal
    :visible="isShow"
    title="编辑描述"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <a-textarea
      v-model="describe"
      placeholder="请输入描述内容"
      style="height:200px;resize:unset"
      :maxLength='200'
    />
    <div style="text-align:right;font-size:12px;"><span>{{describe ? describe.length : 0}}/200</span></div>
  </a-modal>
</template>

<script>
export default {
  name: 'describeSetting',
  props: {
    isShow: Boolean,
    description: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      describe: this.description
    }
  },
  watch: {
    isShow: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.describe = this.description
        }
      }
    }
  },
  methods: {
    handleSave() {
      this.$set(this.$parent.detailInfo, 'description', this.describe)
      this.handleClose()
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>
