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
            <ul class="field-list">
              <template v-for="(item, index) in dimension">
                <DataPanelItem
                  :key="item.id"
                  type="dimension"
                  :data="item"
                  :field-index="index"
                  :selected="isSelected(item)"
                ></DataPanelItem>
              </template>
            </ul>
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
            <ul class="field-list">
              <template v-for="(item, index) in measure">
                <DataPanelItem
                  :key="item.id"
                  type="measure"
                  :data="item"
                  :field-index="index"
                  :selected="isSelected(item)"
                ></DataPanelItem>
              </template>
            </ul>
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
      :type="resourceType"
      @close="createMapVisible = false"
      @handleSave="handleSave"
    />
  </div>
</template>
<script>
import ContextMenu from '@/components/contextmenu';
import DataPanelItem from './data-panel-item.vue';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import GeoSetting from './data-geo-setting/data-geo-setting.vue';
export default {
  name: 'DataPanel',
  inject: ['getResourceType'],
  components: {
    DataPanelItem,
    GeoSetting,
  },
  props: {
    dimension: {
      type: Array,
      required: true,
    },
    measure: {
      type: Array,
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
          name: '转换为维度',
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
  computed: {
    resourceType() {
      return this.getResourceType();
    },
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
      if (target.classList.contains('field-item')) {
        flag = true;
      } else {
        target = target.parentNode;
        flag = target.classList.contains('field-item');
      }
      if (!flag) return flag;
      let index = target.dataset.index;
      if (type === 'dimension') {
        return this.dimension[index];
      } else if (type === 'measure') {
        return this.measure[index];
      } else {
        return false;
      }
    },
    /**
     * @description 创建右键菜单
     */
    handleCreateMenu(e, type) {
      e.stopPropagation();
      const data = this.judgeItemClick(e, type);
      if (!data) return;
      let contextMenu = [];
      if (type === 'dimension') {
        contextMenu = this.contextMenuDim;
      } else if (type === 'measure') {
        contextMenu = this.contextMenuMea;
      }
      const that = this;
      function addEvent(target) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that, data);
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
      let addList = [],
        deleList = [];
      if (data.role === 1) {
        // 维度转度量
        data.role === 2;
        addList = this.measure;
        deleList = this.dimension;
      } else if (data.role === 2) {
        // 度量转维度
        data.role === 1;
        addList = this.dimension;
        deleList = this.measure;
      }
      const target = [
        {
          method: 'add',
          list: addList,
        },
        {
          method: 'dele',
          list: deleList,
        },
      ];
      this.recordHistory(target, data, 'move');
    },
    /**
     * @description 创建地理角色
     */
    handleCreateGeoRole(e, item, vm, data) {
      debugger;
      data.modelId = this.resourceId;
      this.createdMapData = data;
      this.createMapVisible = true;
      data.showMore = false;
    },
    /**
     * @description 获取旋转div的样式
     */
    getRotateStyle(type = 'left') {
      const space = this.config.style.size.height > 10 ? this.config.style.size.height : 10;
      return {
        width: `${space}px`,
        height: `${space}px`,
        marginTop: `-${space / 2}px`,
        [type === 'left' ? 'left' : 'right']: `-${space}px`,
      };
    },
    isSelected(item) {
      return item.id === this.selectFiled.id && item.name === this.selectFiled.name;
    },
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
      item.role = 1;
      const target = [
        {
          method: 'add',
          list: this.dimension,
        },
        {
          method: 'dele',
          list: this.measure,
        },
      ];
      this.recordHistory(target, item, 'move');
    },
    dropMeasureList(item) {
      item.role = 2;
      const target = [
        {
          method: 'add',
          list: this.measure,
        },
        {
          method: 'dele',
          list: this.dimension,
        },
      ];
      this.recordHistory(target, item, 'move');
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
    .prefix-icon {
      color: #40c0a8;
    }
  }
}
</style>
