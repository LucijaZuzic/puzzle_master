<script>
import { nonogramsRef, nonogramsRecordsRef } from "../firebase_main.js";
import NonogramTable from "./NonogramTable.vue";
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
      authorNonogram: [],
      updaterNonogram: [],
      collaboratorNonogram: [],
      recordNonogram: [],
    };
  },
  components: {
    NonogramTable,
    NoDataToDisplay,
  },
  created() {
    this.fetch_nonograms();
  },
  methods: {
    fetch_nonograms() {
      this.puzzles = [];
      let me = this;
      nonogramsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("author") == me.user.uid) {
            me.authorNonogram.push(childSnapshot.id);
          }
          if (me.user && childSnapshot.get("updater") == me.user.uid) {
            me.updaterNonogram.push(childSnapshot.id);
          }
          if (
            me.user &&
            childSnapshot.get("permissions").includes(me.user.email)
          ) {
            me.collaboratorNonogram.push(childSnapshot.id);
          }
        });
      });
      nonogramsRecordsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("user") == me.user.uid) {
            me.recordNonogram.push(childSnapshot.get("puzzleID"));
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
  <NonogramTable
    :friend="user"
    v-if="value == 'author' && authorNonogram.length > 0"
    selectMode="single"
    :puzzleList="authorNonogram"
  >
  </NonogramTable>
  <NoDataToDisplay
    v-if="value == 'author' && authorNonogram.length <= 0"
    customMessage="Korisnik nije autor niti jednog nonograma"
  >
  </NoDataToDisplay>
  <NonogramTable
    :friend="user"
    v-if="value == 'updater' && updaterNonogram.length > 0"
    selectMode="single"
    :puzzleList="updaterNonogram"
  >
  </NonogramTable>
  <NoDataToDisplay
    v-if="value == 'updater' && updaterNonogram.length <= 0"
    customMessage="Korisnik nije zadnji ažurirali niti jedan nonogram"
  >
  </NoDataToDisplay>
  <NonogramTable
    :friend="user"
    v-if="value == 'collaborator' && collaboratorNonogram.length > 0"
    selectMode="single"
    :puzzleList="collaboratorNonogram"
  >
  </NonogramTable>
  <NoDataToDisplay
    v-if="value == 'collaborator' && collaboratorNonogram.length <= 0"
    customMessage="Korisnik nije suradnik niti na jednom nonogramu"
  >
  </NoDataToDisplay>
  <NonogramTable
    :friend="user"
    v-if="value == 'record' && recordNonogram.length > 0"
    selectMode="single"
    :puzzleList="recordNonogram"
  >
  </NonogramTable>
  <NoDataToDisplay
    v-if="value == 'record' && recordNonogram.length <= 0"
    customMessage="Korisnik nije Rezultati niti jedan nonogram"
  >
  </NoDataToDisplay>
</template>

<style></style>
