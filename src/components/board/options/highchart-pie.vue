<template>
  <!-- highechart 样式设置 -->
  <a-collapse v-model="collapseActive">
    <a-collapse-panel key="title" header="标题">
      <!-- <a-switch
        slot="extra"
        v-model="HighConfig.setting.config.title"
        default-checked
        @change="switchChange"
        size="small"
      /> -->
      <gui-field label="标题名">
        <a-input
          v-model="HighConfig.setting.config.title.text"
          size="small"
          :maxLength="20"
          @change="setSelfProperty"
        ></a-input>
      </gui-field>
      <gui-field label="文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="HighConfig.setting.config.title.style.fontSize"
            size="small"
            :min="12"
            :max="100"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.title.style.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="字体">
        <a-select
          v-model="HighConfig.setting.config.title.style.fontFamily"
          style="width: 164px"
          size="small"
          @change="setSelfProperty"
        >
          <a-select-option
            :value="font.value"
            v-for="(font, index) in fontFamilyList"
            :key="index"
            >{{ font.label }}</a-select-option
          >
        </a-select>
      </gui-field>
      <gui-field label="粗细">
        <a-select
          v-model="HighConfig.setting.config.title.style.fontWeight"
          style="width: 164px"
          size="small"
          @change="setSelfProperty"
        >
          <a-select-option value="normal">正常</a-select-option>
          <a-select-option value="bolder">加粗</a-select-option>
          <a-select-option value="lighter">更细</a-select-option>
        </a-select>
      </gui-field>
      <gui-field label="对齐方式">
        <a-radio-group
          :value="HighConfig.setting.config.title.align"
          size="small"
        >
          <a-tooltip placement="top" title="左对齐">
            <a-radio-button
              value="left"
              @click.native.stop="onRadioChange('title', 'align', 'left')"
            >
              <a-icon type="align-left" value="left" />
            </a-radio-button>
          </a-tooltip>
          <a-tooltip placement="top" title="居中">
            <a-radio-button
              value="center"
              @click.native.stop="onRadioChange('title', 'align', 'center')"
            >
              <a-icon type="align-center" value="center" />
            </a-radio-button>
          </a-tooltip>
          <a-tooltip placement="top" title="右对齐">
            <a-radio-button
              value="right"
              @click.native.stop="onRadioChange('title', 'align', 'right')"
            >
              <a-icon type="align-right" value="right" />
            </a-radio-button>
          </a-tooltip>
        </a-radio-group>
      </gui-field>
    </a-collapse-panel>

    <a-collapse-panel key="properties" header="图形属性">
      <gui-field label="是否3d图">
        <a-switch
          v-model="HighConfig.setting.config.chart.options3d.enabled"
          default-checked
          @change="setSelfProperty"
          size="small"
        />
      </gui-field>
      <gui-field label="中心坐标">
        <gui-inline>
          <a-input
            v-model="HighConfig.setting.config.plotOptions.pie.center[0]"
            size="small"
            placeholder="默认50%"
            @change="setSelfProperty"
          >
            <span slot="prefix">x</span>
          </a-input>
        </gui-inline>
        <gui-inline>
          <a-input
            v-model="HighConfig.setting.config.plotOptions.pie.center[1]"
            size="small"
            placeholder="默认50%"
            @change="setSelfProperty"
          >
            <span slot="prefix">y</span>
          </a-input>
        </gui-inline>
      </gui-field>
      <gui-field label="内环大小">
        <a-input
          v-model="HighConfig.setting.config.plotOptions.pie.innerSize"
          size="small"
          placeholder="默认0"
          @change="setSelfProperty"
        ></a-input>
      </gui-field>
      <gui-field label="外径大小">
        <a-input
          v-model="HighConfig.setting.config.plotOptions.pie.size"
          size="small"
          placeholder="默认50%"
          @change="setSelfProperty"
        ></a-input>
      </gui-field>
      <!-- <gui-field label="主题类型">
        <a-select
          v-model="HighConfig.setting.config.themeName"
          style="width: 164px"
          size="small"
          @change="getThemeColor"
        >
          <a-select-option
            :value="theme.title"
            v-for="(theme, index) in themes"
            :key="index"
            >{{ theme.title }}</a-select-option
          >
        </a-select>
      </gui-field> -->
    </a-collapse-panel>

    <a-collapse-panel key="legend" header="图例设置">
      <a-switch
        slot="extra"
        v-model="HighConfig.setting.config.legend.enabled"
        v-if="collapseActive.indexOf('legend') > -1"
        default-checked
        @change="switchChange"
        size="small"
      />
      <gui-field label="图例颜色">
        <el-color-picker
          v-for="(color, index) in HighConfig.setting.config.colors"
          :key="index"
          v-model="HighConfig.setting.config.colors[index]"
          @change="setSelfProperty"
        ></el-color-picker>
      </gui-field>
      <gui-field label="文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="HighConfig.setting.config.legend.itemStyle.fontSize"
            size="small"
            :min="12"
            :max="40"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.legend.itemStyle.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="位置">
        <gui-inline>
          <a-radio-group
            :value="HighConfig.setting.config.legend.align"
            size="small"
          >
            <a-radio-button
              value="left"
              @click.native.stop="onRadioChange('legend', 'align', 'left')"
              >左</a-radio-button
            >
            <a-radio-button
              value="center"
              @click.native.stop="onRadioChange('legend', 'align', 'center')"
              >中</a-radio-button
            >
            <a-radio-button
              value="right"
              @click.native.stop="onRadioChange('legend', 'align', 'right')"
              >右</a-radio-button
            >
          </a-radio-group>
        </gui-inline>
      </gui-field>
      <gui-field>
        <gui-inline>
          <a-radio-group
            :value="HighConfig.setting.config.legend.verticalAlign"
            size="small"
          >
            <a-radio-button
              value="top"
              @click.native.stop="
                onRadioChange('legend', 'verticalAlign', 'top')
              "
              >顶部</a-radio-button
            >
            <a-radio-button
              value="middle"
              @click.native.stop="
                onRadioChange('legend', 'verticalAlign', 'middle')
              "
              >居中</a-radio-button
            >
            <a-radio-button
              value="bottom"
              @click.native.stop="
                onRadioChange('legend', 'verticalAlign', 'bottom')
              "
              >底部</a-radio-button
            >
          </a-radio-group>
        </gui-inline>
      </gui-field>
      <gui-field label="排列">
        <gui-inline>
          <a-radio-group
            :value="HighConfig.setting.config.legend.layout"
            size="small"
          >
            <a-radio-button
              value="horizontal"
              @click.native.stop="
                onRadioChange('legend', 'layout', 'horizontal')
              "
              >水平</a-radio-button
            >
            <a-radio-button
              value="vertical"
              @click.native.stop="onRadioChange('legend', 'layout', 'vertical')"
              >垂直</a-radio-button
            >
          </a-radio-group>
        </gui-inline>
      </gui-field>
    </a-collapse-panel>

    <a-collapse-panel key="indicator" header="指标设置">
      <a-switch
        slot="extra"
        v-model="HighConfig.setting.config.plotOptions.pie.dataLabels.enabled"
        v-if="collapseActive.indexOf('indicator') > -1"
        @change="switchChange"
        size="small"
      />
      <gui-field label="显示内容"></gui-field>
      <a-select
        mode="multiple"
        placeholder="选择显示内容"
        v-model="HighConfig.setting.config.plotOptions.pie.dataLabels.labelShowList"
        style="width: 100%"
        @change="handleFormatter($event, 'label')"
      >
        <a-select-option
          :key="0"
          value="dimensions"
          >维度</a-select-option
        >
        <a-select-option
          :key="0"
          value="measures"
          >度量</a-select-option
        >
      </a-select>
      <gui-field label="文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="
              HighConfig.setting.config.plotOptions.pie.dataLabels.style
                .fontSize
            "
            size="small"
            :min="12"
            :max="40"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.plotOptions.pie.dataLabels.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="显示位置">
        <a-radio-group :value="HighConfig.setting.config.plotOptions.pie.dataLabels.distance" size="small">
          <a-radio-button
            :value="-30"
            @click.native.stop="
              onRadioChange('indicator','distance', -30)
            "
            >内部</a-radio-button
          >
          <a-radio-button
            :value="10"
            @click.native.stop="
              onRadioChange('indicator','distance', 10)
            "
            >外部</a-radio-button
          >
        </a-radio-group>
      </gui-field>
    </a-collapse-panel>

    <a-collapse-panel key="tooltip" header="鼠标移入提示">
      <a-switch
        slot="extra"
        v-model="HighConfig.setting.config.tooltip.enabled"
        v-if="collapseActive.indexOf('tooltip') > -1"
        @change="switchChange"
        size="small"
      />
      <gui-field label="显示内容"></gui-field>
      <a-select
        mode="multiple"
        placeholder="选择显示内容"
        v-model="HighConfig.setting.config.tooltip.tooltipShowList"
        style="width: 100%"
        @change="handleFormatter($event, 'tooltip')"
      >
        <a-select-option
          :key="0"
          value="dimensions"
          >维度</a-select-option
        >
        <a-select-option
          :key="0"
          value="measures"
          >度量</a-select-option
        >
      </a-select>
    </a-collapse-panel>

    <a-collapse-panel key="background" header="背景和边框">
      <a-radio-group
        v-model="HighConfig.setting.background.backgroundType"
        name="radioGroup"
      >
        <a-radio
          :style="radioStyle"
          value="1"
          @click.native.stop="onBgChange('backgroundType', '1')"
        >
          <gui-field label="背景颜色">
            <el-color-picker
              v-model="HighConfig.setting.background.backgroundColor"
              show-alpha
              @change="setBackGround"
            ></el-color-picker>
          </gui-field>
        </a-radio>
        <a-radio
          :style="radioStyle"
          value="2"
          @click.native.stop="onBgChange('backgroundType', '2')"
        >
          <gui-field label="背景图片">
            <a-button
              size="small"
              @click.native.stop="addbgPhoto"
              :disabled="HighConfig.setting.background.backgroundType !== '2'"
              >上传</a-button
            >
            <input
              id="bgPhoto"
              ref="img_input1"
              type="file"
              name
              accept="image/png, image/jpeg, image/gif"
              style="display: none"
              @change="selectPhoto($event, 'backgroundImage')"
            />
          </gui-field>
        </a-radio>
      </a-radio-group>
      <gui-field label="边框颜色">
        <el-color-picker
          v-model="HighConfig.setting.background.borderColor"
          show-alpha
          @change="setBackGround"
        ></el-color-picker>
      </gui-field>
      <gui-field label="边框大小">
        <a-input-number
          v-model="HighConfig.setting.background.borderWidth"
          size="small"
          :formatter="value => `${value}px`"
          :parser="value => value.replace('px', '')"
          @change="setBackGround"
        ></a-input-number>
      </gui-field>
      <gui-field label="圆角大小">
        <a-input-number
          v-model="HighConfig.setting.background.borderRadius"
          size="small"
          :formatter="value => `${value}px`"
          :parser="value => value.replace('px', '')"
          @change="setBackGround"
        ></a-input-number>
      </gui-field>
      <gui-field label="边框线型">
        <a-select
          style="width: 90px"
          v-model="HighConfig.setting.background.borderStyle"
          @change="setBackGround"
          placeholder="无"
          size="small"
        >
          <a-select-option value="solid">实线</a-select-option>
          <a-select-option value="dotted">点状</a-select-option>
          <a-select-option value="dashed">虚线</a-select-option>
        </a-select>
      </gui-field>
    </a-collapse-panel>
  </a-collapse>
