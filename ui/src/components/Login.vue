<template>
  <main class="md-layout md-alignment-center">
    <div class="md-layout-item md-large-size-33 md-small-size-100">
      <h1>Please Login</h1>
      <md-field :class="this.loginError? 'md-invalid' : ''">
        <label>Enter your registered GMail address</label>
        <md-input v-model="email" type="text"></md-input>
        <span class="md-error">{{ this.loginError }}</span>
      </md-field>
      <div class="md-layout md-alignment-center-center">
        <md-button @click="onSubmit" class="md-layout-item md-raised md-primary">Login</md-button>
        <div class="md-layout-item ">
          <span>No account?</span>
          &nbsp;
          <a @click="goToSignup" href="javascript:void(0);">Sign Up</a>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { buildFetchJsonOrRedirect } from '../utils';
import { UI_CONSTANTS } from '../../../lib/constants';

const {
  ACTION_TYPES: {
    LOGIN_ERROR
  }
} = UI_CONSTANTS;

export default {
  name: 'Login',
  computed: {
    userJobListings() {
      return this.$store.state.userJobListings;
    },
    loginError() {
      return this.$store.state.loginError;
    }
  },
  data: function() {
    return { email: '' };
  },
  methods: {
    // navigateToSignUp() {
    //   this.$store.dispatch('goToSignup');
    // },
    fetchJsonOrRedirect(fetchOptions) {
      const builtFunction = buildFetchJsonOrRedirect(this.$store.dispatch);
      return builtFunction(fetchOptions);
    },
    // goToLogin() {
    //   this.$store.dispatch('goToLogin');
    // },
    goToSignup() {
      this.$store.dispatch('goToSignup');
    },
    onSubmit() {
      // console.log('onSubmit, email is:', this.email);

      const onJson = (statusCode, ok, json) => {
        // console.log('Login\'s onJson');
        if (!ok) {
          // console.log('Login.onJSON error:', json.error);
          const payload = { json };
          this.$store.dispatch({ type: LOGIN_ERROR, payload });
        }

        if (json.authorized) {
          this.$store.dispatch('goToHome');
        }
      };

      const fetchOptions = {
        url: 'http://localhost:3000/api/login',
        method: 'POST',
        body: JSON.stringify({
          email: this.email
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        onJson
      };
      this.fetchJsonOrRedirect(fetchOptions);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .login-error {
    color: red;
  }
</style>
