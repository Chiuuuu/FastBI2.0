<template>
  <div class="unit-position">
    <a-row class="unit-show-block">
      <a-col :span="3">
        <div class="unit-block-title">位置</div>
      </a-col>
      <a-col :span="10" class="col-offset">
        <div class="unit-block-title">X</div>
        <!-- X轴 start -->
        <a-input-number
          :value="position.left"
          @change="val => handleChange('left', val)"
        />
        <!-- X轴 end -->
      </a-col>
      <a-col :span="10" class="col-offset">
        <div class="unit-block-title">Y</div>
        <!-- Y轴 start -->
        <a-input-number
          :value="position.top"
          @change="val => handleChange('top', val)"
        />
        <!-- Y轴 end -->
      </a-col>
    </a-row>
  </div>
</template>
<script>
/**
 * @description 位置设置
 */
export default {
  name: 'UnitPosition',
  props: {
    position: {
      // 位置配置
      type: Object,
      required: true
    }
  },
  methods: {
    handleChange(key, val) {
      this.$emit('change', {
        [key]: val
      })
    }
  }
}
</script>
