<template>
  <div class="board-chart-unit-wrapper" @click="resetDataLink">
    <div class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </div>
    <div class="board-chart-unit table-unit" :style="chartStyle" ref="js-board-chart-unit">
      <div class="table-wrapper reset-scrollbar" @scroll="getScrollLeft">
        <Tcontainer
          ref="js-thead"
          :data="fields"
          :cols="cols"
          :tableStyle="tableStyle"
          :theadStyle="theadStyle"
          type="thead"
          :key="refreshCount"
          v-if="showHead"
        ></Tcontainer>
        <Tcontainer
          ref="js-tbody"
          class="reset-scrollbar"
          :style="{ top: tbodyPositionTop, right: bodyScrollRight }"
          :data="tbodyData"
          :cols="cols"
          :tableStyle="tableStyle"
          :tbodyStyle="tbodyStyle"
          :key="refreshCount + 1"
          :autoWrap="tbody_autoWrap"
          @hook:mounted="doWithWidth"
          type="tbody"
          @dataLink="dataLink"
        ></Tcontainer>
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
import { mutationTypes as boardMutation } from '@/store/modules/board';
import { setLinkageData, resetOriginData } from '@/utils/setDataLink';

/**
 * @description 表格图表
 */

export default {
  name: `${BoardType.ChartProgress}View`,
  extends: BaseChart,
  inject: ['shapeUnit'],
  components: {
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
      maxCols: [], // 表格中每列最大宽度的数据
      cols: [], // 表格列
      tableStyle: {}, // 表格样式
      theadStyle: {}, // 表头样式
      tbodyStyle: {}, // 表格内容样式
      refreshCount: 0, // 用来重置组件 https://cn.vuejs.org/v2/api/#key => 完整地触发组件的生命周期钩子
      bodyScrollRight: 0, // 计算滚动长度定位纵向滚动轴
    };
  },
  destroyed() {},
  computed: {
    tbodyPositionTop() {
      // 距离表头高度
      return this.options.style.echart.thead.height + 'px';
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
  watch: {
    'options.style': {
      deep: true,
      immediate: false,
      handler(opt) {
        // 1. 状态要是是停止（移动或者缩放情况下不更变）
        // 2. 配置项发生改变
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.updateChartStyle();
          });
        }
      },
    },
    'options.data': {
      deep: true,
      immediate: false,
      handler(opt) {
        if (opt && this.currentComState && this.currentComState === 'stop') {
          this.$nextTick(() => {
            this.getChartData();
          });
        }
      },
    },
  },
  methods: {
    /**
     * @description 切割当前展示的表格
     */
    doWithSliceData(start, end) {
      if (!this.serverData) return;
      const data = this.serverData.data.slice(start, end);
      this.doWithOptions({ data });
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
        // 设置列宽度固定为100
        this.cols = this.cols.map(() => 100);
        const tableWidth = this.cols.reduce((sum, current) => {
          return sum + current;
        }, 0);
        this.tableStyle = Object.assign({}, this.tableStyle, {
          width: `${tableWidth}px`,
        });
        // 随着拖入列，根据表格宽度改变尺寸宽度
        if (tableWidth && tableWidth !== this.options.style.size.width) {
          this.$store.commit(boardMutation.SET_STYLE, {
            style: {
              size: {
                width: tableWidth,
              },
            },
            updateCom: this.shapeUnit.component,
          });
        }
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
        height: `${thead.height}px`,
        lineHeight: `${thead.height}px`,
        fontSize: `${thead.font.size}px`,
        color: thead.font.color,
        fontFamily: thead.font.family,
        fontWeight: thead.font.weight,
      };

      this.theadStyle = Object.assign({}, this.theadStyle, {
        thead: {
          ...theadStyle,
        },
        font: fontStyle,
      });
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
        lineHeight: `${tbody.height}px`,
        fontSize: `${tbody.font.size}px`,
        color: tbody.font.color,
        fontFamily: tbody.font.family,
        fontWeight: tbody.font.weight,
      };
      // 是否自动换行
      if (!tbody.autoWrap) {
        // 不换行
        fontStyle.height = `${tbody.height}px`;
        fontStyle.overflow = 'hidden';
        fontStyle.textOverflow = 'ellipsis';
        fontStyle.wordWrap = 'normal';
        fontStyle.whiteSpace = 'nowrap';
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
          result.push(value);
          if (!map.has(key)) {
            map.set(key, {
              length: value.length,
              index,
            });
          } else {
            const item = map.get(key);
            if (value.length > item.length) {
              map.set(key, {
                length: value.length,
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
      this.isServerData() ? this.getServerData() : this.getDefaultData();
    },
    /**
     * @description 图表获取服务端数据
     */
    async getServerData() {
      let dimensions = [];
      let measures = [];
      this.options.data.fields.forEach(item => {
        if (item.role === 1) {
          dimensions.push(item);
        } else {
          measures.push(item);
        }
      });
      const res = await this.$server.common.getData('/screen/graph/v2/getData', {
        id: this.shapeUnit.component.id,
        tabId: this.shapeUnit.component.tabId,
        type: this.shapeUnit.component.type,
        ...this.options.data,
        dimensions, // 拼装维度
        measures, // 拼装度量
      });
      if (res.code === 200) {
        this.serverData = { data: res.data };
        const keys = this.options.data.fields.map(item => item.alias);
        this.fields = keys.map(key => {
          return { name: key };
        });
        this.doWithOptions();
        this.refreshCount += 1;
      } else {
        this.$message.error(res.msg);
      }
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
      this.doWithThead();
      this.doWithTbody();
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
    .thead,
    .tbody {
      position: absolute;
      left: 0;
    }
    .thead {
      top: 0;
      .content-wrap {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-wrap: normal;
        display: inline-block;
        width: 100%;
      }
    }
    .tbody {
      //   right: 0;
      bottom: 0;
      overflow-x: hidden;
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
