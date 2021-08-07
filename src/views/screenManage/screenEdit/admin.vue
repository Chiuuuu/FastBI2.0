<template>
  <div class="dv-admin" @click.stop.prevent="hideContextMenu()">
    <board :screenData="screenData">
      <!--头部嵌套可拖拽物品-->
      <template v-slot:headerBox>
        <drag-list :drag-list="navigate"></drag-list>
      </template>
      <!-- 左边侧栏 -->
      <template v-slot:coverage>
        <div
          class="list-item"
          :key="transform.id"
          v-for="transform in coverageMaps"
          :class="[
            { hovered: hoverItem === transform.id },
            { selected: currentSelected === transform.id }
          ]"
          :selected="currentSelected === transform.id"
          @click.stop.prevent="handleSelected(transform)"
          @mouseenter="handleHover(transform)"
          @mouseleave="handleNoHover(transform)"
        >
          <div class="item" v-if="coverageExpand">
            <img
              style="width:18px;heigth:18px;"
              :src="require(`@/assets/images/chart/${transform.setting.icon}`)"
            />
            <!-- 环形图title -->
            <template v-if="transform.setting.chartType === 'v-ring'">
              <template v-if="transform.setting.config.topTitle.content">
                <a-tooltip
                  v-if="transform.setting.config.topTitle.content.length > 7"
                >
                  <template slot="title">{{
                    transform.setting.config.topTitle.content
                  }}</template>
                  {{
                    transform.setting.config.topTitle.content.substring(0, 7) + '...'
                  }}
                </a-tooltip>
                <span v-else> {{ transform.setting.config.topTitle.content }}</span>
              </template>
              <span v-else> {{ transform.setting.title }}</span>
            </template>
            <template v-else-if="transform.setting.config && transform.setting.config.title">
              <!-- 某些图表是用content.title -->
              <template v-if="transform.setting.config.title.content">
                <a-tooltip
                  v-if="transform.setting.config.title.content.length > 7"
                >
                  <template slot="title">{{
                    transform.setting.config.title.content
                  }}</template>
                  {{
                    transform.setting.config.title.content.substring(0, 7) + '...'
                  }}
                </a-tooltip>
                <span v-else>{{ transform.setting.config.title.content }}</span>
              </template>
              <!-- 某些图表是用content.text -->
              <template v-else-if="transform.setting.config.title.text">
                <a-tooltip
                  v-if="transform.setting.config.title.text.length > 7"
                >
                  <template slot="title">{{
                    transform.setting.config.title.text
                  }}</template>
                  {{
                    transform.setting.config.title.text.substring(0, 7) + '...'
                  }}
                </a-tooltip>
                <span v-else>{{ transform.setting.config.title.text }}</span>
              </template>
              <span v-else> {{ transform.setting.title }}</span>
            </template>
            <!-- 都没有就显示默认title -->
            <span v-else> {{ transform.setting.title }}</span>
          </div>
          <div v-else flex="main:center" style="padding:5px 0">
            <!-- <a-icon
              v-if="transform.setting.icon"
              :type="transform.setting.icon"
            />
            <icon-font
              v-if="transform.setting.iconFont"
              :type="transform.setting.iconFont"
            /> -->
            <img
              style="width:18px;heigth:18px;"
              :src="require(`@/assets/images/chart/${transform.setting.icon}`)"
            />
          </div>
        </div>
      </template>
      <template v-slot:canvas v-if="canvasMap.length > 0">
        <!--动态组件-->
        <template v-for="transform in canvasMap">
          <drag-item
            ref="dratitem"
            :key="transform.id"
            :item="transform"
            :com-hover="hoverItem === transform.id"
            :selected="currentSelected === transform.id"
            @click.native.stop.prevent="handleSelected(transform)"
            @contextmenu.native.stop.prevent="
              handleRightClickOnCanvas(transform, $event)
            "
            @mouseenter.native="handleHover(transform)"
            @mouseleave.native="handleNoHover(transform)"
          >
            <!--数据模型不存在-->
            <chart-nodata
              v-if="transform.setting.isEmpty"
              :isEmpty="transform.setting.isEmpty"
              :config="transform.setting.config"
            ></chart-nodata>
            <!-- 图形 -->
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
              ref="veText"
              :chart-id="transform.id"
              canEdit
              :api-data="transform.setting.api_data"
              :config="transform.setting.config"
              :background="transform.setting.background"
            ></chart-text>

            <!-- 图片 -->
            <chart-image
              v-else-if="transform.setting.name === 've-image'"
              :config="transform.setting.config"
              :background="transform.setting.background"
            ></chart-image>

            <!-- 表格 -->
            <chart-tables
              v-else-if="transform.setting.name === 've-tables'"
              :config="transform.setting.config"
              :api-data="transform.setting.api_data"
              :background="transform.setting.background"
              :chartSize="transform.setting.view"
            ></chart-tables>

            <!-- 高德地图-->
            <!-- <AMap v-else-if="transform.setting.name === 'a-map'" /> -->

            <!-- <chart-map
              v-else-if="transform.setting.name === 've-map'"
              :config="transform.setting.config"
              :background="transform.setting.background"></chart-map> -->
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
                transform.setting.name === 've-heatmap' ||
                  transform.setting.name === 've-sun'
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
              ref="vChart"
              :chart-id="transform.id"
              :key="transform.id"
              :chart-type="transform.setting.chartType"
              :type-name="transform.setting.name"
              :type="transform.setting.type"
              :config="transform.setting.config"
              :api-data="transform.setting.api_data"
              :apis="transform.setting.apis"
              :background="transform.setting.background"
            ></charts-factory>
          </drag-item>
        </template>
      </template>
    </board>

    <screen :key="isScreen" isShootDom></screen>
    <b-modal
      v-model="deleteDialog"
      :styles="{ top: '300px', width: '350px' }"
      class-name="delete-dialog"
      @on-ok="deleteOne"
    >
      <div class="delete-dialog-inner">
        <div>
          <b-icon name="ios-warning" size="40"></b-icon>
        </div>
        <p>是否删除选中的1个组件</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Board from '@/components/board/index' // 右键下拉菜单
