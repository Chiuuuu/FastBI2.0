<template>
  <div class="data-model-list-panel" :class="show ? 'panel-show' : ''">
    <div class="setting-wrapper">
      <div class="back" @click="handleClose">←</div>
      <h2 class="title">数据模型列表</h2>
      <div class="panel-body">
        <div class="model-list">
          <div class="model-search">
            <a-input-search placeholder="搜索数据接入" @change="handleSearch" />
          </div>
          <div class="list-content reset-scrollbar">
            <a-empty description="没有符合数据" v-if="searchValue && searchList.length === 0"></a-empty>
            <template v-else>
              <!-- 数据模型列表 start -->
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
                      :class="{ added: judgeAdded(child) }"
                      v-for="child in item.children"
                      :key="child.id"
                      @click="handleSelectDataModel(child)"
                    >
                      <div class="title">
                        <div class="u-icon-file">
                          <div class="file-icon icon-bg icon-model"></div>
                        </div>
                        <span>{{ child.name }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <!-- 文件夹类型 end -->
                <div class="group" :key="item.id" v-else>
                  <ul class="items">
                    <li class="item" :class="{ added: judgeAdded(item) }" @click="handleSelectDataModel(item)">
                      <div class="title">
                        <div class="u-icon-file">
                          <div class="file-icon icon-bg icon-model"></div>
                        </div>
                        <span>{{ item.name }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </template>
              <!-- 数据模型列表 end -->
            </template>
          </div>
          <!-- <div class="model-list-footer">新建数据模型</div> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { menuSearchLoop } from '@/utils';
import debounce from 'lodash/debounce';
import { mapGetters } from 'vuex';

/**
 * @description 数据模型
 */
export default {
  name: 'DataModelListPanel',
  inject: ['getResourceType'],
  props: {
    selectedList: {
      type: Array,
      default() {
        return [];
      },
    },
    currentSelected: {
      type: Object,
      default() {
        return null;
      },
    },
    show: {
      // 是否显示
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      searchValue: '', // 搜索字段
      searchList: [], // 搜索列表
      list: [],
    };
  },
  computed: {
    ...mapGetters(['modelExpand', 'dataModel', 'screenId', 'selectedModelList', 'currSelected', 'canvasMap']),
    modelList() {
      // 数据模型展示列表
      return this.searchValue ? this.searchList : this.list;
    },
  },
  mounted() {},
  methods: {
    /**
     * @description 获取数据模型列表
     */
    async handleGetData() {
      const res = await this.$server.common.getMenuList('/model/catalog/list/2');
      if (res && res.code === 200) {
        this.list = res.data;
      } else {
        this.list = [];
      }
    },
    /**
     * @description 选择模型
     */
    async handleSelectDataModel(item) {
      // let params = {
      //   screenId: this.$store.getters.screenId,
      //   resourceName: item.name,
      //   datasourceId: '',
      //   databaseId: '',
      //   tableId: item.id,
      //   origin: 8,
      // };
      // await this.$server.screenManage.screenModuleSave(params);
      item.resourceType = this.getResourceType();
      item.resourceName = item.name;
      this.$emit('update:currentSelected', item);
      let list = this.selectedModelList.concat([item]);
      this.$store.dispatch('dataModel/setSelectedModelList', list);
      this.handleClose();
    },
    /**
     * @description 关闭创建数据模型
     */
    handleClose() {
      this.$emit('close', false);
    },
    /**
     * @description 判断模型是否已选
     */
    judgeAdded(item) {
      return this.selectedList.some(n => n.id === item.id);
    },
    /**
     * @description 数据模型搜索
     */
    handleSearch: debounce(function (event) {
      this.searchList = [];
      this.searchValue = event.target.value;
      if (!this.searchValue) return;
      this.list.forEach(item => {
        const newItem = menuSearchLoop(item, this.searchValue);
        if (newItem) {
          this.searchList.push(newItem);
        }
      });
    }, 400),
  },
};
</script>
<style lang="less" scoped>
.table-list {
  height: 40vh;
  overflow-y: auto;
  width: 200px;

  .table-list-item {
    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    &:hover {
      background: #103ffa;
      color: #fff;
    }
    &.added {
      pointer-events: none;
      cursor: not-allowed;
      color: #999;
    }
    // &.added:hover,
    &:hover {
      background: #627cff;
      .anticon,
      .title {
        color: #fff;
      }
    }
  }
}
.data-model-list-panel {
  position: absolute;
  top: 0;
  left: 100%;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  transition: left 0.3s, top 0.3s;
  z-index: 200;
  &.panel-show {
    left: 0;
  }
  .panel-body {
    height: calc(100% - 36px);
    .model-list {
      background-color: #fff;
      height: 100%;
      padding-top: 10px;
      box-sizing: border-box;
      .model-search {
        margin: 10px auto;
        margin-top: 0;
        position: relative;
        width: 93%;
        background-color: pink;
        height: 28px;
      }
      .list-content {
        height: calc(100vh - 210px);
        position: relative;
        overflow-y: auto;
        .group {
          .title {
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            font-weight: 400;
            padding: 0 28px 0 22px;
            color: #282828;
            overflow: hidden;
            word-wrap: normal;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .u-icon-folder,
          .u-icon-file {
            float: left;
            height: 30px;
            line-height: 30px;
            margin-right: 5px;
            > .anticon {
              display: inline-block;
              width: 14px;
              height: 14px;
              font-size: 15px;
            }
          }
        }
        .folder {
          position: relative;
          .title {
            text-align: left;
            border: 0;
          }
          & ~ .items {
            .item {
              > .title {
                padding-left: 34px;
              }
            }
          }
          &:hover {
            background: #627cff;
            .title {
              color: #fff;
            }
          }
        }
        .items {
          .item {
            height: 30px;
            line-height: 30px;
            padding: 0;
            position: relative;
            cursor: pointer;
            &.added {
              pointer-events: none;
              cursor: not-allowed;
              .u-icon-file {
                > .anticon {
                  color: #999;
                }
              }
              .title {
                color: #999;
              }
            }
            // &.added:hover,
            &:hover {
              background: #627cff;
              .anticon,
              .title {
                color: #fff;
              }
            }
            .file-icon {
              display: inline-block;
              margin-bottom: -3px;
              height: 16px;
              width: 16px;
            }
            .icon-bg {
              background: url('../../../../../assets/images/common/types.png') no-repeat;
              background-size: 110px 16px;
            }
            .icon-2 {
              // oracle
              background-position: 0 0;
            }
            .icon-11 {
              // excel
              background-position: -18px 0;
            }
            .icon-5 {
              // hive
              background-position: -36px 0;
            }
            .icon-1 {
              // mysql
              background-position: -54px 0;
            }
            .icon-12 {
              // csv
              background-position: -72px 0;
            }
            .icon-model {
              // 数据模型
              background-position: -94px 0;
            }
          }
        }
      }
      .model-list-footer {
        font-size: 12px;
        display: block;
        margin: 5px auto;
        width: 120px;
        margin-top: 15px;
        background-color: #103ffa;
        border-color: #103ffa;
        color: #fff;
        height: 28px;
        line-height: 28px;
        -moz-border-radius: 2px;
        border-radius: 2px;
        padding: 0 8px;
        user-select: none;
        text-align: center;
        cursor: pointer;
        border: 0;
        box-shadow: 0 0 0 1px rgba(63, 63, 68, 0.07), 0 1px 3px 0 rgba(63, 63, 68, 0.12);
      }
    }
  }
}
</style>
