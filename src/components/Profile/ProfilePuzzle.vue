<script>
import NoDataToDisplay from "../Utility/NoDataToDisplay.vue";
import CryptogramTable from "../Table/CryptogramTable.vue";
import NonogramTable from "../Table/NonogramTable.vue";
import InitialTable from "../Table/InitialTable.vue";
import NumberLetterTable from "../Table/NumberLetterTable.vue";
import NumberCrosswordTable from "../Table/NumberCrosswordTable.vue";
import EightTable from "../Table/EightTable.vue";
import IntegramTable from "../Table/IntegramTable.vue";
import { usersRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  props: [
    "friend",
    "dbRef",
    "dbRecordsRef",
    "dbRatingsRef",
    "component_name",
    "text",
    "text_to_get",
  ],
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
  data() {
    return {
      value: "author",
      authorPuzzle: [],
      updaterPuzzle: [],
      collaboratorPuzzle: [],
      recordPuzzle: [],
      ratingPuzzle: [],
      favoritePuzzle: [],
    };
  },
  components: {
    CryptogramTable,
    NonogramTable,
    InitialTable,
    NumberLetterTable,
    NumberCrosswordTable,
    EightTable,
    IntegramTable,
    NoDataToDisplay,
  },
  created() {
    this.fetch_puzzles();
  },
  methods: {
    fetch_puzzles() {
      let me = this;
      usersRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.$props.friend && childSnapshot.id == me.$props.friend.uid) {
            if (childSnapshot.get(me.$props.text_to_get)) {
              me.favoritePuzzle = childSnapshot.get(me.$props.text_to_get);
            }
          }
        });
      });
      this.$props.dbRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (
            me.$props.friend &&
            childSnapshot.get("author") == me.$props.friend.uid
          ) {
            me.authorPuzzle.push(childSnapshot.id);
          }
          if (
            me.$props.friend &&
            childSnapshot.get("updater") == me.$props.friend.uid
          ) {
            me.updaterPuzzle.push(childSnapshot.id);
          }
          if (
            me.$props.friend &&
            childSnapshot.get("permissions").includes(me.$props.friend.email)
          ) {
            me.collaboratorPuzzle.push(childSnapshot.id);
          }
        });
      });
      this.$props.dbRecordsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (
            me.$props.friend &&
            childSnapshot.get("user") == me.$props.friend.uid
          ) {
            me.recordPuzzle.push(childSnapshot.get("puzzleID"));
          }
        });
      });
      this.$props.dbRatingsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (
            me.$props.friend &&
            childSnapshot.get("user") == me.$props.friend.uid
          ) {
            me.ratingPuzzle.push(childSnapshot.get("puzzleID"));
          }
        });
      });
    },
  },
};
</script>

<template>
  <va-tabs v-model="value" style="width: 100%">
    <template #tabs>
      <va-tab name="author"
        ><va-icon name="person"></va-icon>&nbsp; Autor</va-tab
      >
      <va-tab name="updater"
        ><va-icon name="update"></va-icon>&nbsp; Zadnji ažurirao</va-tab
      >
      <va-tab name="collaborator"
        ><va-icon name="shield"></va-icon>&nbsp; Suradnik</va-tab
      >
      <va-tab name="record"
        ><va-icon name="schedule"></va-icon>&nbsp; Rezultati</va-tab
      >
      <va-tab name="rating"><va-icon name="star"></va-icon>&nbsp; Ocjene</va-tab>
      <va-tab name="favorite"
        ><va-icon name="favorite"></va-icon>&nbsp; Spremljeno</va-tab
      >
    </template>
  </va-tabs>
  <component
    :is="component_name"
    :friend="$props.friend"
    v-if="value == 'author' && authorPuzzle.length > 0"
    selectMode="single"
    :puzzleList="authorPuzzle"
  >
  </component>
  <NoDataToDisplay
    v-if="value == 'author' && authorPuzzle.length <= 0"
    :customMessage="'Korisnik nije autor niti jedne zagonetke tipa ' + text"
  >
  </NoDataToDisplay>
  <component
    :is="component_name"
    :friend="$props.friend"
    v-if="value == 'updater' && updaterPuzzle.length > 0"
    selectMode="single"
    :puzzleList="updaterPuzzle"
  >
  </component>
  <NoDataToDisplay
    v-if="value == 'updater' && updaterPuzzle.length <= 0"
    :customMessage="
      'Korisnik nije zadnji ažurirao niti jednu zagonetku tipa ' + text
    "
  >
  </NoDataToDisplay>
  <component
    :is="component_name"
    :friend="$props.friend"
    v-if="value == 'collaborator' && collaboratorPuzzle.length > 0"
    selectMode="single"
    :puzzleList="collaboratorPuzzle"
  >
  </component>
  <NoDataToDisplay
    v-if="value == 'collaborator' && collaboratorPuzzle.length <= 0"
    :customMessage="
      'Korisnik nije suradnik niti na jednoj zagonetci tipa ' + text
    "
  >
  </NoDataToDisplay>
  <component
    :is="component_name"
    :friend="$props.friend"
    v-if="value == 'record' && recordPuzzle.length > 0"
    selectMode="single"
    :puzzleList="recordPuzzle"
  >
  </component>
  <NoDataToDisplay
    v-if="value == 'record' && recordPuzzle.length <= 0"
    :customMessage="'Korisnik nije riješio niti jednu zagonetku tipa ' + text"
  >
  </NoDataToDisplay>
  <component
    :is="component_name"
    :friend="$props.friend"
    v-if="value == 'rating' && ratingPuzzle.length > 0"
    selectMode="single"
    :puzzleList="ratingPuzzle"
  >
  </component>
  <NoDataToDisplay
    v-if="value == 'rating' && ratingPuzzle.length <= 0"
    :customMessage="'Korisnik nije ocijenio niti jednu zagonetku tipa ' + text"
  >
  </NoDataToDisplay>
  <component
    :is="component_name"
    :friend="$props.friend"
    v-if="value == 'favorite' && favoritePuzzle.length > 0"
    selectMode="single"
    :puzzleList="favoritePuzzle"
  >
  </component>
  <NoDataToDisplay
    v-if="value == 'favorite' && favoritePuzzle.length <= 0"
    :customMessage="'Korisnik nije spremio niti jednu zagonetku tipa ' + text"
  >
  </NoDataToDisplay>
</template>

<style scoped></style>
