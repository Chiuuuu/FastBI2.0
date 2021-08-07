import Vue from 'vue'
import ColorPicker from './color-picker'
import Collapse from './collapse/collapse.vue'
import CollapsePanel from './collapse/collapse-panel.vue'
import Tabs from './tabs/tabs.vue'
import TabPanel from './tabs/tab-panel.vue'

const UnitList = [ColorPicker, Collapse, CollapsePanel, TabPanel, Tabs]

UnitList.forEach(Component => {
  Vue.component(Component.name, Component)
})