</template>
<script>
import GuiField from './gui-field'
import GuiInline from './gui-inline'
import { setBaseProperty } from '@/api/canvasMaps/canvas-maps-request'

import { mapGetters, mapActions } from 'vuex'

import HighMinxins from '@/mixins/hight'
export default {
  props: {
    HighConfig: {
      type: Object,
      required: true
    }
  },
  mixins: [HighMinxins],
  components: { GuiField, GuiInline },
  data() {
    return {
      // selval:[]
      collapseActive: [],
      tooltipShowList: [],
      labelShowList: []
    }
  },
  computed: {
    selval() {
      let _val = this.HighConfig.setting.config.plotOptions.pie.dataLabels
        .format
      if (_val === '') {
        // this.HighConfig.setting.config.plotOptions.pie.dataLabels.enabled = false;
        return []
      } else {
        // this.HighConfig.setting.config.plotOptions.pie.dataLabels.enabled = true;
        return _val.split(' ')
      }
    }
  },
  mounted() {},
  methods: {
    onChange(checkedValues) {
      // this.selval = checkedValues;
      // this.HighConfig.setting.config.plotOptions.pie.dataLabels.format = checkedValues.join('');
      let source = this.HighConfig.setting.config.plotOptions.pie.dataLabels
      this.$set(source, 'format', checkedValues.join(' '))
      this.setSelfProperty()
    },
    handleFormatter(value, type) {
      let result = ''
      if (value.includes('dimensions')) {
        result += '{point.options.name}'
      }
      if (value.includes('measures')) {
        if (!result) {
          result = '{point.options.y}'
        } else {
          result += ': {point.options.y}'
        }
      }
      if (type === 'tooltip') {
        this.HighConfig.setting.config.tooltip.pointFormat = result
        this.HighConfig.setting.config.tooltip.tooltipShowList = value
      } else {
        this.HighConfig.setting.config.plotOptions.pie.dataLabels.pointFormat = result
        this.HighConfig.setting.config.plotOptions.pie.dataLabels.labelShowList = value
      }
      this.setSelfProperty()
    }
  },
  watch: {}
}
</script>
<style lang="less" scoped></style>
