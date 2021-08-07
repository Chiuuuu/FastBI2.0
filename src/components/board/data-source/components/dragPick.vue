<template>
  <div
    class="dragArea"
    :class="{
      'dragable-vaild': type === dragFile || (isdrag && type === 'tableList')
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
        <a-dropdown :trigger="['click', 'contextmenu']" v-model="item.showMore">
          <a-icon class="icon-more" type="caret-down" />
          <a-menu slot="overlay" @click="deleteFile(item, index)">
            <a-menu-item key="3">移除</a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-tooltip :title="item.alias">
          <span ref="itemName" class="field-text" @click="showSelect(item)">{{
            item.alias
          }}</span>
        </a-tooltip>
      </div>
    </div>
    <div class="empty" :class="{ field: isdrag }">拖入字段</div>

    <a-modal v-model="screenVisible" title="数据筛选">
      <template slot="footer">
        <a-button key="cancel" @click="screenVisible = false">
          取消
        </a-button>
        <a-button
          key="submit"
          type="primary"
          :style="{
            background: isNoSelectData ? 'grey' : '#617BFF'
          }"
          @click="handleOk"
        >
          确定
        </a-button>
      </template>
      <div v-if="currentFile.file === 'dimensions'">
        <a-radio-group
          v-model="currentFile.operation"
          @change="isEmpty = false"
        >
          <a-radio :value="'list'">列表</a-radio>
          <a-radio :value="'manual'">手动</a-radio>
        </a-radio-group>
        <br />
        <input
          v-show="currentFile.operation === 'list'"
          type="text"
          :class="['ant-input', 'pick-input', { redborder: isEmpty }]"
          v-model="listValue"
          placeholder="请输入搜索内容"
          @input="isEmpty = false"
        />
        <button
          v-show="currentFile.operation === 'list'"
          class="ant-btn ant-btn-primary pick-btn"
          @click="search"
        >
          查询
        </button>
        <input
          v-show="currentFile.operation === 'manual'"
          type="text"
          :class="['ant-input', 'pick-input', { redborder: isEmpty }]"
          v-model="manualValue"
          placeholder="请输入内容"
          @input="isEmpty = false"
        />
        <button
          v-show="currentFile.operation === 'manual'"
          class="ant-btn ant-btn-primary"
          @click="addManualProperty"
        >
          添加
        </button>
        <div
          class="pick-checkbox-box hasborder"
          v-show="currentFile.operation === 'list'"
        >
          <b-scrollbar style="height:100%;">
            <a-checkbox :checked="checkAll" @change="onCheckAllChange"
              >全选</a-checkbox
            >
            <a-checkbox-group
              class="f-flexcolumn"
              v-model="currentFile.checkedList"
              :options="currentFile.searchList"
              @change="onChange"
            />
          </b-scrollbar>
        </div>
        <!--手动筛选-->
        <div
          class="pick-checkbox-box"
          v-show="currentFile.operation === 'manual'"
        >
          <b-scrollbar style="height:100%;">
            <div
              class="pick-property"
              v-for="(item, index) in currentFile.manualList"
              :key="item"
            >
              <span>{{ item }}</span>
              <icon-font
                class="pick-del"
                @click="deleteManualProperty(index)"
                type="icon-guanbi"
              />
              <!-- <span class="pick-del" @click="deleteManualProperty(index)"
                >删除</span
              > -->
            </div>
          </b-scrollbar>
        </div>
      </div>
      <!--拖动的是度量-->
      <div v-else>
        <button class="ant-btn ant-btn-primary" @click="addCondition">
          添加条件
        </button>
        <div class="pick-checkbox-box" style="margin:0;padding:0">
          <b-scrollbar style="height:100%;">
            <br />
            <div
              :class="['pick-condition-box']"
              v-for="(item, index) in currentFile.conditionList"
              :key="index"
            >
              <a-select
                :class="['pick-select', 'has-margin']"
                v-model="item.condition"
                @change="changeCondition(item)"
              >
                <a-select-option
                  v-for="option in conditionOptions"
                  :key="option.label"
                  :value="option.op"
                  >{{ option.label }}</a-select-option
                >
              </a-select>
              <a-input-number
                v-model="item.firstValue"
                size="default"
                placeholder="请输入数值"
                class="inputnumber"
                style="text-overflow: clip;"
              ></a-input-number>
              <span class="symbol" v-show="item.condition === 'range'">-</span>
              <a-input-number
                v-show="item.condition === 'range'"
                v-model="item.secondValue"
                size="default"
                placeholder="请输入数值"
                class="inputnumber"
                style="text-overflow: clip;"
              ></a-input-number>
              <icon-font
                @click="delectCondition(index)"
                class="icon"
                type="icon-guanbi"
              />
              <!-- <a-icon
                @click="delectCondition(index)"
                class="icon"
                type="close"
              /> -->
            </div>
          </b-scrollbar>
        </div>
      </div>
      <a-radio-group v-model="currentFile.type">
        <a-radio :value="1">只显示{{ dragFile }}</a-radio>
        <a-radio :value="2">排除</a-radio>
      </a-radio-group>
    </a-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { deepClone } from '@/utils/deepClone'
