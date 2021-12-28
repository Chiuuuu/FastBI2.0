<template>
  <div class="board-quota-card">
    <!-- 标题 -->
    <p class="board-chart-unit-title" :style="titleStyle" v-if="options.style.title.show">
      {{ options.style.title.text }}
    </p>
    <!-- 主指标标题 -->
    <p v-if="options.style.echart.totalQuatoTitle.show" class="total-quota-title" :style="totalQuatoTitleStyle">
      {{ totalQuotaTitle }}
    </p>
    <!-- 主指标值 -->
    <p class="total-quota-value" :style="totalQuatoValueStyle">{{ totalQuotaValue }}</p>
    <!-- 次指标 -->
    <div v-if="options.style.echart.showSecondaryQuato">
      <p
        class="secondary-quota"
        v-for="(quota, index) in secondaryQuotas"
        :key="index"
        :style="secondaryQuatoTitleLineStyle"
      >
        <!-- 次指标标题 -->
        <span
          v-if="options.style.echart.secondaryQuatoTitle.show"
          class="secondary-quota-title"
          :style="secondaryQuatoTitleStyle"
        >
          {{ quota.secondaryQuotasTitle }}:
        </span>
        <!-- 次指标值 -->
        <span class="secondary-quota-quota-value" :style="secondaryQuatoValueStyle">
          {{ quota.secondaryQuotasValue }}
        </span>
      </p>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
// import { getStyle } from '@/utils';
import defaultData from './default-data';
import BaseChart from '../chart/base';
import { mutationTypes as boardMutation } from '@/store/modules/board';
/**
 * @description 文本框
 */
