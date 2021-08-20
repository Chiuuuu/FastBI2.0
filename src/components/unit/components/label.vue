<template>
  <div class="unit-label">
    <a-row class="unit-show-block position mb-8">
      <a-col :span="18">
        <div class="unit-block-title">{{ label }}</div>
      </a-col>
      <a-col :span="6">
        <!-- 标签是否显示 start -->
        <UnitCheckbox
          class="show-btn"
          label="显示"
          style="top: -4px"
          :value="seriesLabel.show"
          @change="show => handleLabel('show', show)"
        ></UnitCheckbox>
        <!-- 标签是否显示 end -->
      </a-col>
    </a-row>

    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">文本</div>
      </a-col>

      <!-- 标签 字体 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker :value="seriesLabel.color" @change="color => handleLabel('color', color)"></ColorPicker>
        </div>
      </a-col>
      <!-- 标签 字体 颜色 end -->

      <!-- 标签 字体 大小 start -->
      <a-col :span="16">
        <a-input-number
          :value="seriesLabel.fontSize"
          :min="0"
          @change="fontSize => handleLabel('fontSize', fontSize)"
        />
      </a-col>
      <!-- 标签 字体 大小 end -->
    </a-row>
    <a-row class="unit-show-block mb-3" v-if="labelPositionList.length">
      <a-col :span="6">
        <div class="unit-block-title">{{ label }}位置</div>
      </a-col>

      <!-- 标签 位置 start -->
      <a-col :span="16" :offset="2">
        <a-select
          style="width: 100%"
          :value="seriesLabel.position"
          @change="position => handleLabel('position', position)"
        >
          <a-select-option :value="item.value" v-for="(item, index) in labelPositionList" :key="index">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-col>
      <!-- 标签 位置 end -->
    </a-row>
  </div>
</template>
<script>
const positionList = [
  //标签位置
  { name: '上', value: 'top' },
  { name: '下', value: 'bottom' },
  { name: '左', value: 'left' },
  { name: '右', value: 'right' },
  { name: '左上', value: 'insideBottomRight' },
  { name: '左下', value: 'insideTopRight' },
  { name: '右上', value: 'insideBottomLeft' },
  { name: '右下', value: 'insideTopLeft' },
];
/**
 * @description 标签设置
 */
export default {
  name: 'UnitLabel',
  props: {
    seriesLabel: {
      // 标签
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: () => '标签',
    },
    labelPositionList: {
      type: Array,
      default: () => positionList,
    },
  },
  methods: {
    /**
     * @description 设置标签
     */
    handleLabel(key, value) {
      this.handleChange('label', {
        [key]: value,
      });
    },
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
  },
};
</script>
