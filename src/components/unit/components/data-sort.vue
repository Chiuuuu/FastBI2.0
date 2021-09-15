<template>
  <div class="unit-data-filter">
    <div class="unit-field">
      <div class="dropable js-drop-data-sort" ref="js-dropable">
        <div class="drop-area">
          <div class="drop-body">
            <!-- 当有字段拖入的时候 start -->
            <div v-if="list.length" class="pillys">
              <div
                class="pilly-item mb-6"
                :style="{
                  backgroundColor: judgeFiledType(item.role) === 'dimensions' ? '#4a90e2' : '#40c0a8',
                  color: '#fff',
                }"
                v-for="item in list"
                :key="item.id"
              >
                <p class="text">
                  <icon-font
                    style="font-weight: bolder"
                    :type="item.asc === 1 ? 'icon-paixu-5' : 'icon-paixu-3'"
                  ></icon-font>
                  {{ formatAggregator(item) }}
                </p>
                <div class="suffix-btn" @click.stop="handleFiledOps($event, item)"></div>
              </div>
            </div>
            <!-- 当有字段拖入的时候 start -->
            <div class="body-empty">
              <p class="text">{{ label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="tip"></slot>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { addClass, removeClass } from '@/utils/dom';
import ContextMenu from '@/components/contextmenu';
import { arrayAddData, arrayDeleData } from '@/utils';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { DROG_TYPE } from '@/views/screenManage/screen/container/drawing-board-setting.vue';
import { Icon } from 'ant-design-vue';
const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2276651_mlklp2yb77i.js',
}); // 引入iconfont
/**
 * @description 数据排序设置
 */
