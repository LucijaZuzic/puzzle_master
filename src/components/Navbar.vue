<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      bgcolor: "#ffffff",
      user: null,
    };
  },
  methods: {
    signOut() {
      this.user = null;
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
    <va-affix :offset-top="0" style="background-color: #2C82E0;">
      <va-tabs :color="bgcolor">
        <template #tabs>
          <va-tab>
            <router-link v-if="user != null" :to="'/profile/' + user.email">
              <span style="color:#ffffff">
                <va-icon name="person" />
                <span style="height: 24px">
                  Dobrodošli {{ user.displayName }}
                </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab v-if="user != null">
            <span @click="signOut()" style="color:#ffffff">
              <va-icon name="logout" />
              <span style="height: 24px"> Odjava </span>
            </span>
          </va-tab>
          <va-tab v-else>
            <router-link :to="'/login'">
              <span style="color:#ffffff">
                <va-icon name="login" />
                <span style="height: 24px"> Prijava </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-integram">
              <span style="color:#ffffff">
                <va-icon name="rule_folder" />
                <span style="height: 24px"> Integrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-nonogram">
              <span style="color:#ffffff">
                <va-icon name="draw" />
                <span style="height: 24px"> Nonogrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-number-crossword">
              <span style="color:#ffffff">
                <va-icon name="format_list_numbered" />
                <span style="height: 24px"> Brojevne križaljke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-cryptogram">
              <span style="color:#ffffff">
                <va-icon name="multiple_stop" />
                <span style="height: 24px"> Kriptogrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-number-letter">
              <span style="color:#ffffff">
                <va-icon name="sync_alt" />
                <span style="height: 24px"> Isti broj - Isto slovo </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-initial">
              <span style="color:#ffffff">
                <va-icon name="text_rotation_none" />
                <span style="height: 24px"> Inicijalne osmosmjerke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-eight">
              <span style="color:#ffffff">
                <va-icon name="pattern" />
                <span style="height: 24px"> Osmosmjerke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab>
            <router-link to="/search-tournament">
              <span style="color:#ffffff">
                <va-icon name="workspace_premium" />
                <span style="height: 24px"> Turniri </span>
              </span>
            </router-link>
          </va-tab>
        </template>
      </va-tabs>
    </va-affix>
    <!--<va-navbar color="primary" class="mb-2">
      <template #left>
        <va-navbar-item>
          <va-tab><router-link to="/search-integram">
            Integrami 
          </router-link></va-tab>
        </va-navbar-item>
        <va-navbar-item>
          <va-tab><router-link to="/search-nonogram">
            Nonogrami
          </router-link></va-tab>
        </va-navbar-item>  
        <va-navbar-item>
          <va-tab><router-link to="/search-number-crossword">
            Brojevne križaljke
          </router-link></va-tab>
        </va-navbar-item>
        <va-navbar-item>
          <va-tab><router-link  to="/search-cryptogram">
            Kriptogrami
          </router-link></va-tab>
        </va-navbar-item>
        <va-navbar-item>
          <va-tab><router-link  to="/search-number-letter">
            Isti broj - Isto slovo
          </router-link></va-tab>
        </va-navbar-item>
        <va-navbar-item>
          <va-tab><router-link  to="/search-initial">
            Inicijalne osmosmjerke
          </router-link></va-tab>
        </va-navbar-item>
        <va-navbar-item>
          <va-tab><router-link  to="/search-eight">
            Osmosmjerke
          </router-link></va-tab>
        </va-navbar-item>
        <va-navbar-item>
          <va-tab><router-link  to="/search-tournament">
            Turniri
          </router-link></va-tab>
        </va-navbar-item>
      </template>
      <template v-if="user" #center>
        <va-navbar-item>
          <va-tab><router-link  :to="'/profile/' + user.email">
            Dobrodošli {{user.displayName}}
          </router-link></va-tab>
        </va-navbar-item> 
      </template>
      <template #right>
        <va-navbar-item @click="signOut()" v-if="user != null">
            Odjava
        </va-navbar-item>
        <va-navbar-item v-else>
          <va-tab><router-link to="/login">
            Prijava
          </router-link></va-tab>
        </va-navbar-item>
      </template>
    </va-navbar> -->
  </header>
</template>

<style></style>
