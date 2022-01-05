<template>
  <a-modal
    width="1000px"
    class="modModal"
    title="指定聚合"
    :zIndex="1001"
    :visible="isShow"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :keyboard="false"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <div class="mod" style="height: 420px">
      <div class="modal_l">
        <div class="set">
          <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-form-model-item label="名称" prop="name">
              <a-input v-model="form.name" />
            </a-form-model-item>
            <a-form-model-item label="聚合字段" prop="field">
              <div class="modal_dropdown" style="width: 100%">
                <!-- 设置一个隐藏的input -->
                <a-input v-show="false" v-model="form.field" placeholder="请选择聚合字段"></a-input>
                <a-dropdown v-model="fieldVisible" :trigger="['click']" style="width: 100%">
                  <div class="dropdown">
                    {{ form.field || '请选择聚合字段' }}
                  </div>
                  <div slot="overlay" class="dropOverlay">
                    <a-input allowClear placeholder="请输入关键词" @change="handleSearch($event)"></a-input>
                    <a-menu>
                      <a-menu-item v-for="item in fieldList" :key="item.id" @click="handleSelect(item, 'field')">
                        {{ item.alias }}
                      </a-menu-item>
                    </a-menu>
                  </div>
                </a-dropdown>
              </div>
            </a-form-model-item>
            <a-form-model-item label="聚合方式" prop="defaultAggregator">
              <div class="modal_dropdown" style="width: 100%">
                <!-- 设置一个隐藏的input -->
                <a-input v-show="false" v-model="form.defaultAggregator" placeholder="请选择聚合方式"></a-input>
                <a-dropdown
                  v-model="defaultAggregatorVisible"
                  :trigger="['click']"
                  :disabled="!currentField"
                  style="width: 100%"
                >
                  <div class="dropdown" :class="{ disabled: !currentField }">
                    {{ form.defaultAggregator || '请选择聚合方式' }}
                  </div>
                  <div slot="overlay" class="dropOverlay">
                    <a-menu>
                      <a-menu-item
                        v-for="item in aggregatorList"
                        :key="item.value"
                        @click="handleSelect(item, 'defaultAggregator')"
                      >
                        {{ item.name }}
                      </a-menu-item>
                    </a-menu>
                  </div>
                </a-dropdown>
              </div>
            </a-form-model-item>
          </a-form-model>
        </div>
        <div class="u-txtwrap u-code-input">
          <div class="dropp">
            <textarea
              id="demo"
              class="u-txt u-txt-area u-code-input"
              row="5"
              spellcheck="false"
              ref="js-textarea"
              v-model="textareaValue"
              readonly
            ></textarea>
          </div>
        </div>
      </div>
      <div class="modal_r">
        <FieldSelectTree
          ref="fieldSelectTree"
          showTips
          checkable
          :dimensions="sourceDimensions.filter(item => item.status === 0 && item.isGroupFlag < 1)"
          :measures="sourceMeasures.filter(item => item.status === 0 && item.isGroupFlag < 1)"
          @changeTree="handleGetTreeField"
        />
      </div>
    </div>
  </a-modal>
</template>

