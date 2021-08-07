<template>
  <div
    class="dv-screen"
    ref="dvScreen"
    :style="dvScreenStyle"
    @contextmenu.stop.prevent="poupExportMenu($event)"
  >
    <b-scrollbar :style="wrapStyle">
      <div :style="scrollBoxStyle">
        <div
          class="canvas-panel"
          :style="canvasPanelStyle"
          @click.stop.prevent="toggleContextMenu"
        >
          <template v-for="transform in canvasMap">
            <preview-box
              :id="transform.id"
              :key="transform.id"
              :item="transform"
              @contextmenu.native.stop.prevent="
                handleRightClickOnCanvas(transform, $event)
              "
            >
              <!--数据模型不存在-->
              <chart-nodata
                v-if="transform.setting.isEmpty"
                :isEmpty="transform.setting.isEmpty"
                :config="transform.setting.config"
              ></chart-nodata>
              <ChartFigure
                v-else-if="transform.setting.name === 'figure'"
                :setting="transform.setting"
              />
              <!--素材库-->
              <ChartMaterial
                v-else-if="transform.setting.name === 'material'"
                :url="transform.setting.url"
              ></ChartMaterial>
              <!--进度条-->
              <SteepBar
                v-else-if="transform.setting.name === 'steepBar'"
                :config="transform.setting.config"
                :background="transform.setting.background"
                :api-data="transform.setting.api_data"
              ></SteepBar>
              <!-- 文本 -->
              <chart-text
                v-else-if="transform.setting.name === 've-text'"
                :chart-id="transform.id"
                :config="transform.setting.config"
                :background="transform.setting.background"
                :api-data="transform.setting.api_data"
              ></chart-text>

              <!-- 图片 -->
              <chart-image
                v-else-if="transform.setting.name === 've-image'"
                :config="transform.setting.config"
                :background="transform.setting.background"
              ></chart-image>

              <!-- 表格 -->
              <chart-tables
                ref="tables"
                v-else-if="transform.setting.name === 've-tables'"
                :config="transform.setting.config"
                :api-data="transform.setting.api_data"
                :background="transform.setting.background"
                :chartSize="transform.setting.view"
              ></chart-tables>

              <!-- 高德地图-->
              <!-- <AMap v-else-if="transform.setting.name === 'a-map'" /> -->
              <!-- 立体饼图 -->
              <high-charts
                v-else-if="transform.setting.name === 'high-pie'"
                :key="transform.id"
                :chart-id="transform.id"
                :setting="transform.setting"
                :config="transform.setting.config"
                :api-data="transform.setting.api_data"
              ></high-charts>

              <!-- 矩形热力图 -->
              <chart-heart
                v-else-if="
                  (transform.setting.name === 've-heatmap') |
                    (transform.setting.name === 've-sun')
                "
                :chart-id="transform.id"
                :key="transform.id"
                :chart-type="transform.setting.chartType"
                :view="transform.setting.view"
                :config="transform.setting.config"
                :api-data="transform.setting.api_data"
                :background="transform.setting.background"
              ></chart-heart>

              <charts-factory
                v-else
                :chart-id="transform.id"
                ref="chart"
                :type-name="transform.setting.name"
                :chart-type="transform.setting.chartType"
                :type="transform.setting.type"
                :config="transform.setting.config"
                :api-data="transform.setting.api_data"
                :apis="transform.setting.apis"
                :background="transform.setting.background"
              ></charts-factory>
            </preview-box>
          </template>
          <pation
            v-if="isScreen"
            :style="{ opacity: showPageTab ? 1 : 0 }"
            @mouseenter.native="handleTabShow"
            @mouseleave.native="handleTabShow"
          ></pation>
        </div>
      </div>
    </b-scrollbar>
    <context-menu></context-menu>
    <!-- 右键菜单 -- 查看数据 -->
    <chartTableData
      :show="show"
      :chart-data="chartData"
      @cancel="show = false"
    ></chartTableData>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getPageSettings } from '../api/app/app-request'
import { getCanvasMaps } from '../api/canvasMaps/canvas-maps-request'
import ChartsFactory from '../components/charts/charts-factory'
import PreviewBox from '../components/preview/preview-box'
import ChartText from '@/components/tools/Text'
import ChartImage from '@/components/tools/Image'
import ChartTables from '@/components/tools/Tables'
import ChartNodata from '@/components/tools/Nodata'
import ChartMaterial from '@/components/tools/Material'
import ChartFigure from '@/components/tools/Figure'
import ChartHeart from '@/components/charts/chart-heat'
import HighCharts from '@/components/charts/highcharts'
import SteepBar from '@/components/tools/SteepBar'
import Pation from '@/components/board/pation/index' // 分页栏
import ContextMenu from '@/components/board/context-menu/index' // 右键菜单
// import AMap from '@/components/tools/aMap' // 进度条
import chartTableData from '@/components/board/chartTableData/index' // 右键菜单
import { Loading } from 'element-ui'
import TreeGroupBy from '@/components/board/options/treemap/tree-groupby'