export default {
  name: 'UnitDataSort',
  inject: ['boardSettingWrapper'],
  components: {
    IconFont,
  },
  props: {
    type: {
      // 类型
      type: String,
      default: '',
    },
    label: {
      // 标题
      type: String,
      required: true,
    },
    openAggre: {
      // 是否开启聚合函数
      type: Boolean,
      default: false,
    },
    list: {
      // 需要渲染的列表
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      polymerizeType: {
        normal: [
          { name: '升序', value: 1, onClick: this.handleFiledAsc },
          { name: '降序', value: 2, onClick: this.handleFiledAsc },
          { name: '移除', value: '', onClick: this.handleFiledDelete },
        ],
        dimensions: [
          {
            name: '聚合方式',
            children: [
              { name: '计数', value: 'COUNT', onClick: this.handFiledAggrengation },
              { name: '去重计数', value: 'COUNTD', onClick: this.handFiledAggrengation },
            ],
          },
        ],
        measures: [
          {
            name: '聚合方式',
            children: [
              { name: '求和', value: 'SUM', onClick: this.handFiledAggrengation },
              { name: '平均', value: 'AVG', onClick: this.handFiledAggrengation },
              { name: '最大值', value: 'MAX', onClick: this.handFiledAggrengation },
              { name: '最小值', value: 'MIN', onClick: this.handFiledAggrengation },
              { name: '计数', value: 'COUNT', onClick: this.handFiledAggrengation },
              { name: '去重计数', value: 'COUNTD', onClick: this.handFiledAggrengation },
            ],
          },
        ],
      },
      currentType: '', //当前选中的类型
      currentData: {}, //当前弹框字段数据
    };
  },
  computed: {
    ...mapState({
      currentCom: state => state.board.currentCom,
      dragdropState: state => state.dragdrop,
      resourceType: state => state.app.resourceType,
    }),
  },
  watch: {
    currentCom(val) {
      console.log(val, 'val-----');
    },
    dragdropState: {
      deep: true,
      handler(dragdrop) {
        // 如果状态不存在
        if (!dragdrop.status) return;

        this.currentType = this.judgeFiledType(dragdrop.data.role);

        // 根据状态执行方法
        const status = {
          dragmove: this.handleDragmove,
          dragend: this.handleDragend,
        };

        const fn = status[dragdrop.status];

        if (!fn) {
          return console.error(`There is no status: [${dragdrop.status}]`);
        }

        const dropDom = this.$refs['js-dropable'];
        fn(dropDom, dragdrop);
      },
    },
  },
  methods: {
    /**
     * @description 判断字段类型
     * @param {Number} role 字段类型 1维度，2度量
     */
    judgeFiledType(role) {
      return role === 1 ? 'dimensions' : 'measures';
    },
    /**
     * @description 校验鼠标是否在放置区中
     * @param {object} mouseEvent 鼠标
     * @param {object} target 放置区
     */
    checkMouseInTarget(mouseEvent, target) {
      if (target) {
        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;
        const left = target.getBoundingClientRect().left;
        const right = target.getBoundingClientRect().right;
        const top = target.getBoundingClientRect().top;
        const bottom = target.getBoundingClientRect().bottom;
        return x >= left && x <= right && y >= top && y <= bottom;
      } else {
        return false;
      }
    },
    /**
     * @description 判断拖拽是否在放置区
     */
    handleIsDragInDrop(target, dragdrop) {
      if (target) {
        const isMouseOnTarget = this.checkMouseInTarget(dragdrop.mouseEvent, target);
        if (isMouseOnTarget) {
          this.handleSetDragoverDropStyle(target);
        } else {
          this.handleSetDragleaveDropStyle(target);
        }
      }
    },
    /**
     * @description 设置拖拽进入放置区样式
     */
    handleSetDragoverDropStyle(drop) {
      drop && addClass(drop, 'drop-over');
    },
    /**
     * @description 设置拖拽离开放置区样式
     */
    handleSetDragleaveDropStyle(drop) {
      drop && removeClass(drop, 'drop-over');
    },
    /**
     * @description 设置拖拽移动过程
     */
    handleDragmove(dropDom, dragdrop) {
      // 拖拽过程中的样式
      addClass(dropDom, 'drop-start');

      // 判断是否拖拽是否在放置区
      this.handleIsDragInDrop(dropDom, dragdrop);
    },
    /**
     * @description 设置拖拽结束
     */
    handleDragend(dropDom, dragdrop) {
      // 依次样式
      removeClass(dropDom, 'drop-start');

      // 判断结束的时候，拖拽是否在放置区
      const isMouseOnTarget = this.checkMouseInTarget(dragdrop.mouseEvent, dropDom);
      if (isMouseOnTarget) {
        // 如果在，则放入
        this.handleDrop(dropDom, dragdrop);
      }
    },
    handleDrop(dropDom, dragdrop) {
      // 移除放入的样式
      this.handleSetDragleaveDropStyle(dropDom);
      this.handleDropField({
        dropType: this.type,
        data: dragdrop.data,
      });
    },
    /**
     * @description 校验当前图表是否清空了字段
     */
    isEmptyChart() {
      let listLen = 0;
      const data = this.currentCom.setting.data;
      Object.keys(data).forEach(key => {
        if (key === 'filter') {
          listLen += data[key].fileList.length;
          return;
        }
        if (Array.isArray(data[key])) {
          listLen += data[key].length;
        }
      });
      // 只有删除才会进这里，考虑异步没有执行完，长度-1
      if (listLen > 0) {
        listLen--;
      }
      if (listLen === 0) {
        return true;
      } else {
        return false;
      }
    },
    /**
     *  @description 设置数据id
     */
    handleSetDataModelId(result, method) {
      const dataModelId = this.currentCom.setting.data.dataModelId;

      if (!this.boardSettingRightInstance) {
        this.boardSettingRightInstance = this.boardSettingWrapper.$refs['js-board-setting-right'];
      }

      let selected = '';
      if (this.boardSettingRightInstance.tabAcitve === 'model') {
        if (this.boardSettingRightInstance.modelSelected) {
          selected = this.boardSettingRightInstance.modelSelected;
          result.resourceType = this.resourceType[this.boardSettingRightInstance.tabAcitve];
        }
      } else if (this.boardSettingRightInstance.tabAcitve === 'access') {
        if (this.boardSettingRightInstance.accessSelected) {
          selected = this.boardSettingRightInstance.accessSelected;
          result.resourceType = this.resourceType[this.boardSettingRightInstance.tabAcitve];
        }
      }

      if (!dataModelId && selected) {
        // 如果图表模型id为空并且有数据，则添加
        result.dataModelId = selected.tableId;
      } else if (dataModelId && !selected) {
        // 如果图表模型id有，但是没有数据，则清空
        result.dataModelId = '';
        return result;
      } else if (method === 'dele' && this.isEmptyChart()) {
        // 清空了图表的所有字段, 清空
        result.dataModelId = '';
        return result;
      } else if (dataModelId !== selected.tableId && method !== 'dele') {
        this.$message.error('一个图表只能拖入一个数据模型的字段');
        return;
      } else if (method === 'dele' && this.isEmptyChart()) {
        // 清空了图表的所有字段, 清空
        result.dataModelId = '';
      }
      return result;
    },
    /**
     * @description 字段放置之后执行
     * @param {object} options
     * @param {string} options.dropType 放置的类型
     * @param {any} options.data 放置的数据
     * @param {string} options.method 放置的方法
     */
    handleDropField({ dropType, data, method }) {
      const funs = {
        [DROG_TYPE.DATASORT]: this.handleSetDataSort,
      };

      const fun = funs[dropType];
      if (!fun) {
        return console.error(`There is no drag-in method: [${dropType}]`);
      }

      let result = fun(data, method);

      result = this.handleSetDataModelId(result, method);

      if (result && typeof result.justSkip === 'undefined') {
        this.$store.commit(historyMutation.COMMAND, {
          commandType: 'Data',
          target: this.currentCom,
          store: this.$store,
          eventBus: this.$EventBus,
          data: result,
        });
      }
    },
    /**
     * @description 列表公共处理方法
     * @param {array} list 列表
     * @param {any} data 数据
     * @param {string} method 方法
     */
    handleList(list, data, method = 'add') {
      if (method === 'add') {
        // 如果数据有重复则直接返回
        if (list.map(item => item.id).includes(data.id)) return list;

        arrayAddData(list, data);
      } else if (method === 'dele') {
        arrayDeleData(list, data);
      }
      return list;
    },
    /**
     * @description 当放置到数据排序
     */
    handleSetDataSort(data, method = 'add') {
      data = Object.assign({}, data, { asc: 1 }); //初始拖入默认升序 asc=1
      let sort = this.conversionArry('sort', data, method);
      return { sort };
    },
    /**
     * @description 公共转换成数组
     */
    conversionArry(key, data, method) {
      let arry = [].concat(this.currentCom.setting.data[key]);
      arry = this.handleList(arry, data, method);
      return arry;
    },
    /**
     * @description 字段删除
     */
    handleFiledDelete(mouseEvent, handler, currentVM, item) {
      this.handleDropField({
        dropType: this.type,
        data: item,
        method: 'dele',
      });
    },
    /**
     * @description 字段升序/降序
     */
    handleFiledAsc(mouseEvent, handler, currentVM, item) {
      if (handler.value === item.asc) {
        return;
      }
      let sort = [].concat(this.currentCom.setting.data['sort']);
      sort.forEach(data => {
        if (data.id == item.id) {
          data.asc = handler.value;
        }
      });
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Data',
        target: this.currentCom,
        store: this.$store,
        eventBus: this.$EventBus,
        data: { sort },
      });
    },
    /**
     * @description 字段聚合方式
     */
    handFiledAggrengation(mouseEvent, handler, currentVM, item) {
      if (handler.value === item.defaultAggregator) {
        return;
      }
      let sort = [].concat(this.currentCom.setting.data['sort']);
      sort.forEach(data => {
        if (data.id == item.id) {
          data.defaultAggregator = handler.value;
        }
      });
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Data',
        target: this.currentCom,
        store: this.$store,
        eventBus: this.$EventBus,
        data: { sort },
      });
    },
    /**
     * @description 字段聚合方式
     */
    formatAggregator(item) {
      let type = this.judgeFiledType(item.role);
      const fun = this.polymerizeType[type][0]['children'].find(x => x.value === item.defaultAggregator) || {};
      return `${item.alias} ` + (fun.name ? `(${fun.name})` : '');
    },
    /**
     * @description 获取右键菜单
     * @param {String} type 字段类型-维度/度量
     */
    getOpsMenu(type) {
      const aggrengation = this.polymerizeType[type];
      return this.openAggre ? [...aggrengation, ...this.polymerizeType['normal']] : this.polymerizeType['normal'];
    },
    /**
     * @description 点击开启右键菜单
     */
    handleFiledOps(event, item) {
      const that = this;
      this.currentType = this.judgeFiledType(item.role);
      function addEvent(target) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that, item);
          target.onClick.apply(this, arguments);
        };
      }
      // eslint-disable-next-line no-new
      new ContextMenu({
        vm: that,
        menus: that.getOpsMenu(this.currentType).map(item => {
          if (item['children'] && item.children.length) {
            item.children.forEach(subitem => {
              addEvent(subitem);
            });
          } else {
            addEvent(item);
          }
          return item;
        }),
        target: event,
        handleMarkCancel: function () {},
      });
    },
  },
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';
@{deep} .ant-modal-content {
  font-size: 12px !important;
  .ant-modal-body {
    padding: 15px 24px;
  }
  .ant-radio-wrapper,
  .ant-btn,
  .ant-select,
  .ant-checkbox-wrapper,
  .ant-input {
    font-size: 12px;
  }
  .ant-checkbox-indeterminate {
    .ant-checkbox-inner {
      background-color: #677cf7;
      &::after {
        height: 1px;
        background-color: #fff;
      }
    }
  }
}
.pilly-item {
  cursor: inherit !important;
}
.data-filter-modal {
  .pick-input {
    width: 400px;
    height: 32px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    margin: 13px 4px 5px 0;
  }
  .pick-checkbox-box {
    overflow: hidden;
    height: 220px;
    margin: 0;
    padding: 13px 0 13px 13px;
  }
  .hasborder {
    border: 1px solid #e5e5e5;
    border-radius: 2px;
  }
  .scrollbar {
    margin-bottom: -17px;
    margin-right: -11px;
    overflow: auto;
    height: 100%;
    overflow-x: hidden;
  }
  .f-flexcolumn {
    display: flex;
    flex-direction: column;
  }
  .pick-property {
    padding: 0 3px;
    width: 200px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
  .pick-icon-close {
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    line-height: 14px;
    font-size: 9px;
    cursor: pointer;
  }
  .pick-condition-box {
    position: relative;
    display: flex;
    align-items: center;
    margin: 10px 20px 10px 0;
  }
  .pick-select {
    width: 200px;
  }
  .pick-select.has-margin {
    margin-right: 10px;
  }
  .inputnumber {
    width: 100px;
    font-size: 12px;
  }
  .symbol {
    margin: 0 5px;
  }
  .pick-condition-box {
    .pick-icon-close {
      margin-left: 15px;
    }
  }
}
</style>
