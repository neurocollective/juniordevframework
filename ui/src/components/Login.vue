<template>
  <main>
    <h1>Login</h1>
    <div class="login-container">
      <div>
        <label>Enter your registered gmail account:</label>
        <input type="text" v-model="email" />
        <button @click="onSubmit">Login</button>
      </div>
    </div>
    <div v-if="this.loginError" class="login-error">
      {{ this.loginError }}
    </div>
    <div>
       <span>No account?</span>
       &nbsp;
       <a @click="goToSignup" href="javascript:void(0);">Sign Up</a>
    </div>
  </main>
</template>

<script>
import { buildFetchJsonOrRedirect } from '../utils';
import { UI_CONSTANTS } from '../lib/constants';

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
  .login-container {

  }
  .login-error {
    color: red;
  }
</style>
