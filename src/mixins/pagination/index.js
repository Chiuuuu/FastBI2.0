export default {
  data() {
    return {
      pagination: {
        current: 1,
        pageSize: 30,
        total: 0
      }
    }
  },
  methods: {
    // 页码变动
    handlePageChange(page, pageSize) {
      Object.assign(this.pagination, {
        current: page,
        pageSize: pageSize
      })
      this.$nextTick(() => {
        this.handleGetData()
      })
    },
    // 单页数量变动
    handleSizeChange(current, size) {
      Object.assign(this.pagination, {
        current: current,
        pageSize: size
      })
      this.$nextTick(() => {
        this.handleGetData()
      })
    }
  }
}
