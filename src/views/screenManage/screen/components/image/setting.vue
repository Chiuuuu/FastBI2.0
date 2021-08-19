<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">图片</h2>
        <!-- Tab切换栏 start -->
        <div class="tab-wrapper">
          <Tabs v-model="tabAcitve">
            <TabPanel tab="style" label="样式">
              <Collapse>
                <CollapsePanel class="content-item" panel="position" :isTogger="false">
                  <!-- 位置 start -->
                  <UnitPosition
                    class="setting-unit-content"
                    :position="currentCom.setting.style.position"
                    @change="position => handleChange('position', position)"
                  ></UnitPosition>
                  <!-- 位置 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="size" :isTogger="false">
                  <!-- 尺寸 start -->
                  <UnitSize
                    class="setting-unit-content"
                    :size="currentCom.setting.style.size"
                    @change="size => handleChange('size', size)"
                  ></UnitSize>
                  <!-- 尺寸 end -->
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="imageFile" header="图片文件">
                  <div class="setting-unit-content">
                    <!-- 图片 start -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24">
                        <div class="photo-wrap" @click.stop="addPhote">
                          <p v-if="fileName" :title="fileName">{{ fileName }}</p>
                          <a-icon type="upload" v-else />
                          <input
                            id="upload_photo"
                            type="file"
                            name
                            accept="image/png, image/jpeg, image/gif"
                            style="display: none"
                            @change="selectPhoto($event)"
                          />
                        </div>
                      </a-col>
                    </a-row>
                    <!-- 图片 end -->
                  </div>
                </CollapsePanel>
                <CollapsePanel class="content-item" panel="bgAndBorder" header="背景设置">
                  <div class="setting-unit-content">
                    <!-- 背景图片 start -->
                    <UnitBackgroundImage
                      class="mb-8"
                      :background="currentCom.setting.style.background"
                      @change="value => handleChange('background', value)"
                    ></UnitBackgroundImage>
                    <!-- 背景图片 end -->
                    <!-- 背景颜色 start -->
                    <UnitBackgroundColor
                      class="mb-8"
                      :color="currentCom.setting.style.background.color"
                      @change="color => handleChange('background', { color })"
                    ></UnitBackgroundColor>
                    <!-- 背景颜色 end -->
                    <!-- 边框设置 start -->
                    <UnitBorder
                      :border="currentCom.setting.style.border"
                      @change="(key, value) => handleChange(key, value)"
                    ></UnitBorder>
                    <!-- 边框设置 end -->
                  </div>
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
            </TabPanel>
          </Tabs>
        </div>
        <!-- Tab切换栏 end -->
      </div>
    </div>
  </div>
</template>
<script>
import BoardType from '@/views/screenManage/screen/setting/default-type';
import StyleMethodMixin from '@/views/screenManage/screen/setting/style-method-mixin';
export default {
  name: `${BoardType.Image}Setting`,
  mixins: [StyleMethodMixin],
  props: {
    currentCom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tabAcitve: 'style', // tab选项栏活动目标
      dataCollapseActive: ['dataFilter'], // 折叠打开选项
      fileName: '', //上传的图片名称
    };
  },
  methods: {
    /**
     * @description 点击添加图片
     */
    addPhote() {
      document.getElementById('upload_photo').click();
    },
    /**
     * @description 选择上传图片
     */
    selectPhoto(e) {
      if (!e.target.files[0]) {
        return;
      }
      this.fileName = e.target.files[0].name;
    },
  },
};
</script>
<style lang="less" scoped>
.photo-wrap {
  border: 1px solid #ccc;
  height: 26px;
  width: 100%;
  border-radius: 2px;
  cursor: pointer;
  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 6px;
    line-height: 24px;
  }
  /deep/ .anticon {
    display: block;
    margin: auto;
    line-height: 24px;
  }
}
</style>
