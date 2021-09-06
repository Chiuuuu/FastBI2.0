<template>
  <!-- 工具栏 start -->
  <header class="drawing-board-header">
    <!-- logo start -->
    <div class="drawing-board-header-logo"></div>
    <!-- logo end -->

    <!-- 大屏名称 start -->
    <div class="drawing-board-title">
      <span class="board-name-box" :title="screenInfo.screenName">
        <input type="text" placeholder="请输入大屏标题" :value="screenInfo.screenName" @blur="handleChangeScreenName" />
      </span>
    </div>
    <!-- 大屏名称 end -->

    <!-- 按钮工具栏 start -->
    <div class="drawing-board-toolbar clearfix">
      <div class="toolbar-left">
        <ul class="btns-box clearfix">
          <!-- 保存按钮 start -->
          <li class="btn-item">
            <div class="tool-icon" @click="handleSave" title="保存数据">
              <i class="bi-data bi-data-baocun"></i>
            </div>
          </li>
          <!-- 保存按钮 end -->
          <!-- 撤销按钮 start -->
          <li class="btn-item" :class="undoDisable ? 'disabled' : ''">
            <div class="tool-icon" @click="handleUndo" title="撤销操作">
              <i class="bi-data bi-data-qianjin"></i>
            </div>
          </li>
          <!-- 撤销按钮 end -->
          <!-- 还原按钮 start -->
          <li class="btn-item" :class="redoDisable ? 'disabled' : ''">
            <div class="tool-icon" @click="handleRedo" title="还原撤销">
              <i class="bi-data bi-data-houtui"></i>
            </div>
          </li>
          <!-- 还原按钮 end -->
          <!-- 刷新按钮 start -->
          <li class="btn-item">
            <div class="tool-icon" @click="handleRefresh" title="刷新大屏">
              <i class="bi-data bi-data-shuaxin"></i>
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
                <i class="bi-data bi-data-tubiao"></i>
              </div>
              <span class="text">图表</span>
            </div>
            <div class="chart-list-wrap">
              <ul class="chart-list">
                <li
                  v-for="chart in chartList"
                  class="chart-item"
                  :key="chart.name"
                  @click.stop="handleParentAddChart(chart)"
                >
                  {{ chart.name }}
                  <div class="sub-chart-wrap" v-if="chart.sub && chart.sub.length">
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
                <i class="bi-data bi-data-text"></i>
              </div>
              <span class="text">文本框</span>
            </div>
          </li>
          <!-- 文本框 end -->
          <!-- 图片 start -->
          <li class="btn-item">
            <div class="tool-btn" @click="handleAddChart(BoardType.Image)">
              <div class="u-icon">
                <i class="bi-data bi-data-img"></i>
              </div>
              <span class="text">图片</span>
            </div>
          </li>
          <!-- 图片 end -->
          <!-- 形状 start -->
          <li class="btn-item">
            <div class="tool-btn">
              <div class="u-icon">
                <i class="bi-data bi-data-xingzhuang"></i>
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
                <i class="bi-data bi-data-sucaiku"></i>
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
                <i class="bi-data bi-data-quanping"></i>
              </div>
              <span class="text">预览</span>
            </div>
          </li>
          <li class="btn-item">
            <div class="tool-btn" @click="handleOutEdit">
              <div class="u-icon">
                <i class="bi-data bi-data-tuichu"></i>
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
      <!-- 地图选择框 -->
      <MapSelectView :visible="mapSelectVisible" @close="mapSelectVisible = false" @ok="addMap" />
    </div>
  </header>
  <!-- 工具栏 end -->
</template>
<script>
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import chartList from '@/config/chart-list';
import shapeList from '@/config/shape-list';
import BoardType from '@/views/screenManage/screen/setting/default-type';
import boardSetting from '@/views/screenManage/screen/setting';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import { mapState } from 'vuex';
import ScreenSourceModal from '../components/screen-source/modal';
import MapSelectView from '../mapSelectView';
/**
 * @description 编辑大屏菜单工具栏
 */
export default {
  name: 'DrawingBoardHeader',
  props: {
    screenInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      parameter,
      chartList, // 图表列表
      shapeList, // 形状列表
      BoardType, // 图表类型
      sourceModalVisible: false, // 素材库模态框
      mapSelectVisible: false, // 地图选择框
    };
  },
  components: {
    ScreenSourceModal,
    MapSelectView,
  },
  computed: {
    ...mapState({
      model: state => state.board.model,
      // 组件列表
      components: state => state.board.components,
      page: state => state.board.page,
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
     * @description 添加地图
     */
    addMap(region) {
      this.handleAddChart('ChartMap', {}, region);
    },
    /**
     * @description 父节点添加图表
     */
    handleParentAddChart(chart) {
      if (chart && chart.sub && chart.sub.length) return;
      this.handleAddChart(chart.type);
    },
    /**
     * @description 添加图表
     */
    async handleAddChart(type, mergeObj = {}, mapOkRegion = '') {
      // 新建地图选择区域
      if (type === 'ChartMap' && !mapOkRegion) {
        this.mapSelectVisible = true;
        return;
      }
      let setting = cloneDeep(boardSetting[type]);
      if (mapOkRegion) {
        setting.setting.style.echart.geo.map = mapOkRegion;
      }

      const result = await this.$server.screenManage.addToGetChartId();
      if (result && result.code === 200) {
        // const len = this.components.length;
        const component = merge(
          setting,
          {
            id: result.data.id,
            setting: {
              style: {
                title: {
                  text: `未命名图表`,
                },
              },
            },
          },
          mergeObj,
        );
        this.$store.commit(boardMutaion.ADD_COM, {
          component,
        });
      } else {
        this.$message(result.msg || '添加图表失败');
      }
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
     * @description 刷新大屏
     */
    async handleRefresh() {
      const { id, tabId } = this.$route.query;
      this.$parent.getScreenDetailByTabId(id, tabId);
    },
    /**
     * @description 大屏命名
     */
    handleChangeScreenName(event) {
      const value = event.target.value;
      if (!value) return (event.target.value = this.screenInfo.screenName);
      this.$emit('changeName', value);
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
     * @description 保存数据
     */
    async handleSave() {
      const { tabId, id } = this.$route.query;
      const param = {
        name: this.screenInfo.screenName,
        screenId: id,
        id: tabId,
        graphs: this.components,
        setting: this.page,
      };
      this.exculdeDataLink();
      const result = await this.$server.screenManage.saveScreenTab(param);
      if (result && result.code === 200) {
        this.$message.success(result.msg);
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * @description 保存的时候切掉dataLink，联动不上传
     */
    exculdeDataLink() {
      this.components.forEach(chart => {
        if (chart.setting.data.dataLink) {
          delete chart.setting.data.dataLink;
        }
      });
    },
    /**
     * @description 大屏退出
     */
    handleOutEdit() {
      const query = this.$route.query;
      this.$router.push({
        name: 'catalog',
        query: {
          ...query,
        },
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
          font-size: 18px;
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
        width: 40px;
        height: 52px;
        cursor: pointer;
      }
      .u-icon {
        display: block;
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
