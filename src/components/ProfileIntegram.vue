<script>
import { integramsRef, integramsRecordsRef } from "../firebase_main.js";
import IntegramTable from "./IntegramTable.vue";
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
      authorIntegram: [],
      updaterIntegram: [],
      collaboratorIntegram: [],
      recordIntegram: [],
    };
  },
  components: {
    IntegramTable,
    NoDataToDisplay,
  },
  created() {
    this.fetch_integrams();
  },
  methods: {
    fetch_integrams() {
      this.puzzles = [];
      let me = this;
      integramsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("author") == me.user.uid) {
            me.authorIntegram.push(childSnapshot.id);
          }
          if (me.user && childSnapshot.get("updater") == me.user.uid) {
            me.updaterIntegram.push(childSnapshot.id);
          }
          if (
            me.user &&
            childSnapshot.get("permissions").includes(me.user.email)
          ) {
            me.collaboratorIntegram.push(childSnapshot.id);
          }
        });
      });
      integramsRecordsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (me.user && childSnapshot.get("user") == me.user.uid) {
            me.recordIntegram.push(childSnapshot.get("puzzleID"));
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
  <IntegramTable
    :friend="user"
    v-if="value == 'author' && authorIntegram.length > 0"
    selectMode="single"
    :puzzleList="authorIntegram"
  >
  </IntegramTable>
  <NoDataToDisplay
    v-if="value == 'author' && authorIntegram.length <= 0"
    customMessage="Korisnik nije autor niti jednog integrama"
  >
  </NoDataToDisplay>
  <IntegramTable
    :friend="user"
    v-if="value == 'updater' && updaterIntegram.length > 0"
    selectMode="single"
    :puzzleList="updaterIntegram"
  >
  </IntegramTable>
  <NoDataToDisplay
    v-if="value == 'updater' && updaterIntegram.length <= 0"
    customMessage="Korisnik nije zadnji ažurirali niti jedan integram"
  >
  </NoDataToDisplay>
  <IntegramTable
    :friend="user"
    v-if="value == 'collaborator' && collaboratorIntegram.length > 0"
    selectMode="single"
    :puzzleList="collaboratorIntegram"
  >
  </IntegramTable>
  <NoDataToDisplay
    v-if="value == 'collaborator' && collaboratorIntegram.length <= 0"
    customMessage="Korisnik nije suradnik niti na jednom integramu"
  >
  </NoDataToDisplay>
  <IntegramTable
    :friend="user"
    v-if="value == 'record' && recordIntegram.length > 0"
    selectMode="single"
    :puzzleList="recordIntegram"
  >
  </IntegramTable>
  <NoDataToDisplay
    v-if="value == 'record' && recordIntegram.length <= 0"
    customMessage="Korisnik nije Rezultati niti jedan integram"
  >
  </NoDataToDisplay>
</template>

<style></style>
