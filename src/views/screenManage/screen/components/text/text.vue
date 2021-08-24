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
const reg = /<span data-id="(.*?)" contenteditable="false" class="anchor-measure">(.*?)<\/span>/g;
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
  计数: 'CNT',
  去重计数: 'DCNT',
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
      dataModelId: '', // 记录dataModelId
    };
  },
  mounted() {
    this.initEditor();
  },
  computed: {
    ...mapState({
      model: state => state.board.model,
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
      return [
        {
          alias: '成本',
          name: '成本',
          id: '1',
          defaultAggregator: 'SUM',
          screenTableId: 1,
          status: 0,
          dataType: 'VARCHAR',
        },
      ];
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
        this.editor.setup();
      } else {
        this.editor.destroy();
      }
    },
    'options.data': {
      deep: true,
      immediate: false,
      handler(val) {
        if (!val) {
          return;
        }
        this.dataModelId = val.dataModelId;
        this.$refs['js-board-text-unit'].innerHTML = val.htmlText;
        // 非聚焦(可拖)下还要做转换
        if (this.shapeUnit.isShowShapMover) {
          this.getContent(val.measures).then(resStr => {
            this.$nextTick(() => {
              this.$refs['js-board-text-unit'].innerHTML = resStr;
              if (!val.htmlText) {
                this.$refs['js-board-text-unit'].classList.add('medium-editor-placeholder');
              }
            });
          });
        }
      },
    },
  },
  methods: {
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
        createMenuWithAnchor: function (event, wrap, anchor) {
          const measureList = that.modelMeasures.map(item => {
            return {
              ...item,
              onClick: (event, item, vm) => {
                var range = document.createRange();
                range.selectNode(anchor);
                range.deleteContents();
                const span = document.createElement('span');
                span.setAttribute('data-id', item.id);
                span.setAttribute('contenteditable', false);
                span.setAttribute('class', 'anchor-measure');
                span.innerHTML = `[${vm.formatAggregator(item)}&nbsp;&nbsp;&nbsp;]`;
                span.oncontextmenu = span.onclick = that.clickMeasure;
                vm.dataModelId = item.screenTableId; // 记录使用的模型id
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
          // 监听当前使用模型
          this.checkDataModelId();
        }
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
      let replaceString = await this.getContent(measures);
      this.$nextTick(() => {
        this.$refs['js-board-text-unit'].innerHTML = replaceString;
        if (replaceString) {
          this.$refs['js-board-text-unit'].classList.remove('medium-editor-placeholder');
        }

        // 移除光标
        (document.selection && document.selection.empty && (document.selection.empty(), 1)) ||
          (window.getSelection && window.getSelection().removeAllRanges());
      });
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
        data: { dataModelId: this.dataModelId, htmlText: this.$refs['js-board-text-unit'].innerHTML, measures },
      });
    },
    /**
     * @description 计算显示文本,模板替换去
     */
    async getContent(measures = []) {
      let resultStr = this.$refs['js-board-text-unit'].innerHTML;
      if (measures.length) {
        //     let res = await this.$server.screenManage.getData(this.shapeUnit.component);
        //     // 数据源被删掉
        //     if (res.code === 500 && res.msg === 'IsChanged') {
        //       return 'isChanged';
        //     }
        //     if (res.code === 500) {
        //       return res.msg;
        //     }
        resultStr = resultStr.replace(reg, (match, string) => {
          return `<span>${string}</span>`; // res.rows[0][alias]
        });
      }
      return resultStr;
    },
    /**
     * @description 度量数据添加进data
     */
    getMeasureDatas() {
      let measures = [];
      const measureList = document.querySelectorAll('.anchor-measure');
      if (measureList.length) {
        for (let measureEle of measureList) {
          const [, alias, aggregator] = measureEle.innerHTML.match(/\[(.*?)\((.*?)\)(&nbsp;){3}]/);
          // 验重
          if (!measures.find(item => item.alias === alias)) {
            // 添加度量到图表数据
            let measure = this.modelMeasures.find(item => item.alias === alias);
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
      }
    }, 400),
    /**
     * @description 重新聚焦文本框绑定度量元素点击事件
     */
    addMeasureClick() {
      // 富文本度量添加点击事件
      let spanList = document.querySelectorAll('.anchor-measure');
      spanList.forEach(span => {
        span.addEventListener('click', this.clickMeasure);
        span.addEventListener('contextmenu', this.clickMeasure);
        // 验证度量更改
        // 去掉空格
        let alias = span.innerHTML.replace(
          /\[(.*?)\(.*?\)(&nbsp;){3}]/,
          (reg,
          (match, string) => {
            return string;
          }),
        );
        const measure = this.modelMeasures.find(item => item.alias === alias);
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
    clickMeasure(e) {
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
      const dataType = e.target.dataType;
      const type = dataType === 'BIGINT' || dataType === 'DECIMAL' || dataType === 'DOUBLE' ? 'num' : 'str';
      let aggregatorList = polymerizationData[type];
      polymerizationList[0].children = aggregatorList.map(aggregatorData => {
        return {
          ...aggregatorData,
          onClick: (event, handler, vm, measureEle) => {
            measureEle.innerHTML = measureEle.innerHTML.replace(/\(.*?\)/, '(' + handler.name + ')');
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
      const dataType = item.dataType;
      const isNum = dataType === 'BIGINT' || dataType === 'DECIMAL' || dataType === 'DOUBLE';
      return `${item.alias}(${isNum ? '求和' : '计数'})`;
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
