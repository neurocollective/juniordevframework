<template>
  <div id="app">
    <div v-if="this.pageLoadError">
      There was a loading error!
    </div>
    <div v-if="!this.pageLoadError">
      <md-toolbar>
        <md-button class="md-icon-button" @click="toggleMenu">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">{{this.appName}}</span>
      </md-toolbar>

      <md-drawer :md-active.sync="this.showMenu" md-swipeable>

        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button md-dense" @click="this.toggleMenu">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
        <md-toolbar class="md-transparent" md-elevation="0">
          <span class="md-title">MENU</span>
        </md-toolbar>

        <md-list>
          <md-list-item>
            <md-button class="md-icon-button md-raised" @click="this.goToHome">
              <md-icon>home</md-icon>
            </md-button>
            <span class="md-list-item-text">Home</span>
          </md-list-item>

          <md-list-item>
            <md-button class="md-icon-button md-raised" @click="this.goToContacts">
              <md-icon>contact_mail</md-icon>
            </md-button>
            <span class="md-list-item-text">Contacts</span>
          </md-list-item>

          <md-list-item>
            <md-button class="md-icon-button md-raised" @click="this.goToToDos">
              <md-icon>list</md-icon>
            </md-button>
            <span class="md-list-item-text">To Do</span>
          </md-list-item>

          <md-list-item>
            <md-button class="md-icon-button md-raised" @click="this.goToResults">
              <md-icon>leaderboard</md-icon>
            </md-button>
            <span class="md-list-item-text">Results</span>
          </md-list-item>

          <md-list-item>
            <md-button class="md-icon-button md-raised" @click="this.goToAccount">
              <md-icon>settings</md-icon>
            </md-button>
            <span class="md-list-item-text">Account</span>
          </md-list-item>
        </md-list>
      </md-drawer>
    </div>
    <div v-if="!this.pageLoadError" :is="this.router[this.currentComponent]"></div>
  </div>
</template>

<script>
  import router from './router';
  import CONSTANTS from './lib/constants';
  import { buildFetchJsonOrRedirect } from './utils';
  import { adjustStateToLoadingPath } from './lib';

  const {
    UI_CONSTANTS,
    // MIDDLEWARE: {
    //   REDIRECT_URL
    // },
    // ROUTING: {
    //   SLASH_LOGIN
    // }
  } = CONSTANTS;

  const {
    ACTION_TYPES: {
      LOAD_PAGE_DATA_SUCCESS,
      LOAD_PAGE_DATA_ERROR,
      GO_HOME,
      GO_TO_ACCOUNT,
      GO_TO_RESULTS,
      GO_TO_TODOS,
      GO_TO_CONTACTS,
      TOGGLE_MENU
    },
    APP_NAME
  } = UI_CONSTANTS;

  export default {
    name: 'App',
    created: async function() {
      window.addEventListener('popstate', (event) => {
        console.log('popstate fired, event', event);
        console.log('we don\'t support the back button...YET!');
      });

      adjustStateToLoadingPath(this.$store.dispatch);

      // const onJson = (statusCode, ok, json) => {
      //   const payload = { json, statusCode };
      //   const type = ok ? LOAD_PAGE_DATA_SUCCESS : LOAD_PAGE_DATA_ERROR;
      //   return this.$store.dispatch({ type, payload });
      // };

      const fetchOptions = {
        url: 'http://localhost:3000/api/pageload', // TODO - make this URL dynamic
        onJson: this.onPageLoadJson
      };
      await this.fetchJsonOrRedirect(fetchOptions);
    },
    computed: {
      router() {
        return router;
      },
      currentComponent() {
        return this.$store.state.currentComponent;
      },
      error() {
        return this.$store.state.error;
      },
      showMenu() {
        return this.$store.state.showMenu;
      },
      pageLoadError() {
        return this.$store.state.pageLoadError;
      },
      pageLoadData() {
        return this.$store.state.pageLoadData;
      }
    },
    methods: {
      onPageLoadJson(statusCode, ok, json) {
        const payload = { json, statusCode };
        const type = ok ? LOAD_PAGE_DATA_SUCCESS : LOAD_PAGE_DATA_ERROR;
        return this.$store.dispatch({ type, payload });
      },
      fetchJsonOrRedirect(options) {
        const builtFunction = buildFetchJsonOrRedirect(this.$store.dispatch);
        return builtFunction(options);
      },
      toggleMenu() {
        this.$store.dispatch(TOGGLE_MENU);
      },
      goToHome() {
        this.$store.dispatch(GO_HOME);
        this.$store.dispatch(TOGGLE_MENU);
      },
      goToAccount() {
        this.$store.dispatch(GO_TO_ACCOUNT);
        this.$store.dispatch(TOGGLE_MENU);
      },
      goToResults() {
        this.$store.dispatch(GO_TO_RESULTS);
        this.$store.dispatch(TOGGLE_MENU);
      },
      goToToDos() {
        this.$store.dispatch(GO_TO_TODOS);
        this.$store.dispatch(TOGGLE_MENU);
      },
      goToContacts() {
        this.$store.dispatch(GO_TO_CONTACTS);
        this.$store.dispatch(TOGGLE_MENU);
      },
      // goToLogin() {
      //   this.$store.dispatch('goToLogin');
      // },
      // goToSignup() {
      //   this.$store.dispatch('goToSignup');
      // }
    },
    data() {
      return {
        appName: APP_NAME
      };
    }
  };
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
