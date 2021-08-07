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
    <div v-else class="empty" :class="{ field: isdrag }">
      {{ emptyText[measureType] }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { deepClone } from '@/utils/deepClone'
// import TreeGroupBy from '@/components/board/options/treemap/tree-groupby'
import TreeGroupBy from '@/components/board/options/treemap/tree-groupby'
import { sum, summary } from '@/utils/summaryList'
import { Loading } from 'element-ui'
import _ from 'lodash'
import handleReturnChartData from '@/utils/handleReturnChartData'

export default {
  props: {
    type: {
      type: String,
      default: ''
    }, // 区域类型 维度/度量
    measureType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      current: {},
      selected: {},
      emptyText: {
        current: '拖入当前值',
        total: '拖入最大值'
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
          // 只需要度量
          if (
            this.type === 'measures' &&
            val.setting.api_data[this.measureType]
          ) {
            this.fileList = deepClone(val.setting.api_data[this.measureType])
          }
        }
      },
      deep: true,
      immediate: true
    },
    errorFile: {
      handler(val) {
        if (val) {
          // 只需要度量
          if (this.type === 'measures' && this.fileList) {
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
    ]),
    chartType() {
      return this.currSelected ? this.currSelected.setting.type : ''
    }
  },
  methods: {
    ...mapActions(['saveScreenData', 'updateChartData']),
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
      // 度量
      if (this.dragFile === this.type) {
        // let _alias = this.polymerizeType.find(
        //   x => x.value === dataFile.defaultAggregator
        // )
        // if (_alias) {
        //   dataFile.alias += `(${_alias.name})`
        // }
        dataFile.defaultAggregator = this.judgeDataType(dataFile.dataType)
        this.fileList[0] = dataFile
      }
      this.getData()
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
    // 删除当前维度或者度量
    async deleteFile(event, item, index) {
      this.fileList.splice(index, 1)
      await this.getData()
      let current = deepClone(this.currSelected)
      // 维度度量删除完以后重置该图表数据
      if (current.setting.api_data.measures.length === 0) {
        // 清空数据
        delete current.setting.api_data.source
        this.$store.dispatch('SetSelfDataSource', current.setting.api_data)
        current.setting.config.chartTitle.text = '70%'
        this.$store.dispatch('SetSelfProperty', current.setting.config)
      }
    },
    // 根据维度度量获取数据
    async getData() {
      let selected = this.canvasMap.find(
        item => item.id === this.currentSelected
      )
      selected.setting.api_data[this.measureType] = this.fileList

      // 构造度量列表
      let measuresList = []
      if (selected.setting.api_data.current) {
        measuresList = [...measuresList, ...selected.setting.api_data.current]
      }
      if (selected.setting.api_data.total) {
        measuresList = [...measuresList, ...selected.setting.api_data.total]
      }
      selected.setting.api_data.measures = measuresList

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

      let data = this.currSelected.setting.api_data
      if (data.measures.length === 0) {
        selected.datamodelId = 0
        selected.setting.api_data.modelId = 0
        selected.setting.isEmpty = false
        selected.setting.resourceType = ''
        this.updateChartData()
        return
      }
      let apiData = deepClone(this.currSelected.setting.api_data)
      if (apiData.measures.length < 2) {
        return
      }
      if (data.measures.some(item => item.status === 1)) {
        return
      }

      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: 'body',
        background: 'rgb(255, 255, 255, 0.6)'
      })
      let res = await this.$server.screenManage.getData(selected)
      loadingInstance.close()
      selected.setting.isEmpty = false
      // 数据源被删掉
      if (res.code === 500 && res.msg === 'IsChanged') {
        selected.setting.isEmpty = 'noData'
        this.updateChartData()
        return
      }
      if (res.code === 200) {
        // 环形图只有一条数据
        let datas = res.rows
        // 处理图表数据
        datas = await handleReturnChartData(datas, this.currSelected.setting)

        datas = datas[0]

        // 去掉排序的数据
        if (
          apiData.options &&
          apiData.options.sort &&
          apiData.options.sort.length
        ) {
          let filterArr = []
          apiData.options.sort.forEach(item => {
            filterArr.push(`sort_${item.alias}`)
          })
          datas = _.omit(datas, filterArr)
        }

        let columns = ['type', 'value'] // 维度固定
        let keys = apiData.measures.map(measure => measure.alias)
        // 当前值段
        let rows = [
          {
            type: keys[0],
            value: datas[keys[0]]
          }
        ]

        // 剩余数
        let value = datas[keys[1]] - rows[0].value
        value = value > 0 ? value : 0
        // 剩余段,目标值-当前值
        rows.push({
          type: keys[1],
          value
        })
        apiData.source = {
          columns,
          rows
        }
        // 保存apidata数据
        this.$store.dispatch('SetSelfDataSource', apiData)
        let config = this.currSelected.setting.config
        config.chartTitle.text =
          +((rows[0].value / datas[keys[1]]) * 100).toFixed(2) + '%'
        this.$store.dispatch('SetSelfProperty', config)

        this.updateChartData()
      } else {
        this.$message.error(res.msg)
      }
    }
  }
}
</script>

<style></style>
