<template>
  <div class="setting-unit-content">
    <UnitCheckbox
      class="show-btn"
      label="显示"
      :value="axis.axisLine.show"
      @change="value => handleAxisLine('show', value)"
    ></UnitCheckbox>

    <!-- 轴相关设置 start -->
    <a-row class="unit-show-block mb-8">
      <a-col :span="6">
        <div class="unit-block-title">轴设置</div>
      </a-col>

      <!-- 轴 颜色 start -->
      <a-col :span="4" :offset="1">
        <div class="font-color">
          <ColorPicker
            :value="axis.axisLine.lineStyle.color"
            @change="color => handleAxisLine('lineStyle', { color })"
          ></ColorPicker>
        </div>
      </a-col>
      <!-- 轴 颜色 end -->

      <!-- 轴 线 大小 start -->
      <a-col :span="13">
        <a-input-number
          :value="axis.axisLine.lineStyle.width"
          :min="1"
          :max="20"
          @change="width => handleAxisLine('lineStyle', { width })"
        />
      </a-col>
      <!-- 轴 线 大小 end -->
    </a-row>
    <!-- 轴相关设置 end -->

    <!-- 轴名称相关设置 start -->
    <div class="axis-name-box mb-8">
      <p>轴名称</p>

      <!-- 轴名称是否显示 start -->
      <UnitCheckbox
        class="show-btn"
        label="显示"
        :value="axis.nameShow"
        @change="handleControlAxisNameShow"
      ></UnitCheckbox>
      <!-- 轴名称是否显示 end -->

      <!-- 轴名称输入框 start -->
      <a-input class="mb-8" :maxLength="20" :value="axis.cache.name" @blur="handleInputBlur"></a-input>
      <!-- 轴名称输入框 end -->

      <a-row class="unit-show-block mb-8">
        <a-col :span="4">
          <div class="unit-block-title">字体</div>
        </a-col>
        <!-- 轴名称 字体 颜色 start -->
        <a-col :span="4">
          <div class="font-color">
            <ColorPicker
              :value="axis.nameTextStyle.color"
              @change="color => handleNameTextStyle('color', color)"
            ></ColorPicker>
          </div>
        </a-col>
        <!-- 轴名称 字体 颜色 end -->

        <!-- 轴名称 字体 大小 start -->
        <a-col :span="16">
          <a-input-number
            :value="axis.nameTextStyle.fontSize"
            :min="0"
            @change="size => handleNameTextStyle('fontSize', size)"
          />
        </a-col>
        <!-- 轴名称 字体 大小 start -->
      </a-row>
      <!-- 轴名称位置 start -->
      <a-row class="unit-show-block mb-8 mt-10">
        <a-col :span="9">
          <div class="unit-block-title">轴名称位置</div>
        </a-col>
        <a-col :span="15">
          <a-radio-group
            :value="axis.nameLocation"
            class="float-right"
            @change="e => handleNameLocation('nameLocation', e.target.value)"
          >
            <a-radio-button value="middle">中部</a-radio-button>
            <a-radio-button value="end">末尾</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
      <!-- 轴名称位置 end -->
      <p>轴名称的内边距</p>
      <a-row class="unit-show-block mb-2" v-for="(row, index) in axisPosition" :key="index">
        <template v-for="col in row">
          <div class="unit-show-block-row" :key="col.name">
            <a-col :span="3">
              <div class="unit-block-title">{{ col.name }}</div>
            </a-col>
            <a-col :span="8" :offset="1">
              <a-input-number
                :value="axis.nameTextStyle.padding[col.index]"
                :min="0"
                @change="value => handleAixsNamePadding(value, col.index)"
              />
            </a-col>
          </div>
        </template>
      </a-row>
    </div>
    <!-- 轴名称相关设置 end -->

    <!-- 轴文字相关设置 start -->
    <div class="axis-name-box mb-8">
      <p>轴文字</p>
      <!-- 轴文字是否显示 start -->
      <UnitCheckbox
        class="show-btn"
        label="显示"
        :value="axis.axisLabel.show"
        @change="show => handleAxisLabel('show', show)"
      ></UnitCheckbox>
      <!-- 轴文字是否显示 end -->
      <a-row class="unit-show-block mb-8">
        <a-col :span="4">
          <div class="unit-block-title">字体</div>
        </a-col>
        <!-- 轴文字 字体 颜色 start -->
        <a-col :span="4">
          <div class="font-color">
            <ColorPicker :value="axis.axisLabel.color" @change="color => handleAxisLabel('color', color)"></ColorPicker>
          </div>
        </a-col>
        <!-- 轴文字 字体 颜色 end -->

        <!-- 轴文字 字体 大小 start -->
        <a-col :span="16">
          <a-input-number
            :value="axis.axisLabel.fontSize"
            :min="0"
            @change="fontSize => handleAxisLabel('fontSize', fontSize)"
          />
        </a-col>
        <!-- 轴文字 字体 大小 end -->
      </a-row>
      <a-row class="unit-show-block">
        <a-col :span="8">
          <div class="unit-block-title">倾斜角度</div>
        </a-col>
        <a-col :span="16">
          <div class="background-color">
            <a-input-number
              :value="axis.axisLabel.rotate"
              :min="0"
              @change="rotate => handleAxisLabel('rotate', rotate)"
            />
          </div>
        </a-col>
      </a-row>
    </div>
    <!-- 轴文字相关设置 end -->

    <!-- 轴刻度是否显示 start -->
    <div class="axis-name-box mb-8">
      <p>轴刻度</p>
      <UnitCheckbox
        class="show-btn"
        label="显示"
        :value="axis.axisTick.show"
        @change="show => handleAxisTick('show', show)"
      ></UnitCheckbox>
    </div>
    <!-- 轴刻度是否显示 end -->
    <!-- 网格线配置 start -->
    <div class="axis-name-box">
      <div>
        <p>网格线</p>
        <UnitCheckbox
          class="show-btn"
          label="显示"
          :value="axis.splitLine.show"
          @change="show => handleSplitLine('show', show)"
        ></UnitCheckbox>
      </div>
      <!-- 网格线颜色 start -->
      <a-row class="unit-show-block mb-8">
        <a-col :span="9">
          <div class="unit-block-title">网格线颜色</div>
        </a-col>
        <a-col :span="15">
          <div class="font-color float-right" style="width: 100%">
            <ColorPicker
              :value="axis.splitLine.lineStyle.color"
              @change="color => handleLineStyle('color', color)"
            ></ColorPicker>
          </div>
        </a-col>
      </a-row>
      <!-- 网格线颜色 end -->
      <!-- 网格线线型 start -->
      <a-row class="unit-show-block">
        <a-col :span="9">
          <div class="unit-block-title">网格线线型</div>
        </a-col>
        <a-col :span="15">
          <a-select
            :value="axis.splitLine.lineStyle.type"
            style="width: 100%"
            @change="type => handleLineStyle('type', type)"
          >
            <a-select-option value="solid">实线</a-select-option>
            <a-select-option value="dotted">点状</a-select-option>
            <a-select-option value="dashed">虚线</a-select-option>
          </a-select>
        </a-col>
      </a-row>
      <!-- 网格线线型 end -->
      <!-- 网格线线型 start -->
      <a-row class="unit-show-block">
        <a-col :span="9">
          <div class="unit-block-title">网格线粗细</div>
        </a-col>
        <a-col :span="15">
          <a-input-number
            :value="axis.splitLine.lineStyle.width"
            :min="0"
            :max="20"
            @change="width => handleLineStyle('width', width)"
          />
        </a-col>
      </a-row>
      <!-- 网格线线型 end -->
    </div>
  </div>
