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
                    <li class="item added" v-for="child in item.children" :key="child.id">
                      <div class="title">
                        <div class="u-icon-file">
                          <a-icon type="file" />
                        </div>
                        <span>{{ child.name }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <!-- 文件夹类型 end -->
                <div class="group" :key="item.id" v-else>
                  <ul class="items">
                    <li class="item">
                      <div class="title">
                        <div class="u-icon-file">
                          <a-icon type="file" />
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
          <div class="model-list-footer">新建数据模型</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { menuSearchLoop } from '@/utils';
import debounce from 'lodash/debounce';

/**
 * @description 数据模型
 */
export default {
  name: 'DataModelListPanel',
  props: {
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
      list: [
        {
          id: '536764020921061376',
          parentId: '0',
          createBy: '536360984344121344',
          modifyBy: '536360984344121344',
          gmtCreate: '2021-03-30 14:35:25',
          gmtModified: '2021-03-30 14:35:25',
          searchValue: null,
          privileges: [0],
          name: '119.23.208.36',
          projectId: 536360820476858383,
          type: 1,
          fileType: 1,
          icon: null,
          extension: null,
          children: [],
        },
        {
          id: '544389440391335936',
          parentId: '0',
          createBy: '1',
          modifyBy: '1',
          gmtCreate: '2021-04-20 15:36:07',
          gmtModified: '2021-04-20 15:36:07',
          searchValue: null,
          privileges: [0],
          name: 'oracle47.112.232.196',
          projectId: 536360820476858383,
          type: 2,
          fileType: 1,
          icon: null,
          extension: null,
          children: [],
        },
        {
          id: '544699568667086874',
          parentId: '0',
          createBy: '1',
          modifyBy: '1',
          gmtCreate: '2021-04-21 12:08:27',
          gmtModified: '2021-04-21 12:08:27',
          searchValue: null,
          privileges: [0],
          name: '谢测试',
          projectId: 536360820476858383,
          type: 1,
          fileType: 0,
          icon: null,
          extension: null,
          children: [
            {
              id: '567168020946210816',
              parentId: '544699568667086874',
              createBy: '1',
              modifyBy: '1',
              gmtCreate: '2021-06-22 12:10:03',
              gmtModified: '2021-06-22 12:10:03',
              searchValue: null,
              privileges: [0],
              name: '6月22号新建连接',
              projectId: 536360820476858383,
              type: 1,
              fileType: 1,
              icon: null,
              extension: null,
              children: [],
            },
            {
              id: '567172090981371904',
              parentId: '544699568667086874',
              createBy: '1',
              modifyBy: '1',
              gmtCreate: '2021-06-22 12:26:14',
              gmtModified: '2021-06-22 12:26:14',
              searchValue: null,
              privileges: [0],
              name: '6月22号新建连接oracle',
              projectId: 536360820476858383,
              type: 2,
              fileType: 1,
              icon: null,
              extension: null,
              children: [],
            },
            {
              id: '567249544286687232',
              parentId: '544699568667086874',
              createBy: '1',
              modifyBy: '1',
              gmtCreate: '2021-06-22 17:34:00',
              gmtModified: '2021-06-22 17:34:00',
              searchValue: null,
              privileges: [0],
              name: '多文件',
              projectId: 536360820476858383,
              type: 11,
              fileType: 1,
              icon: null,
              extension: null,
              children: [],
            },
            {
              id: '567251235920793600',
              parentId: '544699568667086874',
              createBy: '1',
              modifyBy: '1',
              gmtCreate: '2021-06-22 17:40:43',
              gmtModified: '2021-06-22 17:40:43',
              searchValue: null,
              privileges: [0],
              name: '1',
              projectId: 536360820476858383,
              type: 11,
              fileType: 1,
              icon: null,
              extension: null,
              children: [],
            },
            {
              id: '567874321096101888',
              parentId: '544699568667086874',
              createBy: '1',
              modifyBy: '1',
              gmtCreate: '2021-06-24 10:56:38',
              gmtModified: '2021-06-24 10:56:38',
              searchValue: null,
              privileges: [0],
              name: '测试',
              projectId: 536360820476858383,
              type: 11,
              fileType: 1,
              icon: null,
              extension: null,
              children: [],
            },
          ],
        },
        {
          id: '567208462706397185',
          parentId: '0',
          createBy: '536360984344121344',
          modifyBy: '536360984344121344',
          gmtCreate: '2021-06-22 14:50:45',
          gmtModified: '2021-06-22 14:50:45',
          searchValue: null,
          privileges: [0],
          name: '1',
          projectId: 536360820476858383,
          type: 11,
          fileType: 1,
          icon: null,
          extension: null,
          children: [],
        },
        {
          id: '567213591518105600',
          parentId: '0',
          createBy: '536360984344121344',
          modifyBy: '536360984344121344',
          gmtCreate: '2021-06-22 15:11:08',
          gmtModified: '2021-06-22 15:11:08',
          searchValue: null,
          privileges: [0],
          name: '47.115.14.69',
          projectId: 536360820476858383,
          type: 1,
          fileType: 1,
          icon: null,
          extension: null,
          children: [],
        },
        {
          id: '567257532695171072',
          parentId: '0',
          createBy: '1',
          modifyBy: '1',
          gmtCreate: '2021-06-22 18:05:45',
          gmtModified: '2021-06-22 18:05:45',
          searchValue: null,
          privileges: [0],
          name: '多文件csv',
          projectId: 536360820476858383,
          type: 12,
          fileType: 1,
          icon: null,
          extension: null,
          children: [],
        },
        {
          id: '567896616913063936',
          parentId: '0',
          createBy: '1',
          modifyBy: '1',
          gmtCreate: '2021-06-24 12:25:14',
          gmtModified: '2021-06-24 12:25:14',
          searchValue: null,
          privileges: [0],
          name: '6月24号',
          projectId: 536360820476858383,
          type: 1,
          fileType: 0,
          icon: null,
          extension: null,
          children: [
            {
              id: '567921509973086208',
              parentId: '567896616913063936',
              createBy: '1',
              modifyBy: '1',
              gmtCreate: '2021-06-24 14:04:09',
              gmtModified: '2021-06-24 14:04:09',
              searchValue: null,
              privileges: [0],
              name: '123',
              projectId: 536360820476858383,
              type: 11,
              fileType: 1,
              icon: null,
              extension: null,
              children: [],
            },
          ],
        },
      ],
    };
  },
  computed: {
    modelList() {
      // 数据模型展示列表
      return this.searchValue ? this.searchList : this.list;
    },
  },
  mounted() {
    // 获取数据模型列表
  },
  methods: {
    /**
     * @description 关闭创建数据模型
     */
    handleClose() {
      this.$emit('close', false);
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
              .u-icon-file {
                > .anticon {
                  color: #999;
                }
              }
              .title {
                color: #999;
              }
            }
            &.added:hover,
            &:hover {
              background: #627cff;
              .anticon,
              .title {
                color: #fff;
              }
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
