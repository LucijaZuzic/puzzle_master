<script> 
import { initialsRef, initialsRecordsRef } from '../main' 
import InitialTable from './InitialTable.vue'
import NoDataToDisplay from './NoDataToDisplay.vue'

import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  props: ["friend"], 
  mounted() {
      if (!this.$props.friend) {
          const auth = getAuth()
          onAuthStateChanged(auth, (user) => {
          if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              this.user = user
              // ...
          } else {
              // User is signed out
              // ... 
          }
          return true
          }); 
      } else {
          this.user = this.$props.friend
      }
  }, 
  data() {
    return {
      value: 'author',
      authorInitial: [],
      updaterInitial: [],
      collaboratorInitial: [],
      recordInitial: [],
    }
  },
  components: {
    InitialTable,
    NoDataToDisplay
  },
  created() {
    this.fetch_initials()
  },
  methods: {
        fetch_initials() {
            this.puzzles = []
            let me = this 
            initialsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {  
                    if (me.user && childSnapshot.get('author') == me.user.uid) {
                        me.authorInitial.push(childSnapshot.id)
                    }
                    if (me.user && childSnapshot.get('updater') == me.user.uid) {
                        me.updaterInitial.push(childSnapshot.id)
                    }
                    if (me.user && childSnapshot.get('permissions').includes(me.user.email)) {
                        me.collaboratorInitial.push(childSnapshot.id)
                    } 
                });
            }) 
            initialsRecordsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) { 
                    if (me.user && childSnapshot.get('user') == me.user.uid) {
                        me.recordInitial.push(childSnapshot.get('puzzleID'))
                    }
                });
            }) 
        },
  }
}
</script>

<template>  
  <va-tabs v-model="value" style="width: 100%;">
      <template #tabs> 
        <va-tab  
            label="Autor"
            name="author"
        />
        <va-tab 
            label="Zadnji ažurirao"
            name="updater"
        />
        <va-tab 
            label="Suradnik"
            name="collaborator"
        />
        <va-tab 
            label="Riješio"
            name="record"
      />
      </template>
  </va-tabs>
  <InitialTable :friend="user" v-if="value=='author' && authorInitial.length > 0" selectMode="single" :puzzleList="authorInitial"></InitialTable> 
  <NoDataToDisplay v-if="value=='author' && authorInitial.length <= 0" customMessage="Korisnik nije autor niti jedne inicijalne osmosmjerke"></NoDataToDisplay> 
  <InitialTable :friend="user" v-if="value=='updater' && updaterInitial.length > 0" selectMode="single" :puzzleList="updaterInitial"></InitialTable>
  <NoDataToDisplay v-if="value=='updater' && updaterInitial.length <= 0" customMessage="Korisnik nije zadnji ažurirali niti jednu inicijalnu osmosmjerku"></NoDataToDisplay>  
  <InitialTable :friend="user" v-if="value=='collaborator' && collaboratorInitial.length > 0" selectMode="single" :puzzleList="collaboratorInitial"></InitialTable> 
  <NoDataToDisplay v-if="value=='collaborator' && collaboratorInitial.length <= 0" customMessage="Korisnik nije suradnik niti na jednoj inicijalnoj osmosmjerci"></NoDataToDisplay>  
  <InitialTable :friend="user" v-if="value=='record' && recordInitial.length > 0" selectMode="single" :puzzleList="recordInitial"></InitialTable>  
  <NoDataToDisplay v-if="value=='record' && recordInitial.length <= 0" customMessage="Korisnik nije riješio niti jednu inicijalnu osmosmjerku"></NoDataToDisplay>  
</template>

<style>

</style>
