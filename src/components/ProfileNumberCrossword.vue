<script> 
import { numberCrosswordsRef, numberCrosswordsRecordsRef } from '../main' 
import NumberCrosswordTable from './NumberCrosswordTable.vue'
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
          }); 
      } else {
          this.user = this.$props.friend
      }
  }, 
  data() {
    return {
      value: 'author',
      authorNumberCrossword: [],
      updaterNumberCrossword: [],
      collaboratorNumberCrossword: [],
      recordNumberCrossword: [],
    }
  },
  components: {
    NumberCrosswordTable,
    NoDataToDisplay
  },
  created() {
    this.fetch_numberCrosswords()
  },
  methods: {
        fetch_numberCrosswords() {
            this.puzzles = []
            let me = this 
            numberCrosswordsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {  
                    if (me.user && childSnapshot.get('author') == me.user.uid) {
                        me.authorNumberCrossword.push(childSnapshot.id)
                    }
                    if (me.user && childSnapshot.get('updater') == me.user.uid) {
                        me.updaterNumberCrossword.push(childSnapshot.id)
                    }
                    if (me.user && childSnapshot.get('permissions').includes(me.user.email)) {
                        me.collaboratorNumberCrossword.push(childSnapshot.id)
                    } 
                });
            }) 
            numberCrosswordsRecordsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) { 
                    if (me.user && childSnapshot.get('user') == me.user.uid) {
                        me.recordNumberCrossword.push(childSnapshot.get('puzzleID'))
                    }
                });
            }) 
        },
  }
}
</script>

<template>  
  <va-tabs v-model="value" vertical>
      <template #tabs> 
      <va-tab
          label="Brojevne križaljke kojima je korisnik autor"
          name="author"
      />
      <va-tab
          label="Brojevne križaljke koje je korisnik zadnji ažurirao"
          name="updater"
      />
      <va-tab
          label="Brojevne križaljke na kojima je korisnik suradnik"
          name="collaborator"
      />
      <va-tab
          label="Brojevne križaljke koje je korisnik riješio"
          name="record"
      />
      </template>
  </va-tabs>
  <NumberCrosswordTable :friend="user" v-if="value=='author' && authorNumberCrossword.length > 0" selectMode="single" :puzzleList="authorNumberCrossword"></NumberCrosswordTable> 
  <NoDataToDisplay v-if="value=='author' && authorNumberCrossword.length <= 0" customMessage="Korisnik nije autor niti jedne brojevne križaljke"></NoDataToDisplay> 
  <NumberCrosswordTable :friend="user" v-if="value=='updater' && updaterNumberCrossword.length > 0" selectMode="single" :puzzleList="updaterNumberCrossword"></NumberCrosswordTable>
  <NoDataToDisplay v-if="value=='updater' && updaterNumberCrossword.length <= 0" customMessage="Korisnik nije zadnji ažurirali niti jednu brojevnu križaljku"></NoDataToDisplay>  
  <NumberCrosswordTable :friend="user" v-if="value=='collaborator' && collaboratorNumberCrossword.length > 0" selectMode="single" :puzzleList="collaboratorNumberCrossword"></NumberCrosswordTable> 
  <NoDataToDisplay v-if="value=='collaborator' && collaboratorNumberCrossword.length <= 0" customMessage="Korisnik nije suradnik niti na jednoj brojevnoj križaljci"></NoDataToDisplay>  
  <NumberCrosswordTable :friend="user" v-if="value=='record' && recordNumberCrossword.length > 0" selectMode="single" :puzzleList="recordNumberCrossword"></NumberCrosswordTable>  
  <NoDataToDisplay v-if="value=='record' && recordNumberCrossword.length <= 0" customMessage="Korisnik nije riješili niti jednu brojevnu križaljku"></NoDataToDisplay>
</template>

<style>

</style>
