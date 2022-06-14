<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

import icon_default from "../../assets/icons/extension_FILL0_wght400_GRAD0_opsz48.png";
import icon_profile from "../../assets/icons/person_FILL0_wght400_GRAD0_opsz48.png";
import icon_search from "../../assets/icons/person_search_FILL0_wght400_GRAD0_opsz48.png";
import icon_tournament from "../../assets/icons/workspace_premium_FILL0_wght400_GRAD0_opsz48.png";

import icon_cryptogram from "../../assets/icons/multiple_stop_FILL0_wght400_GRAD0_opsz48.png";
import icon_eight from "../../assets/icons/pattern_FILL0_wght400_GRAD0_opsz48.png";
import icon_initial from "../../assets/icons/text_rotation_none_FILL0_wght400_GRAD0_opsz48.png";
import icon_integram from "../../assets/icons/rule_folder_FILL0_wght400_GRAD0_opsz48.png";
import icon_nonogram from "../../assets/icons/draw_FILL0_wght400_GRAD0_opsz48.png";
import icon_number_crossword from "../../assets/icons/format_list_numbered_FILL0_wght400_GRAD0_opsz48.png";
import icon_number_letter from "../../assets/icons/sync_alt_FILL0_wght400_GRAD0_opsz48.png";

export default {
  data() {
    return {
      name_to_icon: {
        profile: icon_profile,
        tournament: icon_tournament,
        cryptogram: icon_cryptogram,
        eight: icon_eight,
        initial: icon_initial,
        integram: icon_integram,
        nonogram: icon_nonogram,
        crossword: icon_number_crossword,
        letter: icon_number_letter,
        search: icon_search,
        other: icon_default,
      },
      name_to_title: {
        not_found: "Nije pronađeno",
        not_entered: "Nije pronađeno",
        sign_in_success: "Uspješna prijava",
        login: "Prijava",
        create_tournament: "Novi turnir",
        search_tournament: "Turniri",
        profile: "Profil",
        user_search: "Pretraži korisnike",

        create_cryptogram: "Stvori kriptogram",
        create_eight: "Stvori osmosmjerku",
        create_initial: "Stvori inicijalnu osmosmjerku",
        create_integram: "Stvori integram",
        create_nonogram: "Stvori nonogram",
        create_number_crossword: "Stvori brojevnu križaljku",
        create_number_letter: "Stvori zagonetku tipa Isti broj - isto slovo",

        edit_cryptogram: "Uredi kriptogram",
        edit_eight: "Uredi osmosmjerku",
        edit_initial: "Uredi inicijalnu osmosmjerku",
        edit_integram: "Uredi integram",
        edit_nonogram: "Uredi nonogram",
        edit_number_crossword: "Uredi brojevnu križaljku",
        edit_number_letter: "Uredi zagonetku tipa Isti broj - isto slovo",

        search_cryptogram: "Kriptogrami",
        search_eight: "Osmosmjerke",
        search_initial: "Inicijalne osmosmjerke",
        search_integram: "Integrami",
        search_nonogram: "Nonogrami",
        search_number_crossword: "Brojevne križaljke",
        search_number_letter: "Isti broj - isto slovo",

        solve_cryptogram: "Igraj kriptogram",
        solve_eight: "Igraj osmosmjerku",
        solve_initial: "Igraj inicijalnu osmosmjerku",
        solve_integram: "Igraj integram",
        solve_nonogram: "Igraj nonogram",
        solve_number_crossword: "Igraj brojevnu križaljku",
        solve_number_letter: "Igraj zagonetku tipa Isti broj - isto slovo",
      },
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
        document.title = this.name_to_title[this.$route.name];
        const link = document.querySelector("[rel='icon']");
        link.setAttribute("href", this.name_to_icon[this.selected_destination]);
        if (this.name_to_icon[this.selected_destination] == undefined) {
          link.setAttribute("href", this.name_to_icon["other"]);
        }
        if (
          this.$route.name == "profile" &&
          this.user &&
          this.$route.params.email == this.user.email
        ) {
          document.title = "Moj profil";
          this.selected_destination = "my_profile";
        }
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
    <div style="background-color: #2c82e0; text-align: start">
      <va-tabs :color="bgcolor" v-model="selected_destination">
        <template #tabs>
          <va-tab name="my_profile" :disabled="user == null">
            <router-link :to="'/profile/' + user.email" v-if="user != null">
              <span style="color: #ffffff">
                <va-icon name="person" />
                <span>
                  {{ user.displayName }}
                </span>
              </span>
              &nbsp;
            </router-link>
          </va-tab>
          <va-tab name="login">
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
          </va-tab>
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
          <va-tab name="search">
            <router-link to="/user-search">
              <span style="color: #ffffff">
                <va-icon name="person_search" />
                <span> Pretraži korisnike </span>
              </span>
            </router-link>
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
    </div>
  </va-affix>
</template>

<style scoped>
.navbar-container {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  min-height: 100%;
  max-height: 80vh;
  display: inline-block;
  position: absolute;
  left: 0;
  background-color: #1e70c8;
  overflow-y: scroll;
  overflow-x: scroll;
}
</style>
