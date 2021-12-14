<template>
  <div>
    <a-row style="margin-bottom: 10px" type="flex">
      <a-col flex="auto"></a-col>
      <a-col>
        <a-button type="primary" icon="plus" :disabled="tableList.length >= 10" @click="showModal"></a-button>
      </a-col>
    </a-row>
    <a-table :columns="columns" :data-source="tableList" :scroll="tableScroll" rowKey="pivotschemaId">
      <template #alias="text, record">
        <!-- status: 2, 即引用字段不可见, 置灰处理 -->
        <template v-if="record.status === 2">
          <span :title="text" class="line-through">{{ text }}</span>
        </template>
        <!-- status: 3, 即引用字段类型改变, 标黄 -->
        <template v-else-if="record.status === 3">
          <a-tooltip title="该字段类型发生改变, 规则已不适用" placement="top">
            <a-icon class="tips" theme="filled" type="exclamation-circle" />
          </a-tooltip>
          <span :title="text">{{ text }}</span>
        </template>
        <span :title="text" v-else>{{ text }}</span>
      </template>
      <template #rules="text, record">
        <a-tooltip :title="formatColumnRule(record, 'title')" placement="top">
          {{ formatColumnRule(record, 'list') }}
        </a-tooltip>
      </template>
      <template #config="text, record, index">
        <a-tooltip placement="bottom" title="编辑">
          <a-icon class="icon-size" type="edit" @click="handleEditRows(record, index)" />
        </a-tooltip>
        <a-popconfirm title="是否确定删除？" ok-text="确定" cancel-text="取消" @confirm="handleDeleteRows(index)">
          <a-tooltip placement="bottom" title="删除">
            <a-icon class="icon-size" type="delete" />
          </a-tooltip>
        </a-popconfirm>
      </template>
    </a-table>

    <a-modal v-model="showFieldModal" :title="modalType === 'tree' ? '选择字段' : '添加条件'" destroyOnClose>
      <template #footer>
        <template v-if="modalType === 'condition'">
          <a-button @click="showFieldModal = false">取消</a-button>
          <a-button type="primary" @click="handleOk">确定</a-button>
        </template>
      </template>
      <FieldSelectTree
        v-if="modalType === 'tree'"
        :dimensions="treeDimensions"
        :measures="treeMeasures"
        @changeTree="handleSelectField"
      />
      <FieldCondition
        ref="condition"
        v-else-if="modalType === 'condition'"
        :condition-data="conditionData"
        :field-data="fieldData"
        :pivotSchema="pivotSchema"
      />
    </a-modal>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import { mixinTable } from '../mixins';
