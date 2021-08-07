<template>
  <div class="tab-excel tab-datasource">
    <div class="tab-datasource-model scrollbar">
      <a-form-model
        ref="fileForm"
        :model="form"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="数据源名称" prop="name">
          <a-input placeholder="请输入数据源名称" v-model="form.name" @change="handleSetTableName" />
        </a-form-model-item>
        <a-form-model-item label="Excel文件" required>
          <a-spin :spinning="spinning" :tip="uploadProgress">
            <div
              class="excel-list scrollbar"
              ref="files"
              @dragenter.stop="fileDragEnter"
            >
              <div
                class="mask"
                v-show="isDragenter"
                @dragleave.stop="fileDragLeave"
                @dragover.stop.prevent
                @drop.stop="fileDrop"
              ></div>
              <template v-if="fileInfoList.length > 0">
                <div
                  class="excel-list-item"
                  :class="{ active: currentFileIndex === index }"
                  v-for="(item, index) in fileInfoList"
                  :key="item.id"
                  :title="item.name"
                  @click="handleGetDataBase(index)"
                >
                  <div class="text">{{ item.name }}</div>
                  <div>
                    <a-icon type="retweet" title="替换" style="margin-right:10px" @click.stop="handleReplaceFile(item, index)" />
                    <a-icon type="delete" title="删除" @click.stop="handleRemove(item)"></a-icon>
                  </div>
                </div>
              </template>
              <a-empty style="margin-top:35px" v-else>
                <span slot="description">点击添加或将文件拖拽至此上传</span>
              </a-empty>
            </div>
          </a-spin>
          <a-upload
            accept=".xlsx, .xls"
            name="file"
            :headers="{ 'content-type': 'multipart/form-data' }"
            :showUploadList="false"
            :before-upload="beforeFileUpload"
            @change="handleFileChange"
          >
            <a-button ref="uploader" type="primary" :loading="spinning || loading">
              添加文件
            </a-button>
          </a-upload>
        </a-form-model-item>
      </a-form-model>
      <a-row class="preview-list">
        <a-col :span="4" style="height:100%;width: 150px;">
          <div class="preview-tab">
            <div class="tab-title">Sheet子表</div>
            <ul class="scrollbar" style="overflow-y: auto;height: calc(100% - 38px);">
              <li
                class="preview-tab-item"
                :title="sheet.name"
                :class="{ 'active': currentSheetIndex === index }"
                v-for="(sheet, index) in sheetList"
                :key="index"
                @click="handleChangeTab(sheet, index)"
              >{{ sheet.name }}</li>
            </ul>
          </div>
        </a-col>
        <a-col :span="19" style="height:100%">
          <!-- <div class="preview-controller">
            <span>从第</span>
            <div class="preview-line">
              <a-input style="width:60px" v-model="line" @keyup.enter.stop="handleEnterLine" />
              <div class="arrow-box" style="width:16px">
                <div class="arrow" @click="countLine('plus')">
                  <i class="arrow-up"></i>
                </div>
                <div class="arrow" @click="countLine('minus')">
                  <i class="arrow-down"></i>
                </div>
              </div>
            </div>
            <span>行开始获取数据</span>
            <a-checkbox style="margin-left: 50px" @change="handleCheckBox">自动生成列名</a-checkbox>
          </div> -->
          <div class="sheet-table scrollbar">
            <template v-if="currentFieldList.length > 0">
              <a-spin :spinning="spinning">
                <table>
                  <thead class="sheet-head">
                    <tr style="border: none"><th v-for="item in currentColumns" :key="item.dataIndex"><div class="cell-item">{{ item.title }}</div></th></tr>
                  </thead>
                  <tbody class="sheet-body scrollbar">
                    <tr v-for="(item, index) in currentFieldList" :key="item.key">
                      <td><div class="cell-item">{{ index + 1 }}</div></td>
                      <td v-for="col in currentColumns.slice(1)" :key="col.dataIndex"><div class="cell-item">{{ item[col.dataIndex] }}</div></td>
                    </tr>
                  </tbody>
                </table>
              </a-spin>
            </template>
            <a-empty style="margin: 20px 0" v-else></a-empty>
          </div>
        </a-col>
      </a-row>
    </div>
    <a-button
      type="primary"
      class="btn_sub"
      @click="handleSaveForm"
      :loading="spinning || loading"
      v-if="hasPermission"
    >
      保存
    </a-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { MapSheet } from '../util'
