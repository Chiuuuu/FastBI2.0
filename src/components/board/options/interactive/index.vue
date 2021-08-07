<template>
  <!--互动-->
  <div class="data-Interactive">
    图表联动
    <div class="empty" @click="openBindWindow">
      {{
        currSelected.setting.api_data.interactive &&
        currSelected.setting.api_data.interactive.bindedList &&
        currSelected.setting.api_data.interactive.bindedList.length > 0
          ? '编辑'
          : '创建'
      }}图表联动
    </div>
    点击时进行图表联动
    <a-checkbox v-model="clickLink" @click.native="openLink" />

    <!--创建联动弹窗-->
    <a-modal v-model="visible" title="图表联动" @ok="setLinkage">
      <input
        type="text"
        :class="['ant-input', 'pick-input']"
        v-model="keyword"
        placeholder="请输入搜索内容"
      />
      <button class="ant-btn ant-btn-primary pick-btn" @click="search">
        搜索
      </button>
      <!--模型列表多选-->
      <div class="pick-checkbox-box">
        <b-scrollbar style="height:100%;">
          <a-checkbox :checked="checkAll" @change="onCheckAllChange"
            >全选</a-checkbox
          >
          <div class="data-title">{{ currentData || '没有符合的结果' }}</div>
          <a-checkbox-group
            class="f-flexcolumn"
            v-model="bindList"
            @change="checkSelectAll"
          >
            <div
              class="f-flexcolumn"
              v-for="chart in chartList"
              :key="chart.id"
            >
              <a-checkbox
                style="margin-top:5px"
                :value="chart.id"
                :disabled="
                  checkHaveBind(chart) ||
                    checkBeBinded(chart) ||
                    chart.id === currentSelected
                "
              >
                {{
                  chart.setting.config.title.text ||
                    chart.setting.config.title.content
                }}
                <span v-if="chart.id === currentSelected">(当前报表)</span>
                <span v-else-if="checkBeBinded(chart)">已存在于联动路径中</span>
                <span v-else-if="checkHaveBind(chart)">已被创建联动</span>
              </a-checkbox>
            </div>
          </a-checkbox-group>
          <a-checkbox style="margin-top:5px" default-checked disabled
            >{{
              currSelected.setting.config.title.text ||
                currSelected.setting.config.title.content
            }}（当前报表）</a-checkbox
          >
        </b-scrollbar>
      </div>
    </a-modal>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data() {
    return {
      clickLink: false,
      visible: false,
      checkAll: false, // 是否全选标识
      keyword: '', // 搜索关键字
      bindList: [], // 绑定列表
      chartList: []
    }
  },
  watch: {
    currentSelected: {
      handler(val) {
        if (val) {
          let interactive = this.currSelected.setting.api_data.interactive
          if (interactive && interactive.clickLink) {
            this.clickLink = interactive.clickLink
            return
          }
          this.clickLink = false
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters([
      'currentSelected',
      'currSelected',
      'canvasMap',
      'selectedModelList'
    ]),
    // 拖入一个维度的进入联动选择列
    toBindList() {
      // 排除当前图表id
      let excludeId = this.currentSelected
      let list = this.canvasMap.filter(
        item =>
          item.id !== excludeId &&
          item.datamodelId !== '0' &&
          item.datamodelId === this.currSelected.datamodelId &&
          item.setting.type === '1' && // 维度度量都存在的图表类型才可以图表联动
          item.setting.chartType !== 'v-map' && // 排除地图
          item.setting.chartType !== 'v-multiPie' // 排除嵌套饼图
      )
      return list
    },
    // 显示的绑定列表中有效数据(过滤禁用项，用来判断全选)
    vaildList() {
      return this.toBindList.filter(
        chart => !this.checkBeBinded(chart) && !this.checkHaveBind(chart)
      )
    },
    // 当前图表对应的模型
    currentData() {
      // 没有使用数据文件
      if (
        !this.currSelected.datamodelId ||
        this.currSelected.datamodelId === '0'
      ) {
        return ''
      }
      // 找到当前使用的数据信息
      let obj = this.selectedModelList.find(
        item => item.tableId === this.currSelected.datamodelId
      )
      return obj.resourceName
    }
  },
  methods: {
    ...mapActions(['updateChartData']),
    openBindWindow() {
      // 获取可选列表
      this.chartList = this.toBindList
      // 重置选中列表
      this.bindList = []
      // 获取已选列表
      let apiData = this.currSelected.setting.api_data
      if (apiData.interactive && apiData.interactive.bindedList) {
        this.bindList = apiData.interactive.bindedList
      }
      // 检查全选
      this.checkSelectAll()
      this.visible = true
    },
    // 模糊查询
    search() {
      if (!this.keyword) {
        this.chartList = this.toBindList
        return
      }
      this.chartList = this.toBindList.filter(item => {
        const config = item.setting.config
        const title = config.title || { content: '' }
        const content = title.text || title.content
        return content.indexOf(this.keyword) > -1
      })
    },
    // 点击全选
    onCheckAllChange(e) {
      this.checkAll = e.target.checked
      this.bindList = e.target.checked
        ? this.vaildList.map(item => item.id)
        : []
    },
    // 多选框变化的时候重新判断全选
    checkSelectAll() {
      this.checkAll =
        this.bindList.length > 0 &&
        this.bindList.length === this.vaildList.length // 判断是否全选
    },
    // 是否开启图表联动
    openLink() {
      this.clickLink = !this.clickLink
      let apiData = this.currSelected.setting.api_data
      apiData.interactive = {
        ...apiData.interactive,
        clickLink: this.clickLink
      }
      this.$store.dispatch('SetSelfDataSource', apiData)
      this.updateChartData()
    },
    // 检查可选图表是否已经绑定当前图表
    checkBeBinded(chart) {
      let result = this.checkUpperBind(this.currentSelected, chart.id)
      return result
    },
    // 往上寻找有没有在绑定路径中
    checkUpperBind(upperChartId, targetChartId) {
      let upperChart = this.canvasMap.find(item => item.id === upperChartId)
      let apiData = upperChart.setting.api_data
      // 没有被任何图表绑定
      if (!apiData.interactive || !apiData.interactive.beBinded) {
        return false
      }
      // 绑定了当前图表
      if (apiData.interactive.beBinded === targetChartId) {
        return true
      }
      return this.checkUpperBind(apiData.interactive.beBinded, targetChartId)
    },
    // 检查可选图表是否已经被其他图表绑定
    checkHaveBind(chart) {
      let apiData = chart.setting.api_data
      if (
        apiData.interactive &&
        apiData.interactive.beBinded &&
        apiData.interactive.beBinded !== this.currentSelected
      ) {
        return true
      }
      return false
    },
    // 设置图表联动
    async setLinkage() {
      //  保存被选中图表的联动列表
      let apiData = this.currSelected.setting.api_data
      apiData.interactive = {
        ...apiData.interactive,
        bindedList: this.bindList
      }
      this.$store.dispatch('SetSelfDataSource', apiData)

      let updateList = [this.currSelected]
      // 锁定被关联的列表
      for (let chart of this.toBindList) {
        // 是否被选中
        let isInBindList = this.bindList.some(id => id === chart.id)
        // 获取图表信息
        let chartApiData = chart.setting.api_data
        if (chartApiData.interactive) {
          let interactive = chartApiData.interactive
          // 选中的图标被当前图表绑定
          if (isInBindList) {
            interactive.beBinded = this.currentSelected
          } else if (interactive.beBinded === this.currentSelected) {
            // 取消绑定
            interactive.beBinded = ''
          }
          // 被其他图表绑定的保持不变
        } else if (isInBindList) {
          chartApiData.interactive = { beBinded: this.currentSelected }
        }
        // 联动的数据不保存
        if (chart.setting.api_data.selectData) {
          let cloneChart = Object.assign({}, chart)
          delete cloneChart.setting.api_data.selectData
          updateList.push(cloneChart)
          continue
        }
        updateList.push(chart)
      }
      // 批量保存图表绑定关系
      await this.$server.screenManage.saveAllChart(updateList)
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
@import './screen-interactive.less';
</style>
