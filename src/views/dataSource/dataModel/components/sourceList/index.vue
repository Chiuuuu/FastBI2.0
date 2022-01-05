<template>
  <a-modal
    :visible="isShow"
    title="选择数据接入"
    :bodyStyle="{
      height: `300px`,
      overflowY: 'auto',
    }"
    destroyOnClose
    @cancel="$emit('close')"
    @ok="handleOk"
  >
    <a-input ref="userNameInput" :value="sourceSearch" placeholder="搜索数据接入" @input="handleSearchSource">
      <a-icon slot="prefix" type="search" />
    </a-input>
    <router-link to="/dataSource/dataAccess" class="modal-item hover">新建数据接入</router-link>
    <div class="menu-wrap modal-wrap scrollbar">
      <a-spin :spinning="sourceSpinning">
        <div
          class="group"
          :class="handleIsFolder(folder) ? 'is-folder' : ''"
          v-for="(folder, index) in sourceResultList"
          :key="folder.id"
        >
          <template v-if="handleIsFolder(folder)">
            <MenuFolder :folder="folder" :index="index">
              <template v-slot:file="slotProps">
                <MenuFile
                  icon="dataSource"
                  :file="slotProps.file"
                  :index="slotProps.index"
                  :isSelect="selectId === slotProps.file.id"
                  :parent="folder"
                  :disabled="exceptList.includes(slotProps.file.id)"
                  @fileSelect="handleFileSelect"
                ></MenuFile>
              </template>
            </MenuFolder>
          </template>
          <template v-else>
            <ul class="items">
              <MenuFile
                icon="dataSource"
                :file="folder"
                :index="index"
                :isSelect="selectId === folder.id"
                :disabled="exceptList.includes(folder.id)"
                @fileSelect="handleFileSelect"
              ></MenuFile>
            </ul>
          </template>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script>
import debounce from 'lodash/debounce';
import { menuSearchLoop } from '@/utils/menuSearch';
import MenuFile from '@/components/dataSource/menu-group/file';
import MenuFolder from '@/components/dataSource/menu-group/folder';
export default {
  name: '',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    exceptList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    MenuFile,
    MenuFolder,
  },
  // watch: {
  //   isShow(newValue, oldValue) {
  //     if (newValue && !oldValue) {
  //       this.handleGetDataSourceList()
  //     }
  //   }
  // },
  mounted() {
    this.handleGetDataSourceList();
  },
  data() {
    return {
      sourceSpinning: false,
      sourceSearch: '',
      sourceList: [],
      sourceSearchList: [],
      select: {},
      selectId: '',
    };
  },
  computed: {
    sourceResultList() {
      return this.sourceSearch ? this.sourceSearchList : this.sourceList;
    },
  },
  methods: {
    /**
     * 获取数据源数据
     */
    async handleGetDataSourceList() {
      this.sourceSpinning = true;
      const result = await this.$server.common.getMenuList('/datasource/catalog/list/1').finally(() => {
        this.sourceSpinning = false;
      });
      if (result.code === 200) {
        this.sourceList = result.rows;
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * 是否为文件夹
     */
    handleIsFolder(item) {
      return item.fileType === 0;
    },
    /**
     * 搜索目录列表
     */
    handleSearchSource: debounce(function (event) {
      const value = event.target.value;
      this.sourceSearch = value;
      if (value) {
        this.handleGetSourceSearchList(value);
      }
    }, 400),
    handleGetSourceSearchList(value) {
      let result = [];
      this.sourceList.map(item => {
        const newItem = menuSearchLoop(item, value);
        if (newItem) result.push(newItem);
      });
      this.sourceSearchList = result;
    },
    /**
     * 点击左侧菜单获取模型信息
     */
    handleFileSelect(file) {
      if (this.selectId === file.id) return;
      this.selectId = file.id;
      this.select = file;
      this.$store.dispatch('dataModel/setDatasource', file);
    },
    /**
     * 确定选择的数据接入
     */
    handleOk() {
      if (!this.selectId) {
        return this.$message.error('请选择数据源');
      }
      this.$emit('close');
      this.$emit('sourceSelected', this.select);
    },
  },
};
</script>

<style scoped></style>