import navigateList from '@/config/navigate' // 导航条菜单
import DragList from '@/components/drag/DragList' // 导航条拖动模块
import DragItem from '@/components/drag/DragItem' // 板块设置（长宽高比例悬停）
import { mapGetters, mapActions } from 'vuex' // 导入vuex
import { on, off } from 'bin-ui/src/utils/dom' //
import { getCanvasMaps } from '@/api/canvasMaps/canvas-maps-request' // 图层的方法
import { getPageSettings, resetPageSettings } from '@/api/app/app-request' // axious请求，拦截器
import ChartsFactory from '@/components/charts/charts-factory'
import ChartText from '@/components/tools/Text' // 文本模块
import ChartImage from '@/components/tools/Image' // 图片模块
import ChartTables from '@/components/tools/Tables' // 表格模块
import ChartNodata from '@/components/tools/Nodata' // 数据丢失
import ChartMaterial from '@/components/tools/Material' // 素材库
import ChartFigure from '@/components/tools/Figure' // 素材库
import ChartHeart from '@/components/charts/chart-heat.vue' // 旭日图/矩形热力图
import HighCharts from '@/components/charts/highcharts.vue' // 3d图表
import SteepBar from '@/components/tools/SteepBar' // 进度条
// import AMap from '@/components/tools/aMap' // 进度条
import Screen from '@/views/screen' // 全屏

import { Icon } from 'ant-design-vue'
import { deepClone } from '@/utils/deepClone'

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2276651_71nv5th6v94.js'
}) // 引入iconfont

