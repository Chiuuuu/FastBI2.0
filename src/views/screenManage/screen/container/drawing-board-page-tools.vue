<template>
  <div class="drawing-board-page-tools">
    <div class="pagebar clearfix">
      <!-- 页面tab切换 start -->
      <div class="pagebar-left">
        <div class="btns-box clearfix">
          <div :class="['btn-left', { disabled: tabIndex < 1 }]" @click="handleTransitionTab('prev')">◀</div>
          <div :class="['btn-right', { disabled: rightBtnDisabled }]" @click="handleTransitionTab('next')">▶</div>
        </div>
      </div>
      <!-- 页面tab切换 end -->
      <div class="pagebar-right">
        <!-- 页面比例设置 start -->
        <div class="tool-scale">
          <span class="num" ref="js-slider-result">{{ boardScale }}%</span>
          <div class="zoomer out" @click="handleChangeScale('subtraction', 0.01)">－</div>
          <Slider
            class="range-box"
            :value="boardScale"
            @change="handleSliderChange"
            @afterChange="handleAfaterSliderChange"
          >
            <div class="mark-middle"></div>
          </Slider>
          <div class="zoomer in" @click="handleChangeScale('add', 0.01)">＋</div>
          <!-- <div class="auto-width">[＋]</div>
          <div class="auto-screen-width">[＋]</div> -->
        </div>
        <!-- 页面比例设置 end -->
      </div>
      <!-- 中间tab页 -->
      <div class="pagebar-middle clearfix" ref="tabArea">
        <div class="pagebar-center">
          <ul ref="tabList" class="page-list" :style="{ left: tabAreaPositionLeft + 'px' }">
            <li
              v-for="(page, index) in pages"
              :key="page.id"
              @click="toOtherPage(page.id)"
              :class="['page-item', { active: currentPageId === page.id }]"
            >
              <a-dropdown
                v-if="!page.isFocus"
                :trigger="['contextmenu']"
                v-model="page.showDropDown"
                placement="topCenter"
              >
                <div
                  class="page-item-box page-name"
                  draggable
                  @dblclick="renameTab(page, index)"
                  @dragstart="handleDragStart($event, page)"
                  @dragover.prevent="handleDragOver($event, page)"
                  @dragenter="handleDragEnter($event, page)"
                  @dragend="handleDragEnd($event, page)"
                >
                  {{ page.name }}
                </div>
                <a-menu slot="overlay">
                  <a-menu-item key="1" @click="copyTab(page, index)">复制</a-menu-item>
                  <a-menu-item key="2" @click="renameTab(page, index)">重命名</a-menu-item>
                  <a-menu-item key="3" @click="deleteTab(page, index)" :disabled="pages.length === 1">删除</a-menu-item>
                </a-menu>
              </a-dropdown>
              <input v-else ref="input" @blur="onBlur(page)" v-model="page.name" />
            </li>
          </ul>
        </div>
        <div class="page-add" @click="addPage">+</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { mutationTypes as boardMutaion } from '@/store/modules/board';
import { Loading } from 'element-ui';
import Slider from '@/components/slider/slider';

/**
 * @description 编辑大屏底部工具栏
 */
