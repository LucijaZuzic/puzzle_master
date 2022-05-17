<script>
import { eightsRef, eightsRecordsRef } from "../firebase_main.js";
import EightTable from "./EightTable.vue";
import NoDataToDisplay from "./NoDataToDisplay.vue";

import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  props: ["friend"],
  mounted() {
    if (!this.$props.friend) {
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
    } else {
      this.user = this.$props.friend;
    }
  },
  data() {
    return {
      value: "author",
      authorEight: [],
      updaterEight: [],
      collaboratorEight: [],
      recordEight: [],
    };
  },
  components: {
    EightTable,
    NoDataToDisplay,
  },
  created() {
    this.fetch_eights();
  },
  methods: {
    fetch_eights() {
      this.puzzles = [];
      let me = this;
      eightsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("author") == me.user.uid) {
            me.authorEight.push(childSnapshot.id);
          }
          if (me.user && childSnapshot.get("updater") == me.user.uid) {
            me.updaterEight.push(childSnapshot.id);
          }
          if (
            me.user &&
            childSnapshot.get("permissions").includes(me.user.email)
          ) {
            me.collaboratorEight.push(childSnapshot.id);
          }
        });
      });
      eightsRecordsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("user") == me.user.uid) {
            me.recordEight.push(childSnapshot.get("puzzleID"));
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
      <va-tab label="Autor" name="author" />
      <va-tab label="Zadnji ažurirao" name="updater" />
      <va-tab label="Suradnik" name="collaborator" />
      <va-tab label="Rezultati" name="record" />
    </template>
  </va-tabs>
  <EightTable
    :friend="user"
    v-if="value == 'author' && authorEight.length > 0"
    selectMode="single"
    :puzzleList="authorEight"
  >
  </EightTable>
  <NoDataToDisplay
    v-if="value == 'author' && authorEight.length <= 0"
    customMessage="Korisnik nije autor niti jedne osmosmjerke"
  >
  </NoDataToDisplay>
  <EightTable
    :friend="user"
    v-if="value == 'updater' && updaterEight.length > 0"
    selectMode="single"
    :puzzleList="updaterEight"
  >
  </EightTable>
  <NoDataToDisplay
    v-if="value == 'updater' && updaterEight.length <= 0"
    customMessage="Korisnik nije zadnji ažurirali niti jednu osmosmjerku"
  >
  </NoDataToDisplay>
  <EightTable
    :friend="user"
    v-if="value == 'collaborator' && collaboratorEight.length > 0"
    selectMode="single"
    :puzzleList="collaboratorEight"
  >
  </EightTable>
  <NoDataToDisplay
    v-if="value == 'collaborator' && collaboratorEight.length <= 0"
    customMessage="Korisnik nije suradnik niti na jednoj osmosmjerci"
  >
  </NoDataToDisplay>
  <EightTable
    :friend="user"
    v-if="value == 'record' && recordEight.length > 0"
    selectMode="single"
    :puzzleList="recordEight"
  >
  </EightTable>
  <NoDataToDisplay
    v-if="value == 'record' && recordEight.length <= 0"
    customMessage="Korisnik nije riješio niti jednu osmosmjerku"
  >
  </NoDataToDisplay>
</template>

<style></style>
