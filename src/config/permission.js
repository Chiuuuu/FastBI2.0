/**
* 全局管理权限code编码
* PAGE 表示页面路由菜单， 必须为数字类型
* OBJECT 表示模块的对象, 必须为字符串类型
* OPERATOR 表示模块的对象的操作，必须为数字类型
* http://192.168.101.240:8082/fastbi/project_manage_information/blob/master/v1.3.0/%E6%9D%83%E9%99%90%E7%B3%BB%E7%BB%9F%E8%A7%84%E8%8C%83
*/
const PERMISSION_CODE = {
    PAGE: {
        all: 0, // 所有页面
        datasource: 1, // 数据接入
        datamodel: 2, // 数据模型
        screen: 3, // 数据大屏
        user: 5, // 用户管理
        role: 5, // 角色管理
        dataPermission: 5, // 数据权限管理
        personnel: 4, // 人员管理
        project: 4, // 项目管理
    },
    OBJECT: {
        all: '0000', // 该模块下所有对象
        datasource: '0101', // 数据源 即数据接入
        database: '0102', // 数据库
        table: '0103', // 数据表
        field: '0104', // 数据字段
        scheduler: '0105', // 定时任务
        operateLog: '0106', // 操作日志
        datamodel: '0207', // 数据模型
        pivotschema: '0208', // 维度度量
        widetable: '0209', // 宽表
        screen: '0310', // 大屏
        sourceFolder: '0111', // 目录菜单
        modelFolder: '0211', // 目录菜单
        screenFolder: '0311', // 目录菜单
        user: '12', // 人员管理
        project: '13', // 项目管理
        member: '14', // 成员管理
        role: '15', // 角色管理
        dataprivilege: '16', // 数据权限管理
    },
    OPERATOR: {
        all: 0, // 所有以下操作
        list: 1, // 查看
        query: 2, // 详情
        add: 3, // 新增
        edit: 4, // 编辑
        remove: 5, // 删除
        schedule: 6, // 定时
        extract: 7, // 抽取
        export: 8, // 导出
        duplicate: 9, // 复制
        publish: 10, // 发布
        rename: 11, // 重命名
        move: 12, // 移动
        enable: 13, // 启用
        disable: 14 // 禁用
    }
}

export default PERMISSION_CODE
