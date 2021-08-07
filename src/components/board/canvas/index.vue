<template>
  <div
    class="canvas-main"
    ref="canvasMain"
    @contextmenu.stop.prevent="hideContextMenu($event)"
  >
    <div
      class="canvas-panel-wrap"
      :style="wrapStyle"
      @click.stop.prevent="cancelSelected"
    >
      <b-scrollbar style="height:100%;">
        <div class="screen-shot" :style="screenStyle" ref="screenInner">
          <div
            class="canvas-panel"
            :id="screenId"
            :style="canvasPanelStyle"
            @click.stop.prevent="cancelSelected"
            @contextmenu.stop.prevent="showScreenContextMenu($event)"
            :data-spm-anchor-id="$route.params.id"
          >
            <drop-panel>
              <slot></slot>
            </drop-panel>
            <pation
              v-if="isScreen"
              :style="{ opacity: showPageTab ? 1 : 0 }"
              @mouseenter.native="handleTabShow"
              @mouseleave.native="handleTabShow"
            ></pation>
            <!--右键菜单-->
            <context-menu v-if="isScreen"></context-menu>
          </div>
        </div>
      </b-scrollbar>
    </div>
    <edit-slider v-model="range"></edit-slider>
    <pation canEdit></pation>
  </div>
</template>

<script>
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'
import EditSlider from './components/edit-slider'
import Pation from '../pation/index' // 分页栏
import DropPanel from '../../drop/drop-panel'
import { mapActions, mapGetters } from 'vuex'
import ContextMenu from '../context-menu/index' // 右键菜单

export default {
  name: 'CanvasMain',
  data() {
    return {
      wrapStyle: {},
      screenStyle: {},
      range: 0.65,
      fullScreenRange: 1, // 全屏缩放值
      showPageTab: false // 页签显示/隐藏
    }
  },
  mounted() {
    this.$nextTick(this._calcStyle)
    addResizeListener(this.$refs.canvasMain, this._calcStyle)
  },
  beforeDestroy() {
    removeResizeListener(this.$refs.canvasMain, this._calcStyle)
  },
  methods: {
    ...mapActions(['SetCanvasRange']),
    _calcStyle() {
      const wrap = this.$refs.canvasMain
      if (!wrap) return
      // 计算wrap样式
      this.wrapStyle = {
        width: wrap.clientWidth + 'px',
        height: wrap.clientHeight - 61 + 'px'
      }
      this.screenStyle = {
        width: `${this.pageSettings.width * this.range + 120}px`,
        height: `${Math.max(
          this.pageSettings.height * this.range + 120,
          wrap.clientHeight - 61
        )}px`
      }

      if (this.isScreen) {
        let range =
          this.$refs.screenInner.clientWidth / this.orginPageSettings.width
        range = Math.round(range * 100) / 100
        if (range < 0.4) {
          range = 0.4
        }
        this.fullScreenRange = range
      }
    },
    // 显示/隐藏页签栏
    handleTabShow() {
      this.showPageTab = !this.showPageTab
    },
    // transform点击事件
    cancelSelected() {
      if (this.contextMenuInfo.isShow) {
        this.$store.dispatch('ToggleContextMenu')
        return
      }
      this.$store.dispatch('SingleSelected', null)
    },
    // 外层区域关闭右键菜单
    hideContextMenu(event) {
      this.$store.dispatch('ToggleContextMenu')
    },
    showScreenContextMenu(event) {
      //   this.$store.dispatch('ToggleContextMenu')
      let info = {
        x: event.pageX + 10,
        y: event.pageY + 10,
        listType: 'screenMenuList'
      }
      this.$store.dispatch('SingleSelected', null)
      this.$store.dispatch('ToggleContextMenu', info)
    }
  },
  watch: {
    range(val) {
      const wrap = this.$refs.canvasMain
      this.screenStyle = {
        width: `${this.pageSettings.width * val + 120}px`,
        height: `${Math.max(
          this.pageSettings.height * val + 120,
          wrap.clientHeight - 61
        )}px`
      }
      this.SetCanvasRange(val)
    },
    // 页面尺寸变化，背景板自适应
    'pageSettings.width'(val) {
      if (val) {
        this._calcStyle()
      }
    },
    'pageSettings.height'(val) {
      if (val) {
        this._calcStyle()
      }
    }
    // pageSettings: {
    //   handler(val) {
    //     console.log(val)
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  computed: {
    ...mapGetters([
      'pageSettings',
      'canvasRange',
      'contextMenuInfo',
      'screenId',
      'isScreen',
      'orginPageSettings'
    ]),
    // 画布面板的样式
    canvasPanelStyle() {
      let range = this.isScreen ? this.fullScreenRange : this.canvasRange
      return {
        width: `${this.pageSettings.width}px`,
        height: `${this.pageSettings.height}px`,
        transform: `scale(${range}) translate3d(-50%, -50%, 0)`,
        background:
          this.pageSettings.backgroundType === '1'
            ? this.pageSettings.backgroundColor
            : `url(${
                this.pageSettings.backgroundSrc
              }) 0% 0% / 100% 100% no-repeat`

        // backgroundColor: this.pageSettings.backgroundColor
      }
    }
  },
  components: { DropPanel, EditSlider, Pation, ContextMenu }
}
</script>
