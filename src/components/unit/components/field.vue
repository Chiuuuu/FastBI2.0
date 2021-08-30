<template>
  <div class="unit-field-box">
    <div class="unit-field">
      <div class="dropable" ref="js-dropable">
        <div class="drop-area">
          <div class="drop-body">
            <!-- 当有字段拖入的时候 start -->
            <div v-if="list.length" class="pillys">
              <div
                class="pilly-item mb-6"
                :style="{ backgroundColor, color: '#fff' }"
                v-for="item in list"
                :key="item.id"
              >
                <p class="text">{{ item.name }}</p>
                <div class="suffix-btn" @click="handleFiledOps($event, item)"></div>
              </div>
            </div>
            <!-- 当有字段拖入的时候 start -->
            <div class="body-empty" v-if="isShowEmpty">
              <p class="text">{{ label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { addClass, removeClass } from '@/utils/dom';
import ContextMenu from '@/components/contextmenu';
import { arrayAddData, arrayDeleData } from '@/utils';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { DROG_TYPE } from '@/views/screenManage/screen/container/drawing-board-setting.vue';

/**
 * @description 字段设置
 */
export default {
  name: 'UnitField',
  inject: ['boardSettingWrapper'],
  props: {
    type: {
      // 类型
      type: String,
      default: '',
    },
    receive: {
      // 接收放置的类型
      type: [String, Array],
      required: true,
    },
    label: {
      // 标题
      type: String,
      required: true,
    },
    list: {
      // 需要渲染的列表
      type: Array,
      default: () => [],
    },
    limit: {
      // 是否开启限制
      type: Boolean,
      default: false,
    },
    limitNum: {
      // 限制的个数
      type: Number,
      default: 1,
    },
    openAggre: {
      // 是否开启聚合函数
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      // 背景颜色
      type: String,
      default: '',
    },
  },
  data() {
    return {
      boardSettingRightInstance: '',
    };
  },
  computed: {
    ...mapState({
      currentCom: state => state.board.currentCom,
      dragdropState: state => state.dragdrop,
    }),
    isShowEmpty() {
      // 控制是否显示空的情况
      // 1. list长度为0，
      // 2. list长度不为0，且不做限制
      // 3. list长度不为0，做了限制，且长度不等于限制
      return (
        this.list.length === 0 ||
        (this.list.length !== 0 && !this.limit) ||
        (this.list.length !== 0 && this.limit && this.list.length !== this.limitNum)
      );
    },
  },
  watch: {
    dragdropState: {
      deep: true,
      handler(dragdrop) {
        // 如果状态不存在
        if (!dragdrop.status) return;

        // 数组
        if (Array.isArray(this.receive)) {
          if (!this.receive.includes(dragdrop.dropType)) return;
        } else if (dragdrop.dropType !== this.receive) {
          // 字符串
          return;
        }

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
    /**
     * @description 放置
     */
    handleDrop(dropDom, dragdrop) {
      // 移除放入的样式
      this.handleSetDragleaveDropStyle(dropDom);
      this.handleDropField({
        dropType: this.type,
        data: dragdrop.data,
      });
    },
    /**
     *  @description 设置数据id
     */
    handleSetDataModelId(result) {
      const dataModelId = this.currentCom.setting.data.dataModelId;

      if (!this.boardSettingRightInstance) {
        this.boardSettingRightInstance = this.boardSettingWrapper.$refs['js-board-setting-right'];
      }

      let selected = '';
      if (this.boardSettingRightInstance.tabAcitve === 'model') {
        if (this.boardSettingRightInstance.modelSelected) {
          selected = this.boardSettingRightInstance.modelSelected;
          result.resourceType = 8;
        }
      } else if (this.boardSettingRightInstance.tabAcitve === 'access') {
        if (this.boardSettingRightInstance.accessSelected) {
          selected = this.boardSettingRightInstance.modelSelected;
          result.resourceType = 3;
        }
      }

      if (!dataModelId && selected) {
        // 如果图表模型id为空并且有数据，则添加
        result.dataModelId = selected.tableId;
      } else if (dataModelId && !selected) {
        // 如果图表模型id有，但是没有数据，则清空
        result.dataModelId = '';
      } else if (dataModelId !== selected.tableId) {
        this.$message.error('一个图表只能拖入一个数据模型的字段');
        return;
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
        [DROG_TYPE.DIMENSION]: this.handleSetDimension,
        [DROG_TYPE.MEASURE]: this.handleSetMeasure,
        [DROG_TYPE.LONG]: this.handleSetLong,
        [DROG_TYPE.RROGRESS]: this.handleProgress,
        [DROG_TYPE.TARGE]: this.handleTarge,
        [DROG_TYPE.OUTERING]: this.handleOuterIng,
        [DROG_TYPE.INNERING]: this.handleInnerIng,
        [DROG_TYPE.XAXIS]: this.handleXaxis,
        [DROG_TYPE.YAXIS]: this.handleYaxis,
        [DROG_TYPE.FIELD]: this.handleField,
        [DROG_TYPE.LATITUDE]: this.handleLatitude,
        [DROG_TYPE.LABELDIMENSION]: this.handleLabelDimension,
        [DROG_TYPE.LABELMEASURE]: this.handleLabelMeasure,
        [DROG_TYPE.LABELLONGITUDE]: this.handleLabelLongitude,
        [DROG_TYPE.LABELLATITUDE]: this.handleLabelLatitude,
        [DROG_TYPE.TOTALQUOTA]: this.handleTotalQuota,
        [DROG_TYPE.SECONDARYQUOTA]: this.handleSecondaryQuota,
      };

      const fun = funs[dropType];
      if (!fun) {
        return console.error(`There is no drag-in method: [${dropType}]`);
      }

      let result = fun(data, method);

      result = this.handleSetDataModelId(result);

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
        if (list.includes(data)) return list;

        // 1. 是否开启限制
        if (this.limit) {
          // 2. 列表长度是否为空
          if (list.length) {
            if (this.limitNum === 1) {
              list.push(data);
              list.shift();
            } else if (list.length < this.limitNum) {
              list.push(data);
            } else if (list.length === this.limitNum) {
              list.splice(this.limitNum - 1, 1, data);
            }
          } else {
            // 3. 如果为空直接加入
            arrayAddData(list, data);
          }
        } else {
          // 4. 不开启直接添加
          arrayAddData(list, data);
        }
      } else if (method === 'dele') {
        arrayDeleData(list, data);
      }
      return list;
    },
    /**
     * @description 当放置到维度
     */
    handleSetDimension(data, method = 'add') {
      return {
        dimensions: this.conversionArry('dimensions', data, method),
      };
    },
    /**
     * @description 当放置到度量
     */
    handleSetMeasure(data, method = 'add') {
      return {
        measures: this.conversionArry('measures', data, method),
      };
    },
    /**
     * @description 拼接经度纬度到维度
     */
    handleMapDimension(data, isLabel = false) {
      // 构造度量列表
      let dimensionList = [];
      let latitude = isLabel ? data.labelLatitude : data.latitude;
      let longitude = isLabel ? data.labelLongitude : data.longitude;
      if (latitude) {
        dimensionList = [...dimensionList, ...latitude];
      }
      if (longitude) {
        dimensionList = [...dimensionList, ...longitude];
      }
      return dimensionList;
    },
    /**
     * @description 当放置到经度
     */
    handleSetLong(data, method = 'add') {
      return {
        longitude: this.conversionArry('longitude', data, method),
        dimensions: this.conversionArry('dimensions', this.handleMapDimension(data), method),
      };
    },
    /**
     * @description 当放置到纬度
     */
    handleLatitude(data, method = 'add') {
      return {
        latitude: this.conversionArry('latitude', data, method),
        dimensions: this.conversionArry('dimensions', this.handleMapDimension(data), method),
      };
    },
    /**
     * @description 当放置到散点纬度
     */
    handleLabelDimension(data, method = 'add') {
      return {
        labelDimensions: this.conversionArry('labelDimensions', data, method),
      };
    },
    /**
     * @description 当放置到散点度量
     */
    handleLabelMeasure(data, method = 'add') {
      return {
        labelMeasures: this.conversionArry('labelMeasures', data, method),
      };
    },
    /**
     * @description 当放置到散点纬度
     */
    handleLabelLongitude(data, method = 'add') {
      return {
        labelLatitude: this.conversionArry('labelLatitude', data, method),
        labelDimensions: this.conversionArry('labelDimensions', this.handleMapDimension(data), method),
      };
    },
    /**
     * @description 当放置到散点经度
     */
    handleLabelLatitude(data, method = 'add') {
      return {
        labelLatitude: this.conversionArry('labelLatitude', data, method),
        labelDimensions: this.conversionArry('labelDimensions', this.handleMapDimension(data), method),
      };
    },
    /**
     * @description 当放置到主指标
     */
    handleTotalQuota(data, method = 'add') {
      return {
        totalQuota: this.conversionArry('totalQuota', data, method),
      };
    },
    /**
     * @description 当放置到次指标
     */
    handleSecondaryQuota(data, method = 'add') {
      return {
        secondaryQuota: this.conversionArry('secondaryQuota', data, method),
      };
    },
    /**
     * @description 当放置到进度
     */
    handleProgress(data, method = 'add') {
      return {
        progress: this.conversionArry('progress', data, method),
      };
    },
    /**
     * @description 当放置到目标
     */
    handleTarge(data, method = 'add') {
      return {
        targe: this.conversionArry('targe', data, method),
      };
    },
    /**
     * @description 当放置到外圈
     */
    handleOuterIng(data, method = 'add') {
      return {
        outerIng: this.conversionArry('outerIng', data, method),
      };
    },
    /**
     * @description 当放置到内圈
     */
    handleInnerIng(data, method = 'add') {
      return {
        innerIng: this.conversionArry('innerIng', data, method),
      };
    },
    /**
     * @description 当放置到X轴
     */
    handleXaxis(data, method = 'add') {
      return {
        xaxis: this.conversionArry('xaxis', data, method),
      };
    },
    /**
     * @description 当放置到Y轴
     */
    handleYaxis(data, method = 'add') {
      return {
        yaxis: this.conversionArry('yaxis', data, method),
      };
    },
    /**
     * @description 当放置到字段(维度度量都可以)
     */
    handleField(data, method = 'add') {
      return {
        fields: this.conversionArry('fields', data, method),
      };
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
     * @description 获取右键菜单
     */
    getOpsMenu() {
      const normal = [
        {
          name: '删除',
          onClick: this.handleFiledDelete,
        },
      ];
      const aggrengation = [
        {
          name: '聚合方式',
          children: [
            {
              name: '平均',
              onClick: this.handleFiledDelete,
            },
          ],
        },
      ];
      return this.openAggre ? [...normal, ...aggrengation] : normal;
    },
    /**
     * @description 点击开启右键菜单
     */
    handleFiledOps(event, item) {
      const that = this;
      function addEvent(target) {
        target.$$fun = function () {
          Array.prototype.push.call(arguments, that, item);
          target.onClick.apply(this, arguments);
        };
      }
      // eslint-disable-next-line no-new
      new ContextMenu({
        vm: that,
        menus: that.getOpsMenu().map(item => {
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
