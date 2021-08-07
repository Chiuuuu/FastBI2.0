<template>
  <a-row class="unit-show-block mb-8">
    <a-col :span="4">
      <div class="unit-block-title">{{ label }}</div>
    </a-col>
    <!-- 颜色 start -->
    <a-col :span="4">
      <div class="font-color">
        <ColorPicker
          :value="font.color"
          @change="color => handleChange('color', color)"
        ></ColorPicker>
      </div>
    </a-col>
    <!-- 颜色 end -->

    <!-- 大小 start -->
    <a-col :span="16">
      <a-input-number
        :value="font.width"
        :min="0"
        @change="width => handleChange('width', width)"
      />
    </a-col>
    <!-- 大小 end -->
  </a-row>
</template>
<script>
export default {
  name: 'UnitFont',
  props: {
    label: {
      type: String,
      default: '字体'
    },
    font: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleChange(key, value) {
      this.$emit('change', key, value)
    }
  }
}
</script>
