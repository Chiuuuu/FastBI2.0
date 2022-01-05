<template>
  <div>
    <a-form-model-item label="数据源名称" prop="name">
      <a-input placeholder="请输入数据源名称" v-model="form.name" @change="handleSetTableName" />
      <a-popover placement="leftTop">
        <template slot="content">
          <div style="width: 560px">
            <span>数据源名称：由您自定义的源名称，便于标识该数据连接。</span>
            <br />
            <span>连接模式：连接方法为hiveserver2。若您选择hiveserer2，则需要填写hiveserver2的端口。</span>
            <br />
            <span>HiveServer2 IP：Hive服务HiveServer2进程所在服务器的IP。</span>
            <br />
            <span>HiveServer2 端口：Hive服务HiveServer2进程的端口。</span>
            <br />
            <span>NameNode IP：HDFS服务NameNode进程所在服务器的IP。</span>
            <br />
            <span>NameNode端口：HDFS服务NameNode进程服务的端口。</span>
            <br />
            <span>用户名：您用于登录数据库的用户名。</span>
            <br />
            <span>密码：您用于登录数据库的用户名的密码。</span>
            <br />
            <span>请选择库组：默认展示默认组下的库，可选择其他所属组进行查询展示。</span>
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
            <span>hive数据库暂时支持2.1.0常用版本。</span>
          </div>
        </template>
        <a-icon class="database_tips" type="info-circle" theme="filled" style="color: #617bff" />
      </a-popover>
    </a-form-model-item>
    <a-form-model-item label="连接模式" prop="linkMode">
      <a-select v-model="form.linkMode">
        <a-select-option :value="1">hiveserver2</a-select-option>
        <!-- <a-select-option :value="2">
          zookeeper
        </a-select-option> -->
      </a-select>
    </a-form-model-item>
    <a-form-model-item label="HiveServer2 IP" prop="ip">
      <a-input placeholder="请输入HiveServer2 IP地址" v-model="form.ip" />
    </a-form-model-item>
    <a-form-model-item
      label="HiveServer2 端口"
      prop="port"
      v-if="form.linkMode === 1"
      :rules="[
        { required: true, message: '请输入HiveServer2 端口' },
        { type: 'integer', message: '请输入数字', min: 0 },
      ]"
    >
      <a-input placeholder="请输入HiveServer2 端口" v-model.number="form.port" />
    </a-form-model-item>
    <a-form-model-item label="NameNode IP" prop="hiveserver">
      <a-input placeholder="请输入NameNode IP地址" v-model="form.hiveserver" />
    </a-form-model-item>
    <a-form-model-item label="NameNode端口" prop="hdfsPort">
      <a-input placeholder="请输入NameNode端口" v-model.number="form.hdfsPort" />
    </a-form-model-item>
    <a-form-model-item
      label="命名空间"
      prop="namescape"
      v-if="form.linkMode === 2"
      :rules="[
        {
          required: true,
          message: '请输入命名空间',
        },
      ]"
    >
      <a-input placeholder="请输入命名空间" v-model.number="form.namescape" />
    </a-form-model-item>
    <!-- <a-form-model-item label="认证方式" prop="authMethod">
      <a-select placeholder="请选择认证方式" v-model="form.authMethod" @change="handleChangeMethod">
        <a-select-option :value="0">无</a-select-option>
        <a-select-option :value="1">kerberos</a-select-option>
        <a-select-option :value="2">用户名</a-select-option>
        <a-select-option :value="3">用户名密码</a-select-option>
      </a-select>
    </a-form-model-item> -->
    <template v-if="form.authMethod === 1">
      <a-form-model-item
        label="服务器principal"
        prop="server"
        :rules="[
          {
            required: true,
            message: '请输入服务器principal',
          },
          {
            type: 'string',
            max: 100,
            min: 1,
            message: '长度为1~100',
          },
        ]"
      >
        <a-input placeholder="请输入服务器principal" v-model="form.server" />
      </a-form-model-item>
      <a-form-model-item
        label="客户端principal"
        prop="client"
        :rules="[
          {
            required: true,
            message: '客户端principal',
          },
          {
            type: 'string',
            max: 100,
            min: 1,
            message: '长度为1~100',
          },
        ]"
      >
        <a-input placeholder="请输入客户端principal" v-model="form.client" />
      </a-form-model-item>
      <a-form-model-item label="keytab文件" required>
        <a-input-search placeholder="请上传keytab文件" disabled v-model="filename">
          <a-button slot="enterButton" @click.native="$refs.uploader.click()">上传</a-button>
        </a-input-search>
        <input ref="uploader" class="unvisible" type="file" @change="handleUploadFile" />
      </a-form-model-item>
    </template>
    <a-form-model-item
      v-if="form.authMethod === 2 || form.authMethod === 3"
      label="用户名"
      prop="user"
      :rules="[
        {
          required: true,
          message: '请输入用户名',
        },
      ]"
    >
      <a-input placeholder="请输入用户名" v-model="form.user" />
    </a-form-model-item>
    <a-form-model-item
      v-if="form.authMethod === 3"
      label="密码"
      prop="password"
      :rules="[
        {
          required: true,
          message: '请输入密码',
        },
      ]"
    >
      <a-input-password placeholder="请输入密码" v-model="form.password" />
    </a-form-model-item>
  </div>
</template>

<script>
import mixin from './mixins';
export default {
  name: 'hiveForm',
  mixins: [mixin],
  data() {
    return {
      keyTabFile: '',
      filename: '',
    };
  },
  methods: {
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
  },
};
</script>
