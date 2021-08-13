<template>
  <!-- 工具栏 start -->
  <header class="drawing-board-header">
    <!-- logo start -->
    <div class="drawing-board-header-logo"></div>
    <!-- logo end -->

    <!-- 大屏名称 start -->
    <div class="drawing-board-title">
      <span class="board-name-box" title="未命名大屏">
        <input type="text" placeholder="请输入大屏标题" :value="screenName" @blur="handleChangeScreenName" />
        <!-- <span>未命名大屏</span> -->
      </span>
    </div>
    <!-- 大屏名称 end -->

    <!-- 按钮工具栏 start -->
    <div class="drawing-board-toolbar clearfix">
      <div class="toolbar-left">
        <ul class="btns-box clearfix">
          <!-- 保存按钮 start -->
          <li class="btn-item">
            <div class="tool-icon">
              <i class="bi-data bi-data-save"></i>
            </div>
          </li>
          <!-- 保存按钮 end -->
          <!-- 撤销按钮 start -->
          <li class="btn-item" :class="undoDisable ? 'disabled' : ''">
            <div class="tool-icon" @click="handleUndo">
              <i class="bi-data bi-data-undo"></i>
            </div>
          </li>
          <!-- 撤销按钮 end -->
          <!-- 还原按钮 start -->
          <li class="btn-item" :class="redoDisable ? 'disabled' : ''">
            <div class="tool-icon" @click="handleRedo">
              <i class="bi-data bi-data-redo"></i>
            </div>
          </li>
          <!-- 还原按钮 end -->
          <!-- 刷新按钮 start -->
          <li class="btn-item">
            <div class="tool-icon">
              <i class="bi-data bi-data-refresh"></i>
            </div>
          </li>
          <!-- 刷新按钮 end -->
        </ul>
      </div>
      <!-- 按钮工具栏 end -->
      <!-- 图表工具栏 start -->
      <div class="toolbar-middle">
        <ul class="btns-box cleafix">
          <li class="btn-item">
            <div class="tool-btn">
              <div class="u-icon">
                <i class="bi-data bi-data-line-chart"></i>
              </div>
              <span class="text">图表</span>
            </div>
            <div class="chart-list-wrap">
              <ul class="chart-list">
                <li
                  class="chart-item"
                  v-for="chart in chartList"
                  :key="chart.name"
                  @click.stop="handleAddChart(chart.type)"
                >
                  {{ chart.name }}
                  <div class="sub-chart-wrap">
                    <ul class="sub-chart-list">
                      <li
                        v-for="subchart in chart.sub"
                        :key="subchart.name"
                        @click.stop="handleAddChart(subchart.type)"
                      >
                        {{ subchart.name }}
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
          <!-- 图表工具栏 end -->
          <!-- 文本框 start -->
          <li class="btn-item">
            <div class="tool-btn" @click="handleAddChart(BoardType.Text)">
              <div class="u-icon">
                <i class="bi-data bi-data-line-chart"></i>
              </div>
              <span class="text">文本框</span>
            </div>
          </li>
          <!-- 文本框 end -->
          <!-- 图片 start -->
          <li class="btn-item">
            <div class="tool-btn" @click="handleAddChart(BoardType.Image)">
              <div class="u-icon">
                <i class="bi-data bi-data-line-chart"></i>
              </div>
              <span class="text">图片</span>
            </div>
          </li>
          <!-- 图片 end -->
          <!-- 形状 start -->
          <li class="btn-item">
            <div class="tool-btn">
              <div class="u-icon">
                <i class="bi-data bi-data-line-chart"></i>
              </div>
              <span class="text">形状</span>
            </div>
            <div class="chart-list-wrap">
              <ul class="chart-list">
                <li
                  class="chart-item"
                  v-for="shape in shapeList"
                  :key="shape.name"
                  @click.stop="handleAddChart(shape.type)"
                >
                  {{ shape.name }}
                </li>
              </ul>
            </div>
          </li>
          <!-- 形状 end -->
          <!-- 素材库 start -->
          <li class="btn-item" @click="openSourceModal">
            <div class="tool-btn">
              <div class="u-icon">
                <i class="bi-data bi-data-line-chart"></i>
              </div>
              <span class="text">素材库</span>
            </div>
          </li>
          <!-- 素材库 end -->
        </ul>
      </div>
      <!-- 图表工具栏 end -->
      <!-- 预览退出 start -->
      <div class="toolbar-right">
        <ul class="btns-box cleafix">
          <li class="btn-item">
            <div class="tool-btn" @click="handlePreview">
              <div class="u-icon">
                <a-icon type="fullscreen" />
              </div>
              <span class="text">预览</span>
            </div>
          </li>
          <li class="btn-item">
            <div class="tool-btn" @click="handleOutEdit">
              <div class="u-icon">
                <a-icon type="close" />
              </div>
              <span class="text">退出</span>
            </div>
          </li>
        </ul>
      </div>
      <!-- 预览退出 end -->

      <!-- 素材库模态框 -->
      <ScreenSourceModal
        :visible="sourceModalVisible"
        @close="sourceModalVisible = false"
        @sourceSelect="getSelectedSource"
      />
    </div>
  </header>
  <!-- 工具栏 end -->
