<template>
  <div>
    <div v-if="!isNumber">
      <a-radio-group v-model="conditionData.modeType" @change="checkedData = []">
        <a-radio :value="1">列表</a-radio>
        <a-radio :value="2">手动</a-radio>
      </a-radio-group>
      <template v-if="+conditionData.modeType === 1">
        <a-input
          v-model="searchWord"
          class="input-area"
          placeholder="请输入搜索的关键词(如: A,B,C)"
          @keyup.enter.stop="onSearch"
        >
          <a-button style="height: 30px" type="primary" slot="addonAfter" @click="onSearch">查询</a-button>
        </a-input>
        <a-spin :spinning="spinning" class="condition-list hasBorder scrollbar">
          <a-checkbox
            :indeterminate="checkedData.length > 0 && checkedData.length < dataRowsResult.length"
            :checked="checkedData.length === dataRowsResult.length"
            @change="onCheckAllChange"
          >
            全选
          </a-checkbox>
          <br />
          <a-checkbox-group class="block-checkbox" v-model="checkedData" :options="dataRowsResult" />
        </a-spin>
      </template>
      <!--手动筛选-->
      <template v-if="+conditionData.modeType === 2">
        <a-input
          v-model="conditionName"
          class="input-area"
          placeholder="请输入条件名称"
          @keyup.enter.stop="addCondition"
        >
          <a-button style="height: 30px" type="primary" slot="addonAfter" @click="addCondition">添加</a-button>
        </a-input>
        <div class="condition-list hasBorder scrollbar">
          <div class="pick-property" v-for="(item, index) in checkedData" :key="item">
            <span>{{ item }}</span>
            <a-icon style="margin-left: 10px" type="close-circle" theme="filled" @click="deleteManualProperty(index)" />
          </div>
        </div>
      </template>
    </div>
    <!--拖动的是数值-->
    <div v-else>
      <button class="ant-btn ant-btn-primary" @click="addCondition">添加条件</button>
      <div class="pick-checkbox-box" style="margin: 0; padding: 0">
        <div class="condition-list scrollbar" style="height: 100%">
          <div :class="['pick-condition-box']" v-for="(item, index) in customData" :key="index">
            <a-select :class="['pick-select', 'has-margin']" v-model="item.condition">
              <a-select-option v-for="option in conditionOptions" :key="option.label" :value="option.op">
                {{ option.label }}
              </a-select-option>
            </a-select>
            <a-input-number
              v-model="item.startValue"
              size="default"
              placeholder="请输入数值"
              class="inputnumber"
              style="text-overflow: clip"
            ></a-input-number>
            <span class="symbol" v-show="item.condition === 'range'">-</span>
            <a-input-number
              v-show="item.condition === 'range'"
              v-model="item.endValue"
              size="default"
              placeholder="请输入数值"
              class="inputnumber"
              style="text-overflow: clip"
            ></a-input-number>
            <a-icon style="margin-left: 10px" type="close-circle" theme="filled" @click="delectCondition(index)" />
          </div>
        </div>
      </div>
    </div>
    <a-radio-group v-model="conditionData.isInclude">
      <a-radio :value="2">只显示</a-radio>
      <a-radio :value="1">排除</a-radio>
    </a-radio-group>
  </div>
</template>

