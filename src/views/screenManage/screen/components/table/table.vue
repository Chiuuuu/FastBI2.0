<template>
  <div class="board-chart-unit-wrapper" @click="resetDataLink">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit table-unit" :style="chartStyle" ref="js-board-chart-unit">
      <div class="table-wrapper reset-scrollbar" @scroll="getScrollLeft">
        <div class="thead">
          <Tcontainer
            ref="js-thead"
            :data="fields"
            :cols="cols"
            :tableStyle="tableStyle"
            :theadStyle="theadStyle"
            :pagination="pagination"
            type="thead"
            :key="refreshCount"
            v-if="showHead"
            @hook:mounted="doWithHeadHeight"
          ></Tcontainer>
        </div>
        <ScrollPage
          class="reset-scrollbar tbody"
          fit
          :style="scrollStyle"
          :rows="tbodyData"
          :row-height="headHeight"
          :pagination="pagination"
          :fetch="getPageData"
          @change="v => (pageDataRows = v)"
        >
          <Tcontainer
            ref="js-tbody"
            :data="pageDataRows"
            :cols="cols"
            :tableStyle="tableStyle"
            :tbodyStyle="tbodyStyle"
            :pagination="pagination"
            :key="refreshCount + 1"
            :autoWrap="tbody_autoWrap"
            @hook:mounted="doWithWidth"
            type="tbody"
            @dataLink="dataLink"
            @scroll="getPageData"
          ></Tcontainer>
        </ScrollPage>
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import BaseChart from '../chart/base';
import defaultData from './default-data';
import Tcontainer from './components/tcontainer';
import { getStyle } from '@/utils';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';
import ScrollPage from '@/components/scroll';

/**
 * @description 表格图表
 */

