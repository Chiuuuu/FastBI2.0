<template>
    <div class="user-layout">
        <div class="role-list-controller">
            <a-form-model layout="inline" :model="userMangeForm" ref="userMangeForm">
                <a-form-model-item label="用户名" prop="username">
                    <a-input v-model="userMangeForm.username" class="form-item" placeholder="请输入用户名"></a-input>
                </a-form-model-item>
                <a-form-model-item label="姓名" prop="name">
                    <a-input v-model="userMangeForm.name" class="form-item" placeholder="请输入姓名"></a-input>
                </a-form-model-item>
                <a-form-model-item>
                    <a-button type="primary" @click="() => handleGetData()" :disabled="loading">查询</a-button>
                </a-form-model-item>
                <a-form-model-item>
                    <a-button type="default" @click="handleRestForm" :disabled="loading">重置</a-button>
                </a-form-model-item>
            </a-form-model>
        </div>
        <div class="role-list-table scrollbar">
            <a-table
                row-key="id"
                :columns="rolesColumn"
                :data-source="rolesData"
                :pagination="pagination"
                :scroll="{ x: `100vh`, y: `calc(100vh - 350px)`}"
                :loading="loading"
                @change="handleTableChange">
                <template v-for="index in 6">
                    <template :slot="'props' + index">
                        <span :key="index" :title="propsName[index]">{{ propsName[index] }}</span>
                    </template>
                </template>
            </a-table>
        </div>
    </div>
</template>
<script>
import omit from 'lodash/omit'
import { trimFormData } from '@/utils/form-utils'
export default {
    name: 'userRoleManage',
    data() {
        return {
            rolesData: [],
            rolesColumn: [],
            propsName: [],
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            userMangeForm: { // 搜索表单
                username: '',
                name: ''
            },
            loading: false
        }
    },
    mounted() {
        this.handleGetData()
    },
    methods: {
        handleTableChange(pagination) {
            this.handleGetData(pagination)
        },
        /** 获取数据 */
        async handleGetData(pagination) {
            this.loading = true
            const params = Object.assign({}, trimFormData(this.userMangeForm), {
                ...omit(this.pagination, 'total'),
                current: pagination ? pagination.current : this.$options.data().pagination.current
            })
            const result = await this.$server.projectCenter.getUserPropsList(params).finally(() => {
                this.loading = false
            })

            if (result.code === 200) {
                const ary = []
                result.headersKeyValue.forEach((item, index) => {
                    let column = {
                        dataIndex: item,
                        width: 200,
                        ellipsis: true
                    }
                    if (index > 1) {
                        this.propsName[index - 1] = result.headers[index]
                        column.scopedSlots = { title: 'props' + (index - 1) }
                    } else {
                        column.title = result.headers[index]
                    }
                    ary.push(column)
                })
                this.rolesColumn = [].concat(ary)
                this.rolesData = [].concat(result.rows)

                Object.assign(this.pagination, {
                    current: params.current,
                    total: result.total
                })
            } else {
                this.$message.error(result.msg || '请求错误')
            }
        },
        /** 重置表单 */
        handleRestForm() {
            this.$refs.userMangeForm.resetFields()
            this.$nextTick(() => {
                this.handleGetData()
            })
        }
    }
}
</script>
