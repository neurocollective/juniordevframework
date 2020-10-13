<template>
  <main>
    <h1>Signup</h1>
    <div class="signup-container">
      <div>
        <label>Gmail account you want to use:</label>
        <input type="text" v-bind="email">
      </div>
      <div>
        <label>first name</label>
        <input type="text" v-bind="firstName">
      </div>
      <div>
        <label>last name</label>
        <input type="text" v-bind="lastName">
      </div>
      <button @click="handleSignup">Signup</button>
    </div>
  </main>
</template>

<script>
import { buildFetchJsonOrRedirect } from '../utils';

export default {
  name: 'Signup',
  computed: {
    userJobListings() {
      return this.$store.state.userJobListings;
    }
  },
  data: function() {
    return { email: '', lastName: '', firstName: '' };
  },
  methods: {
    handleSignup() {
      const onJson = (statusCode, ok, json) => {
        console.log('Login\'s onJson');
        if (!ok) {
          console.log(json.error);
          // TODO - send error message to store so we can display message in UI
        }

        if (json.authorized) {
          console.log('authorized');
          // redirect to home?
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
</style>
