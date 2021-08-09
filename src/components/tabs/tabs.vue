<template>
  <div class="tabs-wrapper">
    <ul class="tabs-header">
      <li
        class="tabs-item"
        v-for="item in headerList"
        :key="item.key"
        :class="item.key === value ? 'active' : ''"
        @click="handleChange(item)"
      >
        {{ item.name }}
      </li>
    </ul>
    <div class="tabs-content reset-scrollbar">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Tabs',
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      headerList: [],
    };
  },
  provide() {
    return {
      tabs: this,
    };
  },
  methods: {
    /*
     * 获取头部数据
     */
    getHeaderData() {
      this.$slots.default.forEach(com => {
        this.headerList.push({
          name: com.componentInstance.label,
          key: com.componentInstance.tab,
        });
      });
    },
    /*
     * 切换tab选项
     */
    handleChange(item) {
      this.$emit('change', item.key);
    },
  },
  mounted() {
    this.getHeaderData();
  },
};
</script>
<style lang="less">
.tabs-wrapper {
  height: 100%;
  overflow-y: auto;
  .tabs-header {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-bottom: 1px solid #ccc;
    .tabs-item {
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
          background-color: #103ffa;
          position: absolute;
          bottom: -1px;
        }
      }
    }
  }
  .tabs-content {
    position: relative;
    padding-top: 1px;
    overflow-y: auto;
  }
}
</style>
