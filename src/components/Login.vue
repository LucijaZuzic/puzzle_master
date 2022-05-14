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
        // ...
        document.getElementById("signed_in").visible = true
        document.getElementById("signed_in").hidden = false 
      } else {
        // User is signed out
        // ...
        document.getElementById("signed_in").visible = false
        document.getElementById("signed_in").hidden = true 
        ui.start("#firebaseui-auth-container", uiConfig);
      }
      return true
    });
  }
}
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">
    <h1 class="display-1">Prijava</h1>
    <section id="firebaseui-auth-container"></section>      
    <h2 id="signed_in" visible = false hidden = true class="display-2">Već ste prijavljeni</h2>   
  </body>
</template>

<style>

</style>
