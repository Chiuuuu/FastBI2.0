<template>
  <div class="drawing-board-page-tools">
    <div class="pagebar clearfix">
      <!-- 页面tab切换 start -->
      <div class="pagebar-left">
        <div class="btns-box clearfix">
          <div :class="['btn-left', { disabled: handleIsPrevDisable() }]" @click="handleTransitionTab('pre')">◀</div>
          <div :class="['btn-right', { disabled: handleIsNextDisable() }]" @click="handleTransitionTab('next')">▶</div>
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
          <ul v-if="tabs && tabs.length" ref="tabList" class="page-list">
            <li
              class="page-item"
              v-for="(tab, index) in tabs"
              :key="tab.id"
              :class="tab.id === value ? 'active' : ''"
              @click="handleTabChange(tab)"
            >
              <a-dropdown :trigger="['contextmenu']" placement="topCenter">
                <div class="page-item-box page-name">
                  {{ tab.name }}
                </div>
                <a-menu slot="overlay">
                  <!-- TODO:复制和重命名功能 -->
                  <a-menu-item key="copy">复制</a-menu-item>
                  <a-menu-item key="reset">重命名</a-menu-item>
                  <a-menu-item key="delete" @click="handleDeleteTab(tab, index)" :disabled="tabs.length === 1">
                    删除
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
              <!-- <input v-else ref="input" @blur="onBlur(page)" v-model="page.name" /> -->
            </li>
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
        return [parameter.PREVIEW, parameter.EDIT].indexOf(value) !== -1;
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
  },
  data() {
    return {
      parameter,
      showName: '',
      dragItem: null,
    };
  },
  methods: {
    /**
     * @description 上一页关闭
     */
    handleIsPrevDisable() {
      return this.tabs && this.tabs.length && this.value === this.tabs[0].id;
    },
    /**
     * @description 下一页关闭
     */
    handleIsNextDisable() {
      return this.tabs && this.tabs.length && this.value === this.tabs[this.tabs.length - 1].id;
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
      const index = type === 'next' ? this.tabIndex + 1 : this.tabIndex - 1;
      const page = this.tabs[index];
      this.handleTabChange({
        screenId: page.screenId,
        id: page.id,
      });
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
        this.$emit('add', {
          name: name,
          orderNo: this.tabs.length + 1,
        });
      } else {
        this.$message.error('最多只能添加10个页签');
      }
    },
    /**
     * @description 删除tab页面
     */
    handleDeleteTab(item, index) {
      this.$confirm({
        title: '确认提示',
        content: `是否确认删除页签${item.name}?`,
        onOk: () => {
          this.$emit('delete', {
            data: item,
            index,
          });
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
