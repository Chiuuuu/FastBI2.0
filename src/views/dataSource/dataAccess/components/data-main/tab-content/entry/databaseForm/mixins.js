export default {
  props: {
    form: {
      type: Object,
      default() {
        return {};
      },
    },
    rules: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  methods: {
    handleSetTableName(val) {
      this.$emit('handleSetTableName', val);
    },
  },
};