</template>
<script>
/**
 * @description 坐标轴设置
 */
export default {
  name: 'Unitaxis',
  props: {
    axis: {
      // 坐标轴配置
      type: Object,
      required: true,
    },
    type: {
      // 坐标轴类型
      type: String,
      required: true,
    },
  },
  data() {
    return {
      axisPosition: [
        // 内边距布局
        [
          { name: '上', index: 0 },
          { name: '下', index: 2 },
        ],
        [
          { name: '左', index: 3 },
          { name: '右', index: 1 },
        ],
      ],
    };
  },
  methods: {
    /**
     * @description 坐标轴轴线相关设置
     */
    handleAxisLine(key, value) {
      this.handleChange('echart', {
        [this.type]: {
          axisLine: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 坐标轴刻度标签的相关设置
     */
    handleAxisLabel(key, value) {
      this.handleChange('echart', {
        [this.type]: {
          axisLabel: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 坐标轴刻度的相关设置
     */
    handleAxisTick(key, value) {
      this.handleChange('echart', {
        [this.type]: {
          axisTick: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 坐标轴名称的文字样式
     */
    handleNameTextStyle(key, value) {
      this.handleChange('echart', {
        [this.type]: {
          nameTextStyle: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 坐标轴名称的位置
     */
    handleNameLocation(key, value) {
      let padding = [];
      // 设置轴名称内边距的默认值
      if (this.type === 'xAxis') {
        value == 'middle' && (padding = [30, 0, 0, 0]);
        value == 'end' && (padding = [40, 10, 0, 0]);
      } else {
        value == 'middle' && (padding = [0, 0, 40, 0]);
        value == 'end' && (padding = [0, 0, 0, 0]);
      }
      this.handleChange('echart', {
        [this.type]: {
          [key]: value,
          nameTextStyle: {
            padding,
          },
        },
      });
    },
    /**
     * @description 坐标轴名称内边距设置
     * @param {any} value 值
     * @param {number} index 下标
     */
    handleAixsNamePadding(value, index) {
      const padding = [].concat(this.axis.nameTextStyle.padding);
      padding.splice(index, 1, value);
      this.handleNameTextStyle('padding', padding);
    },
    /**
     * @description 坐标轴名称是否显示
     * @param {any} value 值
     */
    handleControlAxisNameShow(value) {
      this.handleChange('echart', {
        [this.type]: {
          nameShow: value,
          name: value ? this.axis.cache.name : '',
        },
      });
    },
    /**
     * @description 坐标轴名称更改
     * 需要同步更新缓存cache
     */
    handleInputBlur(event) {
      this.handleChange('echart', {
        [this.type]: {
          name: event.target.value,
          cache: {
            name: event.target.value,
          },
        },
      });
    },
    /**
     * @description 网格线是否显示
     */
    handleSplitLine(key, value) {
      this.handleChange('echart', {
        [this.type]: {
          splitLine: {
            [key]: value,
          },
        },
      });
    },
    /**
     * @description 网格线配置
     */
    handleLineStyle(key, value) {
      this.handleChange('echart', {
        [this.type]: {
          splitLine: {
            lineStyle: {
              [key]: value,
            },
          },
        },
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
