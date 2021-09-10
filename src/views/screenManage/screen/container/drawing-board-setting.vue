<template>
  <div class="drawing-board-setting">
    <!-- 图表配置栏 start -->
    <component
      v-if="currentCom"
      :is="`${currentCom.type}Setting`"
      :currentCom="currentCom"
      ref="js-board-chart-setting"
    ></component>
    <!-- 图表配置栏 end -->

    <!-- 页面配置栏 start -->
    <BoardPageSetting v-else></BoardPageSetting>
    <!-- 页面配置栏 end -->

    <!-- 图表数据栏 start -->
    <BoardSettingRight ref="js-board-setting-right"></BoardSettingRight>
    <!-- 图表数据栏 end -->
  </div>
</template>
<script>
import BoardPageSetting from '../components/page/setting';
import BoardTextSetting from '../components/text/setting';
import BoardImageSetting from '../components/image/setting';
import BoardSourceSetting from '../components/screen-source/setting';
import ShapeLineSetting from '../components/shape/line/setting';
import ShapeRoundSetting from '../components/shape/round/setting';
import ShapeRectangularSetting from '../components/shape/rectangular/setting';
import ChartLineSetting from '../components/chart/line/setting';
import ChartBarSetting from '../components/chart/bar/setting';
import ChartPieSetting from '../components/chart/pie/setting';
import ChartRingPieSetting from '../components/chart/ring-pie/setting';
import ChartNestPieSetting from '../components/chart/nest-pie/setting';
import ChartRadarSetting from '../components/chart/radar/setting';
import ChartGaugeSetting from '../components/chart/gauge/setting';
import ChartScatterSetting from '../components/chart/scatter/setting';
import ChartSunburstSetting from '../components/chart/sunburst/setting';
import ChartTreemapSetting from '../components/chart/treemap/setting';
import ChartHeatmapSetting from '../components/chart/heatmap/setting';
import ChartProgressSetting from '../components/progress/setting';
import ChartTableSetting from '../components/table/setting';
import BoardSettingRight from '../components/board-setting-right';
import ChartMapSetting from '../components/chart/map/setting';
import ChartFunnelSetting from '../components/chart/funnel/setting';
import BoardQuatoCardSetting from '../components/quota-card/setting';
import { mapState } from 'vuex';

/**
 * @description 拖拽放置区的类型
 */
export const DROG_TYPE = {
  LIST: 'list', // 维度度量列表
  FIELD: 'fields', // 字段
  DATAFILTER: 'dataFilter', // 数据筛选
  DATASORT: 'dataSort', // 数据排序
  LONG: 'longitude', // 经度
  DIMENSION: 'dimension', // 维度字段
  MEASURE: 'measure', // 度量字段
  RROGRESS: 'progress', // 进度值
  TARGE: 'targe', // 当前值
  OUTERING: 'outerIng', // 外圈
  INNERING: 'innerIng', // 内圈
  MIN: 'min', // 最小值
  MAX: 'max', // 最大值
  XAXIS: 'xaxis', // x轴
  YAXIS: 'yaxis', // y轴
  LATITUDE: 'latitude', // 经度
  LABELDIMENSION: 'labelDimension', // 散点维度字段
  LABELMEASURE: 'labelMeasure', // 散点度量字段
  LABELLONGITUDE: 'labelLongitude', // 散点经度
  LABELLATITUDE: 'labelLatitude', // 散点纬度
  TOTALQUOTA: 'totalQuota', // 散点经度
  SECONDARYQUOTA: 'secondaryQuota', // 散点纬度
};

/**
 * @description 编辑大屏配置栏
 */
