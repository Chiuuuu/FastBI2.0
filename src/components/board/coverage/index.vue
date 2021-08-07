<!-- 左侧栏 -->
<template>
  <div class="board-coverage" :style="config.style">
    <div flex="dir:top" style="height: 100%;">
      <div class="header-title" v-show="config.title.enable" flex="main:center">
        <span v-if="coverageExpand">{{ config.title.text }}</span>
        <a-icon :type="coverageExpand ? 'menu-fold' : 'menu-unfold'"
                class="coverage-icon" @click="toggleCollapsed" />
      </div>
      <div class="control" :class="{'selected':currentSelected}" v-if="coverageExpand">
        <!-- 控制器（4个按钮） -->
        <div class="context-menu-item"
            v-for="item in menuList" :key="item.order"
            @click="handleCommand(item)">
          <b-icon v-if="coverageExpand" :name="item.icon" :title="item.text"></b-icon>
        </div>
      </div>
      <div class="control-body" flex-box="1" >
        <div class="body-wrap" @click="cancelSelected">
          <b-scrollbar style="height: 100%;">
            <slot></slot>
          </b-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapActions } from 'vuex'

  export default {
    name: 'BoardCoverage',
    props: {
      config: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        menuList: [
          { icon: 'md-arrow-round-up', text: '上移一层', order: 'up' },
          { icon: 'md-arrow-round-down', text: '下移一层', order: 'down' },
          { icon: 'ios-share', text: '置顶', order: 'top' },
          { icon: 'ios-download', text: '置底', order: 'bottom' }
        ],
        coverageConfig: {}
      }
    },
    computed: {
      ...mapGetters(['currentSelected', 'coverageExpand', 'pageSettings', 'canvasMap', 'screenId'])
    },
    methods: {
      ...mapActions(['saveScreenData']),
      // transform点击事件
      cancelSelected () {
        this.$store.dispatch('SingleSelected', null)
      },
      //  执行菜单命令
      handleCommand (item) {
        if (this.currentSelected) {
          this.$message.info(item.text)
          this.$store.dispatch('ContextMenuCommand', item.order) // canvasMaos中的actions里的ContextMenuCommand方法
          this.saveScreenData()
        }
      },
      // 点击展开收起
      toggleCollapsed () {
        this.$emit('toggleCollapsed', this.collapsed)
      }
    }
  }
</script>
