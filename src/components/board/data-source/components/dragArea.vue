<template>
  <div
    class="dragArea"
    :class="{
      'dragable-vaild': isdrag
    }"
    @drop.stop.prevent="handleDropOnFilesWD($event)"
    @dragover.stop.prevent
    @dragenter="dragenter"
    @dragleave="dragleave"
  >
    <div v-if="fileList.length > 0">
      <div
        :class="['field', { error: item.status === 1 }]"
        v-for="(item, index) in fileList"
        :key="index"
        @contextmenu.prevent="showMore(item)"
      >
        <a-dropdown
          :trigger="['click', 'contextmenu']"
          v-model="item.showMore"
          @visibleChange="v => v && showMore(item)"
        >
          <a-icon class="icon-more" type="caret-down" />
          <a-menu slot="overlay">
            <a-sub-menu
              key="1"
              title="聚合方式"
              v-show="item.file === 'measures'"
            >
              <a-menu-item
                v-for="(aggregator, index) in polymerizationData[strornum]"
                :key="index"
                @click.native="changePolymerization(aggregator, item)"
                >{{ aggregator.name }}</a-menu-item
              >
            </a-sub-menu>
            <a-menu-item key="3"
              ><div @click.stop="deleteFile($event, item, index)">
                移除
              </div></a-menu-item
            >
          </a-menu>
        </a-dropdown>
        <a-tooltip :title="formatAggregator(item)">
          <span ref="itemName" class="field-text">{{
            formatAggregator(item)
          }}</span>
        </a-tooltip>
      </div>
    </div>
    <div class="empty" :class="{ field: isdrag }">
      {{ emptyText[type] }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { deepClone } from '@/utils/deepClone'
import TreeGroupBy from '@/components/board/options/treemap/tree-groupby'
import { sum, summary } from '@/utils/summaryList'
import geoJson from '@/utils/guangdong.json'
import { Loading } from 'element-ui'
import _ from 'lodash'
// import navigateList from '@/config/navigate'
import sourceMap from './defaultData'
import handleReturnChartData from '@/utils/handleReturnChartData'

export default {
  props: {
    type: {
      type: String,
      default: ''
    } // 区域类型 维度/度量
  },
  data() {
    return {
      current: {},
      selected: {},
      emptyText: {
        dimensions: '拖入维度',
        measures: '拖入度量',
        filter: '拖入字段',
        tableList: '拖入字段'
      },
      strornum: '',
      polymerizationData: {
        // 数字
        num: [
          { name: '求和', value: 'SUM' },
          { name: '平均', value: 'AVG' },
          { name: '最大值', value: 'MAX' },
          { name: '最小值', value: 'MIN' },
          { name: '计数', value: 'CNT' },
          { name: '去重计数', value: 'DCNT' }
        ],
        str: [
          { name: '计数', value: 'CNT' },
          { name: '去重计数', value: 'DCNT' }
        ]
      },
      isdrag: false, // 是否拖拽中
      fileList: [], // 维度字段数组
      isVaild: false //
    }
  },
  inject: ['errorFile', 'initTargetMeasure'],
  watch: {
    currSelected: {
      handler(val) {
        if (val) {
          // 当前选中的图表显示维度度量的数据
          this.fileList = []
          // 维度度量都需要
          if (this.chartType === '1') {
            if (this.type === 'dimensions' && val.setting.api_data.dimensions) {
              // 维度
              this.fileList = deepClone(val.setting.api_data.dimensions)
            }
            if (this.type === 'measures' && val.setting.api_data.measures) {
              // 度量
              this.fileList = deepClone(val.setting.api_data.measures)
            }
          }

          // 只需要度量
          if (this.chartType === '2') {
            if (this.type === 'measures' && val.setting.api_data.measures) {
              this.fileList = deepClone(val.setting.api_data.measures)
            }
          }

          // 表格不区分维度跟度量
          if (this.chartType === '3') {
            if (this.type === 'tableList' && val.setting.api_data.tableList) {
              this.fileList = deepClone(val.setting.api_data.tableList)
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
    errorFile: {
      handler(val) {
        if (val) {
          // 维度度量都需要
          if (this.chartType === '1') {
            if (this.type === 'dimensions' && this.fileList) {
              // 维度
              this.fileList.forEach(file => {
                let dimension = val.dimensions.find(
                  item => item.alias === file.alias
                )
                if (dimension && dimension.status === 1) {
                  file.status = dimension.status
                }
              })
            }
            if (this.type === 'measures' && this.fileList) {
              // 度量
              this.fileList.forEach(file => {
                let measure = val.measures.find(
                  item => item.alias === file.alias
                )
                if (measure && measure.status === 1) {
                  file.status = measure.status
                }
              })
            }
          }

          // 只需要度量
          if (this.chartType === '2') {
            if (this.type === 'measures' && this.fileList) {
              this.fileList.forEach(file => {
                let measure = val.measures.find(
                  item => item.alias === file.alias
                )
                if (measure && measure.status === 1) {
                  file.status = measure.status
                }
              })
            }
          }

          // 表格不区分维度跟度量
          if (this.chartType === '3') {
            if (this.type === 'tableList' && this.fileList) {
              let list = val.dimensions.concat(val.measures)
              this.fileList.forEach(file => {
                let li = list.find(item => item.alias === file.alias)
                if (li && li.status === 1) {
                  file.status = li.status
                }
              })
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapGetters([
      'dragFile',
      'currentSelected',
      'currSelected',
      'optionsTabsType',
      'dataModel',
      'canvasMap',
      'polymerizeType'
    ]),
    chartType() {
      return this.currSelected ? this.currSelected.setting.type : ''
    }
  },
  methods: {
    ...mapActions(['updateChartData']),
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
    // 将拖动的维度到所选择的放置目标节点中
    handleDropOnFilesWD(event) {
      // h5 api
      let dataFile = JSON.parse(event.dataTransfer.getData('dataFile'))

      if (
        this.currSelected.datamodelId &&
        this.currSelected.datamodelId !== '0' &&
        this.currSelected.datamodelId !== dataFile.screenTableId
      ) {
        this.$message.error('一个图表只能拖入一个数据模型的字段')
        this.isdrag = false
        return false
      }
      let _alias = this.polymerizeType.find(
        x => x.value === dataFile.defaultAggregator
      )
      dataFile.showMore = false // 是否点击显示更多
      if (this.type === 'dimensions' && this.dragFile === this.type) {
        // 嵌套饼图可以有多个维度（最多只能2个）
        // 矩形热力图必须2个维度一个度量(v-heatmap)
        if (
          this.currSelected.setting.chartType === 'v-multiPie' ||
          this.currSelected.setting.chartType === 'v-heatmap'
        ) {
          if (this.currSelected.setting.chartType === 'v-heatmap') {
            this.handleShowList(dataFile, 1)
          }
          if (this.fileList.length < 2) {
            this.fileList.push(dataFile)
          } else if (this.fileList.length === 2) {
            this.fileList.splice(1, 1, dataFile)
          }
        } else if (
          this.currSelected.setting.chartType === 'v-treemap' ||
          this.currSelected.setting.chartType === 'v-sun'
        ) {
          this.handleShowList(dataFile, 4)
          // 矩形树图可以拖入5个维度
          if (this.fileList.length < 5) {
            this.fileList.push(dataFile)
          } else if (this.fileList.length === 5) {
            this.fileList.splice(4, 1, dataFile)
          }
        } else {
          // 维度暂时只能拉入一个字段
          this.fileList[0] = dataFile
        }
        this.fileList = this.uniqueFun(this.fileList, 'alias')
        this.getData()
      }
      // 度量
      if (
        this.type === 'measures' &&
        this.dragFile === this.type &&
        this.chartType === '1'
      ) {
        // let _alias = this.polymerizeType.find(
        //   x => x.value === dataFile.defaultAggregator
        // )
        // dataFile.alias += `(${_alias.name})`
        // 获取初始聚合方式
        dataFile.defaultAggregator = this.judgeDataType(dataFile.dataType)
        // 饼图类型只能拉入一个度量（包含3d和矩形热力图）
        if (
          (this.currSelected.setting.name === 've-pie') |
          (this.currSelected.setting.chartType === 'high-pie') |
          (this.currSelected.setting.chartType === 'v-heatmap')
        ) {
          if (this.currSelected.setting.chartType === 'v-heatmap') {
            this.handleShowList(dataFile, 0)
          }
          this.fileList[0] = dataFile
        } else if (
          this.currSelected.setting.name === 've-scatter' &&
          this.fileList.length >= 2
        ) {
          // 散点图只能拉入两个度量
          this.fileList[1] = dataFile
        } else if (this.currSelected.setting.name === 've-map') {
          // 地图类型暂时只能拉入一个度量
          this.fileList[0] = dataFile
        } else if (
          this.currSelected.setting.chartType === 'v-treemap' ||
          this.currSelected.setting.chartType === 'v-sun'
        ) {
          this.handleShowList(dataFile, 0)
          // 矩形树图暂时只能拉入一个度量
          this.fileList[0] = dataFile
        } else {
          this.fileList.push(dataFile)
        }
        this.fileList = this.uniqueFun(this.fileList, 'alias')
        this.getData()
      }
      // 表格
      if (this.type === 'tableList') {
        if (dataFile.file === 'measures') {
          dataFile.defaultAggregator = this.judgeDataType(dataFile.dataType)
        }
        this.fileList.push(dataFile)
        this.fileList = this.uniqueFun(this.fileList, 'alias')
        this.getData()
      }
      // 仪表盘/环形图
      if (
        this.chartType === '2' &&
        this.type === 'measures' &&
        this.dragFile === this.type
      ) {
        // 进度条只有一个度量
        // dataFile.alias += `(${_alias.name})`
        if (this.currSelected.setting.name === 'steepBar') {
          this.fileList[0] = dataFile
        } else {
          if (this.fileList.length < 2) {
            this.fileList.push(dataFile)
          }
        }
        this.fileList = this.uniqueFun(this.fileList, 'alias')
        this.getData()
      }
      this.isdrag = false
    },
    // 对象数组去重,type表示对象里面的一个属性
    uniqueFun(arr, type) {
      const res = new Map()
      return arr.filter(a => !res.has(a[type]) && res.set(a[type], 1))
    },
    // 当可拖动的元素进入可放置的目标时
    dragenter(event) {
      event.preventDefault()
      this.isdrag = true
    },
    // 当拖动元素离开可放置目标节点
    dragleave(event) {
      event.preventDefault()
      this.isdrag = false
    },
    // 判断数值类型
    judgeDataType(dataType) {
      // 判断数值类型
      let isNum =
        dataType === 'BIGINT' || dataType === 'DECIMAL' || dataType === 'DOUBLE'
      this.strornum = isNum ? 'num' : 'str'
      return isNum ? 'SUM' : 'CNT'
    },
    // 点击右键显示更多
    showMore(item) {
      // 重新根据数值类型获取聚合列表
      this.judgeDataType(item.dataType)
      item.showMore = true
    },
    // 修改数据聚合方式
    changePolymerization(i, item) {
      item.showMore = false
      // item.alias = item.alias.replace(/\(.*?\)/, '(' + i.name + ')')
      item.defaultAggregator = i.value
      this.getData()
    },
    // 抓取区中心点
    getCenterCoordinate(name) {
      let dataList = geoJson.features
      let countryside = dataList.find(item => item.properties.name === name)
      if (!countryside) {
        return null
      }
      return countryside.properties.center
    },
    handleTreemapConfig(rows) {
      let setting = deepClone(this.currSelected.setting)
      let config = setting.config
      const tree = new TreeGroupBy(
        rows,
        setting.api_data.dimensions.map(item => item.alias),
        setting.api_data.measures
      )
      TreeGroupBy.handleLeafValue(tree.tree)
      config.series.data = tree.tree
      config.series.visualMaxList = tree.max
      config.visualMap.max = tree.max[0]

      // 若删除了维度, 且刚好指针指向了维度, 则切换映射类型
      let index = config.series.recDimensionIndex || 0
      if (index >= setting.api_data.dimensions.length) {
        config.series.recDimensionIndex = index =
          setting.api_data.dimensions.length - 1
      }
      if (index === setting.api_data.dimensions.length) {
        config.visualMap.max = config.series.visualMaxList[0]
        config.visualMap.type = 'continuous'
        config.visualMap.inRange.color = config.series.continuousColors
      } else {
        let dimensionIndex = setting.api_data.dimensions.length - index - 1
        dimensionIndex = dimensionIndex < 0 ? 0 : dimensionIndex
        config.visualMap.dimension = dimensionIndex + 1
        config.visualMap.max = config.series.visualMaxList[dimensionIndex]
        config.visualMap.type = 'piecewise'
        config.visualMap.inRange.color = config.series.piecewiseColors
        config.visualMap.pieces = TreeGroupBy.handlePieces(
          config.series.data,
          index
        )
      }
      this.$store.dispatch('SetSelfProperty', config)

      let apiData = deepClone(this.currSelected.setting.api_data)
      apiData.source = tree.tree
      this.$store.dispatch('SetSelfDataSource', apiData)
      this.updateChartData()
    },
    handleShowList(dataFile, maxIndex) {
      const config = deepClone(this.currSelected.setting.config)
      if (this.fileList.length < maxIndex + 1) {
        if (config.series.tooltipShowList.indexOf(dataFile.alias) < 0) {
          config.series.tooltipShowList.push(dataFile.alias)
        }
        if (config.series.labelShowList.indexOf(dataFile.alias) < 0) {
          config.series.labelShowList.push(dataFile.alias)
        }
      } else if (this.fileList.length === maxIndex + 1) {
        let tooltipIndex = config.series.tooltipShowList.indexOf(
          this.fileList[maxIndex].alias
        )
        if (tooltipIndex < 0) {
          config.series.tooltipShowList.push(dataFile.alias)
        } else {
          config.series.tooltipShowList.splice(tooltipIndex, 1, dataFile.alias)
        }
        let labelIndex = config.series.labelShowList.indexOf(
          this.fileList[maxIndex].alias
        )
        if (labelIndex < 0) {
          config.series.labelShowList.push(dataFile.alias)
        } else {
          config.series.labelShowList.splice(labelIndex, 1, dataFile.alias)
        }
      }
      this.$store.dispatch('SetSelfProperty', config)
    },
    // 删除当前维度或者度量
    async deleteFile(event, item, index) {
      this.fileList.splice(index, 1)
      await this.getData()
      let current = deepClone(this.currSelected)
      // 维度度量删除完以后重置该图表数据
      if (this.chartType === '1' || this.chartType === '2') {
        if (
          current.setting.api_data.dimensions.length === 0 &&
          current.setting.api_data.measures.length === 0
        ) {
          // 清空数据
          delete current.setting.api_data.source
          this.$store.dispatch('SetSelfDataSource', current.setting.api_data)
          // 嵌套饼图apis恢复原始状态
          if (current.setting.chartType === 'v-multiPie') {
            const apis = current.setting.apis
            apis.level = [['1/1', '1/2', '1/3'], ['1/4', '1/5']]
            this.$store.dispatch('SetApis', apis)
          }
          // 立体图和矩形热力图 旭日图重置
          if (
            current.setting.chartType === 'high-pie' ||
            current.setting.chartType === 'high-column'
          ) {
            let res = sourceMap[current.setting.chartType]
            current.setting.config.series = JSON.parse(JSON.stringify(res))
            this.$store.dispatch('SetSelfProperty', current.setting.config)
            this.updateChartData()
          }
        }
        // 如果是仪表盘，第二个度量是目标值（进度条最大值）,重置进度条范围
        if (current.setting.chartType === 'v-gauge') {
          current.setting.config.series.max = 100
          this.$store.dispatch('SetSelfProperty', current.setting.config)
        }
        // 环形重置显示值
        if (current.setting.chartType === 'v-ring') {
          current.setting.config.chartTitle.text = '70%'
          this.$store.dispatch('SetSelfProperty', current.setting.config)
        }

        if (
          current.setting.chartType === 'v-treemap' ||
          current.setting.chartType === 'v-sun' ||
          current.setting.chartType === 'v-heatmap'
        ) {
          // 没有维度度量, 重置数据
          if (
            current.setting.api_data.dimensions.length === 0 &&
            current.setting.api_data.measures.length === 0
          ) {
            let res = sourceMap[current.setting.chartType]
            current.setting.config = JSON.parse(JSON.stringify(res))
          }
          const tooltipShowList = current.setting.config.series.tooltipShowList
          for (let i = 0; i < tooltipShowList.length; i++) {
            if (item.alias === tooltipShowList[i]) {
              tooltipShowList.splice(i, 1)
            }
          }
          const labelShowList = current.setting.config.series.labelShowList
          for (let i = 0; i < labelShowList.length; i++) {
            if (item.alias === labelShowList[i]) {
              labelShowList.splice(i, 1)
            }
          }
          this.$store.dispatch('SetSelfProperty', current.setting.config)
          this.updateChartData()
        }
      }
      if (this.chartType === '3') {
        if (current.setting.api_data.tableList.length === 0) {
          // current.setting.api_data.modelId = ''
          this.$store.dispatch('SetSelfDataSource', current.setting.api_data)
        }
      }
    },
    // 根据维度度量获取数据
    async getData() {
      let selected = this.canvasMap.find(
        item => item.id === this.currentSelected
      )
      // 维度
      if (this.type === 'dimensions') {
        selected.setting.api_data.dimensions = this.fileList
      }
      // 度量
      if (this.type === 'measures') {
        selected.setting.api_data.measures = this.fileList
      }
      // 表格
      if (this.type === 'tableList') {
        // 不区分默认都放在维度
        let di = []
        let me = []
        this.fileList.forEach(item => {
          if (item.file === 'dimensions') {
            di.push(item)
          }
          if (item.file === 'measures') {
            me.push(item)
          }
        })
        selected.setting.api_data.dimensions = di
        selected.setting.api_data.measures = me
        selected.setting.api_data.tableList = this.fileList
      }

      if (
        (!selected.datamodelId || selected.datamodelId === '0') &&
        this.fileList.length > 0
      ) {
        // modelId 赋值
        selected.datamodelId = this.fileList[0].screenTableId
        selected.setting.api_data.modelId = parseInt(
          this.fileList[0].screenTableId
        )
        selected.setting.resourceType = this.fileList[0].resourceType
      }
      let data = this.currSelected.setting.api_data
      if (this.chartType === '1') {
        if (data.dimensions.length === 0 && data.measures.length === 0) {
          selected.datamodelId = 0
          selected.setting.api_data.modelId = 0
          selected.setting.isEmpty = false
          selected.setting.resourceType = ''
          this.updateChartData()
          return
        }
        if (data.dimensions.length === 0 || data.measures.length === 0) {
          return
        }
        if (
          data.dimensions.some(item => item.status === 1) ||
          data.measures.some(item => item.status === 1)
        ) {
          return
        }
      }
      // }

      if (this.chartType === '2') {
        if (data.measures.length === 0) {
          selected.datamodelId = 0
          selected.setting.api_data.modelId = 0
          selected.setting.isEmpty = false
          selected.setting.resourceType = ''
          this.updateChartData()
          return
        }
        if (data.measures.some(item => item.status === 1)) {
          return
        }
      }
      if (this.chartType === '3') {
        if (data.tableList.length === 0) {
          selected.datamodelId = 0
          selected.setting.api_data.modelId = 0
          selected.setting.isEmpty = false
          selected.setting.resourceType = ''
          this.updateChartData()
          return
        }
        if (data.tableList.some(item => item.status === 1)) {
          return
        }
      }
      let params = selected
      let apiData = deepClone(this.currSelected.setting.api_data)
      // 散点图，拖入一个维度和两个度量时才请求数据
      if (
        this.currSelected.setting.chartType === 'v-scatter' &&
        (apiData.dimensions.length === 0 || apiData.measures.length <= 1)
      ) {
        return
      }
      // 矩形热力图只有在2个维度和一个度量的时候，才能请求数据
      if (
        this.currSelected.setting.chartType === 'v-heatmap' &&
        (apiData.dimensions.length <= 1 || apiData.measures.length === 0)
      ) {
        return
      }

      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: 'body',
        background: 'rgb(255, 255, 255, 0.6)'
      })
      let res = await this.$server.screenManage.getData(params)
      loadingInstance.close()
      selected.setting.isEmpty = false
      // 数据源被删掉
      if (res.code === 500 && res.msg === 'IsChanged') {
        selected.setting.isEmpty = 'noData'
        this.updateChartData()
        return
      }
      if (res.code === 200) {
        let datas = res.rows
        // 处理图表数据
        datas = await handleReturnChartData(datas, this.currSelected.setting)

        // 矩形树图数据处理
        if (this.currSelected.setting.chartType === 'v-treemap') {
          return this.handleTreemapConfig(res.rows)
        } else if (this.currSelected.setting.chartType === 'v-sun') {
          let setting = deepClone(this.currSelected.setting)
          let config = setting.config
          config.series.data = res.rows
          this.$store.dispatch('SetSelfProperty', config)
        } else if (this.currSelected.setting.chartType === 'v-heatmap') {
          let setting = deepClone(this.currSelected.setting)
          let config = setting.config
          // 维度
          let dim = apiData.dimensions.map(x => x.alias)
          // 度量
          let mea = apiData.measures.map(y => y.alias)
          if ((dim.length === 0) | (mea.length === 0)) {
            return
          }
          // 获取度量数组
          let meaarr = res.rows.map(h => h[mea[0]])
          if (meaarr.includes(undefined)) {
            return
          }
          let _series = res.rows.map(item => [
            item[dim[0]],
            item[dim[1]],
            item[mea[0]]
          ])
          config.visualMap.max = Math.max(...meaarr)
          config.series.data = [..._series]
          this.$store.dispatch('SetSelfProperty', config)
        }
        if (this.type === 'tableList') {
          let columns = []
          for (let item of this.fileList) {
            columns.push({
              title: item.alias,
              dataIndex: item.alias,
              key: item.alias,
              role: item.role,
              defaultAggregator: item.defaultAggregator
            })
          }
          let rows = datas
          if (rows.length > 10) {
            rows.length = 10
          }
          apiData.source = {
            columns,
            rows
          }
          this.$store.dispatch('SetSelfDataSource', apiData)
        } else {
          // 仪表盘/环形图 只显示度量
          if (this.chartType === '2') {
            apiData.returnData = datas // 记录返回的键值对，方便展示图表数据直接用
            let columns = ['type', 'value'] // 维度固定
            for (let m of apiData.measures) {
              columns.push(m.alias) // 默认columns第二项起为指标
            }
            // 对返回的数据列进行求和
            let total = sum(datas, apiData.measures[0].alias)
            let rows = [
              {
                type: apiData.measures[0].alias,
                value: total
              }
            ]
            // 环形图第二度量(指针值)
            if (
              this.currSelected.setting.chartType === 'v-ring' &&
              apiData.measures[1]
            ) {
              let currentTotal = sum(datas, apiData.measures[1].alias)
              rows[0] = {
                type: apiData.measures[1].alias,
                value: currentTotal
              }
              rows.push({
                type: apiData.measures[0].alias,
                value: total - currentTotal
              })
            }
            apiData.source = {
              columns,
              rows
            }
            // 保存apidata数据
            this.$store.dispatch('SetSelfDataSource', apiData)
            let config = deepClone(this.currSelected.setting.config)
            if (this.currSelected.setting.chartType === 'v-ring') {
              config.title.text =
                (rows[0].value / rows[1].value) * 100 + '%'
              this.$store.dispatch('SetSelfProperty', config)
            }
            // 如果是仪表盘，第二个度量是目标值（进度条最大值）
            if (
              this.currSelected.setting.chartType === 'v-gauge' &&
              apiData.measures[1]
            ) {
              let goalTotal = sum(datas, apiData.measures[1].alias)
              config.series.max = goalTotal
              this.$store.dispatch('SetSelfProperty', config)
            }

            this.updateChartData()
            return
          }

          let columns = []
          let rows = []
          let dimensionKeys = [] // 维度key
          for (let m of apiData.dimensions) {
            dimensionKeys.push(m.alias)
            columns.push(m.alias) // 默认columns第二项起为指标
          }

          let measureKeys = [] // 度量key
          for (let m of apiData.measures) {
            measureKeys.push(m.alias)
            columns.push(m.alias) // 默认columns第二项起为指标
          }

          // 嵌套饼图设置apis
          if (this.currSelected.setting.chartType === 'v-multiPie') {
            // name是各维度数据拼接，value是分类汇总过的数值
            columns = ['name', 'value']
            const apis = deepClone(this.currSelected.setting.apis)
            apis.level = [['1/1', '1/2', '1/3'], ['1/4', '1/5']]
            let level = []
            // 一个维度是一层饼
            dimensionKeys.forEach(item => {
              // 根据当前维度分类得到的列表
              let list = summary(datas, item, measureKeys[0]) // 嵌套饼图度量只有一个，直接取第一个数
              rows = rows.concat(list) // 把所有维度分类出来的数组进行拼接（v-charts配置格式要求）

              level.push(list.map(obj => obj.name)) // 按维度分层
            })

            apis.level = level
            this.$store.dispatch('SetApis', apis)
          } else if (this.currSelected.setting.chartType === 'v-sun') {
            rows = [...datas]
          } else {
            datas.map((item, index) => {
              let obj = {}
              for (let item2 of dimensionKeys) {
                obj[item2] = item[item2]
              }
              obj[dimensionKeys] = item[dimensionKeys]
              for (let item2 of measureKeys) {
                obj[item2] = item[item2]
              }
              // if (obj[dimensionKeys]) {
              rows.push(obj)
              // }
            })
            // 雷达图
            if (this.currSelected.setting.chartType === 'v-radar') {
              // 格式例子cloumns:[度量，青瓜，土豆，菜心]
              // rows:[{度量:度量1,青瓜，土豆，菜心},{度量2,青瓜，土豆，菜心}]
              let metricsName = apiData.dimensions[0].alias
              let newColumns = ['measure']
              let newRows = []
              apiData.measures.forEach(measure => {
                let measureName = measure.alias
                let obj = {}
                rows.forEach(row => {
                  newColumns.push(row[metricsName])
                  obj.measure = measureName
                  obj[row[metricsName]] = row[measureName]
                })
                newRows.push(obj)
              })

              columns = newColumns
              rows = newRows
            }
          }

          // 散点图，两个度量分别是x，y轴的值
          if (this.currSelected.setting.chartType === 'v-scatter') {
            let scatterData = {}
            let legendData = []
            let list = []
            let xMax = 0
            let yMax = 0
            rows.forEach(item => {
              if (xMax < item[columns[1]]) {
                xMax = item[columns[1]]
              }
              if (yMax < item[columns[2]]) {
                yMax = item[columns[2]]
              }
              if (!scatterData[item[columns[0]]]) {
                scatterData[item[columns[0]]] = []
                legendData.push(item[columns[0]])
              }
              scatterData[item[columns[0]]].push({
                name: '',
                value: [
                  item[columns[1]], // 度量1
                  item[columns[2]], // 度量2
                  item[columns[0]], // 维度
                  columns[1],
                  columns[2],
                  columns[0]
                ]
              })
            })
            for (let i in scatterData) {
              list.push({
                label: i,
                data: scatterData[i]
              })
            }
            let config = deepClone(this.currSelected.setting.config)
            config.series.data = list
            config.series.dimensions = [columns[1], columns[2], columns[0]]
            config.legend.data = legendData
            this.$store.dispatch('SetSelfProperty', config)

            let apis = deepClone(this.currSelected.setting.apis)
            apis.xMax = xMax
            apis.yMax = yMax
            this.$store.dispatch('SetApis', apis)
          }

          apiData.source = {
            columns,
            rows
          }
          this.$store.dispatch('SetSelfDataSource', apiData)
        }
        this.updateChartData()
      } else {
        this.$message.error(res.msg)
      }
    }
  }
}
</script>

<style></style>
