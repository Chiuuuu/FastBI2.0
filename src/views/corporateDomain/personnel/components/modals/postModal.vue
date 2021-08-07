<template>
  <a-modal
    title="岗位管理"
    :bodyStyle="bodyStyle"
    :maskClosable="false"
    :visible="visible"
    :footer="null"
    destroyOnClose
    @cancel="handleClose">
    <template v-if="deptList.length > 0">
      <a-form-model ref="form" :model="form" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" labelAlign="left">
        <a-form-model-item label="部门" prop="depart">
          <a-select v-model="form.depart" @change="handleGetPostList" placeholder="请选择部门">
            <a-select-option :value="item.id" v-for="item in deptList" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
      <a-button class="add-button" type="primary" @click="handleAddItem" :disabled="!form.depart">添加岗位</a-button>
      <div ref="scroll" class="form-list scrollbar">
        <div v-for="(post, index) in list" :key="post.name">
          <ModalForm
            :index="index"
            :data="post"
            :activeIndex="activeIndex"
            @edit="handleModalFormEdit"
            @save="handleModalFormSave"
            @cancel="handleModalFormCancel"
            @delete="handleModalFormDelete"></ModalForm>
        </div>
      </div>
    </template>
    <a-empty v-else description="请先添加岗位"></a-empty>
  </a-modal>
</template>

<script>
import modalMixin from '@/components/modal-list-manager/mixin'
export default {
  name: 'personnelPostModal',
  props: {
    deptList: Array
  },
  mixins: [modalMixin],
  data() {
    return {
      spinning: false,
      form: {
        depart: undefined
      },
      list: []
    }
  },
  methods: {
    async handleGetPostList(id) {
      const list = await this.$server.corporateDomain.getPostList(id)
      if (list.code === 200) {
        this.list = list.data
      } else {
        this.list = []
        this.$message.error('获取岗位列表失败')
      }
      this.activeIndex = -1
    },
    /** 保存 */
    handleModalFormSave(formData, index) {
      if (formData.id) {
        this.handleModalFormUpdate(formData, index)
      } else {
        this.handleModalFormAdd(formData, index)
      }
    },
    /** 新增 */
    async handleModalFormAdd(formData, index) {
      const res = await this.$server.corporateDomain.addPost({
        name: formData.name,
        departmentId: this.form.depart
      })
      if (res.code === 200) {
        this.$message.success('保存成功')
        this.handleGetPostList(this.form.depart)
        this.activeIndex = -1
      } else {
        this.$message.error(res.msg)
      }
    },
    handleModalFormEdit(index) {
      this.activeIndex = index
    },
    /** 编辑 */
    async handleModalFormUpdate(formData, index) {
      const res = await this.$server.corporateDomain.updatePost({
        name: formData.name,
        departmentId: this.form.depart,
        id: formData.id
      })
      if (res.code === 200) {
        this.$message.success('保存成功')
        this.handleGetPostList(this.form.depart)
        this.activeIndex = -1
      } else {
        this.$message.error(res.msg)
      }
    },
    /** 删除 */
    async handleModalFormDelete(formData, index) {
      const res = await this.$server.corporateDomain.delePost(formData.id)
      if (res.code === 200) {
        this.$message.success('删除成功')
        this.list.splice(index, 1)
        this.activeIndex = -1
      } else {
        this.$message.error(res.msg)
      }
    },
    /** 取消编辑 */
    handleModalFormCancel(data) {
      this.activeIndex = -1
      if (!data.id) {
        this.list.shift()
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/components/modal-list-manager/modal-common.less";
.form-list {
  height: calc(100% - 120px);
}
</style>
