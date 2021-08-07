<template>
  <div class="text-box" ref="textBox" :style="backgroundStyle">
    <div
      @mousedown="removeSelection"
      @dblclick="focusCurrent"
      :contenteditable="editable"
      data-placeholder="双击输入内容,输入*插入度量"
      :class="[
        'editor-text',
        { 'editor-text-placholder': isShowPlaceHolder },
        { 'cursor-text': editable }
      ]"
      :style="contentStyle"
      ref="editorText"
    ></div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce'
import { Loading } from 'element-ui'
import ContextMenu from '@/components/dataSource/contextmenu'
import MediumEditor from 'medium-editor'
import { mapActions, mapGetters } from 'vuex'
import handleReturnChartData from '@/utils/handleReturnChartData'
// 修改度量聚合方式
function changePolymerization(measure, name) {
  measure.innerHTML = measure.innerHTML.replace(/\(.*?\)/, '(' + name + ')')
}
const aggregatorMap = {
  求和: 'SUM',
  平均: 'AVG',
  最大值: 'MAX',
  最小值: 'MIN',
  计数: 'CNT',
  去重计数: 'DCNT'
}
const reg = /<span class="edit-alias" contenteditable="false">(.*?)<\/span>/g // /<span class="edit-alias" contenteditable="false">(.*?)\(.*?\)(&nbsp;){3}<\/span>/g // 字符串替换模板
export default {
  name: 'mediumEidtor',
  props: {
    config: {
      type: Object,
      required: true
    },
    background: {
      type: Object,
      required: true
    },
    chartId: {
      default: 0
    },
    apiData: {
      type: Object,
      required: false
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 如果存在刷新数据，非编辑模式下重新计算显示文本
    'apiData.refreshData'(val) {
      if (val && !this.editable) {
        this.$nextTick(() => {
          this.$refs.editorText.innerHTML = this.htmlText.replace(
            reg,
            (match, alias) => {
              return val[0] ? val[0][alias] : '空'
            }
          )
        })
      }
    },
    background: {
      handler(val) {
        if (val) {
          this.backgroundStyle = {
            background:
              val.backgroundType === '1'
                ? val.backgroundColor
                : `url(${val.backgroundSrc})`,
            //  backgroundColor: val.backgroundColor,
            borderColor: val.borderColor,
            borderWidth: val.borderWidth + 'px',
            borderStyle: val.borderStyle,
            borderRadius: val.borderRadius + 'px'
          }
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        if (val) {
          // 实时获取配置
          this.selfConfig = val
        }
      },
      deep: true,
      immediate: true
    },
    currentSelected(val) {
      // 是否取消选中文本框
      if (val !== this.chartId && this.canEdit) {
        // 关闭可编辑
        this.canEditByDblClick = false
      }
    },
    canEditByDblClick(val) {
      // 可编辑变不可编辑
      if (!val) {
        // 移除焦点
        this.removeSelection()
        // 保存文本
        // this.saveText()
        // 转换文本
        this.getContent().then(res => {
          this.$refs.editorText.innerHTML = res
          this.selfConfig.text = res
          this.updateChartData(this.chartId)
        })
        // 关闭防止冒泡，开启拖动
        this.$refs.textBox.onmousedown = null
      }
    }
  },
  data() {
    return {
      polymerizationList: [
        {
          name: '聚合方式',
          children: []
        },
        {
          name: '移除',
          onClick: (event, handler, vm, measure) => {
            measure && measure.remove()
          }
        }
      ], // 聚合列表
      htmlText: '',
      selfConfig: {},
      mediumEditor: null,
      canEditByDblClick: false,
      backgroundStyle: {}
    }
  },
  mounted() {
    const self = this
    this.$nextTick(() => {
      // 进入页面获取计算文本
      //   if (this.canEdit) {
      this.htmlText = this.config.htmlText || ''
      // 使用缓存文本,再更新
      if (this.config.text) {
        this.$refs.editorText.innerHTML = this.config.text
      }
      // 初始化显示数据，true:不需要匹配度量数据
      this.getContent(true).then(res => {
        this.$refs.editorText.innerHTML = res
      })
      //   }
    })
    var ContextMenuExtension = MediumEditor.Extension.extend({
      name: 'context-menu',

      init: function() {
        this.subscribe('editableKeydown', this.handleKeydownEnter.bind(this))
        this.subscribe('editableKeydownDelete', this.keydownDel.bind(this))
        this.subscribe('editableInput', self.saveText)
      },

      handleCreateMenu(e, wrap) {
        e.stopPropagation()
        function addEvent(target, antor) {
          target.$$fun = function() {
            Array.prototype.push.call(arguments, self, wrap, antor)
            console.log(arguments)
            target.onClick.apply(this, arguments)
          }
        }
        let antor = document.getElementById('antor')
        if (!antor) {
          return
        }
        var n = antor.getBoundingClientRect()
        self.contenxtmenu = new ContextMenu({
          vm: self,
          target: e,
          menus: self.contextmenus.map(item => {
            if (item['children'] && item.children.length) {
              item.children.forEach(subitem => {
                addEvent(subitem, antor)
              })
            } else {
              addEvent(item, antor)
            }
            return item
          }),
          handleMarkCancel: function() {
            antor && antor.removeAttribute('id')
          },
          customStyle: () => {
            return {
              left: `${n.left + n.width + 2}px`,
              top: `${n.top + n.height}px`
            }
          }
        })
      },

      handleKeydownEnter(event) {
        const isStar =
          (event.keyCode === 56 && event.shiftKey) ||
          event.keyCode === 106 ||
          (event.keyCode === 229 && event.code === 'Digit8')
        // console.log('test', event.keyCode, ' ', event.shiftKey, '', event.code)
        if (isStar) {
          // 阻断原处理流程
          event.preventDefault()
          const wrap = MediumEditor.selection.getSelectionRange(document)
          //   document.execCommand('delete')
          const span = document.createElement('span')
          span.id = 'antor'
          span.innerHTML = '*'
          wrap.insertNode(span)
          wrap.setStartAfter(span)
          document.getElementById('antor').onclick = event => {
            this.handleCreateMenu(event, wrap)
          }
          document.getElementById('antor').click()
        }
      },
      keydownDel() {
        // 删除插入度量，隐藏数据菜单
        let mark = document.querySelector('.m-window') // 获取菜单控制元素
        // 只有插入度量才会存在删除的时候显示菜单
        mark && mark.onclick()
        // 监听当前使用模型
        self.checkDataModelId()
      }
    })
    this.mediumEditor = new MediumEditor(this.$refs.editorText, {
      extensions: {
        'context-menu': new ContextMenuExtension()
      },
      toolbar: false,
      placeholder: false,
      disableEditing: !self.editable // !self.canEdit
    })
  },
  methods: {
    ...mapActions(['updateChartData']),
    removeSelection() {
      if (this.editable) {
        return
      }
      document.selection &&
        document.selection.empty &&
        document.selection.empty()
      window.getSelection && window.getSelection().removeAllRanges()
    },
    // 双击开启编辑并聚焦
    focusCurrent() {
      if (this.canEdit) {
        this.canEditByDblClick = true
        // 显示切换富文本
        this.$refs.editorText.innerHTML = this.htmlText
        // 富文本度量添加点击事件
        //   let spanList = document.querySelectorAll('.edit-alias')
        //   spanList.forEach(span => {
        //     span.addEventListener('click', this.clickMeasure)
        //     // 验证度量更改
        //     // 去掉空格
        //     let alias = span.innerHTML.replace(/&nbsp;/gi, '')
        //     let measure = this.modelMeasures.find(item => item.alias === alias)
        //     // 度量不存在飘红
        //     if (measure.status === 1) {
        //       span.style.color = 'red'
        //     }
        //   })
        // 防止拖动
        this.$refs.textBox.onmousedown = e => {
          e.stopPropagation()
        }
      }
      // 全选文本内容
      setTimeout(() => {
        this.mediumEditor.selectElement(this.$refs.editorText)
      }, 0)
    },
    // 检验当前使用datamodel
    checkDataModelId: debounce(function() {
      //   let regStr = /<span class="edit-alias" contenteditable="false">(.*?)(&nbsp;){3}<\/span>/g
      let regStr = /<span class="edit-alias" contenteditable="false">(.*?)<\/span>/g
      let matchList = this.htmlText.match(regStr)
      // 度量已经删完，清除图表datamodelId
      if (!matchList) {
        this.currSelected.datamodelId = '0'
        this.currSelected.setting.resourceType = ''
        this.currSelected.setting.api_data.modelId = ''
      }
    }, 400),
    // 插入度量元素的点击事件，弹出聚合方式菜单
    clickMeasure(e) {
      let n = e.target.getBoundingClientRect()
      function addEvent(target, measure) {
        target.$$fun = function() {
          Array.prototype.push.call(arguments, this, measure)
          target.onClick.apply(this, arguments)
        }
      }
      // 构造聚合方式选择列表
      let aggregatorList = Object.keys(aggregatorMap)
      this.polymerizationList[0].children = aggregatorList.map(name => {
        return {
          name,
          onClick: (event, handler, vm, measure) => {
            changePolymerization(measure, handler.name)
          }
        }
      })
      this.contenxtmenu = new ContextMenu({
        vm: this,
        target: e,
        menus: this.polymerizationList.map(item => {
          if (item['children'] && item.children.length) {
            item.children.forEach(subitem => {
              addEvent(subitem, e.target)
            })
          } else {
            addEvent(item, e.target)
          }
          return item
        }),
        customStyle: () => {
          return {
            left: `${n.left + n.width + 2}px`,
            top: `${n.top + n.height}px`
          }
        }
      })
    },
    // 生成插入的span
    parseDom(arg) {
      const span = document.createElement('span')
      span.className = 'edit-alias'
      span.contentEditable = false
      span.innerHTML = `${arg}` //  `${arg}(求和)&nbsp;&nbsp;&nbsp;` // 给下拉三角样式留空
      // 添加点击事件
      // span.onclick = this.clickMeasure
      return span
    },
    // 插入度量数据
    insertMeasure(wrap, antor, measure) {
      // 删除*
      antor.remove()
      // 生成数据元素
      let parseDom = this.parseDom(measure.alias)
      // 在光标处插入dom
      wrap.insertNode(parseDom)
      wrap.selectNode(parseDom)
      // 锁定dataModelId
      this.currSelected.datamodelId = measure.screenTableId
      this.currSelected.setting.api_data.modelId = measure.screenTableId
      this.currSelected.setting.resourceType = measure.resourceType

      // 保存插入的元素到htmlText
      this.htmlText = this.$refs.editorText.innerHTML

      // 度量插入到数据
      this.pushMeasures(measure)
      this.saveText()

      // 选中插入的元素
      const t = window.getSelection()
      t.removeAllRanges()
      t.addRange(wrap)
      wrap.select && wrap.select()
    },
    // 计算显示文本,模板替换
    async getContent(isInit) {
      // isInit是否初始化，初始化不需要匹配度量数据列表
      if (this.isShowPlaceHolder) {
        return ''
      }
      if (!isInit) {
        // 匹配度量，插入apiData
        this.getMeasureDatas()
      }
      let str = this.htmlText
      if (this.apiData.measures.length > 0) {
        let selected = this.canvasMap.find(item => item.id === this.chartId)
        let self = this
        let loadingInstance = ''
        if (!isInit) {
          loadingInstance = Loading.service({
            lock: true,
            text: '加载中...',
            // target: 'body',
            target: self.$refs.textBox,
            background: 'rgb(255, 255, 255, 0.6)'
          })
        }
        let res = await this.$server.screenManage.getData(selected)
        if (loadingInstance) {
          loadingInstance.close()
        }
        // 数据源被删掉
        if (res.code === 500 && res.msg === 'IsChanged') {
          selected.setting.isEmpty = 'noData'
          return 'isChanged'
        }
        // if (res.code !== 200) {
        //   this.$message.error(res.msg)
        //   return 'isChanged'
        // }
        if (res.code === 500) {
          return res.msg
        }
        selected.setting.api_data.source = await handleReturnChartData(
          res.rows,
          selected.setting
        )

        str = this.htmlText.replace(reg, (match, alias) => {
          return res.rows[0] ? res.rows[0][alias] : '空'
        })
      }
      return str
    },
    // 插入度量数据(为了实时保存)
    pushMeasures(measure) {
      // 去重
      if (!this.apiData.measures.some(item => item.alias === measure.alias)) {
        this.apiData.measures.push(measure)
        this.$store.dispatch('SetSelfDataSource', this.apiData)
      }
    },
    // 添加度量数据
    getMeasureDatas() {
      let reg = /<span class="edit-alias" contenteditable="false">.*?<\/span>/g // /<span class="edit-alias" contenteditable="false">(.*?)(&nbsp;){3}<\/span>/g
      let measures = []
      let matchList = this.htmlText.match(reg)
      if (matchList) {
        for (let matchStr of matchList) {
          let aliasArr = matchStr.match(/>(.*?)</) // />(.*?)\((.*?)\)(&nbsp;){3}</
          let alias = aliasArr[1]
          // 验重
          if (!measures.some(item => item.alias === alias)) {
            // 添加度量到图表数据
            let measure = this.modelMeasures.find(item => item.alias === alias)
            // 添加聚合方式值
            // measure.defaultAggregator = aggregatorMap[aliasArr[2]]
            measures.push(measure)
          }
        }
      }
      this.apiData.measures = measures
      this.$store.dispatch('SetSelfDataSource', this.apiData)
      this.updateChartData(this.chartId)
    },
    // 保存富文本
    saveText: debounce(function() {
      this.htmlText = this.$refs.editorText.innerHTML
      this.selfConfig.htmlText = this.htmlText
      this.$store.dispatch('SetSelfProperty', this.selfConfig)
      this.updateChartData(this.id)
    })
  },
  computed: {
    ...mapGetters([
      'contextMenuInfo',
      'currentSelected',
      'currSelected',
      'modelMeasures',
      'canvasMap'
    ]),
    contentStyle() {
      return this.config
        ? {
            padding: '0 10px',
            color: this.config.title.textStyle.color,
            fontSize: this.config.title.textStyle.fontSize + 'px',
            textAlign: this.config.title.textAlign,
            fontFamily: this.config.title.textStyle.fontFamily,
            fontWeight: this.config.title.textStyle.fontWeight
          }
        : null
    },
    // 当前页面是编辑页面，还要双击以后才能编辑文本框
    editable() {
      return this.canEdit && this.canEditByDblClick
    },
    // 文本框内容为空的时候显示placeholder
    isShowPlaceHolder() {
      return (
        this.canEdit &&
        !this.canEditByDblClick &&
        (!this.htmlText ||
          this.htmlText === '<p><br></p>' ||
          this.htmlText === '<br>')
      )
    },
    contextmenus() {
      let noDataList = [
        {
          name: '没有可插入的数据',
          onClick: (event, handler, vm, wrap, antor) => {
            antor && antor.removeAttribute('id')
          }
        }
      ]
      if (this.modelMeasures.length === 0) {
        return noDataList
      } else {
        let list = []
        // 验证同模型
        if (
          this.modelMeasures.length > 0 &&
          this.currSelected.datamodelId !== 0 &&
          this.currSelected.datamodelId !== '0' &&
          this.modelMeasures[0].screenTableId !== this.currSelected.datamodelId
        ) {
          return noDataList
        }
        this.modelMeasures.forEach(item => {
          // 过滤已更改的度量
          if (item.status === 0) {
            list.push({
              name: item.alias,
              onClick: (event, handler, vm, wrap, antor) => {
                this.insertMeasure(wrap, antor, item)
              }
            })
          }
        })
        return list
      }
    }
  }
}
</script>
<style lang="less">
.edit-alias {
  position: relative;
  display: inline-block;
  //   cursor: pointer;
  border: 1px solid grey;
  //   &:after {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     bottom: 0;
  //     right: 2px;
  //     width: 0;
  //     height: 0;
  //     margin: auto 0;
  //     border: 8px solid;
  //     border-bottom-width: 0;
  //     border-bottom-color: transparent;
  //     border-left-color: transparent;
  //     border-right-color: transparent;
  //     color: grey;
  //     cursor: pointer;
  //   }
}
</style>
<style lang="less" scoped>
.editor-text {
  height: 100%;
  width: 100%;
  //   border: 1px salmon solid;
  position: relative;
  padding: 5px;
  //   cursor: default;
  font-size: 26px;
  /deep/ & > p {
    margin: 0;
  }
  &.cursor-text {
    cursor: text;
  }
  &.editor-text-placholder {
    &:after {
      content: attr(data-placeholder) !important;
      position: absolute;
      font-size: 20px;
      color: white;
      top: 5px;
      left: 5px;
    }
  }
}
.text-box {
  position: relative;
  height: 100%;
  pointer-events: auto !important;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-all;
  user-select: text;
}
</style>
