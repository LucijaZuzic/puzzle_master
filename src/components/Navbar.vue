<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      minimized: true,
      user: null,
    };
  },
  methods: {
    signOut() {
      this.user = null
      const auth = getAuth();
      auth.signOut();
      this.$router.push("/login");
    },
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user;
        // ...
      } else {
        // User is signed out
        // ...
      }
      return true;
    });
  },
};
</script>
<template>
  <header>
    <va-sidebar
      :minimized="minimized"
      textColor="dark"
      minimizedWidth="50px"
      position="left"
      style="position: absolute"
    >
      <va-sidebar-item>
        <va-sidebar-item-content>
            <va-icon name="menu" @click="minimized=!minimized" />
            <va-sidebar-item-title style="height: 24px">  
            </va-sidebar-item-title>
        </va-sidebar-item-content>
        <router-link v-if="user != null" :to="'/profile/' + user.email">
          <va-sidebar-item-content >
              <va-icon name="person" />
              <va-sidebar-item-title style="height: 24px">
                Dobrodošli {{ user.displayName }}
              </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link> 
        <va-sidebar-item-content v-if="user != null" @click="signOut()">
          <va-icon name="logout" />
          <va-sidebar-item-title
            style="height: 24px" 
          >
            Odjava
          </va-sidebar-item-title> 
        </va-sidebar-item-content>
        <router-link v-else :to="'/login'">
          <va-sidebar-item-content>
            <va-icon name="login" />
            <va-sidebar-item-title
              style="height: 24px" 
            >
              Prijava
            </va-sidebar-item-title> 
          </va-sidebar-item-content>
        </router-link> 
        <router-link to="/search-integram">
          <va-sidebar-item-content>
            <va-icon name="rule_folder" />
            <va-sidebar-item-title style="height: 24px">
              Integrami
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-nonogram">
          <va-sidebar-item-content>
            <va-icon name="draw" />
            <va-sidebar-item-title style="height: 24px">
              Nonogrami
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-number-crossword">
          <va-sidebar-item-content>
            <va-icon name="format_list_numbered" />
            <va-sidebar-item-title style="height: 24px">
              Brojevne križaljke
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-cryptogram">
          <va-sidebar-item-content>
            <va-icon name="multiple_stop" />
            <va-sidebar-item-title style="height: 24px">
              Kriptogrami
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-number-letter">
          <va-sidebar-item-content>
            <va-icon name="sync_alt" />
            <va-sidebar-item-title style="height: 24px">
              Isti broj - Isto slovo
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-initial">
          <va-sidebar-item-content>
            <va-icon name="text_rotation_none" />
            <va-sidebar-item-title style="height: 24px">
              Inicijalne osmosmjerke
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-eight">
          <va-sidebar-item-content>
            <va-icon name="pattern" />
            <va-sidebar-item-title style="height: 24px">
              Osmosmjerke
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
        <router-link to="/search-tournament">
          <va-sidebar-item-content>
            <va-icon name="workspace_premium" />
            <va-sidebar-item-title style="height: 24px">
              Turniri
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </router-link>
      </va-sidebar-item>
    </va-sidebar>
    <!--<va-navbar color="primary" class="mb-2">
      <template #left>
        <va-navbar-item>
          <router-link to="/search-integram">
            Integrami 
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link to="/search-nonogram">
            Nonogrami
          </router-link>
        </va-navbar-item>  
        <va-navbar-item>
          <router-link to="/search-number-crossword">
            Brojevne križaljke
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/search-cryptogram">
            Kriptogrami
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/search-number-letter">
            Isti broj - Isto slovo
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/search-initial">
            Inicijalne osmosmjerke
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/search-eight">
            Osmosmjerke
          </router-link>
        </va-navbar-item>
        <va-navbar-item>
          <router-link  to="/search-tournament">
            Turniri
          </router-link>
        </va-navbar-item>
      </template>
      <template v-if="user" #center>
        <va-navbar-item>
          <router-link  :to="'/profile/' + user.email">
            Dobrodošli {{user.displayName}}
          </router-link>
        </va-navbar-item> 
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
    </va-navbar> -->
  </header>
</template>

<style></style>
