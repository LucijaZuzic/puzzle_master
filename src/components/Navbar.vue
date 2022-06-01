<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      selected_destination: null,
      bgcolor: "#ffffff",
      user: null,
      visible_menu: false,
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
  created() {
    this.$watch(
      () => this.$route.name,
      (toParams, previousParams) => {
        this.selected_destination =
          this.$route.name.split("_")[this.$route.name.split("_").length - 1];
        this.visible_menu = false;
      }
    );
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
  <va-affix :offset-top="0" style="background-color: #2c82e0; width: 100%">
    <div style="background-color: #2c82e0; width: 100%">
      <va-icon
        style="background-color: #2c82e0"
        name="menu"
        color="#ffffff"
        @click="visible_menu = !visible_menu"
      />
      &nbsp;
      <router-link v-if="user != null" :to="'/profile/' + user.email">
        <span style="color: #ffffff">
          <va-icon name="person" />
          <span style="height: 24px">
            {{ user.displayName }}
          </span>
        </span>
        &nbsp;
      </router-link>
      <span v-if="user != null" @click="signOut()" style="color: #ffffff">
        <va-icon name="logout" />
        <span style="height: 24px"> Odjava </span>
      </span>
      <router-link :to="'/login'" v-else>
        <span style="color: #ffffff">
          <va-icon name="login" />
          <span style="height: 24px"> Prijava </span>
        </span>
      </router-link>
    </div>
    <span
      v-if="visible_menu"
      style="
        height: 1000px;
        display: inline-block;
        position: absolute;
        left: 0;
        background-color: #1e70c8;
      "
      ><va-tabs
        vertical
        :color="bgcolor"
        v-model="selected_destination"
        style="background-color: #1e70c8"
      >
        <template #tabs>
          <va-tab name="integram">
            <router-link to="/search-integram">
              <span style="color: #ffffff">
                <va-icon name="rule_folder" />
                <span style="height: 24px"> Integrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="nonogram">
            <router-link to="/search-nonogram">
              <span style="color: #ffffff">
                <va-icon name="draw" />
                <span style="height: 24px"> Nonogrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="crossword">
            <router-link to="/search-number-crossword">
              <span style="color: #ffffff">
                <va-icon name="format_list_numbered" />
                <span style="height: 24px"> Brojevne križaljke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="cryptogram">
            <router-link to="/search-cryptogram">
              <span style="color: #ffffff">
                <va-icon name="multiple_stop" />
                <span style="height: 24px"> Kriptogrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="letter">
            <router-link to="/search-number-letter">
              <span style="color: #ffffff">
                <va-icon name="sync_alt" />
                <span style="height: 24px"> Isti broj - isto slovo </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="initial">
            <router-link to="/search-initial">
              <span style="color: #ffffff">
                <va-icon name="text_rotation_none" />
                <span style="height: 24px"> Inicijalne osmosmjerke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="eight">
            <router-link to="/search-eight">
              <span style="color: #ffffff">
                <va-icon name="pattern" />
                <span style="height: 24px"> Osmosmjerke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="tournament">
            <router-link to="/search-tournament">
              <span style="color: #ffffff">
                <va-icon name="workspace_premium" />
                <span style="height: 24px"> Turniri </span>
              </span>
            </router-link>
          </va-tab>
        </template>
      </va-tabs>
    </span>
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
            Isti broj - isto slovo
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
</template>

<style scoped></style>
