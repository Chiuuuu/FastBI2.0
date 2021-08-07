<template>
  <div class="pagination">
    <div
      v-for="(page, index) in pages"
      :key="page.id"
      @click="toOtherPage(page.id)"
    >
      <a-dropdown
        :trigger="['contextmenu']"
        v-model="page.showDropDown"
        placement="topCenter"
      >
        <div
          :class="[
            'page',
            {
              'current-select': currentPageId === page.id
            }
          ]"
          draggable
          @dragstart="handleDragStart($event, page)"
          @dragover.prevent="handleDragOver($event, page)"
          @dragenter="handleDragEnter($event, page)"
          @dragend="handleDragEnd($event, page)"
        >
          {{ page.name
          }}<input
            ref="input"
            @blur="onBlur(page)"
            @dblclick="renameTab(page, index)"
            :class="['page-input', { 'not-show': !page.isFocus }]"
            v-model="showName"
          />
        </div>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="copyTab(page, index)">复制</a-menu-item>
          <a-menu-item key="2" @click="renameTab(page, index)"
            >重命名</a-menu-item
          >
          <a-menu-item
            key="3"
            @click="deleteTab(page, index)"
            :disabled="pages.length === 1"
            >删除</a-menu-item
          >
        </a-menu>
      </a-dropdown>
    </div>
    <a-icon
      v-if="canEdit"
      class="page-icon"
      @click="addPage"
      type="plus-square"
    />
  </div>
</template>

