<template>
  <div class="unit-data-filter">
    <div class="unit-field">
      <div class="dropable js-drop-data-filter">
        <div class="drop-area">
          <div class="drop-body">
            <div class="body-empty">拖入字段</div>
          </div>
        </div>
      </div>
    </div>
    <slot name="tip"></slot>
    <a-modal v-model="visible" title="Basic Modal" @ok="handleOk">
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </a-modal>
  </div>
</template>
<script>
/**
 * @description 数据筛选设置
 */
export default {
  name: 'UnitDataFilter',
  data() {
    return {
      visible: false, // 是否显示弹窗
    };
  },
  mounted() {
    this.$EventBus.$on('drop:dataFilter', this.showModel);
  },
  beforeDestroy() {
    this.$EventBus.$off('drop:dataFilter', this.showModel);
  },
  methods: {
    showModel() {
      this.visible = true;
    },
    handleOk(e) {
      console.log(e);
      this.visible = false;
    },
  },
};
</script>
