<template>
  <div class="props-line" v-if="activeIndex !== index">
    <!-- <a-popover>
      <template slot="content">{{ title }}</template>
      <div type="primary" class="overflow">{{ title }}</div>
    </a-popover> -->
    <div class="overflow" :title="title">{{ title }}</div>
    <a-icon class="edit-icon" type="form" @click="handleEditProp" />
  </div>
  <div v-else>
    <a-input style="width:120px" v-model="editValue" size="small"></a-input>
    <a style="margin-right:5px" @click="handleSave">保存</a>
    <a @click="handleCancel">取消</a>
  </div>
</template>

<script>
export default {
  name: 'propsEdit',
  props: {
    title: String,
    activeIndex: Number,
    index: Number
  },
  data() {
    return {
      editValue: this.title
    }
  },
  methods: {
    handleValidateIndex() {
      if (this.activeIndex === -1) {
        return true
      } else {
        this.$message.error('请完成操作')
        return false
      }
    },
    handleEditProp() {
      if (this.handleValidateIndex()) {
        this.$emit('changePropsEdit', this.index)
      }
    },
    handleSave() {
      if (this.editValue.length > 20 || this.editValue.length < 1) {
        return this.$message.error('请输入1-20个字符的属性')
      }
      this.$emit('savePropsEdit', this.index, this.editValue)
    },
    handleCancel() {
      this.$emit('cancelPropsEdit')
    }
  }
}
</script>

<style scoped>
  .props-line {
    width: 208px;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .overflow {
    display: inline-block;
    max-width: 190px;
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