import FieldCondition from './field-filter-condition.vue';
export default {
  mixins: [mixinTable],
  components: {
    FieldCondition,
  },
  inject: ['NUMBER_LIST'],
  provide() {
    return { conditionOptions: this.conditionOptions };
  },
  props: {
    // 当前维度度量列表
    pivotSchema: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isEdit: false,
      editIndex: 0,
      columns: [
        {
          title: '筛选字段',
          dataIndex: 'alias',
          ellipsis: true,
          width: 200,
          scopedSlots: { customRender: 'alias' },
        },
        {
          title: '规则',
          dataIndex: 'rules',
          width: 100,
          scopedSlots: { customRender: 'rules' },
        },
        {
          title: '操作',
          dataIndex: 'config',
          width: 150,
          scopedSlots: { customRender: 'config' },
        },
      ],
      modalType: 'tree', // tree: 选择树, condition: 条件选项
      conditionData: null, // 筛选对象
      fieldData: null, // 字段对象
      conditionOptions: [
        { label: '范围', op: 'range' },
        { label: '大于', op: 'more' },
        { label: '小于', op: 'less' },
        { label: '大于等于', op: 'moreAndEquals' },
        { label: '小于等于', op: 'lessAndEquals' },
        { label: '等于', op: 'equals' },
        { label: '不等于', op: 'notEquals' },
      ],
    };
  },
  methods: {
    // 判断字段是否为数值类型
    isNumber(data) {
      if (!data) return false;
      return this.NUMBER_LIST.includes(data.convertType || data.dataType);
    },
    // 格式化规则显示 type: title显示全部 list做截取处理
    formatColumnRule(record, type) {
      if (!Array.isArray(record.rule.ruleFilterList)) return '';
      let len = record.rule.ruleFilterList.length || 0;
      let isInclude = '';
      if (record.isInclude === 1) {
        isInclude = '排除';
      } else if (record.isInclude === 2) {
        isInclude = '只显示';
      }
      // 校验的是当前最新的类型而不是之前存的类型
      if (this.isNumber(record)) {
        // 数值类型
        if (len === 0) {
          return '无';
        } else {
          const list = record.rule.ruleFilterList.map(item => {
            const option = this.conditionOptions.find(o => item.condition === o.op);
            if (!option) return '';
            // 仅当选项是范围时才有2个值
            if (option.op === 'range') {
              return `${option.label}${item.startValue}~${item.endValue}`;
            } else {
              return `${option.label}${item.startValue}`;
            }
          });
          let result = '';
          if (len > 2 && type !== 'title') {
            result = list.slice(0, 2).join('、') + `等${len}项`;
          } else {
            result = list.join('、');
          }
          return isInclude + result;
        }
      } else {
        // 非数值类型
        if (len === 0) {
          return '无';
        } else {
          if (len > 2 && type !== 'title') {
            const ruleFilterList = record.rule.ruleFilterList;
            return `${isInclude}${ruleFilterList[0]}、${ruleFilterList[1]}等${len}项`;
          } else {
            return `${isInclude}${record.rule.ruleFilterList.join('、')}`;
          }
        }
      }
    },
    showModal() {
      if (this.tableList.length >= 10) return this.$message.error('最多支持10个排序字段');
      this.isEdit = false;
      this.showFieldModal = true;
      this.modalType = 'tree';
      this.handleTreeData();
    },
    // 树节点选中字段, 初始化数据
    handleSelectField(nodes) {
      const data = nodes[0];
      const insertData = {
        fieldId: data.fieldId,
        pivotschemaId: data.id,
        datamodelId: data.datamodelId,
        modelTableId: data.modelTableId,
        convertType: data.convertType || data.dataType,
        dataType: data.dataType,
        expr: data.expr,
        field: data.name,
        alias: data.alias,
        rule: { ruleFilterList: [] },
        ruleType: 1,
        modeType: this.isNumber(data) ? 0 : 1,
        isInclude: 2,
        displayOrder: 0,
        status: 0,
      };
      this.conditionData = insertData;
      this.fieldData = data;
      this.modalType = 'condition';
    },
    // 编辑一条记录, 深拷贝一份数据
    handleEditRows(record, index) {
      this.isEdit = true;
      this.editIndex = index;
      this.conditionData = cloneDeep(record);
      // 如果类型发生了改变, 则清空规则
      const field = this.pivotSchema.find(item => item.id === record.pivotschemaId);
      // 更新类型
      this.conditionData.convertType = field.convertType || field.dataType;
      if (field && this.isNumber(record) !== this.isNumber(field)) {
        this.conditionData.rule.ruleFilterList = [];
        this.conditionData.modeType = this.isNumber(field) ? 0 : 1;
      }

      this.fieldData = null;
      this.showFieldModal = true;
      this.modalType = 'condition';
    },
    handleOk() {
      if (this.$refs.condition) {
        const result = this.$refs.condition.resultConditionData();
        if (!result) return;
        if (!this.isEdit) {
          this.$emit('insert', this.conditionData);
        } else {
          this.$emit('edit', this.conditionData, this.editIndex);
        }
      }
      this.showFieldModal = false;
    },
    handleDeleteRows(index) {
      // 清空筛选条件
      // Object.assign(record, {
      //   operation: '',
      //   checkedData: [],
      //   conditionList: [],
      //   type: 1
      // })
      // this.rows.splice(index, 1)
      this.$emit('delete', index);
    },
  },
};
</script>

<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .ant-table-body {
  min-height: 100px;
}
.icon-size {
  font-size: 20px;
  cursor: pointer;
  margin: 0 4px;
}
.line-through {
  color: #ccc;
  text-decoration: line-through;
}
.tips {
  color: #ffc34f;
  margin-right: 2px;
}
</style>