<script>
import { mixinModal } from './mixins';
import debounce from 'lodash/debounce';
export default {
  name: 'fieldAggregator',
  mixins: [mixinModal],
  inject: ['NUMBER_LIST', 'AGGREGATOR_LIST'],
  data() {
    return {
      confirmLoading: false,
      form: {
        name: '',
        field: '',
        defaultAggregator: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '请输入1-20字符的名称',
          },
          { validator: this.validateName, trigger: ['change', 'blur'] },
        ],
        field: [
          {
            required: true,
            message: '请选择聚合字段',
            trigger: ['change', 'blur'],
          },
        ],
        defaultAggregator: [
          {
            required: true,
            message: '请选择聚合方式',
            trigger: ['change', 'blur'],
          },
        ],
      },
      searchWord: '',
      fieldVisible: false,
      defaultAggregatorVisible: false,
      currentField: null, // 当前选中的字段对象
      currentAggregator: null, // 当前选中的聚合方式对象
      checkedFieldList: [], // 用于记录当前选中的维度和度量
      textareaValue: '',
      expr: '', // 记录选中的字段和聚合方式 例: COUNT($${id})
      raw_expr: {},
    };
  },
  watch: {
    isShow: {
      immediate: true,
      handler(value) {
        if (value) {
          if (this.isEdit) {
            // 编辑
            this.handleInitEditData();
          } else {
            // 新建
            if (this.fieldList.length && this.fieldList.length > 0) {
              this.currentField = this.fieldList[0];
              this.form.field = this.currentField.alias;
            }
            this.form.defaultAggregator = '计数';
            this.currentAggregator = this.AGGREGATOR_LIST.find(item => item.value === 'COUNT');
            this.changeTextArea();
          }
        } else {
          this.dimensions = '';
          this.measures = '';
          this.textareaValue = '';
          this.currentField = null;
          this.currentAggregator = null;
          this.form = this.$options.data().form;
          this.$refs.fieldSelectTree && this.$refs.fieldSelectTree.resetTree();
        }
      },
    },
  },
  computed: {
    fieldList() {
      const list = []
        .concat(this.sourceDimensions)
        .concat(this.sourceMeasures)
        .filter(item => item.isGroupFlag < 1);
      return list.filter(item => item.alias.toLowerCase().indexOf(this.searchWord.toLowerCase()) > -1);
    },
    aggregatorList() {
      if (this.currentField && this.isNumber(this.currentField.convertType || this.currentField.dataType)) {
        return this.AGGREGATOR_LIST;
      } else {
        return this.AGGREGATOR_LIST.slice(-2);
      }
    },
  },
  methods: {
    // 处理编辑时的数据展示
    handleInitEditData() {
      // this.textareaValue = this.renameData.raw_expr
      this.expr = this.renameData.expr;
      let expr = this.renameData.expr || '';
      let id = '';
      if (expr.match(/(?<=\$\$)(\d)+/g)) {
        id = expr.match(/(?<=\$\$)(\d)+/g)[0];
      }
      const list = [].concat(this.sourceDimensions).concat(this.sourceMeasures);
      const field = list.find(item => item.id === id);
      this.currentField = field;
      this.form = Object.assign(this.form, {
        name: this.renameData.alias,
        field: field ? field.alias : '',
      });

      if (this.renameData.raw_expr) {
        this.$nextTick(() => {
          const { checkedList, aggregator } = JSON.parse(this.renameData.raw_expr);
          // const expr = this.renameData.expr
          // let checkedList = []
          // if (typeof this.renameData.raw_expr === 'string') {
          //   checkedList = this.renameData.raw_expr.slice(1, -1).split(', ')
          // } else if (Array.isArray(this.renameData.raw_expr)) {
          //   checkedList = this.renameData.raw_expr
          // }
          this.$refs.fieldSelectTree &&
            // this.$refs.fieldSelectTree.setTree(checkedList.split(','))
            this.$refs.fieldSelectTree.setTree(checkedList);

          const defaultAggregator = this.aggregatorList.find(
            item => item.name === aggregator,
            // item => expr.indexOf(item.value) > -1
          );
          this.currentAggregator = defaultAggregator;
          this.form.defaultAggregator = defaultAggregator ? defaultAggregator.name : '';
        });
      }
    },
    handleClose() {
      this.textareaValue = '';
      this.form = this.$options.data().form;
      this.$refs.form.clearValidate();
      this.$emit('close');
    },
    isNumber(type) {
      return this.NUMBER_LIST.includes(type);
    },
    // 校验名称
    validateName(rule, value, callback) {
      const arry = [...this.sourceDimensions, ...this.sourceMeasures];
      const item = arry.filter(item => item.alias === value).pop();
      if (item) {
        if (this.isEdit && item.alias === this.renameData.alias) {
          callback();
        }
        callback(new Error('名称已存在'));
      } else {
        callback();
      }
    },
    /**
     * 维度度量关键词搜索
     */
    handleSearch: debounce(function (event) {
      const value = event.target.value || '';
      this.searchWord = value.trim();
    }, 500),
    handleSelect(item, type) {
      if (item) {
        this[`${type}Visible`] = false;
        if (type === 'field') {
          this.form.field = item.alias;
          // 如果旧字段是数值型且新字段是非数值型, 重置聚合方式
          if (!this.currentField || this.isNumber(this.currentField.convertType || this.currentField.dataType)) {
            // 判断是否为新字段没有的聚合方式
            const aggregator = this.form.defaultAggregator;
            if (
              aggregator !== '计数' &&
              aggregator !== '去重计数' &&
              !this.isNumber(item.convertType || item.dataType)
            ) {
              this.form.defaultAggregator = '计数';
              this.currentAggregator = this.AGGREGATOR_LIST.find(item => item.value === 'COUNT');
              this.changeTextArea();
            }
          }
          this.currentField = item;
        } else {
          this.form.defaultAggregator = item.name;
          this.currentAggregator = item;
        }
        // 手动清除校验红字
        this.$refs.form.clearValidate(type);
        this.changeTextArea();
      } else {
        this.$message.error('获取失败');
      }
    },
    // 文本框重新书写value
    changeTextArea() {
      let text = '';
      // 选择了字段
      if (this.currentField) {
        text = `【${this.currentField.alias}】`;
        this.raw_expr.field = this.currentField.alias;
        const match = this.expr.match(/(?<=\$\$)(\d)+/g);
        if (match) {
          this.expr = this.expr.replace(/(?<=\$\$)(\d)+/g, this.currentField.id || '');
        } else {
          this.expr = `$$${this.currentField.id}`;
        }
      }
      // 选择了聚合方式
      if (this.currentAggregator) {
        text += this.currentAggregator.name;
        this.raw_expr.aggregator = this.currentAggregator.name;
        const match = this.expr.match(/(?<=\$\$)(\d)+/g);
        this.expr = `${this.currentAggregator.value}(${match ? `$$${match[0]}` : ''})`;
      }
      // 勾选了树节点
      if (this.checkedFieldList.length > 0) {
        this.textareaValue = this.checkedFieldList.map(item => `同一【${item.alias}】`).join('') + '中的' + text;
      } else {
        this.textareaValue = text;
      }
      this.raw_expr.checkedList = this.checkedFieldList.map(item => `$$${item.id}`);
    },
    // 勾选发生变化, 触发事件更改文本框内容
    handleGetTreeField(list) {
      this.checkedFieldList = list.filter(item => item.visible);
      this.changeTextArea();
    },
    handleSave() {
      this.$refs.form.validate(async ok => {
        if (ok) {
          const params = {
            name: this.form.name,
            datamodelId: this.$parent.model === 'add' ? this.$parent.addModelId : this.$parent.modelId,
            role: this.computeType === '维度' ? 1 : 2,
            raw_expr: JSON.stringify(this.raw_expr),
            // raw_expr: this.checkedFieldList.map(c => `$$${c.id}`),
            groupByFunc: '',
            isGroupFlag: 1,
            expr: this.expr,
          };
          if (this.checkedFieldList.length > 0) {
            params.groupByFunc = `group by (${this.checkedFieldList.map(item => `$$${item.id}`).toString()})`;
            params.isGroupFlag = 2;
          }
          if (this.isEdit) {
            const updateData = Object.assign({}, this.renameData, params, {
              alias: params.name,
              status: 0, // 重置状态
            });
            this.$emit('success', updateData);
          } else {
            this.confirmLoading = true;
            const result = await this.$server.dataModel.addCustomizModelPivotschema(params).finally(() => {
              this.confirmLoading = false;
            });

            if (result && result.code === 200) {
              const data = result.data;
              this.$emit('success', data);
              this.handleClose();
            } else {
              this.$message.error(result.msg || '请求错误');
            }
          }
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style lang="less" scoped src="../editor.less"></style>
<style lang="less" scoped>
.mod {
  .modal_l {
    width: 480px;
    .u-txtwrap {
      width: 460px;
      margin-left: 20px;
    }
  }
  .modal_r {
    width: 500px;
  }
}
.disabled {
  background: #f5f5f5;
}
</style>
