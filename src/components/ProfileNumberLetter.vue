<script> 
import { numberLettersRef, numberLettersRecordsRef } from "../firebase_main.js" 
import NumberLetterTable from './NumberLetterTable.vue'
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
      authorNumberLetter: [],
      updaterNumberLetter: [],
      collaboratorNumberLetter: [],
      recordNumberLetter: [],
    }
  },
  components: {
    NumberLetterTable,
    NoDataToDisplay
  },
  created() {
    this.fetch_numberLetters()
  },
  methods: {
        fetch_numberLetters() {
            this.puzzles = []
            let me = this 
            numberLettersRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {  
                    if (me.user && childSnapshot.get('author') == me.user.uid) {
                        me.authorNumberLetter.push(childSnapshot.id)
                    }
                    if (me.user && childSnapshot.get('updater') == me.user.uid) {
                        me.updaterNumberLetter.push(childSnapshot.id)
                    }
                    if (me.user && childSnapshot.get('permissions').includes(me.user.email)) {
                        me.collaboratorNumberLetter.push(childSnapshot.id)
                    } 
                });
            }) 
            numberLettersRecordsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) { 
                    if (me.user && childSnapshot.get('user') == me.user.uid) {
                        me.recordNumberLetter.push(childSnapshot.get('puzzleID'))
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
            label="Rezultati"
            name="record"
      />
      </template>
  </va-tabs>
  <NumberLetterTable :friend="user" v-if="value=='author' && authorNumberLetter.length > 0" selectMode="single" :puzzleList="authorNumberLetter"></NumberLetterTable> 
  <NoDataToDisplay v-if="value=='author' && authorNumberLetter.length <= 0" customMessage='Korisnik nije autor niti jedne zagonetke tipa "Isti broj - Isto slovo"'></NoDataToDisplay> 
  <NumberLetterTable :friend="user" v-if="value=='updater' && updaterNumberLetter.length > 0" selectMode="single" :puzzleList="updaterNumberLetter"></NumberLetterTable>
  <NoDataToDisplay v-if="value=='updater' && updaterNumberLetter.length <= 0" customMessage='Korisnik nije zadnji ažurirali niti jednu zagonetku tipa "Isti broj - Isto slovo"'></NoDataToDisplay>  
  <NumberLetterTable :friend="user" v-if="value=='collaborator' && collaboratorNumberLetter.length > 0" selectMode="single" :puzzleList="collaboratorNumberLetter"></NumberLetterTable> 
  <NoDataToDisplay v-if="value=='collaborator' && collaboratorNumberLetter.length <= 0" customMessage='Korisnik nije suradnik niti na jednoj zagonetki tipa "Isti broj - Isto slovo"'></NoDataToDisplay>  
  <NumberLetterTable :friend="user" v-if="value=='record' && recordNumberLetter.length > 0" selectMode="single" :puzzleList="recordNumberLetter"></NumberLetterTable>  
  <NoDataToDisplay v-if="value=='record' && recordNumberLetter.length <= 0" customMessage='Korisnik nije Rezultati niti jednu zagonetku tipa "Isti broj - Isto slovo"'></NoDataToDisplay>  
</template>

<style>

</style>
