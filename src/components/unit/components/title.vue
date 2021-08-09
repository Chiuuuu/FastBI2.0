<template>
  <div class="unit-title">
    <UnitCheckbox
      class="show-btn"
      label="显示"
      :value="title.show"
      @change="show => handleTitleChange('show', show)"
    ></UnitCheckbox>
    <div class="mb-8">
      <a-input
        :value="title.text"
        :maxLength="20"
        @blur="event => handleTitleChange('text', event.target.value)"
      ></a-input>
    </div>
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">字体</div>
      </a-col>
      <a-col :span="4">
        <div class="font-color">
          <ColorPicker :value="title.font.color" @change="color => handleTitleFontChange('color', color)"></ColorPicker>
        </div>
      </a-col>
      <a-col :span="16">
        <a-input-number :value="title.font.size" :min="0" @change="size => handleTitleFontChange('size', size)" />
      </a-col>
    </a-row>
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">对齐</div>
      </a-col>
      <template v-for="item in align">
        <a-col :span="5" :offset="1" :key="item">
          <div
            class="font-align"
            :class="item === title.font.align ? 'selected' : ''"
            @click="handleTitleFontChange('align', item)"
          >
            <a-icon :type="`align-${item}`" />
          </div>
        </a-col>
      </template>
    </a-row>
    <a-row class="unit-show-block">
      <a-col :span="12">
        <div class="unit-block-title">距绘图区间隔</div>
      </a-col>
      <a-col :span="12">
        <a-input-number
          :value="title.marginBottom"
          :min="0"
          @change="marginBottom => handleChange('title', { marginBottom })"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script>
/**
 * @description 标题设置
 */
export default {
  name: 'UnitTitle',
  props: {
    title: {
      // 标题配置
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      align: ['left', 'center', 'right'], // 对齐方式
    };
  },
  methods: {
    /**
     * @description 设置标题
     */
    handleTitleChange(key, value) {
      this.handleChange('title', {
        [key]: value,
      });
    },
    /**
     * @description 设置标题字体
     */
    handleTitleFontChange(key, value) {
      this.handleChange('title', {
        font: {
          [key]: value,
        },
      });
    },
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
  },
};
</script>