export default {
  name: `${BoardType.QuatoCard}View`,
  extends: BaseChart,
  data() {
    return {
      totalQuotaTitle: '',
      totalQuotaValue: '',
      secondaryQuotas: [],
      totalQuatoTitleStyle: {},
      totalQuatoValueStyle: {},
      secondaryQuatoTitleStyle: {},
      secondaryQuatoValueStyle: {},
      secondaryQuatoTitleLineStyle: {},
    };
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
     * @description 处理标签配置
     */
    doWithTextStyle(echart, key) {
      const styleObj = Object.assign({}, echart[key]);
      const style = {
        color: `${styleObj.color}`,
        fontSize: `${styleObj.size}px`,
        fontWeight: `${styleObj.weight}`,
        fontFamily: `${styleObj.family}`,
      };
      if (styleObj.align) {
        style.textAlign = `${styleObj.align}`;
      }
      if (styleObj.marginBottom) {
        style.marginBottom = `${styleObj.marginBottom || 0}px`;
      }
      if (styleObj.marginRight) {
        style.marginRight = `${styleObj.marginRight || 0}px`;
      }
      return style;
    },
    doWithLineStyle(echart) {
      const styleObj = Object.assign({}, echart['secondaryQuatoTitleLine']);
      return {
        marginBottom: `${styleObj.marginBottom || 0}px`,
        justifyContent: `${styleObj.align}`,
        alignItems: 'center',
      };
    },
    /**
     * @description 整合配置
     */
    doWithOptions() {
      const {
        style: { echart },
      } = this.options;

      this.totalQuatoTitleStyle = this.doWithTextStyle(echart, 'totalQuatoTitle');
      this.totalQuatoValueStyle = this.doWithTextStyle(echart, 'totalQuatoValue');
      this.secondaryQuatoTitleStyle = this.doWithTextStyle(echart, 'secondaryQuatoTitle');
      this.secondaryQuatoValueStyle = this.doWithTextStyle(echart, 'secondaryQuatoValue');
      this.secondaryQuatoTitleLineStyle = this.doWithLineStyle(echart);
    },
    /**F
     * @description 初始化Echart图表
     */
    initChart() {
      this.doWithOptions();
    },
    /**
     * @description 判断是否获取服务端数据
     */
    isServerData() {
      const { data } = this.options;
      return data.totalQuota.length || data.secondaryQuota.length;
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
      const { dimensions, measures } = this.handleGetDataParmas();
      const {
        style: {
          title: { text },
        },
      } = this.options;
      const params = {
        id: this.shapeUnit.component.id,
        tabId: this.shapeUnit.component.tabId,
        type: this.shapeUnit.component.type,
        ...this.options.data,
        ...this.pagination,
        dimensions, // 拼装维度
        measures, // 拼装度量
      };
      this.shapeUnit.changeLodingChart(true);
      const res = await this.$server.common.getData('/screen/graph/v2/getData', params).finally(() => {
        this.shapeUnit.changeLodingChart(false);
      });
      if (res.code !== 200) {
        if (res.code === 1054) {
          const keys = ['totalQuota', 'secondaryQuota', 'filter'];
          this.handleRedList(res.data, keys);
          if (this.isEditMode) {
            this.$message.error(`${text}数据异常, 请处理标红字段`);
          }
          return;
        }
        return this.$message.error(res.msg);
      }
      // 判断是否初始化
      let needChangeFormatterList = this.dataState !== 'default';
      this.dataState = res.data && res.data.length ? 'normal' : 'empty';
      if (this.dataState === 'empty') {
        return;
      }
      const data = res.data[0];
      // 处理主指标(有数据时, 将默认数据删除)
      const { totalQuotaTitle, totalQuotaValue } = this.doWithTotal(data);

      // 主指标自定义，数据改动才重置
      const customTotalTitle =
        needChangeFormatterList && (!this.serverData || this.serverData.data.totalQuotaTitle !== totalQuotaTitle)
          ? totalQuotaTitle
          : null;
      // 处理次指标
      let secondaryQuotas = [];
      let customSecTitles = [];
      this.options.data.secondaryQuota.forEach((quota, index) => {
        const { alias, defaultAggregator: aggregator } = quota;
        secondaryQuotas.push({
          secondaryQuotasTitle: alias,
          secondaryQuotasValue: data[`${aggregator}_${alias}`] ? data[`${aggregator}_${alias}`].toString() : '',
        });
        // 数据有变动才重置自定义标题
        if (
          needChangeFormatterList &&
          (!this.serverData ||
            !this.serverData.data.secondaryQuotas[index] ||
            this.serverData.data.secondaryQuotas[index].secondaryQuotasTitle !== alias)
        ) {
          customSecTitles[index] = alias;
        } else {
          customSecTitles[index] = this.options.style.echart.secondaryQuatoTitle.text[index];
        }
      });
      this.serverData = {
        data: {
          totalQuotaTitle,
          totalQuotaValue,
          secondaryQuotas,
        },
      };
      this.doWithData(this.serverData);
      let mergetEchart = {
        secondaryQuatoTitle: Object.assign({}, this.options.style.echart.secondaryQuatoTitle, {
          text: customSecTitles,
        }),
      };
      mergetEchart.totalQuatoTitle = { text: customTotalTitle || '' };
      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: mergetEchart,
        },
        replaceMerge: ['secondaryQuatoTitle'],
        updateCom: this.shapeUnit.component,
      });
    },
    /**
     * @description 处理主指标
     */
    doWithTotal(data) {
      // let { totalQuotaTitle, totalQuotaValue } = Object.assign({}, defaultData.data);
      // 无论有没有拖入主指标, 都清空标题
      let { totalQuotaTitle, totalQuotaValue } = Object.assign({});
      if (this.options.data['totalQuota'].length) {
        const { alias: totalAlias, defaultAggregator: aggregator } = this.options.data['totalQuota'][0];
        totalQuotaTitle = totalAlias;
        totalQuotaValue = data[`${aggregator}_${totalAlias}`] ? data[`${aggregator}_${totalAlias}`].toString() : '';
      }
      return { totalQuotaTitle, totalQuotaValue };
    },
    /**
     * @description 拼装维度度量
     */
    handleGetDataParmas() {
      let dimensions = [];
      let measures = [];
      ['totalQuota', 'secondaryQuota'].forEach(key => {
        this.options.data[key].forEach(item => {
          if (item.role === 1) {
            dimensions.push(item);
          } else {
            measures.push(item);
          }
        });
      });
      return { dimensions, measures };
    },
    /**
     * @description 图表获取默认数据
     */
    getDefaultData() {
      this.serverData = null;
      // 判断是否初始化
      let needChangeFormatterList = this.dataState !== 'default';
      this.dataState = 'normal';
      this.doWithData(defaultData);
      // 获取数据之后需要更改限制
      this.$store.commit(boardMutation.SET_STYLE, {
        style: {
          echart: {
            totalQuatoTitle: {
              text: needChangeFormatterList ? '总获取量' : this.options.style.echart.totalQuatoTitle.text,
            },
            secondaryQuatoTitle: Object.assign({}, this.options.style.echart.secondaryQuatoTitle, { text: [] }),
          },
        },
        replaceMerge: ['secondaryQuatoTitle'],
        updateCom: this.shapeUnit.component,
      });
    },
    /**
     * @description 获取数据
     */
    doWithData(handledData) {
      const data = handledData.data;
      const {
        style: { echart },
      } = this.options;
      // 获取主指标名称
      this.totalQuotaTitle = echart.totalQuatoTitle.text || data.totalQuotaTitle;

      // 格式化数值
      this.totalQuotaValue = this.handleValue(data.totalQuotaValue);

      // 处理次指标
      let secondaryQuotas = JSON.parse(JSON.stringify(data.secondaryQuotas));
      secondaryQuotas.forEach((item, index) => {
        if (echart.secondaryQuatoTitle.text[index]) {
          item.secondaryQuotasTitle = echart.secondaryQuatoTitle.text[index];
        }
        item.secondaryQuotasValue = this.handleValue(item.secondaryQuotasValue);
      });
      this.secondaryQuotas = secondaryQuotas;
    },
    /**
     * @description 格式化数值
     */
    handleValue(value) {
      if (!value) {
        return '';
      }
      const arr = value.split('.');
      let str = +arr[0];
      str = str.toLocaleString();
      if (arr[1]) {
        str += `.${arr[1]}`;
      }
      return str;
    },
    /**
     * @description 更新图表样式
     */
    updateChartStyle() {
      if (this.dataState === 'empty') {
        return;
      }
      this.doWithOptions();
      this.doWithData(this.serverData ? this.serverData : defaultData);
    },
  },
};
</script>
<style lang="less" scoped>
.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}
.board-quota-card {
  width: 100%;
  height: 100%;
  padding: 10px 25px;
  overflow: hidden;
  & > p {
    .ellipsis;
  }
}
.secondary-quota {
  display: flex;
  flex-direction: row;
  & > span {
    .ellipsis;
  }
}
</style>
