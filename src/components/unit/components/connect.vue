<template>
  <div class="unit-connect">
    <div class="btn btn-ghost" @click="openBindWindow">
      {{ currentCom.setting.interaction.bindedList.length ? '编辑' : '创建' }}图表联动
    </div>
    <UnitCheckbox
      label="点击时进行图表联动"
      :value="currentCom.setting.style.echart.customIsOpenDataLink"
      @change="value => $emit('change', value)"
    ></UnitCheckbox>

    <!--创建联动弹窗-->
    <a-modal v-model="visible" title="图表联动" @ok="setLinkage">
      <input type="text" :class="['ant-input', 'pick-input']" v-model="keyword" placeholder="请输入搜索内容" />
      <button class="ant-btn ant-btn-primary pick-btn" @click="search">搜索</button>
      <!--模型列表多选-->
      <div class="pick-checkbox-box">
        <div style="height: 100%">
          <a-checkbox :checked="checkAll" @change="onCheckAllChange">全选</a-checkbox>
          <div class="data-title">{{ currentData }}</div>
          <a-checkbox-group class="f-flexcolumn" v-model="bindList" @change="checkSelectAll">
            <div class="f-flexcolumn" v-for="chart in chartList" :key="chart.id">
              <a-checkbox
                style="margin-top: 5px"
                :value="chart.id"
                :disabled="checkHaveBind(chart) || checkBeBinded(chart) || chart.id === currentCom.id"
              >
                {{ chart.setting.style.title.text }}
                <span v-if="chart.id === currentCom.id">(当前报表)</span>
                <span v-else-if="checkBeBinded(chart)">已存在于联动路径中</span>
                <span v-else-if="checkHaveBind(chart)">已被创建联动</span>
              </a-checkbox>
            </div>
          </a-checkbox-group>
          <a-checkbox style="margin-top: 5px" default-checked disabled>
            {{ currentCom.setting.style.title.text }}（当前报表）
          </a-checkbox>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
/**
 * @description 联动设置
 */
import { mapState } from 'vuex';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import BoardType from '@/views/screenManage/screen/setting/default-type';
// 没有图标联动的图表
const noLinkCharts = [
  BoardType.ChartGauge,
  BoardType.ChartRingPie,
  BoardType.QuatoCard,
  BoardType.ChartProgress,
  BoardType.Text,
];
export default {
  name: 'UnitConnect',
  data() {
    return {
      clickLink: false,
      visible: false,
      checkAll: false, // 是否全选标识
      keyword: '', // 搜索关键字
      bindList: [], // 绑定列表
      chartList: [],
    };
  },
  computed: {
    ...mapState({
      // 当前组件
      currentCom: state => state.board.currentCom,
      components: state => state.board.components,
      selectedModelList: state => state.dataModel.selectedModelList,
    }),
    // 显示的绑定列表中有效数据(过滤禁用项，用来判断全选)
    vaildList() {
      return this.toBindList.filter(chart => !this.checkBeBinded(chart) && !this.checkHaveBind(chart));
    },
    // 当前图表对应的模型
    currentData() {
      // 没有使用数据文件
      if (!this.currentCom.setting.data.datamodelId) {
        return '没有符合的结果';
      }
      // 找到当前使用的数据信息
      let obj = this.selectedModelList.find(item => item.tableId === this.currentCom.setting.data.datamodelId);
      return obj.resourceName;
    },
    // 显示的选择列表
    toBindList() {
      let list = this.components.filter(
        item =>
          item.id !== this.currentCom.id &&
          item.setting.data.dataModelId === this.currentCom.setting.data.dataModelId &&
          !noLinkCharts.includes(item.type),
      );
      return list;
    },
  },
  methods: {
    openBindWindow() {
      // 获取可选列表
      this.chartList = this.toBindList.concat();
      // 获取已选列表
      this.bindList = this.currentCom.setting.interaction.bindedList;
      // 检查全选
      this.checkSelectAll();
      this.visible = true;
    },
    // 模糊查询
    search() {
      if (!this.keyword) {
        this.chartList = this.toBindList;
        return;
      }
      this.chartList = this.toBindList.filter(item => item.indexOf(this.keyword) > -1);
    },
    // 点击全选
    onCheckAllChange(e) {
      this.checkAll = e.target.checked;
      this.bindList = e.target.checked ? this.vaildList.map(item => item.id) : [];
    },
    // 多选框变化的时候重新判断全选
    checkSelectAll() {
      this.checkAll = this.bindList.length > 0 && this.bindList.length === this.vaildList.length; // 判断是否全选
    },
    // 检查可选图表是否已经绑定当前图表
    checkBeBinded(chart) {
      let result = this.checkUpperBind(this.currentCom.id, chart.id);
      return result;
    },
    // 往上寻找有没有在绑定路径中
    checkUpperBind(upperChartId, targetChartId) {
      const beBindedId = this.getBeBindedId(upperChartId);
      // 没有被任何图表绑定
      if (!beBindedId) {
        return false;
      }
      // 绑定了当前图表
      if (beBindedId === targetChartId) {
        return true;
      }
      return this.checkUpperBind(beBindedId, targetChartId);
    },
    // 遍历获取图标图标被绑定图表id
    getBeBindedId(chartId) {
      for (let chart of this.components) {
        if (chart.id !== chartId && chart.setting.interaction.bindedList.includes(chartId)) {
          return chart.id;
        }
      }
      return false;
    },
    // 检查可选图表是否已经被其他图表绑定
    checkHaveBind(chart) {
      const beBindedId = this.getBeBindedId(chart.id);
      return beBindedId && beBindedId !== this.currentCom.id;
    },
    // 设置图表联动
    async setLinkage() {
      //  保存被选中图表的联动列表
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Interaction',
        target: this.currentCom,
        store: this.$store,
        eventBus: this.$EventBus,
        interaction: { bindedList: this.bindList },
      });
      this.visible = false;
    },
  },
};
</script>
<style lang="less" scoped>
.data-Interactive {
  color: black;
  padding: 20px;
  .empty {
    margin: 15px 0;
    width: 225px;
    height: 32px;
    border: 1px solid rgba(229, 229, 229, 1);
    border-radius: 4px;
    color: #020510;
    text-align: center;
    line-height: 32px;
    cursor: pointer;
  }
}
.data-title {
  height: 40px;
  line-height: 40px;
  padding-left: 10px;
  margin: 10px 0;
  background: #f5f5f5;
}
</style>
