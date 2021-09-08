<template>
  <div class="data-model-wrapper">
    <div class="menu-btn model-menu">
      <p class="title">{{ selected ? selected.resourceName : '请选择模型' }}</p>
      <div class="menu-list-wrapper">
        <div class="menu-model-add" @click="handleAddDataModel">
          <span class="symbol-add">+</span>
          添加数据模型
        </div>
        <ul class="menu-list reset-scrollbar">
          <li
            class="menu-item"
            :class="{ selected: selected && selected.id === item.id }"
            v-for="(item, index) in list"
            :data-index="index"
            :key="item.id"
            @click="handleSelectDataModel(item)"
          >
            {{ item.resourceName }}
            <div class="u-icon">
              <a-icon class="check-icon" v-if="selected && selected.id === item.id" type="check"></a-icon>
              <a-icon class="delete-icon" type="delete" @click.stop="handleDelete(item)" />
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="model-field-search">
      <a-input-search
        :disabled="searchDisable"
        placeholder="搜索字段"
        @search="handleSearchFiled"
        @change="handleSearch"
        ref="js-filed-search"
      />
      <div class="menu-list-wrapper" v-if="searchResult.length">
        <ul class="menu-list reset-scrollbar">
          <li class="menu-item" v-for="item in searchResult" :key="item.id" @click="handleSelectResult(item)">
            {{ item.alias }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
/**
 * @description 数据模型区顶部区域
 */
export default {
  name: 'DataModelMenu',
  inject: ['screenInstance'],
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    selected: {
      type: Object,
      default: () => {},
    },
    searchList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      searchResult: [], // 搜索结果列表
    };
  },
  computed: {
    searchDisable() {
      return !this.searchList.length;
    },
  },
  methods: {
    /**
     * @description 打开添加数据模型
     */
    handleAddDataModel() {
      this.$emit('open', true);
    },
    /**
     * @description 选择数据模型
     */
    handleSelectDataModel(item) {
      this.$emit('select', item);
    },
    /**
     * @description 维度度量字段搜索
     */
    handleSearch: debounce(function (event) {
      const value = event.target.value;
      if (!value) {
        this.handleClearSearch();
      } else {
        this.handleSearchFiled(value);
      }
    }, 400),
    /**
     * @description 维度度量字段搜索，回车或者点搜索执行
     */
    handleSearchFiled(value) {
      if (!value) return;
      this.searchResult = [];
      value = typeof value === 'string' ? value.trim() : value;
      this.searchList.forEach(item => {
        if (item.alias.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          this.searchResult.push(item);
        }
      });
      if (this.searchResult.length === 0) {
        this.searchResult.push({
          alias: '没有符合的数据',
          id: -1,
        });
      }
    },
    /**
     * @description 维度度量字段搜索，字段选中
     */
    handleSelectResult(data) {
      if (data.id === -1) return;
      this.handleClearSearch();
      this.$emit('selectSearchFiled', data);
    },
    /**
     * @description 删除选中
     */
    handleDelete(item) {
      this.$emit('delete', item);
    },
    /**
     * @description 清空搜索
     */
    handleClearSearch() {
      this.searchResult = [];
      this.$refs['js-filed-search'].$refs.input.setValue('');
    },
  },
};
</script>
<style lang="less" scoped>
@deep: ~'>>>';
.data-model-wrapper {
  border-bottom: 1px solid #ccc;
}
.menu-btn {
  display: inline-block;
  height: 28px;
  line-height: 28px;
  border-radius: 2px;
  padding: 0 8px;
  user-select: none;
  text-align: center;
  cursor: pointer;
  border: 0;
  background-color: #f9fafb;
  box-shadow: 0 0 0 1px rgba(63, 63, 68, 0.07), 0 1px 3px 0 rgba(63, 63, 68, 0.12);
  &::after {
    position: absolute;
    top: 50%;
    margin-top: -6px;
    right: 10px;
    display: block;
    width: 7px;
    height: 7px;
    border: 1px solid #525252;
    border-top: 0;
    border-right: 0;
    transform: rotate(-45deg);
    content: '';
  }
  &.model-menu {
    position: relative;
    display: block;
    width: auto;
    margin: 10px 16px;
    > .title {
      font-size: 12px;
      overflow: hidden;
      word-wrap: normal;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    &:hover {
      .menu-list-wrapper {
        display: block;
      }
    }
    .menu-list-wrapper {
      display: none;
      z-index: 11;
    }
  }
}
.model-field-search {
  height: 28px;
  margin: 0 16px 10px 16px;
  position: relative;
  .menu-list-wrapper {
    left: 1px;
    right: 1px;
    top: 29px;
    .menu-list {
      .menu-item {
        padding-top: 5px;
        padding-bottom: 5px;
      }
    }
  }
}

.menu-list-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  top: 28px;
  background-color: #fff;
  font-size: 12px;
  outline: 1px solid #ccc;
  text-align: left;
  z-index: 10;
  > .menu-model-add {
    color: #677cf7;
    .symbol-add {
      position: relative;
      top: -1px;
    }
  }
  > .menu-model-add,
  .menu-item {
    border-bottom: 1px solid #ccc;
    padding-left: 10px;
    &:hover {
      background-color: #eee;
    }
  }
  .menu-list {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    .menu-item {
      padding-right: 20px;
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      .delete-icon {
        display: none;
      }
      .check-icon {
        display: inline-block;
      }
      &:hover {
        .delete-icon {
          display: inline-block;
        }
        .check-icon {
          display: none;
        }
      }
      &.selected {
        background-color: #eee;
        .anticon {
          color: #677cf7;
        }
      }
      > .u-icon {
        position: absolute;
        top: 0;
        right: 0;
        width: 20px;
        height: 20px;
        .anticon {
          font-size: 14px;
        }
      }
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
