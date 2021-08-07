<template>
  <div class="container screen-manage">
    <!-- 搜索栏 -->
    <a-form-model class="material-search-area" layout="inline" :model="searchForm">
      <a-form-model-item prop="keywords">
        <a-input v-model="searchForm.keywords" placeholder="请输入关键字"></a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="handleGetData">搜索</a-button>
      </a-form-model-item>
      <a-form-model-item style="margin-left: auto">
        <a-button :disabled="categoryId == 1" type="primary" icon="upload" @click="openUploadModal">上传素材</a-button>
      </a-form-model-item>
    </a-form-model>
    <!-- 搜索栏end -->

    <!-- 素材列表 -->
    <a-spin :spinning="spinning" class="material-list-area scrollbar">
      <MaterialList
        :material-list="materialList"
        @refresh="handleGetData"
        @preview="handlePreviewImage"
      />
    </a-spin>
    <!-- 素材列表end -->

    <!-- 分页器 -->
    <a-pagination
      class="material-pagination"
      showQuickJumper
      showSizeChanger
      :current="pagination.current"
      :pageSize="pagination.pageSize"
      :total="pagination.total"
      :show-total="total => `共${total}条记录`"
      @change="handlePageChange"
      @showSizeChange="handleSizeChange"
    ></a-pagination>
    <!-- 分页器end -->

    <!-- 上传素材弹窗 -->
    <a-modal
      v-model="visible"
      title="上传素材"
      :confirm-loading="loading"
      :bodyStyle="{ height: '350px', 'max-height': 'calc(100vh - 240px)', 'overflow-y': 'auto' }"
      :maskClosable="false"
      @ok="handleSaveMaterial"
      @cancel="handleCloseModel"
    >
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 4 }"
        :wrapperCol="{ span: 20 }"
      >
        <a-form-model-item label="素材名称" prop="name">
          <a-input v-model="form.name" placeholder="请输入素材名称"></a-input>
        </a-form-model-item>
        <a-form-model-item label="所在分组" prop="parentId">
          <a-select v-model="form.parentId" :default-value="'1'">
            <a-select-option
              v-for="item in categoryList"
              :key="item.id"
              :value="item.id"
            >{{ item.name }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="本地图片" prop="file">
          <a-upload
            accept=".jpg, .png, .gif, .jpeg, .bmp, .heic, .ico"
            list-type="picture-card"
            :file-list="fileList"
            :before-upload="() => false"
            @preview="handlePreviewImage"
            @change="handleImageChange"
          >
            <div v-if="fileList.length < 1">
              <a-icon type="plus" />
              <div class="ant-upload-text">点击上传图片</div>
            </div>
          </a-upload>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- 预览大图弹窗 -->
    <a-modal
      class="previewer"
      v-model="previewVisible"
      title="素材预览"
      :centered="true"
      :bodyStyle="{ 'max-height': '80vh', 'padding': 0, 'text-align': 'center', 'overflow-y': 'auto' }"
      :footer="null"
      @cancel="previewUrl = ''"
    >
      <img
        style="cursor: move"
        :src="previewUrl"
        @mousedown="handleImgMouseDown"
        @mouseup="handleImgMouseUp"
        @mouseleave="handleImgMouseUp"
        @mousemove="handleImgMouseMove"
      />
    </a-modal>
  </div>
</template>

<script>
import commonValidateField from '@/utils/validator'
import paginationMixin from '@/mixins/pagination'
import MaterialList from '../material-list/material-list'

export default {
  name: 'ScreenMaterialMain',
  inject: ['getCategoryList', 'getCategoryId'],
  mixins: [paginationMixin],
  components: {
    MaterialList
  },
  data() {
    return {
      // 搜索栏
      searchForm: {
        keywords: ''
      },

      // 模态框
      visible: false,
      loading: false,
      form: {
        name: '',
        parentId: this.categoryId,
        file: null
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入素材名称'
          },
          {
            min: 1,
            max: 10,
            message: '请输入1~10个字的素材名称'
          },
          commonValidateField.noEmoji({ title: '素材名称' })
        ],
        parentId: [
          {
            required: true,
            message: '请选择所在分类'
          }
        ],
        file: [
          {
            required: true,
            message: '请上传图片'
          }
        ]
      },
      fileList: [], // 图片文件

      // 素材列表
      spinning: false,
      materialList: [],

      // 预览大图
      isMovingImage: false,
      mouseLocation: {
        x: 0, // 鼠标坐标
        y: 0, // 鼠标坐标
        scrollX: 0, // 当前横向滚动距离
        scrollY: 0 // 当前纵向滚动距离
      },
      previewVisible: false,
      previewUrl: ''
    }
  },
  computed: {
    categoryId() {
      return this.getCategoryId()
    },
    categoryList() {
      return this.getCategoryList()
    }
  },
  watch: {
    previewVisible(newValue, oldValue) {
      if (newValue) {
        this.$nextTick(() => {
          document
            .querySelector('.previewer.ant-modal-root .ant-modal-body')
            .addEventListener('scroll', this.onPreviewScroll)
        })
      } else {
        this.mouseLocation = this.$options.data().mouseLocation
        document
          .querySelector('.previewer.ant-modal-root .ant-modal-body')
          .removeEventListener('scroll', this.onPreviewScroll)
      }
    }
  },
  methods: {
    // 获取素材列表
    async handleGetData() {
      this.spinning = true
      const result = await this.$server.screenMaterial
        .getMaterialList({
          id: this.categoryId,
          name: this.searchForm.keywords,
          current: this.pagination.current,
          pageSize: this.pagination.pageSize
        })
        .finally(() => {
          this.spinning = false
        })
      if (result.code === 200) {
        this.materialList = result.rows
        this.pagination.total = result.total
      } else {
        this.$message.error(result.msg || '查询失败')
      }
    },
    // 打开上传素材弹窗
    openUploadModal() {
      this.form.parentId = this.categoryId
      this.visible = true
    },
    // 获取最新上传的图片
    handleImageChange({ file, fileList }) {
      this.fileList = fileList
      if (fileList.length > 0) {
        if (file.size > 10 * 1024 * 1024) {
          this.$message.error('上传文件不得大于10M')
          this.fileList.splice(0)
        } else {
          this.form.file = file
        }
      } else {
        this.form.file = null
      }
    },
    /**
     * 预览大图
     * 预览素材会emit一个url
     * 上传时的预览则直接读文件(url.thumbUrl为antd自带的预览图被压缩了)
     * */
    handlePreviewImage(url) {
      if (typeof url === 'string') {
        this.previewVisible = true
        this.previewUrl = url
      } else {
        console.log(url, this.form.file)
        const fileReader = new FileReader()
        fileReader.readAsDataURL(this.form.file)
        fileReader.onload = () => {
          this.previewVisible = true
          this.previewUrl = fileReader.result
          // this.previewUrl = url.thumbUrl
        }
      }
    },
    // 图片预览鼠标拖拽移动相关
    handleImgMouseDown(e) {
      e.preventDefault()
      this.isMovingImage = true
      this.mouseLocation = Object.assign({}, this.mouseLocation, {
        x: e.layerX + this.mouseLocation.scrollX,
        y: e.layerY + this.mouseLocation.scrollY
      })
    },
    handleImgMouseMove(e) {
      if (this.isMovingImage) {
        // 获取滚动窗
        const scrollBody = document.querySelector(
          '.previewer.ant-modal-root .ant-modal-body'
        )
        // 当前可滚动的距离
        const scrollWidth = e.target.clientWidth - scrollBody.clientWidth
        const scrollHeight = e.target.clientHeight - scrollBody.clientHeight

        // 点击时记录的坐标 - 鼠标移动的坐标
        let scrollX = this.mouseLocation.x - e.layerX
        if (scrollX < 0) { // 边界值处理
          scrollX = 0
        } else if (scrollX > scrollWidth) {
          scrollX = scrollWidth
        }
        let scrollY = this.mouseLocation.y - e.layerY
        if (scrollY < 0) { // 边界值处理
          scrollY = 0
        } else if (scrollY > scrollHeight) {
          scrollY = scrollHeight
        }

        // 滚动窗口并更新当前滚动距离
        scrollBody.scrollTo(scrollX, scrollY)
        this.mouseLocation = Object.assign({}, this.mouseLocation, {
          scrollX: scrollX,
          scrollY: scrollY
        })
      }
    },
    handleImgMouseUp(e) {
      e.preventDefault()
      this.isMovingImage = false
    },
    onPreviewScroll({ target }) {
      // 窗口滚轮滚动时,记录滚动位置
      this.mouseLocation = Object.assign({}, this.mouseLocation, {
        scrollX: target.scrollLeft,
        scrollY: target.scrollTop
      })
    },
    // 确认新建素材
    handleSaveMaterial() {
      this.$refs.form.validate(async (ok) => {
        if (ok) {
          const formData = new FormData()
          formData.append('parentId', this.form.parentId)
          formData.append('name', this.form.name)
          formData.append('file', this.form.file)

          this.loading = true
          const result = await this.$server.screenMaterial
            .addMaterial(formData)
            .finally(() => {
              this.loading = false
            })
          if (result.code === 200) {
            this.handleCloseModel()
            this.handleGetData()
            this.$message.success('新建成功')
          } else {
            this.$message.error(result.msg || '新建失败')
          }
        }
      })
    },
    // 关闭模态框
    handleCloseModel() {
      this.$refs.form.resetFields()
      this.form = this.$options.data().form
      this.fileList = []
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
@deep: ~'>>>';
.previewer @{deep} .ant-modal {
  width: 60vw !important;
}
.container {
  display: flex;
  flex-direction: column;
  background: #fff;
  padding-left: 15px;
  padding-bottom: 15px;
  color: #020510;

  .material-search-area {
    display: flex;
    align-items: center;
    height: 50px;
  }

  .material-list-area {
    width: 100%;
    flex: 1;
    overflow-y: auto;
  }

  .material-pagination {
    width: 100%;
    height: 32px;
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