</template>
<script>
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import generateID from '@/utils/generateID';
import chartList from '@/config/chart-list';
import shapeList from '@/config/shape-list';
import BoardType from '@/views/screenManage/screen/setting/default-type';
import boardSetting from '@/views/screenManage/screen/setting';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import { mapState } from 'vuex';
import ScreenSourceModal from '../components/screen-source/modal';

/**
 * @description 编辑大屏菜单工具栏
 */
export default {
  name: 'DrawingBoardHeader',
  data() {
    return {
      parameter,
      chartList, // 图表列表
      shapeList, // 形状列表
      BoardType, // 图表类型
      screenName: '未命名大屏',
      sourceModalVisible: false, // 素材库模态框
    };
  },
  components: {
    ScreenSourceModal,
  },
  computed: {
    ...mapState({
      model: state => state.board.model,
    }),
    undoDisable() {
      // 是否可用撤销
      return !(this.$store.state.history.historyRecordIndex > -1);
    },
    redoDisable() {
      // 是否可用重做
      return !(this.$store.state.history.historyRecordIndex < this.$store.state.history.historyRecordList.length - 1);
    },
  },
  methods: {
    /**
     * @description 打开素材库
     */
    openSourceModal() {
      this.sourceModalVisible = true;
    },
    /**
     * @description 获取选中的素材库
     */
    getSelectedSource(data) {
      console.log(data);
      const mergeObj = {
        setting: {
          data: {
            imgUrl: data.filePath,
            name: data.name,
          },
          style: {
            title: {
              text: data.name,
            },
          },
        },
      };
      this.handleAddChart(BoardType.Source, mergeObj);
      this.sourceModalVisible = false;
    },
    /**
     * @description 获取形状列表
     */
    getShapList() {},
    /**
     * @description 添加图表
     */
    handleAddChart(type, mergeObj = {}) {
      const id = generateID();
      const component = merge(
        cloneDeep(boardSetting[type]),
        {
          id,
          setting: {
            style: {
              title: {
                text: `未命名图表${id}`,
              },
            },
          },
        },
        mergeObj,
      );
      this.$store.commit(boardMutaion.ADD_COM, {
        component,
      });
    },
    /**
     * @description 撤销功能
     */
    handleUndo() {
      this.$store.commit(historyMutation.UNDO);
    },
    /**
     * @description 还原功能
     */
    handleRedo() {
      this.$store.commit(historyMutation.REDO);
    },
    /**
     * @description 大屏命名
     */
    handleChangeScreenName(event) {
      const value = event.target.value;
      if (!value) return (event.target.value = this.screenName);
      this.screenName = value;
    },
    /**
     * @description 大屏预览
     */
    handlePreview() {
      this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
        model: this.parameter.FULLSCREEN,
      });
    },
    /**
     * @description 大屏退出
     */
    handleOutEdit() {
      this.$router.push({
        name: 'catalog',
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import url('../../../../assets/less/common/variables.less');
.@{board}-header {
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: #141720;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
  z-index: 1;
  &-logo {
    float: left;
    width: 48px;
    height: 64px;
    background: #057fd9;
  }
  .@{board}-title {
    position: absolute;
    left: 60px;
    top: 5px;
    min-width: 100px;
    height: 22px;
    line-height: 20px;
    z-index: 1;
    -webkit-user-select: text;
    -moz-user-select: text;
    user-select: text;
    .board-name-box {
      position: static;
      display: block;
      & > span {
        max-width: 345px;
        min-width: 176px;
        color: #fff;
        font-size: 14px;
        display: inline-block;
        overflow: hidden;
        padding: 0 4px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      & > input[type='text'] {
        width: 345px;
        max-width: 345px;
        min-width: 176px;
        height: 20px;
        line-height: 20px;
        padding: 0 0 0 3px;
        font-size: 14px;
        color: #fff;
        border: 1px solid transparent;
        background: transparent;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        margin: auto 0;
        outline: none;
        &:hover {
          border-color: hsla(0, 0%, 100%, 0.3);
        }
        &:focus + span {
          display: none;
        }
      }
    }
  }
}
.@{board}-toolbar {
  color: #fff;
  position: relative;
  height: 100%;
  .toolbar-left {
    position: absolute;
    top: 30px;
    left: 48px;
    height: 30px;
    min-width: 200px;
    margin-left: 12px;
    z-index: 1;
    .btns-box {
      margin-left: -4px;
      .btn-item {
        padding: 0;
        cursor: pointer;
        margin-top: 0;
        margin-left: 8px;
        &.disabled {
          .bi-data {
            color: #999;
          }
        }
        &:first-child {
          margin-left: 0;
        }
        .tool-icon {
          width: 24px;
          height: 24px;
          text-align: center;
        }
        .bi-data {
          display: inline-block;
          margin: 0px auto 2px auto;
          font-size: 21px;
          color: #fff;
        }
      }
    }
  }
  .toolbar-middle {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    white-space: nowrap;
    width: 100%;
    text-align: center;
    z-index: 0;

    .btn-item {
      &:hover {
        .chart-list-wrap {
          display: block;
        }
      }
    }

    .chart-list-wrap {
      display: none;
      position: absolute;
      top: 54px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      box-shadow: 0 2px 4px 0 rgba(214, 214, 214, 0.5);
      border-radius: 2px;

      .chart-list {
        width: 112px;
        min-height: 366px;
        padding-bottom: 17px;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
        background-color: #f0f2f5;
        .chart-item {
          line-height: 32px;
          padding: 0 15px;
          color: #282828;
          font-size: 12px;
          background-clip: padding-box;
          cursor: default;
          position: relative;
          &:hover {
            background-color: #fff;
            box-shadow: 0 2px 5px rgba(150, 150, 150, 0.4);
            .sub-chart-wrap {
              display: block;
            }
          }
          &:first-child {
            margin-top: 0;
          }
          .sub-chart-wrap {
            display: none;
            position: absolute;
            top: 0;
            left: 100%;
            width: 300px;
            background-color: #fff;
            .sub-chart-list {
              padding: 0 30px;
              overflow: hidden;
              > li {
                float: left;
                width: 50%;
                cursor: pointer;
                &:hover {
                  color: #103ffa;
                }
              }
            }
          }
        }
      }
    }
  }
  .toolbar-right {
    position: absolute;
    right: 0;
    margin-right: 16px;
    z-index: 1;
    .u-icon {
      .anticon {
        font-size: 24px;
        margin-top: 6px;
      }
    }
  }
  .btns-box {
    height: 64px;
    display: inline-block;
    li.btn-item {
      float: left;
      height: 52px;
      padding: 4px 8px;
      cursor: pointer;
      position: relative;
      .tool-btn {
        font-size: 12px;
        text-align: center;
        padding-top: 1px;
        color: #f8f8f8;
      }
      .u-icon {
        display: block;
        width: 24px;
        height: 30px;
        margin: 0px auto 2px auto;
        color: #fff;
        .bi-data {
          font-size: 24px;
        }
      }
      .text {
        line-height: 16px;
        color: #ccc;
      }
    }
  }
}
</style>
