<template>
  <div class="m-overlay m-overlay-shadow database-popover">
    <div class="warpper" ref="ctxMenuRef">
      <div class="select-table">{{ data.name }}</div>
      <div class="panel-body">
        <div class="body">
          <a-row>
            <a-col :span="7">
              <div class="change-table">切换表:</div>
            </a-col>
            <a-col :span="16">
              <a-select class="table-list" v-model="databaseSelect" @change="handleSelectDatabase">
                <a-select-option :value="item.id" v-for="item in databaseList" :key="item.id">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-col>
          </a-row>
          <div class="search">
            <a-input-search placeholder="搜索表名" :disabled="tableList.length === 0" @change="handleSearch" />
          </div>
          <div class="list-content reset-scrollbar">
            <ul>
              <li
                class="z-clickable"
                v-for="item in list"
                :key="item.id"
                @click="$event => handleItemClick($event, item)"
              >
                <div class="title">
                  <span>{{ item.alias }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
export default {
  name: 'DataPopover',
  props: {
    vm: {
      // vue组件
      type: Object,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },
    target: {
      // 右键元素
      type: [MouseEvent, Object],
      default: () => {},
    },
    callback: {
      // 点击回调函数
      type: Function,
    },
    remove: {
      // 移除函数
      type: Function,
    },
  },
  data() {
    return {
      databaseList: [], // 数据库列表
      databaseSelect: '', // 选中的数据库
      tableList: [], // 表列表
      keyword: '',
      searchList: [],
    };
  },
  computed: {
    list() {
      return this.keyword ? this.searchList : this.tableList;
    },
  },
  mounted() {
    this.getSelectDataSourceList(this.data);
  },
  methods: {
    /**
     * @description 数据搜索
     */
    handleSearch: debounce(function (event) {
      this.searchList = [];
      let value = event.target.value;
      if (!value) {
        return (this.keyword = '');
      }
      this.keyword = typeof value === 'string' ? value.trim() : value;
      this.tableList.forEach(item => {
        if (item.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) {
          this.searchList.push(item);
        }
      });
    }, 400),
    /**
     * @description 获取数据库列表
     */
    async getSelectDataSourceList(item) {
      if (!item) return;
      const result = await this.$server.dataModel.getDataBaseDataInfoList(item.id, '');
      if (result && result.code === 200) {
        this.databaseList = [].concat(result.data);
        if (this.databaseList && this.databaseList.length) {
          this.databaseSelect = this.databaseList[0] ? this.databaseList[0].id : '';
          this.handleSelectDatabase(this.databaseSelect);
        }
      } else {
        this.$message.error(result.msg || '获取数据源失败');
      }
    },
    /**
     * @description 选中数据库
     */
    async handleSelectDatabase(id) {
      const result = await this.$server.dataModel.getTableListById(id);
      if (result && result.code === 200) {
        this.tableList = [].concat(result.data);
      } else {
        this.$message.error(result.msg || '获取数据表失败');
      }
    },
    handleItemClick(event, item) {
      this.callback(event, item);
    },
  },
};
</script>
<style lang="less" scoped>
.m-overlay {
  position: absolute;
  z-index: 1002;
}
.m-overlay-shadow {
  width: 200px;
  -webkit-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  -moz-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  -ms-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  -o-box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.15);
}
</style>
