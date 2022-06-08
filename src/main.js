//import { create-App } from 'vue'
import { createApp } from "vue/dist/vue.esm-bundler.js";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";

import NotFound from "./components/Utility/NotFound.vue";
import SignInSuccess from "./components/Utility/SignInSuccess.vue";
import SearchPuzzle from "./components/Utility/SearchPuzzle.vue";
import Login from "./components/Utility/Login.vue";

import CreateTournament from "./components/Tournament/CreateTournament.vue";
import SearchTournament from "./components/Tournament/TournamentsTable.vue";

import EditCryptogram from "./components/Edit/EditCryptogram.vue";
import SolveCryptogram from "./components/Solve/SolveCryptogram.vue";

import EditEight from "./components/Edit/EditEight.vue";
import SolveEight from "./components/Solve/SolveEight.vue";

import EditInitial from "./components/Edit/EditInitial.vue";
import SolveInitial from "./components/Solve/SolveInitial.vue";

import EditIntegram from "./components/Edit/EditIntegram.vue";
import SolveIntegram from "./components/Solve/SolveIntegram.vue";

import EditNonogram from "./components/Edit/EditNonogram.vue";
import SolveNonogram from "./components/Solve/SolveNonogram.vue";

import EditNumberCrossword from "./components/Edit/EditNumberCrossword.vue";
import SolveNumberCrossword from "./components/Solve/SolveNumberCrossword.vue";

import EditNumberLetter from "./components/Edit/EditNumberLetter.vue";
import SolveNumberLetter from "./components/Solve/SolveNumberLetter.vue";

import FriendProfile from "./components/Profile/FriendProfile.vue";

/*import BootstrapVue3 from "bootstrap-vue-3";

import "bootstrap/dist/css/bootstrap.css"; 
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";*/

import Oruga from "@oruga-ui/oruga-next";
import "@oruga-ui/oruga-next/dist/oruga-full.css";

import { VuesticPlugin } from "vuestic-ui";
import "vuestic-ui/dist/vuestic-ui.css";
// 1. Define route components.
// These can be imported from other files

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  {
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: NotFound,
  },
  {
    path: "/",
    name: "not_entered",
    component: NotFound,
  },
  {
    path: "/sign-in-success",
    name: "sign_in_success",
    component: SignInSuccess,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/create-tournament",
    component: CreateTournament,
    name: "create_tournament",
  },
  {
    path: "/search-tournament",
    component: SearchTournament,
    name: "search_tournament",
  },
  {
    path: "/profile/:email",
    component: FriendProfile,
    name: "profile",
  },
  {
    path: "/create-cryptogram",
    component: EditCryptogram,
    props: { edit: false },
    name: "create_cryptogram",
  },
  {
    path: "/create-eight",
    component: EditEight,
    props: { edit: false },
    name: "create_eight",
  },
  {
    path: "/create-initial",
    component: EditInitial,
    props: { edit: false },
    name: "create_initial",
  },
  {
    path: "/create-integram",
    component: EditIntegram,
    props: { edit: false },
    name: "create_integram",
  },
  {
    path: "/create-nonogram",
    component: EditNonogram,
    props: { edit: false },
    name: "create_nonogram",
  },
  {
    path: "/create-number-crossword",
    component: EditNumberCrossword,
    props: { edit: false },
    name: "create_number_crossword",
  },
  {
    path: "/create-number-letter",
    component: EditNumberLetter,
    props: { edit: false },
    name: "create_number_letter",
  },
  {
    path: "/edit-cryptogram/:id",
    component: EditCryptogram,
    props: { edit: true },
    name: "edit_cryptogram",
  },
  {
    path: "/edit-eight/:id",
    component: EditEight,
    props: { edit: true },
    name: "edit_eight",
  },
  {
    path: "/edit-initial/:id",
    component: EditInitial,
    props: { edit: true },
    name: "edit_initial",
  },
  {
    path: "/edit-integram/:id",
    component: EditIntegram,
    props: { edit: true },
    name: "edit_integram",
  },
  {
    path: "/edit-nonogram/:id",
    component: EditNonogram,
    props: { edit: true },
    name: "edit_nonogram",
  },
  {
    path: "/edit-number-crossword/:id",
    component: EditNumberCrossword,
    props: { edit: true },
    name: "edit_number_crossword",
  },
  {
    path: "/edit-number-letter/:id",
    component: EditNumberLetter,
    props: { edit: true },
    name: "edit_number_letter",
  },
  {
    path: "/search-cryptogram",
    component: SearchPuzzle,
    props: {
      component_name: "CryptogramTable",
      icon: "multiple_stop",
      title: "Kriptogrami",
    },
    name: "search_cryptogram",
  },
  {
    path: "/search-eight",
    component: SearchPuzzle,
    props: {
      component_name: "EightTable",
      icon: "pattern",
      title: "Osmosmjerke",
    },
    name: "search_eight",
  },
  {
    path: "/search-initial",
    component: SearchPuzzle,
    props: {
      component_name: "InitialTable",
      icon: "text_rotation_none",
      title: "Inicijalne osmosmjerke",
    },
    name: "search_initial",
  },
  {
    path: "/search-integram",
    component: SearchPuzzle,
    props: {
      component_name: "IntegramTable",
      icon: "rule_folder",
      title: "Integrami",
    },
    name: "search_integram",
  },
  {
    path: "/search-nonogram",
    component: SearchPuzzle,
    props: {
      component_name: "NonogramTable",
      icon: "draw",
      title: "Nonogrami",
    },
    name: "search_nonogram",
  },
  {
    path: "/search-number-crossword",
    component: SearchPuzzle,
    props: {
      component_name: "NumberCrosswordTable",
      icon: "format_list_numbered",
      title: "Brojevne križaljke",
    },
    name: "search_number_crossword",
  },
  {
    path: "/search-number-letter",
    component: SearchPuzzle,
    props: {
      component_name: "NumberLetterTable",
      icon: "sync_alt",
      title: "Isti broj - isto slovo",
    },
    name: "search_number_letter",
  },
  {
    path: "/solve-cryptogram/:id",
    component: SolveCryptogram,
    name: "solve_cryptogram",
  },
  {
    path: "/solve-eight/:id",
    component: SolveEight,
    name: "solve_eight",
  },
  {
    path: "/solve-initial/:id",
    component: SolveInitial,
    name: "solve_initial",
  },
  {
    path: "/solve-integram/:id",
    component: SolveIntegram,
    name: "solve_integram",
  },
  {
    path: "/solve-nonogram/:id",
    component: SolveNonogram,
    name: "solve_nonogram",
  },
  {
    path: "/solve-number-crossword/:id",
    component: SolveNumberCrossword,
    name: "solve_number_crossword",
  },
  {
    path: "/solve-number-letter/:id",
    component: SolveNumberLetter,
    name: "solve_number_letter",
  },
];

// 3. create- the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

// 5. create- and mount the root instance.
// Make sure to _use_ the router instance to make the
// whole app router-aware.

createApp(App).use(router).use(Oruga).use(VuesticPlugin).mount("#app");
