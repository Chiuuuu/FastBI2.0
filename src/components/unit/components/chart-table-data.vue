<template>
  <a-modal
    :visible="show"
    title="图表数据"
    width="80vw"
    :footer="null"
    @cancel="$emit('cancel')"
    :getContainer="getContainer"
  >
    <div class="scrollbar" style="width: 100%; height: 80vh; overflow-y: scroll" @scroll="handleScroll">
      <!-- <div style="margin: 0 0 10px" v-for="(item, index) in chartData.columns" :key="index">
        <h3 style="margin: 0 0 2px" v-if="chartData.tableName[index]">
          {{ chartData.tableName[index] }}
        </h3>
        <table class="chartdata-table">
          <tr class="table-tr">
            <th class="table-td" v-for="(subItem, subIndex) in item" :key="subIndex">
              {{ subItem.colName }}
            </th>
          </tr>
          <tr class="table-tr" v-for="(subItem2, subIndex2) in chartData.rows[index]" :key="subIndex2">
            <td class="table-td" v-for="(value, key) in item" :key="key">
              {{ subItem2[value.alias || value] || '' }}
            </td>
          </tr>
        </table>
      </div> -->
      <div style="margin: 0 0 10px">
        <table class="chartdata-table">
          <tr class="table-tr js-table-tr">
            <th class="table-td" v-for="(item, subIndex) in chartData.columns" :key="subIndex">
              {{ item.colName }}
            </th>
          </tr>
          <tr class="table-tr" v-for="(subItem, subIndex) in tableData" :key="subIndex">
            <td class="table-td" v-for="(value, key) in chartData.columns" :key="key">
              {{ subItem[value.alias || value] || '' }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </a-modal>
</template>
<script>
/**
 * @description 查看数据
 */
export default {
  name: 'UnitChartTableData',
  props: {
    chartData: {
      type: Object,
      required: false,
      default: () => {},
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    show(val) {
      if (val) {
        const len = this.chartData.rows.length;
        const { headIndex, footIndex, pageSize } = this.pagination;
        if (len > (footIndex + 1) * pageSize) {
          this.pagination.totalIndex = Math.ceil(len / pageSize);
        }
        this.tableData = this.chartData.rows.slice(headIndex * pageSize, footIndex * pageSize);
      } else {
        this.tableData = [];
        this.pagination = this.$options.data().pagination;
      }
    },
  },
  data() {
    return {
      tableData: [], // 展示的表格数据slice(headIndex * pageSize, footIndex * pageSize)
      // 展示500行数据
      pagination: {
        lastScrollTop: 0, // 记录上次滚动位置
        totalIndex: 0, // 最大页数
        headIndex: 0, // 头部截取下标
        footIndex: 4, // 脚部截取下标
        pageSize: 30, // 每次加载数
      },
    };
  },
  methods: {
    close() {
      this.$destroy();
      this.$el.remove();
    },
    // 滚动分页处理
    handleScroll(e) {
      const area = e.target;
      const { scrollTop, scrollHeight, scrollWidth } = area;
      const clientHeight = area.clientHeight;
      let { totalIndex, headIndex, footIndex, pageSize, lastScrollTop } = this.pagination;

      // 获取任意一行的高度
      const cell = area.querySelector('.js-table-tr');
      if (!cell) return;
      const cellHeight = cell.clientHeight;

      // 临界距离取当前高度的1/5或者5个单元格的高
      const distance = Math.min(clientHeight / 5, cellHeight * 5);
      // 向上滚动到顶部临界值
      if (lastScrollTop >= scrollTop && scrollTop < distance) {
        if (--headIndex < 0) {
          headIndex = 0;
          footIndex = 4;
        } else {
          footIndex--;
          this.tableData = this.chartData.rows.slice(headIndex * pageSize, footIndex * pageSize);
          // 滚动条回滚
          area.scrollTo(scrollWidth, scrollTop + cellHeight * pageSize);
        }
      } else if (lastScrollTop <= scrollTop && scrollHeight - clientHeight - scrollTop < distance) {
        // 向下滚动到底部临界值
        if (++footIndex > totalIndex) {
          footIndex = totalIndex;
          headIndex = totalIndex - 4;
        } else {
          headIndex++;
          this.tableData = this.chartData.rows.slice(headIndex * pageSize, footIndex * pageSize);
          // 滚动条回滚
          area.scrollTo(scrollWidth, scrollTop - cellHeight * pageSize);
        }
      }
      Object.assign(this.pagination, {
        headIndex,
        footIndex,
        lastScrollTop: scrollTop,
      });
    },
    // 内容挂在.board-canvas元素下可显示，默认挂在body下
    getContainer() {
      return document.querySelector('.board-canvas');
    },
  },
};
</script>
<style lang="less" scoped>
.chartdata-table {
  height: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0px;
  overflow: scroll;
  border-left: 1px solid #787878;
  border-top: 1px solid #787878;
  .table-td {
    padding: 10px;
    text-align: center;
    border-right: 1px solid #787878;
    border-bottom: 1px solid #787878;
  }
}
.dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  .dialog-container {
    width: 500px;
    height: 380px;
    background: #ffffff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 8px;
    position: relative;
    .dialog-title {
      width: 100%;
      height: 60px;
      font-size: 18px;
      color: #696969;
      font-weight: 600;
      padding: 16px 50px 0 20px;
      box-sizing: border-box;
    }
    .content {
      height: 320px;
      color: #797979;
      line-height: 26px;
      padding: 0 20px;
      box-sizing: border-box;
      overflow: scroll;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      font-size: 18px;
      cursor: pointer;
      color: black;
      &:hover {
        font-weight: 600;
      }
    }
  }
}
.scrollbar {
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 5px;
    -webkit-box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1);
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    -webkit-box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.4);
    -webkit-box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-track {
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
    background-color: white;
  }
  &::-webkit-scrollbar-track:hover {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
    background-color: rgba(0, 0, 0, 0.01);
  }
}
</style>
