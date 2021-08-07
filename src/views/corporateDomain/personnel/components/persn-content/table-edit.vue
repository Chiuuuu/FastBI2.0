<template>
  <div style="height:21px">
  <template v-if="index !== activeIndex">
    <!-- <a-popover>
      <template slot="content">{{ data.attrValue }}</template>
      <span type="primary">{{ data.attrValue }}</span>
    </a-popover> -->
    <span :title="data.attrValue">{{ data.attrValue }}</span>
  </template>
  <a-input v-else :value="editValue" @change="handleChangeText" size="small"></a-input>
  </div>
</template>

<script>
export default {
  name: 'tableEdit',
  props: {
    data: Object,
    activeIndex: Number,
    index: Number
  },
  data() {
    return {
      editValue: this.data.attrValue
    }
  },
  watch: {
    'data.attrValue'(newValue) {
      this.editValue = newValue
    }
  },
  methods: {
    handleChangeText(e) {
      this.$emit('getChangeText', e.target.value)
    }
  }
}
</script>

<style>

</style>
