<template>
  <a-spin class="sheet_list scrollbar" :spinning="loading">
    <div v-if="list.length > 0">
      <div
        class="sheet_list_item"
        v-for="item in list"
        :key="item.id"
        :draggable="isDrag"
        @mouseleave.stop="handleMouseLeave"
        @mousedown.stop="handleMouseDown"
        @dragstart.stop="handleLeftDragStart($event, item)"
        @dragend.stop="handleLeftDragEnd"
        :title="item.name"
      >
        <span>{{ item.name }}</span>
        <template v-if="type==='sql'">
          <div class="u-icon eye"><a-icon type="eye" @click="handleOpenTableInfo(item)"/></div>
          <div class="u-icon edit"><a-icon type="edit" @click="handleSQLEdit(item)"/></div>
          <div class="u-icon delete"><a-icon type="delete" @click="handleSQLDelete(item)"/></div>
        </template>
        <template v-else>
          <div class="u-icon delete"><a-icon type="eye" @click="handleOpenTableInfo(item)"/></div>
        </template>
      </div>
    </div>
    <template v-else-if="keywords.length > 0">
      <a-empty style="margin-top:50px;color:#000" v-if="type !=='sql'" :description="description"></a-empty>
    </template>
    <render-table-info
      :isShow="isRenderTable"
      @close="handleCloseModal"
      :item="modalData"
    ></render-table-info>
  </a-spin>
</template>
<script>
import assign from 'lodash/assign'
import RenderTableInfo from './setting/renderTableInfo.vue'
export default {
  name: 'model-edit-left',
  inject: ['nodeStatus'],
  components: {
    RenderTableInfo
  },
  props: {
    detailInfo: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    },
    keywords: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isDrag: false,
      loading: true,
      modalData: {},
      isRenderTable: false
    }
  },
  computed: {
    description() {
      if (this.keywords.length === 0) {
        return '数据源未进行数据抽取，请先抽取数据'
      } else {
        return '暂无数据'
      }
    }
  },
  watch: {
    list: {
      immediate: true,
      handler(newValue) {
        this.loading = false
      }
    }
  },
  methods: {
    handleCloseModal() {
      this.isRenderTable = false
    },
    handleOpenTableInfo(item) {
      this.isRenderTable = true
      this.modalData = assign({}, item)
    },
    handleSQLEdit(item) {
      this.$emit('edit', item)
    },
    handleSQLDelete(item) {
      this.$emit('delete', item)
    },
    handleMouseDown() {
      this.isDrag = true
    },
    handleMouseLeave() {
      this.isDrag = false
    },
    handleLeftDragStart(event, data) {
      this.nodeStatus = Object.assign(this.nodeStatus, {
        dragType: 'menu',
        dragNode: {
          ...data,
          tableId: data.id
        },
        event
      })
    },
    handleLeftDragEnd() {
      this.$emit('on-left-drag-leave')
    }
  }
}
</script>
