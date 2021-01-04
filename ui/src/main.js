import Vue from 'vue';
import {
  MdButton,
  MdToolbar,
  MdDrawer,
  MdList,
  MdIcon,
  MdField,
} from 'vue-material/dist/components';
import App from './App.vue';
import store from './store';

import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default-dark.css';

Vue.use(MdButton);
Vue.use(MdToolbar);
Vue.use(MdDrawer);
Vue.use(MdList);
Vue.use(MdIcon);
Vue.use(MdField);

Vue.config.productionTip = false;

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
