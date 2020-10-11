<template>
  <main>
    <h1>Signup</h1>
    <div class="signup-container">
    </div>
  </main>
</template>

<script>
export default {
  name: 'Signup',
  computed: {
    userJobListings() {
      return this.$store.state.userJobListings;
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
