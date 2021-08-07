<template>
  <li
    class="field-item text-item clearfix"
    ref="js-field-item"
    :class="selected ? 'selected' : ''"
  >
    <div :class="['prefix-icon bi-data', icon]"></div>
    <p>{{ data.name }}</p>
    <div class="suffix-btn"></div>
  </li>
</template>
<script>
import DragDrop from '@/utils/dragdrop'
import { addClass, removeClass } from '@/utils/dom'

/**
 * @description 右侧维度度量组件
 */
export default {
  name: 'DataPanelItem',
  inject: ['boardSettingWrapper'],
  props: {
    type: {
      // 类型
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ['dimension', 'measure'].indexOf(value) !== -1
      }
    },
    data: {
      // 数据
      type: Object,
      default: () => {}
    },
    selected: {
      // 是否选中
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dropType: '' // 放置区的类型
    }
  },
  computed: {
    icon() {
      // 对应数据类型的图标
      // TODO:这里应该根据data的类型判断
      const icons = {
        dimension: 'bi-data-string',
        measure: 'bi-data-float'
      }
      return icons[this.type] ? icons[this.type] : ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initDragDrop()
    })
  },
  methods: {
    /**
     * @description 创建拖拽占位符
     */
    createPlaceholder() {
      const div = document.createElement('div')
      div.className = `placeholder-${this.type}`
      div.innerHTML = `${this.data.name}`
      div.style.zIndex = 1000
      div.style.position = 'absolute'
      return div
    },
    /**
     * @description 设置拖拽开始时放置区样式
     */
    handleSetDragStartDropsStyle() {
      // 维度度量列表
      const select = this.type === 'dimension' ? 'measure' : 'dimension'
      this.dropList = document.querySelector(`.js-schema-${select}-list`)
      if (this.dropList) {
        addClass(this.dropList, 'drop-start')
      }

      // 数据筛选
      this.dropDataFilter = document.querySelector('.js-drop-data-filter')
      if (this.dropDataFilter) {
        addClass(this.dropDataFilter, 'drop-start')
      }
    },
    /**
     * @description 设置拖拽结束时放置区样式
     */
    handleSetDragEndDropsStyle() {
      if (this.dropList) {
        removeClass(this.dropList, 'drop-start')
      }
      if (this.dropDataFilter) {
        removeClass(this.dropDataFilter, 'drop-start')
      }
    },
    /**
     * @description 设置拖拽进入放置区样式
     */
    handleSetDragoverDropStyle(drop) {
      drop && addClass(drop, 'drop-over')
    },
    /**
     * @description 设置拖拽离开放置区样式
     */
    handleSetDragleaveDropStyle(drop) {
      drop && removeClass(drop, 'drop-over')
    },
    /**
     * @description 判断拖拽是否在放置区
     */
    handleIsDragInDrop(mouseEvent, target, dragdrop) {
      if (target) {
        const isMouseOnTarget = dragdrop.checkMouseInTarget(mouseEvent, target)
        if (isMouseOnTarget) {
          this.handleSetDragoverDropStyle(target)
        } else {
          this.handleSetDragleaveDropStyle(target)
        }
      }
    },
    /**
     * @description 初始化拖拽放置
     */
    initDragDrop() {
      const dragDom = this.$refs['js-field-item']
      const schemaListItem = new DragDrop(dragDom)
      schemaListItem.init({
        createPlaceholder: () => {
          return this.createPlaceholder()
        },
        ondragstart: () => {
          this.handleSetDragStartDropsStyle()
        },
        ondragmove: (dragdrop, mouseEvent) => {
          this.$store.commit('dragdrop/SET_DRAG', {
            dropType: this.type,
            status: 'dragmove',
            mouseEvent
          })

          this.handleIsDragInDrop(mouseEvent, this.dropList, dragdrop)
          this.handleIsDragInDrop(mouseEvent, this.dropDataFilter, dragdrop)
        },
        ondragend: (dragdrop, mouseEvent) => {
          this.$store.commit('dragdrop/SET_DRAG', {
            dropType: this.type,
            data: this.data,
            status: 'dragend',
            mouseEvent
          })
          const b = dragdrop.checkMouseInTarget(mouseEvent, this.dropList)
          const c = dragdrop.checkMouseInTarget(mouseEvent, this.dropDataFilter)
          if (b) {
            dragdrop.drop = this.dropList
            this.dropType = this.boardSettingWrapper.DROG_TYPE.LIST
          } else if (c) {
            dragdrop.drop = this.dropDataFilter
            this.dropType = this.boardSettingWrapper.DROG_TYPE.DATAFILTER
          }
          this.handleSetDragEndDropsStyle()
        },
        ondrop: dragdrop => {
          this.handleSetDragleaveDropStyle(dragdrop.drop)

          const drops = {
            [this.boardSettingWrapper.DROG_TYPE.LIST]: () => {
              const type = this.type === 'dimension' ? 'measure' : 'dimension'
              this.$EventBus.$emit(`drop:${type}-list`, this.data)
            },
            [this.boardSettingWrapper.DROG_TYPE.DATAFILTER]: () => {
              this.$EventBus.$emit('drop:dataFilter', this.data)
            }
          }

          const fun = drops[this.dropType]
          if (fun) {
            fun()
          }
        }
      })
    }
  }
}
</script>
