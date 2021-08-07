<template>
  <div
    class="u-bitem edit"
    :class="[
      className,
      itemData.tableNo === 0 && itemData.status === 1 ? 'error' : ''
    ]"
    ref="file"
  >
    <div class="txt">
      <div class="icon"><img :src="imgURI" /></div>
      <div class="name" :class="{ 'line-through': !itemData.visible }">
        {{ itemData.alias }}
      </div>
    </div>
    <span class="menu" v-if="hasContextmenus && itemData.visible">
      <span class="caret-down" @click="handleCreateMenu"></span>
    </span>
  </div>
</template>
<script>
import ContextMenu from '@/components/dataSource/contextmenu'
import { addClass, removeClass } from 'bin-ui/src/utils/dom'
export default {
  name: 'PanelItem',
  props: {
    className: {
      required: true,
      type: String,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ['dimensions', 'measures'].indexOf(value) !== -1
      }
    },
    itemData: {
      type: Object,
      default: () => {}
    },
    detailInfo: {
      type: Object,
      default: () => {}
    },
    imgURI: {
      type: String,
      default: ''
    },
    contextmenus: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  mounted() {
    if (this.hasContextmenus) {
      this.initContextMenu()
    }
  },
  beforeDestroy() {
    if (this.hasContextmenus) {
      this.destoryContextMenu()
    }
  },
  computed: {
    hasContextmenus() {
      return this.contextmenus.length !== 0
    }
  },
  methods: {
    initContextMenu() {
      this.$refs.file &&
        this.$refs.file.addEventListener('contextmenu', this.handleConextMenu)
    },
    destoryContextMenu() {
      this.$refs.file &&
        this.$refs.file.removeEventListener(
          'contextmenu',
          this.handleConextMenu
        )
    },
    handleConextMenu(e) {
      e.preventDefault()
      this.handleCreateMenu(e)
    },
    handleCreateMenu(e) {
      e.stopPropagation()
      const that = this
      // 每次点击获取他的原始数据类型
      let _dataType = this.itemData.dataType
      console.log('原始数据类型', _dataType)
      addClass(this.$refs.file, 'file-active')
      function addEvent(target) {
        target.$$fun = function() {
          Array.prototype.push.call(arguments, that)
          target.onClick.apply(this, arguments)
        }
      }
      const produceType = this.itemData.produceType
      const contextmenus = that.contextmenus.filter(item => {
        if (produceType !== 0) {
          return item
        } else {
          if (item.type !== 'custom') {
            return item
          }
        }
      })
      this.contenxtmenu = new ContextMenu({
        vm: that,
        menus: contextmenus.map(item => {
          if (item['children'] && item.children.length) {
            item.children.forEach(subitem => {
              if (subitem.dataType === _dataType) {
                subitem.name = `还原为${subitem.name.split('为')[1]}`
              }
              addEvent(subitem)
            })
          } else {
            addEvent(item)
          }
          return item
        }),
        customStyle: () => {
          return {
            left:
              this.className === 'dimensions'
                ? `${e.clientX}px`
                : `${e.clientX - 180}px`,
            top: `${e.clientY - (contextmenus.length + 1) * 28}px`
          }
        },
        handleMarkCancel: function() {
          removeClass(that.$refs.file, 'file-active')
        }
      })
    }
  }
}
</script>
