import FieldSelectTree from './components/field-tree-select.vue';
const mixinModal = {
  props: {
    isShow: Boolean,
    computeType: String,
    renameData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      bodyStyle: { height: 'calc(100vh - 330px)', 'overflow-y': 'auto', 'min-height': '370px' },
    };
  },
  computed: {
    isEdit() {
      return 'id' in this.renameData;
    },
    sourceDimensions() {
      if (!this.$parent || !this.$parent.detailInfo || !this.$parent.detailInfo.pivotSchema) return [];
      return [...this.$parent.detailInfo.pivotSchema.dimensions, ...this.$parent.cacheDimensions];
    },
    sourceMeasures() {
      if (!this.$parent || !this.$parent.detailInfo || !this.$parent.detailInfo.pivotSchema) return [];
      return [...this.$parent.detailInfo.pivotSchema.measures, ...this.$parent.cacheMeasures];
    },
  },
  components: {
    FieldSelectTree,
  },
};

const mixinTable = {
  props: {
    dimensions: {
      type: Array,
      required: true,
    },
    measures: {
      type: Array,
      required: true,
    },
    tableList: {
      type: Array,
      required: true,
    },
  },
  created() {
    this.handleTreeData();
  },
  data() {
    return {
      showFieldModal: false,
      rows: [],
      tableScroll: { y: 'calc(100vh - 610px)', x: 700 },
      treeDimensions: [],
      treeMeasures: [],
    };
  },
  components: {
    FieldSelectTree,
  },
  methods: {
    handleTreeData() {
      this.treeDimensions = this.handleFilterPivotSchema(this.dimensions);
      this.treeMeasures = this.handleFilterPivotSchema(this.measures);
    },
    // 树结构需要过滤掉已经排序的字段(每次改动列表, 重新处理一遍)
    handleFilterPivotSchema(list) {
      return list.filter(item => !this.tableList.some(n => n.alias === item.alias));
    },
  },
};

export { mixinModal, mixinTable };
