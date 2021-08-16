<template>
  <div class="unit-title">
    <UnitCheckbox
      class="show-btn"
      label="显示"
      :value="title.show"
      @change="show => handleTitleChange('show', show)"
    ></UnitCheckbox>

    <!-- 标题 内容 start -->
    <div class="mb-8">
      <a-input
        :value="title.text"
        :maxLength="20"
        @blur="event => handleTitleChange('text', event.target.value)"
      ></a-input>
    </div>
    <!-- 标题 内容 end -->

    <!-- 标题 文本 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">文本</div>
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
    <!-- 标题 文本 end -->

    <!-- 标题 字体 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">字体</div>
      </a-col>
      <a-col :span="16" :offset="2">
        <a-select
          style="width: 100%"
          :value="title.font.family"
          @change="family => handleTitleFontChange('family', family)"
        >
          <a-select-option value="sans-serif">默认</a-select-option>
          <a-select-option value="simfang">simfang</a-select-option>
          <a-select-option value="fangsong">仿宋_GB2312</a-select-option>
          <a-select-option value="times">times</a-select-option>
          <a-select-option value="msyh">微软雅黑</a-select-option>
          <a-select-option value="simkai">simkai</a-select-option>
          <a-select-option value="pangmenzhengdao">庞门正道标题体</a-select-option>
          <a-select-option value="HuXiaoBoNanShenTi">HuXiaoBoNanShenTi</a-select-option>
          <a-select-option value="youshe">优设标题黑</a-select-option>
          <a-select-option value="digital-7-4">digital-7-4</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- 标题 字体 end -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="4">
        <div class="unit-block-title">粗细</div>
      </a-col>
      <a-col :span="16" :offset="2">
        <a-select
          style="width: 100%"
          :value="title.font.weight"
          @change="weight => handleTitleFontChange('weight', weight)"
        >
          <a-select-option value="normal">正常</a-select-option>
          <a-select-option value="bolder">加粗</a-select-option>
          <a-select-option value="lighter">更细</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- 标题 粗细 end -->

    <!-- 标题 对齐 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="12">
        <div class="unit-block-title">对齐</div>
      </a-col>
      <template v-for="item in align">
        <a-col :span="4" :key="item">
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
    <!-- 标题 对齐 end -->

    <!-- 标题 间隔 start -->
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
    <!-- 标题 间隔 end -->
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
