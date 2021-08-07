<template>
  <a-row :gutter="16" class="screen-manage">
    <a-col class="gutter-row screen-manage" :span="24">
      <div class="main">
        <div class="head">
          <h1>操作记录</h1>
          <div>
            <a-select
              v-model="project"
              style="width: 120px"
              placeholder="请选择项目"
            >
              <a-select-option v-for="item in projectList" :key="item.value">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="right">
          <a-tabs class="tabs" @change="handleChangeModule">
            <a-tab-pane key="1" tab="数据接入">
              <recordMain ref="tab1" type="1"></recordMain>
            </a-tab-pane>
            <a-tab-pane key="2" tab="数据建模">
              <recordMain ref="tab2" type="2"></recordMain>
            </a-tab-pane>
            <a-tab-pane key="3" tab="数据大屏">
              <recordMain ref="tab3" type="3"></recordMain>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import recordMain from './components/record-main/record-main.vue'

export default {
  name: 'record',
  components: {
    recordMain
  },
  data() {
    return {
      project: '',
      projectList: [
        { value: '', name: '所有项目' },
        { value: '11', name: '项目1' },
        { value: '22', name: '项目2' },
        { value: '33', name: '项目4' },
        { value: '44', name: '项目5' }
      ]
    }
  },
  watch: {
    project(newVal, oldVal) {}
  },
  methods: {
    handleChangeModule(key) {
      const tab = this.$refs[`${key}Manage`]
      if (tab) {
        tab.getList()
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../main.less';
</style>
