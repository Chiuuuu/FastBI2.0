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
        :class="['field', 'under-level', { error: item.status === 1 }]"
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
            <a-menu-item key="3" @click.native="deleteFile(item, index)"
              >移除</a-menu-item
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
    <div v-else class="empty under-level" :class="{ field: isdrag }">
      {{ emptyText[type][dimensionType] || emptyText[type] }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { deepClone } from '@/utils/deepClone'
import { sum, summary } from '@/utils/summaryList'
import geoJson from '@/utils/guangdong.json'
import reverseAddressResolution from '@/utils/reverseAddressResolution'
import { dotSeries } from '@/config/mapSeries'
import { Loading } from 'element-ui'
import handleReturnChartData from '@/utils/handleReturnChartData'
export default {
  props: {
    type: {
      type: String,
      default: ''
    }, // 区域类型 维度/度量
    labelType: {
      type: String,
      default: ''
    }, // 标记点:区域/经纬度
    dimensionType: {
      type: String,
      required: false,
      default: 'labelNormal'
    }
  },
  data() {
    return {
      current: {},
      selected: {},
      emptyText: {
        dimensions: {
          labelNormal: '拖入维度',
          labelLatitude: '拖入经度',
          labelLongitude: '拖入纬度'
        },
        measures: '拖入度量'
      },
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
      strornum: '',
      isdrag: false, // 是否拖拽中
      fileList: [] // 维度字段数组
    }
  },
  inject: ['errorFile', 'initTargetMeasure'],
  watch: {
    currSelected: {
      handler(val) {
        if (val) {
          // 当前选中的图表显示维度度量的数据
          this.fileList = []
          if (
            this.type === 'dimensions' &&
            val.setting.api_data[this.dimensionType]
          ) {
            // 维度
            this.fileList = deepClone(val.setting.api_data[this.dimensionType])
          }
          if (this.type === 'measures' && val.setting.api_data.labelMeasures) {
            // 度量
            this.fileList = deepClone(val.setting.api_data.labelMeasures)
          }
        }
      },
      deep: true,
      immediate: true
    },
    errorFile: {
      handler(val) {
        if (val) {
          if (this.type === 'dimensions' && this.fileList) {
            // 维度
            this.fileList.forEach(file => {
              let dimension = val.labelDimensions.find(
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
              let measure = val.labelMeasures.find(
                item => item.alias === file.alias
              )
              if (measure && measure.status === 1) {
                file.status = measure.status
              }
            })
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
    ])
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
      dataFile.showMore = false // 是否点击显示更多
      if (this.type === 'dimensions' && this.dragFile === this.type) {
        // 维度暂时只能拉入一个字段
        this.fileList[0] = dataFile
        this.getData()
      }
      // 度量
      if (this.type === 'measures' && this.dragFile === this.type) {
        // let _alias = this.polymerizeType.find(
        //   x => x.value === dataFile.defaultAggregator
        // )
        // dataFile.alias += `(${_alias.name})`
        dataFile.defaultAggregator = this.judgeDataType(dataFile.dataType)
        // 区域一个维度一个度量，经纬度度量经度维度值
        this.fileList[0] = dataFile
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
      return countryside.properties.centroid
    },
    // 删除当前维度或者度量
    deleteFile(item, index) {
      this.fileList.splice(index, 1)
      this.getData()
      let current = deepClone(this.currSelected)
      // 重置地图样式配置对应的度量数据
      this.initTargetMeasure()
      if (
        current.setting.api_data.labelDimensions.length === 0 &&
        current.setting.api_data.labelMeasures.length === 0
      ) {
        // 清空数据
        current.setting.config.series = current.setting.config.series.filter(
          item => item.type === 'map'
        )
        this.$store.dispatch('SetSelfProperty', current.setting.config)
        this.updateChartData()
      }
    },
    // 根据维度度量获取数据
    async getData() {
      let selected = this.canvasMap.find(
        item => item.id === this.currentSelected
      )
      // 维度
      if (this.type === 'dimensions') {
        selected.setting.api_data[this.dimensionType] = this.fileList
      }
      // 度量
      if (this.type === 'measures') {
        selected.setting.api_data.labelMeasures = this.fileList
      }

      // 构造度量列表
      let dimensionList = []
      if (selected.setting.api_data.labelNormal) {
        dimensionList = [
          ...dimensionList,
          ...selected.setting.api_data.labelNormal
        ]
      }
      if (selected.setting.api_data.labelLatitude) {
        dimensionList = [
          ...dimensionList,
          ...selected.setting.api_data.labelLatitude
        ]
      }
      if (selected.setting.api_data.labelLongitude) {
        dimensionList = [
          ...dimensionList,
          ...selected.setting.api_data.labelLongitude
        ]
      }
      selected.setting.api_data.labelDimensions = dimensionList

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
      this.updateChartData()

      let apiData = deepClone(this.currSelected.setting.api_data)

      if (
        apiData.dimensions.length === 0 &&
        apiData.measures.length === 0 &&
        apiData.labelDimensions.length === 0 &&
        (!apiData.labelMeasures || apiData.labelMeasures.length === 0)
      ) {
        selected.datamodelId = 0
        selected.setting.api_data.modelId = 0
        selected.setting.isEmpty = false
        selected.setting.resourceType = ''
        this.updateChartData()
        return
      }
      // 区域需要纬度度量
      if (this.labelType === 'area') {
        if (
          apiData.labelDimensions.length === 0 ||
          apiData.labelMeasures.length === 0
        ) {
          return
        }
        if (
          apiData.labelDimensions.some(item => item.status === 1) ||
          apiData.labelMeasures.some(item => item.status === 1)
        ) {
          return
        }
      } else {
        // 经纬度两个维度一个度量
        if (
          apiData.labelDimensions.length < 2 ||
          apiData.labelMeasures.length === 0
        ) {
          return
        }
        if (apiData.labelMeasures.some(item => item.status === 1)) {
          return
        }
      }

      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: 'body',
        background: 'rgb(255, 255, 255, 0.6)'
      })
      let params = deepClone(selected)
      delete params.setting.apis.mapOrigin
      let res = await this.$server.screenManage.getData(params)
      selected.setting.isEmpty = false
      // 数据源被删掉
      if (res.code === 500 && res.msg === 'IsChanged') {
        selected.setting.isEmpty = 'noData'
        this.updateChartData()
        loadingInstance.close()
        return
      }
      if (res.code === 200) {
        res.data.labelList = await handleReturnChartData(
          res.data.labelList,
          this.currSelected.setting
        )

        apiData.returnDataLabel = res.data.labelList
        let config = selected.setting.config
        // 重置series
        config.series = config.series.filter(item => item.type === 'map')
        // 类型为区域
        if (this.labelType === 'area') {
          // 只有一个维度，唯一名称
          let alias = apiData.labelDimensions[0].alias
          // 一个度量对应一个series.data
          apiData.labelMeasures.forEach((measure, index) => {
            let showName = `地区名/${alias}` // 指标显示用
            let datas = []
            for (let item of res.data.labelList) {
              // 抓取区域坐标
              let center = this.getCenterCoordinate(item[alias])
              // 找不到对应坐标跳过
              if (!center) {
                continue
              }
              datas.push({
                name: item[alias],
                value: center.concat(item[measure.alias]), // 链接数组，坐标和值
                // 构造映射数据，给指标提示框内容显示
                [showName]: item[alias], // 地区名/维度
                [alias]: item[alias], // 维度
                [measure.alias]: item[measure.alias] // 度量
              })
            }
            config.series.push(
              Object.assign({}, dotSeries, {
                data: datas,
                name: measure.alias,
                pointShowList: [showName],
                tooltipShowList: [alias, measure.alias]
              })
            )
          })
        } else {
          let alias = apiData.labelMeasures[0].alias
          let datas = []
          // 解析数据，获取经度，纬度，目标值
          for (let data of res.data.labelList) {
            let positionMsg = ''
            try {
              // 获取位置信息
              let position = [
                data[apiData.labelLatitude[0].alias],
                data[apiData.labelLongitude[0].alias]
              ]
              positionMsg = await reverseAddressResolution(position)
              datas.push({
                name: positionMsg.district,
                value: [
                  parseFloat(position[0]),
                  parseFloat(position[1])
                ].concat(data[alias]),
                // 构造映射数据，给指标提示框内容显示
                [apiData.labelLatitude[0].alias]:
                  data[apiData.labelLatitude[0].alias], // 经度
                [apiData.labelLongitude[0].alias]:
                  data[apiData.labelLongitude[0].alias], // 维度
                地区名: positionMsg.district, // 地区名
                [alias]: data[alias] // 度量
              })
            } catch (err) {
              continue
            }
          }
          if (datas.length === 0) {
            this.$message.error('经纬点解析失败')
            loadingInstance.close()
            return
          }
          config.series.push(
            Object.assign({}, dotSeries, {
              data: datas,
              name: alias,
              pointShowList: ['地区名'],
              tooltipShowList: [
                apiData.labelLatitude[0].alias,
                apiData.labelLongitude[0].alias,
                alias
              ]
            })
          )
        }
        loadingInstance.close()
        let scatters = config.series.filter(item => item.type === 'scatter')
        config.legend.data = scatters.map(item => item.name)
        this.$store.dispatch('SetSelfProperty', config)
        this.$store.dispatch('SetSelfDataSource', apiData)
        this.updateChartData()
      } else {
        this.$message.error(res.msg)
        loadingInstance.close()
      }
    }
  }
}
</script>

<style></style>
