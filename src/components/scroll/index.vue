<template>
  <div class="scroll-page scrollbar" @scroll="handleScroll">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'scrollPage',
  props: {
    rows: {
      type: [Array, Object],
      default() {
        return [];
      },
    },
    rowHeight: {
      type: [Number, String],
      default: 30,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  mounted() {
    this.initScrollData();
  },
  watch: {
    rows() {
      this.initScrollData();
    },
  },
  data() {
    return {
      pagination: {
        lastScrollTop: 0, // 记录上次滚动位置
        totalIndex: 0, // 最大页数
        headIndex: 0, // 头部截取下标
        footIndex: 4, // 脚部截取下标
        pageSize: 25, // 每次加载数
      },
    };
  },
  methods: {
    /**
     * @description 每次数据变化, 初始化滚动数据
     */
    initScrollData() {
      const len = this.rows.length;
      // 初始化分页信息
      this.pagination = Object.assign(
        {
          lastScrollTop: 0, // 记录上次滚动位置
          totalIndex: 0, // 最大页数
          headIndex: 0, // 头部截取下标
          footIndex: 4, // 脚部截取下标
          pageSize: 25, // 每次加载数
        },
        this.options,
      );
      const { headIndex, footIndex, pageSize } = this.pagination;
      if (len > (footIndex + 1) * pageSize) {
        this.pagination.totalIndex = Math.ceil(len / pageSize);
      }
      this.$emit('change', this.rows.slice(headIndex * pageSize, footIndex * pageSize));
    },
    /**
     * @description 监听滚动事件处理分页
     */
    handleScroll(e) {
      const area = e.target;
      const { scrollTop, scrollHeight, scrollWidth } = area;
      const clientHeight = area.clientHeight;
      let { totalIndex, headIndex, footIndex, pageSize, lastScrollTop } = this.pagination;
      // 临界距离取当前高度的1/5或者5个单元格的高
      const distance = Math.min(clientHeight / 5, this.rowHeight * 5);
      // 向上滚动到顶部临界值
      if (lastScrollTop >= scrollTop && scrollTop < distance) {
        if (--headIndex < 0) {
          headIndex = 0;
          footIndex = 4;
        } else {
          footIndex--;
          this.$emit('change', this.rows.slice(headIndex * pageSize, footIndex * pageSize));
          // 滚动条回滚
          area.scrollTo(scrollWidth, scrollTop + this.rowHeight * pageSize);
        }
      } else if (lastScrollTop <= scrollTop && scrollHeight - clientHeight - scrollTop < distance) {
        // 向下滚动到底部临界值
        if (++footIndex > totalIndex) {
          footIndex = totalIndex;
          headIndex = totalIndex - 4;
        } else {
          headIndex++;
          this.$emit('change', this.rows.slice(headIndex * pageSize, footIndex * pageSize));
          // 滚动条回滚
          area.scrollTo(scrollWidth, scrollTop - this.rowHeight * pageSize);
        }
      }
      Object.assign(this.pagination, {
        headIndex,
        footIndex,
        lastScrollTop: scrollTop,
      });
    },
  },
};
</script>

<style scoped>
.scroll-page {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
</style>
