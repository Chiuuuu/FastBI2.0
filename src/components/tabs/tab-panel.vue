<template>
  <div class="tab-panel" v-if="active">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'TabPanel',
  inject: ['tabs'],
  props: {
    label: {
      type: String,
      default: ''
    },
    tab: {
      type: [String, Number],
      required: true,
      default: ''
    }
  },
  computed: {
    active() {
      return this.tabs.value === this.tab
    }
  }
}
</script>
