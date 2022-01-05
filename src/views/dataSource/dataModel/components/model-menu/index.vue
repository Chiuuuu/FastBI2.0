<template>
  <div class="model-menu">
    <div class="menu_title">
      <span class="m-t-s">数据模型</span>
      <a-dropdown v-if="hasPermissionSourceAdd || hasPermissionFolderAdd" :trigger="['click']" placement="bottomLeft">
        <a class="ant-dropdown-link">
          <a-icon type="plus-square" class="menu_icon" />
        </a>
        <a-menu slot="overlay" class="drow_menu">
          <a-menu-item v-if="hasPermissionSourceAdd" v-on:click="showModal">新建模型</a-menu-item>
          <a-menu-item v-if="hasPermissionFolderAdd" @click="handleAddNewFolder">新建文件夹</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <!-- 数据源选择弹窗 -->
    <SourceList :is-show="visible" @close="visible = false" @sourceSelected="handleOk" />

    <div class="menu_search">
      <a-input placeholder="搜索数据模型名称" @input="handleSearchModel">
        <a-icon class="icon_search" slot="suffix" type="search" />
      </a-input>
    </div>
    <a-empty v-if="modelResultList.length === 0" class="table_list-_empty">
      <span slot="description">暂无数据模型</span>
    </a-empty>
    <template v-else>
      <!-- <p class="menu_tips">右键文件夹或选项有添加，重命名等操作</p> -->
      <div class="menu-wrap scrollbar" @dragover.stop="handleDragOver" @drop="handleWrapDrop">
        <a-spin :spinning="spinning">
          <div
            class="group"
            :class="handleIsFolder(folder) ? 'is-folder' : ''"
            v-for="(folder, index) in modelResultList"
            :key="folder.id"
          >
            <template v-if="handleIsFolder(folder)">
              <menu-folder
                :folder="folder"
                :index="index"
                :contextmenus="folderContenxtMenu"
                @fileDrop="handleFileDrop"
              >
                <template v-slot:file="slotProps">
                  <menu-file
                    icon="dataModel"
                    :file="slotProps.file"
                    :index="slotProps.index"
                    :parent="folder"
                    :isSelect="fileSelectId === slotProps.file.id"
                    :contextmenus="fileContenxtMenu"
                    @fileSelect="handleFileSelect"
                    @fileDrag="handleFileDrag"
                  ></menu-file>
                </template>
              </menu-folder>
            </template>
            <template v-else>
              <ul class="items">
                <menu-file
                  icon="dataModel"
                  :file="folder"
                  :index="index"
                  :isSelect="fileSelectId === folder.id"
                  :contextmenus="fileContenxtMenu"
                  @fileSelect="handleFileSelect"
                  @fileDrag="handleFileDrag"
                ></menu-file>
              </ul>
            </template>
          </div>
        </a-spin>
      </div>
    </template>
    <reset-name-modal
      ref="resetNameForm"
      :visible="resetName.visible"
      :reset-name="resetName"
      :reset-type="2"
      @cancel="handleResetNameCancel"
      @create="handleResetNameCreate"
    ></reset-name-modal>
    <move-file-modal
      :visible="moveFileVisible"
      :selected="selectFile"
      :menuList="folderList"
      @cancel="moveFileVisible = false"
      @create="handleFileMoveCreate"
    ></move-file-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import SourceList from '../sourceList';
