<template>
  <div class="tab-datasource">
    <a-form-model
      ref="dbForm"
      class="tab-datasource-model scrollbar"
      labelAlign="left"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      @validate="handleValidateFiled"
    >
      <!-- 连接信息 -->
      <HiveForm :form="form" :rules="rules" @handleSetTableName="handleSetTableName" />
      <a-form-model-item class="form-not-required" label="请选择库组" prop="databaseName" v-if="connectStatus">
        <a-select
          v-model="form.databaseName"
          :default-value="form.databaseName || databaseList[0] ? databaseList[0].name : ''"
          @change="handleDefaultDbSelect"
        >
          <a-select-option v-for="item in databaseList" :value="item.name" :key="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <!-- <a-form-model-item class="form-not-required" label="初始化SQL" prop="sql">
      <a-textarea class="hive-textarea"></a-textarea>
    </a-form-model-item> -->
      <a-form-model-item :wrapper-col="{ span: 14 }">
        <a-button
          :loading="connectBtn"
          type="primary"
          style="width: 88px; height: 30px; margin-left: 150px"
          @click="handleConnect"
          v-if="hasPermission"
        >
          连接
        </a-button>
      </a-form-model-item>
    </a-form-model>
    <a-button
      type="primary"
      class="btn_sub"
      @click="handleSaveForm"
      :disabled="!connectStatus"
      :loading="saveBtn"
      v-if="hasPermission"
    >
      保存
    </a-button>
  </div>
