<template>
  <div class="">
    <div class="axis-name-box mb-8">
      <p>{{ label }}</p>
      <a-row class="unit-show-block mb-2" v-for="(row, index) in axisPosition" :key="index">
        <template v-for="col in row">
          <div class="unit-show-block-row" :key="col.name">
            <a-col :span="3">
              <div class="unit-block-title">{{ col.name }}</div>
            </a-col>
            <a-col :span="8" :offset="1">
              <a-input-number :value="grid[col.key]" :min="0" @change="value => handleMargin(col.key, value)" />
            </a-col>
          </div>
        </template>
      </a-row>
    </div>
  </div>
</template>
<script>
/**
 * @description 网格边距
 */
export default {
  name: 'UnitGridMargin',
  props: {
    grid: {
      // 网格配置
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: () => '边距',
    },
  },
  data() {
    return {
      axisPosition: [
        // 边距
        [
          { name: '上', key: 'top' },
          { name: '下', key: 'bottom' },
        ],
        [
          { name: '左', key: 'left' },
          { name: '右', key: 'right' },
        ],
      ],
    };
  },
  methods: {
    /**
     * @description 网格边距设置
     * @param {any} value 值
     * @param {string} key 属性
     */
    handleMargin(key, value) {
      this.grid[key] = value;
      this.handleChange('grid', {
        grid: this.grid,
      });
    },
    /**
     * @description 暴露修改方法
     */
    handleChange(key, value) {
      this.$emit('change', key, value);
    },
  },
};
</script>
<style lang="less" scoped>
.unit-show-block-row {
  &:last-child {
    .unit-block-title {
      text-align: center;
    }
  }
}
</style>
