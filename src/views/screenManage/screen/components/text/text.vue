<template>
  <div class="board-text">
    <div class="editor-wrap">
      <div class="board-text-unit" ref="js-board-text-unit" v-html="text"></div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import ContextMenu from '@/components/contextmenu'
import BoardType from '@/views/screenManage/screen/setting/default-type'
import MediumEditor from 'medium-editor'
import { parameter } from '@/store/modules/board'

/**
 * @description 文本框
 */
export default {
  name: `${BoardType.Text}View`,
  inheritAttrs: false,
  inject: ['shapeUnit'],
  data() {
    return {
      editor: '', // 记录编辑器
      text: '', // 文本框内容
      menu: '' // 右键菜单
    }
  },
  mounted() {
    this.initEditor()
  },
  computed: {
    ...mapState({
      model: state => state.board.model
    })
  },
  watch: {
    'shapeUnit.isShowShapMover'(val) {
      if (!val) {
        this.$nextTick(() => {
          this.onFocus()
        })
      } else {
        this.removeFocus()
      }
    },
    model(val) {
      // 监听画板模式 开启/关闭 编辑器
      if (val === parameter.EDIT) {
        this.editor.setup()
      } else {
        this.editor.destroy()
      }
    }
  },
  methods: {
    /**
     * @description 初始化编辑器
     */
    initEditor() {
      const that = this
      const ContextMenuExtension = MediumEditor.Extension.extend({
        name: 'context-menu',

        init: function() {
          this.subscribe('editableInput', this.handleKeyInput.bind(this))
        },

        handleKeyInput(event) {
          // 监听输入
          if (
            ['insertText', 'insertCompositionText'].includes(event.inputType) &&
            event.data === '*'
          ) {
            // 其实wrap就是一个range对象 => document.createRange()
            const wrap = MediumEditor.selection.getSelectionRange(document)

            let text = wrap.startContainer
            let start = wrap.startOffset - 1

            if (start < 0) {
              start = 0
              var previousSibling = text.previousSibling
              if (previousSibling) {
                let s
                // eslint-disable-next-line no-unused-expressions
                !(function e(t) {
                  s || (t.innerText || t.nodeValue) !== '*'
                    ? t.childNodes &&
                      t.childNodes.length &&
                      [].slice.call(t.childNodes).forEach(function(t) {
                        return e(t)
                      })
                    : (s = t)
                })(previousSibling)
                  s && (text = s)
              }
            }
            setTimeout(() => {
              // 以下2行代码等价于 => document.execCommand('delete');
              wrap.setStart(text, start)
              wrap.deleteContents()

              this.clearAnchor()
              const span = document.createElement('span')
              span.setAttribute('id', 'anchor')
              span.innerHTML = '*'
              wrap.insertNode(span)
              wrap.setStartAfter(span)
              this.selectRange(wrap)
              const dom = document
                .querySelector('#anchor')
                .getBoundingClientRect()
              this.createMenuWithAnchor(
                {
                  clientX: Math.round(dom.left + dom.width),
                  clientY: Math.round(dom.top + dom.height)
                },
                wrap,
                span
              )
            }, 0)
          }
        },
        selectRange: function(e) {
          // 选择光标
          var t = window.getSelection()
          t.removeAllRanges()
          t.addRange(e)
          e.select && e.select()
        },
        createMenuWithAnchor: function(event, wrap, anchor) {
          const contextmenus = [
            {
              name: '成本',
              id: '1',
              onClick: (event, item) => {
                // anchor.remove();
                var range = document.createRange()
                range.selectNode(anchor)
                range.deleteContents()
                const span = document.createElement('span')
                span.setAttribute('data-id', item.id)
                span.setAttribute('contenteditable', false)
                span.setAttribute('class', 'anchor-measure')
                span.innerHTML = `[${item.name}]`
                // wrap.insertNode(span);
                range.insertNode(span)
                range.selectNode(span)
                this.selectRange(range)
              }
            }
          ]
          function addEvent(target) {
            target.$$fun = function() {
              Array.prototype.push.call(arguments, that)
              target.onClick.apply(this, arguments)
            }
          }
          const self = this
          that.menu = new ContextMenu({
            vm: that,
            menus: contextmenus.map(item => {
              addEvent(item)
              return item
            }),
            target: event,
            handleMarkCancel: function() {
              self.clearAnchor()
              that.menu = ''
            }
          })
        },
        clearAnchor: function() {
          var e = document.querySelector('#anchor')
          e && e.removeAttribute('id')
        }
      })
      const dom = this.$refs['js-board-text-unit']
      this.editor = new MediumEditor(dom, {
        extensions: {
          'context-menu': new ContextMenuExtension()
        },
        toolbar: false,
        placeholder: {
          text: '双击以输入文本，输入#号可插入动态时间，输入*号可插入度量',
          hideOnClick: true
        }
      })
      this.editor.subscribe('focus', () => {
        this.resetContenteditable(false)
        setTimeout(function() {
          if (!dom.innerHTML) {
            dom.innerHTML = '<p><br></p>'
          }
        }, 0)
      })
      this.editor.subscribe('editableKeydownDelete', () => {
        if (this.menu && this.menu.remove) {
          this.menu.remove()
        }
      })
    },
    /**
     * @description 设置contenteditable属性是否开启
     * @param {boolean} e true | false
     */
    resetContenteditable: function(e) {
      ;[].slice
        .call(
          this.$refs['js-board-text-unit'].querySelectorAll('[contenteditable]')
        )
        .forEach(function(t) {
          return t.setAttribute('contenteditable', e)
        })
    },
    /**
     * @description 获取焦点
     */
    onFocus() {
      // 获取
      const dom = this.$refs['js-board-text-unit']
      dom.innerHTML = this.text
      dom.setAttribute('contenteditable', true)
      setTimeout(() => {
        this.editor.selectElement(dom)
      }, 0)
    },
    /**
     * @description 失去焦点
     */
    removeFocus() {
      this.$refs['js-board-text-unit'].setAttribute('contenteditable', false)
      this.text = this.$refs['js-board-text-unit'].innerHTML
      const reg = /<span data-id="(.*?)" contenteditable="false" class="anchor-measure">(.*?)<\/span>/g
      const replaceString = this.$refs['js-board-text-unit'].innerHTML.replace(
        reg,
        (match, string) => {
          return `<span>${string}</span>`
        }
      )
      this.$nextTick(() => {
        this.$refs['js-board-text-unit'].innerHTML = replaceString
        if (this.text) {
          this.$refs['js-board-text-unit'].classList.remove(
            'medium-editor-placeholder'
          )
        }

        // 移除光标
        ;(document.selection &&
          document.selection.empty &&
          (document.selection.empty(), 1)) ||
          (window.getSelection && window.getSelection().removeAllRanges())
      })
    }
  }
}
</script>
<style lang="less">
.anchor-measure {
  cursor: default;
  position: relative;
  display: inline-block;
  background: transparent;
  border: 1px solid #fff;
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
