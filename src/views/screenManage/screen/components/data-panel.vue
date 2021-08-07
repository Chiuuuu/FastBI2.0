<template>
  <div class="data-panel">
    <!-- 维度面板 start -->
    <div class="dimension-area">
      <div class="head">
        <h4 class="title">维度</h4>
        <div class="u-icon">＋</div>
      </div>
      <div class="body">
        <div class="schema-list-wrapper">
          <Collapse
            class="schema-list reset-scrollbar js-schema-dimension-list"
          >
            <CollapsePanel class="schema-item" panel="order" header="订单">
              <ul class="field-list">
                <template v-for="item in dimension">
                  <DataPanelItem
                    :key="item.id"
                    type="dimension"
                    :data="item"
                    :selected="isSelected(item)"
                  ></DataPanelItem>
                </template>
              </ul>
            </CollapsePanel>
          </Collapse>
        </div>
      </div>
    </div>
    <!-- 维度面板 end -->

    <!-- 度量面板 start -->
    <div class="measure-area">
      <div class="head">
        <h4 class="title">度量</h4>
        <div class="u-icon">＋</div>
      </div>
      <div class="body">
        <div class="schema-list-wrapper">
          <Collapse class="schema-list reset-scrollbar js-schema-measure-list">
            <CollapsePanel class="schema-item" panel="order" header="订单">
              <ul class="field-list">
                <template v-for="item in measure">
                  <DataPanelItem
                    :key="item.id"
                    type="measure"
                    :data="item"
                    :selected="isSelected(item)"
                  ></DataPanelItem>
                </template>
              </ul>
            </CollapsePanel>
            <CollapsePanel class="schema-item" panel="area" header="区域">
              <ul class="field-list">
                <template v-for="item in measure">
                  <DataPanelItem
                    :key="item.id"
                    type="measure"
                    :data="item"
                    :selected="isSelected(item)"
                  ></DataPanelItem>
                </template>
              </ul>
            </CollapsePanel>
          </Collapse>
        </div>
      </div>
    </div>
    <!-- 度量面板 end -->
  </div>
</template>
<script>
import DataPanelItem from './data-panel-item.vue'
import { mutationTypes as historyMutation } from '@/store/modules/history'
export default {
  name: 'DataPanel',
  components: {
    DataPanelItem
  },
  props: {
    dimension: {
      type: Array,
      required: true
    },
    measure: {
      type: Array,
      required: true
    },
    selectFiled: {
      type: Object,
      default: () => {}
    }
  },
  mounted() {
    this.$EventBus.$on('drop:dimension-list', this.dropDimensionList)
    this.$EventBus.$on('drop:measure-list', this.dropMeasureList)
  },
  beforeDestroy() {
    this.$EventBus.$off('drop:dimension-list', this.dropDimensionList)
    this.$EventBus.$off('drop:measure-list', this.dropMeasureList)
  },
  methods: {
    isSelected(item) {
      return (
        item.id === this.selectFiled.id && item.name === this.selectFiled.name
      )
    },
    recordHistory(target, data, action) {
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'DatePanel',
        store: this.$store,
        target,
        item: data,
        action
      })
    },
    dropDimensionList(item) {
      const target = [
        {
          method: 'add',
          list: this.dimension
        },
        {
          method: 'dele',
          list: this.measure
        }
      ]
      this.recordHistory(target, item, 'move')
    },
    dropMeasureList(item) {
      const target = [
        {
          method: 'add',
          list: this.measure
        },
        {
          method: 'dele',
          list: this.dimension
        }
      ]
      this.recordHistory(target, item, 'move')
    }
  }
}
</script>
<style lang="less">
.data-panel {
  height: calc(100% - 123px);
  .dimension-area,
  .measure-area {
    position: relative;
    height: 50%;
    overflow: hidden;
    padding-bottom: 8px;
    > .head {
      position: relative;
      > h4.title {
        height: 36px;
        line-height: 36px;
        text-indent: 16px;
        font-weight: 500;
        font-size: 12px;
      }
      > .u-icon {
        position: absolute;
        cursor: pointer;
        font-size: 22px;
        font-weight: 300;
        top: 50%;
        transform: translateY(-50%);
        right: 16px;
      }
    }
    > .body {
      height: calc(100% - 38px);
      .schema-list-wrapper {
        font-size: 12px;
        height: 100%;
      }
      .schema-list {
        height: 100%;
        overflow: auto;
        &.drop-start {
          border: 1px solid #4a90e2;
        }
        .schema-item {
          .collapse-item-header {
            height: 28px;
            line-height: 28px;
            overflow: hidden;
            word-wrap: normal;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
    .field-list {
      .field-item {
        padding-left: 20px;
        position: relative;
        &.selected,
        &:hover {
          background-color: #4a90e2;
          color: #fff;
          cursor: -webkit-grab;
          .prefix-icon {
            color: #fff;
          }
          .suffix-btn {
            display: block;
          }
        }
        .prefix-icon {
          display: block;
          float: left;
          width: 14px;
          margin-top: 2px;
        }
        > p {
          margin: 0;
          display: block;
          overflow: hidden;
          word-wrap: normal;
          white-space: nowrap;
          text-overflow: ellipsis;
          user-select: none;
          float: left;
          height: 28px;
          line-height: 28px;
          margin-left: 9px;
          width: calc(100% - 60px);
        }
        .suffix-btn {
          display: none;
          position: absolute;
          width: 16px;
          height: 16px;
          right: 20px;
          top: 50%;
          margin-top: -8px;
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
  .dimension-area {
    border-bottom: 1px solid #ccc;
    .prefix-icon {
      color: #4a90e2;
    }
  }
  .measure-area {
    .prefix-icon {
      color: #40c0a8;
    }
  }
}
</style>
