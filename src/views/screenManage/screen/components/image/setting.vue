<template>
  <div class="chart-setting">
    <div class="panel-setting">
      <div class="setting-wrapper">
        <h2 class="title">{{ currentCom.graphName }}</h2>
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
                <CollapsePanel class="content-item" panel="title" header="标题">
                  <div class="setting-unit-content">
                    <!-- 标题 end -->
                    <a-row class="unit-show-block mb-8">
                      <a-col :span="24">
                        <a-input
                          :value="currentCom.setting.style.title.text"
                          :maxLength="20"
                          @blur="event => handleTitleChange('text', event.target.value)"
                        ></a-input>
                      </a-col>
                    </a-row>
                  </div>
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

      const file = e.target.files[0];
      if (file.size / 1024 / 1024 > 2) {
        return this.$message.error('只支持2M以内的jpg/png格式图片');
      }
      const form = new FormData();
      form.append('avatarfile', file);
      this.$server.screenManage
        .actionUploadImage(form)
        .then(res => {
          if (res.code === 200) {
            let imageUrl = `${process.env.VUE_APP_SERVICE_URL}${res.imgUrl}`;
            this.handleChange('echart', { customImageUrl: imageUrl });
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          // 清空input
          e.target.value = null;
        });
    },
    /**
     * @description 设置标题
     */
    handleTitleChange(key, value) {
      this.handleChange('title', {
        [key]: value,
      });
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
