<template>
  <a-row class="unit-show-block">
    <!-- 名称 start -->
    <a-col :span="8">
      <div class="unit-block-title">{{ label }}</div>
    </a-col>
    <!-- 名称 end -->
    <!-- 样式 start -->
    <a-col :span="8">
      <a-button size="small" @click.native.stop="$refs.imgUpload.click()">上传</a-button>
      <input
        id="globalPhoto"
        ref="imgUpload"
        type="file"
        name
        accept="image/png,image/jpg,image/jpeg,image/gif,image/jfif,image/pjp"
        style="display: none"
        @change="handleSelectPhoto"
      />
    </a-col>
    <!-- 轴文字是否显示 start -->
    <UnitCheckbox
      class="show-btn block-checkbox"
      label="显示"
      :value="showImage"
      @change="handleShowImage"
    ></UnitCheckbox>
    <!-- 样式 end -->
  </a-row>
</template>
<script>
/**
 * @description 背景颜色设置
 */
export default {
  name: 'UnitBackgroundImage',
  props: {
    background: {
      // 背景配置
      type: Object,
      required: true,
    },
    label: {
      // 名称
      type: String,
      default: '背景图片',
    },
  },
  computed: {
    showImage() {
      return this.background.image !== '';
    },
  },
  methods: {
    handleChange(value) {
      this.$emit('change', value);
    },
    // 是否显示背景图片
    handleShowImage(value) {
      let image = value ? this.background.customImgUrl : '';
      this.handleChange({ image });
    },
    // 上传图片
    handleSelectPhoto(e) {
      if (!e.target.files[0]) {
        return;
      }
      const file = e.target.files[0];
      if (file.size / 1024 / 1024 > 5) {
        return this.$message.error('只支持5M以内的png/pjp/jpg/pjpeg/jfif/gif格式图片');
      }
      const form = new FormData();
      form.append('avatarfile', file);
      this.$server.screenManage
        .actionUploadImage(form)
        .then(res => {
          if (res.code === 200) {
            let imageUrl = `url("${process.env.VUE_APP_SERVICE_URL}${res.imgUrl}")`;
            this.handleChange({ image: imageUrl, customImgUrl: imageUrl });
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
  },
};
</script>
<style lang="less" scoped>
@import url('../../../assets/less/mixins/set-color-picker.less');
.background-image {
  .set-color-picker();
  height: 26px;
}
</style>
