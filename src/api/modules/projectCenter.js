import $axios from '@/axios'

export default {
    /**
     * @description 查询当前项目用户列表
     * @param {Object} params
     * @param {Number} params.roleId 角色id
     * @param {String} params.name 姓名
     * @param {String} params.username 用户名
     * @returns
     */
    getList(params) {
        return $axios.post(`/business/user/projectUserList`, params)
    },
    /**
     * @description 查询项目角色用户列表
     * @returns
     */
    getRoleList() {
        return $axios.get('/business/editRoleUser/listRoleForProjectId')
    },
    /**
     * @description 根据用户名/姓名查询用户列表
     * @param {Object} params 请求参数
     * @param {String} params.keyword 输入的内容
     * @returns
     */
    getModalUserList(params) {
        return $axios.post('/business/user/matchUsers', params)
    },
    /**
     * @description 添加新用户
     * @param {Object} params 请求参数
     * @param {Array} params.roleId 角色
     * @param {Array} params.userIds 用户
     * @returns
     */
    addUser(params) {
        return $axios.post('/business/editRoleUser/projectUserAddRole', params)
    },
    /**
     * @description 删除用户
     * @param {Array | Number | String} id
     * @returns
     */
    deleUserById(id) {
        // return $axios.delete(`/business/editRoleUser/deleteUserRoles/${id}`)
        return $axios.get(`/business/editRoleUser/deleteUserRoles/${id}`)
    },
    /**
     * @description 更新，编辑用户
     * @param {Object} params
     * @returns
     */
    putUser(params) {
        // return $axios.put(`/business/editRoleUser/updateProjectUserRole`, params)
        return $axios.post(`/business/editRoleUser/updateProjectUserRole`, params)
    },
    /**
     * @description 获取用户属性列表
     * @param {Object} params 请求参数
     * @param {String} params.username 用户名
     * @param {String} params.name 姓名
     * @returns
     */
    getUserPropsList(params) {
        return $axios.post(`/business/userAttrValue/attrList`, params)
    },

    /** ------------------------角色管理------------------------------ */
    /**
     * @description 获取角色详情
     * @param {Object} id 角色id
     * @returns
     */
    getRoleInfo(id) {
        return $axios.get('/business/role/' + id)
    },
    /**
     * @description 获取角色权限
     * @param {String} id 角色id
     * @returns
     */
    // getRolePermission(id) {
    //     return $axios.get('/business/rolePrivilege/' + id)
    // },
    /**
     * @description 新增角色
     * @param {Object} params 参数
     * @returns
     */
    addRole(params) {
        return $axios.post('/business/role/addRole', params)
    },
    /**
     * @description 获取角色下的用户列表
     * @param {String} roleId 角色id
     * @returns
     */
    getRoleUserInfo(roleId) {
        return $axios.get('/business/editRoleUser/listForProjectRoleUsers/' + roleId)
    },
    /**
     * @description 获取文件夹权限
     * @returns
     */
    getFolderHeader() {
        return $axios.get('/user/RoleResourcePrivilege/getFolderHeader')
    },
    /**
     * @description 获取权限树
     * @param {Number | String} roleId 角色id
     * @param {Number} type 类型
     * @returns
     */
    getRoleTree(roleId, type) {
        return $axios.get(`/user/RoleResourcePrivilege/showRolePrivilege/${roleId}/${type}`)
    },
    /**
     * @description 更新角色信息
     * @param {Object} params
     * @param {String} params.name 名字
     * @param {String} params.description 描述
     * @returns
     */
    updateRole(params) {
        // return $axios.put(`/user/RoleResourcePrivilege/updateRolePrivilege`, params)
        return $axios.post(`/user/RoleResourcePrivilege/updateRolePrivilege`, params)
    },
    /**
     * @description 为角色添加用户
     * @param {Object} params
     * @param {Array} params.userIds
     * @param {Array} params.roleIds
     * @returns
     */
    addRoleUser(params) {
        return $axios.post('/business/editRoleUser/projectRoleAddUser', params)
    },
    /**
     * @description 为角色移除用户
     * @param {Array} id
     * @returns
     */
    deleRoleUser(id) {
        // return $axios.delete('/business/editRoleUser/' + id)
        return $axios.get('/business/editRoleUser/delete/' + id)
    },
    /**
     * @description 获取数据源表格列表(权限勾选)
     * @param {Object} params
     * @param {Array} params.roleId
     * @param {Array} params.refId
     * @returns
     */
    getRoleSourceTable(params) {
        return $axios.post('/user/RoleResourcePrivilege/dbPrivileges', params)
    },
    /**
     * @description 获取数据源类型列表(权限勾选)
     * @returns
     */
    getRoleSourceType(roleId) {
        return $axios.get('/user/RoleResourcePrivilege/sourceBlackList/' + roleId)
    },
    /**
     * @description 获取数据源类型列表(权限勾选)
     * @param {Object} params
     * @param {Array} params.roleId
     * @param {String} params.forbiddenType // 将没勾选的类别传入
     * @returns
     */
    updateRoleSourceType(params) {
        return $axios.post('/user/RoleResourcePrivilege/sourceBlackList', params)
    }
}
