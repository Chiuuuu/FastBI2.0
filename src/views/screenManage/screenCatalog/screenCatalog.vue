<template>
  <div class="screen-catalog-wrapper">
    <div class="screen-catalog">
      <div class="left">
        <div class="menu_title">
          <span>大屏目录</span>
          <a-dropdown
            v-if="hasPermissionSourceAdd || hasPermissionFolderAdd"
            :trigger="['click']"
            placement="bottomLeft"
          >
            <a-icon type="plus-square" class="menu_icon" />
            <a-menu slot="overlay" class="drow_menu">
              <a-menu-item @click="handleTempModalOpen">选择大屏模版</a-menu-item>
              <a-menu-item v-if="hasPermissionSourceAdd" @click="handleAddScreen">新建空白大屏</a-menu-item>
              <a-menu-item v-if="hasPermissionFolderAdd" @click="handleAddFolder">新建文件夹</a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
        <div class="menu_search">
          <a-input placeholder="搜索大屏目录" v-model="searchName" @change="menuSearch">
            <a-icon class="icon_search" slot="suffix" type="search" />
          </a-input>
        </div>
        <div
          class="menu-wrap scrollbar screen-menu"
          v-if="folderList.length > 0"
          @dragover.stop.prevent
          @drop.stop.prevent="handleWrapDrop"
        >
          <div
            class="group"
            :class="handleIsFolder(folder) ? 'is-folder' : ''"
            v-for="(folder, index) in folderList"
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
                    :file="slotProps.file"
                    :index="slotProps.index"
                    :parent="folder"
                    :isSelect="fileSelect.id === slotProps.file.id"
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
                  :file="folder"
                  :index="index"
                  :isSelect="fileSelect.id === folder.id"
                  :contextmenus="fileContenxtMenu"
                  @fileSelect="handleFileSelect"
                  @fileDrag="handleFileDrag"
                ></menu-file>
              </ul>
            </template>
          </div>
        </div>
        <a-empty v-else style="margin-top: 50px; color: rgba(0, 0, 0, 0.65)">
          <span slot="description">暂无数据大屏</span>
        </a-empty>
      </div>
      <div class="right">
        <div class="right-header" v-if="fileSelect.id > 0">
          <span class="nav_title">{{ fileSelect.name }}</span>
          <img
            v-show="release.status === 'ready'"
            style="width: 18px; heigth: 18px"
            src="@/assets/images/chart/notpublish.png"
          />
          <img
            v-show="release.status === 'publish' && shareObj.valid"
            style="width: 18px; heigth: 18px"
            src="@/assets/images/chart/published.png"
          />
          <img
            v-show="release.status === 'publish' && !shareObj.valid"
            style="width: 18px; heigth: 18px"
            src="@/assets/images/chart/timeout.png"
          />
          <a-button class="btn_n1" @click="handleChangeBoardModel">全屏</a-button>
          <a-button v-if="hasPublishPermission && release.status === 'ready'" class="btn_n1" @click="handleRelease">
            发布
          </a-button>
          <a-dropdown v-if="hasPublishPermission && release.status !== 'ready'">
            <a-menu slot="overlay" class="drow_menu">
              <a-menu-item @click="showShare">查看分享</a-menu-item>
              <a-menu-item @click="handleReleaseCancel">撤销分享</a-menu-item>
            </a-menu>
            <a-button class="btn_n1">
              发布
              <a-icon class="icon-more" type="caret-down" />
            </a-button>
          </a-dropdown>
          <a-button class="btn_n2" @click="handleRefreshData">刷新数据</a-button>
          <a-button type="primary" class="btn_pr" v-if="hasEditPermission" @click="handleEditScreen">编辑大屏</a-button>
        </div>
        <div class="container">
          <div class="drawing-board-preview scrollbar" v-if="fileSelect.id > 0">
            <div class="preview-board-app">
              <!-- 内容编辑区 start -->
              <DrawingBoardContent :components="components" :type="parameter.PREVIEW"></DrawingBoardContent>
              <!-- 内容编辑区 end -->

              <!-- 内容编辑区工具栏 start -->
              <DrawingBoardPageTools :tabs="tabs" v-model="tabActive" :type="parameter.PREVIEW"></DrawingBoardPageTools>
            </div>
          </div>
          <div class="empty" v-else>
            <img src="@/assets/images/icon_empty_state.png" class="empty_img" />
            <p class="empty_word">暂无内容 ， 请先添加大屏目录数据或者选择一个大屏目录 ~</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增文件夹 start -->
    <new-folder
      ref="newFolderForm"
      :title="folder.title"
      :visible="folder.visible"
      @cancel="handleCancelFolder"
      @create="handleCreateFolder"
    ></new-folder>
    <!-- 新增文件夹 send -->

    <!-- 新建大屏/重命名大屏 start -->
    <a-modal
      v-model="screen.visible"
      :title="screen.type === 'add' ? '新建大屏' : screen.type === 'edit' ? '重命名大屏' : '选择文件夹'"
      @ok="handleSubmitScreenModal"
    >
      <a-form :form="screenForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
        <a-form-item label="名称" v-if="screen.type !== 'move'">
          <a-input
            class="mod_input"
            v-decorator="['name', { rules: [{ required: true, message: '请输入大屏名称' }] }]"
            placeholder="请输入大屏名称"
            :maxLength="20"
          />
        </a-form-item>
        <a-form-item label="保存目录" v-if="screen.type !== 'edit'">
          <a-select v-decorator="['parentId']" placeholder="选择大屏目录" allowClear style="width: 310px">
            <a-select-option v-for="(item, index) in folderSelectList" :key="index" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 新建大屏/重命名大屏 end -->

    <!-- 发布 start -->
    <a-modal v-model="release.visible" :title="release.status === 'publish' ? '查看分享' : '发布分享'">
      <template slot="footer">
        <a-button key="cancel" @click="handleReleaseModalClose">取消</a-button>
        <a-button key="submit" type="primary" @click="handleReleaseSubmit">
          {{ release.type === 'edit' ? '重新发布' : '发布' }}
        </a-button>
      </template>
      <div class="releace-box" @click="showCode = false">
        <div class="releace-line">
          <span class="errortext" v-if="release.status === 'publish' && !shareObj.valid">
            当前资源已过期，请点击下方按钮重新发布
          </span>
        </div>
        <div class="releace-line">
          <span class="label">
            <span style="color: #ff0000">*</span>
            分享链接：
          </span>
          <span class="text">{{ shareObj.url }}</span>
        </div>
        <div class="indent">
          <span class="indent-text" @click="copyLink(shareObj.url)">复制链接</span>
          <a-icon type="qrcode" class="qrcode" :style="{ fontSize: '20px' }" @click.stop="showCode = true" />
        </div>
        <div class="releace-line">
          <span class="label">分享密码：</span>
          <input
            v-if="release.status === 'ready'"
            v-model="shareObj.password"
            :class="['mod_input', { 'has-error': showLimitWarn }, 'ant-input']"
            placeholder="请输入6位分享密码（数字+字母）"
            maxlength="6"
            @input="handlePassword"
          />
          <span v-else>{{ shareObj.password || '无密码' }}</span>
        </div>
        <div class="releace-line" v-show="showLimitWarn">
          <span class="errortext">请输入6位数字+字母</span>
        </div>
        <div class="releace-line">
          <span class="label">
            <span style="color: #ff0000">*</span>
            分享时效：
          </span>
          <a-radio-group v-if="release.status === 'publish'" v-model="shareObj.expired">
            <a-radio :value="7">7天</a-radio>
            <a-radio :value="30">30天</a-radio>
            <a-radio :value="0">永久</a-radio>
          </a-radio-group>
          <span v-else>{{ expiredLabel }}</span>
        </div>
        <div class="code-show" v-show="showCode">
          <vue-qr :size="250" :text="shareObj.url" :margin="0"></vue-qr>
        </div>
      </div>
    </a-modal>
    <!-- 发布 end -->

    <!-- 选择大屏模版 -->
    <a-drawer
      title="选择大屏模版"
      placement="bottom"
      height="500"
      :closable="false"
      :visible="tempModal"
      :bordered="false"
      @close="handleTempModalClose"
    >
      <div class="dvs-head-btns">
        <a-button type="primary" @click="handleTempModalSubmit" :loading="tempModalBtnloading">确定</a-button>
        <a-button style="marginright: 8px" @click="handleTempModalClose">取消</a-button>
      </div>
      <div class="templeList">
        <a-card
          hoverable
          style="width: 240px"
          v-for="(item, index) in templeList"
          :key="index"
          :class="{ active: templeActive && templeActive.screenId === item.screenId }"
          @click.stop="handleTempleSelect(item)"
        >
          <img slot="cover" alt="example" height="240" :src="item.thumbnailsUrl" />
          <a-card-meta :title="item.title" style="text-align: center"></a-card-meta>
        </a-card>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import NewFolder from '@/components/newFolder/newFolder';
