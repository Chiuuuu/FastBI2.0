<template>
  <div class="drawing-board-side" :class="toggleOpen ? 'open' : 'close'">
    <div class="panel-layer">
      <!-- 展开按钮 -->
      <div class="header">
        <span class="title">页面图层</span>
        <span class="u-icon" @click="handleToggleSide">
          <i class="bi-data" :class="toggleOpen ? 'bi-data-panel-open' : 'bi-data-panel-close'"></i>
        </span>
      </div>
      <!-- 图层列表 -->
      <div class="layer-list-wrapper">
        <ul class="layer-list reset-scrollbar">
          <li
            v-for="com in components"
            :key="com.id"
            class="layer-item"
            :class="com === currentCom ? 'layer-item-selected' : ''"
            :title="com.setting.style.title.text"
            @click="handleSideItemSelect(com)"
            :id="com.id"
          >
            <span class="u-icon">
              <i class="bi-data" :class="getChartTypeIcon(com.type)"></i>
            </span>
            <span class="item-title" :title="com.setting.style.title.text">{{ com.setting.style.title.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { mutationTypes as boardMutaion } from '@/store/modules/board';
import BoardType from '@/views/screenManage/screen/setting/default-type';

/**
 * @description 编辑大屏左侧图表层级菜单
 */
export default {
  name: 'DrawingBoardSide',
  data() {
    return {
      toggleOpen: false, // 控制展开
    };
  },
  computed: {
    ...mapState({
      // 当前组件
      currentCom: state => state.board.currentCom,
    }),
    components() {
      // 组件列表
      const components = [...this.$store.state.board.components];
      return components.reverse();
    },
  },
  methods: {
    /**
     * @description 获取图表类型图标
     * @param {string} type 类型
     */
    getChartTypeIcon(type) {
      const icon = {
        [BoardType.ChartLine]: 'bi-data-line-chart',
        [BoardType.ChartBar]: 'bi-data-bar-chart',
        [BoardType.ChartPie]: 'bi-data-pie-chart',
        [BoardType.ChartRingPie]: 'bi-data-pie-chart',
        [BoardType.ChartNestPie]: 'bi-data-pie-chart',
        [BoardType.ChartRadar]: 'bi-data-radar-chart',
        [BoardType.ChartGauge]: 'bi-data-gauge-chart',
        [BoardType.ChartScatter]: 'bi-data-gauge-chart',
        [BoardType.ChartSunburst]: 'bi-data-gauge-chart',
        [BoardType.ChartTreemap]: 'bi-data-gauge-chart',
        [BoardType.ChartHeatmap]: 'bi-data-gauge-chart',
        [BoardType.ChartProgress]: 'bi-data-gauge-chart',
        [BoardType.ChartTable]: 'bi-data-gauge-chart',
        [BoardType.ShapeLine]: 'bi-data-gauge-chart',
        [BoardType.ShapeRound]: 'bi-data-gauge-chart',
        [BoardType.ShapeRectangular]: 'bi-data-gauge-chart',
        [BoardType.Text]: 'bi-data-bar-chart',
      };
      return icon[type];
    },
    /**
     * @description 展开/关闭 侧边栏
     */
    handleToggleSide() {
      this.toggleOpen = !this.toggleOpen;
    },
    /**
     * @description 图表选中(切换图表)
     */
    handleSideItemSelect(com) {
      if (com === this.currentCom) return;
      this.$store.commit(boardMutaion.SET_CURCOM, {
        component: com,
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import url('../../../../assets/less/common/variables.less');
.@{board}-side {
  top: 64px;
  bottom: 0;
  left: 0;
  right: auto;
  width: 200px;
  max-width: 48px;
  transition: max-width 0.3s ease-in-out;
  z-index: 1;
  &.open {
    max-width: 200px;
    .panel-layer {
      .header {
        .u-icon {
          top: initial;
          transform: none;
        }
      }
    }
  }
  &.close {
    .panel-layer {
      .header {
        .title {
          display: none;
        }
        .u-icon {
          position: static;
          transform: none;
        }
      }
      .layer-list-wrapper {
        .layer-list {
          .layer-item {
            padding: 0;
            text-align: center;
            .item-title {
              display: none;
            }
          }
        }
      }
    }
  }
  .panel-layer {
    height: 100%;
    border-right: 1px solid #ccc;
    .header {
      position: relative;
      line-height: 36px;
      white-space: nowrap;
      text-align: center;
      border-bottom: 1px solid #ccc;
      background: #fff;
      overflow: hidden;
      font-size: 14px;
      .title {
        color: #282828;
        font-weight: 500;
      }
      .u-icon {
        display: inline-block;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        line-height: 36px;
        color: #8d929c;
        cursor: pointer;
        width: 14px;
        height: 14px;
      }
    }
    .layer-list-wrapper {
      height: 100%;
      .layer-list {
        height: calc(100% - 36px);
        background: #f5f5f5;
        overflow: auto;
        &.reset-scrollbar {
          &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }
        .layer-item {
          position: relative;
          height: 28px;
          line-height: 26px;
          padding: 0 18px 0 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          .item-title {
            margin-left: 6px;
            font-size: 12px;
            color: #333;
          }
          &:hover,
          &-selected {
            background: #103ffa;
            .item-title,
            .bi-data {
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>