import { hasPermission } from '@/utils/permission'
export default {
  name: 'model-excel',
  data() {
    return {
      btnPermission: [this.$PERMISSION_CODE.OPERATOR.edit, this.$PERMISSION_CODE.OPERATOR.add],
      loading: false,
      spinning: false,
      uploadProgress: '加载中',
      uploadCallback: (num) => {
        // 使用本地 progress 事件
        if (num < 100) {
          this.uploadProgress = num + '%'
        } else {
          this.uploadProgress = '文件解析中'
        }
      },
      isDragenter: false,
      form: {
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入数据源名称'
          },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '长度为1~20'
          }
        ]
      },
      labelCol: {
        span: 4
      },
      fileList: [], // 文件列表
      fileInfoList: [], // 编辑时获取的文件信息
      deleteIdList: [], // 删除的文件列表
      databaseList: [], // 文件对应数据库列表
      currentSheetIndex: 0, // 当前选中sheet
      currentFileIndex: 0, // 当前选中文件
      isSetTableHead: false, // 是否自动生成列名(暂无该需求)
      line: 1, // 当前显示的首行(暂无该需求)
      requestLine: 1, // 记录上次设置的首行(暂无该需求)
      columns: [], // 表头数据
      noTitleColumns: [], // 自动生成表头时的表头(暂无该需求)
      currentColumns: [], // 当前显示的表头
      fieldList: [], // 列表数据
      noTitleFieldList: [], // 自动生成表头时的列表(暂无该需求)
      currentFieldList: [], // 当前显示的列表
      replaceFile: {
        isReplace: false, // 是否在进行文件替换操作
        index: -1, // 被替换的文件索引
        info: null // 被替换的文件详情
      },
      // 新文件保存数据格式
      operation: []
    }
  },
  computed: {
    ...mapState({
      parentId: state => state.dataAccess.parentId,
      modelId: state => state.dataAccess.modelId,
      modelName: state => state.dataAccess.modelName,
      modelInfo: state => state.dataAccess.modelInfo,
      modelFileList: state => state.dataAccess.modelFileList,
      modelType: state => state.dataAccess.modelType,
      privileges: state => state.common.privileges,
      databaseName: state => state.dataAccess.databaseName
    }),
    currentDataBase() {
      return this.databaseList[this.currentFileIndex] || {}
    },
    sheetList() { // 当前文件的sheet列表
      return this.currentDataBase.sheetList || []
    },
    tableList() { // sheet表格数据
      return this.currentDataBase.tableList || []
    },
    hasPermission() {
      return hasPermission(this.privileges, this.$PERMISSION_CODE.OPERATOR.edit)
    }
  },
  watch: {
    modelName(newValue, oldValue) {
      this.form.name = newValue
    }
  },
  mounted() {
    this.$EventBus.$on('setFormData', this.handleSetFormData)
    this.$EventBus.$on('resetForm', this.handleResetForm)
  },
  beforeDestroy() {
    this.handleClearTable()
    this.clearReplaceFile()
    this.$EventBus.$off('setFormData', this.handleSetFormData)
    this.$EventBus.$off('resetForm', this.handleResetForm)
  },
  methods: {
    handleChangeTab(sheet, index) {
      if (this.loading) return
      this.currentSheetIndex = index
      this.renderCurrentTable(index)
    },
    // 重置表单
    handleResetForm() {
      this.form = { name: '' }
      this.fileList = []
      this.fileInfoList = []
      this.databaseList = []
      this.handleClearTable()
      this.clearReplaceFile()
    },
    /**
     * 设置表单名称
     */
    handleSetTableName() {
      this.$emit('on-set-table-name', this.form.name)
    },
    // 清空当前表格内容
    handleClearTable() {
      this.uploadProgress = '加载中'
      this.currentColumns = []
      this.currentFieldList = []
      this.deleteIdList = []
    },
    // 渲染表单
    handleSetFormData() {
      if (this.modelType !== 'excel') return
      this.handleResetForm()
      if (this.modelId) { // 有id就是编辑状态
        this.$set(this.form, 'name', this.modelName)
        this.getFileList()
      }
    },
    // 获取文件列表
    getFileList() {
      this.spinning = true
      this.$server.dataAccess.getModelFileList(this.modelId)
        .then(res => {
          this.fileInfoList = res.rows
          const name = this.modelInfo ? this.modelInfo.databaseName : ''

          // 默认第一个
          let index = 0
          for (let i = 0; i < res.rows.length; i++) {
            const item = res.rows[i]
            if (name === item.name) {
              index = i
            }
          }
          this.$nextTick(() => {
            this.handleGetDataBase(index)
          })
        })
        .catch(() => {
          this.spinning = false
        })
    },
    // 获取当前文件对应的数据库信息
    async handleGetDataBase(index) {
      if (this.loading) return
      this.currentSheetIndex = 0
      if (index < 0) {
        this.currentColumns = []
        this.currentFieldList = []
        this.$store.dispatch('dataAccess/setFirstFinished', false)
      } else {
        this.currentFileIndex = index
        let database = this.databaseList[index]
        if (!database) { // 不存在当前数据库, 调接口查询并写入
          if (!this.fileInfoList[index]) return
          this.spinning = true
          const res = await this.$server.dataAccess.getFileSheetList(this.fileInfoList[index].id)
            .finally(() => {
              this.spinning = false
            })
          if (res.code === 200) {
            database = new MapSheet(res.rows)
            this.$set(this.databaseList, index, database)
          } else {
            this.$message.error('获取表格失败')
          }
        }
        this.$store.dispatch('dataAccess/setDatabaseName', this.fileInfoList[index].name)
        this.renderCurrentTable(0)
      }
    },
    // 清空替换文件
    clearReplaceFile() {
      this.uploadProgress = '加载中'
      this.replaceFile = {
        isReplace: false,
        index: -1,
        info: null
      }
    },
    // 替换文件
    handleReplaceFile(file, index) {
      if (this.loading) return
      this.replaceFile = {
        isReplace: true,
        index: index,
        info: file
      }
      this.$refs.uploader.$el.click()
    },
    // 删除文件
    handleRemove(file) {
      if (this.loading) return
      this.$confirm({
        title: '确认提示',
        content: '您确定要删除该文件吗',
        onOk: () => {
          let index = this.fileInfoList.indexOf(file)
          this.databaseList.splice(index, 1)
          this.fileInfoList.splice(index, 1)

          // 如果删除当前被替换的文件, 清空替换文件对象
          if (this.replaceFile.index > -1 && file.id === this.replaceFile.info.id) {
            this.clearReplaceFile()
          }

          let isOperation = false
          for (let i = 0; i < this.fileList.length; i++) {
            const item = this.fileList[i]
            let name = item.name
            name = name.slice(0, name.lastIndexOf('.'))
            // 找到文件名, 判断是否为新增
            if (name === file.name) {
              isOperation = true
              this.fileList.splice(i, 1)
              this.operation.splice(i, 1)
              // 库里有的文件, 先记录id, 保存时插入到operation最后
              if (file.id && !isNaN(file.id)) {
                this.deleteIdList.push({
                  databaseId: file.id,
                  databaseName: file.name,
                  operation: 3
                })
                this.$store.dispatch('dataAccess/setFirstFinished', false)
              }
              break
            }
          }
          if (!isOperation && !isNaN(file.id) && this.deleteIdList.indexOf(file.id) < 0) {
            this.deleteIdList.push({
              databaseId: file.id,
              databaseName: file.name,
              operation: 3
            })
            this.$store.dispatch('dataAccess/setFirstFinished', false)
          }
          this.$nextTick(() => {
            this.handleGetDataBase(this.fileInfoList.length - 1)
          })
        }
      })
    },
    // 处理拖动区域样式
    fileDragEnter(e) {
      const classList = this.$refs.files.classList
      if (!classList.contains('drag')) {
        this.isDragenter = true
        classList.add('drag')
      }
    },
    // 处理拖动区域样式
    fileDragLeave(e) {
      const classList = this.$refs.files.classList
      if (classList.contains('drag')) {
        this.isDragenter = false
        classList.remove('drag')
      }
    },
    fileDrop(e) {
      this.isDragenter = false
      this.$refs.files.classList.remove('drag')
      const fileList = [...e.dataTransfer.files]
      if (fileList.length > 1) {
        return this.$message.error('一次只能上传一个文件')
      }
      fileList.map(file => {
        this.fileValidate(file)
      })
      e.preventDefault()
    },
    // 手动上传文件
    beforeFileUpload() {
      return false
    },
    // 上传文件
    handleFileChange(e) {
      this.fileValidate(e.file)
    },
    // 校验文件
    fileValidate(file) {
      let isValid = true

      // 校验替换时的文件名
      let name = file.name
      name = name.slice(0, name.lastIndexOf('.'))
      if (this.replaceFile.isReplace && this.replaceFile.info.name !== name) {
        this.$message.error('替换的文件名称不一致')
        isValid = false
      }

      // if (isValid && this.fileInfoList.length > 0 && !this.replaceFile.isReplace) {
      //   this.$message.error('只支持上传一个文件')
      //   isValid = false
      // }
      // 校验大小
      if (isValid && file.size > 3 * 1024 * 1024) {
        isValid = false
        this.$message.error('文件大于3M, 无法上传')
      }

      // 校验命名规则(中英数字下划线)
      if (isValid && !/^[0-9a-zA-Z_\u4E00-\u9FA5\uF900-\uFA2D]*$/g.test(name)) {
        isValid = false
        this.$message.error('命名存在非法字符')
      }

      // 校验重名
      if (isValid && !this.replaceFile.isReplace && this.fileInfoList.some(file => file.name === name)) {
        isValid = false
        this.$message.error('文件命名重复, 请重新添加')
      }
      if (!isValid) {
        this.clearReplaceFile()
        return
      }
      // 校验excel文件类型
      const fileType = file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length)
      if (/xls|xlsx/.test(fileType)) {
        file.id = file.uid || 'vc-upload-' + (+new Date())
        if (this.replaceFile.isReplace) {
          this.actionReplaceFile(file)
        } else {
          this.actionUploadFile(file)
        }
      } else {
        this.$message.error(name + '不是excel文件')
      }
    },
    // 是否自动生成表头
    handleCheckBox(e) {
      const checked = e.target.checked
      if (this.isSetTableHead === checked) return
      this.isSetTableHead = checked
      if (checked) {
        this.currentColumns = this.noTitleColumns
        this.currentFieldList = this.noTitleFieldList
      } else {
        this.currentColumns = this.columns
        this.currentFieldList = this.fieldList
      }
      this.$nextTick(() => {
        this.handleChangeFieldList()
      })
    },
    // 箭头设置首行数
    countLine(type) {
      if (type === 'plus') {
        if (++this.line > 1000) {
          this.line = 1000
        } else {
          this.requestLine = this.line
          this.handleChangeFieldList()
        }
      } else if (type === 'minus') {
        if (--this.line < 1) {
          this.line = 1
        } else {
          this.requestLine = this.line
          this.handleChangeFieldList()
        }
      }
    },
    // 回车设置首行
    handleEnterLine(e) {
      const value = e.target.value
      if (!isNaN(value) && value >= 1 && value <= 1000) {
        this.line = value
        this.requestLine = value
        this.handleChangeFieldList()
      } else {
        this.line = this.requestLine
      }
    },
    // 处理表头
    handleChangeFieldList() {
      const currentFieldList = this.isSetTableHead ? this.noTitleFieldList : this.fieldList
      this.currentColumns = this.isSetTableHead ? this.noTitleColumns : this.columns
      this.currentFieldList = currentFieldList.slice(this.requestLine - 1)
      this.spinning = false
    },
    // 上传文件
    async actionUploadFile(file) {
      const formData = new FormData()
      formData.append('file', file)
      this.spinning = true
      const result = await this.$server.dataAccess.actionUploadExcelFile(formData, this.uploadCallback)
        .finally(() => {
          this.spinning = false
          this.uploadProgress = '加载中'
        })
      if (result.code === 200) {
        if (result.rows && result.rows.length === 0) {
          this.spinning = false
          return this.$message.error('解析失败')
        }
        this.$message.success('解析成功')
        console.log(result.rows)

        let name = file.name
        name = name.slice(0, name.lastIndexOf('.')) // 处理掉文件后缀
        this.fileInfoList.push({
          id: file.id,
          name: name
        })
        this.fileList.push(file)
        this.operation.push({
          databaseId: '',
          databaseName: name,
          operation: 1
        })

        const currentIndex = this.fileInfoList.length - 1
        const database = new MapSheet(result.rows[0].mapSheet)

        // 新增文件未保存前不能查看库表结构
        this.$store.dispatch('dataAccess/setFirstFinished', false)
        this.$set(this.databaseList, currentIndex, database)
        this.$nextTick(() => {
          this.handleGetDataBase(currentIndex)
        })
      } else {
        this.$message.error(result.msg)
      }
    },
    // 替换文件
    async actionReplaceFile(file) {
      const formData = new FormData()
      let result = null
      // 替换未入库文件
      const flag = isNaN(this.replaceFile.info.id)
      if (flag) {
        formData.append('file', file)
        this.spinning = true
        result = await this.$server.dataAccess.actionUploadExcelFile(formData, this.uploadCallback)
          .catch(() => {
            this.clearReplaceFile()
          })
          .finally(() => {
            this.spinning = false
            this.uploadProgress = '加载中'
          })
      } else {
        formData.append('fileList[0]', file)
        formData.append('replaceDatabaseId', this.replaceFile.info.id)
        this.spinning = true
        result = await this.$server.dataAccess.actionReplaceExcelFile(formData, this.uploadCallback)
          .catch(() => {
            this.clearReplaceFile()
          })
          .finally(() => {
            this.spinning = false
            this.uploadProgress = '加载中'
          })
      }
      if (result.code === 200) {
        if (result.rows && result.rows.length === 0) {
          this.spinning = false
          return this.$message.error('解析失败')
        }
        this.$message.success('替换成功')
        this.$store.dispatch('dataAccess/setFirstFinished', false)

        let name = file.name
        name = name.slice(0, name.lastIndexOf('.'))
        const currentIndex = this.replaceFile.index
        this.fileInfoList[currentIndex] = {
          id: this.replaceFile.info.id,
          name: name
        }
        // 如果是已被替换过的文件, 则替换新文件
        let isOperation = false
        for (let i = 0; i < this.fileList.length; i++) {
          const item = this.fileList[i]
          if (item.name === file.name) {
            isOperation = true
            this.fileList.splice(i, 1, file)
            break
          }
        }
        // 未记录的替换文件, 插入新记录
        if (!isOperation) {
          this.fileList.push(file)
          this.operation.push({
            databaseId: this.replaceFile.info.id,
            databaseName: name,
            operation: 2
          })
        }

        const database = new MapSheet(result.rows[0].mapSheet)
        this.$set(this.databaseList, currentIndex, database)
        this.$nextTick(() => {
          this.handleGetDataBase(currentIndex)
        })
      } else {
        this.$message.error(result.msg)
      }
      this.clearReplaceFile()
    },
    // 渲染当前表格
    async renderCurrentTable(index) {
      // 写入表头信息
      let table = this.tableList[index]
      // 判断是否处理过表格信息(处理之后的是Array类型), 没有则调接口获取信息并处理
      if (!Array.isArray(table)) {
        if (!this.sheetList[index]) return
        const res = await this.$server.dataAccess.getExcelFileTableInfo(this.sheetList[index].id)
        if (res.code === 200) {
          if (!this.sheetList[index]) return
          const data = res.rows[0]
          // 将结果处理成mapSheet结构
          const sheetName = this.sheetList[index].name
          const head = data.nameSheet[sheetName]
          const tableInfo = data.mapSheet[sheetName]
          const newTable = new Array(head)
          table = newTable.concat(tableInfo)

          // 写入列表, 下次点击不调用接口
          this.currentDataBase.addTable(table, index)
        } else {
          this.spinning = false
          return this.$message.error(res.msg || '获取内容失败')
        }
      }
      const columns = new Array({
          title: '序号',
          dataIndex: 'no',
          scopedSlots: {
            customRender: 'no'
          }
        }).concat(table[0].map((col, index) => {
          return {
            title: col,
            dataIndex: index + ''
          }
        }))

      this.columns = columns
      this.noTitleColumns = columns.map((item, index) => {
        if (index === 0) {
          return item
        } else {
          return {
            title: 'F' + (index - 1),
            dataIndex: item.dataIndex
          }
        }
      })

      // 写入表信息
      const tableData = table.slice(1).map((item, index) => {
        const data = { key: index + '' }
        if (Array.isArray(item)) {
          item.map((value, key) => {
            data[key + ''] = value
          })
        } else {
          columns.slice(1).map((col, index) => {
            data[col.dataIndex] = item[col.title]
          })
        }
        return data
      })
      const head = {}
      columns.map(item => {
        head[item.dataIndex] = item.title
      })
      this.fieldList = tableData
      this.noTitleFieldList = new Array(head).concat(tableData)

      this.$nextTick(() => {
        this.handleChangeFieldList()
      })
    },
    handleSaveForm() {
      if (this.currentFieldList.length === 0) {
        return this.$message.error('请上传文件')
      }
      this.$refs.fileForm.validate((pass, obj) => {
        if (pass) {
          this.loading = true
          const formData = new FormData()
          let maxSize = 0
          this.fileList.map((file, index) => {
            formData.append('excelFileList[' + index + ']', file)
            maxSize += file.size
          })
          if (maxSize > 3 * 1024 * 1024) {
            this.loading = false
            return this.$message.error('单次保存文件总量需小于3M')
          }
          formData.append('databaseName', this.databaseName)
          formData.append('sourceDatasource.name', this.form.name)
          formData.append('sourceDatasource.type', 11)
          formData.append('sourceDatasource.parentId', this.parentId || '')
          formData.append('sourceDatasource.id', this.modelId || '')

          this.operation = this.operation.concat(this.deleteIdList)
          this.operation.map((item, index) => {
            for (const key in item) {
              formData.append('operationList[' + index + '].' + key, item[key])
            }
          })

          this.$server.dataAccess.saveExcelInfo(formData)
            .then(result => {
              if (result.code === 200) {
                this.$message.success('保存成功')
                this.$store.dispatch('dataAccess/getMenuList')
                this.$store.dispatch('dataAccess/setFirstFinished', true)
                this.$store.dispatch('dataAccess/setModelName', this.form.name)
                // this.$store.dispatch('dataAccess/setParentId', 0)
                this.$store.dispatch('dataAccess/setModelId', result.data.datasource.id)
                this.$store.commit('common/SET_PRIVILEGES', result.data.datasource.privileges || [])
                this.fileInfoList = result.data.sourceDatabases
                // 保存后清空列表
                this.fileList = []
                this.deleteIdList = []
                this.operation = []
                // 刷新文件id(替换成数据库生成的真实id)
                const databases = result.data.sourceDatabases
                this.fileInfoList.map(item => {
                  const target = databases.find(data => data.name === item.name)
                  if (target) {
                    item.id = target.id
                  }
                })
              } else {
                this.$message.error(result.data || result.msg || '保存错误')
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import './read-file-table';
</style>
