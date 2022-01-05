<template>
  <a-spin :spinning="saveLoading" :tip="saveTip" class="tab-excel tab-datasource">
    <div class="tab-datasource-model scrollbar">
      <a-form-model ref="fileForm" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
        <a-form-model-item label="数据源名称" prop="name">
          <a-input placeholder="请输入数据源名称" v-model="form.name" />
        </a-form-model-item>
        <a-form-model-item :label="modelType + '文件'" required>
          <a-spin :spinning="spinning" :tip="uploadProgress">
            <div class="excel-list scrollbar" ref="files" @dragenter.stop="fileDragEnter">
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
                    <a-tooltip placement="top" title="替换">
                      <a-icon type="retweet" style="margin-right: 10px" @click.stop="handleReplaceFile(item, index)" />
                    </a-tooltip>

                    <a-tooltip placement="top" title="删除">
                      <a-icon type="delete" @click.stop="handleRemove(item)"></a-icon>
                    </a-tooltip>
                  </div>
                </div>
              </template>
              <a-empty style="margin-top: 35px" v-else>
                <span slot="description">点击添加或将文件拖拽至此上传</span>
              </a-empty>
            </div>
          </a-spin>
          <a-upload
            accept=".csv"
            name="file"
            :headers="{ 'content-type': 'multipart/form-data' }"
            :showUploadList="false"
            :before-upload="beforeFileUpload"
            @change="handleFileChange"
          >
            <a-button ref="uploader" type="primary" :loading="spinning || saveLoading">添加文件</a-button>
          </a-upload>
        </a-form-model-item>
        <a-form-model-item class="form-not-required" label="文件分隔符" prop="delimiter">
          <a-radio-group style="width: 100%" v-model="form.delimiter" @change="changeDelimiter">
            <a-radio value="0">逗号</a-radio>
            <a-radio value="1">分号</a-radio>
            <a-radio value="2">空格</a-radio>
            <a-radio value="3">
              <span>其他</span>
              <div style="display: inline-block">
                <a-input
                  style="margin: 0 10px; width: 200px"
                  v-model="inputDelimiter"
                  :disabled="form.delimiter !== '3'"
                  @change="$refs.fileForm.validateField('delimiter')"
                />
              </div>
              <a-button v-show="form.delimiter === '3'" @click="handleRenderByDelimiter" type="primary">
                立即解析
              </a-button>
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
      <a-row class="preview-list">
        <a-col style="margin-left: 150px" :span="19">
          <FileTable
            :spinning="spinning"
            :currentFieldList="currentFieldList"
            :currentColumns="currentColumns"
            :show-switch="showFieldSwitch"
            @changeDataType="changeDataType"
          />
        </a-col>
      </a-row>
    </div>
    <a-button type="primary" class="btn_sub" @click="handleSaveForm" :loading="spinning" v-if="hasPermission">
      保存
    </a-button>
  </a-spin>
</template>

<script>
import Excel from './excel';

