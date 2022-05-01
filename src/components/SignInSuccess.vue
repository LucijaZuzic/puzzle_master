<script> 

import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import Navbar from './Navbar.vue'
import { usersRef } from '../main.js'
export default {
  components: {
    Navbar
  },
  mounted() {   
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user 
        usersRef.doc(user.uid).set({
          displayName: user.displayName,
          email: user.email
        }).then(this.$router.push('/'))
        // ...
      } else {
        // User is signed out
        // ... 
      }
    });
  }
}
</script>

<template>  
</template>

<style>

</style>
