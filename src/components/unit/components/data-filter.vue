<template>
  <div class="unit-data-filter">
    <div class="unit-field">
      <div class="dropable js-drop-data-filter" ref="js-dropable">
        <div class="drop-area">
          <div class="drop-body">
            <!-- 当有字段拖入的时候 start -->
            <div v-if="list.length" class="pillys">
              <div
                class="pilly-item mb-6"
                :style="{
                  backgroundColor:
                    item.status === 1 || item.IsChanged
                      ? 'red'
                      : judgeFiledType(item.role) === 'dimensions'
                      ? '#4a90e2'
                      : '#40c0a8',
                  color: '#fff',
                }"
                v-for="item in list"
                :key="item.id"
                @click="showModel(item, true)"
              >
                <p class="text">{{ item.alias }}</p>
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
    <!-- 数据筛选 弹窗 -->
    <a-modal v-model="visible" title="数据筛选" @ok="handleOk">
      <div class="data-filter-modal">
        <!-- 维度 start -->
        <div v-if="!dataTypeObj['num'].includes(dataType)">
          <a-radio-group v-model="currentFile.operation" @change="operationChange">
            <a-radio :value="'list'">列表</a-radio>
            <a-radio :value="'manual'">手动</a-radio>
          </a-radio-group>
          <!-- 列表 -->
          <div class="item" v-if="currentFile.operation === 'list'">
            <a-input
              v-model="listValue"
              class="pick-search-area"
              style="margin: 10px 0"
              placeholder="请输入搜索的关键词(如: A,B,C)"
              @keyup.enter.stop="search"
            >
              <a-button style="height: 30px" type="primary" slot="addonAfter" @click="search">查询</a-button>
            </a-input>
            <br />
            <div class="pick-checkbox-box hasborder">
              <div class="scrollbar">
                <a-checkbox
                  :checked="currentFile.checkAll"
                  :indeterminate="currentFile.indeterminate"
                  @change="onCheckAllChange"
                >
                  全选
                </a-checkbox>
                <a-checkbox-group
                  class="f-flexcolumn"
                  v-model="currentFile.value"
                  :options="currentFile.searchList"
                  @change="onCheckChange"
                />
              </div>
            </div>
          </div>
          <!--手动-->
          <div class="item" v-if="currentFile.operation === 'manual'">
            <a-input
              v-model="manualValue"
              class="pick-search-area"
              style="margin: 10px 0"
              placeholder="请输入条件名称"
              @keyup.enter.stop="addManualProperty"
            >
              <a-button style="height: 30px" type="primary" slot="addonAfter" @click="addManualProperty">添加</a-button>
            </a-input>
            <br />
            <div class="pick-checkbox-box">
              <div class="scrollbar">
                <div class="pick-property" v-for="(item, index) in currentFile.value" :key="item">
                  <span>{{ item }}</span>
                  <a-icon
                    type="close"
                    class="pick-icon-close"
                    @click="deleList(currentFile.value, item, undefined, index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 维度 end -->
        <!-- 度量 start-->
        <div v-else>
          <a-button type="primary" @click="addDimensionsCondition">添加条件</a-button>
          <div class="pick-checkbox-box" style="margin: 0; padding: 0">
            <div class="scrollbar">
              <br />
              <div :class="['pick-condition-box']" v-for="(item, index) in currentFile.rules" :key="index">
                <a-select
                  :class="['pick-select', 'has-margin']"
                  v-model="item.condition"
                  @change="changeCondition(item)"
                >
                  <a-select-option v-for="option in conditionOptions" :key="option.label" :value="option.op">
                    {{ option.label }}
                  </a-select-option>
                </a-select>
                <a-input-number
                  v-model="item.firstValue"
                  size="default"
                  placeholder="请输入数值"
                  class="inputnumber"
                  style="text-overflow: clip"
                ></a-input-number>
                <span class="symbol" v-show="item.condition === 'range'">-</span>
                <a-input-number
                  v-show="item.condition === 'range'"
                  v-model="item.secondValue"
                  size="default"
                  placeholder="请输入数值"
                  class="inputnumber"
                  style="text-overflow: clip"
                ></a-input-number>
                <a-icon
                  type="close"
                  class="pick-icon-close"
                  @click="deleList(currentFile.rules, item, undefined, index)"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- 度量 end-->
        <a-radio-group v-model="currentFile.filterType">
          <a-radio :value="1">只显示</a-radio>
          <a-radio :value="2">排除</a-radio>
        </a-radio-group>

        <template slot="footer">
          <a-button key="cancel" @click="screenVisible = false">取消</a-button>
          <a-button key="submit" type="primary" style="background: '#677cf7'">确定</a-button>
        </template>
      </div>
    </a-modal>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { addClass, removeClass } from '@/utils/dom';
