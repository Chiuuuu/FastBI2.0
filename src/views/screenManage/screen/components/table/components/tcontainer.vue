<template>
  <div :class="type">
    <table :style="tableStyle">
      <colgroup>
        <col v-for="(col, index) in cols" :key="index" :style="{ width: `${col}px` }" />
      </colgroup>
      <thead v-if="type !== 'tbody'" :style="theadStyle.thead">
        <tr>
          <th v-for="th in data" :key="th.name">
            <p class="content-wrap" :style="theadStyle.font">{{ th.name }}</p>
          </th>
        </tr>
      </thead>
      <tbody v-else :style="tbodyStyle.tbody">
        <template v-for="(tr, index) in data">
          <tr :key="index" :ref="`js-tr-${index}`" :style="handleSetBackgroundColor(index)">
            <td v-for="td in tr" :key="td">
              <p class="content-wrap" :style="tbodyStyle.font" :title="autoWrap ? '' : td">{{ td }}</p>
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
  methods: {
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
        const width = Math.ceil(tr[0].children[`${index}`].children[0].offsetWidth) + 22;
        return width;
      });
    },
  },
};
</script>
