<template>
  <div class="setting-unit-content">
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">{{ label }}</div>
      </a-col>
      <!-- 颜色 start -->
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker :value="font.color" @change="color => handleChange('color', color)"></ColorPicker>
        </div>
      </a-col>
      <!-- 颜色 end -->

      <!-- 大小 start -->
      <a-col :span="16">
        <a-input-number :value="font.size" :min="0" @change="width => handleChange('size', width)" />
      </a-col>
      <!-- 大小 end -->
    </a-row>
    <!-- 标题 字体 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">字体</div>
      </a-col>
      <a-col :span="16" :offset="2">
        <a-select style="width: 100%" :value="font.family" @change="family => handleChange('family', family)">
          <a-select-option :value="item.value" v-for="(item, index) in fontFamily" :key="index">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- 标题 字体 end -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">粗细</div>
      </a-col>
      <a-col :span="16" :offset="2">
        <a-select style="width: 100%" :value="font.weight" @change="weight => handleChange('weight', weight)">
          <a-select-option value="normal">正常</a-select-option>
          <a-select-option value="bolder">加粗</a-select-option>
          <a-select-option value="lighter">更细</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- 标题 粗细 end -->

    <!-- 标题 对齐 start -->
    <a-row class="unit-show-block mb-8" v-if="font.align">
      <a-col :span="12">
        <div class="unit-block-title">对齐</div>
      </a-col>
      <template v-for="item in align">
        <a-col :span="4" :key="item">
          <div class="font-align" :class="item === font.align ? 'selected' : ''" @click="handleChange('align', item)">
            <a-icon :type="`align-${item}`" />
          </div>
        </a-col>
      </template>
    </a-row>
    <!-- 标题 对齐 end -->
  </div>
</template>
<script>
import fontFamily from '@/utils/fontFamily';
export default {
  name: 'UnitFont',
  props: {
    label: {
      type: String,
      default: '字体',
    },
    font: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      align: ['left', 'center', 'right'], // 对齐方式
      fontFamily, //字体
    };
  },
  methods: {
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
  },
};
</script>
