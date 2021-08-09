<template>
  <div class="collapse-item" :class="toggleCollapse ? 'open' : 'close'">
    <div
      class="collapse-item-header"
      :class="isTogger ? '' : 'is-no-togger'"
      @click="handleSelectPanel(panel)"
      v-if="header"
    >
      {{ header }}
    </div>
    <div class="collapse-content" v-show="toggleCollapse">
      <slot></slot>
    </div>
  </div>
</template>
<script>
/**
 * @description 手风琴内部元素
 */
export default {
  name: 'CollapsePanel',
  inject: ['collapse'],
  props: {
    panel: {
      // 相当于key，作为唯一值
      type: [String, Number],
      default: '',
    },
    header: {
      // 标题
      type: String,
      default: '',
    },
    isTogger: {
      // 是否能折叠
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      toggleCollapse: this.isTogger ? this.collapse.value.includes(this.panel) : true,
    };
  },
  methods: {
    handleSelectPanel(key) {
      if (!this.isTogger) return;

      this.toggleCollapse = !this.toggleCollapse;
      if (this.toggleCollapse) {
        this.collapse.value.push(key);
      } else {
        const index = this.collapse.value.findIndex(item => item === key);
        this.collapse.value.splice(index, 1);
      }
      this.collapse.$emit('click-panel', this.collapse.value);
    },
  },
};
</script>
<style lang="less">
.collapse-item {
  &.close {
    .collapse-item-header {
      &::before {
        transform: rotate(-135deg);
      }
    }
  }
  &.open {
    .collapse-item-header {
      &.is-no-togger {
        padding-left: 9px;
        &::before {
          display: none;
        }
      }
      &::before {
        transform: rotate(-45deg);
      }
    }
  }
  .collapse-item-header {
    position: relative;
    padding-left: 27px;
    cursor: pointer;
    &::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 14px;
      display: block;
      width: 4px;
      height: 4px;
      border: 1px solid #525252;
      border-top: 0;
      border-right: 0;
      transition: transform 0.24s;
    }
  }
}
</style>
