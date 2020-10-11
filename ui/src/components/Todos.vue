<template>
  <main>
    <h1>Todos</h1>
    <div class="todos-container">
      <div
        v-for="jobListing in this.userJobListings"
        :key="jobListing.job_title + jobListing.location + jobListing.company_name"
        class="todo-container"
      >
        <div><span>Job:</span> {{jobListing.raw_job_title}}</div>
        <div><span>Company:</span> {{jobListing.raw_company_name}}</div>
        <div><span>Location:</span> {{jobListing.raw_location}}</div>
        <div>
          <a v-bind:href="jobListing.apply_url" target="_blank">
            {{jobListing.job_board}}
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Todos',
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