export default {
  name: `${BoardType.ChartProgress}View`,
  extends: BaseChart,
  inject: ['shapeUnit'],
  components: {
    ScrollPage,
    Tcontainer,
  },
  provide() {
    return {
      table: this,
    };
  },
  data() {
    return {
      fields: [
        {
          name: 'car_number',
        },
        {
          name: 'o_place',
        },
        {
          name: 'car_type',
        },
      ],
      tbodyData: [], // 表格内容数据
      pageDataRows: [], // 当前分页数据
      maxCols: [], // 表格中每列最大宽度的数据
      cols: [], // 表格列
      tableStyle: {}, // 表格样式
      theadStyle: {}, // 表头样式
      tbodyStyle: {}, // 表格内容样式
      refreshCount: 0, // 用来重置组件 https://cn.vuejs.org/v2/api/#key => 完整地触发组件的生命周期钩子
      bodyScrollRight: 0, // 计算滚动长度定位纵向滚动轴
      headHeight: '38px', //表头高度
      pagination: {
        // 分页参数
        pageSize: 1000, // 单次查询1000条
        pageNo: 1,
        rowsNum: 0,
      },
    };
  },
  destroyed() {},
  computed: {
    // tbodyPositionTop() {
    //   // 距离表头高度
    //   return this.options.style.echart.thead.height + 'px';
    // },
    scrollStyle() {
      return { top: this.headHeight, right: this.bodyScrollRight };
    },
    showHead() {
      // 表头是否显示
      const {
        style: {
          echart: { thead },
        },
      } = this.options;
      return thead.show;
    },
    tbody_autoWrap() {
      // 表身是否换行
      return this.options.style.echart.tbody.autoWrap;
    },
  },
  methods: {
    /**
     * @description 等子组件挂载完成后处理表头的高度
     */
    async doWithHeadHeight() {
      await this.$nextTick();
      this.headHeight = this.$refs['js-thead'].handleGetHeight() + 'px';
    },
    /**
     * @description 等子组件挂载完成后处理对应的宽度
     */
    doWithWidth() {
      this.tableStyle = {};
      this.theadStyle = {};
      this.tbodyStyle = {};
      this.$nextTick(() => {
        this.$refs['js-tbody'].initScrollData();
        this.cols = this.$refs['js-tbody'].handleGetColWidth(this.maxCols);
        // TODO:设置最小宽度, 不设上限
        // 设置列宽度固定为100
        // this.cols = this.cols.map(() => 100);

        this.tableStyle = Object.assign({}, this.tableStyle, {
          width: `${this.options.style.size.width - 2}px`,
          minWidth: 100,
        });
        this.doWithThead();
        this.doWithTbody();
      });
    },
    /**
     * @description 处理表头
     */
    doWithThead() {
      const {
        style: {
          echart: { thead },
        },
      } = this.options;

      const theadStyle = getStyle(
        {},
        {
          background: thead.background,
          text: thead.text,
        },
        ['size'],
        ['background', 'text'],
      );

      let fontStyle = {
        // height: `${thead.height}px`,
        // lineHeight: `${thead.height}px`,
        fontSize: `${thead.font.size}px`,
        color: thead.font.color,
        fontFamily: thead.font.family,
        fontWeight: thead.font.weight,
      };
      // 是否自动换行
      if (!thead.autoWrap) {
        // 不换行
        fontStyle.height = `${thead.height}px`;
        fontStyle.lineHeight = `${thead.height}px`;
        fontStyle.overflow = 'hidden';
        fontStyle.textOverflow = 'ellipsis';
        fontStyle.wordWrap = 'normal';
        fontStyle.whiteSpace = 'nowrap';
      } else {
        fontStyle.padding = '7px 10px';
      }

      this.theadStyle = Object.assign({}, this.theadStyle, {
        thead: {
          ...theadStyle,
        },
        font: fontStyle,
      });

      this.doWithHeadHeight();
    },
    /**
     * @description 处理表格
     */
    doWithTbody() {
      const {
        style: {
          echart: { tbody },
        },
      } = this.options;

      const tbodyStyle = {
        textAlign: tbody.text.align,
      };

      let fontStyle = {
        // lineHeight: `${tbody.height}px`,
        fontSize: `${tbody.font.size}px`,
        color: tbody.font.color,
        fontFamily: tbody.font.family,
        fontWeight: tbody.font.weight,
      };
      // 是否自动换行
      if (!tbody.autoWrap) {
        // 不换行
        fontStyle.height = `${tbody.height}px`;
        fontStyle.lineHeight = `${tbody.height}px`;
        fontStyle.overflow = 'hidden';
        fontStyle.textOverflow = 'ellipsis';
        fontStyle.wordWrap = 'normal';
        fontStyle.whiteSpace = 'nowrap';
      } else {
        fontStyle.padding = '7px 10px';
      }

      this.tbodyStyle = Object.assign({}, this.tbodyStyle, {
        tbody: {
          ...tbodyStyle,
        },
        font: fontStyle,
        even: tbody.even,
        odd: tbody.odd,
      });
    },
    /**
     * @description 滚动时计算可视宽度
     */
    getScrollLeft(e) {
      this.bodyScrollRight = -e.target.scrollLeft + 'px';
    },
    /**
     * @description 初始化Echart图表
     */
    initChart() {},
    /**
     * @description 处理配置项
     */
    doWithOptions(fetchData = this.serverData) {
      if (!fetchData) return;

      this.maxCols = [];
      this.tbodyData = [];

      const keys = this.fields.map(filed => filed.name);
      const map = new Map();

      this.tbodyData = fetchData.data.map((item, index) => {
        const result = [];
        keys.forEach(key => {
          const value = item[key];
          const len = value ? String(value).length : 0;
          result.push(value);
          if (!map.has(key)) {
            map.set(key, {
              length: len,
              index,
            });
          } else {
            const res = map.get(key);
            if (len > res.length) {
              map.set(key, {
                length: len,
                index,
              });
            }
          }
        });
        return result;
      });
      this.maxCols = [...map.values()].map(item => {
        return item.index;
      });
    },
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      return [].concat(data.fields);
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.fields && data.fields.length;
    },
    /**
     * @description 图表获取数据
     */
    getChartData() {
      this.pagination = this.$options.data().pagination;
      this.isServerData() ? this.getServerData() : this.getDefaultData();
    },
    async getPageData(pageNo) {
      this.pagination.pageNo = pageNo;
      await this.getServerData();
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      if (this.shapeUnit.isSpinning) return;
      let dimensions = [];
      let measures = [];
      const {
        style: {
          title: { text },
        },
      } = this.options;
      this.options.data.fields.forEach(item => {
        if (item.role === 1) {
          dimensions.push(item);
        } else {
          measures.push(item);
        }
      });
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common
        .getData('/screen/graph/v2/getData', {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.pagination,
          ...this.options.data,
          dimensions, // 拼装维度
          measures, // 拼装度量
        })
        .finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
      if (res.code !== 200) {
        if (res.code === 1054) {
          const keys = ['fields', 'filter', 'sort'];
          this.handleRedList(res.data, keys);
          if (this.isEditMode) {
            this.$message.error(`${text}数据异常, 请处理标红字段`);
          }
          return;
        }
        return this.$message.error(res.msg || '请求错误');
      }
      this.pagination.rowsNum = res.rowsNum;
      // this.serverData = { data: this.doWithPageData(lastPageNo, res.data) };
      this.serverData = { data: res.data || [] };
      const keys = this.options.data.fields.map(item =>
        item.role === 2 ? `${item.defaultAggregator}_${item.alias}` : item.alias,
      );
      this.fields = keys.map((key, index) => {
        return this.options.data.fields[index].role === 2
          ? { name: key, showName: key.replace(/(.*?)_/, '') }
          : { name: key, showName: key };
      });
      this.doWithOptions();
      this.refreshCount += 1;

      // 数据更新后的页面回滚
      // if (pageNo) {
      //   this.$nextTick(() => {
      //     this.$refs['js-tbody'].$el.scrollTo(0, cellHeight * this.pagination.pageSize);
      //   });
      // }
    },
    /**
     * @description 处理当前页数(默认保持2页数据上下浮动)
     * @param {String} lastPageNo 旧页码
     * @param {Array} data 数据
     */
    doWithPageData(lastPageNo, data) {
      const { pageNo, pageSize } = this.pagination;
      const rows = [].concat(this.serverData ? this.serverData.data : []);
      // 向上滚动, 截取之前数据的前半部分, 并在头部插入
      if (pageNo < lastPageNo) {
        return data.concat(rows.slice(0, pageSize));
      } else if (pageNo > lastPageNo) {
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
    /**
     * @description 图表获取默认数据
     */
    getDefaultData() {
      this.serverData = null;
      this.fields = this.$options.data().fields;
      this.doWithOptions(defaultData);
      this.refreshCount += 1;
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      this.doWithWidth();
    },
    /**
     * @description 图表联动
     */
    dataLink(name, trIndex) {
      if (!this.options.style.echart.customIsOpenDataLink) {
        return;
      }
      const index = this.shapeUnit.component.setting.data.fields.findIndex(
        item => item.alias === this.fields[trIndex].name,
      );
      setLinkageData(null, this.shapeUnit.component, [{ pickField: 'fields', pickValue: name, index }]);
    },
    /**
     * @description 复原图表联动
     */
    resetDataLink() {
      resetOriginData(this.shapeUnit.component);
    },
  },
};
</script>
<style lang="less">
.table-unit {
  position: relative;
  .table-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow-x: scroll;
    // border: 1px solid #313960;
    .thead,
    .tbody {
      position: absolute;
      left: 0;
    }
    .thead {
      top: 0;
      border: 1px solid #313960;
      border-bottom: none;
      overflow: hidden;
      th:not(:last-of-type) {
        border-right: 1px solid #313960;
      }
      .content-wrap {
        // overflow: hidden;
        // white-space: nowrap;
        // text-overflow: ellipsis;
        // word-wrap: normal;
        display: inline-block;
        width: 100%;
      }
    }
    .tbody {
      //   right: 0;
      bottom: 0;
      overflow-x: hidden;
      table {
        border: 1px solid #313960;
        border-top: none;
      }
      tr {
        border-top: 1px solid #313960;
      }
      td:not(:last-of-type) {
        border-right: 1px solid #313960;
      }
      .content-wrap {
        display: inline-block;
        width: 100%;
      }
    }
    .content-wrap {
      word-break: break-all;
    }
  }

  table {
    table-layout: fixed;
    border-collapse: collapse;
    border-spacing: 0;

    margin-left: 0px;

    thead,
    tbody {
      th,
      td {
        p {
          position: relative;
          vertical-align: middle;
          background-clip: padding-box;
          margin-bottom: 0;
          padding: 0px 10px;
        }
      }
    }
  }
}
</style>