export default {
  name: 'DrawdingBoardPageTools',
  props: {
    tabs: {
      // 标签列表
      type: Array,
      required: true,
    },
    value: {
      type: [String, Number],
      default: '',
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  components: {
    Slider,
  },
  computed: {
    ...mapState({
      boardScale: state => {
        return (state.board.scale * 100).toFixed(0);
      },
    }),
    ...mapGetters([
      'screenId',
      'pageList',
      'currentPageId',
      'isScreen',
      'pageSettings',
      'orginPageSettings',
      'screenId',
    ]),
    pages: {
      get() {
        return this.pageList;
      },
      set(value) {
        this.$store.dispatch('SetPageList', value);
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.handleShowTableList('resize');
      window.addEventListener('resize', this.handleResize);
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  data() {
    return {
      showName: '',
      dragItem: null,
      rightBtnDisabled: true, // 控制tab翻页按钮
      tabIndex: 0, // 记录当前列表显示的第一个tab位置
      tabAreaPositionLeft: 0, // tab列表偏移量
    };
  },
  methods: {
    ...mapActions(['SetCanvasRange', 'SetPageId', 'getScreenDetail']),
    /**
     * @description 监听窗口变动
     */
    handleResize() {
      this.handleShowTableList('resize');
    },
    /**
     * @description 滑块改变
     */
    handleSliderChange(value) {
      this.$refs['js-slider-result'].innerHTML = value + '%';
    },
    /**
     * @description 比例设置
     */
    handleChangeScale(type, step) {
      let scale = this.$store.state.board.scale;
      if (type === 'add') {
        scale = +(this.$store.state.board.scale + step).toFixed(2);
        scale = Math.min(1, scale);
      } else {
        scale = +(this.$store.state.board.scale - step).toFixed(2);
        scale = Math.max(0, scale);
      }
      this.$store.commit(boardMutaion.SET_BOARD_SCALE, {
        scale,
      });
    },
    /**
     * @description 滑块改变之后
     */
    handleAfaterSliderChange(value) {
      this.$store.commit(boardMutaion.SET_BOARD_SCALE, {
        scale: value,
      });
    },
    /**
     * @description tabList翻页
     */
    handleTransitionTab(type) {
      if (type === 'next') {
        this.tabIndex++;
        this.handleShowTableList(type);
      } else if (type === 'prev') {
        this.tabIndex--;
        this.handleShowTableList(type);
      }
    },
    /**
     * @description 统一处理tab栏状态
     */
    handleShowTableList(type) {
      const { disabled, offset } = this.handleTableListPosition(type);
      this.rightBtnDisabled = disabled;
      this.tabAreaPositionLeft += offset;
    },
    /**
     * @description 重新计算tab页区域宽度, 并处理显示的tab
     */
    handleTableListPosition(type) {
      // 避免递归的时候频繁触发Vue更新机制, 先用变量接收最终再return出去
      let disabled = this.rightBtnDisabled;
      let offset = 0;
      if (this.pageList.length < 1) return { disabled, offset };
      if (this.$refs.tabArea) {
        const tabAreaWidth = this.$refs.tabArea.offsetWidth - 40; // -40的按钮宽度
        // 计算当前显示的tab和宽度
        const tabList = [].slice.call(this.$refs.tabList.children, this.tabIndex);
        const width = [].reduce.call(tabList, (total, next) => total + next.offsetWidth, 0);
        const offsetWidth = this.$refs.tabList.children[this.tabIndex].offsetWidth;
        /**
         * width > tabAreaWidth 用于判断当前总长度是否大于可视宽度(需要重新计算position)
         * disabled判断下一页按钮是否可用
         */
        if (type === 'prev') {
          // 上一页
          offset += offsetWidth;
          disabled = false;
        } else if (type === 'next') {
          // 下一页
          offset -= offsetWidth;
          disabled = width <= tabAreaWidth;
        } else if (type === 'push') {
          // 新增tab
          if (width > tabAreaWidth) {
            this.tabIndex++;
            offset -= offsetWidth;
            // 递归, 往左偏移, 将tab页推到最后一个位置
            const result = this.handleTableListPosition('push');
            offset += result.offset;
            disabled = result.disabled;
          } else {
            disabled = true; // 关闭翻页按钮
          }
        } else if (type === 'resize') {
          // 缩放窗口
          if (width > tabAreaWidth) {
            disabled = width <= tabAreaWidth;
          } else {
            if (this.tabIndex > 0) {
              this.tabIndex--;
              offset += offsetWidth;
              // 递归, 往右偏移, 直到展示出所有tab为止
              const result = this.handleTableListPosition('resize');
              offset += result.offset;
              disabled = result.disabled;
            } else {
              disabled = true;
            }
          }
        }
        return { disabled, offset };
      }
    },
    /**
     * @description 页面tab切换
     */
    handleTabChange() {
      // this.$router.push({
      //   name: 'screenEditor',
      //   params: {
      //     id: 1,
      //   },
      //   query: {
      //     tid: 2,
      //   },
      // });
    },
    /**
     * @description 页签跳转
     */
    toOtherPage(id) {
      // 当前页已经选中不需要跳转
      if (id === this.currentPageId) {
        return;
      }
      this.SetPageId(id);
      if (this.isScreen) {
        this.$parent.changeTab && this.$parent.changeTab(id); // screen全屏下重置数据
        !this.$parent.changeTab && this.changeTab(id);
      } else {
        // 编辑页面跳转
        this.$router.replace({
          name: 'screenEdit',
          query: {
            id: this.screenId,
            tabId: id,
          },
        });
      }
    },
    /**
     * @description 页面tab切换
     */
    changeTab(pageId) {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage'),
      });
      // 切换页签数据
      this.getScreenDetail({
        id: this.screenId,
        tabId: pageId,
        needRefresh: true,
      }).then(() => {
        loadingInstance.close();
      });
    },
    /**
     * @description 获取tab列表
     */
    getTabsData() {
      return this.$server.screenManage.getScreenTabs(this.screenId).then(res => {
        if (res.code === 200) {
          this.pages = res.rows.map(item => Object.assign(item, { showDropDown: false, isFocus: false }));
          return true;
        } else {
          res.msg && this.$message.error(res.msg);
        }
      });
    },
    /**
     * @description 添加tab
     */
    addPage() {
      // 页面最多10个
      if (this.pages.length < 10) {
        // 获取页面上是页面X的格式的序号
        let noList = [];
        this.pages.forEach(item => {
          if (/页面\d/.test(item.name)) {
            noList.push(
              parseInt(
                item.name.replace(/页面(\d)(\(.*?\))?/gi, (match, targetValue) => {
                  return targetValue;
                }),
              ),
            );
          }
        });
        // 取页面x最大的数字作为新页面的名称
        let no = noList.length === 0 ? 1 : Math.max(...noList) + 1;
        let name = `页面${no}`;

        // let params = {
        //   name: name,
        //   orderNo: this.pages.length + 1,
        //   screenId: this.screenId,
        //   setting: this.orginPageSettings,
        // };
        // this.$server.screenManage.addScreenTab(params).then(res => {
        //   if (res.code === 200) {
        //     // 新增tab成功跳转到新tab
        //     this.toOtherPage(res.data);
        //     this.getTabsData();
        //   } else {
        //     this.$message.error(res.msg || '请求错误');
        //   }
        // });
        this.pages.push({ id: no, name, showDropDown: false, isFocus: false });
        this.$nextTick(() => {
          this.handleShowTableList('push');
        });
      } else {
        this.$message.error('最多只能添加10个页签');
      }
    },
    /**
     * @description 格式化复制页签名称
     */
    getCopyName(name, i) {
      let copyName = `${name}(${i})`;
      // 如果复制后缀出现重名，序号往上叠加
      if (this.pages.some(item => item.name === copyName)) {
        return this.getCopyName(name, i + 1);
      }
      return copyName;
    },
    /**
     * @description 复制tab
     */
    copyTab(page) {
      page.showDropDown = false;
      // 页面最多10个
      if (this.pages.length < 10) {
        let copyName = this.getCopyName(page.name, 1);
        let params = {
          name: copyName,
          orderNo: page.orderNo,
          screenId: this.screenId,
          id: page.id,
          setting: this.pageSettings,
        };
        this.$server.screenManage.copyScreenTab(params).then(res => {
          if (res.code === 200) {
            this.getTabsData().then(() => {
              this.saveOrder();
            });
          }
        });
      } else {
        this.$message.error('最多只能添加10个页签');
      }
    },
    /**
     * @description 重命名tab
     */
    renameTab(page, index) {
      // this.showName = page.name;
      page.isFocus = true;
      page.showDropDown = false;
      this.$nextTick(() => {
        this.$refs.input[index] && this.$refs.input[index].select();
      });
    },
    /**
     * @description 失去焦点的时候重命名
     */
    onBlur(page) {
      // 防止碰到透明input触发调接口
      if (!page.isFocus) {
        return;
      }
      // 如果修改名称没有值，名称不变化
      if (!this.showName || this.showName === page.name) {
        page.isFocus = false;
        return;
      }
      let params = {
        name: this.showName,
        orderNo: page.orderNo,
        screenId: this.screenId,
        id: page.id,
      };
      this.$server.screenManage.renameScreenTab(params).then(res => {
        if (res.code === 200) {
          page.isFocus = false;
          page.name = this.showName;
        } else {
          res.msg && this.$message.error(res.msg);
          page.isFocus = false;
        }
      });
    },
    /**
     * @description 删除tab
     */
    deleteTab(page, index) {
      this.$confirm({
        title: '确认提示',
        content: `是否确认删除页签${page.name}?`,
        onOk: async () => {
          const res = await this.$server.screenManage.deleteScreenTab(page.id);
          if (res.code === 200) {
            this.$message.success('删除成功');
            // 如果删除的是当前选中的页签，跳转到上一个页签,如果是第一页就跳转到第二页
            if (this.$route.query.tabId === page.id) {
              this.toOtherPage(index === 0 ? this.pages[1].id : this.pages[index - 1].id);
              this.getTabsData().then(() => {
                this.saveOrder();
              });
              return;
            }
            // 删除的不是选中的直接删除不跳转
            this.pages.splice(index, 1);
          } else {
            res.msg && this.$message.error(res.msg);
          }
        },
      });
    },
    /**
     * @description 修改页签的orderNo
     */
    saveOrder() {
      this.pages.forEach((item, index) => {
        item.orderNo = index + 1;
      });

      this.$server.screenManage.orderScreenTab(this.pages).then(res => {
        if (res.code !== 200) {
          res.msg && this.$message.error(res.msg);
        }
      });
    },
    /**
     * @description 拖拽事件开始
     */
    handleDragStart(e, item) {
      this.dragItem = item;
    },
    /**
     * @description 拖拽事件结束, 清空数据
     */
    handleDragEnd() {
      this.dragItem = null;
    },
    handleDragOver(e) {
      e.dataTransfer.dropEffect = 'move';
    },
    handleDragEnter(e, item) {
      // 为需要移动的元素设置dragstart事件
      e.dataTransfer.effectAllowed = 'move';
      if (item === this.dragItem) {
        return;
      }
      // 把拖拽的块挤进来
      const newItems = [...this.pages];
      const src = newItems.indexOf(this.dragItem);
      const dst = newItems.indexOf(item);
      newItems.splice(dst, 0, ...newItems.splice(src, 1));
      this.pages = newItems;

      this.saveOrder();
    },
  },
};
</script>
<style lang="less" scoped>
@import url('../../../../assets/less/common/variables.less');
.@{board}-page-tools {
  bottom: 0;
  right: @board-setting-width;
  height: 32px;
  background-color: #f9fafb;
  transition: left 0.3s ease-in-out, right 0.3s ease-in-out;
  .pagebar {
    border-top: 1px solid #eaeaeb;
    &-left {
      width: 44px;
      height: 31px;
      float: left;
      border-right: solid 1px #eaeaeb;
      .btns-box {
        font-size: 12px;
        .btn-left {
          float: left;
          margin-top: 9px;
          margin-left: 4px;
          cursor: pointer;
        }
        .btn-right {
          float: right;
          margin-top: 9px;
          margin-right: 4px;
          cursor: pointer;
        }
        .disabled {
          cursor: not-allowed;
          pointer-events: none;
          color: #ccc;
        }
      }
    }
    &-middle {
      margin-left: 44px;
      margin-right: 172px;
      display: flex;
      .pagebar-center {
        height: 31px;
        overflow: hidden;
        .page-list {
          position: relative;
          top: 0;
          left: 0;
          white-space: nowrap;
          .page-item {
            display: inline-block;
            min-width: 70px;
            max-width: 154px;
            padding-left: 10px;
            padding-right: 10px;
            overflow: hidden;
            word-wrap: normal;
            white-space: nowrap;
            text-overflow: ellipsis;
            height: 31px;
            line-height: 31px;
            text-align: center;
            border-right: solid 1px #eaeaeb;
            cursor: pointer;
            font-size: 12px;
            background: #f9fafb;
            color: #666;
            &:hover,
            &.active {
              background: #103ffa;
              .page-name {
                color: #fff;
              }
            }

            .page-item-box {
              min-width: 50px;
              max-width: 134px;
              height: 31px;
            }
          }
        }
      }
      .page-add {
        flex-shrink: 0;
        margin-right: auto;
        width: 40px;
        text-align: center;
        height: 31px;
        line-height: 31px;
        border-right: solid 1px #eaeaeb;
        cursor: pointer;
      }
    }
    &-right {
      float: right;
      width: 172px;
      .tool-scale {
        position: relative;
        height: 31px;
        line-height: 31px;
        .num {
          cursor: pointer;
          padding-right: 8px;
          color: #666;
          font-size: 12px;
          border-right: solid 1px #eaeaeb;
          position: relative;
          top: 2px;
          vertical-align: top;
        }
        .zoomer {
          display: inline-block;
          width: 20px;
          font-size: 16px;
          text-align: center;
          color: #8f8f8f;
          font-weight: bold;
          cursor: pointer;
          vertical-align: top;
        }
        .range-box {
          display: inline-block;
          position: relative;
          width: 88px;
          height: 32px;
          top: 49%;
          margin: 0 5px;
          .mark-middle {
            position: absolute;
            top: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 1px;
            height: 12px;
            background: #aaa;
          }
          .range {
            position: relative;
            height: 4px;
            background: #ccc;
            border: 0px;
            margin-right: 6px;
            margin-top: 15px;
            .origin {
              border: 2px solid #8f8f8f;
              height: 16px;
              width: 16px;
              border-radius: 50%;
              position: absolute;
              left: 0;
              top: -6px;
              background-color: #fff;
            }
          }
        }
        .auto-width,
        .auto-screen-width {
          display: inline-block;
          color: #8f8f8f;
          padding: 0 5px;
          border-left: solid 1px #eaeaeb;
          vertical-align: top;
          font-size: 14px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
