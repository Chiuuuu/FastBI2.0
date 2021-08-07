import ModalForm from './modal-form'

const ModalMixin = {
  props: {
    visible: Boolean
  },
  components: {
    ModalForm
  },
  data() {
    return {
      bodyStyle: { height: 'calc(100vh - 240px)', 'overflow-y': 'auto' },
      list: [],
      activeIndex: -1
    }
  },
  methods: {
    /** 编辑 */
    handleModalFormEdit(index) {
      this.activeIndex = index
    },
    /** 校验是否完成上个item的操作 */
    handleCheckNextToDo() {
      if (this.activeIndex !== -1) {
        this.$message.error('请完成操作')
        return false
      } else {
        return true
      }
    },
    /** 添加 */
    handleAddItem() {
      if (!this.handleCheckNextToDo()) return
      this.list.unshift({
        name: ''
      })
      this.activeIndex = 0
      this.$refs.scroll.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    /** 模态窗关闭 */
    handleClose() {
      if (this.list && this.list.length) {
        if (!this.handleCheckNextToDo()) return
      }
      this.activeIndex = -1
      this.$emit('close')
    }
  }
}

export default ModalMixin
