<template>
  <a-row :gutter="16" class="screen-manage">
    <a-col class="gutter-row" :span="24">
      <div class="main">
        <div class="head">
          <h1>操作记录</h1>
          <div>
            <a-select
              v-model="projectId"
              style="width: 120px"
              show-search
              :filter-option="filterOption"
              placeholder="请选择项目"
            >
              <a-select-option value="">所有项目</a-select-option>
              <a-select-option v-for="item in projectList" :key="item.projectId" :value="item.projectId">
                {{ item.projectName }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="right">
          <a-tabs class="tabs" v-model="tab" @change="handleChangeModule">
            <a-tab-pane key="1" tab="数据接入">
              <recordMain ref="manage1" :type="1" :projectId="projectId"></recordMain>
            </a-tab-pane>
            <a-tab-pane key="2" tab="数据建模">
              <recordMain ref="manage2" :type="2" :projectId="projectId"></recordMain>
            </a-tab-pane>
            <a-tab-pane key="3" tab="数据大屏">
              <recordMain ref="manage3" :type="3" :projectId="projectId"></recordMain>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import recordMain from './components/record-main/record-main.vue';
export default {
  name: 'record',
  components: {
    recordMain,
  },
  data() {
    return {
      projectId: '',
      tab: '1',
      projectList: [],
    };
  },
  // computed: {
  //   ...mapState({
  //     projectList: state => state.user.projectList
  //   })
  // },
  watch: {
    projectId(val) {
      const tab = this.$refs[`manage${this.tab}`];
      if (tab) {
        tab.handleProjectIdChange(val);
      }
    },
  },
  created() {
    this.getOperaLogProjectList();
  },
  methods: {
    // tab改变
    handleChangeModule(key) {
      const tab = this.$refs[`manage${key}`];
      if (tab) {
        tab.getList({ current: 1, projectId: this.projectId });
      }
    },
    // 获取项目列表
    async getOperaLogProjectList() {
      let res = await this.$server.logAdmin.getOperaLogProjectList();
      if (res.code !== 200) {
        this.$message.error(res.msg || '项目列表获取不了');
        return;
      }
      this.projectList = res.data;
    },
    // 项目搜索
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },
  },
};
</script>
<style lang="less" scoped>
@import '../main.less';
</style>
