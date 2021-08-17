<template>
  <div class="data-model-list-panel" :class="show ? 'panel-show' : ''">
    <div class="setting-wrapper">
      <div class="back" @click="handleClose">←</div>
      <h2 class="title">数据接入列表</h2>
      <div class="panel-body">
        <div class="model-list">
          <div class="model-search" v-if="!isEmpty">
            <a-input-search placeholder="搜索数据接入" @change="handleSearch" />
          </div>
          <div class="list-content reset-scrollbar" :class="isEmpty ? 'empty' : ''">
            <template v-if="!isEmpty">
              <!-- 数据接入列表 start -->
              <!-- 气泡窗, 点击数据源时弹出继续选择库表 -->
              <a-popover v-model="showPopover" trigger="click" placement="leftTop">
                <template slot="title">
                  <a-select style="width: 100%" v-model="databaseId" @change="handleSelectDatabase">
                    <a-select-option v-for="database in databaseList" :key="database.id" :value="database.id">
                      {{ database.name }}
                    </a-select-option>
                  </a-select>
                </template>
                <template slot="content">
                  <a-spin :spinning="loadingTable" class="scrollbar table-list">
                    <div
                      v-for="table in tableList"
                      :class="['table-list-item', { added: judgeAdded(table) }]"
                      :key="table.id"
                      :title="table.name"
                      @click="handleSelectTable(table)"
                    >
                      {{ table.name }}
                    </div>
                  </a-spin>
                </template>
                <template v-for="item in modelList">
                  <!-- 文件夹类型 start -->
                  <div class="group" :key="item.id" v-if="item.fileType === 0">
                    <div class="folder">
                      <div class="title">
                        <div class="u-icon-folder">
                          <a-icon type="folder-open" />
                        </div>
                        <span class="title-span">{{ item.name }}</span>
                      </div>
                    </div>
                    <ul class="items" v-if="item.children && item.children.length">
                      <li
                        class="item"
                        v-for="child in item.children"
                        :key="child.id"
                        @click="handleSelectDataSource(child)"
                      >
                        <div class="title">
                          <div class="u-icon-file">
                            <div
                              v-if="iconType.includes(child.type)"
                              :class="['file-icon', 'icon-bg', 'icon-' + child.type]"
                            ></div>
                            <a-icon v-else type="file" />
                          </div>
                          <span>{{ child.name }}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <!-- 文件夹类型 end -->
                  <div class="group" :key="item.id" v-else>
                    <ul class="items">
                      <!-- 气泡窗, 点击数据源时弹出继续选择库表 -->
                      <a-popover trigger="click" placement="left">
                        <template slot="title">
                          <a-select style="width: 100%" v-model="databaseId" @change="handleSelectDatabase">
                            <a-select-option v-for="database in databaseList" :key="database.id" :value="database.id">
                              {{ database.name }}
                            </a-select-option>
                          </a-select>
                        </template>
                        <template slot="content">
                          <div class="scrollbar table-list">
                            <div
                              v-for="table in tableList"
                              :class="['table-list-item', { added: judgeAdded(table) }]"
                              :key="table.id"
                              :title="table.name"
                              @click="handleSelectTable(table)"
                            >
                              {{ table.name }}
                            </div>
                          </div>
                        </template>
                        <li class="item" @click="handleSelectDataSource(item)">
                          <div class="title">
                            <div class="u-icon-file">
                              <div
                                v-if="iconType.includes(item.type)"
                                :class="['file-icon', 'icon-bg', 'icon-' + item.type]"
                              ></div>
                              <a-icon v-else type="file" />
                            </div>
                            <span>{{ item.name }}</span>
                          </div>
                        </li>
                      </a-popover>
                    </ul>
                  </div>
                </template>
              </a-popover>
              <!-- 数据接入列表 end -->
            </template>
            <a-empty description="没有符合数据" v-else></a-empty>
          </div>
          <div class="model-list-footer" @click="handleGoToCreateAccess">新建数据接入</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DataModelListPanel from './data-model-list-panel';

/**
 * @description 数据接入
 */
export default {
  name: 'DataSourceListPanel',
  extends: DataModelListPanel,
  props: {},
  data() {
    return {
      showPopover: false,
      loadingTable: false,
      iconType: [1, 2, 5, 11, 12],
      databaseList: [],
      databaseId: '',
      tableList: [],
      tableId: '',
    };
  },
  computed: {
    modelList() {
      // 数据接入展示列表
      return this.searchValue ? this.searchList : this.list;
    },
  },
  mounted() {},
  methods: {
    /**
     * @description 跳转到创建数据接入
     */
    handleGoToCreateAccess() {
      this.$router.push({
        name: 'dataAccess',
      });
    },
    /**
     * @description 获取数据模型列表
     */
    async handleGetData() {
      const res = await this.$server.common.getMenuList('/datasource/catalog/list/1');
      if (res && res.code === 200) {
        this.list = res.rows;
      } else {
        this.list = [];
      }
    },
    /**
     * @description 选中数据源
     */
    async handleSelectDataSource(item) {
      const res = await this.$server.dataModel.getDataBaseDataInfoList(item.id, '');
      if (res && res.code === 200) {
        this.databaseList = res.data;
        // 默认第一个库
        if (res.data && res.data.length && res.data.length > 0) {
          this.databaseId = res.data[0].id;
          this.showPopover = true;
          this.handleSelectDatabase(this.databaseId);
        } else {
          this.tableList = [];
        }
      } else {
        this.$message.error(res.msg || res.message || '请求错误');
        this.databaseList = [];
        this.tableList = [];
      }
    },
    /**
     * @description 选中数据库
     */
    async handleSelectDatabase(id) {
      this.loadingTable = true;
      const res = await this.$server.dataModel.getTableListById(id).finally(() => {
        this.loadingTable = false;
      });
      if (res && res.code === 200) {
        this.tableList = res.data;
      } else {
        this.$message.error(res.msg || res.message || '请求错误');
        this.tableList = [];
      }
    },
    /**
     * @description 选中表格
     */
    async handleSelectTable(item) {
      // let params = {
      //   screenId: this.screenId,
      //   resourceName: item.name,
      //   datasourceId: item.datasourceId,
      //   databaseId: item.databaseId,
      //   tableId: item.id,
      //   origin: 3,
      // };
      // await this.$server.screenManage.screenModuleSave(params);
      item.resourceType = this.getResourceType();
      item.resourceName = item.name;
      this.$emit('update:currentSelected', item);
      let list = this.selectedModelList.concat([item]);
      this.$store.dispatch('dataModel/setSelectedModelList', list);
      this.resourceId = item.id;
      // 清空数据
      this.showPopover = false;
      this.databaseList = [];
      this.tableList = [];
      this.handleClose();
    },
  },
};
</script>
