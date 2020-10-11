import Vue from 'vue';
import {
  MdButton,
  MdToolbar,
  MdDrawer,
  MdList,
  MdIcon,
  // MdListItem
} from 'vue-material/dist/components';
import App from './App.vue';
// import router from './router';
import store from './store';

import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

Vue.use(MdButton);
Vue.use(MdToolbar);
Vue.use(MdDrawer);
Vue.use(MdList);
Vue.use(MdIcon);
// Vue.use(MdListItem);

Vue.config.productionTip = false;

new Vue({
  // router,
  store,
  render: (h) => h(App),
}).$mount('#app');
