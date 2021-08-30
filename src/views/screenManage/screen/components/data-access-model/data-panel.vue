<template>
  <div class="data-panel">
    <!-- 维度面板 start -->
    <div class="dimension-area">
      <div class="head">
        <h4 class="title">维度</h4>
        <!-- <div class="u-icon">＋</div> -->
      </div>
      <div class="body">
        <div class="schema-list-wrapper">
          <Collapse ref="dimensionList" class="schema-list reset-scrollbar js-schema-dimension-list">
            <template v-if="!handleIsArray(dimension)">
              <template v-if="dimension && Object.keys(dimension).length">
                <CollapsePanel
                  v-for="(value, name) in dimension"
                  :key="name"
                  class="schema-item"
                  :panel="name"
                  :header="value[0].tableName"
                >
                  <ul class="field-list">
                    <DataPanelItem
                      v-for="(item, index) in value"
                      :key="item.id"
                      type="dimension"
                      :data="item"
                      :field-index="name + ',' + index"
                      :selected="isSelected(item)"
                      @cancelSelect="handleCancelSelect"
                      @arrowClick="handleDimConextMenu"
                    ></DataPanelItem>
                  </ul>
                </CollapsePanel>
              </template>
              <a-empty description="暂无数据" v-else></a-empty>
            </template>
            <template v-else>
              <ul class="field-list" v-if="dimension && dimension.length">
                <DataPanelItem
                  v-for="(item, index) in dimension"
                  :key="item.id"
                  type="dimension"
                  :data="item"
                  :field-index="index"
                  :selected="isSelected(item)"
                  @cancelSelect="handleCancelSelect"
                  @arrowClick="handleDimConextMenu"
                ></DataPanelItem>
              </ul>
              <a-empty description="暂无数据" v-else></a-empty>
            </template>
          </Collapse>
        </div>
      </div>
    </div>
    <!-- 维度面板 end -->

    <!-- 度量面板 start -->
    <div class="measure-area">
      <div class="head">
        <h4 class="title">度量</h4>
        <!-- <div class="u-icon">＋</div> -->
      </div>
      <div class="body">
        <div class="schema-list-wrapper">
          <Collapse ref="measureList" class="schema-list reset-scrollbar js-schema-measure-list">
            <template v-if="!handleIsArray(measure)">
              <template v-if="measure && Object.keys(measure).length">
                <CollapsePanel
                  v-for="(value, name) in measure"
                  :key="name"
                  class="schema-item"
                  :panel="name"
                  :header="value[0].tableName"
                >
                  <ul class="field-list">
                    <DataPanelItem
                      v-for="(item, index) in value"
                      :key="item.id"
                      type="measure"
                      :data="item"
                      :field-index="name + ',' + index"
                      :selected="isSelected(item)"
                      @cancelSelect="handleCancelSelect"
                      @arrowClick="handleMeaConextMenu"
                    ></DataPanelItem>
                  </ul>
                </CollapsePanel>
              </template>
              <a-empty description="暂无数据" v-else></a-empty>
            </template>
            <template v-else>
              <ul class="field-list" v-if="measure && measure.length">
                <DataPanelItem
                  v-for="(item, index) in measure"
                  :key="item.id"
                  type="measure"
                  :data="item"
                  :field-index="index"
                  :selected="isSelected(item)"
                  @cancelSelect="handleCancelSelect"
                  @arrowClick="handleMeaConextMenu"
                ></DataPanelItem>
              </ul>
              <a-empty description="暂无数据" v-else></a-empty>
            </template>
          </Collapse>
        </div>
      </div>
    </div>
    <!-- 度量面板 end -->

    <!-- 地理字段设置 -->
    <GeoSetting
      v-if="createMapVisible"
      region="城市"
      :is-show="createMapVisible"
      :dimensions-data="createdMapData"
      @close="createMapVisible = false"
      @handleSave="handleSave"
    />
  </div>
