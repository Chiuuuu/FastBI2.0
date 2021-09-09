<template>
  <div class="collapse-list reset-scrollbar">
    <slot></slot>
  </div>
</template>
<script>
/**
 * @description 手风琴/折叠板
 */
export default {
  name: 'Collapse',
  props: {
    value: {
      // 活动值
      type: Array,
      default: () => [],
    },
  },
  model: {
    prop: 'value',
    event: 'click-panel',
  },
  provide() {
    return {
      collapse: this,
    };
  },
};
</script>
<style lang="less">
.collapse-list {
  height: 100%;
  overflow: auto;
  .content-item {
    position: relative;
    border-bottom: 1px solid #ccc;
    .collapse-item-header {
      height: 40px;
      line-height: 40px;
      font-weight: 500;
      position: relative;
      user-select: none;
      font-size: 12px;
      color: #282828;
      cursor: pointer;
      &::before {
        top: 50%;
        margin-top: -2px;
      }
      & + .collapse-content {
        .setting-unit-content {
          margin-top: 0;
        }
      }
    }
    &.close {
      // 关闭
      padding-bottom: 0;
    }
    .collapsible {
      height: 40px;
      line-height: 40px;
      font-weight: 500;
      position: relative;
      user-select: none;
      padding-left: 8px;
      font-size: 12px;
      color: #282828;
      cursor: pointer;
      .u-icon {
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
      }
      .title {
        display: inline-block;
        height: 40px;
        line-height: 40px;
        margin-left: 0px;
        border: none;
        background-color: transparent;
      }
    }
    .setting-unit-content {
      margin: 6px 9px;
      position: relative;
      font-size: 12px;
      color: #282828;
      .show-btn {
        position: absolute;
        top: -36px;
        right: 0;
        line-height: 28px;
        &.strict {
          position: inherit;
          top: 0;
        }
      }
      .unit-show-block {
        .block-checkbox {
          top: -3px;
        }
      }
      .axis-name-box {
        position: relative;
        .show-btn {
          top: -8px;
        }
      }
    }
  }
}
</style>
