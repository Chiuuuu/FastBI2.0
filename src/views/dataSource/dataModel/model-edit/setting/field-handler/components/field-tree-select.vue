<template>
  <div class="group-box">
    <!-- 指定聚合时显示的提示文本 -->
    <div v-if="showTips" class="group-tips">
      分组方式
      <a-tooltip placement="rightTop">
        <a-icon type="question-circle" />
        <template slot="title">
          ①勾选制定group by字段，即勾选字段值相同时作为同一组聚合计算； ②全不勾选默认为不分组，即计算聚合字段的所有值。
        </template>
      </a-tooltip>
      ：
    </div>
    <!-- a-input-search同时绑定onsearch和keyup会使keyup事件触发两次 -->
    <a-input v-model="searchWord" placeholder="请输入搜索的关键词" @keyup.enter.stop="onSearch">
      <a-button style="height: 30px" type="primary" slot="addonAfter" @click="onSearch">查询</a-button>
    </a-input>
    <!-- 字段选择树 -->
    <div class="group-tree-area">
      <div class="group-tree-block" style="margin-right: 5px">
        <SelectTree
          ref="dimension"
          checkAllText="所有维度"
          :keyword="keyword"
          :checkable="checkable"
          :field-list="dimensions"
          @updateNodes="(...args) => updateNodes(...args, 'Dimensions')"
        />
      </div>
      <div class="group-tree-block" style="margin-left: 5px">
        <SelectTree
          ref="measure"
          checkAllText="所有度量"
          :keyword="keyword"
          :checkable="checkable"
          :field-list="measures"
          @updateNodes="(...args) => updateNodes(...args, 'Measures')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SelectTree from './tree.vue';
export default {
  name: 'fieldTreeSelect',
  props: {
    checkable: Boolean,
    showTips: Boolean,
    dimensions: {
      type: Array,
      required: true,
    },
    measures: {
      type: Array,
      required: true,
    },
  },
  components: {
    SelectTree,
  },
  data() {
    return {
      searchWord: '', // 记录input的value值
      keyword: '', // 真正用于compute的关键字
      checkedDimensions: [], // 选中的对象
      checkedMeasures: [], // 选中的对象
    };
  },
  watch: {
    checkedDimensions() {
      this.handleEmitCheckedNodes();
    },
    checkedMeasures() {
      this.handleEmitCheckedNodes();
    },
  },
  methods: {
    // 重置树的勾选
    resetTree() {
      Object.assign(this.$data, this.$options.data());
    },
    // 编辑时设置已勾选
    setTree(checkedAlias) {
      if (!this.$refs.dimension) {
        return this.$nextTick(() => {
          this.setTree(checkedAlias);
        });
      }
      const checkedDimensions = [];
      const checkedMeasures = [];
      checkedAlias.forEach(item => {
        for (let i = 0; i < this.dimensions.length; i++) {
          const dimension = this.dimensions[i];
          if (dimension.alias === item) {
            checkedDimensions.push(dimension);
            return;
          }
        }
        for (let i = 0; i < this.measures.length; i++) {
          const measure = this.measures[i];
          if (measure.alias === item) {
            checkedMeasures.push(measure);
            return;
          }
        }
      });
      this.$refs.dimension.checkedNodes = checkedDimensions;
      this.$refs.measure.checkedNodes = checkedMeasures;
    },
    onSearch() {
      this.keyword = this.searchWord;
    },
    // 向上传递选中的树节点
    handleEmitCheckedNodes() {
      const list = [].concat(this.checkedDimensions).concat(this.checkedMeasures);
      this.$emit('changeTree', list);
    },
    // 更新选中的节点
    updateNodes(nodes, type) {
      // 单选清空下, 直接发射数据, 不用更新选中列表
      if (this.checkable) {
        this['checked' + type] = nodes;
      } else {
        this.$emit('changeTree', nodes);
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
.group-box {
  width: 100%;
  height: 100%;
}
.group-tips {
  margin-bottom: 8px;
}
.group-tree-area {
  height: 300px;
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;

  .group-tree-block {
    flex: 1;
    overflow: hidden;
    border: 1px solid #d9d9d9;
  }
}
</style>
