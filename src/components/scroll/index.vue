<template>
  <!-- 参数
    limit: 保留多少页数据(传0保留所有)
    fit: 宽高是否自适应
    fetch: 异步方法
    pagination: 分页对象
    rows: 传入的数据
    rowHeight: 行高
   -->
  <div :class="{ 'scroll-page': !fit }" class="o-s scrollbar" @scroll="handleScroll">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'scrollPage',
  props: {
    limit: {
      // 保留几页数据(传0保留所有数据)
      type: Number,
      default: 2,
    },
    fit: {
      // 是否自适应宽高
      type: Boolean,
      default: false,
    },
    fetch: {
      // 异步方法
      type: Function,
    },
    pagination: {
      // 分页数据{ pageNo: 页码, pageSize: 单页条数, rowsNum: 从条数 }
      type: Object,
      default() {
        return [];
      },
    },
    rows: {
      // 数据
      type: [Array, Object],
      default() {
        return [];
      },
    },
    rowHeight: {
      // 行高
      type: [Number, String],
      default: 30,
    },
  },
  mounted() {
    this.initScrollData();
  },
  watch: {
    rows() {
      this.initScrollData();
    },
    // 总数传入为0会被视为重置数据
    'pagination.rowsNum'(v) {
      if (v === 0) {
        this.pageData = [];
        this.$emit('change', this.pageData);
      }
    },
  },
  data() {
    return {
      totalPage: 0,
      pageData: [],
      scrollDirection: '',
    };
  },
  methods: {
    /**
     * @description 每次数据变化, 初始化滚动数据
     */
    initScrollData() {
      const { pageNo, rowsNum, pageSize } = this.pagination;
      this.totalPage = Math.ceil(rowsNum / pageSize);
      // 初始化状态
      if (pageNo === 1 && !this.scrollDirection) {
        this.pageData = this.doWithPageData(1, this.rows);
        this.$emit('change', this.pageData);
      }
    },
    /**
     * @description 监听滚动事件处理分页
     */
    async handleScroll(e) {
      if (this.scrolling) return;
      let { pageNo, pageSize } = this.pagination;
      const area = e.target;
      const lastScrollTop = this.lastScrollTop;
      const cellHeight = this.rowHeight;
      const { scrollTop, scrollHeight } = area;
      const clientHeight = area.clientHeight;
      const lastPageNo = pageNo;

      // 临界距离取当前高度的1/3或者10个单元格的高
      const distance = Math.min(clientHeight / 3, cellHeight * 10);
      // 向上滚动到顶部临界值
      if (lastScrollTop >= scrollTop && scrollTop < distance) {
        // 截取数据才有向上加载数据的操作
        if (this.limit === 0) return;

        // 上次向下滚, 则间距为limit
        if (this.scrollDirection === 'down') {
          pageNo = pageNo - this.limit;
        } else {
          pageNo--;
        }
        this.scrollDirection = 'up';
        if (pageNo < 1) {
          pageNo = 1;
        } else {
          this.scrolling = true;
          await this.fetch(pageNo);
          this.scrolling = false;
          this.$nextTick(() => {
            this.pageData = this.doWithPageData(lastPageNo, this.rows);
            this.$emit('change', this.pageData);
            area.scrollTo(0, pageSize * cellHeight);
          });
        }
      } else if (lastScrollTop <= scrollTop && scrollHeight - clientHeight - scrollTop < distance) {
        // 向下滚动到底部临界值

        // 上次向上滚, 则间距为limit
        if (this.scrollDirection === 'up') {
          pageNo = pageNo + this.limit;
        } else {
          pageNo++;
        }
        this.scrollDirection = 'down';
        if (pageNo > this.totalPage) {
          pageNo = this.totalPage;
        } else {
          this.scrolling = true;
          await this.fetch(pageNo);
          this.scrolling = false;
          this.$nextTick(() => {
            this.pageData = this.doWithPageData(lastPageNo, this.rows);
            this.$emit('change', this.pageData);
            area.scrollTo(0, (this.pageData.length - this.rows.length) * cellHeight);
          });
        }
      }
      this.lastScrollTop = scrollTop;
    },
    /**
     * @description 处理当前页数(默认保持2页数据上下浮动)
     * @param {String} lastPageNo 旧页码
     * @param {Array} data 数据
     */
    doWithPageData(lastPageNo, data) {
      const { pageNo, pageSize } = this.pagination;
      const rows = this.pageData.length ? this.pageData : this.rows || [];
      // 向上滚动, 截取之前数据的前半部分, 并在头部插入
      if (pageNo < lastPageNo) {
        return data.concat(rows.slice(0, pageSize));
      } else if (pageNo > lastPageNo) {
        // 非切割模式, 直接拼接数据
        if (this.limit === 0) {
          return rows.concat(data);
        }
        // 特殊情况, 即初次滚动到第2页数据时
        if (lastPageNo === 1 && rows.length <= pageSize) {
          return rows.concat(data);
        }
        // 向下滚动, 截取之前数据的后半段再插入当前数据
        return rows.slice(pageSize).concat(data);
      }
      // 首页数据直接返回
      return data;
    },
  },
};
</script>

<style scoped>
.o-s {
  overflow-y: auto;
}
.scroll-page {
  height: 100%;
  width: 100%;
}
</style>
