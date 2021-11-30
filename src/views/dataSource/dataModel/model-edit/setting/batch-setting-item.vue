<template>
  <a-table
    :row-selection="rowSelection"
    :columns="column"
    :data-source="tableData"
    :scroll="{ y: 320 }"
    :pagination="false"
    rowKey="id"
    bordered
  >
    <template #alias="text, record">
      <a-input
        v-model="record.alias"
        :maxLength="20"
        @change="handleCheckName($event, record.id)"
        style="width: 156px height: 32px"
      />
    </template>
    <template #convertType="text, record">
      <field-select
        :text="(text || record.convertType) | formatField"
        :select-data="record"
        :contextmenus="fieldContenxtMenu"
        :isDimension="record.role === 1"
      />
    </template>
    <template #role="text, record">
      <field-select
        :text="text | formatRole"
        :select-data="record"
        :contextmenus="[
          {
            name: '转换为' + (text === 1 ? '度量' : '维度'),
            roleType: text === 1 ? 2 : 1,
            onClick: switchRoleType,
          },
        ]"
        :isDimension="record.role === 1"
      />
    </template>
    <template #description="text, record">
      <a-input v-model="record.description" :maxLength="200" style="width: 156px height: 32px" />
    </template>
    <template #comment="text, record">
      <a-input v-model="record.comment" style="width: 100px height: 32px" />
    </template>
    <template #visible="text, record, index">
      <a-select :value="`${text}`" @change="value => handleSelect(value, record, index)">
        <a-select-option value="true">是</a-select-option>
        <a-select-option value="false">否</a-select-option>
      </a-select>
    </template>
  </a-table>
</template>
<script>
import FieldSelect from '@/components/dataSource/field-select/select';
const column = [
  {
    title: '原名',
    dataIndex: 'originName',
  },
  {
    title: '别名',
    dataIndex: 'alias',
    width: 150,
    scopedSlots: {
      customRender: 'alias',
    },
  },
  {
    title: '字段类型',
    dataIndex: 'convertType',
    scopedSlots: {
      customRender: 'convertType',
    },
  },
  {
    title: '字段属性',
    dataIndex: 'role',
    scopedSlots: {
      customRender: 'role',
    },
  },
  {
    title: '字段说明',
    dataIndex: 'description',
    width: 150,
    scopedSlots: {
      customRender: 'description',
    },
  },
  {
    title: '注释',
    dataIndex: 'comment',
    width: 100,
    scopedSlots: {
      customRender: 'comment',
    },
  },
  {
    title: '是否可见',
    dataIndex: 'visible',
    scopedSlots: {
      customRender: 'visible',
    },
  },
];
export default {
  name: 'batchSettingItem',
  components: {
    FieldSelect,
  },
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      column,
      fieldContenxtMenu: [
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
      rowSelection: {
        onSelect: (record, selected) => {
          if (record && selected) {
            // 选择单个
            this.$emit('onSelectRow', record);
          } else {
            // 取消单个
            this.$emit('deleteSelectRow', record);
          }
        },
        onSelectAll: (record, selected, selectedRows) => {
          if (record) {
            // 全选
            this.$emit('onSelectAllRows', selectedRows);
          } else {
            // 取消全选
            this.$emit('deleteSelectAllRows', selectedRows);
          }
        },
      },
    };
  },
  filters: {
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
          value = '小数';
          break;
        case 'Decimal64(2)':
          value = '数值';
          break;
        case 'String':
          value = '字符串';
          break;
      }
      return value;
    },
    formatRole(value) {
      return value === 1 ? '维度' : '度量';
    },
  },
  methods: {
    handleSelect(value, record, index) {
      this.$emit('change-visible', value, record, index);
    },
    handleCheckName(e, id) {
      this.$emit('checkName', e, id);
    },
    switchFieldType(e, item, vm) {
      let dataType = item.dataType;
      vm.selectData.convertType = dataType;
    },
    switchRoleType(e, item, vm) {
      let roleType = item.roleType;
      vm.selectData.role = roleType;
    },
  },
};
</script>
