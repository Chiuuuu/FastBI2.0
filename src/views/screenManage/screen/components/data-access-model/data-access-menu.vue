<template>
  <div class="data-model-wrapper">
    <div class="menu-btn model-menu">
      <p class="title">{{ selected ? selected.name : '请选择数据表' }}</p>
      <div class="menu-list-wrapper">
        <div class="menu-model-add" @click="handleAddDataModel">
          <span class="symbol-add">+</span>
          添加数据接入
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
            {{ item.name }}
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
        placeholder="搜索字段,回车确定"
        @search="handleSearchFiled"
        @change="handleSearch"
        ref="js-filed-search"
      />
      <div class="menu-list-wrapper" v-if="searchResult.length">
        <ul class="menu-list reset-scrollbar">
          <li class="menu-item" v-for="item in searchResult" :key="item.id" @click="handleSelectResult(item)">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @description 数据接入区顶部区域
 */
import DataModelMenu from './data-model-menu';
export default {
  name: 'DataSourceMenu',
  extends: DataModelMenu,
};
</script>
