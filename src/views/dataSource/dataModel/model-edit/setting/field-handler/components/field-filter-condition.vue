<template>
  <div>
    <div v-if="!isNumber">
      <a-radio-group v-model="conditionData.modeType" @change="checkedData = []">
        <a-radio :value="1">列表</a-radio>
        <a-radio :value="2">手动</a-radio>
      </a-radio-group>
      <template v-if="+conditionData.modeType === 1">
        <a-input v-model="searchWord" class="input-area" placeholder="请输入搜索的关键词" @keyup.enter.stop="onSearch">
          <a-button style="height: 30px" type="primary" slot="addonAfter" @click="onSearch">查询</a-button>
        </a-input>
        <a-spin :spinning="spinning" class="condition-list hasBorder scrollbar">
          <ScrollPage
            :rows="dataRowsResult"
            :row-height="22"
            :pagination="pagination"
            :fetch="getPageData"
            :limit="0"
            @change="handleCheckedList"
          >
            <a-checkbox
              :indeterminate="checkedData.length > 0 && !checkAll"
              :checked="checkAll"
              @change="onCheckAllChange"
            >
              全选
            </a-checkbox>
            <br />
            <!-- <a-checkbox-group class="block-checkbox" v-model="checkedData" :options="dataRowsResult" /> -->
            <a-checkbox
              class="block-checkbox"
              v-for="item in pageDataRows"
              :key="item"
              :checked="checkedData.includes(item)"
              @change="onCheckChange($event, item)"
            >
              {{ item }}
            </a-checkbox>
          </ScrollPage>
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
import ScrollPage from '@/components/scroll';
export default {
  name: '',
  inject: ['rootInstance', 'NUMBER_LIST', 'conditionOptions'],
  components: {
    ScrollPage,
  },
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
      fetchType: 'search', // | scroll 是搜索还是滚动时的异步
      conditionName: '', // 添加的条件名
      checkedData: [], // 选中的列表
      customData: [], // 手动添加的列表
      dataRows: [], // 该字段查询出来的数据
      dataRowsResult: [], // 搜索筛选的数据
      pageDataRows: [], // 当前分页展示的数据
      pagination: {
        // 分页参数
        pageSize: 50,
        pageNo: 1,
        rowsNum: 0,
      },
    };
  },
  created() {
    if (this.conditionData.modeType !== 0) {
      // 从最新数据中过滤掉被删除的行数据
      const conditions = this.conditionData.rule.ruleFilterList;
      if (conditions && conditions[0] && typeof conditions[0] !== 'object') {
        this.checkedData = [].concat(this.conditionData.rule.ruleFilterList);
      } else {
        this.checkedData = [];
      }
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
    checkAll() {
      // return this.checkedData.length > 0 && this.checkedData.length === this.pageDataRows.length;
      return this.checkedData.length > 0 && !this.pageDataRows.some(item => !this.checkedData.includes(item));
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
    onCheckChange(e, value) {
      const checked = e.target.checked;
      if (checked) {
        if (this.checkedData.length >= 50) {
          return this.$message.error('最多只能添加50个条件');
        }
        this.checkedData.push(value);
      } else {
        for (let i = 0; i < this.checkedData.length; i++) {
          const item = this.checkedData[i];
          if (item === value) {
            this.checkedData.splice(i, 1);
            break;
          }
        }
      }
    },
    async onSearch() {
      // const checkAll = this.checkedData.length === this.dataRowsResult.length;
      // const keyword = (this.searchWord || '').toLowerCase();
      // const list = keyword.split(',');
      // this.dataRowsResult = this.dataRows.filter(item => {
      //   let match = false;
      //   list.forEach(k => {
      //     if ((item || '').toLowerCase().indexOf(k) > -1) {
      //       match = true;
      //     }
      //   });
      //   return match;
      // });
      // // 如果是全选状态, 选中当前所有筛选项
      // if (checkAll) {
      //   this.checkedData = [].concat(this.dataRowsResult);
      // } else {
      //   // 不是全选状态, 过滤掉非当前搜索结果
      //   this.checkedData = this.dataRowsResult.filter(item => this.checkedData.includes(item));
      // }
      // 重置数据
      this.fetchType = 'search';
      this.pagination = this.$options.data().pagination;
      await this.getFieldData();
    },
    onCheckAllChange(e) {
      const value = e.target.checked;
      if (value) {
        // this.checkedData = [].concat(this.pageDataRows);
        this.checkedData = this.checkedData
          .concat(this.pageDataRows)
          .filter((item, index, arr) => arr.indexOf(item) === index);
      } else {
        this.checkedData = [];
      }
    },
    addCondition() {
      if (this.checkedData.length >= 50) {
        return this.$message.error('最多只能添加50个条件');
      }
      // 字符类型手动添加
      if (!this.isNumber && +this.conditionData.modeType === 2) {
        if (this.checkedData.indexOf(this.conditionName) > -1) {
          return this.$message.error('该条件已存在');
        }
        this.checkedData.push(this.conditionName);
        this.conditionName = '';
      } else {
        // 数值类型添加条件
        if (this.customData.length < 10) {
          this.customData.push({
            condition: 'range', // 条件选择，显示
            startValue: '',
            endValue: '',
          });
        } else {
          this.$message.error('限制只能添加10个');
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
        } else if (this.checkedData.length > 50) {
          this.$message.error('最多只能添加50个条件');
          return false;
        } else if (+this.conditionData.modeType === 0 && this.checkAll && this.pagination.rowsNum > 50) {
          this.$message.error('最多只能添加50个条件');
          return false;
        }
        this.conditionData.rule.ruleFilterList = this.checkedData;
        this.conditionData.checkAll = false;
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
    async getPageData(pageNo) {
      this.pagination.pageNo = pageNo;
      this.fetchType = 'scroll';
      await this.getFieldData();
    },
    // 更新列表数据后, 处理选中项
    handleCheckedList(list) {
      let checkAll = this.checkAll;
      if (this.pageDataRows <= 50) {
        checkAll =
          this.checkedData.length > 0 &&
          this.checkedData.length === this.pageDataRows.filter(item => this.checkedData.includes(item)).length;
      }
      this.pageDataRows = list;
      if (checkAll) {
        this.checkedData = this.checkedData
          .concat(this.pageDataRows)
          .filter((item, index, arr) => arr.indexOf(item) === index);
      }
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
          ...this.pagination,
          ...this.rootInstance.detailInfo,
          pivotSchema: {
            ...this.rootInstance.handleConcat(), // 处理维度度量
          },
          modelTableId: data.modelTableId,
          resourceJson: params,
          keyword: this.searchWord,
        })
        .finally(() => {
          this.spinning = false;
        });
      if (res.code === 1054) {
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
        // 从最新数据中过滤掉被删除的行数据(分页后处理不了)
        // const checkedData = this.conditionData.rule.ruleFilterList.filter(item => this.dataRows.includes(item)) || [];
        // this.checkedData = [].concat(checkedData);
        // this.conditionData.rule.ruleFilterList = checkedData;
        this.checkedData = this.conditionData.rule.ruleFilterList;
        this.pagination.rowsNum = res.rowsNum;
        this.dataRowsResult = this.dataRows;
      } else {
        this.dataRowsResult = [];
      }
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
.block-checkbox {
  display: block;
  margin-left: 0 !important;
}
.block-checkbox @{deep} .ant-checkbox-group-item {
  display: block;
  margin-right: 0;
}
</style>
