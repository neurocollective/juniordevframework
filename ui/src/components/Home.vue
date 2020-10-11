<template>
  <div>
<!--      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> -->
<!--     <span>
      Home
    </span>
    <md-button class="md-primary" @click="this.handleClick">CLICK</md-button> -->
    Home
<!--     <div>
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
    </div> -->
  </div>
</template>

<script>
  export default {
    name: 'Home',
    // methods: {
    //   // handleClick() {
    //   //   console.log('clicky');
    //   // },
    //   toggleMenu() {
    //     this.$store.dispatch('toggleMenu');
    //   },
    //   goToHome() {
    //     this.$store.dispatch('goHome');
    //   },
    //   goToAccount() {
    //     this.$store.dispatch('goToAccount');
    //   },
    //   goToResults() {
    //     this.$store.dispatch('goToResults');
    //   },
    //   goToToDos() {
    //     this.$store.dispatch('goToToDos');
    //   },
    //   goToContacts() {
    //     this.$store.dispatch('goToContacts');
    //   }
    // },
    // data() {
    //   return {
    //     appName: 'Junior Dev Framework'
    //   };
    // },
    // computed: {
    //   showMenu() {
    //     return this.$store.state.showMenu;
    //   }
    // }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>
