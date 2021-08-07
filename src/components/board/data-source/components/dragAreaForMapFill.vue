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
import { visualMapConfig, mapSeries } from '@/config/mapSeries'
import { Loading } from 'element-ui'
import handleReturnChartData from '@/utils/handleReturnChartData'
export default {
  props: {
    type: {
      type: String,
      default: ''
    }, // 区域类型 维度/度量
    fillType: {
      type: String,
      default: ''
    }, // 填充:区域/经纬度
    dimensionType: {
      type: String,
      required: false,
      default: 'normal'
    },
    // 指标/鼠标移入提示
    showType: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      current: {},
      selected: {},
      emptyText: {
        dimensions: {
          normal: '拖入维度',
          latitude: '拖入经度',
          longitude: '拖入纬度'
        },
        measures: '拖入度量',
        label: '拖入维度/度量'
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
          if (
            this.type === 'dimensions' &&
            val.setting.api_data[this.dimensionType]
          ) {
            // 维度
            this.fileList = deepClone(val.setting.api_data[this.dimensionType])
          }
          if (this.type === 'measures' && val.setting.api_data.measures) {
            // 度量
            this.fileList = deepClone(val.setting.api_data.measures)
          }
          if (this.type === 'label' && val.setting.api_data[this.showType]) {
            // 标签
            this.fileList = deepClone(val.setting.api_data[this.showType])
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
              let measure = val.measures.find(item => item.alias === file.alias)
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
        this.fileList[0] = dataFile
        this.getData()
      }
      // 标签
      if (this.type === 'label') {
        this.fileList[0] = dataFile
        this.getData()
      }
      this.isdrag = false
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
      return countryside.properties.center
    },
    // 删除当前维度或者度量
    deleteFile(item, index) {
      this.fileList.splice(index, 1)
      this.getData()
      let current = deepClone(this.currSelected)
      // 重置地图样式配置对应的度量数据
      this.initTargetMeasure()
      // 地区纬度度量为空或者经纬度没有度量，清空数据
      if (
        current.setting.api_data.dimensions.length === 0 &&
        current.setting.api_data.measures.length === 0
      ) {
        // 清空数据
        current.setting.config.series = current.setting.config.series.filter(
          item => item.type === 'scatter'
        )
        this.$delete(current.setting.config, 'visualMap')
      }
      this.$store.dispatch('SetSelfProperty', current.setting.config)
      this.updateChartData()
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
        selected.setting.api_data.measures = this.fileList
      }
      // 度量
      if (this.type === 'label') {
        selected.setting.api_data[this.showType] = this.fileList
      }

      // 构造度量列表
      let dimensionList = []
      if (selected.setting.api_data.normal) {
        dimensionList = [...dimensionList, ...selected.setting.api_data.normal]
      }
      if (selected.setting.api_data.latitude) {
        dimensionList = [
          ...dimensionList,
          ...selected.setting.api_data.latitude
        ]
      }
      if (selected.setting.api_data.longitude) {
        dimensionList = [
          ...dimensionList,
          ...selected.setting.api_data.longitude
        ]
      }
      selected.setting.api_data.dimensions = dimensionList

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

      let apiData = this.currSelected.setting.api_data

      if (
        apiData.dimensions.length === 0 &&
        (!apiData.measures || apiData.measures.length === 0) &&
        apiData.labelDimensions.length === 0 &&
        apiData.labelMeasures.length === 0
      ) {
        selected.datamodelId = 0
        selected.setting.api_data.modelId = 0
        selected.setting.isEmpty = false
        selected.setting.resourceType = ''
        this.updateChartData()
        return
      }
      // 区域需要纬度度量
      if (this.fillType === 'area') {
        if (apiData.dimensions.length === 0 || apiData.measures.length === 0) {
          return
        }
        if (
          apiData.dimensions.some(item => item.status === 1) ||
          apiData.measures.some(item => item.status === 1)
        ) {
          return
        }
      } else {
        // 经纬度两个维度一个度量
        if (apiData.dimensions.length < 2 || apiData.measures.length === 0) {
          return
        }
        if (apiData.measures.some(item => item.status === 1)) {
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
        res.data.fillList = await handleReturnChartData(
          res.data.fillList,
          this.currSelected.setting
        )
        let config = selected.setting.config
        // 重置series
        config.series = config.series.filter(item => item.type === 'scatter')
        let valueList = [] // 数据列表，计算视觉映射最大最小值
        // 类型为区域
        if (this.fillType === 'area') {
          // 只有一个维度，唯一名称
          let alias = apiData.dimensions[0].alias

          // 一个度量对应一个series.data
          apiData.measures.forEach((measure, index) => {
            let showName = `地区名/${alias}` // 指标显示用
            let datas = []
            for (let data of res.data.fillList) {
              let datacontent = {
                name: data[alias],
                value: data[measure.alias],
                // 构造映射数据，给指标提示框内容显示
                [showName]: data[alias], // 地区名/维度
                [alias]: data[alias], // 维度
                [measure.alias]: data[measure.alias] // 度量
              }
              // 存在标签数据加上标签数据
              //   if (apiData.point && apiData.point[0]) {
              //     datacontent[apiData.point[0].alias] =
              //       data[apiData.point[0].alias]
              //   }
              //   if (apiData.over && apiData.over[0]) {
              //     datacontent[apiData.over[0].alias] = data[apiData.over[0].alias]
              //   }
              datas.push(datacontent)
            }
            config.series.unshift(
              Object.assign({}, mapSeries, {
                data: datas,
                name: measure.alias + 'fill',
                pointShowList: [showName],
                tooltipShowList: [alias, measure.alias]
              })
            )
            valueList = datas.map(item => item.value)
          })
        } else {
          let alias = apiData.measures[0].alias
          let datas = []
          // 解析数据，获取经度，纬度，目标值
          for (let data of res.data.fillList) {
            let positionMsg = ''
            // 获取位置信息
            try {
              positionMsg = await reverseAddressResolution([
                data[apiData.latitude[0].alias],
                data[apiData.longitude[0].alias]
              ])

              let datacontent = {
                name: positionMsg.district,
                value: data[alias],
                // 构造映射数据，给指标提示框内容显示
                [apiData.latitude[0].alias]: data[apiData.latitude[0].alias], // 经度
                [apiData.longitude[0].alias]: data[apiData.longitude[0].alias], // 维度
                地区名: positionMsg.district, // 地区名
                [alias]: data[alias] // 度量
              }
              // 已有地图数据直接累加
              let areaData = datas.find(item => item.name === datacontent.name)
              if (areaData) {
                areaData[alias] += datacontent[alias]
                areaData.value += datacontent.value
              } else {
                datas.push(datacontent)
              }
            } catch (err) {
              continue
            }
          }
          if (datas.length === 0) {
            this.$message.error('经纬点解析失败')
            loadingInstance.close()
            return
          }
          config.series.unshift(
            Object.assign({}, mapSeries, {
              data: datas,
              name: alias + 'fill',
              pointShowList: ['地区名'],
              tooltipShowList: [
                apiData.latitude[0].alias,
                apiData.longitude[0].alias,
                alias
              ]
            })
          )
          valueList = datas.map(item => item.value)
        }
        // 区域填充加上视觉映射控制
        config.visualMap = Object.assign({}, visualMapConfig)
        config.visualMap.max = Math.max(...valueList)
        config.visualMap.min = Math.min(...valueList)
        loadingInstance.close()
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
