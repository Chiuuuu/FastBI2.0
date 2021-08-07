<template>
  <li
    class="item dragable"
    :class="isSelect ? 'file-active':''"
    :title="file[fileName]"
    :index="index"
    ref="file"
    draggable
    @dragstart="handleFileDragStart"
    @dragend="handleFileDragEnd"
    @click="handleFileSelect"
  >
    <h4 class="title" :title="file[fileName]">
      <a-icon type="file" v-if="icon === 'default'" style="margin-right: 2px;"/>
      <div class="file-icon icon-bg icon-model" v-else-if="icon === 'dataModel'"/>
      <div :class="['file-icon', 'icon-bg', 'icon-' + file.type]" v-else/>
      <span>{{ file[fileName] }}</span>
    </h4>
    <span class="menu" v-if="hasContextmenus">
      <span class="caret-down" @click.stop="handleCreateMenu"></span>
    </span>
  </li>
</template>
<script>
import ContextMenu from '@/components/dataSource/contextmenu'
import { addClass, removeClass } from 'bin-ui/src/utils/dom'
export default {
  name: 'menu-group-node',
  props: {
    file: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    parent: {
      type: Object,
      default: function() {
        return null
      }
    },
    index: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: 'default'
    },
    isSelect: {
      type: Boolean,
      default: false
    },
    contextmenus: {
      type: Array,
      default: function() {
        return []
      }
    },
    fileName: {
      type: String,
      default: 'name'
    }
  },
  data() {
    return {
      contenxtmenu: '',
      // fileIcon: this.icon === 'default' ? '' : require(`@/assets/images/icon_${this.icon}.png`),
      fileIcon: this.icon === 'default' ? '' : require(`@/assets/images/common/types.png`)
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
      this.$refs.file && this.$refs.file.addEventListener('contextmenu', this.handleConextMenu, false)
    },
    destoryContextMenu() {
      this.$refs.file && this.$refs.file.removeEventListener('contextmenu', this.handleConextMenu, false)
    },
    handleConextMenu(e) {
      e.preventDefault()
      this.handleCreateMenu(e)
    },
    handleFileSelect() {
      this.file.parentId = this.parent ? this.parent.id : 0
      this.$emit('fileSelect', this.file)
    },
    handleFileDragStart(e) {
      e.stopPropagation()
      this.file.parentId = this.parent ? this.parent.id : 0
      this.$emit('fileDrag', this.file)
    },
    handleFileDragEnd(e) {
      this.$emit('fileDrag', '')
    },
    handleCreateMenu(e) {
      e.stopPropagation()
      addClass(this.$refs.file, 'file-active')
      const that = this
      this.contenxtmenu = new ContextMenu({
        vm: that,
        menus: that.contextmenus.map(item => {
          item.$$fun = function () {
              Array.prototype.push.call(arguments, that)
              item.onClick.apply(this, arguments)
          }
          return item
        }),
        target: e,
        handleMarkCancel: function() {
          removeClass(that.$refs.file, 'file-active')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .icon-bg {
    background: url("../../../assets/images/common/types.png") no-repeat;
    background-size: 110px 16px;
  }
  .icon-2 { // oracle
    background-position: 0 0;
  }
  .icon-11 { // excel
    background-position: -18px 0;
  }
  .icon-5 { // hive
    background-position: -36px 0;
  }
  .icon-1 { // mysql
    background-position: -54px 0;
  }
  .icon-12 { // csv
    background-position: -72px 0;
  }
  .icon-model { // 数据模型
    background-position: -94px 0;
  }
</style>
