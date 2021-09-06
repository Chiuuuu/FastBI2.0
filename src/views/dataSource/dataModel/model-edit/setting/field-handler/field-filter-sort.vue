<template>
  <a-modal
    width="850px"
    title="筛选排序"
    :visible="isShow"
    :bodyStyle="bodyStyle"
    :maskClosable="false"
    :keyboard="false"
    @ok="handleOk"
    @cancel="handleClose"
  >
    <a-tabs default-active-key="1" @change="changeTab">
      <a-tab-pane key="1" tab="筛选">
        <FieldFilter
          ref="tab1"
          :dimensions="sourceDimensions.filter(item => item.status === 0)"
          :measures="sourceMeasures.filter(item => item.status === 0)"
          :pivotSchema="pivotSchema"
          :table-list="filterListBackup"
          @insert="item => filterListBackup.push(item)"
          @delete="index => filterListBackup.splice(index, 1)"
          @edit="(data, index) => filterListBackup.splice(index, 1, data)"
        />
      </a-tab-pane>
      <a-tab-pane key="2" tab="排序">
        <FieldSort
          ref="tab2"
          :dimensions="sourceDimensions.filter(item => item.status === 0)"
          :measures="sourceMeasures.filter(item => item.status === 0)"
          :table-list="sortListBackup"
          @insert="item => sortListBackup.push(item)"
          @delete="index => sortListBackup.splice(index, 1)"
          @edit="handleEditSortList"
        />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex';
import { mixinModal } from './mixins';
import FieldFilter from './components/field-filter.vue';
import FieldSort from './components/field-sort.vue';
import cloneDeep from 'lodash/cloneDeep';
export default {
  name: 'fieldFilterSort',
  mixins: [mixinModal],
  components: {
    FieldFilter,
    FieldSort,
  },
  props: {
    detailInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      // 深拷贝对象, 因为有确定和取消, 确定时才最终确定列表
      filterListBackup: [],
      sortListBackup: [],
    };
  },
  computed: {
    ...mapState({
      modelId: state => state.dataModel.modelId, // 选中的菜单id
      addModelId: state => state.dataModel.addModelId, // 新增的模型id()
    }),
    model() {
      return this.$route.query.type;
    },
    pivotSchema() {
      return [].concat(this.sourceDimensions).concat(this.sourceMeasures);
    },
  },
  watch: {
    isShow(val) {
      if (val) {
        this.filterListBackup = cloneDeep(this.detailInfo.modelPivotschemaRule.filterRules);
        this.sortListBackup = cloneDeep(this.detailInfo.modelPivotschemaRule.sortRules);
      }
    },
  },
  methods: {
    changeTab(key) {
      const ref = this.$refs['tab' + key];
      ref && ref.handleTreeData();
    },
    handleClose() {
      this.$emit('close');
    },
    handleOk() {
      // 确定时, 传递筛选排序的字段
      this.$emit('handleSaveFilterSort', {
        fieldFilterList: this.filterListBackup,
        fieldSortList: this.sortListBackup,
      });
      this.$emit('close');
    },
    // 处理排序顺序
    handleEditSortList(index, type) {
      if (type === 'up') {
        this.sortListBackup[index - 1].displayOrder++;
        const record = this.sortListBackup.splice(index, 1)[0];
        record.displayOrder--;
        this.sortListBackup.splice(index - 1, 0, record);
      } else if (type === 'down') {
        this.sortListBackup[index + 1].displayOrder--;
        const record = this.sortListBackup.splice(index, 1)[0];
        record.displayOrder++;
        this.sortListBackup.splice(index + 1, 0, record);
      }
    },
  },
};
</script>

<style scoped></style>