export default {
  name: 'model-csv',
  extends: Excel,
  data() {
    return {
      spinning: false,
      uploadProgress: '加载中',
      uploadCallback: num => {
        // 使用本地 progress 事件
        if (num < 100) {
          this.uploadProgress = num.toFixed(1) + '%';
        } else {
          this.uploadProgress = '文件解析中';
        }
      },
      saveLoading: false,
      saveTip: '保存中, 请勿进行其他操作',
      saveCallback: num => {
        const loop = num => {
          if (num < 95) {
            num += 3;
            this.saveTip = num.toFixed(1) + '%';
            let timer = setTimeout(() => {
              loop(num);
            }, 30000);
            this.$once('hook:beforeDestroy', () => {
              clearTimeout(timer);
              timer = null;
            });
          }
        };
        if (num < 100) {
          this.saveTip = (num * 0.5).toFixed(1) + '%';
        } else {
          this.saveTip = '50%';
          loop(50);
        }
      },
      isDragenter: false,
      form: {
        name: '',
        delimiter: '0',
      },
      inputDelimiter: '',
      rules: {
        name: [
          {
            required: true,
            message: '请输入数据源名称',
          },
          {
            type: 'string',
            max: 20,
            min: 1,
            message: '长度为1~20',
          },
        ],
        delimiter: [{ validator: this.delimiterValidate }],
      },
      labelCol: {
        span: 4,
      },
      fileList: [], // 文件列表
      fileInfoList: [], // 编辑时获取的文件信息
      deleteIdList: [], // 删除的文件列表
      databaseList: [], // 文件对应数据库列表
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
        info: null, // 被替换的文件详情
      },
      operation: [],
    };
  },
  computed: {
    queryDelimiter() {
      switch (this.form.delimiter) {
        case '0':
          return ',';
        case '1':
          return ';';
        case '2':
          return ' ';
        case '3':
          return this.inputDelimiter;
        default:
          return ',';
      }
    },
  },
  methods: {
    delimiterValidate(rule, value, callback) {
      if (value === '3' && !this.inputDelimiter) {
        callback(new Error('请填写分隔符'));
      } else {
        callback();
      }
    },
    formatDelimiter(delimiter) {
      if (delimiter === undefined || delimiter === null) return '0';
      switch (delimiter) {
        case ',':
          return '0';
        case ';':
          return '1';
        case ' ':
          return '2';
        default:
          return '3';
      }
    },
    // 重置表单
    handleResetForm() {
      this.form = { name: '', delimiter: '0' };
      this.fileList = [];
      this.fileInfoList = [];
      this.databaseList = [];
      this.saveLoading = false;
      this.saveTip = '保存中, 请勿进行其他操作';
      this.handleClearTable();
      this.clearReplaceFile();
    },
    // 渲染表单
    handleSetFormData() {
      if (this.modelType !== 'csv') return;
      this.handleResetForm();
      if (this.modelId) {
        // 有id就是编辑状态
        this.$set(this.form, 'name', this.modelName);
        let delimiter = this.modelInfo.delimiter;
        if (delimiter === ',') {
          this.$set(this.form, 'delimiter', '0');
        } else if (delimiter === ';') {
          this.$set(this.form, 'delimiter', '1');
        } else if (delimiter === ' ') {
          this.$set(this.form, 'delimiter', '2');
        } else {
          this.$set(this.form, 'delimiter', '3');
          this.inputDelimiter = delimiter;
        }
        this.getFileList();
      }
    },
    // 删除operation为4的操作
    deleteOperationDelimiter(name) {
      const index = this.operation.findIndex(item => item.name === name);
      if (index > -1 && this.operation[index].operation === 4) {
        this.operation.splice(index, 1);
      }
    },
    // 判断当前分隔符是不是'已入库文件'中记录的分隔符
    handleOperationDelimiter() {
      // 如果不是库里的分隔符, 要录入操作数组operation: 4
      const currentFile = this.fileInfoList[this.currentFileIndex];
      const index = this.operation.findIndex(item => item.name === currentFile.name);
      if (!isNaN(currentFile.id)) {
        if (currentFile.delimiter === this.queryDelimiter) {
          // 恢复了分隔符
          if (index > -1) {
            // 如果operation里面有对象则的删除
            this.operation.splice(index, 1);
          }
        } else {
          // 切换了分隔符,operation有则替换分隔符没有则插入
          if (index > -1) {
            this.operation[index].delimiter = this.queryDelimiter;
          } else {
            this.operation.push({
              id: currentFile.id,
              name: currentFile.name,
              delimiter: this.queryDelimiter,
              operation: 4,
              database: this.databaseList[this.currentFileIndex],
            });
          }
        }
      } else {
        // 未入库的文件, 修改分隔符
        if (index > -1) {
          this.operation[index].delimiter = this.queryDelimiter;
        }
      }
    },
    // 切换分隔符
    changeDelimiter(e) {
      const value = e.target.value;
      if (this.fileInfoList.length === 0) {
        return;
      }
      // 处理operation
      this.handleOperationDelimiter();
      if (value === '3' && !this.inputDelimiter) {
        return this.handleClearTable();
      } else {
        this.databaseList = [];
        this.$nextTick(() => {
          this.renderCurrentTable();
        });
      }
    },
    // 立即解析
    handleRenderByDelimiter() {
      if (this.inputDelimiter) {
        // 处理operation
        this.handleOperationDelimiter();
        this.databaseList = [];
        this.$nextTick(() => {
          this.renderCurrentTable();
        });
      }
    },
    // 切换表头数据类型
    async changeDataType() {
      this.spinning = true;
      // 找到该文件对象
      let name = this.fileInfoList[this.currentFileIndex].name;
      let file = {};
      for (let i = 0; i < this.fileList.length; i++) {
        const item = this.fileList[i];
        let filename = item.name;
        filename = filename.slice(0, filename.lastIndexOf('.'));
        if (filename === name) {
          file = item;
          break;
        }
      }
      const table = this.databaseList[this.currentFileIndex];
      // const rows = table.originRows
      const head = {
        [name]: this.currentColumns.slice(1).map(item => ({
          name: item.title,
          dataType: item.dataType,
        })),
      };
      const data = new FormData();
      data.append('sheetsHeaderJson', JSON.stringify(head));
      data.append('sheetName', name);
      data.append('delimiter', this.queryDelimiter);
      data.append('file', file);
      const res = await this.$server.dataAccess.actionChangeCsvType(data).finally(() => {
        this.spinning = false;
      });
      if (res.code === 200) {
        table.rows = res.data.rows || [];
        table.headerList = res.data.headerList || [];
        this.renderCurrentTable();
      } else {
        this.$message.error(res.msg || '请求错误');
      }
    },
    getFileList() {
      this.spinning = true;
      this.$server.dataAccess
        .getModelFileList(this.modelId)
        .then(res => {
          this.fileInfoList = res.rows;
          const name = this.modelInfo ? this.modelInfo.databaseName : '';

          // 默认第一个
          let index = 0;
          for (let i = 0; i < res.rows.length; i++) {
            const item = res.rows[i];
            if (name === item.name) {
              index = i;
            }
          }
          // 默认第一个
          this.handleGetDataBase(index);
        })
        .finally(() => {
          this.spinning = false;
        });
    },
    // 获取当前文件对应的数据库信息 isPresto: 是否读presto数据
    async handleGetDataBase(index) {
      if (index < 0) {
        this.currentColumns = [];
        this.currentFieldList = [];
        this.$store.dispatch('dataAccess/setFirstFinished', false);
      } else {
        this.currentFileIndex = index;
        const file = this.fileInfoList[index];
        const target = this.operation.find(item => item.name === file.name);
        // 赋值当前表单的分隔符
        this.form.delimiter = target ? this.formatDelimiter(target.delimiter) : this.formatDelimiter(file.delimiter);
        // 首先判断该文件是否进行过操作, 如果有, 则读文件, 没有则读presto数据
        const isPresto = !target;
        this.renderCurrentTable(isPresto);

        this.$store.dispatch('dataAccess/setDatabaseName', file.name);
      }
    },
    // 校验文件
    fileValidate(file) {
      let isValid = true;

      // 校验替换时的文件名
      let name = file.name;
      name = name.slice(0, name.lastIndexOf('.'));
      if (this.replaceFile.isReplace && this.replaceFile.info.name !== name) {
        this.$message.error('替换的文件名称不一致');
        isValid = false;
      }

      // 校验大小
      if (isValid && file.size > 200 * 1024 * 1024) {
        isValid = false;
        this.$message.error('文件大于200M, 无法上传');
      }

      // 校验重名
      if (isValid && !this.replaceFile.isReplace && this.fileInfoList.some(file => file.name === name)) {
        isValid = false;
        this.$message.error('文件命名重复, 请重新添加');
      }

      // 校验中文名
      // if (isValid && /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(name)) {
      //   isValid = false;
      //   this.$message.error('暂不支持中文表名文件');
      // }

      // 校验数字命名
      // if (isValid && /^[0-9]/.test(name)) {
      //   isValid = false;
      //   this.$message.error('不支持命名以数字开头的文件');
      // }

      if (!isValid) {
        this.clearReplaceFile();
        return;
      }

      // 校验csv文件类型
      const fileType = file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length);
      if (/csv/.test(fileType)) {
        file.id = file.uid || 'vc-upload-' + +new Date();
        if (this.replaceFile.isReplace) {
          this.actionReplaceFile(file);
        } else {
          this.actionUploadFile(file);
        }
      } else {
        this.$message.error(name + '不是csv文件');
      }
    },
    // 读取未上传的文件
    async readUnUploadFile(id) {
      const formData = new FormData();
      const index = this.fileList.findIndex(item => item.id === id);
      if (index < 0) return;
      const item = this.fileList[index];
      formData.append('csvFile', item);
      formData.append('delimiter', this.queryDelimiter);
      this.spinning = true;
      const result = await this.$server.dataAccess.actionUploadCsvFile(formData).finally(() => {
        this.spinning = false;
      });
      if (result.code === 200) {
        const table = {
          headerList: result.data.headerList || [],
          rows: result.data.rows || [],
          originRows: result.data.rows || [],
        };
        this.$set(this.databaseList, this.currentFileIndex, table);

        // 要将新的表头存到operation对应的对象中
        let name = item.name;
        name = name.slice(0, name.lastIndexOf('.')); // 处理掉文件后缀
        const target = this.operation.find(item => item.name === name);
        if (target) target.database = table;

        this.$nextTick(() => {
          this.renderCurrentTable();
        });
      } else {
        this.$message.error(result.msg);
      }
    },
    // 上传文件
    async actionUploadFile(file) {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('delimiter', this.queryDelimiter);
      this.spinning = true;
      const result = await this.$server.dataAccess.actionUploadCsvFile(formData, this.uploadCallback).finally(() => {
        this.spinning = false;
        this.uploadProgress = '加载中';
      });
      if (result.code === 200) {
        if (result.data.headerList && result.data.headerList.length === 0) {
          this.spinning = false;
          return this.$message.error('解析失败');
        }
        this.$message.success('解析成功');

        let name = file.name;
        name = name.slice(0, name.lastIndexOf('.')); // 处理掉文件后缀
        this.fileInfoList.push({
          id: file.id,
          name: name,
          delimiter: this.queryDelimiter,
        });
        this.fileList.push(file);

        const currentIndex = this.fileInfoList.length - 1;
        const database = {
          headerList: result.data.headerList || [],
          rows: result.data.rows || [],
          originRows: result.data.rows || [],
        };

        this.operation.push({
          id: '',
          name: name,
          operation: 1,
          delimiter: this.queryDelimiter,
          database: database,
        });
        // 新增文件未保存前不能查看库表结构
        this.$store.dispatch('dataAccess/setFirstFinished', false);
        this.$set(this.databaseList, currentIndex, database);
        this.$nextTick(() => {
          this.handleGetDataBase(currentIndex);
        });
      } else {
        this.$message.error(result.msg);
      }
    },
    // 替换文件
    async actionReplaceFile(file) {
      const formData = new FormData();
      let result = null;
      // 替换未入库文件
      const flag = isNaN(this.replaceFile.info.id);
      if (flag) {
        formData.append('csvFile', file);
        formData.append('delimiter', this.queryDelimiter);
        this.spinning = true;
        result = await this.$server.dataAccess
          .actionUploadCsvFile(formData, this.uploadCallback)
          .catch(() => {
            this.clearReplaceFile();
          })
          .finally(() => {
            this.spinning = false;
            this.uploadProgress = '加载中';
          });
      } else {
        // 已入库文件
        formData.append('fileList[0]', file);
        formData.append('replaceDatabaseId', this.replaceFile.info.id);
        formData.append('delimiter', this.queryDelimiter);
        this.spinning = true;
        result = await this.$server.dataAccess
          .actionReplaceCsvFile(formData, this.uploadCallback)
          .catch(() => {
            this.clearReplaceFile();
          })
          .finally(() => {
            this.spinning = false;
            this.uploadProgress = '加载中';
          });
      }
      if (result.code === 200) {
        if (result.rows && result.rows.length === 0) {
          this.spinning = false;
          return this.$message.error('解析失败');
        }
        this.$message.success('替换成功');
        this.$store.dispatch('dataAccess/setFirstFinished', false);

        let name = file.name;
        name = name.slice(0, name.lastIndexOf('.'));
        const currentIndex = this.replaceFile.index;
        this.fileInfoList[currentIndex] = {
          id: this.replaceFile.info.id,
          name: name,
          delimiter: this.queryDelimiter,
        };
        // 如果是已被替换过的文件, 则替换新文件
        let isOperation = false;
        for (let i = 0; i < this.fileList.length; i++) {
          const item = this.fileList[i];
          if (item.name === file.name) {
            isOperation = true;
            // 新替换的文件id要和被替换的保持一致
            file.id = this.replaceFile.info.id;
            this.fileList.splice(i, 1, file);
            break;
          }
        }

        const database = result.data;
        database.originRows = database.rows;
        this.$set(this.databaseList, currentIndex, database);
        // 未记录的替换文件, 插入新记录
        if (!isOperation) {
          // 删除切换过分隔符的operation: 4
          this.deleteOperationDelimiter(name);
          this.fileList.push(file);
          this.operation.push({
            id: this.replaceFile.info.id,
            name: name,
            operation: 2,
            delimiter: this.queryDelimiter,
            database: database,
          });
        } else {
          const target = this.operation.find(item => item.name === name);
          if (target) {
            target.database = database;
          }
        }

        this.$nextTick(() => {
          this.handleGetDataBase(currentIndex);
        });
      } else {
        this.$message.error(result.msg);
      }
      this.clearReplaceFile();
    },
    // 删除文件
    handleRemove(file) {
      if (this.saveLoading) return;
      this.$confirm({
        title: '确认提示',
        content: '您确定要删除该文件吗',
        onOk: () => {
          let index = this.fileInfoList.indexOf(file);
          this.databaseList.splice(index, 1);
          this.fileInfoList.splice(index, 1);

          // 如果删除当前被替换的文件, 清空替换文件对象
          if (this.replaceFile.index > -1 && file.id === this.replaceFile.info.id) {
            this.clearReplaceFile();
          }

          let isOperation = false;
          for (let i = 0; i < this.fileList.length; i++) {
            const item = this.fileList[i];
            let name = item.name;
            name = name.slice(0, name.lastIndexOf('.'));
            // 找到文件名, 判断是否为新增
            if (name === file.name) {
              isOperation = true;
              this.fileList.splice(i, 1);
              this.operation.splice(i, 1);
              this.deleteOperationDelimiter(file.name);
              // 库里有的文件, 先记录id, 保存时插入到operation最后
              if (file.id && !isNaN(file.id)) {
                // 删除切换过分隔符的operation: 4
                this.deleteIdList.push({
                  id: file.id,
                  name: file.name,
                  operation: 3,
                });
                this.$store.dispatch('dataAccess/setFirstFinished', false);
              }
              break;
            }
          }
          if (!isOperation && !isNaN(file.id) && this.deleteIdList.indexOf(file.id) < 0) {
            this.deleteOperationDelimiter(file.name);
            this.deleteIdList.push({
              id: file.id,
              name: file.name,
              operation: 3,
            });
            this.$store.dispatch('dataAccess/setFirstFinished', false);
          }
          this.$nextTick(() => {
            this.handleGetDataBase(this.fileInfoList.length - 1);
          });
        },
      });
    },
    // 渲染当前表格
    async renderCurrentTable(isPresto = false) {
      // 写入表头信息
      let index = this.currentFileIndex;
      let table = this.databaseList[index];
      // 判断是否处理过表格信息(处理之后的是Array类型), 没有则调接口获取信息并处理
      if (!table || !Array.isArray(table.headerList)) {
        const id = this.fileInfoList[index].id;
        let res;
        // 已入库的id是雪花算法的数字, 否则是element生成的字符串id
        if (isNaN(id)) {
          return this.readUnUploadFile(id);
        } else {
          if (isPresto) {
            // 单纯地读入库文件, 直接查presto
            this.spinning = true;
            res = await this.$server.dataAccess.getCsvPrestoTableInfo(id).finally(() => {
              this.spinning = false;
            });
          } else {
            // 否则需要根据id找到文件重新根据分隔符切割数据
            const formData = new FormData();
            formData.append('databaseId', id);
            formData.append('delimiter', this.queryDelimiter);
            this.spinning = true;
            res = await this.$server.dataAccess.getCsvFileTableInfo(formData).finally(() => {
              this.spinning = false;
            });
          }
        }
        if (res.code === 200) {
          table = res.data;
          if (!Array.isArray(res.data.headerList)) {
            table.headerList = [];
          } else {
            table.headerList = res.data.headerList.map(item => {
              if (!item || typeof item === 'string') {
                return {
                  name: item,
                  dataType: '',
                };
              } else {
                return {
                  name: item.name,
                  dataType: item.dataType || '',
                };
              }
            });
          }
          table.originRows = table.rows;
          this.$set(this.databaseList, index, table);
          // 要将新的表头存到operation对应的对象中
          const target = this.operation.find(item => item.id === id);
          if (target) target.database = table;
        } else {
          this.spinning = false;
          return this.$message.error(res.msg || '获取内容失败');
        }
      }
      const columns = new Array({
        title: '序号',
        dataIndex: 'no',
        scopedSlots: {
          customRender: 'no',
        },
      }).concat(
        table.headerList.map((col, index) => {
          return {
            title: col.name,
            dataType: col.dataType,
            dataIndex: index + '',
          };
        }),
      );

      this.columns = columns;
      this.noTitleColumns = columns.map((item, index) => {
        if (index === 0) {
          return item;
        } else {
          return {
            title: 'F' + (index - 1),
            dataType: item.dataType,
            dataIndex: item.dataIndex,
          };
        }
      });

      // 写入表信息
      const tableData = table.rows.map((item, index) => {
        const data = { key: index + '' };
        if (Array.isArray(item)) {
          item.map((value, key) => {
            data[key + ''] = value;
          });
        } else {
          columns.slice(1).map(col => {
            data[col.dataIndex] = item[col.title];
          });
        }
        return data;
      });
      const head = {};
      columns.map(item => {
        head[item.dataIndex] = item.title;
      });
      this.fieldList = tableData;
      this.noTitleFieldList = new Array(head).concat(tableData);

      this.$nextTick(() => {
        this.handleChangeFieldList();
      });
    },
    handleSaveForm() {
      if (this.fileInfoList.length === 0) {
        return this.$message.error('请上传文件');
      }
      this.$refs.fileForm.validate(pass => {
        if (pass) {
          this.saveLoading = true;
          this.$store.dispatch('dataAccess/setFirstFinished', false);
          const formData = new FormData();
          formData.append('databaseName', this.databaseName);
          formData.append('delimiter', this.queryDelimiter);
          formData.append('name', this.form.name);
          formData.append('type', 12);
          formData.append('parentId', this.parentId || '');
          formData.append('id', this.modelId || '');

          let maxSize = 0;
          const operationList = this.operation.concat(this.deleteIdList);
          for (let index = 0; index < operationList.length; index++) {
            const item = operationList[index];
            if (index < this.fileList.length) {
              const file = this.fileList[index];
              formData.append('csvDatabaseList[' + index + '].file', file);
              maxSize += file.size;
              if (maxSize > 200 * 1024 * 1024) {
                this.saveLoading = false;
                return this.$message.error('单次保存文件总量需小于200M');
              }
            }
            for (const key in item) {
              if (key !== 'database') {
                formData.append('csvDatabaseList[' + index + '].' + key, item[key]);
              } else {
                const database = item[key] || {};
                formData.append(
                  'csvDatabaseList[' + index + '].sheetsHeaderJson',
                  JSON.stringify({ [item.name]: database.headerList }),
                );
              }
            }
          }

          this.$server.dataAccess
            .saveCsvInfo(formData, this.saveCallback)
            .then(result => {
              if (result.code === 200) {
                this.$message.success('保存成功');
                this.$store.dispatch('dataAccess/getMenuList', this.accessInstance.$refs.menu);
                this.$store.dispatch('dataAccess/setFirstFinished', true);
                this.$store.dispatch('dataAccess/setModelName', this.form.name);
                this.$store.dispatch('dataAccess/setModelId', result.data.datasource.id);
                this.$store.commit('common/SET_MENUSELECTID', result.data.datasource.id);
                this.$store.commit('common/SET_PRIVILEGES', result.data.datasource.privileges || []);
                this.fileInfoList = result.data.sourceDatabases;
                // this.$store.dispatch('dataAccess/setParentId', 0)
                // 保存后清空列表
                this.fileList = [];
                this.deleteIdList = [];
                this.operation = [];
                // 刷新文件id(替换成数据库生成的真实id)
                const databases = result.data.sourceDatabases;
                this.fileInfoList.map(item => {
                  const target = databases.find(data => data.name === item.name);
                  if (target) {
                    item.id = target.id;
                  }
                });
              } else {
                this.$message.error(result.data || result.msg || '保存错误');
              }
              this.saveLoading = false;
            })
            .finally(() => {
              this.saveLoading = false;
              this.saveTip = '保存中, 请勿进行其他操作';
            });
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import './read-file-table';
</style>