import ResetNameModal from '@/views/dataSource/dataAccess/components/data-main/data-menu/resetName';
import MoveFileModal from '@/views/dataSource/dataAccess/components/data-main/data-menu/moveFile';
import MenuFile from '@/components/dataSource/menu-group/file';
import MenuFolder from '@/components/dataSource/menu-group/folder';
import { checkActionPermission } from '@/utils/permission';
import { menuSearchLoop } from '@/utils/menuSearch';
import debounce from 'lodash/debounce';
export default {
  name: 'model-menu',
  components: {
    SourceList,
    ResetNameModal,
    MoveFileModal,
    MenuFolder,
    MenuFile,
  },
  data() {
    return {
      spinning: false,
      sourceSpinning: false,
      visible: false,
      resetName: {
        visible: false,
        type: 'new',
        item: '',
      },
      modelSearch: '', // 模型搜索关键词
      modelSearchList: [], // 模型搜索结果
      modelFolderList: [],
      modelFileList: [],
      modalFileSelectId: '',
      dragFile: '', // 拖动的文件
      selectFile: null, // 选中文件
      moveFileVisible: false, // 移动文件夹弹窗
      folderContenxtMenu: [
        {
          name: '新建模型',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.add,
            OBJECT: this.$PERMISSION_CODE.OBJECT.datamodel,
          },
          onClick: this.handleFolderNewModel,
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
            OBJECT: this.$PERMISSION_CODE.OBJECT.modelFolder,
          },
          onClick: this.handleFolderResetName,
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove,
            OBJECT: this.$PERMISSION_CODE.OBJECT.modelFolder,
          },
          onClick: this.handleFolderDelete,
        },
      ],
      fileContenxtMenu: [
        {
          name: '移动到',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
          },
          onClick: this.handleFilemove,
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
          },
          onClick: this.handleFileResetName,
        },
        {
          name: '复制',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.duplicate,
          },
          onClick: this.handleFileCopy,
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove,
          },
          onClick: this.handleFileDelete,
        },
      ],
    };
  },
  computed: {
    ...mapState({
      modelList: state => state.dataModel.menuList,
    }),
    modelResultList() {
      return this.modelSearch ? this.modelSearchList : this.modelList;
    },
    folderList() {
      return this.modelList.filter(item => item.fileType === 0);
    },
    fileSelectId: {
      get() {
        return this.$store.state.common.menuSelectId;
      },
      set(value) {
        this.$store.commit('dataModel/SET_MODELID', value);
        this.$store.commit('common/SET_MENUSELECTID', value);
      },
    },
    hasPermissionFolderAdd() {
      return checkActionPermission(this.$PERMISSION_CODE.OBJECT.modelFolder, this.$PERMISSION_CODE.OPERATOR.add);
    },
    hasPermissionSourceAdd() {
      return checkActionPermission(this.$PERMISSION_CODE.OBJECT.datamodel, this.$PERMISSION_CODE.OPERATOR.add);
    },
  },
  created() {
    this.handleGetMenuList();
  },
  mounted() {
    this.$on('fileSelect', this.handleFileSelect);
    this.$on('fileDrag', this.fileDrag);
  },
  methods: {
    /**
     * 获取模型列表
     */
    async handleGetMenuList() {
      this.$store.dispatch('dataModel/getMenuList', this);
    },
    handleFolderNewModel(mouseEvent, event, { folder }) {
      this.$store.dispatch('dataModel/setParentId', folder.id);
      this.showModal();
    },
    /**
     * 打开弹窗
     */
    showModal() {
      this.visible = true;
    },
    /**
     * 是否为文件夹
     */
    handleIsFolder(item) {
      return item.fileType === 0;
    },
    /**
     * 文件夹重命名
     */
    handleFolderResetName(mouseEvent, event, { folder }) {
      console.log('文件夹重命名', folder);
      this.resetName.type = 'reset';
      this.resetName.item = folder;
      this.resetName.visible = true;
      this.resetName.parentId = 0;
    },
    /**
     * 菜单重命名
     */
    handleFileResetName(mouseEvent, event, { file, parent }) {
      console.log('菜单重命名', file, parent);
      this.resetName.type = 'reset';
      this.resetName.item = file;
      this.resetName.visible = true;
      this.resetName.parentId = parent ? parent.id : 0;
    },
    /**
     * 模型复制
     */
    async handleFileCopy(mouseEvent, event, { file }) {
      const result = await this.$server.dataModel.copyDataModel(file.id);
      if (result && result.code === 200) {
        // 复制成功后重置目录列表
        this.$message.success('复制成功');
        this.$store.commit('dataModel/SET_MENULIST', result.data);
        this.$store.dispatch('user/getInfo'); // 刷新权限
        this.$nextTick(() => {
          this.handleGetModelSearchList(this.modelSearch);
        });
      } else {
        this.$message.error(result.msg || result.message || '请求错误');
      }
    },
    async _resetName(form) {
      const result = await this.$server.common.putMenuFolderName('/model/catalog/edit', {
        fileType: this.resetName.item.fileType,
        id: this.resetName.item.id,
        name: form.name,
        parentId: this.resetName.parentId || 0,
        type: 2,
      });

      if (result.code === 200) {
        this.handleGetMenuList();
        if (this.resetName.item.id === this.fileSelectId) {
          this.$store.commit('dataModel/SET_MODELNAME', form.name);
        }
        this.$message.success('修改成功');
        this.resetName.visible = false;
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * 文件夹删除
     */
    handleFolderDelete(mouseEvent, event, { folder }) {
      if (folder.children && folder.children.length > 0) {
        return this.$message.error('文件夹下存在数据模型不可删除');
      }
      this.$confirm({
        title: '确认提示',
        content: '确定删除该文件夹?',
        onOk: async () => {
          const result = await this.$server.common.deleMenuById('/model/catalog/removeCatalog/' + folder.id);

          if (result.code === 200) {
            this.handleGetMenuList();
            this.$store.dispatch('dataModel/setModelId', -1);
            this.$store.commit('common/SET_MENUSELECTID', -1);
            this.$store.commit('dataModel/SET_MODELNAME', '');
            this.$message.success('删除成功');
          } else {
            this.$message.error(result.msg);
          }
        },
      });
    },
    /**
     * 移动文件夹
     */
    handleFilemove(event, index, { file }) {
      this.selectFile = file;
      this.$store.dispatch('dataModel/setDatasource', file);
      this.moveFileVisible = true;
    },
    /**
     * 选择移动文件夹弹窗确认
     */
    async handleFileMoveCreate(parentId) {
      const result = await this.$server.common.putMenuFolderName('/model/catalog/edit', {
        fileType: this.selectFile.fileType,
        id: this.selectFile.id,
        name: this.selectFile.name,
        parentId: parentId,
        type: 2,
      });
      if (result.code === 200) {
        this.handleGetMenuList();
        this.$message.success('移动成功');
      } else {
        this.$message.error(result.msg);
      }

      this.moveFileVisible = false;
    },
    /**
     * 文件删除
     */
    handleFileDelete(mouseEvent, event, { file }) {
      this.$confirm({
        title: '确认提示',
        content: '确定删除该模型?',
        onOk: async () => {
          const result = await this.$server.common.deleMenuById(`/model/catalog/removeCatalog/${file.id}`);

          if (result.code === 200) {
            this.$message.success('删除成功');
            this.handleGetMenuList();
            const isSame = file.id === this.fileSelectId;
            if (isSame) {
              this.$store.dispatch('dataModel/setModelId', -1);
              this.$store.commit('common/SET_MENUSELECTID', -1);
              this.$store.commit('dataModel/SET_MODELNAME', '');
            }
          } else {
            this.$message.error(result.msg);
          }
        },
      });
    },
    /**
     * 点击左侧菜单获取模型信息
     */
    handleFileSelect(file, type) {
      if (type !== 'modal') {
        if (this.fileSelectId === file.id) return;
        this.visible = false;
        this.fileSelectId = file.id;
        this.$emit('getModelInfo', this.fileSelectId);
      } else {
        if (this.modalFileSelectId === file.id) return;
        this.modalFileSelectId = file.id;
        this.$store.dispatch('dataModel/setDatasource', file);
      }
    },
    /**
     * 拖动左侧菜单
     */
    handleFileDrag(file) {
      this.dragFile = file;
    },
    /**
     * 拖动后投放到目标文件夹
     */
    async handleFileDrop(folder) {
      if (!this.dragFile || this.dragFile.parentId === folder.id) return;
      const result = await this.$server.common.putMenuFolderName('/model/catalog/edit', {
        fileType: this.dragFile.fileType,
        id: this.dragFile.id,
        name: this.dragFile.name,
        parentId: folder.id,
        type: 2,
      });
      if (result.code === 200) {
        this.handleGetMenuList();
        this.$message.success('移动成功');
      } else {
        this.$message.error(result.msg);
      }
    },
    handleDragOver(e) {
      e.preventDefault();
    },
    /**
     * 拖动后投放到最外层目录
     */
    async handleWrapDrop(e) {
      const className = e.toElement.className;
      if (className.indexOf('menu-wrap') > -1 && this.dragFile.parentId !== 0) {
        const result = await this.$server.common.putMenuFolderName('/model/catalog/edit', {
          fileType: this.dragFile.fileType,
          id: this.dragFile.id,
          name: this.dragFile.name,
          parentId: 0,
          type: 2,
        });
        if (result.code === 200) {
          this.handleGetMenuList();
          this.$message.success('移动成功');
        } else {
          this.$message.error(result.msg);
        }
      }
    },
    /**
     * 确定选择的数据接入
     */
    handleOk({ id }) {
      this.visible = false;
      this.$router.push({
        name: 'modelEdit',
        query: {
          type: 'add',
          datasourceId: id,
        },
      });
    },
    /**
     * 搜索目录列表
     */
    handleSearchModel: debounce(function (event) {
      const value = event.target.value;
      this.modelSearch = value;
      if (value) {
        this.handleGetModelSearchList(value);
      }
    }, 400),
    handleGetModelSearchList(value) {
      let result = [];
      this.modelList.map(item => {
        const newItem = menuSearchLoop(item, value);
        if (newItem) result.push(newItem);
      });
      this.modelSearchList = result;
    },
    /**
     * 新增文件夹
     */
    handleAddNewFolder() {
      this.resetName.visible = true;
      this.resetName.type = 'new';
    },
    async _addNewFolder(form) {
      const result = await this.$server.common.addMenuFolder('/model/catalog/addDataModelCatalog', {
        name: form.name,
        type: 2,
        parentId: 0,
        fileType: 0,
      });

      if (result.code === 200) {
        this.$message.success('添加成功');
        this.handleGetMenuList();
        this.resetName.visible = false;
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * 重命名取消
     */
    handleResetNameCancel() {
      this.resetName.visible = false;
    },
    /**
     * 重命名确定
     */
    handleResetNameCreate(values) {
      if (this.resetName.type === 'reset') {
        this._resetName(values);
      } else if (this.resetName.type === 'new') {
        this._addNewFolder(values);
      }
    },
  },
};
</script>

<style lang="styl" scoped>
@import "./menu.styl";
</style>
