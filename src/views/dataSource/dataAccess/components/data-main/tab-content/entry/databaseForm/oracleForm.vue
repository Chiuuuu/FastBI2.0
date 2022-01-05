<template>
  <div>
    <a-form-model-item label="数据源名称" prop="name">
      <a-input placeholder="请输入数据源名称" v-model="form.name" @change="handleSetTableName" />
      <a-popover placement="leftTop">
        <template slot="content">
          <div style="width: 500px">
            <span>数据源名称：由您自定义的源名称，便于标识该数据连接。</span>
            <br />
            <span>服务器：您部署的服务器所在的IP地址。</span>
            <br />
            <span>端口：您开放的服务器的端口，通常默认是1521。</span>
            <br />
            <span>用户名：您用于登录数据库的用户名。</span>
            <br />
            <span>密码：您用于登录数据库的用户名的密码。</span>
            <br />
            <span>连接方式：通常为您数据库的实例名称或者服务名称。</span>
            <br />
            <span>所属组：默认展示您账号下的库，可选择其他所属组账号进行查询展示。</span>
            <br />
            <br />
            <span>
              <span style="color: #f00">注意</span>
              ：
            </span>
            <br />
            <span>
              若您需要访问到您的数据库，您需要将产品的服务器IP与访问的数据库IP网络打通，以确保能连接上（可以咨询您的系统运维人员/数据库管理员）。
            </span>
            <br />
            <span>Oracle数据库暂时支持10和11等常用大版本。</span>
          </div>
        </template>
        <a-icon class="database_tips" type="info-circle" theme="filled" style="color: #617bff" />
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
    <a-form-model-item label="连接方式" prop="sid" :wrapper-col="{ span: 14 }">
      <a-select placeholder="请选择连接方式" default-value="servername" style="width: 115px">
        <a-select-option value="sid">SID</a-select-option>
        <a-select-option value="servername">ServerName</a-select-option>
      </a-select>
      <a-input placeholder="请输入id或name" v-model="form.sid" style="width: calc(100% - 115px)" />
    </a-form-model-item>
  </div>
</template>

<script>
import mixin from './mixins';
export default {
  name: 'oracleForm',
  mixins: [mixin],
};
</script>
