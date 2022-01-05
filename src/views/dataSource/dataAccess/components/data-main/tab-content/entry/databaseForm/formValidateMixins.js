import { validateIP } from '../../util';
export default {
  mysql: {
    type: 1,
    mixin: {
      data() {
        return {
          sourceType: 1, // 资源类型枚举值
          form: {
            // 连接信息表单
            name: '', // 数据库名
            ip: '', // 服务器ip
            port: '', // 端口号
            user: '', // 用户名
            password: '', // 密码
            // dbid: '', // 默认数据库id
            databaseName: '', // 默认数据库名称
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
                message: '请输入服务器ip地址',
              },
              {
                validator: validateIP,
                trigger: 'blur',
              },
            ],
            port: [
              { required: true, message: '请输入端口号' },
              { type: 'integer', message: '请输入数字', min: 0 },
            ],
            user: [
              {
                required: true,
                message: '请输入用户名',
              },
            ],
            password: [
              {
                required: true,
                message: '请输入密码',
              },
              {
                validator: this.validateSavePassword,
              },
            ],
            // dbid: [
            //   {
            //     required: true
            //   }
            // ]
          },
        };
      },
    },
  },
  oracle: {
    type: 2,
    mixin: {
      data() {
        return {
          sourceType: 2, // 资源类型枚举值
          form: {
            // 连接信息表单
            name: '', // 数据源名
            ip: '', // 服务器ip
            port: '', // 端口号
            user: '', // 用户名
            password: '', // 密码
            databaseName: '', // 数据库名称
            sid: '',
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
                message: '请输入服务器ip地址',
              },
              {
                validator: validateIP,
                trigger: 'blur',
              },
            ],
            port: [
              { required: true, message: '请输入端口号' },
              { type: 'integer', message: '请输入数字', min: 0 },
            ],
            user: [
              {
                required: true,
                message: '请输入用户名',
              },
            ],
            password: [
              {
                required: true,
                message: '请输入密码',
              },
            ],
            sid: [
              {
                required: true,
                message: '请输入数据库名称',
              },
            ],
          },
        };
      },
    },
  },
  hive: {
    type: 5,
    mixin: {
      data() {
        return {
          sourceType: 5, // 资源类型枚举值
          form: {
            // 连接信息表单
            name: '', // 数据源名
            ip: '', // 服务器ip
            port: '', // 端口号
            hiveserver: '', // NameNode IP
            hdfsPort: '', // NameNode端口号
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
        };
      },
    },
  },
};