import MenuFile from '@/components/dataSource/menu-group/file';
import MenuFolder from '@/components/dataSource/menu-group/folder';
import DrawingBoardContent from '@/views/screenManage/screen/container/drawing-board-content';
import DrawingBoardPageTools from '@/views/screenManage/screen/container/drawing-board-page-tools';
import vueQr from 'vue-qr';
import { parameter, mutationTypes as boardMutaion } from '@/store/modules/board';
import { checkActionPermission, hasPermission } from '@/utils/permission';
import { menuSearchLoop } from '@/utils/menuSearch';
import pick from 'lodash/pick';
import debounce from 'lodash/debounce';
export default {
  name: 'ScreenCatalog',
  components: {
    NewFolder,
    MenuFolder,
    MenuFile,
    DrawingBoardContent,
    DrawingBoardPageTools,
    vueQr,
  },
  data() {
    return {
      parameter,
      folderList: [], // 文件夹列表
      dragFile: '',
      fileSelect: {
        id: '', // 大屏id
        tabId: '', // 大屏tabid
        name: '', // 大屏名称
        privileges: [], // 大屏权限
      },
      searchName: '', // 搜索大屏名称
      folderContenxtMenu: [
        {
          name: '新建大屏',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.add,
            OBJECT: this.$PERMISSION_CODE.OBJECT.screen,
          },
          onClick: this.handleScreen,
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
            OBJECT: this.$PERMISSION_CODE.OBJECT.screenFolder,
          },
          onClick: this.handleResetFolder,
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove,
            OBJECT: this.$PERMISSION_CODE.OBJECT.screenFolder,
          },
          onClick: this.handleFolderDelete,
        },
      ],
      fileContenxtMenu: [
        {
          name: '移动至',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
          },
          onClick: this.handleFilemoveFile,
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
          },
          onClick: this.handleResetFile,
        },
        {
          name: '复制',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
          },
          onClick: this.handleCopyScreen,
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove,
          },
          onClick: this.handleFileDelete,
        },
      ],
      tabs: [], // tab页
      tabActive: '', // 活动的tab
      folder: {
        type: '', // 类型方法
        id: '', // 文件夹id
        title: '', // 标题
        visible: false, // 打开
      },
      screen: {
        type: '', // 类型方法
        id: '', // 文件id
        parentId: '', // 文件夹id
        name: '', // 文件名称
        visible: false, // 打开
      },
      release: {
        type: '', // 类型方法,
        status: 'ready',
        visible: false, // 打开
      },
      shareObj: {
        url: '', // 分享链接
      },
      showLimitWarn: false, // 发布大屏验证密码
      showCode: false, // 二维码大图框
      screenForm: this.$form.createForm(this), // 新建大屏弹窗
      tempModal: false, // 大屏模板
      tempModalBtnloading: false, // 大屏模板确定按钮loading
      templeList: [], // 大屏模板列表
      templeActive: '', // 大屏选中
      components: [],
    };
  },
  computed: {
    folderSelectList() {
      return this.folderList.filter(item => item.fileType === 0);
    },
    hasPermissionFolderAdd() {
      return checkActionPermission(this.$PERMISSION_CODE.OBJECT.screenFolder, this.$PERMISSION_CODE.OPERATOR.add);
    },
    hasPermissionSourceAdd() {
      return checkActionPermission(this.$PERMISSION_CODE.OBJECT.screen, this.$PERMISSION_CODE.OPERATOR.add);
    },
    expiredLabel() {
      switch (this.shareObj.expired) {
        case 7:
          return '7天';
        case 30:
          return '30天';
        default:
          return '永久';
      }
    },
  },
  mounted() {
    // 初始化为预览模式
    this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
      model: this.parameter.PREVIEW,
    });

    const { id, tabId } = this.$route.query;
    if (id && tabId) {
      // 如果路由已经存在则获取大屏详情信息
      this.getScreenTabsById(id, tabId, false);
      this.handleGetMenuList(false);
    } else {
      // 如果没有则获取菜单的第一个
      this.handleGetMenuList();
    }
    this.handleGetScreenTempList();
  },
  watch: {
    $route(to) {
      const {
        query: { id, tabId },
      } = to;
      this.getScreenDetailByTabId(id, tabId);
    },
  },
  methods: {
    /**
     * @description 判断是否有编辑权限
     */
    hasEditPermission() {
      return hasPermission(this.fileSelect.privileges, this.$PERMISSION_CODE.OPERATOR.edit);
    },
    /**
     * @description 判断是否有发布权限
     */
    hasPublishPermission() {
      return hasPermission(this.fileSelect.privileges, this.$PERMISSION_CODE.OPERATOR.publish);
    },
    /**
     * @description 更新路由
     */
    handleCheckIdandTabId(file) {
      const {
        query: { id, tabId },
      } = this.$route;

      const isEmpty = !id && !tabId && !file.id && !file.tabId;
      if (isEmpty) return;

      const isSame = id && tabId && id === file.id && tabId === file.tabId;
      if (!isSame) {
        this.$router.push({
          query: {
            id: file.id,
            tabId: file.tabId,
          },
        });
      }
    },
    /**
     * @description 获取大屏分页
     * @param {number|string} screenId 大屏id
     * @param {number|string} tabId 大屏tabId
     * @param {boolean} isChangeRoute 控制是否更新路由
     */
    async getScreenTabsById(screenId, tabId = '', isChangeRoute = true) {
      // 先获取大屏对应的页签信息
      const result = await this.$server.screenManage.getScreenTabs(screenId);
      if (result && result.code === 200) {
        // 标签页
        this.tabs = [].concat(result.data.screenTabList);
        this.tabActive = tabId || this.tabs[0].id;

        // 发布信息
        this.release = {
          ...this.release,
          status: result.data.isPublish ? 'publish' : 'ready',
        };

        if (isChangeRoute) {
          this.$router.push({
            query: {
              id: screenId,
              tabId: this.tabActive,
            },
          });
        } else {
          this.getScreenDetailByTabId(result.data.id, this.tabActive);
        }
      } else {
        result.msg && this.$message.error(result.msg);
      }
    },
    /**
     * @description 获取大屏分页详情
     */
    async getScreenDetailByTabId(screenId, tabId) {
      const params = {
        screenId,
        tabId,
      };
      const result = await this.$store.dispatch('screen/getScreenDetailById', params);
      if (result) {
        this.fileSelect = {
          ...this.fileSelect,
          id: screenId,
          tabId: result.tabId,
          name: result.screenName,
          privileges: result.privileges,
        };
        this.components = [].concat(result.screenGraphs);
      }
    },
    /**
     * @description 编辑大屏
     */
    handleEditScreen() {
      this.$router.push({
        name: 'screenEdit',
        query: {
          id: this.fileSelect.id,
          tabId: this.fileSelect.tabId,
          model: 'edit',
        },
      });
    },
    /**
     * @description 刷新大屏数据
     */
    handleRefreshData() {
      this.getScreenDetailByTabId(this.fileSelect.id, this.fileSelect.tabId);
    },
    /**
     * @description 防抖搜索文件
     */
    menuSearch: debounce(function (event) {
      const value = event.target.value;
      if (value !== '') {
        this.handleGetSearchList(value);
      } else {
        this.handleGetMenuList();
      }
    }, 400),
    /**
     * @description 搜索文件
     */
    handleGetSearchList(value) {
      if (this.folderList && this.folderList.length) {
        let result = [];
        this.folderList.map(item => {
          const newItem = menuSearchLoop(item, value);
          if (newItem) result.push(newItem);
        });
        this.folderList = result;
      }
    },
    /**
     * @description 新增文件夹
     */
    _addFolder(values) {
      // 新增
      let params = {
        fileType: 0, // 0-文件夹,1-文件
        ...values,
        parentId: 0,
        type: 3, // 0-无类型,1-数据接入，2-数据建模,3-数据大屏
      };

      return this.$server.common.addMenuFolder('/screen/catalog', params);
    },
    /**
     * @description 编辑文件夹
     */
    _editFolder(values) {
      // 修改
      let params = {
        fileType: 0,
        id: this.folder.id,
        ...values,
      };

      return this.$server.common.putMenuFolderName('/screen/catalog/update', params);
    },
    /**
     * @description 删除文件/文件夹
     */
    async handleDelete(id) {
      const result = await this.$server.common.deleMenuFolder(`/screen/catalog/delete/${id}`);
      if (result && result.code === 200) {
        this.$message.success('删除成功');

        // 如果删除的是当前选中的文件，则清空
        if (this.fileSelect.id === id) {
          this.fileSelect = {
            ...this.fileSelect,
            id: '',
            tabId: '',
            name: '',
            privileges: [],
          };
        }
        this.handleGetMenuList();
      }
    },
    /**
     * @description 右键删除文件夹
     */
    handleFolderDelete(event, item, { folder }) {
      if (folder.children && folder.children.length > 0) {
        return this.$message.error('文件夹下存在数据大屏不可删除');
      }
      this.handleDelete(folder.id);
    },
    /**
     * @description 重命名文件夹
     */
    handleResetFolder(event, item, { folder }) {
      this.folder = {
        ...this.folder,
        id: folder.id,
        type: 'edit',
        visible: true,
        title: '重命名文件夹',
      };
      // dom渲染以后才能给form赋值
      this.$nextTick(() => {
        this.$refs.newFolderForm.form.name = folder.name;
      });
    },
    /**
     * @description 创建文件夹
     */
    async handleCreateFolder(values) {
      const funcs = {
        add: this._addFolder,
        edit: this._editFolder,
      };

      const fun = funcs[this.folder.type];
      if (!fun) return console.error(`don not has this method: ${this.folder.type}`);

      const result = await fun(values);

      if (result && result.code === 200) {
        this.$message.success(result.msg);
        this.handleGetMenuList();
        this.folder.visible = false;
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * @description 关闭新建文件夹弹窗
     */
    handleCancelFolder() {
      this.folder.visible = false;
    },
    /**
     * @description 创建文件夹
     */
    handleAddFolder() {
      this.folder = {
        ...this.folder,
        type: 'add',
        visible: true,
        title: '新建文件夹',
      };
    },
    /**
     * @description 全屏
     */
    handleChangeBoardModel() {
      this.$store.commit(boardMutaion.SET_BOARD_MODEL, {
        model: this.parameter.FULLSCREEN,
      });
    },
    /**
     * @description 判断是否为文件夹
     */
    handleIsFolder(item) {
      return item.fileType === 0;
    },
    /**
     * @description 移动大屏到文件夹
     */
    handleFilemoveFile(event, index, { file }) {
      this.screen = {
        ...this.screen,
        ...pick(file, ['id', 'parentId', 'name']),
        type: 'move',
        visible: true,
      };
    },
    /**
     * @description 复制大屏
     */
    async handleCopyScreen(event, item, { file }) {
      const result = await this.$server.screenManage.copyScreen(file.id);
      if (result && result.code === 200) {
        this.handleGetMenuList();
        this.$message.success(result.msg);
      } else {
        this.$message.error(result.msg);
      }
    },
    /**
     * @description 重命名大屏
     */
    handleResetFile(event, item, { file }) {
      this.screen = {
        ...this.screen,
        ...pick(file, ['id', 'parentId', 'name']),
        type: 'edit',
        visible: true,
      };
      // dom渲染以后才能给form赋值
      this.$nextTick(() => {
        this.screenForm.setFieldsValue({
          name: file.name,
        });
      });
    },
    /**
     * @description 获取左侧菜单列表
     * @param {boolean} isGetFirstScreen 是否要获取默认获取第一个大屏数据
     */
    handleGetMenuList(isGetFirstScreen = true) {
      this.$server.screenManage
        .getFolderList({
          type: 3,
        })
        .then(result => {
          if (result && result.code === 200) {
            this.folderList = [].concat(result.data);
            if (!isGetFirstScreen) return;
            if (!this.folderList.length) return;
            // 没有选择文件的时候默认选择第一个文件
            const filedId = this.fileSelect.id || '';
            if (!filedId) {
              this.getFirstScreenData(this.folderList, 0);
            }
          } else {
            this.$message.error(result.msg);
          }
        });
    },
    /**
     * @description 获取目录的第一个大屏
     */
    getFirstScreenData(list, index) {
      const FILE = 1;
      // 如果不存在
      if (!list[index]) return;
      // 如果找到是文件
      if (list[index].fileType === FILE) {
        this.getScreenTabsById(list[index].id);
        return;
      }
      // 如果是文件夹
      if (list[index].children.length) {
        this.getScreenTabsById(list[index].children[0].id);
        return;
      }
      this.getFirstScreenData(list, index + 1);
    },
    /**
     * @description 新增大屏
     */
    handleAddScreen() {
      this.screen = {
        ...this.screen,
        type: 'add',
        visible: true,
      };
    },
    /**
     * @description 在文件夹底下新建大屏
     */
    handleScreen(event, item, { folder }) {
      this.screen = {
        ...this.screen,
        type: 'add',
        visible: true,
      };
      // dom渲染以后才能给form赋值
      this.$nextTick(() => {
        this.screenForm.setFieldsValue({
          parentId: folder.id,
        });
      });
    },
    /**
     * @description 选择左侧菜单
     */
    handleFileSelect(file) {
      if (this.fileSelect && this.fileSelect.id === file.id) return;
      this.getScreenTabsById(file.id);
    },
    /**
     * @description 拖动文件
     */
    handleFileDrag(file) {
      this.dragFile = { ...file };
      this.screen = {
        ...this.screen,
        ...pick(file, ['id', 'parentId', 'name']),
        type: 'move',
        visible: false,
      };
    },
    /**
     * @description 拖放放到最外层目录
     */
    handleWrapDrop(e) {
      const className = e.toElement.className;
      if (className.indexOf('menu-wrap') > -1 && this.dragFile.parentId !== 0) {
        this._moveScreen({
          parentId: '0',
        });
      }
    },
    /**
     * @description 拖动后投放到目标文件夹
     */
    handleFileDrop(folder) {
      if (!this.dragFile || this.dragFile.parentId === folder.id) return;
      this._moveScreen({
        parentId: folder.id,
      });
    },
    /**
     * @description 右键删除文件大屏
     */
    handleFileDelete(event, item, { file }) {
      this.$confirm({
        title: '确认提示',
        content: '确定删除该数据大屏?',
        onOk: async () => {
          this.handleDelete(file.id);
        },
      });
    },
    /**
     * @description 新增大屏模态窗确定
     */
    handleSubmitScreenModal() {
      this.screenForm.validateFields(async (err, values) => {
        if (err) return;

        const funcs = {
          add: this._addScreen,
          edit: this._editScreen,
          move: this._moveScreen,
        };

        const fun = funcs[this.screen.type];
        if (!fun) return console.error(`don not has this method: ${this.screen.type}`);

        const result = await fun(values);
        if (result) {
          this.screenForm.resetFields();
          this.screen.visible = false;
        }
      });
    },
    /**
     * @description 新增大屏
     */
    async _addScreen(formData) {
      const params = {
        name: formData && formData.name ? formData.name : '未命名大屏',
        // 没有选目录默认在外面
        parentId: formData && formData.parentId ? formData.parentId : '0',
        isSaved: 1,
      };
      const result = await this.$server.screenManage.addScreen(params);
      if (result && result.code === 200) {
        this.$router.push({
          name: 'screenEdit',
          query: {
            ...result.data,
            model: 'add',
          },
        });
      } else {
        this.$message.error(result.msg);
        return false;
      }
    },
    /**
     * @description 大屏编辑名称
     */
    async _editScreen(formData) {
      if (this.screen.name === formData.name) return;
      let params = {
        id: this.screen.id,
        newName: formData.name,
      };
      const result = await this.$server.screenManage.renameScreen(params);

      if (result && result.code === 200) {
        this.$message.success('重命名成功');
        this.handleGetMenuList();
        return true;
      } else {
        this.$message.error(result.msg);
        return false;
      }
    },
    /**
     * @description 大屏移动文件夹
     */
    async _moveScreen(formData) {
      let params = {
        fileType: 1,
        id: this.screen.id,
        parentId: formData.parentId || '0',
      };
      if (this.screen.parentId === formData.parentId) {
        return this.$message.warning('已存在该文件夹下');
      }
      const result = await this.$server.common.putMenuFolderName('/v2/screen/catalog/update', params);
      if (result.code === 200) {
        this.$message.success('移动成功');
        this.handleGetMenuList();
        return true;
      } else {
        this.$message.error(result.msg);
        return false;
      }
    },
    /**
     * @description 大屏模板打开
     */
    handleTempModalOpen() {
      this.tempModal = true;
    },
    /**
     * @description 获取大屏模版列表
     */
    handleGetScreenTempList() {
      this.$server.chooseScreen.getScreenTemplates().then(result => {
        if (result && result.code === 200) {
          this.templeList = [].concat(result.data);
        } else {
          this.$message.error(result.msg);
        }
      });
    },
    /**
     * @description 大屏模板关闭
     */
    handleTempModalClose() {
      this.tempModal = false;
      this.templeActive = '';
    },
    /**
     * @description 大屏模板选择
     */
    handleTempleSelect(item) {
      this.templeActive = { ...item };
    },
    /**
     * @description 大屏模板选中确定
     */
    async handleTempModalSubmit() {
      this.tempModalBtnloading = true;
      const result = await this.$server.chooseScreen.saveScreenData(this.templeActive.screenId).finally(() => {
        this.tempModalBtnloading = false;
      });
      if (result && result.code === 200) {
        this.$router.push({
          name: 'screenEdit',
          query: {
            id: result.data.screenId,
            tabId: result.data.tabId,
            model: 'add',
          },
        });
      } else {
        this.$message(result.msg);
      }
    },
    /**
     * @description 查看分享
     */
    showShare() {
      this.release.visible = true;
    },
    /**
     * @description 复制链接
     */
    copyLink(url) {
      let input = document.createElement('input'); // 直接构建input
      input.value = url; // 设置内容
      document.body.appendChild(input); // 添加临时实例
      input.select(); // 选择实例内容
      const textResult = document.execCommand('Copy'); // 执行复制
      document.body.removeChild(input); // 删除临时实例
      if (textResult) {
        this.$message.info('复制成功');
      } else {
        this.$message.err('复制失败');
      }
    },
    /**
     * @description 点击发布
     */
    async handleRelease() {
      if (this.release.status === 'ready') {
        const result = await this.$server.screenManage.getScreenLink(this.fileSelect.id);
        if (result && result.code === 200) {
          this.shareObj = {
            ...this.shareObj,
            url: result.data,
            expired: 7,
            password: '',
          };
          this.release.visible = true;
        } else {
          this.$message.error(result.msg);
        }
      } else {
        this.release.status = 'publish';
      }
    },
    /**
     * @description 发布弹窗关闭
     */
    handleReleaseModalClose() {
      this.release.visible = false;
    },
    handlePassword() {
      this.shareObj.password = this.shareObj.password.replace(/[\W]/g, '');
      this.showLimitWarn = false;
      if (this.shareObj.password.length === 6) {
        // 验证密码
        if (/^\d*$/.test(this.shareObj.password) || /^[a-z]*$/i.test(this.shareObj.password)) {
          this.showLimitWarn = true;
        }
      }
    },
    /**
     * @description 大屏发布确定
     */
    handleReleaseSubmit() {
      // 密码验证不通过
      if (this.showLimitWarn) {
        return;
      }
      // 密码长度不够
      if (this.shareObj.password.length > 0 && this.shareObj.password.length < 6) {
        this.showLimitWarn = true;
        return;
      }
      this.release.visible = false;
      let url = this.shareObj.url;
      let params = {
        url: url.substring(url.lastIndexOf('/') + 1, url.length),
        screenId: this.fileSelect.id,
        password: this.shareObj.password,
        expired: this.shareObj.expired,
        valid: true,
      };
      // 未发布
      if (this.release.status === 'ready') {
        this.$server.screenManage.releaseScreen(params).then(res => {
          if (res.code === 200) {
            this.$message.success('发布成功');
            // 状态改为已发布
            this.release.status = 'publish';
          }
        });
      } else {
        // 重新发布
        params.id = this.shareObj.id;
        this.$server.screenManage.reShareScreen(params).then(res => {
          if (res.code === 200) {
            this.$message.success('发布成功');
            this.shareObj.valid = true;
          }
        });
      }
    },
    /**
     * @description 取消发布
     */
    handleReleaseCancel() {
      this.$confirm({
        title: '确认撤销',
        content: `是否确认撤销分享?`,
        onOk: async () => {
          const res = await this.$server.screenManage.delShareScreen(this.fileSelect.id);
          if (res.code === 200) {
            this.$message.success('撤销成功');
            // 状态改为未发布
            this.release.status = 'ready';
          }
        },
      });
    },
  },
};
</script>
<style lang="less">
@import url('./screenCatalog.less');
</style>
