<script>
import { ui, uiConfig } from '../main.js'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from './Navbar.vue'

export default {
  components: {
    Navbar
  },
  methods: {
        delay(operation, delay) {
            return new Promise(resolve => {
                setTimeout(() => {
                resolve(operation);
                }, delay);
            });
        },
        async new_async(operation, delay) {
            await this.delay(operation, delay);
        }
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User 
        this.$router.push('/')
        // ...
      } else {
        // User is signed out
        // ...
        ui.start("#firebaseui-auth-container", uiConfig);
      }
    });
  }
}
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">
    <section id="firebaseui-auth-container"></section>      
  </body>
</template>

<style>

</style>
