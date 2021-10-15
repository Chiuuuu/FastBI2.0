<template>
  <div class="data-model-list-panel" :class="show ? 'panel-show' : ''">
    <div class="setting-wrapper">
      <div class="back" @click="handleClose">←</div>
      <h2 class="title">数据接入列表</h2>
      <div class="panel-body">
        <div class="model-list">
          <div class="model-search">
            <a-input-search placeholder="搜索数据接入" :disabled="isEmpty" @change="handleSearch" />
          </div>
          <div class="list-content reset-scrollbar">
            <template v-if="!isEmpty">
              <!-- 数据接入列表 start -->
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
                      @click="$event => handleSelectAccess($event, item)"
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
                    <li class="item" @click="$event => handleSelectAccess($event, item)">
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
                  </ul>
                </div>
              </template>
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
import Popoper from '../popover/index.js';
/**
 * @description 数据接入
 */
export default {
  name: 'DataSourceListPanel',
  extends: DataModelListPanel,
  props: {},
  data() {
    return {
      accessSelect: {}, // 数据接入选中
      iconType: [1, 2, 5, 11, 12],
      popoverInstance: '',
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
     * @description 数据接入选中
     */
    handleSelectAccess(event, item) {
      const that = this;
      this.accessSelect = {
        ...item,
      };
      this.popoverInstance = new Popoper({
        vm: that,
        target: event,
        data: this.accessSelect,
        callback: this.handleSaveAccess,
      });
    },
    /**
     * @description 保存数据接入
     */
    async handleSaveAccess(event, data) {
      const params = {
        screenId: this.screenInstance.screenInfo.screenId,
        tabId: this.screenInstance.screenInfo.tabId,
        resourceName: data.alias,
        datasourceId: this.accessSelect.id,
        databaseId: this.popoverInstance.databaseSelect,
        tableId: data.id,
      };
      const result = await this.$server.screenManage.saveScreenSelectAccess(params);
      if (result && result.code === 200) {
        this.popoverInstance.remove();

        data.tableId = data.id;
        data.resourceName = data.alias;

        this.$emit('select', data);
        this.handleClose();
      } else {
        this.$message.error(result.msg || '添加数据接入失败');
      }
    },
  },
};
</script>
<style lang="less">
.access-empty {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.access-table-warpper {
  top: 140px !important;
  width: 240px;
  .ant-popover-content {
    height: 100%;
    width: 100%;
  }
  .ant-popover-inner {
    width: 230px;
    height: calc(100vh - 220px);
    > div {
      width: 100%;
      height: 100%;
    }
    .ant-popover-inner-content {
      width: 100%;
      height: 100%;
    }
    .ant-spin-nested-loading > div > .ant-spin {
      max-height: initial;
    }
  }
}
</style>
