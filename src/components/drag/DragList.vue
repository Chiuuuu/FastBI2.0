<template>
  <div class="drag-list-menu">
    <div
      class="list-group"
      :class="{ hovered: category.hovered }"
      v-for="(category, i) in dragList"
      :key="category.type"
    >
      <div
        class="list-group-header"
        flex="dir:top"
        @mouseenter="initTabChildren(category, i)"
        @mouseleave="category.hovered = false"
      >
        <!-- <b-icon v-if="category.icon" :name="category.icon" size="18"></b-icon> -->
        <a-icon
          v-if="category.icon"
          :type="category.icon"
          style="font-size:18px;"
        />
        <span>{{ category.title }}</span>
      </div>
      <!--素材库下拉窗尺寸变大-->
      <div
        class="list-group-body"
        :style="category.type === 'Base' ? 'height:500px' : ''"
        flex
        v-show="category.hovered"
        @mouseenter="category.hovered = true"
        @mouseleave="category.hovered = false"
      >
        <!-- 列表左侧 -->
        <!--素材库下拉窗尺寸变大-->
        <div
          class="left"
          :style="category.type === 'Base' ? 'width:100px' : ''"
        >
          <div
            v-for="(tab, index) in category.tabs"
            :key="tab.title"
            :class="{ selected: index === selectedIndex }"
            @mouseenter="selectTab(tab, index, category.title)"
          >
            <p class="tab-title">{{ tab.title || tab.name }}</p>
          </div>
        </div>
        <div class="right">
          <!--素材库-->
          <div v-if="category.type === 'Base'" class="material">
            <div class="material-body">
              <div class="material-content">
                <div
                  class="material-box"
                  v-for="component in category.tabs[selectedIndex].children"
                  :key="component.key"
                >
                  <p class="material-text">{{ component.imgName }}</p>
                  <img
                    class="material-img"
                    :src="component.url"
                    alt="test"
                    draggable="true"
                    @click="handleAddForMaterial(component, $event)"
                    @dragstart="handleDragStartForMaterial(component, $event)"
                  />
                </div>
              </div>
            </div>
            <footer class="material-footer">
              <a-pagination
                v-if="category.tabs[selectedIndex].current"
                v-model="category.tabs[selectedIndex].current"
                size="small"
                :pageSize="category.tabs[selectedIndex].pageSize"
                :total="category.tabs[selectedIndex].total"
                show-less-items
                @change="getMaterials(category.tabs[selectedIndex])"
              />
              <div class="pageSize-box">
                每页显示
                <a-input-number
                  style="width:50px;"
                  v-model="category.tabs[selectedIndex].pageSize"
                  size="small"
                  :min="1"
                  :max="20"
                  @change="getMaterials(category.tabs[selectedIndex])"
                ></a-input-number>
              </div>
            </footer>
          </div>
          <!--控件-->
          <div
            v-else
            class="list-item"
            v-for="component in category.tabs[0].children"
            :key="component.chartType"
            :name="component.name"
            draggable="true"
            @click="handleAdd(component, $event)"
            @dragstart="handleDragStart(component, $event)"
          >
            <div class="front">
              <img
                style="width:18px;heigth:18px;"
                :src="require(`@/assets/images/chart/${component.icon}`)"
              />
              <span>{{ component.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <map-type-view
      :visible="visible"
      @ok="handleOk"
      @close="visible = false"
    ></map-type-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex' // 导入vuex
import { Icon } from 'ant-design-vue'
import MapTypeView from './components/map-type-view.vue'
import { Loading } from 'element-ui'

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2276651_71nv5th6v94.js'
}) // 引入iconfont
export default {
  name: 'DragList',
  props: {
    dragList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      hovered: false,
      visible: false,
      com: {},
      selectedIndex: 0, // 当前选择的页签,只对多个页签生效
      materialList: [] // 预留素材库页签子列表
    }
  },
  computed: {
    regionList() {
      if (this.mapType === 2) {
        return this.provinceList
      }
      if (this.mapType === 3) {
        return this.cityList
      }
      return []
    }
  },
  mounted() {},
  methods: {
    ...mapActions(['addChartData']),
    // 拖拽图表添加到大屏
    handleDragStart(component, event) {
      component.api_data.dimensions = []
      component.api_data.measures = []
      component.api_data.tableList = []
      component.api_data.options = {}
      component.api_data.refresh = {}
      component.api_data.modelId = ''
      if (component.chartType === 'v-ring') {
        component.config.topTitle.text = '70%'
      }
      this.$print('drag start:' + component.name, 'primary')
      // 拖拽的节点数据
      let nodeInfo = {
        // 唯一标识
        // id: 'node-' + ((new Date()).getTime()),
        id: new Date().getTime(),
        setting: { ...component }
      }
      event.dataTransfer.setData('node', JSON.stringify(nodeInfo))
      this.$print('drag nodeInfo', 'success')
      this.$print(nodeInfo)
    },
    // 点击图表添加到大屏
    handleAdd(component) {
      console.log(component)
      component.api_data.dimensions = []
      component.api_data.measures = []
      component.api_data.tableList = []
      component.api_data.options = { sort: [] }
      component.api_data.refresh = {}
      component.api_data.modelId = ''
      if (component.chartType === 'v-ring') {
        component.config.topTitle.text = '70%'
      }
      // 地图添加类型初始值
      if (component.chartType === 'v-map') {
        component.api_data.options = { fillType: 'area', labelType: 'area' }
        component.api_data.labelDimensions = []
        component.api_data.labelMeasures = []
      }
      // 拖拽的节点数据
      let nodeInfo = {
        // 唯一标识
        // id: 'node-' + ((new Date()).getTime()),
        // id: (new Date()).getTime(),
        tabId: this.$route.query.tabId,
        setting: { ...component }
      }
      // todo: 地图选择类型弹窗
      if (component.chartType === 'v-map') {
        this.com = nodeInfo
        this.visible = true
        return
      }
      this.addChartData(nodeInfo)
    },
    handleOk() {
      this.visible = false
      this.addChartData(this.com)
    },
    // 点击头部菜单默认选择第一个页签
    initTabChildren(category, i) {
      category.hovered = true
      this.selectedIndex = 0
      // 素材库加载第一页图片
      if (category.type === 'Base') {
        let tab = category.tabs[0]
        // 没有加载数据过才请求
        if (tab.children.length === 0) {
          this.getMaterials(tab)
        }
      }
    },
    // 切换子列表
    selectTab(tab, index, title) {
      if (title !== '素材库') {
        return
      }
      this.selectedIndex = index
      // 没有加载数据过才请求
      if (tab.children.length === 0) {
        // 获取对应分组素材
        this.getMaterials(tab)
      }
    },
    // 获取素材图片
    async getMaterials(tab) {
      let params = {
        id: tab.id,
        current: tab.current || 1, // 默认第一页
        pageSize: tab.pageSize || 5 // 默认5条/页
      }
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.material'),
        background: 'rgb(255, 255, 255, 0.6)'
      })
      let res = await this.$server.screenManage.getMaterials(params)
      // 构造大屏控件配置
      let list = []
      for (let imgData of res.rows) {
        list.push({
          key: imgData.id,
          name: 'material',
          chartType: 'material',
          icon: 'icon_addteb.png',
          modelId: '',
          api_data: {},
          isEmpty: false,
          imgName: imgData.name,
          config: {
            title: imgData.name,
            noTitle: true, // 默认写死没有标题
            name: 'material'
          },
          url: process.env.VUE_APP_SERVICE_URL + imgData.filePath,
          view: { width: 400, height: 400, x: 760, y: 340, rotate: 0 }
        })
      }
      // 素材内容，分页信息赋值
      this.$set(tab, 'children', list)
      // 只有初始加载没有分页信息
      if (!tab.current) {
        this.$set(tab, 'current', 1)
        this.$set(tab, 'total', res.total)
        this.$set(tab, 'pageSize', 5)
      }
      loadingInstance.close()
    },
    // 添加素材
    handleAddForMaterial(component) {
      let nodeInfo = {
        tabId: this.$route.query.tabId,
        setting: { ...component }
      }
      this.addChartData(nodeInfo)
    },
    handleDragStartForMaterial(component) {
      // 拖拽的节点数据
      let nodeInfo = {
        id: new Date().getTime(),
        setting: { ...component }
      }
      event.dataTransfer.setData('node', JSON.stringify(nodeInfo))
    }
  },
  components: { MapTypeView }
}
</script>