import ContextMenu from '@/components/contextmenu';
import { arrayAddData, arrayDeleData } from '@/utils';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { DROG_TYPE } from '@/views/screenManage/screen/container/drawing-board-setting.vue';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';

/**
 * @description 数据筛选设置
 */
export default {
  name: 'UnitDataFilter',
  inject: ['boardSettingWrapper'],
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
      visible: false, // 是否显示弹窗
      screenVisible: false,
      listValue: '', // 列表模糊查询输入值
      manualValue: '', // 手动输入值
      searchList: [],
      conditionOptions: [
        { label: '范围', op: 'range' },
        { label: '大于', op: 'more' },
        { label: '小于', op: 'less' },
        { label: '大于等于', op: 'moreOrEqual' },
        { label: '小于等于', op: 'lessOrEqual' },
        { label: '等于', op: 'equal' },
        { label: '不等于', op: 'notEqual' },
      ], // 条件选项
      currentFile: {},
      currentType: '', //当前选中的类型
      currentData: {}, //当前弹框字段数据
      dataType: '', //数据类型
      dataTypeObj: {
        // 数值
        num: ['BIGINT', 'DECIMAL', 'DOUBLE'], //除却这些，其他为文本
      },
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
    dragdropState: {
      deep: true,
      handler(dragdrop) {
        // 如果状态不存在
        if (!dragdrop.status) return;

        this.currentType = this.judgeFiledType(dragdrop.data.role);
        this.dataType = dragdrop.data.dataType;

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
  mounted() {
    this.$EventBus.$on('drop:dataFilter', this.showModel);
  },
  beforeDestroy() {
    this.$EventBus.$off('drop:dataFilter', this.showModel);
  },
  methods: {
    /**
     * @description 列表模糊查询
     */
    search() {
      if (!this.listValue) {
        this.currentFile.searchList = this.currentFile.originList;
        // 不强制刷新的话, 不会触发updated()
        return this.$forceUpdate();
      }
      const keyword = (this.listValue || '').toLowerCase();
      const list = keyword.split(',');
      this.currentFile.searchList = [].concat(
        this.currentFile.originList.filter(item => {
          let match = false;
          list.forEach(k => {
            if ((item || '').indexOf(k) > -1) {
              match = true;
            }
          });
          return match;
        }),
      );
      // 不强制刷新的话, 不会触发updated()
      this.$forceUpdate();
    },
    /**
     * @description 手动，添加字段
     */
    addManualProperty() {
      // 本身不存在就添加进去
      if (this.currentFile.value.indexOf(this.manualValue) === -1) {
        this.currentFile.value.push(this.manualValue);
        this.manualValue = '';
      } else {
        this.$message.error(`${this.manualValue}已存在`);
      }
    },
    /**
     * @description 判断字段类型
     * @param {Number} role 字段类型 1维度，2度量
     */
    judgeFiledType(role) {
      return role === 1 ? 'dimensions' : 'measures';
    },
    /**
     * @description 初始化currentFile
     */
    initCurrentFile() {
      this.currentFile = {
        // 当前选中的维度/度量数据
        operation: 'list', //list列表，manual手动
        searchList: [], // 根据关键字搜索
        originList: [], // 查询数据
        indeterminate: false, //全选 -- 样式控制
        checkAll: false,
        filterType: 1, //1只显示 2排除
      };
      // 数值类型字段
      if (this.dataTypeObj['num'].includes(this.dataType)) {
        this.currentFile.rules = [];
      } else {
        this.currentFile.value = [];
      }
    },
    /**
     * @description 维度、度量数据筛选弹框
     * @param {Object} item 当前选择的字段数据
     * @param {Boolean} flag true时为点击已拖入的字段
     */
    showModel(item, flag) {
      if (!item) {
        return;
      }
      if (this.currentCom.setting.data.filter.fileList.map(item => item.id).includes(item.id) && !flag) return;
      this.currentType = this.judgeFiledType(item.role);
      this.dataType = item.dataType;
      this.currentData = item;
      this.initCurrentFile();
      this.currentFile = cloneDeep({ ...this.currentFile, ...pick(item, Object.keys(this.currentFile)) });
      // 非数值类型字段才调接口
      if (!this.dataTypeObj['num'].includes(this.dataType)) {
        this.getFieldData();
      }
      this.visible = true;
    },
    /**
     * @description 获取文本类型的数据
     */
    async getFieldData() {
      if (!this.boardSettingRightInstance) {
        this.boardSettingRightInstance = this.boardSettingWrapper.$refs['js-board-setting-right'];
      }
      let selected =
        this.boardSettingRightInstance.tabAcitve === 'model'
          ? this.boardSettingRightInstance.modelSelected
          : this.boardSettingRightInstance.accessSelected;
      const params = {
        resourceType: this.resourceType[this.boardSettingRightInstance.tabAcitve],
        dataModelId: selected.tableId,
        dimensions: [this.currentData],
        type: this.currentCom.type,
      };
      // this.spinning = true;
      const res = await this.$server.screenManage.getDataPick(params).finally(() => {
        // this.spinning = false;
      });
      if (res.code === 500 && res.msg === 'IsChanged') {
        this.$message.error('模型数据不存在');
        return;
      }
      if (res.code === 200) {
        const list = [];
        let hasNull = false;
        res.data.forEach(item => {
          // 需将null值空值也当做条件显示出来
          if (Object.prototype.toString.call(item) === '[object Object]') {
            const value = Object.values(item);
            if (value[0]) {
              list.push(value.toString());
            } else {
              hasNull = true;
            }
          } else {
            hasNull = true;
          }
        }); // 维度全字段列表
        if (hasNull) list.unshift('');
        this.dataRows = list;
      }
      this.currentFile.originList = this.dataRows || [];
      this.currentFile.searchList = this.dataRows || [];
    },
    /**
     * @description 文本数据-列表/手动切换
     * @param {string} val list列表,manual手动
     */
    operationChange() {
      // 数值类型字段
      if (this.dataTypeObj['num'].includes(this.dataType)) {
        this.currentFile.rules = [];
      } else {
        this.currentFile.value = [];
      }
      this.currentFile.checkAll = false;
    },
    /**
     * @description 维度、度量数据筛选弹框 -- 确定
     */
    async handleOk() {
      if (this.dataTypeObj['num'].includes(this.dataType) && !this.handleNumData()) {
        return;
      } else if (!this.dataTypeObj['num'].includes(this.dataType) && this.currentFile.value.length < 1) {
        return this.$message.error('筛选条件为空');
      }
      this.visible = false;
      this.currentData = Object.assign({}, this.currentData, omit(this.currentFile, ['searchList', 'originList']));
      this.handleDropField({
        dropType: this.type,
        data: this.currentData,
      });
    },
    /**
     * @description 数值类型数据处理
     */
    handleNumData() {
      if (this.currentFile.rules.length < 1) {
        this.$message.error('请添加筛选条件');
        return false;
      }
      // 判断数值是否输入，排除0
      function isNoInput(value) {
        return !value && value !== 0;
      }
      if (
        this.currentFile.rules.some(
          item => isNoInput(item.firstValue) || (item.condition === 'range' && isNoInput(item.secondValue)),
        )
      ) {
        this.$message.error('请输入筛选数值');
        return false;
      }
      // 处理度量筛选数据
      // 如果是排除的，action取补集符号
      this.currentFile.rules.forEach(item => {
        switch (item.condition) {
          case 'range':
            item.action = item.condition;
            break;
          case 'more':
            item.action = this.currentFile.filterType === 1 ? item.condition : 'lessOrEqual';
            break;
          case 'less':
            item.action = this.currentFile.filterType === 1 ? item.condition : 'moreOrEqual';
            break;
          case 'moreOrEqual':
            item.action = this.currentFile.filterType === 1 ? item.condition : 'less';
            break;
          case 'lessOrEqual':
            item.action = this.currentFile.filterType === 1 ? item.condition : 'more';
            break;
          case 'equal':
            item.action = this.currentFile.filterType === 1 ? item.condition : 'notEqual';
            break;
          case 'notEqual':
            item.action = this.currentFile.filterType === 1 ? item.condition : 'equal';
            break;
        }
      });

      return true;
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
      let resourceType;
      if (this.boardSettingRightInstance.tabAcitve === 'model') {
        if (this.boardSettingRightInstance.modelSelected) {
          selected = this.boardSettingRightInstance.modelSelected;
          resourceType = this.resourceType[this.boardSettingRightInstance.tabAcitve];
        }
      } else if (this.boardSettingRightInstance.tabAcitve === 'access') {
        if (this.boardSettingRightInstance.accessSelected) {
          selected = this.boardSettingRightInstance.accessSelected;
          resourceType = this.resourceType[this.boardSettingRightInstance.tabAcitve];
        }
      }

      if (!dataModelId && selected) {
        // 如果图表模型id为空并且有数据，则添加
        result.dataModelId = selected.tableId;
        result.resourceType = resourceType;
      } else if (dataModelId && !selected) {
        // 如果图表模型id有，但是没有数据，则清空
        result.dataModelId = '';
        result.resourceType = '';
        return result;
      } else if (method === 'dele' && this.isEmptyChart()) {
        // 清空了图表的所有字段, 清空
        result.dataModelId = '';
        result.resourceType = '';
        return result;
      } else if (dataModelId !== selected.tableId && method !== 'dele') {
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
      // 有弹框时，不执行
      if (this.visible == true) {
        this.currentData = arguments[0].data;
        return;
      }
      const funs = {
        [DROG_TYPE.DATAFILTER]: this.handleSetDataFilter,
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
        // 如果重复数据含value，表示编辑，进行替换
        let oldData = list.find(item => item.id === data.id);
        if (oldData && (oldData.value || oldData.rules)) {
          oldData = Object.assign(oldData, data);
          return list;
        }
        arrayAddData(list, data);
      } else if (method === 'dele') {
        arrayDeleData(list, data);
      }
      return list;
    },
    /**
     * @description 当放置到数据筛选
     */
    handleSetDataFilter(data, method = 'add') {
      let filter = Object.assign({}, this.currentCom.setting.data.filter);
      filter['fileList'] = this.conversionArry('fileList', data, method);

      return { filter };
    },
    /**
     * @description 公共转换成数组
     */
    conversionArry(key, data, method) {
      let arry = [].concat(this.currentCom.setting.data.filter[key]);
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
      this.currentType = this.judgeFiledType(item.role);
      this.dataType = item.dataType;
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
    // ------弹框
    /**
     * @description 维度-列表 选择
     */
    onCheckChange(value) {
      this.currentFile.indeterminate = !!value.length && value.length < this.currentFile.searchList.length;
      this.currentFile.checkAll = value.length === this.currentFile.searchList.length;
    },
    /**
     * @description 维度-列表 全选
     */
    onCheckAllChange(e) {
      Object.assign(this.currentFile, {
        value: e.target.checked ? this.currentFile.searchList : [],
        checkAll: e.target.checked,
        indeterminate: false,
      });
    },
    /**
     * @description 度量-添加条件
     */
    addDimensionsCondition() {
      if (this.currentFile.rules.length < 5) {
        this.currentFile.rules.push({
          condition: 'range', // 条件选择，显示
          action: '', // 条件选择，实际
          firstValue: '',
          secondValue: '',
        });
      } else {
        this.$message.error('限制只能添加5个');
      }
    },
    /**
     * @description 度量-条件选择变化
     */
    changeCondition() {},
    /**
     * @description 维度-手动、度量-条件：数组删除数据
     * @param {array} list
     * @param {any} data
     * @param {number} index
     */
    deleList(list, data, key, index) {
      arrayDeleData(list, data, key, index);
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
  .pick-search-area {
    @{deep} .ant-input-group-addon {
      padding: 0;
    }
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