<script>
export default {
  name: '',
  inject: ['rootInstance', 'NUMBER_LIST', 'conditionOptions'],
  props: {
    fieldData: {
      // 字段对象, 用于获取数据
      type: Object,
      default() {
        return {};
      },
    },
    // 当前编辑的对象
    conditionData: {
      type: Object,
      default() {
        return {};
      },
    },
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
      spinning: false,
      searchWord: '', // 搜索关键字
      conditionName: '', // 添加的条件名
      checkedData: [], // 选中的列表
      customData: [], // 手动添加的列表
      dataRows: [], // 该字段查询出来的数据
      dataRowsResult: [], // 搜索筛选的数据
    };
  },
  created() {
    if (this.conditionData.modeType !== 0) {
      this.getFieldData();
    }
    // 列表赋值
    if (this.isNumber) {
      this.customData = [].concat(this.conditionData.rule.ruleFilterList || []);
    }
  },
  computed: {
    isNumber() {
      const data = this.fieldData || this.conditionData;
      return this.NUMBER_LIST.includes(data.convertType || data.dataType);
    },
    // isNumber() {
    //   const field = this.getPivotSchemaData()
    //   return this.NUMBER_LIST.includes(
    //     field.convertType || field.dataType
    //   )
    // }
  },
  methods: {
    // 从父组件的维度度量中获取当前对象
    // getPivotSchemaData() {
    //   const data = this.fieldData || this.conditionData
    //   const field = this.pivotSchema.find(item => item.alias === data.alias)
    //   return field || data
    // },
    onSearch() {
      const checkAll = this.checkedData.length === this.dataRowsResult.length;
      const keyword = (this.searchWord || '').toLowerCase();
      const list = keyword.split(',');
      this.dataRowsResult = this.dataRows.filter(item => {
        let match = false;
        list.forEach(k => {
          if ((item || '').toLowerCase().indexOf(k) > -1) {
            match = true;
          }
        });
        return match;
      });
      // 如果是全选状态, 选中当前所有筛选项
      if (checkAll) {
        this.checkedData = this.dataRowsResult;
      } else {
        // 不是全选状态, 过滤掉非当前搜索结果
        this.checkedData = this.dataRowsResult.filter(item => this.checkedData.includes(item));
      }
    },
    onCheckAllChange(e) {
      const value = e.target.checked;
      if (value) {
        this.checkedData = this.dataRowsResult;
      } else {
        this.checkedData = [];
      }
    },
    addCondition() {
      // 字符类型手动添加
      if (!this.isNumber && +this.conditionData.modeType === 2) {
        if (this.checkedData.indexOf(this.conditionName) > -1) {
          return this.$message.error('该条件已存在');
        }
        this.checkedData.push(this.conditionName);
        this.conditionName = '';
      } else {
        // 数值类型添加条件
        if (this.customData.length < 5) {
          this.customData.push({
            condition: 'range', // 条件选择，显示
            startValue: '',
            endValue: '',
          });
        } else {
          this.$message.error('限制只能添加5个');
        }
      }
    },
    deleteManualProperty(index) {
      this.checkedData.splice(index, 1);
    },
    delectCondition(index) {
      this.customData.splice(index, 1);
    },
    // 遍历条件列表, 检验input框是否有空值
    valitateCustomData() {
      for (const item of this.customData) {
        if (item.condition === 'range') {
          const { startValue, endValue } = item;
          if (startValue === '' || endValue === '') {
            this.$message.error('请完善添加的条件');
            return false;
          } else if (isNaN(startValue) || isNaN(endValue)) {
            this.$message.error('请完善添加的条件');
            return false;
          } else if (startValue > endValue) {
            this.$message.error('范围起始值大于末尾值');
            return false;
          }
        } else {
          if (item.startValue === '' || isNaN(item.startValue)) {
            this.$message.error('请完善添加的条件');
            return false;
          }
        }
      }
      return true;
    },
    // 点击确认时, 赋值给rule
    resultConditionData() {
      if (!this.isNumber) {
        if (this.checkedData.length < 1) {
          this.$message.error('请添加条件');
          return false;
        }
        this.conditionData.rule.ruleFilterList = this.checkedData;
      } else {
        if (this.customData.length < 1) {
          this.$message.error('请添加条件');
          return false;
        } else {
          const res = this.valitateCustomData();
          if (!res) {
            return false;
          }
        }
        this.conditionData.rule.ruleFilterList = this.customData;
        // const data = this.getPivotSchemaData()
        // this.conditionData.convertType = data.convertType || data.dataType
      }
      // 重新编辑确认后, 有标黄的记录要去掉
      if (this.conditionData.status === 3) {
        this.conditionData.status = 0;
      }
      return true;
    },
    async getFieldData() {
      // 获取维度对应字段列表
      const data = {
        resourceType: 0,
      };
      const params = {
        resourceType: 0,
        dimensions: [data],
      };
      // 新增的时候才有fieldData
      if (this.fieldData) {
        Object.assign(data, this.fieldData);
        data.pivotschemaId = this.fieldData.id;
        params.pivotschemaId = this.fieldData.id;
        params.fieldId = this.fieldData.fieldId;
        params.dataModelId = this.fieldData.datamodelId;
        // params.modelTableId = data.modelTableId
      } else {
        Object.assign(data, this.conditionData);
        params.fieldId = data.fieldId;
        params.dataModelId = data.datamodelId;
        params.pivotschemaId = data.pivotschemaId;
        // params.modelTableId = data.modelTableId
      }
      this.spinning = true;
      const res = await this.$server.dataModel
        .getModelData({
          ...this.rootInstance.detailInfo,
          pivotSchema: {
            ...this.rootInstance.handleConcat(), // 处理维度度量
          },
          modelTableId: data.modelTableId,
          resourceJson: params,
        })
        .finally(() => {
          this.spinning = false;
        });
      if (res.code === 500 && res.msg === 'IsChanged') {
        this.$message.error('模型数据不存在');
        this.isdrag = false;
        return;
      }
      if (res.code === 200) {
        const list = [];
        let hasNull = false;
        res.rows.forEach(item => {
          // 需将null值空值也当做条件显示出来
          if (Object.prototype.toString.call(item) === '[object Object]') {
            const value = Object.values(item);
            if (value[0]) {
              list.push(value.toString());
            } else {
              hasNull = true;
            }
          } else {
            hasNull = true;
          }
        }); // 维度全字段列表
        if (hasNull) list.unshift('');
        this.dataRows = list;
        // 从最新数据中过滤掉被删除的行数据
        const checkedData = this.conditionData.rule.ruleFilterList.filter(item => this.dataRows.includes(item)) || [];
        this.checkedData = checkedData;
        this.conditionData.rule.ruleFilterList = checkedData;
      }
      this.dataRowsResult = this.dataRows || [];
    },
  },
};
</script>

<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .ant-input-group-addon {
  padding: 0;
}
.condition-list {
  height: 300px;
  margin-bottom: 10px;
  overflow: auto;
  &.hasBorder {
    padding: 10px;
    border: 1px solid #d9d9d9;
  }
}
.input-area {
  margin: 10px 0;
}
.block-checkbox @{deep} .ant-checkbox-group-item {
  display: block;
  margin-right: 0;
}
</style>
