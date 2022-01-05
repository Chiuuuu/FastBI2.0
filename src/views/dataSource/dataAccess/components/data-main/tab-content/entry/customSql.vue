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
      <a-form-model-item label="数据库类型">
        <a-select v-model="form.type" @change="handleChangeDatabaseType" :disabled="Boolean(modelId)">
          <a-select-option :value="101">Mysql</a-select-option>
          <a-select-option :value="201">Oracle</a-select-option>
          <a-select-option :value="501">Hive</a-select-option>
        </a-select>
      </a-form-model-item>
      <!-- 连接信息 -->
      <MysqlForm v-if="form.type === 101" :form="form" :rules="rules" @handleSetTableName="handleSetTableName" />
      <OracleForm v-if="form.type === 201" :form="form" :rules="rules" @handleSetTableName="handleSetTableName" />
      <HiveForm v-if="form.type === 501" :form="form" :rules="rules" @handleSetTableName="handleSetTableName" />
      <a-form-model-item label="自定义表名" prop="tableName">
        <a-input v-model="form.tableName" :disabled="Boolean(modelId)" placeholder="请填写自定义表名"></a-input>
      </a-form-model-item>
      <a-form-model-item label="自定义SQL语句" prop="querySql">
        <a-textarea v-model="form.querySql" :disabled="Boolean(modelId)" placeholder="请填写自定义SQL语句"></a-textarea>
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
    <a-button
      type="primary"
      style="float: right; margin-right: 20px"
      @click="handleTestConnect"
      :loading="connectBtn"
      v-if="hasPermission"
    >
      测试连接
    </a-button>
  </div>
</template>
<script>
import Mysql from './mysql';
import MysqlForm from './databaseForm/mysqlForm.vue';
import OracleForm from './databaseForm/oracleForm.vue';
import HiveForm from './databaseForm/hiveForm.vue';
import formValidateMixin from './databaseForm/formValidateMixins';
export default {
  name: 'model-customSql',
  extends: Mysql,
  components: {
    MysqlForm,
    OracleForm,
    HiveForm,
  },
  mixins: [formValidateMixin.mysql],
  data() {
    const { form, rules } = formValidateMixin.mysql.mixin.data();
    return {
      sourceType: 13,
      labelCol: {
        xs: { span: 4 },
        sm: { span: 3 },
        md: { span: 3 },
        lg: { span: 3 },
      },
      form: {
        ...form,
        type: 101,
        tableName: '',
        querySql: '',
      },
      rules: {
        ...rules,
        tableName: [
          { required: true, message: '请填写自定义表名' },
          { max: 30, min: 1, message: '请填写1-30字的自定义表名' },
          { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '表名仅支持英文开头及数字下划线' },
        ],
        querySql: { required: true, message: '请填写自定义SQL语句' },
      },
      wrapperCol: { span: 14 },
      connectPassword: '',
      connectBtn: false,
      connectStatus: false, // 是否连接
      saveBtn: false,
    };
  },
  methods: {
    // 数据库类型的枚举值转换
    enumType(type) {
      switch (type) {
        case 101:
          return 'mysql';
        case 201:
          return 'oracle';
        case 501:
          return 'hive';
      }
    },
    // 切换了数据库类型
    handleChangeDatabaseType(type) {
      const target = formValidateMixin[this.enumType(type)];
      if (target) {
        const { form, rules } = target.mixin.data();
        this.form = {
          ...form,
          type,
          tableName: '',
          querySql: '',
        };
        this.rules = {
          ...rules,
          type: { required: true, message: '请选择数据库类型' },
          tableName: [
            { required: true, message: '请填写自定义表名' },
            { max: 30, min: 1, message: '请填写1-30字的自定义表名' },
            { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '表名仅支持英文开头及数字下划线' },
          ],
          querySql: { required: true, message: '请填写自定义SQL语句' },
        };
      }
    },
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
        if (prop === 'password') {
          if (this.connectPassword !== '' && this.connectPassword !== this.form[prop]) {
            this.connectStatus = true;
          } else if (this.modelId !== 0) {
            setFirstFinished = true;
          }
        }
        this.$store.dispatch('dataAccess/setFirstFinished', setFirstFinished);
      }
    },
    /**
     * 设置表单名称
     */
    handleSetTableName() {
      this.$emit('on-set-table-name', this.form.name);
    },
    /**
     * 重置表单
     */
    handleResetForm() {
      this.connectPassword = '';
      this.$refs['dbForm'] && this.$refs.dbForm.resetFields();
      this.form = this.$options.data().form;
      this.connectStatus = false;
    },
    /**
     * 连接数据库
     */
    handleTestConnect() {
      this.$refs.dbForm.validate(async valid => {
        if (valid) {
          this.connectBtn = true;
          const result = await this.$server.dataAccess
            .actionTestConnect({
              id: this.modelId,
              parentId: this.parentId,
              name: this.modelName,
              type: this.sourceType,
              property: this.form,
            })
            .finally(() => {
              this.connectBtn = false;
            });

          if (result.code === 200) {
            this.connectPassword = this.form.password;
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
     * 保存数据表
     */
    handleSaveForm() {
      this.$refs.dbForm.validate(async valid => {
        if (valid) {
          // 保存前先校验密码是否正确
          // if (this.connectPassword !== this.form.password) {
          // }

          this.saveBtn = true;
          const params = {
            id: this.modelId,
            parentId: this.parentId,
            name: this.modelName,
            property: this.form,
            type: this.sourceType,
          };
          const result = await this.$server.dataAccess
            .saveTableInfo('/datasource/customize/save', params)
            .finally(() => {
              this.saveBtn = false;
            });

          if (result.code === 200) {
            this.$message.success('保存成功，可抽取库表');
            this.$store.dispatch('dataAccess/getMenuList', this.accessInstance.$refs.menu);
            this.$store.dispatch('dataAccess/setFirstFinished', true);
            this.$store.dispatch('dataAccess/setModelInfo', this.form);
            this.$store.dispatch('dataAccess/setModelName', this.form.name);
            this.$store.dispatch('dataAccess/setDatabaseName', this.form.databaseName);
            this.$store.dispatch('dataAccess/setModelId', result.data.id);
            this.$store.commit('common/SET_MENUSELECTID', result.data.id);
            this.$store.commit('common/SET_PRIVILEGES', result.data.privileges);
            // this.$store.dispatch('dataAccess/setParentId', 0)
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
