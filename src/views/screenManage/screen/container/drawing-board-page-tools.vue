<template>
  <div :class="['drawing-board-page-tools', { 'full-screen': isFullScreenBar }]">
    <div class="pagebar clearfix">
      <!-- 页面tab切换 start -->
      <div class="pagebar-left" v-if="!isFullScreenBar">
        <div class="btns-box clearfix">
          <div :class="['btn-left', { disabled: firstTabIndex < 1 }]" @click="handleTransitionTab('prev')">◀</div>
          <div :class="['btn-right', { disabled: rightBtnDisabled }]" @click="handleTransitionTab('next')">▶</div>
        </div>
      </div>
      <!-- 页面tab切换 end -->
      <div class="pagebar-right" v-if="!isFullScreenBar">
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
      <div :class="['pagebar-middle', 'clearfix', { 'full-screen': isFullScreenBar }]" ref="tabArea">
        <div class="pagebar-center">
          <ul v-if="tabs && tabs.length" ref="tabList" class="page-list" :style="{ left: tabAreaPositionLeft + 'px' }">
            <template v-for="(tab, index) in tabs">
              <li
                class="page-item"
                v-if="type === parameter.EDIT"
                :key="tab.id"
                :class="tab.id === value ? 'active' : ''"
                @click="handleTabChange(tab)"
                @dblclick="handleRenameTab(tab, index)"
                draggable
                @dragstart="handleDragStart($event, tab)"
                @dragover.prevent="handleDragOver($event, tab)"
                @dragend="handleDragEnd($event, tab)"
                @drop="handleDrop($event, tab)"
              >
                <a-dropdown v-if="renameIndex !== index" :trigger="['contextmenu']" placement="topCenter">
                  <a-tooltip :title="tab.name">
                    <div class="page-item-box page-name">
                      {{ tab.name }}
                    </div>
                  </a-tooltip>
                  <a-menu slot="overlay">
                    <!-- TODO:复制和重命名功能 -->
                    <a-menu-item key="copy" @click="handleCopyTab(tab)">复制</a-menu-item>
                    <a-menu-item key="reset" @click="handleRenameTab(tab, index)">重命名</a-menu-item>
                    <a-menu-item key="delete" @click="handleDeleteTab(tab, index)" :disabled="tabs.length === 1">
                      删除
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
                <input v-else ref="input" @blur="onBlur(tab)" v-model="renameValue" />
              </li>
              <li
                v-else
                :key="tab.id"
                class="page-item"
                :class="tab.id === value ? 'active' : ''"
                @click="handleTabChange(tab)"
              >
                <div class="page-item-box page-name">
                  {{ tab.name }}
                </div>
              </li>
            </template>
          </ul>
        </div>
        <div v-if="handleIsShowButtonAdd()" class="page-add" @click="handleAddPage">+</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import Slider from '@/components/slider/slider';
