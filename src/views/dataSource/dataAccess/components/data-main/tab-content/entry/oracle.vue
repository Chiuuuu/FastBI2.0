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
    <a-form-model-item label="数据源名称" prop="name">
      <a-input
        placeholder="请输入数据源名称"
        v-model="form.name"
        @change="handleSetTableName"
      />
      <a-popover placement="leftTop">
        <template slot="content">
          <div style="width: 500px">
            <span>数据源名称：由您自定义的源名称，便于标识该数据连接。</span><br>
            <span>服务器：您部署的服务器所在的IP地址。</span><br>
            <span>端口：您开放的服务器的端口，通常默认是1521。</span><br>
            <span>用户名：您用于登录数据库的用户名。</span><br>
            <span>密码：您用于登录数据库的用户名的密码。</span><br>
            <span>连接方式：通常为您数据库的实例名称或者服务名称。</span><br>
            <span>所属组：默认展示您账号下的库，可选择其他所属组账号进行查询展示。</span><br><br>
            <span><span style="color: #f00">注意</span>：</span><br>
            <span>若您需要访问到您的数据库，您需要将产品的服务器IP与访问的数据库IP网络打通，以确保能连接上（可以咨询您的系统运维人员/数据库管理员）。</span><br>
            <span>Oracle数据库暂时支持10和11等常用大版本。</span>
          </div>
        </template>
        <a-icon class="database_tips" type="info-circle" theme="filled" />
      </a-popover>
    </a-form-model-item>
    <a-form-model-item label="服务器" prop="ip">
      <a-input placeholder="请输入服务器ip地址" v-model="form.ip" />
    </a-form-model-item>
    <a-form-model-item label="端口" prop="port">
      <a-input placeholder="请输入端口" v-model.number="form.port" />
    </a-form-model-item>
    <a-form-model-item label="用户名" prop="user">
      <a-input placeholder="请输入用户名" v-model="form.user" />
    </a-form-model-item>
    <a-form-model-item label="密码" prop="password">
      <a-input-password placeholder="请输入密码" v-model="form.password" />
    </a-form-model-item>
    <a-form-model-item label="连接方式" prop="sid" :wrapper-col="{span:14}">
      <a-select placeholder="请选择连接方式" default-value="servername" style="width:115px">
        <a-select-option value="sid">
          SID
        </a-select-option>
        <a-select-option value="servername">
          ServerName
        </a-select-option>
      </a-select>
      <a-input placeholder="请输入id或name" v-model="form.sid" style="width:calc(100% - 115px)"/>
    </a-form-model-item>
    <a-form-model-item class="form-not-required" label="默认组" prop="databaseName" v-if="connectStatus">
      <a-select
        v-model="form.databaseName"
        :default-value="form.databaseName || databaseList[0] ? databaseList[0].name : ''"
        @change="handleDefaultDbSelect"
      >
        <a-select-option
          v-for="item in databaseList"
          :value="item.name"
          :key="item.id"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item :wrapper-col="{ span: 14 }">
      <a-button
        :loading="connectBtn"
        type="primary"
        style="width:88px;height:30px;margin-left:150px"
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
import Mysql from './mysql'
import { validateIP } from '../util'
export default {
  name: 'model-oracle',
  extends: Mysql,
  data() {
    return {
      labelCol: {
        xs: { span: 4 },
        sm: { span: 3 },
        md: { span: 3 },
        lg: { span: 3 }
      },
      wrapperCol: { span: 14 },
      formId: '',
      form: {
        // 连接信息表单
        name: '', // 数据源名
        ip: '', // 服务器ip
        port: '', // 端口号
        user: '', // 用户名
        password: '', // 密码
        databaseName: '', // 数据库名称
        sid: ''
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
        ],
        ip: [
          {
            required: true,
            message: '请输入服务器ip地址'
          },
          {
            validator: validateIP,
            trigger: 'blur'
          }
        ],
        port: [
          { required: true, message: '请输入端口号' },
          { type: 'integer', message: '请输入数字', min: 0 }
        ],
        user: [
          {
            required: true,
            message: '请输入用户名'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码'
          }
        ],
        sid: [
          {
            required: true,
            message: '请输入数据库名称'
          }
        ]
      },
      connectBtn: false,
      connectStatus: false, // 是否连接
      saveBtn: false,
      databaseList: []
    }
  },
  methods: {
    /**
     * 任一表单项被校验后触发
     * prop 字段名称
     * result 是否校验成功
     * err 错误信息
     */
    handleValidateFiled(prop, result, err) {
      console.log('validate')
      if (!result) {
        this.connectStatus = false
        this.$emit('on-set-tab', '1')
        let setFirstFinished = false
        if (prop === 'password' && this.modelId !== 0) {
          setFirstFinished = true
        }
        this.$store.dispatch('dataAccess/setFirstFinished', setFirstFinished)
      }
    },
    /**
     * 连接数据库
     */
    handleConnect() {
      this.$refs.dbForm.validate(async valid => {
        if (valid) {
          this.connectBtn = true
          const result = await this.$server.dataAccess.actionConnect({
            name: this.form.name,
            type: 2,
            property: {
              ip: this.form.ip,
              port: this.form.port,
              password: this.form.password,
              user: this.form.user,
              sid: this.form.sid || 'null'
            }
          }).finally(() => {
            this.connectBtn = false
          })

          if (result.code === 200) {
            this.databaseList = [].concat(result.rows)
            const item = this.databaseList.find(item => item.name === this.$store.state.dataAccess.modelInfo.databaseName)
            if (item) {
              // this.form.dbid = item.id
              this.form.databaseName = item.name
            } else {
              this.form.databaseName = this.databaseList[0] ? this.databaseList[0].name : ''
              // this.form.dbid = this.databaseList[0].id
            }
            this.connectStatus = true
            this.$message.success('连接成功')
          } else {
            this.$message.error(result.msg)
          }
        } else {
          this.connectStatus = false
          return false
        }
      })
    },
    /**
     * 默认选择数据库操作
     * value 选中的name
     */
    handleDefaultDbSelect(value) {
      const item = this.databaseList.filter(item => {
        return item.name === value && item
      })
      const obj = item.pop()
      // this.form.dbid = obj.id
      this.form.databaseName = obj.name

      const formInfo = Object.assign({}, this.form)
      delete formInfo.sid
      this.$store.dispatch('dataAccess/setModelInfo', formInfo)
    },
    /**
     * 保存数据表
     */
    handleSaveForm() {
      this.$refs.dbForm.validate(async valid => {
        if (valid) {
          this.saveBtn = true
          const params = {
            id: this.$store.state.dataAccess.modelId,
            name: this.$store.state.dataAccess.modelName,
            parentId: this.$store.state.dataAccess.parentId,
            property: {
              user: this.form.user,
              ip: this.form.ip,
              port: this.form.port,
              sid: this.form.sid,
              password: this.form.password,
              databaseName: this.form.databaseName
            },
            type: 2
          }
          const result = await this.$server.dataAccess.saveTableInfo('/datasource/save', params)
            .finally(() => {
              this.saveBtn = false
            })
          if (result.code === 200) {
            this.$message.success('保存成功，可抽取库表')
            const formInfo = Object.assign({}, this.form)
            delete formInfo.sid
            this.$store.dispatch('dataAccess/getMenuList')
            this.$store.dispatch('dataAccess/setFirstFinished', true)
            this.$store.dispatch('dataAccess/setModelInfo', formInfo)
            this.$store.dispatch('dataAccess/setModelName', this.form.name)
            this.$store.dispatch('dataAccess/setDatabaseName', this.form.databaseName)
            this.$store.dispatch('dataAccess/setModelId', result.data.id)
            this.$store.commit('common/SET_MENUSELECTID', result.data.id)
            this.$store.commit('common/SET_PRIVILEGES', result.data.privileges)
            // this.$store.dispatch('dataAccess/setParentId', 0)
            this.formId = result.data
          } else {
            this.$message.error(result.msg)
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
