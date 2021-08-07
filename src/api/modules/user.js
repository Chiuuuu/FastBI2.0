import $axios from '@/axios'

export default {
    /**
     * @description 获取用户信息
     * @returns
     */
    getUserInfo() {
        return $axios.get('/getInfo')
    },
    /**
     * @description 获取用户的数据源类型权限
     * @returns
     */
    getSourceType() {
        return $axios.get('/user/RoleResourcePrivilege/currentUserAllBlackList')
    },
    /**
     * @description 切换项目
     * @param {Number} id 项目id
     * @returns
     */
    actionSwitchProject(id) {
        return $axios.post('/switchProject', { id })
    },
    /**
     * @description 获取用户项目列表
     * @returns
     */
    getProjectList() {
        return $axios.get(`/getUserProjects?refresh=true`)
    }
}
