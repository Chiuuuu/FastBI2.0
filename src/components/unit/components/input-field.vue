<template>
  <div class="unit-field-box">
    <div class="unit-field">
      <div class="dropable" ref="js-dropable">
        <div class="drop-area">
          <div class="drop-body">
            <!-- 当有字段拖入的时候 start -->
            <div v-if="!showInput && list.length" class="pillys">
              <div
                class="pilly-item mb-6"
                :style="{ backgroundColor, color: '#fff' }"
                v-for="item in list"
                :key="item.id"
              >
                <p class="text">{{ formatAggregator(item) }}</p>
                <div class="suffix-btn" @click="handleFiledOps($event, item)"></div>
              </div>
            </div>
            <!-- 当有字段拖入的时候 end -->
            <div class="body-empty" v-if="showInput">
              <a-input-number
                class="drop-input"
                :placeholder="label"
                :value="list"
                @change="handleChange"
              ></a-input-number>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UnitField from './field.vue';
import { arrayAddData, arrayDeleData } from '@/utils';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import { DROG_TYPE } from '@/views/screenManage/screen/container/drawing-board-setting.vue';
/**
 * @description 字段填写或拖入设置
 */
export default {
  name: 'UnitInputField',
  extends: UnitField,
  data() {
    return {
      isInput: true, // 是否为输入框
    };
  },
  props: {
    list: {
      // 需要渲染的列表
      type: [Array, String, Number, Object],
      default: () => [],
    },
    limit: {
      // 是否开启限制
      type: Boolean,
      default: true,
    },
  },
  computed: {
    showInput() {
      return !Array.isArray(this.list);
    },
  },
  methods: {
    /**
     * @description 列表公共处理方法
     * @param {array} list 列表
     * @param {any} data 数据
     * @param {string} method 方法
     */
    handleList(list, data, method = 'add') {
      if (method === 'add') {
        // 如果数据有重复则直接返回
        if (data !== '' && list.includes(data)) return list;

        // 1. 是否开启限制
        if (this.limit) {
          if (this.isInput) {
            // 如果放入了数组，删除的时候需要置空
            list = data;
          } else {
            // 2. 列表长度是否为空
            if (list.length) {
              list.push(data);
              list.shift();
            } else {
              // 3. 如果为空直接加入
              arrayAddData(list, data);
            }
          }
        } else {
          // 4. 不开启直接添加
          arrayAddData(list, data);
        }
      } else if (method === 'dele') {
        arrayDeleData(list, data);
        if (!this.isInput) {
          // 如果放入了数组，删除的时候需要置空
          list = '';
          this.isInput = true;
        }
      }
      return list;
    },
    /**
     * @description 字段放置之后执行
     * @param {object} options
     * @param {string} options.dropType 放置的类型
     * @param {any} options.data 放置的数据
     * @param {string} options.method 放置的方法
     */
    handleDropField({ dropType, data, method, isInput }) {
      const funs = {
        [DROG_TYPE.MIN]: this.handleSetMIN,
        [DROG_TYPE.MAX]: this.handleSetMAX,
        [DROG_TYPE.TARGE]: this.handleTarge,
      };

      if (!isInput) {
        this.isInput = false;
      }

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
     * @description 当放置到最小值
     */
    handleSetMIN(data, method = 'add') {
      const {
        setting: {
          data: { min },
        },
      } = this.currentCom;
      let arry = [].concat(min);
      arry = this.handleList(arry, data, method);
      return {
        min: arry,
      };
    },
    /**
     * @description 当放置到最小值
     */
    handleSetMAX(data, method = 'add') {
      const {
        setting: {
          data: { max },
        },
      } = this.currentCom;
      let arry = [].concat(max);
      arry = this.handleList(arry, data, method);
      return {
        max: arry,
      };
    },
    handleChange(value) {
      this.isInput = true;
      this.handleDropField({
        dropType: this.type,
        data: typeof value === 'number' ? +value : '',
        isInput: true,
      });
    },
    /**
     * @description 字段聚合方式
     */
    formatAggregator(item) {
      if (!this.openAggre) {
        return item.alias;
      }
      const fun = this.contextmenuMap[this.getDataType(item.dataType)][0].children.find(
        x => x.value === item.defaultAggregator,
      );
      if (!fun) {
        console.log('不存在这个聚合类型');
        return item.alias;
      }
      return `${item.alias} (${fun.name})`;
    },
    /**
     * @description 判断数值类型
     */
    getDataType(type) {
      return ['BIGINT', 'DECIMAL', 'DOUBLE'].includes(type) ? 'num' : 'str';
    },
  },
};
</script>
