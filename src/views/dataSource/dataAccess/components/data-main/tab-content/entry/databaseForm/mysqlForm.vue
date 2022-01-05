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
            <span>端口：您开放的服务器的端口，通常默认是3306。</span>
            <br />
            <span>用户名：您用于登录数据库的用户名。</span>
            <br />
            <span>密码：您用于登录数据库的用户名的密码。</span>
            <br />
            <span>默认连接数据库：您可以选择默认的连接库作为访问的第一个展示库。</span>
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
            <span>MYSQL数据库暂时支持5.7等常用版本。</span>
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
      <a-input-password placeholder="请输入密码" v-model="form.password" autocomplete />
    </a-form-model-item>
  </div>
</template>

<script>
import mixin from './mixins';
export default {
  name: 'mysqlForm',
  mixins: [mixin],
};
</script>
