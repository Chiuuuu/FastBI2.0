import $axios from '@/axios'
export default {
    /**
     * @description 连接数据库
     * @param {Object} [params={}] 请求参数
     * @returns
     */
    actionConnect(params = {}) {
        return $axios.post(`/datasource/connect`, params)
    },
    /**
     * @description 获取表的具体字段信息
     * @param {string} type 类型
     * @param {Object} [params={}] 请求参数
     * @returns {Object} 字段详细信息
     */
    getTableFieldDetail(params = {}) {
        return $axios.post(`/datasource/read/field`, params)
    },
    /**
     * @description 读取数据库
     * @param {string} type 类型
     * @param {Object} params 请求参数
     * @param {string} params.datasourceId 数据源id
     * @returns
     */
    getDatabaseList(params) {
        return $axios.get(`/datasource/database/list`, { params })
    },
    /**
     * @description 读取数据库的表
     * @param {string} type 类型
     * @param {Object} params 请求参数
     * @param {string} params.databaseName 数据库名称
     * @param {string} params.sourceId 数据源id
     * @returns
     */
    getTableList(params) {
        return $axios.post(`/datasource/read/teble`, params)
    },
    /**
     * @description 获取表数据
     * @param {Object} params 请求参数
     * @param {string} params.size 列数
     * @param {string} params.page 第几列
     * @param {string} params.id 表id
     * @returns
     */
    getTableInfo(params) {
        return $axios.post(`/datasource/table/read`, params)
    },
    /**
     * @description 保存数据信息
     * @param {string} url 请求地址
     * @param {Object} [params={}] 请求参数
     * @returns
     */
    saveTableInfo(url, params = {}) {
        return $axios.post(url, params)
    },
    /**
     * @description 保存数据表
     * @param {Object} [params={}] 请求参数
     * @returns
     */
    saveDataTable(params = {}) {
        return $axios.post('/datasource/table/save/table', params)
    },
    /**
     * @description 保存修改表字段
     * @param {Object} [params={}] 请求参数
     * @returns
     */
    saveTableField(params = {}) {
        return $axios.post('/datasource/field/save/field', params)
    },
    /**
     * @description 根据数据源id数据库id同步库表结构
     * @param {String} datasourceId 数据源id
     * @param {String} databaseId 数据库id
     * @returns
     */
    actionSyncTable(datasourceId, databaseId) {
        return $axios.get(`/datasource/table/sync/tables/${datasourceId}/${databaseId}`)
    },
    /**
     * @description 验证表结构状态
     * @param {Array} ids 数据源id
     * @returns
     */
    actionVerifyTable(ids) {
        return $axios.post('/datasource/table/verify/table', ids)
    },
    /**
     * @description 全部抽取
     * @param {String} url  请求地址
     * @param {Object} [params={}] 请求参数
     * @returns
     */
    actionExtract(url, params = {}) {
        return $axios.post(url, params)
    },
    /**
     * @description 自定义表抽取
     * @param {String} url  请求地址
     * @param {Array} [params={}] 请求参数
     * @returns
     */
    actionCustomExtract(params = []) {
        return $axios.post('/source/view/extract', params)
    },
    /**
    * @description 校验替换的excel文件
    * @param {Object} data.fileList 文件
    * @param {Object} data.replaceDatabaseId 文件id
    */
    actionReplaceExcelFile(data, callback = () => {}) {
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/excel/checkout',
            data,
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    let num = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                    callback(num)
                }
            },
            timeout: 600000
        })
    },
    /**
    * @description 校验替换的csv文件
    * @param {Object} data 参数
    * @param {Object} data.fileList 文件
    * @param {Object} data.replaceDatabaseId 文件id
    * @param {String} data.delimiter 分隔符
    */
    actionReplaceCsvFile(data, callback = () => {}) {
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/csv/checkout',
            data,
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    let num = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                    callback(num)
                }
            },
            timeout: 600000
        })
    },
    /**
     * @description 上传excel文件
     * @param {Object} file 文件
     */
    actionUploadExcelFile(data, callback = () => {}) {
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/excel/read',
            data,
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    let num = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                    callback(num)
                }
            },
            timeout: 600000
        })
    },
    /**
     * @description 上传excel文件
     * @param {Object} data 参数
     * @param {Object} data.file 文件
     * @param {String} data.delimiter 分隔符
     */
    actionUploadCsvFile(data, callback = () => {}) {
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/csv/read',
            data,
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    let num = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                    callback(num)
                }
            },
            timeout: 600000
        })
    },
    /**
     * @description 读取数据源的文件列表
     * @param {string} id 请求参数
     * @returns
     */
    getModelFileList(id) {
        return $axios.get(`/datasource/database/find/${id}`)
    },
    /**
     * @description 查询文件下的表格
     * @param {String} databaseId 文件id
     */
    getFileSheetList(databaseId) {
        return $axios.get('/datasource/table/list/bydatabaseid?databaseId=' + databaseId)
    },
    /**
     * @description 查询文件下的表格内容
     * @param {String} tableId 文件id
     */
    getExcelFileTableInfo(tableId) {
        return $axios.get('/datasource/excel/presto/read?tableId=' + tableId)
    },
    /**
     * @description 保存excel数据源
     * @param {Object} data body对象
     * @param {Array[string]} 'databasesIdList' 删除的文件id
     * @param {Array[file]} 'fileList' 文件列表
     * @param {String} 'sourceSaveInput.name' 名称
     * @param {String} 'sourceSaveInput.type' 数据源类型
     * @param {String} 'sourceSaveInput.parentId' parentId
     * @param {String} 'sourceSaveInput.id' id
     */
    saveExcelInfo(data) {
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/excel/batchsave',
            data,
            timeout: 300000
        })
    },
    /**
     * @description 查询文件下的表格内容
     * @param {Object} data 参数
     * @param {String} data.tableId 表id
     * @param {String} data.delimiter 分隔符
     */
    getCsvFileTableInfo(data) {
        // return $axios.get('/datasource/csv/presto/read?tableId=' + tableId)
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/csv/read',
            data
        })
    },
    /**
     * @description 保存excel数据源
     * @param {Object} data body对象
     * @param {Array[file]} 'fileList' 文件列表
     * @param {Array[string]} 'delDatabasesIdList' 删除的文件id
     * @param {Array[string]} 'delimiter' 分隔符
     * @param {String} 'sourceSaveInput.name' 名称
     * @param {String} 'sourceSaveInput.type' 数据源类型
     * @param {String} 'sourceSaveInput.parentId' parentId
     * @param {String} 'sourceSaveInput.id' id
     */
    saveCsvInfo(data) {
        return $axios({
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            url: '/datasource/csv/save',
            data,
            timeout: 300000
        })
    },
    /**
     * @description 获取操作记录
     * @param {Object} params
     * @param {String} params.sourceId 数据源id
     */
    getModelRecord(params) {
        return $axios.post('/datasource/record', params)
    },
    /**
     * @description 获取增量字段
     * @param {Array} params
     * @param {String} id 数据源id
     */
    getIncreaseFields(params) {
        return $axios.post('/datasource/field/find/increase', params)
    },
    /**
     * @description 获取定时任务列表
     * @param {String} databaseId 当前数据库id
     * @param {String} isBatch 是否批量
     */
    getRegularList(databaseId, isBatch = 0) {
        return $axios.get(`/datasource/schedule/list/${databaseId}/${isBatch}`)
    },
    /**
     * @description 获取定时任务详情
     * @param {String} id 任务id
     * @param {String} groupId 批量任务id
     */
    getRegularInfo(id, groupId) {
        return $axios.get(`/datasource/schedule/${id}/${groupId}`)
    },
    /**
     * @description 新增定时任务
     * @param {Object} params
     * @param {String} params.name 数据源名称
     * @param {String} params.target 数据源id
     * @param {String} params.extractType 抽取类型,0-全量抽取,1-增量抽取
     * @param {String} params.isRepeat 0-只执行一次，1-重复执行
     * @param {String} params.frequency 1-小时,2-天3-周,4-月
     * @param {String} params.interval 间隔时间
     * @param {String} params.gmtStart 开始时间
     * @param {String} params.gmtEnd 结束时间
     */
    addRegularInfo(params) {
        return $axios.post('/datasource/schedule', params)
    },
    /**
     * @description 新增自定义视图定时任务
     * @param {Object} params
     * @param {String} params.name 数据源名称
     * @param {String} params.target 数据源id
     * @param {String} params.extractType 抽取类型,0-全量抽取,1-增量抽取
     * @param {String} params.isRepeat 0-只执行一次，1-重复执行
     * @param {String} params.frequency 1-小时,2-天3-周,4-月
     * @param {String} params.interval 间隔时间
     * @param {String} params.gmtStart 开始时间
     * @param {String} params.gmtEnd 结束时间
     */
    addCustomRegularInfo(params) {
        return $axios.post('/datasource/schedule/add', params)
    },
    /**
     * @description 修改定时任务
     * @param {Object} params
     * @param {String} params.name 数据源名称
     * @param {String} params.target 数据源id
     * @param {String} params.extractType 抽取类型,0-全量抽取,1-增量抽取
     * @param {String} params.isRepeat 0-只执行一次，1-重复执行
     * @param {String} params.frequency 1-小时,2-天3-周,4-月
     * @param {String} params.interval 间隔时间
     * @param {String} params.gmtStart 开始时间
     * @param {String} params.gmtEnd 结束时间
     */
    putRegularInfo(params) {
        // return $axios.put('/datasource/schedule', params)
        return $axios.post('/datasource/schedule/update', params)
    },
    /**
     * @description 修改自定义视图定时任务
     * @param {Object} params
     * @param {String} params.name 数据源名称
     * @param {String} params.target 数据源id
     * @param {String} params.extractType 抽取类型,0-全量抽取,1-增量抽取
     * @param {String} params.isRepeat 0-只执行一次，1-重复执行
     * @param {String} params.frequency 1-小时,2-天3-周,4-月
     * @param {String} params.interval 间隔时间
     * @param {String} params.gmtStart 开始时间
     * @param {String} params.gmtEnd 结束时间
     */
    putCustomRegularInfo(params) {
        // return $axios.put('/datasource/schedule/view/update', params)
        return $axios.post('/datasource/schedule/view/update', params)
    },
    /**
     * @description 删除定时任务
     * @param {String} id
     */
    deleRegularInfo(id) {
        // return $axios.delete('/datasource/schedule/delete/' + id)
        return $axios.get('/datasource/schedule/delete/' + id)
    },
    /**
     * @description 删除批量定时任务
     * @param {String} groupId
     */
    deleBatchRegularInfo(groupId) {
        // return $axios.delete('/datasource/schedule/batch/' + groupId)
        return $axios.get('/datasource/schedule/delete/batch/' + groupId)
    },
    /**
     * @description 获取抽取记录
     * @param {String} id 该数据库下任一张表的id
     */
    getExtractLogList(id) {
        return $axios.get('/datasource/schedule/getProgressInfo/' + id)
    }
}
