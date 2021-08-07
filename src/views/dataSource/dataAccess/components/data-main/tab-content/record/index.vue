<template>
  <div class="tab-panel">
    <a-form-model ref="form" :model="form" layout="inline" class="search_bar" style="margin-left:15px">
      <a-form-model-item prop="keyword">
        <a-input
          placeholder="请输入操作者或账号"
          :value="form.keyword"
          @change="handleGetKeyword"
        >
          <a-icon slot="prefix" type="search" />
        </a-input>
      </a-form-model-item>
      <!-- <a-form-model-item>
        <a-button type="primary" style="margin-right:10px" @click="() => handleGetData()">查询</a-button>
        <a-button type="default" @click="handleResetForm">重置</a-button>
      </a-form-model-item> -->
    </a-form-model>
    <div class="tab-scroll scrollbar">
      <a-table
        rowKey="id"
        :columns="column"
        :data-source="datas"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ y: 'calc(100vh - 400px)' }"
        @change="handleChangeTable"
        >
        <template #time="text">
          <span>{{ text | formatTime }}</span>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import moment from 'moment'
import debounce from 'lodash/debounce'

const column = [
  {
    title: '操作时间',
    dataIndex: 'gmtOperate',
    scopedSlots: { customRender: 'time' }
  },
  {
    title: '操作者',
    dataIndex: 'name'
  },
  {
    title: '账号',
    dataIndex: 'username'
  },
  {
    title: '操作类型',
    dataIndex: 'type'
  }
]

export default {
  name: 'tabContentRecord',
  data() {
    return {
      column,
      datas: [],
      form: {
        keyword: ''
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      loading: false
    }
  },
  computed: {
    ...mapState({
      modelId: state => state.dataAccess.modelId
    })
  },
  filters: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  methods: {
    async handleGetData(pagination) {
      this.loading = true
      const params = {
        sourceId: this.modelId,
        keyword: this.form.keyword,
        pageSize: this.pagination.pageSize,
        current: pagination ? pagination.current : this.$options.data().pagination.current
      }
      const res = await this.$server.dataAccess.getModelRecord(params)
      if (res.code === 200) {
        this.datas = res.rows
        this.pagination.total = res.total
        this.pagination.current = params.current
      } else {
        this.$message.error(res.msg)
      }
      this.loading = false
    },
    handleGetKeyword: debounce(function(e) {
      this.form.keyword = e.target.value.trim()
      this.handleGetData()
    }, 400),
    handleResetForm() {
      this.$refs.form.resetFields()
      this.$nextTick(() => {
        this.handleGetData()
      })
    },
    handleChangeTable(pagination) {
      this.handleGetData(pagination)
    }
  }
}
</script>
