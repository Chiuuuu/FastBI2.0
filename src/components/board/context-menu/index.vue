<template>
  <transition name="fade-in">
    <div
      class="dv-context-menu"
      v-if="contextMenuInfo.isShow"
      @mousedown.stop.prevent
      :style="contextMenuStyle"
      @click.stop.prevent
    >
      <div
        class="context-menu-item"
        v-for="item in menuList"
        :key="item.order"
        v-show="showMenu(item)"
        @mouseenter="item.showChildren = true"
        @mouseleave="item.showChildren = false"
        @click="handleCommand(item.order)"
      >
        <b-icon :name="item.icon"></b-icon>
        <span>{{ item.text }}</span>
        <div class="context-menu-item-children" v-if="item.showChildren">
          <div
            class="context-menu-item"
            v-for="(menu, i) in item.children"
            :key="menu.order"
            v-show="showMenu(menu)"
            @click.stop="handleCommand(menu.order, item)"
          >
            <JsonExcel
              v-if="i === 0"
              :key="currentSelected ? currentSelected + 'index' + i : 0"
              :fetch="handleChartData"
              :name="currSelected.name"
              >{{ menu.text }}</JsonExcel
            >
            <span v-else>{{ menu.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import JsonExcel from 'vue-json-excel'
import {
  exportImg,
  exportForFull,
  exportScreen,
  exportCsv
} from '@/utils/screenExport'
import handleReturnChartData from '@/utils/handleReturnChartData'
import { mapGetters, mapActions } from 'vuex'
import { Loading } from 'element-ui'
import chartTableData from '../chartTableData/index' // 右键菜单
import { deepClone } from '@/utils/deepClone'
import { message } from 'ant-design-vue'
const exportChartList = [
  {
    icon: 'ios-share',
    text: '查看数据',
    order: 'showChartData',
    ignore: ['figure', 've-image', 'material']
  },
  {
    icon: 'ios-download',
    text: '导出',
    order: 'export',
    ignore: ['figure'],
    showChildren: false,
    children: [
      { text: 'excel', order: 'toexcel', ignore: ['ve-image', 'material'] },
      { text: 'csv', order: 'tocsv', ignore: ['ve-image', 'material'] },
      { text: '图片', order: 'exportImg' }
    ]
  }
]
const chartMenuList = [
  {
    icon: 'ios-share',
    text: '查看数据',
    order: 'showChartData',
    ignore: ['figure', 've-image', 'material']
  },
  {
    icon: 'ios-download',
    text: '导出',
    order: 'export',
    ignore: ['figure'],
    showChildren: false,
    children: [
      { text: 'excel', order: 'toexcel', ignore: ['ve-image', 'material'] },
      { text: 'csv', order: 'tocsv', ignore: ['ve-image', 'material'] },
      { text: '图片', order: 'exportImg' }
    ]
  },
  { icon: 'ios-share', text: '置顶', order: 'top' },
  { icon: 'ios-download', text: '置底', order: 'bottom' },
  { icon: 'md-arrow-round-up', text: '上移一层', order: 'up' },
  { icon: 'md-arrow-round-down', text: '下移一层', order: 'down' },
  { icon: 'ios-copy', text: '复制', order: 'copy' },
  { icon: 'ios-trash', text: '删除', order: 'remove' }
]
const screenMenuList = [
  { icon: 'ios-share', text: '导出当前大屏', order: 'exportScreen' },
  { icon: 'ios-download', text: '取消', order: 'cancel' }
]

export default {
  name: 'ContextMenu',
  components: { JsonExcel },
  data() {
    return {
      menuList: chartMenuList, // 菜单列表
      chartData: { rows: [] }, // 图表数据(按最后展示格式)
      chartDataForMap: null, // 同上(地图标记层)
      menuCompont: null,
      json_fields: null // 导出格式
    }
  },
  inject: ['showChartData'],
  watch: {
    'contextMenuInfo.listType'(val) {
      if (val) {
        // eslint-disable-next-line no-eval
        this.menuList = eval(val)
      }
    }
  },
  computed: {
    ...mapGetters([
      'contextMenuInfo',
      'pageSettings',
      'canvasMap',
      'screenId',
      'currSelected',
      'currentSelected',
      'pageSettings',
      'canvasRange',
      'isScreen',
      'fileName',
      'polymerizeType'
    ]),
    contextMenuStyle() {
      let x =
        this.contextMenuInfo.x !== undefined
          ? parseInt(this.contextMenuInfo.x) > 0
            ? parseInt(this.contextMenuInfo.x)
            : 0
          : 0
      let y =
        this.contextMenuInfo.y !== undefined
          ? parseInt(this.contextMenuInfo.y) > 0
            ? parseInt(this.contextMenuInfo.y)
            : 0
          : 0
      let tmpObj = {}
      // 判断是否超出边界
      if (
        document.documentElement &&
        document.documentElement.clientHeight &&
        document.documentElement.clientWidth
      ) {
        let winHeight = document.documentElement.clientHeight
        let winWidth = document.documentElement.clientWidth
        if (x + 200 > winWidth) {
          tmpObj['right'] = '10px'
        } else {
          tmpObj['left'] = x + 'px'
        }
        if (y + 100 > winHeight) {
          tmpObj['bottom'] = '42px'
        } else {
          tmpObj['top'] = y + 'px'
        }
      }
      return tmpObj
    }
  },
  destroyed() {
    message.destroy()
  },
  methods: {
    ...mapActions(['deleteChartData']),
    formatAggregator(item) {
      const fun = this.polymerizeType.find(
        x => x.value === item.defaultAggregator
      )
      if (item.role === 2) {
        return `${item.alias} (${fun.name})`
      } else {
        return item.alias
      }
    },
    // 控制是否显示菜单栏
    showMenu(item) {
      if (!this.contextMenuInfo.isShow) {
        return false
      }
      if (this.currSelected) {
        return (
          !item.ignore || !item.ignore.includes(this.currSelected.setting.name)
        )
      } else {
        return true
      }
    },
    //  执行菜单命令
    async handleCommand(order, item) {
      if (item) {
        item.showChildren = false
      }
      if (order === 'export') {
        return
      }
      if (order === 'remove') {
        // 如果是删除操作则弹出一个对话框来确认
        // this.$EventBus.$emit('context/menu/delete')
        this.deleteOne()
      } else if (order === 'showChartData') {
        this.$store.dispatch('ToggleContextMenu')
        // 查看/导出数据
        this.handleChartData('view')
      } else if (order === 'tocsv') {
        const datas = await this.handleChartData()
        exportCsv(datas, null, this.currSelected.name)
      } else if (order === 'exportImg') {
        this.$store.dispatch('ToggleContextMenu')
        if (this.isScreen && this.$route.name !== 'screenEdit') {
          exportForFull(
            this.currentSelected,
            this.currSelected,
            this.pageSettings,
            this.canvasRange
          )
        } else {
          exportImg(this.currentSelected, this.currSelected, this.pageSettings)
        }
      } else if (order === 'exportScreen') {
        this.$store.dispatch('ToggleContextMenu')
        this.exportScreen()
      } else {
        this.$store.dispatch('ContextMenuCommand', order)
      }
    },
    // 查看数据
    // viewChartData() {
    //   const _Menu = Vue.extend(chartTableData)
    //   this.menuCompont = new _Menu({
    //     propsData: {
    //       chartData: this.chartData
    //     }
    //   }).$mount()
    //   const currentParentName = this.isScreen ? '.dv-screen' : '.board-layout'
    //   document
    //     .querySelector(currentParentName)
    //     .appendChild(this.menuCompont.$el)
    // },
    // 导出大屏数据
    exportScreen() {
      exportScreen(this.fileName)
    },
    startDownload() {
      this.$message.info('正在导出')
    },
    finishDownload() {
      this.$message.info('导出成功')
    },
    // 删除图表
    deleteOne() {
      this.deleteChartData()
    },
    // 处理查看/导出数据
    async handleChartData(type) {
      // 查看图表数据
      if (
        this.currSelected.setting.api_data.source ||
        (this.currSelected.setting.chartType === 'v-map' &&
          this.currSelected.setting.config.series.length)
      ) {
        let dataList = await this.setChartData_scan()
        // 查看数据弹出展示窗
        if (type === 'view') {
          this.showChartData(this.chartData)
          return
        }
        return dataList
      } else {
        const elmNameMap = {
          catalog: '.dv-screen',
          screenEdit: '.screen-shot'
        }
        let dom = document.querySelector(elmNameMap[this.$route.name])
        message.config({
          getContainer: () => dom
        })
        message.error('该图表没有拖入图表数据')
      }
    },
    // 查看/导出数据 -- 构造数据
    async setChartData_scan() {
      let params = {
        id: this.currSelected.id,
        type: this.currSelected.setting && this.currSelected.setting.chartType
      }
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: 'body',
        background: 'rgb(255, 255, 255, 0.6)'
      })
      let res = await this.$server.screenManage.getGraphInfo(params)
      loadingInstance.close()
      if (res.code !== 200) {
        this.$message.error(res.msg || '请重新操作')
        return
      }

      let source = res.data || []

      let columns = []
      let rows = []
      let tableName = []
      let exportList = []

      if (this.currSelected.setting.chartType === 'v-map') {
        await Promise.all(
          Object.keys(source).map(async item => {
            if (source[item]) {
              let aliasKeys = this.handleTableColumns(
                Object.keys(source[item][0]),
                item
              )
              columns.push(aliasKeys)
              let row = []
              if (item === 'fillList') {
                row = await handleReturnChartData(
                  source[item],
                  this.currSelected.setting,
                  false,
                  aliasKeys.filter(item => item.role === 2)
                )
              } else if (item === 'labelList') {
                row = await handleReturnChartData(
                  source[item],
                  this.currSelected.setting,
                  true,
                  aliasKeys.filter(item => item.role === 2)
                )
              }
              let type = item === 'fillList' ? '填充' : '标记点'
              rows.push(row)
              tableName.push(type)
              let aliasObj = {}
              aliasKeys.forEach((alias, index) => {
                aliasObj[''.padEnd(index + 1, ' ')] = alias['colName']
              })
              let cunstomRow = source[item].map(row => {
                let obj = {}
                aliasKeys.forEach((alias, index) => {
                  obj[''.padEnd(index + 1, ' ')] = row[alias['colName']]
                })
                return obj
              })
              let titleRow = { ' ': type, '  ': '', '   ': '' }
              cunstomRow = [titleRow, aliasObj].concat(cunstomRow)
              exportList = cunstomRow.concat(exportList)
            }
          })
        )
      } else {
        // 处理空数据
        columns = [this.handleTableColumns(Object.keys(source[0]))]
        source = await handleReturnChartData(
          source,
          this.currSelected.setting,
          false,
          columns[0].filter(item => item.role === 2)
        )
        rows = [source]
        exportList = source
      }
      this.chartData = {
        columns,
        rows,
        tableName
      }
      return exportList
    },
    // 处理表头, 按拖入的维度度量顺序排列
    handleTableColumns(keys, label) {
      const apiData = this.currSelected.setting.api_data
      let fieldList = []
      if (label && label === 'labelList') {
        // 地图 -- 标记点数据
        fieldList = []
          .concat(apiData.labelDimensions)
          .concat(apiData.labelMeasures)
      } else {
        fieldList = [].concat(apiData.dimensions).concat(apiData.measures)
      }
      const column = []
      fieldList.map(item => {
        if (keys.includes(item.alias)) {
          column.push({
            alias: item.alias,
            colName: this.formatAggregator(item),
            role: item.role
          })
        }
      })
      return column
    }
  }
}
</script>
