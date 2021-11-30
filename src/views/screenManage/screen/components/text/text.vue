<template>
  <div class="board-text" @mousedown.stop @contextmenu.stop>
    <div class="editor-wrap">
      <div :style="contentStyle" class="board-text-unit" ref="js-board-text-unit" v-html="text"></div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import ContextMenu from '@/components/contextmenu';
import BoardType from '@/views/screenManage/screen/setting/default-type';
import MediumEditor from 'medium-editor';
import { parameter } from '@/store/modules/board';
import debounce from 'lodash/debounce';
import { getStyle } from '@/utils';
import { mutationTypes as historyMutation } from '@/store/modules/history';
const reg =
  /<span data-id="(.*?)" contenteditable="false" class="anchor-measure">\[(.*?)\((.{2,4})\)(&nbsp;){3}]<\/span>/g;
const innerReg = /\[(.*?)\((.{2,4})\)(&nbsp;){3}]/;
const polymerizationData = {
  // 数字
  num: [
    { name: '求和' },
    { name: '平均' },
    { name: '最大值' },
    { name: '最小值' },
    { name: '计数' },
    { name: '去重计数' },
  ],
  str: [{ name: '计数' }, { name: '去重计数' }],
};
const polymerizationMap = {
  求和: 'SUM',
  平均: 'AVG',
  最大值: 'MAX',
  最小值: 'MIN',
  计数: 'COUNT',
  去重计数: 'COUNTD',
};
const polymerizationList = [
  {
    name: '聚合方式',
    children: [],
  },
  {
    name: '移除',
    onClick: (event, handler, vm, measure) => {
      measure && measure.remove();
    },
  },
];
/**
 * @description 文本框
 */