import { checkFullScreen } from '@/utils';

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
    limit: {
      // 限制个数
      type: Number,
      default: 10,
    },
    value: {
      // 当前值
      type: [String, Number],
      default: '',
    },
    type: {
      // 编辑区类型
      type: String,
      required: true,
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return [parameter.PREVIEW, parameter.EDIT, parameter.FULLSCREEN].indexOf(value) !== -1;
      },
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
    tabIndex() {
      // 页面下标
      return this.tabs.findIndex(tab => tab.id === this.value) || 0;
    },
    isFullScreenBar() {
      return this.type === parameter.FULLSCREEN;
    },
    fullScreen() {
      return checkFullScreen();
    },
  },
  watch: {
    fullScreen(val) {
      if (this.isFullScreenBar) {
        return;
      }
      if (val) {
        window.removeEventListener('resize', this.handleResize);
      } else {
        this.$nextTick(() => {
          this.handleShowTableList('resize');
          window.addEventListener('resize', this.handleResize);
        });
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.handleShowTableList('resize');
      if (this.isFullScreenBar) {
        return;
      }
      window.addEventListener('resize', this.handleResize);
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  data() {
    return {
      parameter,
      dragItem: null,
      rightBtnDisabled: true, // 控制tab翻页按钮
      firstTabIndex: 0, // 记录当前列表显示的第一个tab位置
      tabAreaPositionLeft: 0, // tab列表偏移量
      renameIndex: -1, // 重命名tab的index
      renameValue: '', // 重命名的值
    };
  },
  methods: {
    /**
     * @description 监听窗口变动
     */
    handleResize() {
      this.handleShowTableList('resize');
    },
    /**
     * @description 判断是否显示添加按钮
     */
    handleIsShowButtonAdd() {
      return this.type === this.parameter.EDIT && this.tabs && this.tabs.length < this.limit;
    },
    /**
     * @description 滑块改变
     */
    handleSliderChange(value) {
      this.$refs['js-slider-result'].innerHTML = value + '%';
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
    handleDrop(e, item) {
      // 为需要移动的元素设置dragstart事件
      e.dataTransfer.effectAllowed = 'move';
      if (item === this.dragItem) {
        return;
      }
      this.$emit('drag', {
        dragItem: this.dragItem,
        currentItem: item,
      });
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
     * @description tab页面翻页
     */
    handleTransitionTab(type) {
      if (type === 'next') {
        this.firstTabIndex++;
        this.handleShowTableList(type);
      } else if (type === 'prev') {
        this.firstTabIndex--;
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
      if (this.tabs.length < 1) return { disabled, offset };
      if (this.$refs.tabArea) {
        const tabAreaWidth = this.$refs.tabArea.offsetWidth - 40; // -40的按钮宽度
        // 计算当前显示的tab和宽度
        const tabList = [].slice.call(this.$refs.tabList.children, this.firstTabIndex);
        const width = [].reduce.call(tabList, (total, next) => total + next.offsetWidth, 0);
        const offsetWidth = this.$refs.tabList.children[this.firstTabIndex].offsetWidth;
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
            this.firstTabIndex++;
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
            if (this.firstTabIndex > 0) {
              this.firstTabIndex--;
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
    handleTabChange(page, needSave = true) {
      this.$emit(
        'change',
        {
          tabId: page.id,
          screenId: page.screenId,
        },
        needSave,
      );
    },
    /**
     * @description 添加tab
     */
    handleAddPage() {
      // 页面最多10个
      if (this.tabs.length < 10) {
        let max = 1;
        this.tabs.forEach(item => {
          if (/页面\d/.test(item.name)) {
            const num = parseInt(item.name.replace(/页面(\d)(\(.*?\))?/gi, (match, targetValue) => targetValue));
            max = Math.max(max, num);
          }
        });
        // 取页面x最大的数字作为新页面的名称
        let name = `页面${max + 1}`;
        this.$emit(
          'add',
          {
            name: name,
            orderNo: this.tabs.length + 1,
          },
          () => {
            this.$nextTick(() => {
              this.handleShowTableList('push');
            });
          },
        );
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
      if (this.tabs.some(item => item.name === copyName)) {
        return this.getCopyName(name, i + 1);
      }
      return copyName;
    },
    /**
     * @description 复制tab
     */
    handleCopyTab(tab) {
      // 页面最多10个
      if (this.tabs.length < 10) {
        let copyName = this.getCopyName(tab.name, 1);
        const params = {
          name: copyName,
          orderNo: tab.orderNo,
          id: tab.id,
        };
        this.$emit('copy', params, () => {
          this.$nextTick(() => {
            this.handleShowTableList('push');
          });
        });
      } else {
        this.$message.error('最多只能添加10个页签');
      }
    },
    /**
     * @description 重命名tab
     */
    handleRenameTab(tab, index) {
      this.renameValue = tab.name;
      this.renameIndex = index;
      tab.isFocus = true;
      this.$nextTick(() => {
        this.$refs.input[index] && this.$refs.input[index].select();
      });
    },
    /**
     * @description 失去焦点的时候重命名
     */
    onBlur(tab) {
      // 防止碰到透明input触发调接口
      if (!this.renameIndex === this.tabIndex) {
        return;
      }
      // 如果修改名称没有值，名称不变化
      if (!this.renameValue || this.renameValue === tab.name) {
        this.renameIndex = -1;
        return;
      }
      let params = {
        name: this.renameValue,
        orderNo: tab.orderNo,
      };
      this.$emit('rename', params, () => {
        tab.name = this.renameValue;
        this.renameIndex = -1;
        this.renameValue = '';
      });
    },
    /**
     * @description 删除tab页面
     */
    handleDeleteTab(item, index) {
      this.$confirm({
        title: '确认提示',
        content: `是否确认删除页签${item.name}?`,
        onOk: () => {
          this.$emit(
            'delete',
            {
              data: item,
              index,
            },
            () => {
              this.$nextTick(() => {
                this.handleShowTableList('resize');
              });
            },
          );
        },
      });
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
      margin-right: 180px;
      display: flex;
      &.full-screen {
        margin: 0;
      }
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
              background: #677cf7;
              .page-name {
                color: #fff;
              }
            }

            .page-item-box {
              min-width: 50px;
              max-width: 134px;
              height: 31px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              word-break: break-all;
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