export default {
  name: 'Admin',
  data() {
    return {
      navigate: navigateList,
      hoverItem: null,
      deleteDialog: false,

      text_content: '文本内容',
      canEdit: true,
      screenData: null
    }
  },
  provide() {
    // 刷新的时候重置图表联动的选中样式
    return { resetChartStyle: this.resetChartStyle }
  },
  computed: {
    ...mapGetters([
      'canvasMap',
      'currentSelected',
      'currSelected',
      'isScreen',
      'coverageExpand',
      'pageSettings',
      'orginPageSettings',
      'pageList'
    ]),
    coverageMaps() {
      if (this.canvasMap.length > 0) {
        let maps = [...this.canvasMap]
        return maps.reverse()
      } else {
        return []
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    // 切换页签重新跳转的时候请求tab页的数据
    next()
    this.getScreenData()
  },
  created() {
    // 拉取页面配置信息
    // getPageSettings().then(res => {
    //   this.$store.dispatch('SetPageSettings', res.data)
    // })
    // 拉取页面canvasMaps
    // 先清空数据
    this.$store.dispatch('InitCanvasMaps', [])
    if (this.$route.query.id) {
      this.$store.dispatch('SetScreenId', this.$route.query.id)
      this.$store.commit('common/SET_MENUSELECTID', this.$route.query.id)
      this.getScreenTabs().then(res => {
        this.getScreenData()
      })
    }
    // 获取素材库
    this.getMaterial()
  },
  mounted() {
    on(document, 'keyup', this.handleKeyup)
    this.$EventBus.$on('context/menu/delete', this.deleteDialogShow)

    window.onresize = () => {
      // 全屏下监控是否按键了ESC
      if (!this.checkFull()) {
        // 全屏下按键esc后要执行的动作
        this.$store.dispatch('SetIsScreen', false)
        this.$store.dispatch('ToggleContextMenu')
      }
    }
  },
  methods: {
    ...mapActions(['deleteChartData', 'getScreenDetail']),
    // 获取素材库
    async getMaterial() {
      let res = await this.$server.screenManage.getMaterialGroupList()
      const base = this.navigate.find(item => item.type === 'Base')
      base.tabs = res.data
    },
    // 重置图表样式(图表联动)
    resetChartStyle() {
      if (this.$refs.vChart) {
        this.$refs.vChart.forEach(vchart => {
          vchart.resetChartStyle()
        })
      }
    },
    // 获取大屏页签
    async getScreenTabs() {
      this.$server.screenManage
        .getScreenTabs(this.$route.query.id)
        .then(res => {
          if (res.code === 200) {
            let pages = res.rows.map(item =>
              Object.assign(item, { showDropDown: false, isFocus: false })
            )
            this.$store.dispatch('SetPageList', pages)
            this.$store.dispatch('SetPageId', this.$route.query.tabId || pages[0].id)
            // 默认显示大屏第一个页签的数据
            // 新建的大屏取第一个默认页的tabId
            if (!this.$route.query.tabId) {
              this.$router.replace({
                name: 'screenEdit',
                query: {
                  id: this.$route.query.id,
                  tabId: this.pageList[0].id
                }
              })
              return
            }
            return true
          } else {
            res.msg && this.$message.error(res.msg)
          }
        })
    },
    // 获取大屏数据
    getScreenData() {
      if (this.$route.query.tabId) {
        this.getScreenDetail({
          id: this.$route.query.id,
          tabId: this.$route.query.tabId
        })
      }
    },
    // 悬停事件
    handleHover(item) {
      this.hoverItem = item.id
    },
    handleNoHover(item) {
      this.hoverItem = null
    },
    // transform点击事件
    handleSelected(item) {
      this.$store.dispatch('SingleSelected', item.id)
      this.$store.dispatch('ToggleContextMenu')
    },
    // transform点击事件右键点击
    handleRightClickOnCanvas(item, event) {
      this.$store.dispatch('SingleSelected', item.id)
      let info = {
        x: event.pageX + 10,
        y: event.pageY + 10,
        listType: 'chartMenuList'
      }
      this.$store.dispatch('ToggleContextMenu', info)
    },
    // 外层区域关闭右键菜单
    hideContextMenu() {
      this.$store.dispatch('ToggleContextMenu')
    },
    // del键删除选择的控件
    handleKeyup(event) {
      let e = event || window.event
      let k = e.keyCode || e.which
      if (k === 46) {
        if (this.currentSelected) {
          this.deleteOne()
          // this.deleteDialogShow()
        }
      }
    },
    deleteDialogShow() {
      this.deleteDialog = true
    },
    deleteOne() {
      this.deleteChartData()
    },
    /**
     * 是否全屏并按键ESC键的方法
     */
    checkFull() {
      // document.fullscreenEnabled 谷歌浏览器一直返回true
      // let isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled
      let isFull =
        window.fullScreen ||
        document.webkitIsFullScreen ||
        document.msFullscreenEnabled
      if (isFull === undefined) {
        isFull = false
      }
      return isFull
    }
  },
  components: {
    ChartsFactory,
    DragItem,
    DragList,
    Board,
    ChartText,
    ChartImage,
    ChartTables,
    ChartNodata,
    ChartMaterial,
    ChartFigure,
    SteepBar,
    Screen,
    HighCharts,
    ChartHeart
    // AMap
  },
  beforeDestroy() {
    off(document, 'keyup', this.handleKeyup)
    this.$EventBus.$off('context/menu/delete', this.deleteDialogShow)
  },
  // 跳转编辑的时候如果token失效回到登录页，再次进来就重定向回目录页
  beforeRouteEnter(to, from, next) {
    if (from.name === 'login' && to.name === 'screenEdit') {
      next('/screenManage/catalog')
    } else {
      next()
    }
  }
}
</script>
