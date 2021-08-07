<template>
  <div class="data-source">
    <a-collapse v-model="activeKey" :bordered="false">
      <a-collapse-panel
        key="dimensions"
        header="维度"
        v-if="chartType === '1' && currSelected.setting.chartType !== 'v-map'"
      >
        <drag-area type="dimensions" ref="child"></drag-area>
      </a-collapse-panel>
      <a-collapse-panel
        key="measures"
        header="度量"
        v-if="
          (chartType === '1' || chartType === '2') &&
            currSelected.setting.chartType !== 'v-text' &&
            currSelected.setting.chartType !== 'v-map'
        "
      >
        <drag-area
          v-if="currSelected.setting.chartType !== 'v-ring'"
          type="measures"
          ref="child"
        ></drag-area>
        <!-- 环形图 -->
        <dragAreaForRing
          v-if="currSelected.setting.chartType === 'v-ring'"
          type="measures"
          measureType="current"
        ></dragAreaForRing>
        <dragAreaForRing
          v-if="currSelected.setting.chartType === 'v-ring'"
          type="measures"
          measureType="total"
        ></dragAreaForRing>
      </a-collapse-panel>
      <a-collapse-panel key="tableList" header="列" v-if="chartType === '3'">
        <drag-area type="tableList" ref="table"></drag-area>
      </a-collapse-panel>

      <!-- 地图填充 -->
      <a-collapse-panel
        key="mapFill"
        header="填充"
        v-if="currSelected.setting.chartType === 'v-map'"
      >
        <a-collapse v-model="activeKey" :bordered="false">
          <a-radio-group class="radio-box" v-model="fillType">
            <a-radio
              value="area"
              @click.native.stop="onRadioChange('area', 'fillType')"
              >地区</a-radio
            >
            <a-radio
              value="dot"
              @click.native.stop="onRadioChange('dot', 'fillType')"
              >经纬度</a-radio
            >
          </a-radio-group>
          <a-collapse-panel key="dimensions" header="维度">
            <dragAreaForMapFill
              v-if="fillType === 'area'"
              type="dimensions"
              :fillType="fillType"
            ></dragAreaForMapFill>
            <dragAreaForMapFill
              v-if="fillType === 'dot'"
              type="dimensions"
              :fillType="fillType"
              dimensionType="latitude"
            ></dragAreaForMapFill>
            <dragAreaForMapFill
              v-if="fillType === 'dot'"
              type="dimensions"
              :fillType="fillType"
              dimensionType="longitude"
            ></dragAreaForMapFill>
          </a-collapse-panel>
          <a-collapse-panel key="measures" header="度量">
            <dragAreaForMapFill
              type="measures"
              :fillType="fillType"
            ></dragAreaForMapFill>
          </a-collapse-panel>
          <!-- 开关移到样式，不需要拖数据，暂时保留 -->
          <!-- <GuiField label="指标显示">
            <a-switch
              v-model="fillShow"
              default-checked
              size="small"
              @change="fillPointChange"
          /></GuiField>
          <dragAreaForMapFill
            type="label"
            :fillType="fillType"
            showType="point"
          ></dragAreaForMapFill>

          <GuiField label="鼠标移入显示">
            <a-switch
              v-model="fillOverShow"
              default-checked
              size="small"
              @change="fillOverChange"
          /></GuiField>
          <dragAreaForMapFill
            type="label"
            :fillType="fillType"
            showType="over"
          ></dragAreaForMapFill> -->
        </a-collapse>
      </a-collapse-panel>
      <!-- 地图标记点 -->
      <a-collapse-panel
        key="mapLabel"
        header="标记点"
        v-if="currSelected.setting.chartType === 'v-map'"
      >
        <a-collapse v-model="activeKey" :bordered="false">
          <a-radio-group class="radio-box" v-model="labelType">
            <a-radio
              value="area"
              @click.native.stop="onRadioChange('area', 'labelType')"
              >地区</a-radio
            >
            <a-radio
              value="dot"
              @click.native.stop="onRadioChange('dot', 'labelType')"
              >经纬度</a-radio
            >
          </a-radio-group>
          <a-collapse-panel key="dimensions" header="维度">
            <dragAreaForMapLabel
              v-if="labelType === 'area'"
              type="dimensions"
              :labelType="labelType"
            ></dragAreaForMapLabel>
            <dragAreaForMapLabel
              v-if="labelType === 'dot'"
              type="dimensions"
              :labelType="labelType"
              dimensionType="labelLatitude"
            ></dragAreaForMapLabel>
            <dragAreaForMapLabel
              v-if="labelType === 'dot'"
              type="dimensions"
              :labelType="labelType"
              dimensionType="labelLongitude"
            ></dragAreaForMapLabel>
          </a-collapse-panel>
          <a-collapse-panel key="measures" header="度量">
            <dragAreaForMapLabel
              type="measures"
              :labelType="labelType"
            ></dragAreaForMapLabel>
          </a-collapse-panel>
        </a-collapse>
        <!-- 开关移到样式，不需要拖数据，暂时保留 -->
        <!-- <GuiField label="指标显示">
          <a-switch
            v-model="labelShow"
            default-checked
            size="small"
            @change="labelPointChange"
          />
        </GuiField>
        <GuiField label="鼠标移入显示">
          <a-switch
            v-model="labelOverShow"
            default-checked
            size="small"
            @change="labelOverChange"
          />
        </GuiField> -->
      </a-collapse-panel>
      <!-- 数据筛选 -->
      <a-collapse-panel
        key="pick"
        header="数据筛选"
        v-if="
          (chartType === '1' || chartType === '2' || chartType === '3') &&
            currSelected.setting.chartType !== 'v-map'
        "
      >
        <DragPick type="pick"></DragPick>
      </a-collapse-panel>
      <!-- 排序 -->
      <a-collapse-panel
        key="sort"
        header="排序"
        v-if="
          (chartType === '1' || chartType === '3') &&
            currSelected.setting.chartType !== 'v-map' &&
            currSelected.setting.chartType !== 'v-treemap' &&
            currSelected.setting.chartType !== 'v-heatmap' &&
            currSelected.setting.chartType !== 'v-scatter'
        "
      >
        <DragSort type="sort"></DragSort>
      </a-collapse-panel>
      <a-collapse-panel key="refresh" header="定时刷新">
        <a-switch
          slot="extra"
          v-if="activeKey.includes('refresh')"
          v-model="refresh.isRefresh"
          default-checked
          @change="refreshChange"
          size="small"
        />
        <div style="display: flex;">
          <a-input-number
            v-model="refresh.frequency"
            :min="1"
            @change="frequencyChange"
            class="f-flex1"
            style="margin-right:10px"
          />
          <a-select
            v-model="refresh.unit"
            placeholder="请选择"
            @change="unitChange"
            class="f-flex1"
          >
            <a-select-option
              v-for="(item, index) in refreshList"
              :key="index"
              :value="item.value"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import DragArea from './components/dragArea'
