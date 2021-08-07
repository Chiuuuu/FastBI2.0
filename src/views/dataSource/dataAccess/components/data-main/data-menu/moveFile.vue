<template>
  <a-modal
    :visible="visible"
    title="选择文件夹"
    cancelText="取消"
    okText="确定"
    @cancel="
      () => {
        $emit('cancel');
      }
    "
    @ok="
      () => {
        $emit('create', form.folderId);
      }
    "
  >
    <a-form-model :form="form" class="resetNameForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
      <a-form-model-item label="选择文件夹" prop="folderId">
        <a-select v-model="form.folderId">
          <a-select-option v-for="item in menuList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
export default {
  name: 'moveFile',
  props: ['visible', 'selected', 'menuList'],
  data() {
    return {
      form: {
        folderId: ''
      }
    }
  },
  watch: {
    selected(selected) {
      this.form.folderId = this.menuList[0] ? this.menuList[0].id : ''
    }
  },
  methods: {
    handleSelectFolder(value) {
      this.folderId = value
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