export default {
  name: 'DrawingBoardSetting',
  provide() {
    return {
      boardSettingWrapper: this,
    };
  },
  data() {
    return {
      DROG_TYPE,
    };
  },
  components: {
    ShapeLineSetting,
    ShapeRoundSetting,
    ShapeRectangularSetting,
    BoardPageSetting,
    ChartLineSetting,
    ChartBarSetting,
    ChartPieSetting,
    ChartRingPieSetting,
    ChartNestPieSetting,
    BoardSettingRight,
    ChartRadarSetting,
    ChartGaugeSetting,
    ChartScatterSetting,
    ChartSunburstSetting,
    ChartTreemapSetting,
    ChartHeatmapSetting,
    ChartProgressSetting,
    ChartTableSetting,
    BoardTextSetting,
    BoardImageSetting,
    ChartMapSetting,
    BoardSourceSetting,
    ChartFunnelSetting,
    BoardQuatoCardSetting,
  },
  computed: {
    ...mapState({
      // 当前组件
      currentCom: state => state.board.currentCom,
    }),
  },
  watch: {
    currentCom(newValue) {
      this.$refs['js-board-setting-right'] && this.$refs['js-board-setting-right'].handleChartPivoSchemaList(newValue);
    },
  },
};
</script>
<style lang="less">
@import url('../../../../assets/less/common/variables.less');
@import url('../../../../assets/less/mixins/set-color-picker.less');
.@{board}-setting {
  transition: right 0.3s ease-in-out;
  top: 64px;
  right: 0;
  bottom: 0;
  width: @board-setting-width;
  .data-setting {
    float: left;
    width: 200px;
    height: 100%;
    position: relative;
    background-color: #fff;
    border-left: 1px solid #ccc;
    overflow: hidden;
  }
  .setting-wrapper {
    position: relative;
    background-color: #f5f5f5;
    width: 100%;
    height: 100%;
    .back {
      position: absolute;
      top: 10px;
      left: 8px;
      cursor: pointer;
      height: 16px;
      line-height: 16px;
      color: #8f8f8f;
      z-index: 1;
      font-size: 20px;
    }
    > .title {
      height: 36px;
      line-height: 36px;
      text-align: center;
      background-color: #fff;
      border-bottom: 1px solid #ccc;
      position: relative;
      font-size: 14px;
      color: #282828;
      font-weight: 500;
      margin-bottom: 0;
    }
    .toolbar-more {
      position: absolute;
      top: 10px;
      right: 8px;
      cursor: pointer;
      height: 16px;
      line-height: 16px;
      color: #8f8f8f;
      width: 14px;
    }
  }
}
.chart-setting {
  float: left;
  width: @chart-setting-width;
  height: 100%;
  position: relative;
  background-color: #fff;
  border-left: 1px solid #ccc;
  .panel-setting {
    height: 100%;
    width: 100%;
  }
  .tab-wrapper {
    height: calc(100% - 36px);
    overflow-y: auto;
    .tab-header {
      display: table;
      width: 100%;
      table-layout: fixed;
      border-bottom: 1px solid #ccc;
      .header-item {
        display: table-cell;
        text-align: center;
        height: 36px;
        line-height: 36px;
        position: relative;
        color: #525252;
        background-color: #fff;
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        &.active {
          &::before {
            content: '';
            display: block;
            height: 2px;
            width: 100%;
            background-color: #677cf7;
            position: absolute;
            bottom: -1px;
          }
        }
      }
    }
    .tab-content,
    .tabs-content {
      position: relative;
      padding-top: 1px;
      height: calc(100% - 37px);
      overflow-y: auto;
    }
  }
  .font-color {
    .set-color-picker();
    width: 26px;
    height: 26px;
  }
}
.unit-field {
  .dropable {
    &.drop-start {
      .drop-area {
        background-color: #e9ebee;
      }
    }
    &.drop-over {
      .drop-area {
        .drop-body {
          .body-empty,
          .drop-input {
            background-color: #e1e1e1;
          }
        }
      }
    }
    .drop-area {
      padding: 8px 6px 8px 7px;
      margin: -9px -7px -9px -8px;
      .drop-body {
        .pilly-item,
        .body-empty {
          border: 1px dotted #ccc;
          height: 28px;
          line-height: 26px;
          background-color: #fff;
          text-align: center;
          border-radius: 100px;
        }
        .pilly-item {
          cursor: -webkit-grab;
          padding: 0 18px;
          text-align: left;
          &.dimension {
            background-color: #4a90e2;
            color: #fff;
          }
          &.measure {
            background-color: #40c0a8;
            color: #fff;
          }
          .text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      .pillys {
        .pilly-item {
          padding: 0 18px;
          height: 24px;
          line-height: 22px;
          position: relative;
          border-radius: 100px;
          &:hover {
            .suffix-btn {
              display: block;
            }
          }
          .suffix-btn {
            display: none;
            position: absolute;
            width: 16px;
            height: 16px;
            right: 10px;
            top: 50%;
            margin-top: -8px;
            cursor: pointer;
            &::after {
              content: '';
              width: 0;
              height: 0;
              position: absolute;
              left: 3px;
              top: 5px;
              border-width: 6px 5px;
              border-style: solid;
              border-color: transparent;
              border-top-color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>