import dragAreaForMapFill from './components/dragAreaForMapFill'
import dragAreaForMapLabel from './components/dragAreaForMapLabel'
import dragAreaForRing from './components/dragAreaForRing'
import DragPick from './components/dragPick'
import DragSort from './components/dragSort'
import { deepClone } from '../../../utils/deepClone'
// import GuiField from '../options/gui-field'
export default {
  components: {
    DragArea,
    DragPick,
    dragAreaForMapFill,
    dragAreaForMapLabel,
    dragAreaForRing,
    DragSort
    // GuiField
  },
  data() {
    return {
      activeKey: [
        'dimensions',
        'measures',
        'filter',
        'sort',
        'tips',
        'tableList',
        'refresh',
        'pick',
        'mapFill',
        'mapLabel'
      ], // 所有面板默认打开
      apiData: {},
      refresh: {
        isRefresh: false, // 是否启用定时刷新
        frequency: 1, // 刷新频率
        unit: undefined // 刷新单位 分 小时 天
      },
      refreshList: [
        { name: '分', value: 'min' },
        { name: '小时', value: 'hour' }
      ],
      fillType: '',
      labelType: '',
      selfConfig: {},
      mapLayout: null, // 填充图层
      scatterLayout: null, // 散点图层
      fillShow: false, // 填充指标显示
      fillOverShow: false, // 填充悬浮提示
      labelShow: false, // 标记点指标显示
      labelOverShow: false // 标记点悬浮提示
    }
  },
  watch: {
    currSelected: {
      handler(val) {
        if (val.setting.api_data) {
          let apiData = deepClone(val.setting.api_data)
          this.apiData = apiData
          this.selfConfig = deepClone(val.setting.config)
          if (val.setting.chartType === 'v-map') {
            // 获取散点图层所在下标
            this.fillType = this.currSelected.setting.api_data.options.fillType
            this.labelType = this.currSelected.setting.api_data.options.labelType
            // 移到样式配置，不知道还有没用，先保留
            // this.mapLayout = this.selfConfig.series.find(
            //   item => item.type === 'map'
            // )
            // if (this.mapLayout) {
            //   this.fillShow = this.mapLayout.label.normal.show
            //   this.fillOverShow = this.mapLayout.tooltip.show
            // }
            // this.scatterLayout = this.selfConfig.series.find(
            //   item => item.type === 'scatter'
            // )
            // if (this.scatterLayout) {
            //   this.labelShow = this.scatterLayout.label.show
            //   this.labelOverShow = this.scatterLayout.tooltip.show
            // }
          }
          // 回显定时信息
          if (apiData.refresh) {
            this.refresh = {
              ...apiData.refresh
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['currSelected', 'currentSelected']),
    chartType() {
      return this.currSelected ? this.currSelected.setting.type : ''
    },
    hasScatter() {
      return this.selfConfig.series
        ? this.selfConfig.series.some(item => item.type === 'scatter')
        : false
    }
  },
  methods: {
    ...mapActions(['handleRefreshData', 'updateChartData']),
    // 修改地图类型
    onRadioChange(value, key) {
      if (this[key] === value) {
        return
      }
      // 类型对应关系
      const clearMap = {
        fillType: {
          seriesType: 'scatter',
          clearData: {
            normal: [],
            latitude: [],
            longitude: [],
            dimensions: [],
            measures: [],
            point: [],
            over: []
          }
        },
        labelType: {
          seriesType: 'map',
          clearData: {
            labelNormal: [],
            labelLatitude: [],
            labelLongitude: [],
            labelDimensions: [],
            labelMeasures: []
          }
        }
      }
      // 切换页签清空对应数据
      // 清空填充/标记点数据
      Object.assign(this.currSelected.setting.api_data, clearMap[key].clearData)
      // 清空图表数据
      let config = this.currSelected.setting.config
      this.$set(
        config,
        'series',
        config.series.filter(item => item.type === clearMap[key].seriesType)
      )
      // 填充数据清除要去掉视觉映射
      if (key === 'fillType') {
        this.$delete(this.currSelected.setting.config, 'visualMap')
      }
      // 数据全空清除模型id
      let apidata = this.currSelected.setting.api_data
      if (
        !apidata.dimensions.length &&
        !apidata.measures.length &&
        !apidata.labelDimensions.length &&
        !apidata.labelMeasures.length
      ) {
        this.currSelected.datamodelId = 0
        this.currSelected.isEmpty = false
      }
      this[key] = value
      this.$set(this.currSelected.setting.api_data.options, key, value)
      this.updateChartData()
    },
    // 定时刷新开关
    refreshChange(checked, event) {
      // 阻止默认事件，取消收起
      event.stopPropagation()
      this.refresh.isRefresh = checked
      this.apiData.refresh = this.refresh
      this.$store.dispatch('SetSelfDataSource', this.apiData)
      this.updateChartData()
      this.setTimer()
    },
    // 刷新频率设置
    frequencyChange(val) {
      if (this.refresh.isRefresh) {
        if (this.refresh.unit === 'min' && this.refresh.frequency > 1440) {
          this.$message.error('时间设置不超过1天, 请重新设置')
          this.reset()
        }
        if (this.refresh.unit === 'hour' && this.refresh.frequency > 24) {
          this.$message.error('时间设置不超过24天, 请重新设置')
          this.reset()
        }
      }
      this.apiData.refresh = this.refresh
      this.$store.dispatch('SetSelfDataSource', this.apiData)
      this.updateChartData()
      this.setTimer()
    },
    // 刷新单位设置
    unitChange(val) {
      if (this.refresh.isRefresh) {
        if (this.refresh.frequency > 1440 && this.refresh.unit === 'min') {
          this.$message.error('时间设置不超过1天, 请重新设置')
          this.reset()
        }
        if (this.refresh.frequency > 24 && this.refresh.unit === 'hour') {
          this.$message.error('时间设置不超过1天, 请重新设置')
          this.reset()
        }
      }
      this.apiData.refresh = this.refresh
      this.$store.dispatch('SetSelfDataSource', this.apiData)
      this.updateChartData()
      this.setTimer()
    },
    reset() {
      this.refresh.frequency = 1
      this.refresh.unit = undefined
    },
    // 单个图表的定时器设置
    setTimer() {
      this.$emit('setChartTimer', this.currentSelected)
    },
    fillPointChange(val) {
      if (this.mapLayout) {
        this.mapLayout.label.normal.show = val
      }
      this.switchChange()
    },
    fillOverChange(val) {
      if (this.mapLayout) {
        this.mapLayout.tooltip.show = val
      }
      this.switchChange()
    },
    labelPointChange(val) {
      if (this.scatterLayout) {
        this.scatterLayout.label.show = val
      }
      this.switchChange()
    },
    labelOverChange(val) {
      if (this.scatterLayout) {
        this.scatterLayout.tooltip.show = val
      }
      this.switchChange()
    },
    switchChange() {
      this.$store.dispatch('SetSelfProperty', this.selfConfig)
      this.updateChartData()
    }
  }
}
</script>

<style></style>