export default {
  name: `${BoardType.Text}View`,
  inheritAttrs: false,
  inject: ['shapeUnit'],
  props: {
    options: {
      // 配置项信息
      type: [Object, String],
      default: '',
    },
  },
  data() {
    return {
      editor: '', // 记录编辑器
      menu: '', // 右键菜单
      text: '', // 文本框内容
      dataModelId: '', // 插入的时候记录dataModelId，验证同模
      resourceType: '', // 插入的时候记录resourceType，失焦保存保持dataModel跟resourceType一致
      usedMeasures: [], // 插入的时候记录引用了的度量，保持跟dataModel一致
    };
  },
  mounted() {
    if (this.model === parameter.EDIT) {
      this.initEditor();
    }
  },
  computed: {
    ...mapState({
      model: state => state.board.model,
      measures: state => state.app.modelMeasures,
    }),
    contentStyle() {
      const {
        style: {
          echart: { text },
        },
      } = this.options;

      return getStyle({}, { text }, ['fontSize'], []);
    },
    modelMeasures() {
      const noDataList = [
        {
          name: '没有可插入的数据',
          onClick: (event, handler, vm, wrap, antor) => {
            antor && antor.removeAttribute('id');
          },
        },
      ];
      // 度量没有数据或者不同模显示没有可插入的数据
      const datamodelId = this.measures[0] ? this.measures[0].screenTableId : '';
      if (!this.measures.length || (this.dataModelId && datamodelId !== this.dataModelId)) {
        return noDataList;
      }
      let list = [];
      this.measures.forEach(item => {
        if (item.status === 0 && item.visible) {
          // 这里改变了原name会有问题，要先记录name，在构造measure的时候还原回去
          list.push(Object.assign({}, item, { name: item.alias }));
        }
      });
      return list;
    },
  },
  watch: {
    'shapeUnit.isShowShapMover'(val) {
      if (!val) {
        this.$nextTick(() => {
          this.onFocus();
        });
      } else {
        this.removeFocus();
      }
    },
    model(val) {
      // 监听画板模式 开启/关闭 编辑器
      if (val === parameter.EDIT) {
        if (this.editor.setup) {
          this.editor.setup();
        }
      } else {
        if (this.editor.destroy) {
          this.editor.destroy();
        }
      }
    },
    'options.data': {
      deep: true,
      immediate: true,
      handler(val) {
        if (!val) {
          return;
        }
        this.$nextTick(() => {
          this.dataModelId = val.dataModelId;
          this.resourceType = val.resourceType;
          this.usedMeasures = val.measures; // 初始化成已有度量，如果有插入就替换插入的列表
          this.$refs['js-board-text-unit'].innerHTML = val.htmlText;
          // 非聚焦(可拖)下还要做转换
          if (this.shapeUnit.isShowShapMover) {
            this.setText(val);
          }
        });
      },
    },
  },
  methods: {
    /**
     * @description 设置转换数据
     */
    setText(data) {
      this.getContent(data.measures).then(resStr => {
        if (typeof resStr === 'undefined') {
          this.$refs['js-board-text-unit'].innerHTML = '请求失败';
          return;
        }
        this.$refs['js-board-text-unit'].innerHTML = resStr;
        if (!data.htmlText) {
          this.$refs['js-board-text-unit'].classList.add('medium-editor-placeholder');
        }
      });
    },
    /**
     * @description 获取拖入的维度度量列数据
     */
    getFieldList() {
      const { data } = this.options;
      return [].concat(data.measures);
    },
    /**
     * @description 初始化编辑器
     */
    initEditor() {
      const that = this;
      const ContextMenuExtension = MediumEditor.Extension.extend({
        name: 'context-menu',

        init: function () {
          this.subscribe('editableInput', this.handleKeyInput.bind(this));
        },

        handleKeyInput(event) {
          // 监听输入
          if (['insertText', 'insertCompositionText'].includes(event.inputType) && event.data === '*') {
            // 其实wrap就是一个range对象 => document.createRange()
            const wrap = MediumEditor.selection.getSelectionRange(document);

            let text = wrap.startContainer;
            let start = wrap.startOffset - 1;

            if (start < 0) {
              start = 0;
              var previousSibling = text.previousSibling;
              if (previousSibling) {
                let s;
                // eslint-disable-next-line no-unused-expressions
                !(function e(t) {
                  s || (t.innerText || t.nodeValue) !== '*'
                    ? t.childNodes &&
                      t.childNodes.length &&
                      [].slice.call(t.childNodes).forEach(function (t) {
                        return e(t);
                      })
                    : (s = t);
                })(previousSibling);
                s && (text = s);
              }
            }
            setTimeout(() => {
              // 以下2行代码等价于 => document.execCommand('delete');
              wrap.setStart(text, start);
              wrap.deleteContents();

              this.clearAnchor();
              const span = document.createElement('span');
              span.setAttribute('id', 'anchor');
              span.innerHTML = '*';
              wrap.insertNode(span);
              wrap.setStartAfter(span);
              this.selectRange(wrap);
              const dom = document.querySelector('#anchor').getBoundingClientRect();
              this.createMenuWithAnchor(
                {
                  clientX: Math.round(dom.left + dom.width),
                  clientY: Math.round(dom.top + dom.height),
                },
                wrap,
                span,
              );
            }, 0);
          }
        },
        selectRange: function (e) {
          // 选择光标
          var t = window.getSelection();
          t.removeAllRanges();
          t.addRange(e);
          e.select && e.select();
        },
        validSameField: function (vm, data) {
          const { measures } = vm.options.data;
          const target = measures.find(item => item.pivotschemaId === data.pivotschemaId);
          if (target) {
            vm.$message.error('该字段属性已修改，请先删除之前的字段');
            return false;
          }
          return true;
        },
        createMenuWithAnchor: function (event, wrap, anchor) {
          const measureList = that.modelMeasures.map(item => {
            return item.onClick
              ? { ...item }
              : {
                  ...item,
                  onClick: (event, item, vm) => {
                    // TODO:先去掉这层校验, 允许输入重复字段
                    // if (!this.validSameField(vm, item)) {
                    //   return;
                    // }
                    var range = document.createRange();
                    range.selectNode(anchor);
                    range.deleteContents();
                    const span = document.createElement('span');
                    span.setAttribute('data-id', item.id);
                    span.setAttribute('contenteditable', false);
                    span.setAttribute('class', 'anchor-measure');
                    span.innerHTML = `[${vm.formatAggregator(item)}&nbsp;&nbsp;&nbsp;]`;
                    span.oncontextmenu = span.onclick = e => vm.clickMeasure(e, item);
                    vm.dataModelId = item.screenTableId; // 记录使用的模型id
                    vm.resourceType = vm.getResourceType(); // 记录resourceType
                    vm.usedMeasures = [].concat(vm.measures); // 记录当前使用的度量列表，处理插入
                    range.insertNode(span);
                    range.selectNode(span);
                    this.selectRange(range);
                  },
                };
          });
          function addEvent(target) {
            target.$$fun = function () {
              Array.prototype.push.call(arguments, that);
              target.onClick.apply(this, arguments);
            };
          }
          const self = this;
          that.menu = new ContextMenu({
            vm: that,
            menus: measureList.map(item => {
              addEvent(item);
              return item;
            }),
            target: event,
            showMenuScroll: true,
            handleMarkCancel: function () {
              self.clearAnchor();
              that.menu = '';
            },
          });
        },
        clearAnchor: function () {
          var e = document.querySelector('#anchor');
          e && e.removeAttribute('id');
        },
      });
      const dom = this.$refs['js-board-text-unit'];
      // 文本框 -- 初始化值
      dom.innerHTML = this.options.data.htmlText;

      this.editor = new MediumEditor(dom, {
        extensions: {
          'context-menu': new ContextMenuExtension(),
        },
        toolbar: false,
        placeholder: {
          text: '双击以输入文本，输入#号可插入动态时间，输入*号可插入度量',
          hideOnClick: true,
        },
      });
      this.editor.subscribe('focus', () => {
        this.resetContenteditable(false);
        setTimeout(function () {
          if (!dom.innerHTML) {
            dom.innerHTML = '<p><br></p>';
          }
        }, 0);
      });
      this.editor.subscribe('editableKeydownDelete', () => {
        if (this.menu && this.menu.remove) {
          this.menu.remove();
        }
        // 检查当前使用模型
        this.checkDataModelId();
      });
    },
    /**
     * @description 设置contenteditable属性是否开启
     * @param {boolean} e true | false
     */
    resetContenteditable: function (e) {
      [].slice.call(this.$refs['js-board-text-unit'].querySelectorAll('[contenteditable]')).forEach(function (t) {
        return t.setAttribute('contenteditable', e);
      });
    },
    /**
     * @description 获取焦点
     */
    onFocus() {
      // 获取
      const dom = this.$refs['js-board-text-unit'];
      dom.innerHTML = this.shapeUnit.component.setting.data.htmlText;
      dom.setAttribute('contenteditable', true);
      setTimeout(() => {
        this.editor.selectElement(dom);
        this.addMeasureClick();
      }, 0);
    },
    /**
     * @description 失去焦点
     */
    async removeFocus() {
      this.$refs['js-board-text-unit'].setAttribute('contenteditable', false);
      // 匹配度量数据
      const measures = this.getMeasureDatas();
      this.saveText(measures);
      // 移除光标
      (document.selection && document.selection.empty && (document.selection.empty(), 1)) ||
        (window.getSelection && window.getSelection().removeAllRanges());
    },
    /**
     * @description 保存文本
     */
    saveText(measures) {
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Data',
        target: this.shapeUnit.component,
        store: this.$store,
        eventBus: this.$EventBus,
        data: {
          dataModelId: this.dataModelId,
          resourceType: this.resourceType,
          htmlText: this.$refs['js-board-text-unit'].innerHTML,
          measures,
        },
      });
    },
    // 获取当前
    getResourceType() {
      const rt = this.$store.state.app.resourceTypeStr;
      return rt === 'model' ? 8 : 3;
    },
    /**
     * @description 计算显示文本,模板替换去
     */
    async getContent(measures = []) {
      let resultStr = this.$refs['js-board-text-unit'].innerHTML;
      if (measures.length) {
        const parmas = {
          id: this.shapeUnit.component.id,
          tabId: this.shapeUnit.component.tabId,
          type: this.shapeUnit.component.type,
          ...this.options.data,
        };
        this.shapeUnit.changeLodingChart(true);
        const res = await this.$server.common.getData('/screen/graph/v2/getData', parmas).finally(() => {
          this.shapeUnit.changeLodingChart(false);
        });
        if (res.code === 500) {
          if (res.msg === 'IsChanged') {
            this.handleRedList(res.data);
          }
          return res.msg;
        }
        resultStr = resultStr.replace(reg, (match, id, alias, aggregator) => {
          return `<span>${res.data[0][`${polymerizationMap[aggregator]}_${alias}`]}</span>`;
        });
      }
      return resultStr;
    },
    /**
     * @description 处理isChanged标红
     */
    handleRedList(list) {
      // 如果存在对应列表id，替换成红色
      if (list) {
        this.options.data.filter.fileList.forEach(item => {
          if (list.includes(item.id)) {
            item.IsChanged = true;
          }
        });
      }
    },
    /**
     * @description 度量数据添加进data
     */
    getMeasureDatas() {
      // 使用的度量有记录表示有改变数据，处理度量，改变数据不处理
      if (!this.usedMeasures.length) {
        return [];
      }
      let measures = [];
      const measureList = this.$refs['js-board-text-unit'].querySelectorAll('.anchor-measure');
      if (measureList.length) {
        for (let measureEle of measureList) {
          const measureId = measureEle.dataset.id;
          const matchArr = measureEle.innerHTML.match(innerReg);
          const aggregator = matchArr[2];
          // 添加度量到图表数据
          let measureOrigin = this.usedMeasures.find(item => item.id === measureId);
          if (measureOrigin) {
            let measure = Object.assign({}, measureOrigin);
            // 添加聚合方式值
            measure.defaultAggregator = polymerizationMap[aggregator];
            measures.push(measure);
          }
        }
      }
      return measures;
    },
    /**
     * @description 检查如果插入度量已经清空，清空datamoelId
     */
    checkDataModelId: debounce(function () {
      let matchList = this.$refs['js-board-text-unit'].innerHTML.match(reg);
      // 度量已经删完，清除图表datamodelId
      if (!matchList) {
        this.dataModelId = '';
        this.resourceType = '';
        this.usedMeasures = [];
      }
    }, 400),
    /**
     * @description 重新聚焦文本框绑定度量元素点击事件
     */
    addMeasureClick() {
      // 富文本度量添加点击事件
      let spanList = this.$refs['js-board-text-unit'].querySelectorAll('.anchor-measure');
      spanList.forEach(span => {
        // 验证度量更改
        const measureId = span.dataset.id;
        const measure = this.options.data.measures.find(item => item.id === measureId);
        if (!measure) {
          return;
        }
        span.addEventListener('click', e => this.clickMeasure(e, measure));
        span.addEventListener('contextmenu', e => this.clickMeasure(e, measure));
        // 度量不存在飘红
        if (measure.status === 1) {
          // 加style不进reg匹配
          span.style.color = 'red';
        }
      });
    },
    /**
     * @description 度量聚合选择事件
     */
    clickMeasure(e, measureData) {
      e.preventDefault();
      e.stopPropagation();
      let that = this;
      function addEvent(target, measureEle) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that, measureEle);
          target.onClick.apply(this, arguments);
        };
      }
      const dom = e.target.getBoundingClientRect();
      // 构造聚合方式选择列表
      const type = this.judgeDataType(measureData.dataType);
      let aggregatorList = polymerizationData[type];
      polymerizationList[0].children = aggregatorList.map(aggregatorData => {
        return {
          ...aggregatorData,
          onClick: (event, handler, vm, measureEle) => {
            measureEle.innerHTML = measureEle.innerHTML.replace(innerReg, (match, alias) => {
              return `[${alias}(${handler.name})&nbsp;&nbsp;&nbsp;]`;
            });
          },
        };
      });
      this.contenxtmenu = new ContextMenu({
        vm: this,
        target: {
          clientX: Math.round(dom.left + dom.width),
          clientY: Math.round(dom.top + dom.height),
        },
        menus: polymerizationList.map(item => {
          if (item['children'] && item.children.length) {
            item.children.forEach(subitem => {
              addEvent(subitem, e.target);
            });
          } else {
            addEvent(item, e.target);
          }
          return item;
        }),
      });
    },
    /**
     * @description 聚合显示处理
     */
    formatAggregator(item) {
      const isNum = this.judgeDataType(item.dataType) === 'num';
      return `${item.name}(${isNum ? '求和' : '计数'})`;
    },
    /**
     * @description 判断数值类型，返回聚合类型
     */
    judgeDataType(dataType) {
      return dataType === 'Int64' || dataType === 'Decimal64(2)' || dataType === 'Float64' ? 'num' : 'str';
    },
  },
};
</script>
<style lang="less">
.anchor-measure {
  background: transparent;
  border: 1px solid #fff;
  position: relative;
  display: inline-block;
  cursor: pointer;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 2px;
    width: 0;
    height: 0;
    margin: auto 0;
    border: 8px solid;
    border-bottom-width: 0;
    border-bottom-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
    color: grey;
    cursor: pointer;
  }
}
</style>
<style lang="less" scoped>
@spacing: 10px;
.board-text {
  height: 100%;
  width: 100%;
  position: relative;
  color: white;
  overflow: hidden;
  user-select: text;
  .editor-wrap {
    display: table;
    width: 100%;
    height: 100%;
    padding: @spacing;
  }
}
.board-text-unit {
  display: table-cell;
  text-align: left;
  outline: none;
}
.board-text-unit.medium-editor-placeholder::after {
  content: attr(data-placeholder) !important;
  position: absolute;
  top: @spacing;
  left: @spacing;
}
</style>
