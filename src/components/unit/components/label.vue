<template>
  <div class="unit-label">
    <!-- 标签是否显示 start -->
    <UnitCheckbox
      class="show-btn"
      label="显示"
      :value="label.show"
      @change="show => handleLabel('show', show)"
    ></UnitCheckbox>
    <!-- 标签是否显示 end -->

    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">字体</div>
      </a-col>

      <!-- 标签 字体 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker
            :value="label.color"
            @change="color => handleLabel('color', color)"
          ></ColorPicker>
        </div>
      </a-col>
      <!-- 标签 字体 颜色 end -->

      <!-- 标签 字体 大小 start -->
      <a-col :span="16">
        <a-input-number
          :value="label.fontSize"
          :min="0"
          @change="fontSize => handleLabel('fontSize', fontSize)"
        />
      </a-col>
      <!-- 标签 字体 大小 end -->
    </a-row>
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">标签位置</div>
      </a-col>

      <!-- 标签 位置 start -->
      <a-col :span="16" :offset="2">
        <a-select
          style="width: 100%"
          :value="label.position"
          @change="position => handleLabel('position', position)"
        >
          <a-select-option value="top">
            上
          </a-select-option>
          <a-select-option value="bottom">
            下
          </a-select-option>
          <a-select-option value="left">
            左
          </a-select-option>
          <a-select-option value="right">
            右
          </a-select-option>
          <a-select-option value="insideBottomRight">
            左上
          </a-select-option>
          <a-select-option value="insideTopRight">
            左下
          </a-select-option>
          <a-select-option value="insideBottomLeft">
            右上
          </a-select-option>
          <a-select-option value="insideTopLeft">
            右下
          </a-select-option>
        </a-select>
      </a-col>
      <!-- 标签 位置 end -->
    </a-row>
  </div>
</template>
<script>
/**
 * @description 标签设置
 */
export default {
  name: 'UnitLabel',
  props: {
    label: {
      // 标签
      type: Object,
      required: true
    }
  },
  methods: {
    /**
     * @description 设置标签
     */
    handleLabel(key, value) {
      this.handleChange('customLabel', {
        [key]: value
      })
    },
    handleChange(key, value) {
      this.$emit('change', key, value)
    }
  }
}
</script>
