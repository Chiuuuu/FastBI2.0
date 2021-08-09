<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">页面设置</h2>
        <div class="tab-wrapper">
          <Collapse>
            <CollapsePanel class="content-item" panel="size" :isTogger="false">
              <!-- 尺寸 start -->
              <UnitSize
                class="setting-unit-content"
                :size="boardPage.size"
                @change="size => handleChange('size', size)"
              ></UnitSize>
              <!-- 尺寸 end -->
            </CollapsePanel>
            <CollapsePanel class="content-item" panel="background" header="背景">
              <!-- 背景 start -->
              <div class="setting-unit-content">
                <UnitBackgroundColor
                  label="颜色"
                  :color="boardPage.background.color"
                  @change="color => handleChange('background', { color })"
                ></UnitBackgroundColor>
              </div>
              <!-- 背景 end -->
            </CollapsePanel>
            <CollapsePanel class="content-item" panel="background" header="定时刷新">
              <!-- 定时刷新 start -->
              <div class="setting-unit-content">
                <!-- 定时刷新是否启用 start -->
                <UnitCheckbox
                  class="show-btn"
                  label="启用"
                  :value="boardPage.refresh.isRefresh"
                  @change="isRefresh => handleChange('refresh', { isRefresh })"
                ></UnitCheckbox>
                <!-- 标签是否显示 end -->
                <a-row class="unit-show-block mb-8">
                  <a-col :span="11">
                    <a-input-number v-model="boardPage.refresh.frequency" :min="1" />
                  </a-col>
                  <a-col :span="11" :offset="2">
                    <a-select v-model="boardPage.refresh.unit" placeholder="请选择" class="select-input">
                      <a-select-option v-for="(item, index) in refreshList" :key="index" :value="item.value">
                        {{ item.name }}
                      </a-select-option>
                    </a-select>
                  </a-col>
                </a-row>
              </div>
              <!-- 定时刷新 end -->
            </CollapsePanel>
            <CollapsePanel class="content-item" panel="reset" :isTogger="false">
              <!-- 恢复默认配置 start -->
              <div class="setting-unit-content">
                <a-button class="btn-ghost reset" type="link" icon="redo" block @click="handleClickReset">
                  恢复默认配置
                </a-button>
              </div>
              <!-- 恢复默认配置 end -->
            </CollapsePanel>
          </Collapse>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import boardSetting from '@/views/screenManage/screen/setting';
import { mutationTypes as historyMutation } from '@/store/modules/history';
import cloneDeep from 'lodash/cloneDeep';
export default {
  name: 'BoardPageSetting',
  computed: {
    ...mapState({
      boardPage: state => state.board.page,
    }),
  },
  data() {
    return {
      refreshList: [
        { name: '分', value: 'min' },
        { name: '小时', value: 'hour' },
      ],
    };
  },
  methods: {
    /**
     * @description 复制一份当前类型新的配置
     */
    handleClickReset() {
      const style = cloneDeep(boardSetting['Page']);
      this.handleChange(null, style, true);
    },
    /**
     * @description 改变样式并记录历史
     * @param {string} type 字段
     * @param {object} val 字段值
     * @param {boolean} isReset 是否重置
     */
    handleChange(type, val, isReset = false) {
      this.$store.commit(historyMutation.COMMAND, {
        commandType: 'Style',
        target: this.boardPage,
        store: this.$store,
        isPage: true,
        style: isReset
          ? val
          : {
              [type]: val,
            },
      });
    },
  },
};
</script>
<style lang="less" scoped>
.select-input {
  width: 100%;
}
</style>
