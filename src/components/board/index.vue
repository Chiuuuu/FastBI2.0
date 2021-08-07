<template>
  <div class="board-layout">
    <!--顶部操作栏-->
    <board-header :config="config.header" v-if="config.header" v-bind="$attrs">
      <slot name="headerBox"></slot>
    </board-header>
    <!--中间工作区-->
    <div class="center-box" flex>
      <!--左侧图层列表-->
      <board-coverage
        :config="config.coverage"
        v-if="config.coverage"
        @toggleCollapsed="ToggleCoverageExpand"
      >
        <slot name="coverage"></slot>
      </board-coverage>
      <!--中间画板区域-->
      <div class="board-center" :style="centerStyle">
        <canvas-main>
          <slot name="canvas"></slot>
        </canvas-main>
        <board-options
          v-if="config.options"
          :config="config.options"
          @on-toggle="ToggleOptionsExpand"
        ></board-options>
      </div>
      <!-- 右侧数据模型列表 -->
      <board-model
        :config="config.model"
        v-if="config.model"
        @on-toggle="ToggleModelExpand"
        @getErrorData="getErrorData"
      >
        <slot name="model"></slot>
      </board-model>
    </div>
    <!-- 右键菜单 -- 查看数据 -->
    <chartTableData
      :show="show"
      :chart-data="chartData"
      @cancel="show = false"
    ></chartTableData>
  </div>
</template>

<script>
// 默认配置信息
import config from '../../config/board'
import BoardHeader from './header/index' // 头部
import BoardCoverage from './coverage/index' // 左侧栏(图层)
import BoardOptions from './options/index' // 右侧栏(页面配置)
import CanvasMain from './canvas' // 中间画板
import chartTableData from './chartTableData/index' // 右键菜单
import BoardModel from './model/index' // 8-14 新增数据模型
import { mapGetters, mapActions } from 'vuex'

const prefixCls = 'board'
export default {
  name: 'Board',
  data() {
    return {
      prefixCls: prefixCls,
      config: config,
      errorData: '',
      show: false, // 图表数据查看
      chartData: {} // 图表数据
    }
  },
  provide() {
    return {
      errorFile: this.errorData,
      showChartData: this.showChartData
    }
  },
  computed: {
    ...mapGetters([
      'optionsExpand',
      'coverageExpand',
      'modelExpand',
      'currSelected',
      'currentSelected',
      'pageSettings',
      'canvasRange'
    ]),
    centerStyle() {
      return {
        left: this.coverageExpand ? this.config.coverage.style.width : '50px',
        // right: this.optionsExpand ? this.config.options.style.width : '0'
        right: this.modelExpand ? this.config.model.style.width : '50px'
      }
    }
  },
  watch: {
    // 检测图层面板是否打开
    coverageExpand(val) {
      if (val) {
        this.config.coverage.style.width = '180px'
        this.config.coverage.style.flex = '0 0 180px'
      } else {
        this.config.coverage.style.width = '50px'
        this.config.coverage.style.flex = '0 0 50px'
      }
    }
  },
  methods: {
    ...mapActions([
      'ToggleOptionsExpand',
      'ToggleCoverageExpand',
      'ToggleModelExpand'
    ]),
    getErrorData(error) {
      this.errorData = error
    },
    // 设置图表数据
    showChartData(chartData) {
      this.chartData = chartData
      this.show = true
    }
  },
  // 8-14 添加配置侧栏
  components: {
    CanvasMain,
    BoardCoverage,
    BoardHeader,
    BoardModel,
    BoardOptions,
    chartTableData
  }
}
</script>
