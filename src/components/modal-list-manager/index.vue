<!-- 该模态框用于弹窗动态管理某个列表, 包括了新增编辑删除等逻辑 -->
<!-- 暂时仅支持{ id, name }格式的参数, 后续如果有需要再添加映射字段 -->
<template>
  <!-- 传参 -->
  <!-- options.visible: 控制弹窗显示 -->
  <!-- options.title: 标题展示 -->
  <!-- options.list 列表数据 -->
  <!-- options.add 新增方法回调 => promise -->
  <!-- options.update 编辑方法回调 => promise -->
  <!-- options.delete 删除方法回调 => promise -->
  <!-- emit('refresh') 刷新列表事件 -->
  <a-modal
    :title="options.title + '管理'"
    :maskClosable="false"
    :bodyStyle="bodyStyle"
    :visible="options.visible"
    :footer="null"
    destroyOnClose
    @cancel="handleClose">
    <a-spin :spinning="spinning">
      <a-button class="add-button" type="primary" @click="handleAddItem">添加{{ options.title }}</a-button>
      <div ref="scroll" class="form-list scrollbar">
        <div v-for="(depart, index) in list" :key="depart.name">
          <ModalForm
            :index="index"
            :data="depart"
            :activeIndex="activeIndex"
            :options="options"
            @edit="handleModalFormEdit"
            @save="handleModalFormSave"
            @cancel="handleModalFormCancel"
            @delete="handleModalFormDelete"></ModalForm>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import modalMixin from './mixin'

export default {
  name: 'ModalListManager',
  mixins: [modalMixin],
  props: {
    options: {
      type: Object,
      required: true,
      default() {
        return {
          visible: false,
          list: [],
          max: 20,
          update: function() {},
          delete: function() {},
          add: function() {}
        }
      }
    }
  },
  data() {
    return {
      spinning: false,
      list: []
    }
  },
  watch: {
    'options.list'(newValue, oldValue) {
      this.list = [].concat(newValue)
    }
  },
  methods: {
    /** 保存 */
    handleModalFormSave(formData, index) {
      if (formData.id) {
        this.handleModalFormUpdate(formData, index)
      } else {
        this.handleModalFormAdd(formData, index)
      }
    },
    handleModalFormEdit(index) {
      this.activeIndex = index
    },
    /** 新增 */
    async handleModalFormAdd(formData, index) {
      this.spinning = true
      this.options.add({
        name: formData.name
      })
        .then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.activeIndex = -1
            this.$emit('refresh')
          } else {
            this.$message.error(res.msg || res || '新增失败')
          }
        })
        .finally(() => {
          this.spinning = false
        })
    },
    /** 编辑 */
    handleModalFormUpdate(formData, index) {
      this.spinning = true
      this.options.update({
        name: formData.name,
        id: formData.id
      })
        .then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.activeIndex = -1
            this.$emit('refresh')
          } else {
            this.$message.error(res.msg || res || '保存失败')
          }
        })
        .finally(() => {
          this.spinning = false
        })
    },
    /** 删除 */
    handleModalFormDelete(formData, index) {
      this.spinning = true
      this.options.delete(formData)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.list.splice(index, 1)
            this.activeIndex = -1
            this.$emit('refresh')
          } else {
            this.$message.error(res.msg || res || '删除失败')
          }
        })
        .finally(() => {
          this.spinning = false
        })
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

<style scoped>
@import "./modal-common.less";
</style>
