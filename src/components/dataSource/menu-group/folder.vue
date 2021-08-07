<template>
  <div class="dropable">
    <div
      class="folder dragable"
      ref="folder"
      @click="handleFolderOpen"
      @dragover.stop="handleDragOver"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
    >
      <h4 class="title" :title="folder.name">
        <a-icon v-if="folderOpen" type="folder-open" class='folder-icon'/>
        <a-icon v-else type="folder" class='folder-icon'/>
        <span class="title-span">{{ folder.name }}</span>
      </h4>
      <span class="menu" v-if="hasContextmenus">
        <span class="caret-down" @click="handleCreateMenu"></span>
      </span>
    </div>
    <ul class="items" v-if="handleHasFile(folder, 'children')" v-show="folderOpen">
      <template v-for="(file, index) in folder.children">
        <slot name="file" :file="file" :index="index">
          <menu-file
            :key="file.name"
            :file="file"
            :index="index"
            :parent="folder"
          ></menu-file>
        </slot>
      </template>
    </ul>
  </div>
</template>
<script>
import MenuFile from './file'
import ContextMenu from '@/components/dataSource/contextmenu'
import { addClass, removeClass } from 'bin-ui/src/utils/dom'
export default {
  name: 'menu-folder',
  props: {
    folder: {
      type: Object,
      default: function() {
        return null
      }
    },
    index: {
      type: Number,
      default: 0
    },
    contextmenus: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  components: {
    MenuFile
  },
  computed: {
    hasContextmenus() {
      return this.contextmenus.length !== 0
    }
  },
  data() {
    return {
      contenxtmenu: '',
      folderOpen: true
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
  methods: {
    initContextMenu() {
      this.$refs.folder && this.$refs.folder.addEventListener('contextmenu', this.handleConextMenu)
    },
    destoryContextMenu() {
      this.$refs.folder && this.$refs.folder.removeEventListener('contextmenu', this.handleConextMenu)
    },
    handleConextMenu(e) {
      e.preventDefault()
      this.handleCreateMenu(e)
    },
    handleDragOver(event) {
      event.preventDefault()
      addClass(this.$refs.folder, 'dragable-current')
    },
    handleDragLeave(event) {
      event.stopPropagation()
      removeClass(this.$refs.folder, 'dragable-current')
    },
    handleDrop(event) {
      event.stopPropagation()
      removeClass(this.$refs.folder, 'dragable-current')
      this.$emit('fileDrop', this.folder)
    },
    handleFolderOpen() {
      this.folderOpen = !this.folderOpen
    },
    handleCreateMenu(e) {
      e.stopPropagation()
      addClass(this.$refs.folder, 'folder-active')
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
          removeClass(that.$refs.folder, 'folder-active')
        }
      })
    },
    handleHasFile(folder, key) {
      return folder[key] && folder[key].length > 0
    }
  }
}
</script>
