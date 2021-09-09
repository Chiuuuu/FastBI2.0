import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { Button, ColorPicker, Select, Option, Input, CheckboxGroup, CheckboxButton, Checkbox } from 'element-ui';
import BinUI from 'bin-ui';
import 'bin-ui/lib/styles/index.css';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';

import './styles/index.styl';

import server from '@/api/index';

import permission from '@/directive/permission';
import hasPermission from '@/directive/hasPermission';
import PERMISSION_CODE from '@/config/permission';
import * as Echarts from 'echarts';
import './font/font.css';

import '@/components';
import '@/components/unit';

// element-ui 局部引用
Vue.use(Button);
Vue.use(ColorPicker);
Vue.use(Select);
Vue.use(Option);
Vue.use(Input);
Vue.use(CheckboxGroup);
Vue.use(CheckboxButton);
Vue.use(Checkbox);

Vue.use(BinUI);
Vue.use(Antd);
Vue.use(permission);
Vue.use(hasPermission);

import { message } from 'ant-design-vue';
message.config({
  top: '50px',
  duration: 2,
});
Vue.prototype.$server = server;
Vue.prototype.$EventBus = new Vue();
Vue.prototype.$base = process.env.NODE_ENV === 'production' ? '/bin-data-site' : '';
Vue.prototype.$PERMISSION_CODE = PERMISSION_CODE;
Vue.prototype.$echarts = Echarts;
// if (sessionStorage.getItem('store')) {
//   store.replaceState(
//     Object.assign({}, store.state, JSON.parse(sessionStorage.getItem('store')))
//   )
// }

// // 在页面刷新时将vuex里的信息保存到sessionStorage里
// window.addEventListener('beforeunload', () => {
//   sessionStorage.setItem('store', JSON.stringify(store.state))
// })

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
