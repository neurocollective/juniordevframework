<template>
  <main>
    <h1>Signup</h1>
    <div class="signup-container">
      <div v-if="this.error" class="error-box">
        {{ this.error }}
      </div>
      <div>
        <label>Gmail account you want to use:</label>
        <input type="text" v-bind:value="this.email" v-on:input="this.handleEmailInput">
      </div>
      <div>
        <label>first name</label>
        <input type="text" v-bind:value="this.firstName" v-on:input="this.handleFirstNameInput">
      </div>
      <div>
        <label>last name</label>
        <input type="text" v-bind:value="lastName" v-on:input="this.handleLastNameInput">
      </div>
      <button @click="handleSignup">Signup</button>
    </div>
  </main>
</template>

<script>
  import { UI_CONSTANTS } from '../lib/constants';
import { buildFetchJsonOrRedirect } from '../utils';

const {
  ACTION_TYPES: {
    GO_TO_LOGIN
  }
} = UI_CONSTANTS;

export default {
  name: 'Signup',
  computed: {
    userJobListings() {
      return this.$store.state.userJobListings;
    }
  },
  data: function() {
    return {
      error: null, email: '', lastName: '', firstName: ''
    };
  },
  methods: {
    handleEmailInput(e) {
      const {
        target: {
          value
        }
      } = e;
      console.log('value', value);
      this.email = value;
    },
    handleFirstNameInput(e) {
      const {
        target: {
          value
        }
      } = e;
      console.log('value', value);
      this.firstName = value;
    },
    handleLastNameInput(e) {
      const {
        target: {
          value
        }
      } = e;
      console.log('value', value);
      this.lastName = value;
    },
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
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName
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
  .todos-container {
  }

  .signup-container {
    border: 1px solid black;
    border-radius: 5px;
    max-width: 50%;
    margin: 5px auto;
    padding: 10px;
/*    display: flex;
    justify-content: center;*/
  }

  .error-box {
    color: red;
  }
</style>
