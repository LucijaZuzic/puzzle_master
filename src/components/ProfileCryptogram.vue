<script>
import { cryptogramsRef, cryptogramsRecordsRef } from "../firebase_main.js";
import CryptogramTable from "./CryptogramTable.vue";
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
      authorCryptogram: [],
      updaterCryptogram: [],
      collaboratorCryptogram: [],
      recordCryptogram: [],
    };
  },
  components: {
    CryptogramTable,
    NoDataToDisplay,
  },
  created() {
    this.fetch_cryptograms();
  },
  methods: {
    fetch_cryptograms() {
      this.puzzles = [];
      let me = this;
      cryptogramsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("author") == me.user.uid) {
            me.authorCryptogram.push(childSnapshot.id);
          }
          if (me.user && childSnapshot.get("updater") == me.user.uid) {
            me.updaterCryptogram.push(childSnapshot.id);
          }
          if (
            me.user &&
            childSnapshot.get("permissions").includes(me.user.email)
          ) {
            me.collaboratorCryptogram.push(childSnapshot.id);
          }
        });
      });
      cryptogramsRecordsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("user") == me.user.uid) {
            me.recordCryptogram.push(childSnapshot.get("puzzleID"));
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
  <CryptogramTable
    :friend="user"
    v-if="value == 'author' && authorCryptogram.length > 0"
    selectMode="single"
    :puzzleList="authorCryptogram"
  >
  </CryptogramTable>
  <NoDataToDisplay
    v-if="value == 'author' && authorCryptogram.length <= 0"
    customMessage="Korisnik nije autor niti jednog kriptograma"
  >
  </NoDataToDisplay>
  <CryptogramTable
    :friend="user"
    v-if="value == 'updater' && updaterCryptogram.length > 0"
    selectMode="single"
    :puzzleList="updaterCryptogram"
  >
  </CryptogramTable>
  <NoDataToDisplay
    v-if="value == 'updater' && updaterCryptogram.length <= 0"
    customMessage="Korisnik nije zadnji ažurirali niti jedan kriptogram"
  >
  </NoDataToDisplay>
  <CryptogramTable
    :friend="user"
    v-if="value == 'collaborator' && collaboratorCryptogram.length > 0"
    selectMode="single"
    :puzzleList="collaboratorCryptogram"
  >
  </CryptogramTable>
  <NoDataToDisplay
    v-if="value == 'collaborator' && collaboratorCryptogram.length <= 0"
    customMessage="Korisnik nije suradnik niti na jednom kriptogramu"
  >
  </NoDataToDisplay>
  <CryptogramTable
    :friend="user"
    v-if="value == 'record' && recordCryptogram.length > 0"
    selectMode="single"
    :puzzleList="recordCryptogram"
  >
  </CryptogramTable>
  <NoDataToDisplay
    v-if="value == 'record' && recordCryptogram.length <= 0"
    customMessage="Korisnik nije riješio niti jedan kriptogram"
  >
  </NoDataToDisplay>
</template>

<style scoped></style>
