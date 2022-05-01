<script>  
import { getAuth, onAuthStateChanged } from "firebase/auth"; 

export default {
  data() {
    return {
      user: null, 
    }
  }, 
  methods: {
    signOut() {
        const auth = getAuth()
        auth.signOut()
        this.$router.push('/login')
    }
  },
  mounted() {   
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user
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

  <header>
    <va-navbar color="primary" class="mb-2">
      <template #left>
        <va-navbar-item>
          <router-link to="/searchnonogram">
            Nonogrami
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link to="/searchintegram">
            Integrami 
          </router-link>
        </va-navbar-item>  
        <va-navbar-item>
          <router-link to="/searchnumbercrossword">
            Brojevne križaljke
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/searchcryptogram">
            Kriptogrami
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/searchinitial">
            Inicijalne osmosmjerke
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/searchtournament">
            Turniri
          </router-link>
        </va-navbar-item>
      </template>
      <template v-if="user" #center>
        <va-navbar-item>Dobrodošli {{user.displayName}}</va-navbar-item> 
      </template>
      <template #right>
        <va-navbar-item @click="signOut()" v-if="user != null">
            Odjava
        </va-navbar-item>
        <va-navbar-item v-else>
          <router-link to="/login">
            Prijava
          </router-link>
        </va-navbar-item>
      </template>
    </va-navbar>
  </header> 
    
</template>

<style> 
</style>
