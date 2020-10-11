import Vue from 'vue';
import Vuex from 'vuex';
import { UI_CONSTANTS } from '../lib/constants';

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
    CHANGE_ROUTE
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
    pageLoadData: {}
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
    setPageLoadData(state, { payload }) {
      console.log('payload.json.data:', payload.json.data);
      state.pageLoadData = payload;
      state.userJobListings = payload.json.data;
    }
  },
  actions: {
    incrementPageCount: function({ commit }) {
      commit('incrementPage');
    },
    [CHANGE_ROUTE]: function({ commit }, { destination }) {
      console.log(`changing routes to ${destination}`);
      commit({ type: 'setPageRoute', destination });
    },
    toggleMenu({ commit }) {
      commit({ type: 'toggleMenu' });
    },
    goHome({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(HOME)))
        .catch(handleRoutingError);
    },
    goToAccount({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(ACCOUNT)))
        .catch(handleRoutingError);
    },
    goToResults({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(RESULTS)))
        .catch(handleRoutingError);
    },
    goToToDos({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(TODOS)))
        .catch(handleRoutingError);
    },
    goToContacts({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(CONTACTS)))
        .catch(handleRoutingError);
    },
    goToLogin({ dispatch }) {
      console.log('goToLogin inside store');
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(LOGIN)))
        .catch(handleRoutingError);
    },
    goToSignup({ dispatch }) {
      dispatch(getIncrementPageAction())
        .then(() => dispatch(getRouteChangeAction(SIGNUP)))
        .catch(handleRoutingError);
    },
    [LOAD_PAGE_DATA_SUCCESS]: function({ commit }, payload) {
      console.log(`store has ${LOAD_PAGE_DATA_SUCCESS}`);
      commit('setPageLoadData', payload);
    },
    [LOAD_PAGE_DATA_ERROR]: function({ commit }, payload) {
      const { json: { error = 'data failed to load' } = {} } = payload;
      console.log(`store has ${LOAD_PAGE_DATA_ERROR}, error is ${error}`);
      commit('setPageLoadError', error);
    }
  },
  modules: {
  },
});