</template>
<script>
import isArray from 'lodash/isArray';
import ContextMenu from '@/components/contextmenu';
import DataPanelItem from './data-panel-item.vue';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import GeoSetting from './data-geo-setting/data-geo-setting.vue';
export default {
  name: 'DataPanel',
  components: {
    DataPanelItem,
    GeoSetting,
  },
  props: {
    dimension: {
      type: [Array, Object],
      required: true,
    },
    measure: {
      type: [Array, Object],
      required: true,
    },
    selectFiled: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      contextMenuDim: [
        // 右键菜单
        {
          name: '转换为度量',
          onClick: this.handleChangeRole,
        },
        {
          name: '创建地理字段',
          children: [
            {
              name: '城市',
              onClick: this.handleCreateGeoRole,
            },
          ],
        },
      ],
      contextMenuMea: [
        // 右键菜单
        {
          name: '转换为维度',
          onClick: this.handleChangeRole,
        },
      ],
      createdMapData: {}, // 地理字段对象
      createMapVisible: false, // 控制地理字段设置modal
    };
  },
  mounted() {
    this.$EventBus.$on('drop:dimension-list', this.dropDimensionList);
    this.$EventBus.$on('drop:measure-list', this.dropMeasureList);
    const contextmenuDim = this.$refs.dimensionList;
    const contextmenuMea = this.$refs.measureList;
    contextmenuDim && contextmenuDim.$el.addEventListener('contextmenu', this.handleDimConextMenu);
    contextmenuMea && contextmenuMea.$el.addEventListener('contextmenu', this.handleMeaConextMenu);
  },
  beforeDestroy() {
    this.$EventBus.$off('drop:dimension-list', this.dropDimensionList);
    this.$EventBus.$off('drop:measure-list', this.dropMeasureList);
    const contextmenuDim = this.$refs.dimensionList;
    const contextmenuMea = this.$refs.measureList;
    contextmenuDim && contextmenuDim.$el.removeEventListener('contextmenu', this.handleDimConextMenu);
    contextmenuMea && contextmenuMea.$el.removeEventListener('contextmenu', this.handleMeaConextMenu);
  },
  methods: {
    handleIsArray(element) {
      return isArray(element);
    },
    /**
     * @description 取消搜索选中
     */
    handleCancelSelect() {
      this.$emit('cancelSelect');
    },
    handleSave() {},
    /**
     * @description 监听事件
     */
    handleDimConextMenu(e) {
      e.preventDefault();
      this.handleCreateMenu(e, 'dimension');
    },
    handleMeaConextMenu(e) {
      e.preventDefault();
      this.handleCreateMenu(e, 'measure');
    },
    /**
     * @description 事件委托: 判断是否点击到了item
     */
    judgeItemClick(e, type) {
      let flag = false;
      let target = e.target;
      if (target.classList.contains('js-field-item')) {
        flag = true;
      } else {
        target = target.parentNode;
        flag = target.classList.contains('js-field-item');
      }
      if (!flag) return flag;
      // 如果是嵌套数组, 则以','分隔索引值(逗号是特殊字符, 字段名不会包含)
      let index = target.dataset.index || '';
      index = index.split(',');
      let len = index.length;
      if (len < 1) return false;
      if (type === 'dimension') {
        return len === 1 ? this.dimension[index[0]] : this.dimension[index[0]][index[1]];
      } else if (type === 'measure') {
        return len === 1 ? this.measure[index[0]] : this.measure[index[0]][index[1]];
      } else {
        return false;
      }
    },
    /**
     * @description 创建右键菜单
     */
    handleCreateMenu(e, type) {
      e.stopPropagation();
      const res = this.judgeItemClick(e, type);
      if (!res) return;
      let contextMenu = [];
      if (type === 'dimension') {
        contextMenu = this.contextMenuDim;
      } else if (type === 'measure') {
        contextMenu = this.contextMenuMea;
      }
      const that = this;
      function addEvent(target) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that, res);
          target.onClick.apply(this, arguments);
        };
      }
      // eslint-disable-next-line no-new
      new ContextMenu({
        vm: that,
        menus: contextMenu.map(item => {
          if (item['children'] && item.children.length) {
            item.children.forEach(subitem => {
              addEvent(subitem);
            });
          } else {
            addEvent(item);
          }
          return item;
        }),
        target: e,
        handleMarkCancel: function () {},
      });
    },
    /**
     * @description 转换维度度量
     */
    handleChangeRole(e, item, vm, data) {
      if (data.role === 1) {
        // 维度转度量
        data.role = 2;
        this.$emit('changeRole', data, 'dimension', 'measure');
      } else if (data.role === 2) {
        // 度量转维度
        data.role = 1;
        this.$emit('changeRole', data, 'measure', 'dimension');
      }
    },
    /**
     * @description 创建地理角色
     */
    handleCreateGeoRole(e, item, vm, data) {
      data.modelId = this.resourceId;
      this.createdMapData = data;
      this.createMapVisible = true;
      data.showMore = false;
    },
    /**
     * @description 判断是否为选中
     */
    isSelected(item) {
      return item.id === this.selectFiled.id && item.name === this.selectFiled.name;
    },
    /**
     * @description 记录历史记录中
     */
    recordHistory(target, data, action) {
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'DatePanel',
        store: this.$store,
        target,
        item: data,
        action,
      });
    },
    dropDimensionList(item) {
      // 修改维度度量类型为维度
      item.role = 1;
      this.$emit('changeRole', item, 'measure', 'dimension');
    },
    dropMeasureList(item) {
      // 修改维度度量类型为度量
      item.role = 2;
      this.$emit('changeRole', item, 'dimension', 'measure');
    },
  },
};
</script>
<style lang="less">
.data-panel {
  height: 100%;
  .dimension-area,
  .measure-area {
    position: relative;
    height: 50%;
    overflow: hidden;
    padding-bottom: 8px;
    > .head {
      position: relative;
      > h4.title {
        height: 36px;
        line-height: 36px;
        text-indent: 16px;
        font-weight: 500;
        font-size: 12px;
      }
      > .u-icon {
        position: absolute;
        cursor: pointer;
        font-size: 22px;
        font-weight: 300;
        top: 50%;
        transform: translateY(-50%);
        right: 16px;
      }
    }
    > .body {
      height: calc(100% - 38px);
      .schema-list-wrapper {
        font-size: 12px;
        height: 100%;
      }
      .schema-list {
        height: 100%;
        overflow: auto;
        &.drop-start {
          border: 1px solid #4a90e2;
        }
        .schema-item {
          .collapse-item-header {
            height: 28px;
            line-height: 28px;
            overflow: hidden;
            word-wrap: normal;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
    .field-list {
      .field-item {
        padding-left: 20px;
        position: relative;
        &.selected,
        &:hover {
          background-color: #4a90e2;
          color: #fff;
          cursor: -webkit-grab;
          .prefix-icon {
            color: #fff;
          }
          .suffix-btn {
            display: block;
          }
        }
        .prefix-icon {
          display: block;
          float: left;
          width: 14px;
          font-size: 18px;
          margin-top: 2px;
        }
        > p {
          margin: 0;
          display: block;
          overflow: hidden;
          word-wrap: normal;
          white-space: nowrap;
          text-overflow: ellipsis;
          user-select: none;
          float: left;
          height: 28px;
          line-height: 28px;
          margin-left: 9px;
          width: calc(100% - 60px);
        }
        .suffix-btn {
          display: none;
          position: absolute;
          width: 16px;
          height: 16px;
          right: 20px;
          top: 50%;
          margin-top: -8px;
          &::after {
            content: '';
            width: 0;
            height: 0;
            position: absolute;
            left: 3px;
            top: 5px;
            border-width: 6px 5px;
            border-style: solid;
            border-color: transparent;
            border-top-color: #fff;
          }
        }
      }
    }
  }
  .dimension-area {
    border-bottom: 1px solid #ccc;
    .prefix-icon {
      color: #4a90e2;
    }
  }
  .measure-area {
    padding-bottom: 16px;
    .prefix-icon {
      color: #40c0a8;
    }
  }
}
</style>
