<template>
  <div class="record-layout">
    <div class="list-controller">
      <a-form-model layout="inline" :model="formData" ref="formData">
        <a-form-model-item :label="dataName + '：'" prop="name">
          <a-input v-model="formData.name" class="form-item" placeholder="请输入"></a-input>
        </a-form-model-item>
        <a-form-model-item label="操作者：" prop="people">
          <a-input v-model="formData.people" class="form-item" placeholder="请输入"></a-input>
        </a-form-model-item>
        <a-form-model-item label="账号：" prop="user">
          <a-input v-model="formData.user" class="form-item" placeholder="请输入"></a-input>
        </a-form-model-item>
        <a-form-model-item label="操作时间：" prop="time">
          <a-date-picker v-model="formData.time" class="form-item" placeholder="请选择" valueFormat="YYYY-MM-DD" />
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
        :scroll="{ y: 'calc(100vh - 398px)', x: 770 }"
        @change="handleTableChange"
      >
        <!-- 名称 -->
        <span slot="nameTitle">{{ dataName }}</span>
      </a-table>
    </div>
  </div>
</template>

<script>
const column = [
  {
    title: '项目名称',
    ellipsis: true,
    dataIndex: 'projectName',
  },
  {
    slots: { title: 'nameTitle' },
    // title: '数据名称',
    ellipsis: true,
    dataIndex: 'name',
  },
  {
    title: '操作时间',
    ellipsis: true,
    dataIndex: 'time',
  },
  {
    title: '操作者',
    dataIndex: 'people',
    ellipsis: true,
  },
  {
    title: '账号',
    dataIndex: 'user',
    ellipsis: true,
  },
  {
    title: '操作类型',
    dataIndex: 'type',
    width: 200,
    ellipsis: true,
  },
  {
    title: '内容',
    dataIndex: 'con',
    ellipsis: true,
  },
];
export default {
  props: {
    // 类型 1数据接入/2数据建模/3数据大屏
    type: {
      type: String,
      require: true,
    },
  },
  data() {
    return {
      // 搜索
      formData: {
        name: '',
        people: '',
        user: '',
        time: '',
      },
      loading: false,
      column, // 表单配置
      dataList: [
        {
          id: '1',
          projectName: '项目1',
          name: '数据名称1',
          time: '2021-01-01 12:12:12',
          people: '李白白',
          user: '大黄黄',
          type: '操作类型',
          con: '内容222',
        },
        {
          id: '2',
          projectName: '项目1',
          name: '数据名称2',
          time: '2021-01-01 12:12:12',
          people: '李白白',
          user: '大黄黄',
          type: '操作类型',
          con: '内容222',
        },
      ], // 列表数据
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  computed: {
    dataName() {
      switch (this.type) {
        case '1':
          return '数据源名称';
        case '2':
          return '数据建模名称';
        case '3':
          return '数据大屏名称';
        default:
          return '--';
      }
    },
  },
  methods: {
    // 获取列表数据
    async getList() {
      console.log(this.formData);
    },
    // 重置
    resetForm() {
      this.$refs.formData.resetFields();
      this.$nextTick(() => {
        this.getList();
      });
    },
    // 翻页
    handleTableChange(pagination) {
      console.log(pagination, 'pagination');
      this.getList();
    },
  },
};
</script>

<style lang="less" scoped></style>
