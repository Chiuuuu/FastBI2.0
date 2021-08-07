<template>
  <div class="board-header" flex @click.stop="cancelSelect">
    <div class="header-title">
      <!-- <span style="font-size:18px;margin-top:10px">{{fileName}}</span> -->
      <!-- <a-input placeholder="请输入大屏标题" v-model="fileName" style="border:none;background:none;color:#fff;" /> -->
      <!-- <i class="el-icon-arrow-left" style="margin-left:20px;font-size:22px;cursor: pointer;margin-top:8px"></i> -->
      <!-- <span v-if="config.title">{{ config.title.text }}</span> -->
      <span v-if="!isFocus">{{ fileName }}</span>
      <input
        class="header-title-text"
        :maxLength="20"
        :autofocus="isFocus"
        :class="isFocus ? 'focus' : 'nofocus'"
        type="text"
        v-model="screenName"
        @focus="onfocus"
        @blur="onBlur"
        style="background:rgba(255,255,255,0.2)"
      />
    </div>
    <div class="control" flex-box="1">
      <slot>control box</slot>
    </div>
    <div class="right-box">
      <!-- <div class="item" flex="dir:top">
          <a-icon
            type="mobile"
            style="font-size:18px"
          />
          <span> 手机端</span>
      </div>-->
      <div class="item" flex="dir:top" @click.stop="refreshData">
        <a-icon type="sync" style="font-size:18px" />
        <span>刷新</span>
      </div>
      <div class="item" flex="dir:top" @click.stop="openScreen">
        <a-icon type="block" style="font-size:18px" />
        <span>预览</span>
      </div>
      <div class="item" flex="dir:top" @click="goBack">
        <a-icon type="close" style="font-size:18px" />
        <span>保存并关闭</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { on, off } from 'bin-ui/src/utils/dom'
export default {
  name: 'BoardHeader',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      screenName: '', // 大屏名称
      isFocus: false, // 大屏名称是否聚焦
      screenData: null
    }
  },
  inject: ['resetChartStyle'],
  computed: {
    ...mapGetters([
      'isScreen',
      'pageSettings',
      'canvasMap',
      'screenId',
      'fileName',
      'parentId'
    ])
  },
  watch: {
    $attrs(val) {
      this.screenData = val
    }
  },
  mounted() {},
  methods: {
    ...mapActions([
      'saveScreenData',
      'renameScreenData',
      'updateChartData',
      'refreshScreen'
    ]),
    goBack() {
      // 选了背景图片又没有上传图片的，默认选回背景颜色
      if (
        !this.pageSettings.backgroundSrc &&
        this.pageSettings.backgroundType === '2'
      ) {
        this.$store.dispatch(
          'SetPageSettings',
          Object.assign({}, this.pageSettings, { backgroundType: '1' })
        )
      }
      this.saveScreenData()
      this.$message.success('保存成功')
      this.$router.replace({ name: 'catalog' })
    },
    onfocus() {
      this.isFocus = true
      this.screenName = this.fileName
    },
    onBlur() {
      if (this.screenName === '') {
        this.screenName = this.fileName
        this.isFocus = false
        return
      }
      if (this.screenName === this.fileName) {
        this.isFocus = false
        return
      }
      this.isFocus = false
      setTimeout(this.renameScreen, 0)
    },
    renameScreen() {
      let params = {
        fileType: 1,
        id: this.screenId,
        name: this.screenName,
        parentId: this.$route.query.parentId,
        setting: this.pageSettings
      }

      this.renameScreenData({ ...params }).then(res => {
        if (res) {
          this.$message.success('重命名成功')
          this.$store.dispatch('SetFileName', this.screenName)
        }
      })
    },
    // 打开全屏
    openScreen() {
      this.$store.dispatch('SetIsScreen', true)
      // 清空当前选中
      this.$store.dispatch('SingleSelected', null)
      // 位置在screen.vue,对应画板元素
      this.$nextTick(() => {
        var docElm = document.querySelector('.screen-shot')
        if (docElm) {
          if (docElm.requestFullscreen) {
            // W3C
            docElm.requestFullscreen()
          } else if (docElm.mozRequestFullScreen) {
            // FireFox
            docElm.mozRequestFullScreen()
          } else if (docElm.webkitRequestFullScreen) {
            // Chrome等
            docElm.webkitRequestFullScreen()
          } else if (docElm.msRequestFullscreen) {
            // IE11
            docElm.msRequestFullscreen()
          }
        }
      })
    },
    // 刷新大屏
    refreshData() {
      if (!this.screenId) {
        this.$message.error('暂无数据可刷新，请先添加数据')
        return
      }
      this.resetChartStyle()
      this.refreshScreen({
        charSeted: false,
        needLoading: true
      })
    },
    cancelSelect() {
      this.$store.dispatch('SingleSelected', null)
    }
  }
}
</script>
