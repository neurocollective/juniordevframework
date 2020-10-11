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
    <div>
       <span>No account?</span>
       &nbsp;
       <a @click="goToSignup" href="javascript:void(0);">Sign Up</a>
    </div>
  </main>
</template>

<script>
export default {
  name: 'login',
  computed: {
    userJobListings() {
      return this.$store.state.userJobListings;
    }
  },
  data: function() {
    return { email: '' };
  },
  methods: {
    navigateToSignUp() {
      this.$store.dispatch('goToSignup');
    },
    // goToLogin() {
    //   this.$store.dispatch('goToLogin');
    // },
    goToSignup() {
      this.$store.dispatch('goToSignup');
    },
    onSubmit() {
      console.log('onSubmit, email is:', this.email);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .todos-container {
  }

  .todo-container {
    border: 1px solid black;
    border-radius: 5px;
    max-width: 50%;
    margin: 5px auto;
    padding: 10px;
/*    display: flex;
    justify-content: center;*/
  }
</style>
