<template>
  <div class="drawing-board-page-tools">
    <div class="pagebar clearfix">
      <!-- 页面tab切换 start -->
      <div class="pagebar-left">
        <div class="btns-box clearfix">
          <div class="btn-left">◀</div>
          <div class="btn-right">▶</div>
        </div>
      </div>
      <div class="pagebar-middle">
        <div class="pagebar-center">
          <ul class="page-list">
            <li
              class="page-item"
              v-for="tab in tabs"
              :key="tab.id"
              :class="tab.id === value ? 'active' : ''"
              @click="handleChange(item)"
            >
              {{ tab.name }}
            </li>
          </ul>
          <div class="page-add">+</div>
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
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { mutationTypes as boardMutaion } from '@/store/modules/board';
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
  },
  methods: {
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
     * @description 页面tab切换
     */
    handleChange(item) {
      this.$emit('change', item);
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
          cursor: not-allowed;
          color: #ccc;
        }
      }
    }
    &-middle {
      .pagebar-center {
        .page-list {
          overflow: hidden;
          .page-item {
            float: left;
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
              color: #fff;
            }
          }
        }
        .page-add {
          float: left;
          width: 40px;
          text-align: center;
          height: 31px;
          line-height: 31px;
          border-right: solid 1px #eaeaeb;
          cursor: pointer;
        }
      }
    }
    &-right {
      float: left;
      position: absolute;
      top: 0;
      right: 0;
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
