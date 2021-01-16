<template>
  <main class="md-layout md-alignment-center">
    <div class="md-layout-item md-large-size-33 md-small-size-100">
      <h1>Signup</h1>
      <div>
        <div v-if="this.error" class="error-box">
          {{ this.error }}
        </div>
        <md-field>
          <label>GMail address you want to use</label>
          <md-input type="text" v-model="user.email" />
        </md-field>
        <md-field>
          <label>First Name</label>
          <md-input type="text" v-model="user.firstName" />
        </md-field>
        <md-field>
          <label>Last Name</label>
          <md-input type="text" v-model="user.lastName" />
        </md-field>
        <md-button @click="handleSignup" class="md-raised md-primary">Signup</md-button>
      </div>
    </div>
  </main>
</template>

<script>
import CONSTANTS from '../../../lib/constants';
import { buildFetchJsonOrRedirect } from '../utils';

const {
  UI_CONSTANTS: {
    ACTION_TYPES: {
      GO_TO_LOGIN
    }
  }
} = CONSTANTS;

export default {
  name: 'Signup',
  computed: {
    userJobListings() {
      return this.$store.state.userJobListings;
    }
  },
  data: function() {
    return {
      error: null,
      user: { email: '', lastName: '', firstName: '' }
    };
  },
  methods: {
    handleSignup() {
      const onJson = (statusCode, ok, json) => {
        console.log('Login\'s onJson');
        if (!ok) {
          console.log(json.error);
          this.error = json.error;
          // TODO - send error message to store so we can display message in UI
        }

        if (json.email && json.message) {
          console.log(json.message);
          this.$store.dispatch({ type: GO_TO_LOGIN, message: json.message });
        }
      };

      const fetchOptions = {
        url: 'http://localhost:3000/api/user/new',
        method: 'POST',
        body: JSON.stringify({
          email: this.user.email,
          firstName: this.user.firstName,
          lastName: this.user.lastName
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        onJson
      };

      this.fetchJsonOrRedirect(fetchOptions);
    },
    fetchJsonOrRedirect(fetchOptions) {
      const builtFunction = buildFetchJsonOrRedirect(this.$store.dispatch);
      return builtFunction(fetchOptions);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .error-box {
    color: red;
  }
</style>
