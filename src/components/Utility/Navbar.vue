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
  <va-affix :offset-top="0" style="background-color: #2C82E0;width: 100%">
    <div style="background-color: #2C82E0;width: 100%">
      <va-icon
        style="background-color: #2C82E0"
        name="menu"
        color="#ffffff"
        @click="visible_menu = !visible_menu"
      />
      &nbsp; 
      <router-link v-if="user != null" :to="'/profile/' + user.email">
        <span style="color: #ffffff">
          <va-icon name="person" />
          <span>
            {{ user.displayName }}
          </span>
        </span>
        &nbsp; 
      </router-link>
      <span v-if="user != null" @click="signOut()" style="color: #ffffff">
        <va-icon name="logout" />
        <span> Odjava </span>
      </span>
      <router-link :to="'/login'" v-else>
        <span style="color: #ffffff">
          <va-icon name="login" />
          <span> Prijava </span>
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
          <va-tab name="cryptogram">
            <router-link to="/search-cryptogram">
              <span style="color: #ffffff">
                <va-icon name="multiple_stop" />
                <span> Kriptogrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="eight">
            <router-link to="/search-eight">
              <span style="color: #ffffff">
                <va-icon name="pattern" />
                <span> Osmosmjerke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="initial">
            <router-link to="/search-initial">
              <span style="color: #ffffff">
                <va-icon name="text_rotation_none" />
                <span> Inicijalne osmosmjerke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="integram">
            <router-link to="/search-integram">
              <span style="color: #ffffff">
                <va-icon name="rule_folder" />
                <span> Integrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="nonogram">
            <router-link to="/search-nonogram">
              <span style="color: #ffffff">
                <va-icon name="draw" />
                <span> Nonogrami </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="crossword">
            <router-link to="/search-number-crossword">
              <span style="color: #ffffff">
                <va-icon name="format_list_numbered" />
                <span> Brojevne križaljke </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="letter">
            <router-link to="/search-number-letter">
              <span style="color: #ffffff">
                <va-icon name="sync_alt" />
                <span> Isti broj - isto slovo </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab name="tournament">
            <router-link to="/search-tournament">
              <span style="color: #ffffff">
                <va-icon name="workspace_premium" />
                <span> Turniri </span>
              </span>
            </router-link>
          </va-tab>
        </template>
      </va-tabs>
    </span>
  </va-affix> 
</template>

<style scoped></style>
