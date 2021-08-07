<template>
  <div style="overflow:hidden;height:100%">
    <div class="screen-catalog" ref="screenCatalog">
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
              <a-menu-item @click="choose = true"> 选择大屏模版 </a-menu-item>
              <a-menu-item v-on:click="addScreen" v-if="hasPermissionSourceAdd">
                新建空白大屏
              </a-menu-item>
              <a-menu-item
                v-if="hasPermissionFolderAdd"
                key="1"
                @click="addFolder"
              >
                新建文件夹
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
        <div class="menu_search">
          <a-input
            placeholder="搜索大屏目录"
            v-model="searchName"
            @change="menuSearch"
          >
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
        </div>
        <a-empty v-else style="margin-top: 50px; color: rgba(0, 0, 0, 0.65)">
          <span slot="description">暂无数据大屏</span>
        </a-empty>
      </div>
      <div class="right scrollbar" style="overflow: hidden">
        <div class="right-header" v-if="fileSelectId > 0">
          <span class="nav_title">{{ fileSelectName }} </span>
          <img
            v-show="isPublish === 0"
            style="width: 18px; heigth: 18px"
            src="@/assets/images/chart/notpublish.png"
          />
          <img
            v-show="isPublish === 1 && releaseObj.valid"
            style="width: 18px; heigth: 18px"
            src="@/assets/images/chart/published.png"
          />
          <img
            v-show="isPublish === 1 && !releaseObj.valid"
            style="width: 18px; heigth: 18px"
            src="@/assets/images/chart/timeout.png"
          />
          <a-button class="btn_n1" @click="openScreen">全屏</a-button>
          <a-button v-if="hasPublishPermission" class="btn_n1" @click="release"
            ><span>发布</span>
            <a-dropdown
              v-show="isPublish === 1"
              :trigger="['click']"
              placement="bottomCenter"
              v-model="releaceMore"
            >
              <a-icon class="icon-more" type="caret-down" />
              <a-menu slot="overlay" class="drow_menu">
                <a-menu-item v-on:click="showShare"> 查看分享 </a-menu-item>
                <a-menu-item key="1" @click="cancelReleace">
                  撤销分享
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-button>

          <a-button class="btn_n2" @click="$refs.screen.refreshData()"
            >刷新数据</a-button
          >
          <a-button
            type="primary"
            class="btn_pr"
            v-if="hasEditPermission"
            @click="editScreen"
            >编辑大屏</a-button
          >
        </div>
        <div class="contain" ref="contain">
          <screen
            v-if="fileSelectId > 0"
            ref="screen"
            :key="componentKey"
            @getShareData="getShareData"
          ></screen>
          <div class="empty" v-else>
            <img src="@/assets/images/icon_empty_state.png" class="empty_img" />
            <p class="empty_word">
              暂无内容 ， 请先添加大屏目录数据或者选择一个大屏目录 ~
            </p>
          </div>
        </div>
      </div>

      <a-modal
        v-model="screenVisible"
        :title="
          isAdd === 1 ? '新建大屏' : isAdd === 2 ? '重命名大屏' : '选择文件夹'
        "
        @ok="handleOk"
      >
        <a-form
          :form="screenForm"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 12 }"
        >
          <a-form-item label="名称" v-if="isAdd !== 3">
            <a-input
              class="mod_input"
              v-decorator="[
                'name',
                { rules: [{ required: true, message: '请输入大屏名称' }] }
              ]"
              placeholder="请输入大屏名称"
              :maxLength="20"
            />
          </a-form-item>
          <a-form-item label="保存目录" v-if="isAdd !== 2">
            <a-select
              v-decorator="['parentId']"
              placeholder="选择大屏目录"
              allowClear
              style="width: 310px"
            >
              <a-select-option
                v-for="(item, index) in folderSelectList"
                :key="index"
                :value="item.id"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        v-model="releaseVisible"
        :title="isPublish === 1 ? '查看分享' : '发布分享'"
      >
        <template slot="footer">
          <a-button key="cancel" @click="releaseVisible = false">
            取消
          </a-button>
          <a-button key="submit" type="primary" @click="releaceConfirm">
            {{ isPublish === 1 ? '重新发布' : '发布' }}
          </a-button>
          <a-button
            key="back"
            v-if="isPublish === 1"
            @click="releaseVisible = false"
          >
            确定
          </a-button>
        </template>
        <div class="releace-box" @click="showCode = false">
          <div class="releace-line">
            <span class="errortext" v-if="isPublish === 1 && !releaseObj.valid"
              >当前资源已过期，请点击下方按钮重新发布</span
            >
          </div>
          <div class="releace-line">
            <span class="label"
              ><span style="color: #ff0000">*</span>分享链接：</span
            ><span class="text">{{ releaseObj.url }}</span>
          </div>
          <div class="indent">
            <span class="indent-text" @click="copyLink(releaseObj.url)"
              >复制链接</span
            >
            <a-icon
              type="qrcode"
              class="qrcode"
              :style="{ fontSize: '20px' }"
              @click.stop="showCode = true"
            />
          </div>
          <div class="releace-line">
            <span class="label">分享密码：</span
            ><input
              v-if="isPublish === 0"
              v-model="releaseObj.password"
              :class="[
                'mod_input',
                { 'has-error': showLimitWarn },
                'ant-input'
              ]"
              placeholder="请输入6位分享密码（数字+字母）"
              maxlength="6"
              @input="handlePassword"
            />
            <span v-else>{{ releaseObj.password || '无密码' }}</span>
          </div>
          <div class="releace-line" v-show="showLimitWarn">
            <span class="errortext">请输入6位数字+字母</span>
          </div>
          <div class="releace-line">
            <span class="label"
              ><span style="color: #ff0000">*</span>分享时效：</span
            >
            <a-radio-group v-if="isPublish === 0" v-model="releaseObj.expired">
              <a-radio :value="7">7天</a-radio>
              <a-radio :value="30">30天</a-radio>
              <a-radio :value="0">永久</a-radio>
            </a-radio-group>
            <span v-else>{{ expiredLabel }}</span>
          </div>
          <div class="code-show" v-show="showCode">
            <!-- <a-icon type="qrcode" :style="{ fontSize: '250px' }" /> -->
            <vue-qr :size="250" :text="releaseObj.url" :margin="0"></vue-qr>
          </div>
        </div>
      </a-modal>
      <new-folder
        ref="newFolderForm"
        :title="folderTitle"
        :visible="folderVisible"
        @cancel="hideFolder"
        @create="creatFolder"
      ></new-folder>

      <!-- 选择大屏模版 -->
      <a-drawer
        title="选择大屏模版"
        placement="bottom"
        height="500"
        :closable="false"
        :visible="choose"
        :bordered="false"
        @close="choose = false"
      >
        <div class="dvs-head-btns">
          <a-button type="primary" @click="getSubmit" :loading="btnloading">
            确定
          </a-button>
          <a-button
            style="marginright: 8px"
            @click="
              () => {
                ;(choose = false), (chooseIndex = null)
              }
            "
          >
            取消
          </a-button>
        </div>
        <div class="templeList">
          <a-card
            hoverable
            style="width: 240px"
            v-for="(item, index) in templeList"
            :key="index"
            :class="{ active: index === chooseIndex }"
            @click.stop="getCardClick(item, index)"
          >
            <img
              slot="cover"
              alt="example"
              height="240"
              :src="item.thumbnailsUrl"
            />
            <a-card-meta
              :title="item.title"
              style="text-align:center"
            ></a-card-meta>
          </a-card>
        </div>
      </a-drawer>
    </div>
    <screen isShootDom v-if="canvasMap && canvasMap.length"></screen>
  </div>
