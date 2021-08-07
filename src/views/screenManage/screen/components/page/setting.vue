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
            <CollapsePanel
              class="content-item"
              panel="background"
              header="背景"
            >
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
            <CollapsePanel class="content-item" panel="reset" :isTogger="false">
              <!-- 恢复默认配置 start -->
              <div class="setting-unit-content">
                <a-button
                  class="btn-ghost reset"
                  type="link"
                  icon="redo"
                  block
                  @click="handleClickReset"
                >
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
import { mapState } from 'vuex'
import boardSetting from '@/views/screenManage/screen/setting'
import { mutationTypes as historyMutation } from '@/store/modules/history'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'BoardPageSetting',
  computed: {
    ...mapState({
      boardPage: state => state.board.page
    })
  },
  methods: {
    /**
     * @description 复制一份当前类型新的配置
     */
    handleClickReset() {
      const style = cloneDeep(boardSetting['Page'])
      this.handleChange(null, style, true)
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
              [type]: val
            }
      })
    }
  }
}
</script>
