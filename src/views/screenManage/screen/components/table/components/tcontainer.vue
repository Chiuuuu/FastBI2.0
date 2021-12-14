<template>
  <div :class="type" @scroll="handleScroll" :ref="`${type}-wrap`">
    <table :style="tableStyle">
      <colgroup>
        <col v-for="(col, index) in cols" :key="index" :style="{ width: `${col}px` }" />
      </colgroup>
      <thead v-if="type !== 'tbody'" :style="theadStyle.thead">
        <tr>
          <template v-for="(th, index) in data">
            <th :key="th.name" :ref="`js-th-${index}`">
              <p class="content-wrap" :style="theadStyle.font" :title="th.name">
                {{ th.showName || th.name }}
              </p>
            </th>
          </template>
        </tr>
      </thead>
      <tbody v-else :style="tbodyStyle.tbody">
        <template v-for="(tr, index) in data">
          <tr :key="index" :ref="`js-tr-${index}`" :style="handleSetBackgroundColor(index)">
            <td v-for="(td, tdI) in tr" :key="tdI">
              <p
                class="content-wrap"
                :style="tbodyStyle.font"
                :title="autoWrap ? '' : td"
                @click.stop="dataLink(td, tdI)"
              >
                {{ td }}
              </p>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: 'TableContainer',
  inject: ['table'],
  props: {
    type: {
      // 表头 || 表格内容
      type: String,
      default: 'tbody',
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['tbody', 'thead'].indexOf(value) !== -1;
      },
    },
    data: {
      // 数据
      type: Array,
      required: true,
    },
    cols: {
      // 列
      type: Array,
      required: true,
    },
    pagination: {
      // 表格样式
      type: Object,
      default: () => {},
    },
    tableStyle: {
      // 表格样式
      type: Object,
      default: () => {},
    },
    theadStyle: {
      // 表头样式
      type: Object,
      default: () => {},
    },
    tbodyStyle: {
      // 表格内容样式
      type: Object,
      default: () => {},
    },
    autoWrap: {
      // 表单元是否换行,不换行则鼠标移入显示所有内容
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 展示500行数据
      // pagination: {
      //   lastScrollTop: 0, // 记录上次滚动位置
      //   rowsNum: 0, // 最大页数
      //   pageNo: 0, // 头部截取下标
      //   footIndex: 4, // 脚部截取下标
      //   pageSize: 50, // 每次加载数
      // },
      lastScrollTop: 0, // 记录上次滚动位置
      totalPage: 0, // 总页数
    };
  },
  methods: {
    /**
     * @description 每次数据变化, 初始化滚动数据
     */
    initScrollData() {
      const { rowsNum, pageSize } = this.pagination;
      // const len = this.data.length;
      // if (len > (footIndex + 1) * pageSize) {
      // if (len > rowsNum) {
      //   this.pagination.rowsNum = Math.ceil(len / pageSize);
      // }
      // this.$parent.doWithSliceData(pageNo * pageSize, footIndex * pageSize);
      // this.$parent.doWithSliceData(pageNo);
      this.totalPage = Math.ceil(rowsNum / pageSize);
    },
    /**
     * @description 监听滚动事件处理分页
     */
    async handleScroll(e) {
      if (this.type !== 'tbody') return;
      const area = e.target;
      const { scrollTop, scrollHeight } = area;
      const clientHeight = area.clientHeight;
      // let { rowsNum, pageNo, footIndex, pageSize, lastScrollTop } = this.pagination;
      let { pageNo } = this.pagination;
      let lastScrollTop = this.lastScrollTop;

      // 获取任意一行的高度
      if (!this.$refs['js-tr-0']) return;
      const cellHeight = this.$refs['js-tr-0'][0].clientHeight;

      // 临界距离取当前高度的1/5或者5个单元格的高
      const distance = Math.min(clientHeight / 5, cellHeight * 5);
      // 向上滚动到顶部临界值
      if (lastScrollTop >= scrollTop && scrollTop < distance) {
        if (--pageNo < 1) {
          pageNo = 1;
        } else {
          await this.$parent.getServerData(pageNo, cellHeight);
        }
      } else if (lastScrollTop <= scrollTop && scrollHeight - clientHeight - scrollTop < distance) {
        // 向下滚动到底部临界值
        if (++pageNo > this.totalPage) {
          pageNo = this.totalPage;
        } else {
          await this.$parent.getServerData(pageNo, cellHeight);
        }
      }
      this.lastScrollTop = lastScrollTop;
    },
    /**
     * @description 处理奇偶行的背景颜色
     */
    handleSetBackgroundColor(index) {
      const backgroundColor = (index + 1) % 2 === 0 ? this.tbodyStyle.even : this.tbodyStyle.odd;
      return {
        backgroundColor,
      };
    },
    /**
     * @description 获取表格中最大的宽度
     * 22 = 内边距(10 + 10)加上两边(1 + 1)
     */
    handleGetColWidth(list) {
      return list.map((max, index) => {
        const tr = this.$refs[`js-tr-${max}`];
        let width = Math.ceil(tr[0].children[`${index}`].children[0].offsetWidth) + 22;
        // 最小宽度100
        width = width > 101 ? width : 101;
        const th = this.$parent.$refs['js-thead'].$refs[`js-th-${index}`][0];
        if (!th) return width;
        const headWidth = th.offsetWidth + 22;
        return Math.max(width, headWidth);
      });
    },
    /**
     * @description 获取表头/表身的高度
     */
    handleGetHeight() {
      return this.$refs[`${this.type}-wrap`].offsetHeight;
    },
    /**
     * @description 图表联动
     */
    dataLink(name, index) {
      this.$emit('dataLink', name, index);
    },
  },
};
</script>
