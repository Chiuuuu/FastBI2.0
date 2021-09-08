<template>
  <div>
    <a-row style="margin-bottom: 10px" type="flex">
      <a-col flex="auto"></a-col>
      <a-col>
        <a-button type="primary" icon="plus" :disabled="tableList.length >= 5" @click="showModal"></a-button>
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
        <a-select v-model="record.rule.condition">
          <a-select-option value="asc">升序</a-select-option>
          <a-select-option value="desc">降序</a-select-option>
        </a-select>
      </template>
      <template #config="text, record, index">
        <a-popconfirm
          title="是否确定删除？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleDeleteRows(record, index)"
        >
          <a-tooltip placement="bottom" title="删除">
            <a-icon class="icon-size" type="delete" />
          </a-tooltip>
        </a-popconfirm>
        <a-tooltip placement="bottom" title="上移">
          <a-icon class="icon-size" v-show="index !== 0" type="arrow-up" @click="handleEditRows(index, 'up')" />
        </a-tooltip>
        <a-tooltip placement="bottom" title="下移">
          <a-icon
            class="icon-size"
            v-show="index !== rows.length - 1"
            type="arrow-down"
            @click="handleEditRows(index, 'down')"
          />
        </a-tooltip>
      </template>
    </a-table>

    <a-modal v-model="showFieldModal" title="选择字段" :footer="null">
      <FieldSelectTree :dimensions="treeDimensions" :measures="treeMeasures" @changeTree="handleInsertField" />
    </a-modal>
  </div>
</template>

<script>
import { mixinTable } from '../mixins';
export default {
  mixins: [mixinTable],
  data() {
    return {
      columns: [
        {
          title: '排序字段',
          dataIndex: 'alias',
          ellipsis: true,
          width: 200,
          scopedSlots: { customRender: 'alias' },
        },
        {
          title: '规则',
          dataIndex: 'rules',
          width: 200,
          scopedSlots: { customRender: 'rules' },
        },
        {
          title: '操作',
          dataIndex: 'config',
          width: 200,
          scopedSlots: { customRender: 'config' },
        },
      ],
    };
  },
  methods: {
    showModal() {
      this.handleTreeData();
      this.showFieldModal = true;
    },
    // 插入新的排序字段
    handleInsertField(nodes) {
      if (this.tableList.length >= 5) return this.$message.error('最多支持5个排序字段');
      const data = nodes[0];
      const insertData = {
        fieldId: data.fieldId,
        pivotschemaId: data.id,
        datamodelId: data.datamodelId,
        modelTableId: data.modelTableId,
        convertType: data.convertType,
        dataType: data.dataType,
        field: data.name,
        alias: data.alias,
        rule: { condition: 'asc' },
        ruleType: 2,
        modeType: 0,
        isInclude: 0,
        displayOrder: this.tableList.length + 1, // 序号
        status: 0,
      };
      this.showFieldModal = false;
      this.$emit('insert', insertData);
    },
    handleEditRows(index, type) {
      this.$emit('edit', index, type);
    },
    handleDeleteRows(record, index) {
      // 清空排序条件
      // Object.assign(record, {
      //   sortIndex: '',
      //   sortRules: ''
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
  margin: 0 2px;
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