<script>
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'
import { mapActions, mapGetters } from 'vuex'
import { Loading } from 'element-ui'
export default {
  props: {
    canEdit: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      showName: '',
      dragItem: null
    }
  },
  methods: {
    ...mapActions(['SetCanvasRange', 'SetPageId', 'getScreenDetail']),
    // 页签跳转
    toOtherPage(id) {
      // 当前页已经选中不需要跳转
      if (id === this.currentPageId) {
        return
      }
      this.SetPageId(id)
      if (this.isScreen) {
        this.$parent.changeTab && this.$parent.changeTab(id) // screen全屏下重置数据
        !this.$parent.changeTab && this.changeTab(id)
      } else {
        // 编辑页面跳转
        this.$router.replace({
          name: 'screenEdit',
          query: {
            id: this.screenId,
            tabId: id
          }
        })
      }
    },
    changeTab(pageId) {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage')
      })
      // 切换页签数据
      this.getScreenDetail({
        id: this.screenId,
        tabId: pageId,
        needRefresh: true
      }).then(res => {
        loadingInstance.close()
      })
    },
    getTabsData() {
      return this.$server.screenManage
        .getScreenTabs(this.screenId)
        .then(res => {
          if (res.code === 200) {
            this.pages = res.rows.map(item =>
              Object.assign(item, { showDropDown: false, isFocus: false })
            )
            return true
          } else {
            res.msg && this.$message.error(res.msg)
          }
        })
    },
    addPage() {
      // 页面最多10个
      if (this.pages.length < 10) {
        // 获取页面上是页面X的格式的序号
        let noList = []
        this.pages.forEach(item => {
          if (/页面\d/.test(item.name)) {
            noList.push(
              parseInt(
                item.name.replace(
                  /页面(\d)(\(.*?\))?/gi,
                  (match, targetValue) => {
                    return targetValue
                  }
                )
              )
            )
          }
        })
        // 取页面x最大的数字作为新页面的名称
        let no = noList.length === 0 ? 1 : Math.max(...noList) + 1
        let name = `页面${no}`

        let params = {
          name: name,
          orderNo: this.pages.length + 1,
          screenId: this.screenId,
          setting: this.orginPageSettings
        }
        this.$server.screenManage.addScreenTab(params).then(res => {
          if (res.code === 200) {
            // 新增tab成功跳转到新tab
            this.toOtherPage(res.data)
            this.getTabsData()
          }
        })
      } else {
        this.$message.error('最多只能添加10个页签')
      }
    },
    // 格式化复制页签名称
    getCopyName(name, i) {
      let copyName = `${name}(${i})`
      // 如果复制后缀出现重名，序号往上叠加
      if (this.pages.some(item => item.name === copyName)) {
        return this.getCopyName(name, i + 1)
      }
      return copyName
    },
    copyTab(page, index) {
      page.showDropDown = false
      // 页面最多10个
      if (this.pages.length < 10) {
        let copyName = this.getCopyName(page.name, 1)
        let params = {
          name: copyName,
          orderNo: page.orderNo,
          screenId: this.screenId,
          id: page.id,
          setting: this.pageSettings
        }
        this.$server.screenManage.copyScreenTab(params).then(res => {
          if (res.code === 200) {
            this.getTabsData().then(res => {
              this.saveOrder()
            })
          }
        })
      } else {
        this.$message.error('最多只能添加10个页签')
      }
    },
    renameTab(page, index) {
      this.showName = page.name
      page.isFocus = true
      page.showDropDown = false
      this.$refs.input[index].select()
    },
    // 失去焦点的时候重命名
    onBlur(page) {
      // 防止碰到透明input触发调接口
      if (!page.isFocus) {
        return
      }
      // 如果修改名称没有值，名称不变化
      if (!this.showName || this.showName === page.name) {
        page.isFocus = false
        return
      }
      let params = {
        name: this.showName,
        orderNo: page.orderNo,
        screenId: this.screenId,
        id: page.id
      }
      this.$server.screenManage.renameScreenTab(params).then(res => {
        if (res.code === 200) {
          page.isFocus = false
          page.name = this.showName
        } else {
          res.msg && this.$message.error(res.msg)
          page.isFocus = false
        }
      })
    },
    deleteTab(page, index) {
      this.$confirm({
        title: '确认提示',
        content: `是否确认删除页签${page.name}?`,
        onOk: async () => {
          const res = await this.$server.screenManage.deleteScreenTab(page.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            // 如果删除的是当前选中的页签，跳转到上一个页签,如果是第一页就跳转到第二页
            if (this.$route.query.tabId === page.id) {
              this.toOtherPage(
                index === 0 ? this.pages[1].id : this.pages[index - 1].id
              )
              this.getTabsData().then(res => {
                this.saveOrder()
              })
              return
            }
            // 删除的不是选中的直接删除不跳转
            this.pages.splice(index, 1)
          } else {
            res.msg && this.$message.error(res.msg)
          }
        }
      })
    },
    saveOrder() {
      // 修改页签的orderNo
      this.pages.forEach((item, index) => {
        item.orderNo = index + 1
      })

      this.$server.screenManage.orderScreenTab(this.pages).then(res => {
        if (res.code !== 200) {
          res.msg && this.$message.error(res.msg)
        }
      })
    },
    // 开始拖拽
    handleDragStart(e, item) {
      this.dragItem = item
    },
    //  结束拖拽清空数据
    handleDragEnd(e, item) {
      this.dragItem = null
    },
    handleDragOver(e) {
      e.dataTransfer.dropEffect = 'move'
    },
    handleDragEnter(e, item) {
      // 为需要移动的元素设置dragstart事件
      e.dataTransfer.effectAllowed = 'move'
      if (item === this.dragItem) {
        return
      }
      // 把拖拽的块挤进来
      const newItems = [...this.pages]
      const src = newItems.indexOf(this.dragItem)
      const dst = newItems.indexOf(item)
      newItems.splice(dst, 0, ...newItems.splice(src, 1))
      this.pages = newItems

      this.saveOrder()
    }
  },
  computed: {
    ...mapGetters([
      'screenId',
      'pageList',
      'currentPageId',
      'isScreen',
      'pageSettings',
      'orginPageSettings',
      'screenId'
    ]),
    pages: {
      get() {
        return this.pageList
      },
      set(value) {
        this.$store.dispatch('SetPageList', value)
      }
    }
  }
}
</script>
