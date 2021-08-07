<template>
  <div>
    <div v-if="config.title === '直线'">
      <GuiField label="线条颜色">
        <el-color-picker
          :value="config.style.borderColor"
          @change="setStyle($event, 'borderColor')"
        ></el-color-picker>
      </GuiField>
      <GuiField label="线型">
        <a-select
          :value="config.style.borderStyle"
          style="width: 90px"
          size="small"
          @change="setStyle($event, 'borderStyle')"
        >
          <a-select-option value="solid">实线</a-select-option>
          <a-select-option value="dashed">虚线</a-select-option>
          <a-select-option value="dotted">点线</a-select-option>
        </a-select>
      </GuiField>
      <GuiField label="线条宽度">
        <a-input-number
          :max="maxBorder"
          :min="0"
          :value="view.height"
          @change="setView($event, 'height')"
        />
      </GuiField>
      <GuiField label="线条阴影">
        <a-switch
          :checked="config.style.showShadow"
          @change="setStyle($event, 'showShadow')"
        ></a-switch>
      </GuiField>
      <GuiField label="阴影颜色">
        <el-color-picker
          :value="config.style.shadowColor"
          @change="setStyle($event, 'shadowColor')"
        ></el-color-picker>
      </GuiField>
      <!-- <GuiField label="旋转角度">
      <a-input-number :min="0" :max="360" :value="view.rotate" @change="setView($event, 'rotate')" />
    </GuiField> -->
    </div>
    <div v-else-if="config.title === '圆形'">
      <GuiField label="填充颜色">
        <el-color-picker
          :value="config.style.backgroundColor"
          @change="setStyle($event, 'backgroundColor')"
        ></el-color-picker>
      </GuiField>
      <GuiField label="填充透明度">
        <a-input-number
          :value="config.style.opacity"
          size="small"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setStyle($event, 'opacity')"
        ></a-input-number>
      </GuiField>
      <GuiField label="边框颜色">
        <el-color-picker
          :value="config.style.borderColor"
          @change="setStyle($event, 'borderColor')"
        ></el-color-picker>
      </GuiField>
      <GuiField label="边框宽度">
        <a-input-number
          :max="maxBorder"
          :min="0"
          :value="config.style.borderWidth"
          @change="setStyle($event, 'borderWidth')"
        />
      </GuiField>
      <GuiField label="边框线型">
        <a-select
          :value="config.style.borderStyle"
          style="width: 90px"
          size="small"
          @change="setStyle($event, 'borderStyle')"
        >
          <a-select-option value="solid">实线</a-select-option>
          <a-select-option value="dashed">虚线</a-select-option>
          <a-select-option value="dotted">点线</a-select-option>
        </a-select>
      </GuiField>
      <!-- <GuiField label="旋转角度">
      <a-input-number :min="0" :max="360" :value="view.rotate" @change="setView($event, 'rotate')" />
    </GuiField> -->
    </div>
    <div v-else-if="config.title === '矩形'">
      <GuiField label="填充颜色">
        <el-color-picker
          :value="config.style.backgroundColor"
          @change="setStyle($event, 'backgroundColor')"
        ></el-color-picker>
      </GuiField>
      <GuiField label="填充透明度">
        <a-input-number
          :value="config.style.opacity"
          size="small"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setStyle($event, 'opacity')"
        ></a-input-number>
      </GuiField>
      <GuiField label="边框颜色">
        <el-color-picker
          :value="config.style.borderColor"
          @change="setStyle($event, 'borderColor')"
        ></el-color-picker>
      </GuiField>
      <GuiField label="圆角大小">
        <a-input-number
          :value="config.style.borderRadius"
          :min="0"
          :max="70"
          @change="setStyle($event, 'borderRadius')"
        />
      </GuiField>
      <GuiField label="边框宽度">
        <a-input-number
          :max="maxBorder"
          :min="0"
          :value="config.style.borderWidth"
          @change="setStyle($event, 'borderWidth')"
        />
      </GuiField>
      <GuiField label="边框线型">
        <a-select
          :value="config.style.borderStyle"
          style="width: 90px"
          size="small"
          @change="setStyle($event, 'borderStyle')"
        >
          <a-select-option value="solid">实线</a-select-option>
          <a-select-option value="dashed">虚线</a-select-option>
          <a-select-option value="dotted">点线</a-select-option>
        </a-select>
      </GuiField>
      <!-- <GuiField label="旋转角度">
      <a-input-number :min="0" :max="360" :value="view.rotate" @change="setView($event, 'rotate')" />
    </GuiField> -->
    </div>
    <div class="figure-btn-area">
      <a-button type="primary" size="small" @click="resetSetting">恢复默认配置</a-button>
    </div>
  </div>
</template>

<script>
import settings from '@/config/navigate'
import { deepClone } from '../../../../utils/deepClone'
import GuiField from '../gui-field.vue'

export default {
  props: {
    config: {
      type: Object,
      require: true
    },
    view: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      style: {}
    }
  },
  computed: {
    maxBorder() {
      const { width, height } = this.$store.getters.currSelected.setting.view
      let res = Math.min(width, height) / 2
      if (this.config.title === '直线') {
        res = 20
      }
      return res > 20 ? 20 : res
    }
  },
  components: {
    GuiField
  },
  methods: {
    // 设置样式
    setStyle(value, key) {
      const config = deepClone(this.config)
      config.style[key] = value
      this.$emit('update:config', config)
      this.$emit('refreshSelf')
    },
    // 设置图形样式
    setView(value, key) {
      const view = deepClone(this.view)
      view[key] = value
      this.$emit('update:view', view)
      this.$emit('refreshBase')
    },
    resetSetting() {
      const initialType = settings.find(item => item.type === 'Figure')
      if (initialType) {
        const settings = initialType.tabs[0].children.find(item => item.title === this.config.title)
        if (settings) {
          this.$emit('update:config', settings.config)
          this.$emit('refreshSelf')
          if (this.config.title === '直线') {
            this.setView(1, 'height')
            this.$emit('refreshBase')
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.circle {
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background: #000;
}
.figure-btn-area {
  margin-top: 10px;
  text-align: center;
}
</style>