import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'

import throttle from 'lodash/throttle'
import { deepClone } from '../utils/deepClone'

export default {
  name: 'screen',
  props: {
    // 截图模板
    isShootDom: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    ChartsFactory,
    PreviewBox,
    ChartText,
    ChartImage,
    ChartTables,
    ChartNodata,
    ChartMaterial,
    ChartFigure,
    SteepBar,
    Pation,
    HighCharts,
    ChartHeart,
    ContextMenu,
    chartTableData
    // AMap
  },
  data() {
    return {
      wrapStyle: {},
      range: '',
      chartTimer: null,
      timer: null,
      showPageTab: false, // 页签显示/隐藏
      show: false, // 图表数据查看
      chartData: {} // 图表数据
    }
  },
  provide() {
    return {
      showChartData: this.showChartData,
      dvScreenDom: this.getDvScreen
    }
  },
  computed: {
    ...mapGetters([
      'canvasMap',
      'pageSettings',
      'screenId',
      'orginPageSettings',
      'isPublish',
      'isScreen',
      'currentSelected'
    ]),
    // 画布面板的样式
    canvasPanelStyle() {
      return {
        width: `${this.pageSettings.width}px`,
        height: `${this.pageSettings.height}px`,
        transform: `scale(${this.range}) translate3d(-50%, -50%, 0)`,
        transformOrigin: '0 0',
        background:
          this.pageSettings.backgroundType === '1'
            ? this.pageSettings.backgroundColor
            : `url(${
                this.pageSettings.backgroundSrc
              }) 0% 0% / 100% 100% no-repeat`
      }
    },
    dvScreenStyle() {
      return this.isShootDom
        ? { width: `${this.pageSettings.width}px`, height: 'auto' }
        : null
    },
    scrollBoxStyle() {
      return {
        width: `${this.pageSettings.width * this.range}px`,
        height: `${this.pageSettings.height * this.range}px`,
        overFlow: 'hidden'
      }
    }
  },
  watch: {
    screenId: {
      handler(val) {
        if (val) {
          if (this.$route.name === 'catalog' && !this.isShootDom) {
            this.getScreenData()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(this._calcStyle)
    addResizeListener(this.$refs.dvScreen, this._calcStyle)
  },
  beforeDestroy() {
    removeResizeListener(this.$refs.dvScreen, this._calcStyle)
    clearInterval(this.timer)
    this.timer = null
    clearInterval(this.chartTimer)
    this.chartTimer = null
  },
  methods: {
    ...mapActions(['getScreenDetail', 'refreshScreen']),
    toggleContextMenu() {
      if (this.$store.getters.contextMenuInfo.isShow) {
        this.$store.dispatch('ToggleContextMenu')
        this.$store.dispatch('SingleSelected', null)
      }
    },
    getDvScreen() {
      return this.$refs.dvScreen
    },
    changeTab(pageId) {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage')
      })
      // 切换页签数据
      this.getScreenDetail({
        id: this.screenId,
        tabId: pageId,
        needRefresh: true
      }).then(res => {
        loadingInstance.close()
        if (res) {
          this.setTimer()
        }
      })
    },
    getTableSize(transform) {
      return {
        x: transform.setting.view.width,
        y: transform.setting.view.height
      }
    },
    // 获取大屏数据
    getScreenData() {
      // 获取页面配置之前先重置
      this.$store.dispatch('SetPageSettings', this.orginPageSettings)
      this.$store.dispatch('InitCanvasMaps', [])
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage')
      })
      // 先获取大屏对应的页签信息
      this.$server.screenManage.getScreenTabs(this.screenId).then(res => {
        if (res.code === 200) {
          let pages = res.rows.map(item =>
            Object.assign(item, { showDropDown: false, isFocus: false })
          )
          this.$store.dispatch('SetPageList', pages)
          this.$store.dispatch('SetPageId', pages[0].id)
          if (!this.screenId || !pages[0].id) {
            loadingInstance.close()
            return
          }
          // 默认显示大屏第一个页签的数据
          this.getScreenDetail({
            id: this.screenId,
            tabId: pages[0].id,
            needRefresh: true
          }).then(res => {
            loadingInstance.close()
            if (res) {
              this.setTimer()
              if (this.isPublish === 1) {
                this.getShareData()
              }
            }
          })
        } else {
          res.msg && this.$message.error(res.msg)
          loadingInstance.close()
        }
      })
    },
    // 设置定时器
    setTimer() {
      // 编辑页面的screen不刷新（用来提前渲染导出大屏图片）
      if (this.$route.name === 'screenEdit') {
        return
      }
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.chartTimer) {
        clearInterval(this.chartTimer)
        this.chartTimer = null
      }
      if (
        this.pageSettings.refresh.isRefresh &&
        this.pageSettings.refresh.unit &&
        this.pageSettings.refresh.frequency > 0
      ) {
        let count = 0
        if (this.pageSettings.refresh.unit === 'min') {
          count = this.pageSettings.refresh.frequency * 60 * 1000
        } else if (this.pageSettings.refresh.unit === 'hour') {
          count = this.pageSettings.refresh.frequency * 60 * 60 * 1000
        }
        this.timer = setInterval(() => {
          this.refreshData()
        }, count)
      }
      for (let item of this.canvasMap) {
        let refresh = item.setting.api_data.refresh
        if (!refresh) {
          continue
        }
        if (refresh.isRefresh && refresh.unit && refresh.frequency > 0) {
          let count = 0
          if (refresh.unit === 'min') {
            count = refresh.frequency * 60 * 1000
          } else if (refresh.unit === 'hour') {
            count = refresh.frequency * 60 * 60 * 1000
          }
          let self = this
          this.chartTimer = (function() {
            setInterval(() => {
              self.refreshData()
            }, count)
          })(item)
        }
      }
    },
    // 获取分享信息
    getShareData() {
      if (!this.screenId) {
        return false
      }
      return this.$server.screenManage
        .showScreenRelease(this.screenId)
        .then(res => {
          if (res.code === 200) {
            this.$emit('getShareData', res.data)
            // this.releaseObj = res.data
            return true
          } else {
            this.$message.error(res.msg)
            return false
          }
        })
    },
    _calcStyle() {
      // 编辑大屏里的screen只用来做导出,需要完整尺寸展示
      if (this.isShootDom) {
        this.range = 1
        this.wrapStyle = this.scrollBoxStyle
        return
      }

      const wrap = this.$refs.dvScreen
      if (!wrap) return
      // 计算wrap样式
      this.wrapStyle = {
        width: wrap.clientWidth + 'px',
        height: wrap.clientHeight + 'px'
      }
      // 计算缩放比例(当前元素占位跟画板默认长度的比例,也就是大小画板的比例)
      let range = wrap.clientWidth / this.orginPageSettings.width
      range = Math.round(range * 100) / 100
      if (range < 0.4) {
        range = 0.4
      }
      this.range = range
    },
    // 刷新大屏
    refreshData: throttle(
      function() {
        this.refreshScreen({
          charSeted: false,
          needLoading: true
        })
      },
      1000,
      {
        leading: true,
        trailing: false
      }
    ),
    // 显示/隐藏页签栏
    handleTabShow() {
      this.showPageTab = !this.showPageTab
    },
    // 获取联动数据筛选数据,不需要保存
    async getBindData(chart, dimensionData) {
      let apiData = chart.setting.api_data // 进行过数据筛选的不再执行联动
      if (apiData.options.fileList) {
        return
      }
      let { pivotschemaId, dataType, value, name } = dimensionData
      let dimensionsLimit = [{ pivotschemaId, type: 1, dataType, value, name }]
      apiData.dataLink = { ...apiData.options, dimensionsLimit }

      let res = await this.$server.screenManage.getDataLink(chart)
      if (res.code === 200) {
        let columns = []
        let rows = []
        let dimensionKeys = [] // 度量key
        for (let m of apiData.dimensions) {
          dimensionKeys.push(m.alias)
          columns.push(m.alias) // 默认columns第二项起为指标
        }

        let measureKeys = [] // 度量key
        for (let m of apiData.measures) {
          measureKeys.push(m.alias)
          columns.push(m.alias) // 默认columns第二项起为指标
        }
        res.rows.map((item, index) => {
          let obj = {}
          for (let item2 of dimensionKeys) {
            obj[item2] = item[item2]
          }
          obj[dimensionKeys] = item[dimensionKeys]
          for (let item2 of measureKeys) {
            obj[item2] = item[item2]
          }
          rows.push(obj)
        }) // 构造联动选择的数据
        this.$set(apiData, 'selectData', {
          columns,
          rows
        })
      } else {
        this.$message.error(res.msg)
      }
    },
    // 点击事件右键点击
    handleRightClickOnCanvas(item, event) {
      // 全屏下图表查看数据&导出
      if (this.isScreen) {
        let info = {
          x: event.pageX + 10,
          y: event.pageY + 10,
          listType: 'exportChartList'
        }
        this.$store.dispatch('ToggleContextMenu', info)
        this.$store.dispatch('SingleSelected', item.id)
      }
    },
    // 设置图表数据
    showChartData(chartData) {
      this.chartData = chartData
      this.show = true
    },
    cancelSelect() {
      this.$store.dispatch('SingleSelected', null)
      this.$store.dispatch('ToggleContextMenu')
    },
    poupExportMenu(event) {
      if (this.isScreen) {
        let info = {
          x: event.pageX + 10,
          y: event.pageY + 10,
          listType: 'screenMenuList'
        }
        this.$store.dispatch('ToggleContextMenu', info)
      }
    }
  }
}
</script>
