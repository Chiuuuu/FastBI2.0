<template>
  <div class="record-layout">
    <div class="list-controller">
      <a-form-model layout="inline" :model="formData" ref="formData">
        <a-form-model-item :label="dataName + '：'" prop="resourceName">
          <a-input v-model="formData.resourceName" class="form-item" placeholder="请输入"></a-input>
        </a-form-model-item>
        <a-form-model-item label="操作者：" prop="operator">
          <a-input v-model="formData.operator" class="form-item" placeholder="请输入"></a-input>
        </a-form-model-item>
        <a-form-model-item label="账号：" prop="userName">
          <a-input v-model="formData.userName" class="form-item" placeholder="请输入"></a-input>
        </a-form-model-item>
        <a-form-model-item label="操作时间：" prop="operationTime">
          <!-- <a-date-picker
            v-model="formData.operationTime"
            class="form-item"
            placeholder="请选择"
            valueFormat="YYYY-MM-DD"
          /> -->
          <a-range-picker
            :show-time="{ format: 'HH:mm' }"
            v-model="formData.operationTime"
            class="form-item"
            valueFormat="YYYY-MM-DD HH:mm"
            format="YYYY-MM-DD HH:mm"
            :placeholder="['开始时间', '结束时间']"
          ></a-range-picker>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="() => getList()" :disabled="loading">查询</a-button>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="default" @click="resetForm" :disabled="loading">重置</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!-- 列表 -->
    <div class="list-table scrollbar">
      <a-table
        row-key="id"
        :columns="column"
        :data-source="dataList"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ y: 'calc(100vh - 388px)', x: 770 }"
        @change="handleTableChange"
      >
        <!-- 名称 -->
        <span slot="nameTitle">{{ dataName }}</span>
      </a-table>
    </div>
  </div>
</template>

<script>
import { trimFormData } from '@/utils/form-utils';
import omit from 'lodash/omit';
const column = [
  {
    title: '项目名称',
    ellipsis: true,
    dataIndex: 'projectName',
    width: 150,
  },
  {
    slots: { title: 'nameTitle' },
    // title: '数据名称',
    ellipsis: true,
    dataIndex: 'resourceName',
    width: 180,
  },
  {
    title: '操作时间',
    ellipsis: true,
    dataIndex: 'operationTime',
    width: 160,
  },
  {
    title: '操作者',
    dataIndex: 'operator',
    ellipsis: true,
    width: 150,
  },
  {
    title: '账号',
    dataIndex: 'userName',
    ellipsis: true,
    width: 120,
  },
  {
    title: '操作类型',
    dataIndex: 'operateType',
    width: 160,
    ellipsis: true,
  },
  {
    title: '内容',
    dataIndex: 'content',
    ellipsis: true,
    width: 220,
  },
];
export default {
  props: {
    // 类型 1数据接入/2数据建模/3数据大屏
    type: {
      type: Number,
      require: true,
    },
    // 项目id
    projectId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 搜索
      formData: {
        resourceName: '',
        operator: '',
        userName: '',
        operationTime: [],
      },
      loading: false,
      column, // 表单配置
      dataList: [], // 列表数据
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      prjId: '',
    };
  },
  computed: {
    dataName() {
      switch (this.type) {
        case 1:
          return '数据源名称';
        case 2:
          return '数据建模名称';
        case 3:
          return '数据大屏名称';
        default:
          return '--';
      }
    },
  },
  created() {
    this.prjId = this.projectId;
    this.getList();
  },
  methods: {
    handleProjectIdChange(projectId) {
      this.prjId = projectId;
      this.pagination.current = 1;
      this.getList();
    },
    // 获取列表数据
    async getList(data = {}) {
      data.projectId !== undefined && (this.prjId = data.projectId);
      const params = Object.assign({}, omit(trimFormData(this.formData), 'operationTime'), {
        startTime: this.formData.operationTime.length > 0 ? this.formData.operationTime[0] + ':00' : '',
        endTime: this.formData.operationTime.length > 0 ? this.formData.operationTime[1] + ':59' : '',
        catalogType: this.type,
        projectId: this.prjId,
        pageNum: data.current ? data.current : this.pagination.current,
        pageSize: this.pagination.pageSize,
      });
      this.loading = true;
      let res = await this.$server.logAdmin.getOperaLogList(params);
      this.loading = false;
      if (res.code !== 200) {
        this.$message.error(res.msg || '请重新操作');
        return;
      }
      this.dataList = res.data.list || [];
      this.pagination.total = res.data.total;
    },
    // 重置
    resetForm() {
      this.$refs.formData.resetFields();
      this.pagination.current = 1;
      this.$nextTick(() => {
        this.getList();
      });
    },
    // 翻页
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.getList(pagination);
    },
  },
};
</script>

<style lang="less" scoped></style>
