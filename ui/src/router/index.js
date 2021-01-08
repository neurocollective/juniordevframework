// import Counter from '../components/Counter.vue';
import Home from '../components/Home.vue';
import Account from '../components/Account.vue';
import Contacts from '../components/Contacts.vue';
import Results from '../components/Results.vue';
import Todos from '../components/Todos.vue';
import Login from '../components/Login.vue';
import Signup from '../components/Signup.vue';
import UI_CONSTANTS from '../../../lib/constants';

const {
  PAGES: {
    ACCOUNT,
    RESULTS,
    TODOS,
    CONTACTS,
    HOME,
    LOGIN,
    SIGNUP
  }
} = UI_CONSTANTS;

const router = {
  [ACCOUNT]: Account,
  home: Home,
  [HOME]: Home,
  [RESULTS]: Results,
  [TODOS]: Todos,
  [CONTACTS]: Contacts,
  [LOGIN]: Login,
  [SIGNUP]: Signup
};

export default router;