import { sum, summary } from '@/utils/summaryList'
import TreeGroupBy from '@/components/board/options/treemap/tree-groupby'
import navigateList from '@/config/navigate' // 导航条菜单
import _ from 'lodash'
import { Loading } from 'element-ui'
import { Icon } from 'ant-design-vue'
import handleReturnChartData from '@/utils/handleReturnChartData'
const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2276651_kjhn0ldks1j.js'
}) // 引入iconfont
export default {
  props: {
    type: {
      type: String,
      default: ''
    } // 区域类型 维度/度量
  },
  data() {
    return {
      isExist: false,
      screenVisible: false, // 弹窗显示
      listValue: '', // 列表模糊查询输入值
      manualValue: '', // 手动输入值
      conditionOptions: [
        { label: '范围', op: 'range' },
        { label: '大于', op: 'more' },
        { label: '小于', op: 'less' },
        { label: '大于等于', op: 'moreOrEqual' },
        { label: '小于等于', op: 'lessOrEqual' },
        { label: '等于', op: 'equal' },
        { label: '不等于', op: 'notEqual' }
      ], // 条件选项
      checkAll: false, // 是否全选标识
      currentFile: {}, // 当前选中的维度/度量数据
      current: {},
      isdrag: false, // 是否拖拽中
      fileList: [], // 维度字段数组
      isVaild: false, //
      isEmpty: false // 控制输入框边框样式，空输入变红
    }
  },
  inject: ['errorFile'],
  components: {
    IconFont
  },
  watch: {
    currSelected: {
      handler(val) {
        if (val) {
          this.fileList = []
          // 当前选中的图表数据筛选的数据
          if (
            val.setting.api_data.options &&
            val.setting.api_data.options.fileList
          ) {
            this.fileList = deepClone(val.setting.api_data.options.fileList)
          }
        }
      },
      deep: true,
      immediate: true
    },
    errorFile: {
      handler(val) {
        if (val) {
          if (this.fileList) {
            let list = val.dimensions.concat(val.measures)
            this.fileList.forEach(file => {
              let li = list.find(item => item.alias === file.alias)
              if (li && li.status === 1) {
                file.status = li.status
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
      'canvasMap'
    ]),
    chartType() {
      return this.currSelected ? this.currSelected.setting.type : ''
    },
    isNoSelectData() {
      if (
        Object.keys(this.currentFile).length > 0 &&
        this.currentFile.file === 'dimensions' &&
        ((this.currentFile.operation === 'list' &&
          this.currentFile.checkedList.length === 0) ||
          (this.currentFile.operation === 'manual' &&
            this.currentFile.manualList.length === 0))
      ) {
        return true
      }
      return false
    }
  },
  methods: {
    ...mapActions(['updateChartData']),
    // 将拖动的维度到所选择的放置目标节点中
    async handleDropOnFilesWD(event) {
      this.isExist = false
      let dataFile = JSON.parse(event.dataTransfer.getData('dataFile'))

      // 验重
      if (this.fileList.some(item => dataFile.alias === item.alias)) {
        this.$message.error(`${dataFile.alias}已存在`)
        this.isdrag = false
        return
      }

      dataFile.showMore = false // 是否点击显示更多

      // 对应的是维度
      if (dataFile.file === 'dimensions') {
        // 获取维度对应字段列表
        let params = {
          datamodelId: dataFile.screenTableId,
          resourceType: dataFile.resourceType,
          dimensions: [dataFile]
        }
        let res = await this.$server.screenManage.getDataPick(params)
        // 模型数据被删
        if (res.code === 500 && res.msg === 'IsChanged') {
          this.$message.error('模型数据不存在')
          this.isdrag = false
          return
        }
        if (res.code === 200) {
          // 过滤空字段
          // 拆维度列表
          let list = []
          res.rows.forEach(item => {
            if (item) {
              list.push(Object.values(item)[0].toString())
            }
          }) // 维度全字段列表
          dataFile.originList = list
          dataFile.searchList = dataFile.originList
          dataFile.checkedList = [] // 勾选的字段列表
          dataFile.manualList = [] // 手动输入列表
          dataFile.operation = 'list' // 列表/手动,'list'/'manual'
        } else {
          res.msg && this.$message.error(res.msg)
          this.isdrag = false
          return
        }
      } else {
        // 对应的是度量
        let { pivotschemaId, resourceType, dataType } = dataFile
        // 数据接入类型直接判断，dataType是不是BIGINT/DOUBLE类型
        if (
          dataType !== 'BIGINT' &&
          dataType !== 'DECIMAL' &&
          dataType !== 'DOUBLE'
        ) {
          this.$message.error('当前字段为文本类型，无法进行数值区间筛选')
          this.isdrag = false
          return
        }
        // 通过验证初始化条件列表
        dataFile.conditionList = []
      }
      dataFile.type = 1 // 只显示、排除,'include'/'exclude'

      // 显示弹窗
      this.currentFile = dataFile
      this.screenVisible = true
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
    // 点击右键显示更多
    showMore(item) {
      item.showMore = true
    },
    // 列表模糊查询
    search() {
      if (!this.listValue) {
        this.currentFile.searchList = this.currentFile.originList
        this.isEmpty = true
        return
      }
      this.currentFile.searchList = this.currentFile.originList.filter(
        item => item.indexOf(this.listValue) > -1
      )
    },
    // 点击再次打开数据筛选弹窗
    async showSelect(item) {
      this.isExist = true
      this.currentFile = item
      this.listValue = '' // 列表模糊查询输入值
      this.manualValue = '' // 手动输入值
      if (item.file === 'dimensions') {
        let params = {
          datamodelId: this.currentFile.screenTableId,
          resourceType: this.currentFile.resourceType,
          dimensions: [this.currentFile]
        }
        let res = await this.$server.screenManage.getDataPick(params)
        this.currentFile.originList = res.rows.map(item =>
          Object.values(item)[0].toString()
        ) // 维度全字段列表
        this.currentFile.searchList = this.currentFile.originList
        this.onChange()
      }
      this.screenVisible = true
    },
    // 多选框变化的时候重新判断全选
    onChange() {
      this.checkAll =
        this.currentFile.checkedList.length ===
        this.currentFile.originList.length // 判断是否全选
    },
    // 点击全选
    onCheckAllChange(e) {
      this.checkAll = e.target.checked
      this.currentFile.checkedList = e.target.checked
        ? this.currentFile.originList
        : []
    },
    // 手动，添加字段
    addManualProperty() {
      if (!this.manualValue) {
        this.isEmpty = true
        return
      }
      // 本身不存在就添加进去
      if (this.currentFile.manualList.indexOf(this.manualValue) === -1) {
        this.currentFile.manualList.push(this.manualValue)
      } else {
        this.$message.error(`${this.manualValue}已存在`)
      }
    },
    deleteManualProperty(index) {
      this.currentFile.manualList.splice(index, 1)
    },
    // 度量添加条件
    addCondition() {
      if (this.currentFile.conditionList.length < 5) {
        this.currentFile.conditionList.push({
          condition: 'range', // 条件选择，显示
          action: '', // 条件选择，实际
          firstValue: '',
          secondValue: ''
        })
      } else {
        this.$message.error('限制只能添加5个')
      }
    },
    changeCondition(item, value) {
      // 只有范围有两个输入框
      if (value !== '范围') {
        delete item.secondValue
      }
    },
    delectCondition(index) {
      this.currentFile.conditionList.splice(index, 1)
    },
    async handleOk() {
      if (this.isNoSelectData) {
        this.screenVisible = false
        return
      }
      // 度量没有添加条件不能确定
      if (
        this.currentFile.file === 'measures' &&
        !this.currentFile.conditionList.length
      ) {
        this.screenVisible = false
        return
      }
      let apiData = deepClone(this.currSelected.setting.api_data)

      let dimensionsLimitList = []
      let measuresLimitList = []
      // 处理维度筛选信息
      if (this.currentFile.file === 'dimensions') {
        // 获取筛选列表
        this.currentFile.value =
          this.currentFile.operation === 'list'
            ? this.currentFile.checkedList
            : this.currentFile.manualList
        delete this.currentFile.originList // 不上传，再点击的时候重新获取
        delete this.currentFile.searchList // 不上传，模糊查询用的
        if (this.isExist) {
          let file = this.fileList.find(
            item => item.alias === this.currentFile.alias
          )
          file = this.currentFile
        } else {
          this.fileList.push(this.currentFile)
        }
      } else {
        if (
          this.currentFile.conditionList.some(
            item =>
              !item.firstValue ||
              (item.condition === 'range' && !item.secondValue)
          )
        ) {
          this.$message.error('请输入筛选数值')
          return
        }
        // 处理度量筛选数据
        // 如果是排除的，action取补集符号
        this.currentFile.conditionList.forEach(item => {
          if (!item.firstValue) {
            this.$message.error('请输入筛选数值')
            return
          }
          if (item.condition === 'range' && !item.secondValue) {
            this.$message.error('请输入范围第二个筛选数值')
            return
          }
          switch (item.condition) {
            case 'range':
              item.action = item.condition
              break
            case 'more':
              item.action =
                this.currentFile.type === 1 ? item.condition : 'lessOrEqual'
              break
            case 'less':
              item.action =
                this.currentFile.type === 1 ? item.condition : 'moreOrEqual'
              break
            case 'moreOrEqual':
              item.action =
                this.currentFile.type === 1 ? item.condition : 'less'
              break
            case 'lessOrEqual':
              item.action =
                this.currentFile.type === 1 ? item.condition : 'more'
              break
            case 'equal':
              item.action =
                this.currentFile.type === 1 ? item.condition : 'notEqual'
              break
            case 'notEqual':
              item.action =
                this.currentFile.type === 1 ? item.condition : 'equal'
              break
          }
        })

        if (this.isExist) {
          let file = this.fileList.find(
            item => item.alias === this.currentFile.alias
          )
          file = this.currentFile
        } else {
          this.fileList.push(this.currentFile)
        }
      }

      // 关闭弹窗
      this.screenVisible = false

      // 构造dataDimensionsLimit,dataDimensionsLimit列表
      this.fileList.forEach(item => {
        if (item.file === 'dimensions') {
          let { pivotschemaId, type, dataType, value, name } = item
          dimensionsLimitList.push({
            pivotschemaId,
            type,
            dataType,
            value,
            name
          })
        } else {
          let { pivotschemaId, type, dataType, conditionList, name } = item
          measuresLimitList.push({
            pivotschemaId,
            type,
            dataType,
            name,
            value: conditionList
          })
        }
      })

      let options = {
        fileList: this.fileList,
        dimensionsLimit: dimensionsLimitList,
        measuresLimit: measuresLimitList
      }
      apiData.options = { ...apiData.options, ...options }
      this.$store.dispatch('SetSelfDataSource', apiData)

      await this.updateChartData()
      this.getData()
    },
    // 删除当前维度或者度量
    async deleteFile(item, index) {
      this.fileList.splice(index, 1)
      let apiData = deepClone(this.currSelected.setting.api_data)
      apiData.options.fileList = this.fileList
      if (item.file === 'dimensions') {
        _.pullAllBy(apiData.options.dimensionsLimit, [item], 'pivotschemaId')
      } else {
        _.pullAllBy(apiData.options.measuresLimit, [item], 'pivotschemaId')
      }
      this.$store.dispatch('SetSelfDataSource', apiData)
      await this.updateChartData()
      this.getData()
    },
    // 根据维度度量获取数据
    async getData() {
      let apiData = deepClone(this.currSelected.setting.api_data)
      let type = this.currSelected.setting.type
      if (type === '1') {
        if (apiData.dimensions.length === 0 || apiData.measures.length === 0) {
          return
        }
        if (
          apiData.dimensions.some(item => item.status === 1) ||
          apiData.measures.some(item => item.status === 1)
        ) {
          return
        }
      }
      if (type === '2') {
        if (apiData.measures.length === 0) {
          return
        }
        if (
          this.currSelected.setting.chartType === 'v-ring' &&
          apiData.measures.length < 2
        ) {
          return
        }
        if (apiData.measures.some(item => item.status === 1)) {
          return
        }
      }
      if (type === '3') {
        if (apiData.tableList.length === 0) {
          return
        }
        if (apiData.tableList.some(item => item.status === 1)) {
          return
        }
      }

      let selected = this.canvasMap.find(
        item => item.id === this.currentSelected
      )

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
        // 查不到数据
        if (res.rows.length === 0) {
          // 清空数据
          apiData.source.columns = []
          apiData.source.rows = []
          this.$store.dispatch('SetSelfDataSource', apiData)
          this.updateChartData()
          return
        }

        let datas = res.rows

        // 处理图表数据
        datas = await handleReturnChartData(datas, this.currSelected.setting)

        // 矩形树图数据处理
        if (this.currSelected.setting.chartType === 'v-treemap') {
          let setting = deepClone(this.currSelected.setting)
          let config = setting.config
          const tree = new TreeGroupBy(
            res.rows,
            setting.api_data.dimensions.map(item => item.alias),
            setting.api_data.measures
          )
          TreeGroupBy.handleLeafValue(tree.tree)
          config.series.data = tree.tree
          config.series.visualMaxList = tree.max
          config.visualMap.max = tree.max[0]

          // 若删除了维度, 且刚好指针指向了维度, 则切换映射类型
          let index = config.series.recDimensionIndex || 0
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
          return
        }
        // 文本框
        if (this.currSelected.setting.chartType === 'v-text') {
          this.$set(this.currSelected.setting.api_data, 'refreshData', datas)
          this.currSelected.setting.api_data.source = datas
          return
        }
        if (this.currSelected.setting.chartType === 'v-tables') {
          let columns = []
          apiData.tableList.forEach(item => {
            columns.push({
              title: item.alias,
              dataIndex: item.alias,
              key: item.alias
            })
          })
          let rows = datas
          if (rows.length > 10) {
            rows.length = 10
          }
          apiData.source = {
            columns,
            rows
          }
          this.$store.dispatch('SetSelfDataSource', apiData)
        } else if (this.currSelected.setting.chartType === 'v-sun') {
          apiData.source.rows = res.rows
          this.$store.dispatch('SetSelfDataSource', apiData)
          this.updateChartData()
        } else {
          // 仪表盘/环形图 只显示度量
          if (this.chartType === '2') {
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
            // 环形图
            if (this.currSelected.setting.chartType === 'v-ring') {
              let keys = apiData.measures.map(measure => measure.alias)
              // 当前值段
              rows = [
                {
                  type: keys[0],
                  value: datas[0][keys[0]]
                }
              ]
              // 剩余数
              let value = datas[0][keys[1]] - rows[0].value
              value = value > 0 ? value : 0
              // 剩余段,目标值-当前值
              rows.push({
                type: keys[1],
                value
              })
              let config = this.currSelected.setting.config
              config.title.text =
                +((rows[0].value / datas[0][keys[1]]) * 100).toFixed(2) + '%'
              this.$store.dispatch('SetSelfProperty', config)
            }
            apiData.source = {
              columns,
              rows
            }
            // 保存apidata数据
            this.$store.dispatch('SetSelfDataSource', apiData)
            // 如果是仪表盘，第二个度量是目标值（进度条最大值）
            if (
              this.currSelected.setting.chartType === 'v-gauge' &&
              apiData.measures[1]
            ) {
              let goalTotal = sum(datas, apiData.measures[1].alias)
              let config = deepClone(this.currSelected.setting.config)
              config.series.max = goalTotal
              this.$store.dispatch('SetSelfProperty', config)
            }
            //   this.updateChartData()
            return
          }

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
          // 嵌套饼图设置apis
          if (this.currSelected.setting.chartType === 'v-multiPie') {
            // name是各维度数据拼接，value是分类汇总过的数值
            columns = ['name', 'value']
            const apis = deepClone(this.currSelected.setting.apis)
            let level = []
            // 一个维度是一层饼
            dimensionKeys.forEach(item => {
              // 根据当前维度分类得到的列表
              let list = summary(res.rows, item, measureKeys[0]) // 嵌套饼图度量只有一个，直接取第一个数
              rows = rows.concat(list) // 把所有维度分类出来的数组进行拼接（v-charts配置格式要求）

              level.push(list.map(obj => obj.name)) // 按维度分层
            })
            apis.level = level
            this.$store.dispatch('SetApis', apis)
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
          if (
            this.currSelected.setting.chartType === 'v-scatter' &&
            apiData.dimensions.length === 1 &&
            apiData.measures.length === 2
          ) {
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
          console.log(apiData)
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
