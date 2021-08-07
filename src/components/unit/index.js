import Vue from 'vue'
import UnitBackgroundColor from './components/background-color.vue'
import UnitBorder from './components/border.vue'
import UnitCheckbox from './components/checkbox.vue'
import UnitConnect from './components/connect.vue'
import UnitDataFilter from './components/data-filter.vue'
import UnitField from './components/field.vue'
import UnitPosition from './components/position.vue'
import UnitSize from './components/size.vue'
import UnitTip from './components/tip.vue'
import UnitTitle from './components/title.vue'
import UnitXaxis from './components/xaxis.vue'
import UnitYaxis from './components/yaxis.vue'
import UnitLegend from './components/legend.vue'
import UnitLabel from './components/label.vue'
import UnitDrawing from './components/drawing.vue'
import UnitInputField from './components/input-field.vue'

const UnitList = [
  UnitBackgroundColor,
  UnitBorder,
  UnitCheckbox,
  UnitConnect,
  UnitDataFilter,
  UnitField,
  UnitPosition,
  UnitSize,
  UnitTip,
  UnitTitle,
  UnitXaxis,
  UnitYaxis,
  UnitLegend,
  UnitLabel,
  UnitDrawing,
  UnitInputField
]

UnitList.forEach(Component => {
  Vue.component(Component.name, Component)
})
