<template>
  <div class="field-select" @click="handleClick">
    <span class="field-type">{{ formatField(item.dataType) }}</span>
    <span>{{ item.title }}</span>
    <div class="caret-down"></div>
  </div>
</template>

<script>
import ContextMenu from '@/components/dataSource/contextmenu';

export default {
  props: {
    // contextmenus: Array,
    item: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      contextmenus: [
        {
          name: '转换为整数',
          dataType: 'Int64',
          onClick: this.switchFieldType,
        },
        {
          name: '转换为小数',
          dataType: 'Float64',
          onClick: this.switchFieldType,
        },
        // {
        //   name: '转换为数值',
        //   dataType: 'Decimal64(2)',
        //   onClick: this.switchFieldType
        // },
        {
          name: '转换为字符串',
          dataType: 'String',
          onClick: this.switchFieldType,
        },
        {
          name: '转换为日期',
          dataType: 'Date',
          onClick: this.switchFieldType,
        },
        {
          name: '转换为日期时间',
          dataType: 'DateTime',
          onClick: this.switchFieldType,
        },
      ],
      contextmenu: '',
    };
  },
  methods: {
    switchFieldType(e, item, vm) {
      vm.item.dataType = item.dataType;
      this.$emit('changeDataType');
    },
    formatField(value) {
      switch (value) {
        case 'Int64':
          value = '整数';
          break;
        case 'DateTime':
          value = '日期时间';
          break;
        case 'Date':
          value = '日期';
          break;
        case 'Float64':
        case 'Decimal64(2)':
          value = '小数';
          break;
        case 'String':
          value = '字符串';
          break;
        default:
          value = '未知类型';
      }
      return value;
    },
    handleClick(e) {
      e.stopPropagation();
      const that = this;
      this.contenxtmenu = new ContextMenu({
        vm: that,
        menus: that.contextmenus.map(item => {
          item.$$fun = function () {
            Array.prototype.push.call(arguments, that);
            item.onClick.apply(this, arguments);
          };
          return item;
        }),
        target: e,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.field-select {
  position: relative;
  cursor: pointer;
}
.field-type {
  color: #2ea2df;
  margin-right: 10px;
}
.caret-down {
  width: 0;
  height: 0;
  border: 6px solid rgba(0, 0, 0, 0.65);
  border-color: rgba(0, 0, 0, 0.65) transparent transparent transparent;
  position: absolute;
  top: 14px;
  right: 10px;
  transform: translateY(-50%);
}
</style>
