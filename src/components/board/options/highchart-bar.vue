<template>
  <!-- highechart 样式设置 -->
  <a-collapse v-model="collapseActive">
    <a-collapse-panel key="title" header="标题">
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
      <gui-field label="边距">
        <gui-inline>
          <a-input-number
            v-model="HighConfig.setting.config.chart.marginTop"
            size="small"
            :formatter="value => `上 ${value}`"
            :parser="value => value.replace(/\上\s?|(,*)/g, '')"
            class="f-clear-width"
            :min="0"
            :max="120"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline>
          <a-input-number
            v-model="HighConfig.setting.config.chart.marginBottom"
            size="small"
            :formatter="value => `下 ${value}`"
            class="f-clear-width"
            :min="0"
            :max="60"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
      </gui-field>
      <gui-field label="">
        <gui-inline>
          <a-input-number
            v-model="HighConfig.setting.config.chart.marginLeft"
            size="small"
            :formatter="value => `左 ${value}`"
            class="f-clear-width"
            :min="0"
            :max="60"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline>
          <a-input-number
            v-model="HighConfig.setting.config.chart.marginRight"
            size="small"
            :formatter="value => `右 ${value}`"
            class="f-clear-width"
            :min="0"
            :max="200"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
      </gui-field>
      <gui-field label="文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="
              HighConfig.setting.config.plotOptions.column.dataLabels.style
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
            v-model="
              HighConfig.setting.config.plotOptions.column.dataLabels.color
            "
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="内旋转角">
        <a-slider
          :default-value="HighConfig.setting.config.chart.options3d.alpha"
          v-model="HighConfig.setting.config.chart.options3d.alpha"
          :max="45"
          @change="setSelfProperty"
        />
      </gui-field>
      <gui-field label="外旋转角">
        <a-slider
          :default-value="HighConfig.setting.config.chart.options3d.beta"
          v-model="HighConfig.setting.config.chart.options3d.beta"
          :max="45"
          @change="setSelfProperty"
        />
      </gui-field>
      <gui-field label="深度">
        <a-slider
          :default-value="HighConfig.setting.config.chart.options3d.depth"
          v-model="HighConfig.setting.config.chart.options3d.depth"
          :min="20"
          @change="setSelfProperty"
        />
      </gui-field>
      <!-- <gui-field label="是否圆柱">
        <a-switch
          v-model="bartype.isyz"
          size="small"
          @change="a=>setHistogram(a,'chart')"
        ></a-switch>
      </gui-field> -->
      <gui-field label="堆叠柱状图">
        <a-switch
          size="small"
          @change="a => setHistogram(a, 'plotOptions')"
          v-model="isdd"
          clearable
        ></a-switch>
      </gui-field>
      <!-- <gui-field label="柱条宽度">
        <a-input-number
          class="longwidth"
          v-model="HighConfig.setting.config.plotOptions.column.borderWidth"
          size="small"
          @change="setSelfProperty"
        ></a-input-number>
      </gui-field> -->
      <gui-field label="展示数值">
        <a-switch
          v-model="HighConfig.setting.config.plotOptions.column.dataLabels.enabled"
          size="small"
          @change="setSelfProperty"
        ></a-switch>
      </gui-field>
      <gui-field label="柱体内展示">
        <a-switch
          v-model="HighConfig.setting.config.plotOptions.column.dataLabels.inside"
          size="small"
          @change="setSelfProperty"
        ></a-switch>
      </gui-field>
      <gui-field label="数值倾斜角度">
        <a-input-number
          class="longwidth"
          v-model="HighConfig.setting.config.plotOptions.column.dataLabels.rotation"
          size="small"
          :min="0"
          :max="360"
          @change="setSelfProperty"
        ></a-input-number>
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
        v-if="collapseActive.indexOf('legend') > -1"
        v-model="HighConfig.setting.config.legend.enabled"
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

    <a-collapse-panel key="x" header="x轴">
      <a-switch
        slot="extra"
        v-model="HighConfig.setting.config.xAxis.visible"
        v-if="collapseActive.indexOf('x') > -1"
        default-checked
        @change="switchChange"
        size="small"
      />
      <gui-field label="轴名称">
        <a-input
          v-model="HighConfig.setting.config.xAxis.title.text"
          @change="setSelfProperty"
          size="small"
        ></a-input>
      </gui-field>
      <gui-field label="标题文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="HighConfig.setting.config.xAxis.title.style.fontSize"
            size="small"
            :min="12"
            :max="40"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.xAxis.title.style.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="标题位置">
        <a-radio-group
          :value="HighConfig.setting.config.xAxis.title.align"
          size="small"
        >
          <a-radio-button
            value="middle"
            @click.native.stop="getBtnRadio('xAxis', 'middle')"
            >中部</a-radio-button
          >
          <a-radio-button
            value="high"
            @click.native.stop="getBtnRadio('xAxis', 'high')"
            >末尾</a-radio-button
          >
        </a-radio-group>
      </gui-field>
      <gui-field label="x轴文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="HighConfig.setting.config.xAxis.labels.style.fontSize"
            size="small"
            :min="12"
            :max="40"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.xAxis.labels.style.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="倾斜角度">
        <a-input-number
          v-model="HighConfig.setting.config.xAxis.labels.rotation"
          size="small"
          :min="0"
          :max="90"
          @change="setSelfProperty"
        ></a-input-number>
      </gui-field>
      <gui-field label="网格线宽度">
        <a-input-number
          v-model="HighConfig.setting.config.xAxis.gridLineWidth"
          size="small"
          :min="0"
          :max="90"
          @change="setSelfProperty"
        ></a-input-number>
      </gui-field>
      <gui-field label="网格线颜色">
        <el-color-picker
          v-model="HighConfig.setting.config.xAxis.gridLineColor"
          show-alpha
          @change="setSelfProperty"
        ></el-color-picker>
      </gui-field>
    </a-collapse-panel>

    <a-collapse-panel key="y" header="y轴">
      <a-switch
        slot="extra"
        v-model="HighConfig.setting.config.yAxis.visible"
        v-if="collapseActive.indexOf('y') > -1"
        default-checked
        @change="switchChange"
        size="small"
      />
      <gui-field label="y轴名称">
        <a-input
          v-model="HighConfig.setting.config.yAxis.title.text"
          @change="setSelfProperty"
          size="small"
        ></a-input>
      </gui-field>
      <gui-field label="标题文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="HighConfig.setting.config.yAxis.title.style.fontSize"
            size="small"
            :min="12"
            :max="40"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.yAxis.title.style.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>
      <gui-field label="标题位置">
        <a-radio-group
          :value="HighConfig.setting.config.yAxis.title.align"
          size="small"
        >
          <a-radio-button
            value="middle"
            @click.native.stop="getBtnRadio('yAxis', 'middle')"
            >中部</a-radio-button
          >
          <a-radio-button
            value="high"
            @click.native.stop="getBtnRadio('yAxis', 'high')"
            >末尾</a-radio-button
          >
        </a-radio-group>
      </gui-field>
      <gui-field label="y轴文本">
        <gui-inline label="字号">
          <a-input-number
            class="longwidth"
            v-model="HighConfig.setting.config.yAxis.labels.style.fontSize"
            size="small"
            :min="12"
            :max="40"
            @change="setSelfProperty"
          ></a-input-number>
        </gui-inline>
        <gui-inline label="颜色">
          <el-color-picker
            v-model="HighConfig.setting.config.yAxis.labels.style.color"
            @change="setSelfProperty"
          ></el-color-picker>
        </gui-inline>
      </gui-field>

      <gui-field label="网格线宽度">
        <a-input-number
          v-model="HighConfig.setting.config.yAxis.gridLineWidth"
          size="small"
          :min="0"
          :max="90"
          @change="setSelfProperty"
        ></a-input-number>
      </gui-field>
      <gui-field label="网格线颜色">
        <el-color-picker
          v-model="HighConfig.setting.config.yAxis.gridLineColor"
          show-alpha
          @change="setSelfProperty"
        ></el-color-picker>
      </gui-field>
    </a-collapse-panel>

    <a-collapse-panel key="tooltip" header="鼠标移入提示">
      <a-switch
        slot="extra"
        v-if="collapseActive.indexOf('tooltip') > -1"
        v-model="HighConfig.setting.config.tooltip.enabled"
        default-checked
        @change="switchChange"
        size="small"
      />
      <gui-field label="指标内容"></gui-field>
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

    <!-- <a-collapse-panel key="indicator" header="指标设置"> </a-collapse-panel> -->

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
      collapseActive: [],
      tooltipShowList: []
      // bartype: {
      //   isyz: false, //是否圆柱图
      //   isdd: false //是否堆叠图
      // }
    }
  },
  computed: {
    isdd() {
      let flag = this.HighConfig.setting.config.plotOptions.column.stacking
      if (flag == null) {
        return false
      } else {
        return true
      }
    }
  },
  mounted() {},
  methods: {
    setHistogram(val, key) {
      // 圆柱
      if (key === 'chart') {
        this.$set(
          this.HighConfig.setting.config[key],
          'type',
          val ? 'cylinder' : 'column'
        )
      } else {
        this.$set(
          this.HighConfig.setting.config[key].column,
          'stacking',
          val ? 'normal' : null
        )
      }
      this.setSelfProperty()
      console.clear()
    },
    getBtnRadio(key, val) {
      this.$set(this.HighConfig.setting.config[key].title, 'align', val)
      this.setSelfProperty()
    },
    handleFormatter(value, type) {
      let result = ''
      if (value.includes('dimensions')) {
        result += '{series.name}'
      }
      if (value.includes('measures')) {
        if (!result) {
          result = '{point.y}'
        } else {
          result += ': {point.y}'
        }
      }
      if (type === 'tooltip') {
        this.HighConfig.setting.config.tooltip.pointFormat = result
      } else {
        this.HighConfig.setting.config.plotOptions.column.dataLabels.pointFormat = result
      }
      this.setSelfProperty()
    }
  },
  watch: {}
}
</script>
<style lang="less" scoped>
.gui-field {
  ::v-deep .ant-slider {
    width: 100%;
  }
}
</style>