</template>

<script>
import NewFolder from '@/components/newFolder/newFolder'
import MenuFile from '@/components/dataSource/menu-group/file'
import MenuFolder from '@/components/dataSource/menu-group/folder'

import { mapGetters, mapActions } from 'vuex' // 导入vuex
import Screen from '@/views/screen' // 预览
import {
  addResizeListener,
  removeResizeListener
} from 'bin-ui/src/utils/resize-event'
import { checkActionPermission, hasPermission } from '@/utils/permission'
import debounce from 'lodash/debounce'
import { menuSearchLoop } from '@/utils/menuSearch'
import vueQr from 'vue-qr'
import { Loading } from 'element-ui'

export default {
  components: {
    NewFolder,
    MenuFile,
    MenuFolder,
    Screen,
    vueQr
  },
  data() {
    return {
      current: ['mail'],
      openKeys: ['sub1'],
      folderList: [], // 文件夹列表
      screenVisible: false, // 新建大屏弹窗
      isAdd: 1, // 1新增 2编辑 3删除
      folderVisible: false, // 新建文件夹弹窗
      releaseVisible: false, // 发布分享弹窗
      folderTitle: '',
      screenForm: this.$form.createForm(this), // 新建大屏弹窗
      releaseObj: {}, // 新建大屏弹窗
      showLimitWarn: false, // 发布大屏验证密码
      showCode: false, // 二维码大图框
      releaceMore: false, // 大屏已发布的发布按钮有下拉框
      customStyle:
        'background: #ffffff;border: 0;overflow: hidden;color:#3B3C43;',
      folderContenxtMenu: [
        {
          name: '新建大屏',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.add,
            OBJECT: this.$PERMISSION_CODE.OBJECT.screen
          },
          onClick: this.handleScreen
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit,
            OBJECT: this.$PERMISSION_CODE.OBJECT.screenFolder
          },
          onClick: this.handleResetFolder
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove,
            OBJECT: this.$PERMISSION_CODE.OBJECT.screenFolder
          },
          onClick: this.handleFolderDelete
        }
      ],
      fileContenxtMenu: [
        {
          name: '移动至',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit
          },
          onClick: this.handleFilemoveFile
        },
        {
          name: '重命名',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit
          },
          onClick: this.handleResetFile
        },
        {
          name: '复制',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.edit
          },
          onClick: this.copyScreen
        },
        {
          name: '删除',
          permission: {
            OPERATOR: this.$PERMISSION_CODE.OPERATOR.remove
          },
          onClick: this.handleFileDelete
        }
      ],
      searchName: '', // 搜索名称
      componentKey: 0, // 通过改变key实现子组件强制更新,数值在0,1之间变化
      choose: false,
      chooseIndex: null,
      chooseTemple: {}, // 选中的大屏模版
      templeList: [],
      btnloading: false,
      catalogContentStyle: {}
    }
  },
  watch: {
    fileSelectId(val) {
      // 切换大屏清空是否发布
      if (val) {
        this.showLimitWarn = ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'pageSettings',
      'canvasRange',
      'screenId',
      'fileName',
      'isScreen',
      'parentId',
      'pageList',
      'isPublish',
      'canvasMap'
    ]),
    folderSelectList() {
      return this.folderList.filter(item => item.fileType === 0)
      //   .concat({ name: '清空' })
    },
    fileSelectId: {
      get() {
        return this.$store.state.common.menuSelectId
      },
      set(value) {
        this.$store.dispatch('SetScreenId', value)
        this.$store.commit('common/SET_MENUSELECTID', value)
      }
    },
    fileSelectName: {
      get() {
        return this.fileName
      },
      set(value) {
        this.$store.dispatch('SetFileName', value)
      }
    },
    menuList() {
      return this.searchValue ? this.searchList : this.tableList
    },
    hasEditPermission() {
      return hasPermission(
        this.$store.state.common.privileges,
        this.$PERMISSION_CODE.OPERATOR.edit
      )
    },
    hasPublishPermission() {
      return hasPermission(
        this.$store.state.common.privileges,
        this.$PERMISSION_CODE.OPERATOR.publish
      )
    },
    hasPermissionFolderAdd() {
      return checkActionPermission(
        this.$PERMISSION_CODE.OBJECT.screenFolder,
        this.$PERMISSION_CODE.OPERATOR.add
      )
    },
    hasPermissionSourceAdd() {
      return checkActionPermission(
        this.$PERMISSION_CODE.OBJECT.screen,
        this.$PERMISSION_CODE.OPERATOR.add
      )
    },
    expiredLabel() {
      switch (this.releaseObj.expired) {
        case 7:
          return '7天'
        case 30:
          return '30天'
        default:
          return '永久'
      }
    }
  },
  mounted() {
    this.getList()
    this.$on('fileSelect', this.handleFileSelect)

    this.getScreenList()
    // this.$nextTick(() => {
    //   this.catalogContentStyle = {
    //     overflow: 'hidden',
    //     height: '100%'
    //   }
    // })

    window.onresize = () => {
      // 全屏下监控是否按键了ESC
      if (!this.checkFull()) {
        // 全屏下按键esc后要执行的动作
        this.componentKey -= 1
        this.$store.dispatch('SetIsScreen', false)
        this.$store.dispatch('ToggleContextMenu')
        // this.$nextTick(() => {
        //   this.catalogContentStyle = {
        //     overflow: hidden,
        //     height: this.$refs.screenCatalog.clientHeight + 20 + 'px'
        //   }
        // })
      }
    }
  },
  methods: {
    ...mapActions([
      'addScreenData',
      'saveScreenData',
      'renameScreenData',
      'SetCanvasRange'
    ]),
    // 获取文件夹列表
    getList() {
      let params = {
        type: 3
      }
      this.$server.screenManage.getFolderList({ params }).then(res => {
        if (res.code === 200) {
          let rows = res.data
          // 大屏文件保存不需要文件夹
          this.folderList = rows
          // 没有选择文件的时候默认选择第一个文件
          if (this.fileSelectId === -1 && this.folderList.length > 0) {
            this.getFirstScreen(this.folderList, 0)
          }
        }
      })
    },
    // 获取目录的第一个大屏
    getFirstScreen(list, index) {
      if (!list[index]) {
        return
      }
      if (list[index].fileType === 1) {
        this.fileSelectId = this.folderList[index].id
        this.fileSelectName = this.folderList[index].name
        return
      }
      if (list[index].children.length > 0) {
        this.fileSelectId = this.folderList[index].children[0].id
        this.fileSelectName = this.folderList[index].children[0].name
        return
      }
      this.getFirstScreen(list, index + 1)
    },
    // 搜索文件
    menuSearch: debounce(function(event) {
      const value = event.target.value
      if (value !== '') {
        this.handleGetSearchList(value)
      } else {
        this.getList()
      }
    }, 400),
    handleGetSearchList(value) {
      let result = []
      this.folderList.map(item => {
        const newItem = menuSearchLoop(item, value)
        if (newItem) result.push(newItem)
      })
      this.folderList = result
      console.log('搜索结果', this.folderList)
    },
    // 是否为文件夹 fileType|1:文件;0:文件夹
    handleIsFolder(item) {
      return item.fileType === 0
    },
    // 移动文件夹
    handleFilemoveFile(event, index, { parent, file }) {
      this.isAdd = 3
      this.id = file.id
      this.screenVisible = true
      this.name = file.name
    },
    // 选择移动文件夹弹窗确认
    async handleFileMoveCreate(parentId) {
      let params = {
        fileType: 1,
        id: this.id,
        name: this.name,
        parentId
      }
      const result = await this.$server.common.putMenuFolderName(
        '/screen/catalog/update',
        params
      )
      if (result.code === 200) {
        this.getList()
        this.$message.success('移动成功')
      } else {
        this.$message.error(result.msg)
      }

      this.screenVisible = false
    },
    // 拖动左侧菜单
    handleFileDrag(file) {
      this.dragFile = file
      this.id = file.id
      this.name = file.name
    },
    // 拖动后投放到目标文件夹
    async handleFileDrop(folder) {
      if (!this.dragFile || this.dragFile.parentId === folder.id) return
      this.handleFileMoveCreate(folder.id)
    },
    // 放到最外层目录
    handleWrapDrop(e) {
      const className = e.toElement.className
      if (className.indexOf('menu-wrap') > -1 && this.dragFile.parentId !== 0) {
        this.handleFileMoveCreate('0')
      }
    },
    // 大屏复制
    copyScreen(event, item, { parent, file, index }) {
      let loadingInstance = Loading.service({
        lock: true,
        text: '加载中...',
        target: document.querySelector('.screen-manage')
      })
      this.$server.screenManage
        .copyScreen(file.id)
        .then(res => {
          if (res.code === 200) {
            this.getList()
            this.$message.success(res.msg)
          } else {
            this.$message.error(res.msg)
          }
        })
        .finally(() => {
          loadingInstance.close()
        })
    },
    // 右键删除文件夹
    handleFolderDelete(event, item, { folder }) {
      if (folder.children && folder.children.length > 0) {
        return this.$message.error('文件夹下存在数据大屏不可删除')
      }
      this.handleDelete(folder.id)
    },
    // 右键删除文件
    handleFileDelete(event, item, { parent, file, index }) {
      this.$confirm({
        title: '确认提示',
        content: '确定删除该数据大屏?',
        onOk: async () => {
          this.handleDelete(file.id)
        }
      })
    },
    // 删除大屏
    handleDelete(id) {
      let params = {
        id
      }
      this.$server.common
        .deleMenuFolder(`/screen/catalog/delete/${id}`)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getList()
            this.$store.dispatch('SetParentId', '')
            this.$store.commit('common/SET_PRIVILEGES', [])
            this.$store.commit('common/SET_MENUSELECTID', -1)
          }
        })
    },
    // 重命名文件夹
    handleResetFolder(event, item, { folder }) {
      this.isAdd = 2
      this.id = folder.id
      this.folderVisible = true
      this.folderTitle = '重命名文件夹'
      // dom渲染以后才能给form赋值
      this.$nextTick(() => {
        this.$refs.newFolderForm.form.name = folder.name
      })
    },
    // 重命名大屏
    handleResetFile(event, item, { parent, file, index }) {
      this.isAdd = 2
      this.id = file.id
      this.screenVisible = true
      this.screenName = file.name

      // dom渲染以后才能给form赋值
      this.$nextTick(() => {
        this.screenForm.setFieldsValue({
          name: file.name
        })
      })
    },
    // 在文件夹底下新建大屏
    handleScreen(event, item, { folder }) {
      this.isAdd = 1
      this.screenVisible = true
      // dom渲染以后才能给form赋值
      this.$nextTick(() => {
        this.screenForm.setFieldsValue({
          parentId: folder.id
        })
      })
    },
    // 选择左侧菜单
    handleFileSelect(file) {
      if (this.fileSelectId === file.id) return
      this.fileSelectId = file.id
      this.fileSelectName = file.name
      this.$store.dispatch('SetParentId', file.parentId)
    },
    // 点击新建大屏
    addScreen() {
      this.isAdd = 1
      this.screenVisible = true
    },
    // 新建/编辑大屏名称
    handleOk(e) {
      this.screenForm.validateFields(async (err, values) => {
        if (err) {
          return
        }
        if (this.isAdd === 1) {
          // 新增
          // 新建大屏清空模型列表
          const res = await this.addScreenData({ ...values })
          if (res) {
            this.$store.dispatch('dataModel/setSelectedModelList', [])
            this.$router.push({
              name: 'screenEdit',
              query: { id: res }
            })
            this.fileSelectName = values.name
            // 新建默认赋予所有权限
            this.$store.commit('common/SET_PRIVILEGES', [0])
          } else {
            return
          }
        } else if (this.isAdd === 3) {
          // 移动大屏
          // 没有选文件夹保存在外面
          this.handleFileMoveCreate(values.parentId || '0')
        } else {
          if (values.name !== this.screenName) {
            let params = {
              id: this.id,
              setting: this.setting,
              ...values
            }
            this.renameScreenData({ ...params }).then(res => {
              if (res) {
                this.$message.success('重命名成功')
                this.fileSelectName = values.name
                this.getList()
                if (this.isPublish === 1) {
                  this.$refs.screen.getShareData()
                }
              }
            })
          }
        }
        this.screenForm.resetFields()
        this.screenVisible = false
      })
    },
    // 编辑大屏
    editScreen() {
      if (!this.screenId) {
        this.$message.error(' 请先添加大屏目录数据或者选择一个大屏目录')
        return
      }
      // 编辑大屏默认缩放是0.65
      this.SetCanvasRange(0.65)
      this.$store.dispatch('dataModel/setSelectedModelList', [])
      this.$router.push({
        name: 'screenEdit',
        query: {
          id: this.fileSelectId,
          tabId: this.pageList[0].id
        }
      })
    },
    // 点击新建文件夹
    addFolder() {
      this.isAdd = 1
      this.folderVisible = true
      this.folderTitle = '新建文件夹'
    },
    // 创建文件夹
    creatFolder(values) {
      if (this.isAdd === 1) {
        // 新增
        let params = {
          fileType: 0, // 0-文件夹,1-文件
          ...values,
          parentId: 0,
          type: 3 // 0-无类型,1-数据接入，2-数据建模,3-数据大屏
        }
        this.$server.common
          .addMenuFolder('/screen/catalog', params)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg)
              this.getList()
              // 新建文件夹后 返回空页面 不显示大屏
              this.fileSelectId = ''
              this.fileSelectName = ''
            } else {
              this.$message.error(res.msg)
            }
          })
      } else {
        // 修改
        let params = {
          fileType: 0,
          id: this.id,
          ...values
        }
        this.$server.common
          .putMenuFolderName('/screen/catalog/update', params)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg)
              this.getList()
            } else {
              this.$message.error(res.msg)
            }
          })
      }
      this.folderVisible = false
    },
    // 关闭新建文件夹弹窗
    hideFolder() {
      this.folderVisible = false
    },
    // 打开全屏
    openScreen() {
      this.$store.dispatch('SetIsScreen', true)
      this.componentKey += 1
      // this.$router.push({ name: 'screen', params: { id: this.userId } })
      this.$nextTick(() => {
        var docElm = document.querySelector('.dv-screen')
        if (docElm) {
          if (docElm.requestFullscreen) {
            // W3C
            docElm.requestFullscreen()
          } else if (docElm.mozRequestFullScreen) {
            // FireFox
            docElm.mozRequestFullScreen()
          } else if (docElm.webkitRequestFullScreen) {
            // Chrome等
            docElm.webkitRequestFullScreen()
          } else if (docElm.msRequestFullscreen) {
            // IE11
            docElm.msRequestFullscreen()
          }
        }
      })
    },
    /**
     * 是否全屏并按键ESC键的方法
     */
    checkFull() {
      // document.fullscreenEnabled 谷歌浏览器一直返回true
      // let isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled
      let isFull =
        window.fullScreen ||
        document.webkitIsFullScreen ||
        document.msFullscreenEnabled
      if (isFull === undefined) {
        isFull = false
      }
      return isFull
    },
    // 发布
    release() {
      if (this.isPublish === 0) {
        this.$server.screenManage.getScreenLink(this.screenId).then(res => {
          this.releaseObj = { url: res.data, expired: 7, password: '' }
          this.releaseVisible = true
        })
      } else {
        this.releaceMore = true
      }
    },
    // 获取分享信息
    getShareData(sharedata = {}) {
      this.releaseObj = sharedata
    },
    // 查看分享
    showShare() {
      this.releaceMore = false
      this.releaseVisible = true
    },
    copyLink(url) {
      let input = document.createElement('input') // 直接构建input
      input.value = url // 设置内容
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      const textResult = document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      if (textResult) {
        this.$message.info('复制成功')
      } else {
        this.$message.err('复制失败')
      }
    },
    // 验证密码
    handlePassword() {
      this.releaseObj.password = this.releaseObj.password.replace(/[\W]/g, '')
      this.showLimitWarn = false
      if (this.releaseObj.password.length === 6) {
        // 验证密码
        if (
          /^\d*$/.test(this.releaseObj.password) ||
          /^[a-z]*$/i.test(this.releaseObj.password)
        ) {
          this.showLimitWarn = true
        }
      }
    },
    // 确认发布
    releaceConfirm() {
      // 密码验证不通过
      if (this.showLimitWarn) {
        return
      }
      // 密码长度不够
      if (
        this.releaseObj.password.length > 0 &&
        this.releaseObj.password.length < 6
      ) {
        this.showLimitWarn = true
        return
      }
      this.releaseVisible = false
      let url = this.releaseObj.url
      let params = {
        url: url.substring(url.lastIndexOf('/') + 1, url.length),
        screenId: this.screenId,
        password: this.releaseObj.password,
        expired: this.releaseObj.expired,
        valid: true
      }
      // 未发布
      if (this.isPublish === 0) {
        this.$server.screenManage.releaseScreen(params).then(res => {
          if (res.code === 200) {
            this.$message.success('发布成功')
            // 状态改为已发布
            this.$store.dispatch('SetIsPublish', 1)
            this.$refs.screen.getShareData()
          }
        })
      } else {
        // 重新发布
        params.id = this.releaseObj.id
        this.$server.screenManage.reShareScreen(params).then(res => {
          if (res.code === 200) {
            this.$message.success('发布成功')
            this.releaseObj.valid = true
          }
        })
      }
    },
    cancelReleace() {
      this.$confirm({
        title: '确认撤销',
        content: `是否确认撤销分享?`,
        onOk: async () => {
          const res = await this.$server.screenManage.delShareScreen(
            this.screenId
          )
          if (res.code === 200) {
            this.$message.success('撤销成功')
            // 状态改为未发布
            this.$store.dispatch('SetIsPublish', 0)
          }
        }
      })
    },
    getSubmit() {
      this.btnloading = true
      this.$server.chooseScreen
        .saveScreenData(this.chooseTemple.screenId)
        .then(res => {
          this.btnloading = false
          this.$router.push({
            name: 'screenEdit',
            query: {
              id: res.data.screenId,
              tabId: res.data.tabId
            }
          })
        })
    },
    // 获取大屏模版
    getScreenList() {
      this.$server.chooseScreen.getScreenTemplates().then(res => {
        this.templeList = { ...res.data }
      })
    },
    getCardClick(item, index) {
      this.chooseIndex = index
      this.chooseTemple = { ...item }
    }
  },
  // 进入大屏重置菜单选择id
  beforeRouteEnter(to, from, next) {
    if (from.name !== 'screenEdit') {
      next(vm => {
        vm.$store.commit('common/SET_MENUSELECTID', -1)
      })
    } else {
      next()
    }
  },
  // 跳出大屏模块清除菜单选择id
  beforeRouteLeave(to, from, next) {
    if (to.name !== 'screenEdit') {
      this.fileSelectId = ''
      next()
    } else {
      next()
    }
  }
}
</script>

<style lang="styl" scoped>
@import './screenCatalog.styl';
</style>
