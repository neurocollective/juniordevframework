import Vue from 'vue';
import Vuex from 'vuex';
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
  },
  ACTION_TYPES: {
    LOAD_PAGE_DATA_SUCCESS,
    LOAD_PAGE_DATA_ERROR,
    CHANGE_ROUTE,
    TOGGLE_MENU,
    GO_TO_CONTACTS,
    GO_TO_TODOS,
    GO_TO_RESULTS,
    GO_TO_ACCOUNT,
    GO_TO_LOGIN,
    GO_TO_SIGNUP,
    INCREMENT_PAGE_COUNT,
    GO_HOME,
    LOGIN_ERROR
  }
} = UI_CONSTANTS;

Vue.use(Vuex);

const handleRoutingError = (err) => {
  console.log(`a routing action failed, error is: ${err.message}`);
};

const getIncrementPageAction = () => ({ type: 'incrementPageCount' });
const getRouteChangeAction = (destination) => ({ type: CHANGE_ROUTE, destination });
// const getToggleMenuAction = () => ({ type: 'toggleMenu' });

export default new Vuex.Store({
  state: {
    currentComponent: 'home',
    page: 0,
    count: 0,
    showMenu: false,
    pageLoadError: null,
    pageLoadData: {},
    loginError: ''
  },
  mutations: {
    incrementPage(state) {
      state.page += 1;
    },
    setPageRoute(state, payload) {
      const { destination } = payload;
      state.currentComponent = destination;
      const { page } = state;
      window.history.pushState({ page }, `title${page}`, `/${destination}`);
    },
    toggleMenu(state) {
      const { showMenu } = state;
      state.showMenu = !showMenu;
    },
    setPageLoadError(state, err) {
      state.pageLoadError = err;
    },
    setPageLoadData(state, { payload = {} }) {
      const { json: { data } = {} } = payload;
      state.pageLoadData = payload;
      state.userJobListings = data;
    },
    setLoginError(state, error) {
      console.log('setLoginError error', error);
      state.loginError = error;
    }
  },
  actions: {
    [INCREMENT_PAGE_COUNT]: function({ commit }) {
      commit('incrementPage');
    },
    [CHANGE_ROUTE]: function({ commit }, { destination }) {
      console.log(`changing routes to ${destination}`);
      commit({ type: 'setPageRoute', destination });
    },
    [TOGGLE_MENU]: function({ commit }) {
      commit({ type: 'toggleMenu' });
    },
    [GO_HOME]: function({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(HOME)))
        .catch(handleRoutingError);
    },
    [GO_TO_ACCOUNT]: function({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(ACCOUNT)))
        .catch(handleRoutingError);
    },
    [GO_TO_RESULTS]: function({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(RESULTS)))
        .catch(handleRoutingError);
    },
    [GO_TO_TODOS]: function({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(TODOS)))
        .catch(handleRoutingError);
    },
    [GO_TO_CONTACTS]: function({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(CONTACTS)))
        .catch(handleRoutingError);
    },
    [GO_TO_LOGIN]: function({ dispatch }) {
      console.log('goToLogin inside store');
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(LOGIN)))
        .catch(handleRoutingError);
    },
    [GO_TO_SIGNUP]: function({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(SIGNUP)))
        .catch(handleRoutingError);
    },
    [LOAD_PAGE_DATA_SUCCESS]: function({ commit }, payload = {}) {
      commit('setPageLoadData', payload);
    },
    [LOAD_PAGE_DATA_ERROR]: function({ commit }, payload = {}) {
      const { json: { error = 'data failed to load' } = {} } = payload;
      commit('setPageLoadError', error);
    },
    [LOGIN_ERROR]: function({ commit }, action = {}) {
      const {
        payload: {
          json: {
            error
          } = {}
        } = {}
      } = action;
      commit('setLoginError', error);
    }
  },
  modules: {
  },
});