</template>
<script>
import Mysql from './mysql';
import { validateIP } from '../util';
import HiveForm from './databaseForm/hiveForm.vue';
import formValidateMixin from './databaseForm/formValidateMixins';
export default {
  name: 'model-hive',
  extends: Mysql,
  components: {
    HiveForm,
  },
  mixins: [formValidateMixin.hive.mixin],
  data() {
    return {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 3 },
        md: { span: 3 },
        lg: { span: 3 },
      },
      wrapperCol: { span: 14 },
      formId: '',
      keyTabFile: '',
      form: {
        // 连接信息表单
        name: '', // 数据源名
        ip: '', // 服务器ip
        port: '', // 端口号
        hiveserver: '', // 服务器ip
        hdfsPort: '', // hdfs端口号
        namescape: '', // 命名空间
        user: '', // 用户名
        password: '', // 密码
        databaseName: '', // 数据库名称
        linkMode: 1, // 连接模式
        authMethod: 3, // 认证方式
      },
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
        ip: [
          {
            required: true,
            message: '请输入HiveServer2 IP地址',
          },
          {
            validator: validateIP,
            trigger: 'blur',
          },
        ],
        hiveserver: [
          {
            required: true,
            message: '请输入NameNode IP地址',
          },
          {
            validator: validateIP,
            trigger: 'blur',
          },
        ],
        hdfsPort: [
          { required: true, message: '请输入NameNode端口' },
          { type: 'integer', message: '请输入数字', min: 0 },
        ],
        linkMode: [{ required: true, message: '请选择连接模式' }],
        authMethod: [{ required: true, message: '请选择认证方式' }],
      },
      connectBtn: false,
      connectStatus: false, // 是否连接
      saveBtn: false,
      filename: '',
      databaseList: [],
    };
  },
  methods: {
    /**
     * 任一表单项被校验后触发
     * prop 字段名称
     * result 是否校验成功
     * err 错误信息
     */
    handleValidateFiled(prop, result) {
      if (!result) {
        this.connectStatus = false;
        this.$emit('on-set-tab', '1');
        let setFirstFinished = false;
        if (prop === 'password' && this.modelId !== 0) {
          setFirstFinished = true;
        }
        this.$store.dispatch('dataAccess/setFirstFinished', setFirstFinished);
      }
    },
    handleChangeMethod() {
      this.$refs.dbForm.clearValidate(['server', 'client', 'user', 'password']);
    },
    handleUploadFile(e) {
      const file = e.target.files[0];
      console.log(file);
      let name = file.name;
      // 校验csv文件类型
      const fileType = name.slice(name.lastIndexOf('.') + 1, name.length);
      if (/keytab/.test(fileType)) {
        this.filename = name.slice(0, name.lastIndexOf('.'));
        this.keyTabFile = file;
      } else {
        this.$message.error(name + '不是keytab文件');
      }

      e.target.value = '';
    },
    /**
     * 连接数据库
     */
    handleConnect() {
      this.$refs.dbForm.validate(async valid => {
        if (valid) {
          this.connectBtn = true;
          const result = await this.$server.dataAccess
            .actionConnect({
              name: this.form.name,
              type: 5,
              property: {
                ip: this.form.ip,
                port: this.form.port,
                password: this.form.password,
                authMethod: this.form.authMethod,
                hiveserver: this.form.hiveserver,
                hdfsPort: this.form.hdfsPort,
                user: this.form.user,
              },
            })
            .finally(() => {
              this.connectBtn = false;
            });

          if (result.code === 200) {
            this.databaseList = [].concat(result.rows);
            const item = this.databaseList.find(
              item => item.name === this.$store.state.dataAccess.modelInfo.databaseName,
            );
            if (item) {
              this.form.databaseName = item.name;
            } else {
              this.form.databaseName = this.databaseList[0] ? this.databaseList[0].name : '';
            }
            this.connectStatus = true;
            this.$message.success('连接成功');
          } else {
            this.$message.error(result.msg);
          }
        } else {
          this.connectStatus = false;
          return false;
        }
      });
    },
    /**
     * 默认选择数据库操作
     * value 选中的name
     */
    handleDefaultDbSelect(value) {
      const item = this.databaseList.filter(item => {
        return item.name === value && item;
      });
      const obj = item.pop();
      // this.form.dbid = obj.id
      this.form.databaseName = obj ? obj.name : '';

      const formInfo = Object.assign({}, this.form);
      this.$store.dispatch('dataAccess/setModelInfo', formInfo);
    },
    /**
     * 保存数据表
     */
    handleSaveForm() {
      this.$refs.dbForm.validate(async valid => {
        if (valid) {
          this.saveBtn = true;
          const params = {
            id: this.$store.state.dataAccess.modelId,
            name: this.$store.state.dataAccess.modelName,
            parentId: this.$store.state.dataAccess.parentId,
            property: {
              user: this.form.user,
              ip: this.form.ip,
              hiveserver: this.form.hiveserver,
              hdfsPort: this.form.hdfsPort,
              port: this.form.port,
              password: this.form.password,
              databaseName: this.form.databaseName,
            },
            type: 5,
          };
          const result = await this.$server.dataAccess.saveTableInfo('/datasource/save', params).finally(() => {
            this.saveBtn = false;
          });
          if (result.code === 200) {
            this.$message.success('保存成功，可抽取库表');
            const formInfo = Object.assign({}, this.form);
            this.$store.dispatch('dataAccess/getMenuList', this.accessInstance.$refs.menu);
            this.$store.dispatch('dataAccess/setFirstFinished', true);
            this.$store.dispatch('dataAccess/setModelInfo', formInfo);
            this.$store.dispatch('dataAccess/setModelName', this.form.name);
            this.$store.dispatch('dataAccess/setDatabaseName', this.form.databaseName);
            this.$store.dispatch('dataAccess/setModelId', result.data.id);
            this.$store.commit('common/SET_MENUSELECTID', result.data.id);
            this.$store.commit('common/SET_PRIVILEGES', result.data.privileges);
            // this.$store.dispatch('dataAccess/setParentId', 0)
            this.formId = result.data;
          } else {
            this.$message.error(result.msg);
          }
        } else {
          return false;
        }
      });
    },
  },
};
</script>
<style scoped>
.unvisible {
  display: block;
  width: 0;
  height: 0;
  visibility: hidden;
}
.hive-textarea {
  height: 120px;
  resize: unset;
}
</style>
