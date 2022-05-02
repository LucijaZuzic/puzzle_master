<script> 
import NoDataToDisplay from './NoDataToDisplay.vue'
import Navbar from './Navbar.vue'   
import { getAuth, onAuthStateChanged } from "firebase/auth"
import ProfileNonogram from './ProfileNonogram.vue'
import { usersRef } from "../main.js"
import ProfileInitial from './ProfileInitial.vue'
import ProfileIntegram from './ProfileIntegram.vue'
import ProfileNumberCrossword from './ProfileNumberCrossword.vue'
import ProfileCryptogram from './ProfileCryptogram.vue'
export default {  
  methods: {
    authenticate() { 
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
          let requestedEmail = this.$route.params.email
          let someUser = {email: '', displayName: '', uid: ''}
          usersRef.get().then(function(snapshotUser) {
            snapshotUser.forEach(function(childSnapshotUser) {  
              let someEmail = childSnapshotUser.get("email")
              if (someEmail == requestedEmail) {
                someUser = {
                  visible: childSnapshotUser.get("visible"), 
                  email: childSnapshotUser.get("email"), 
                  displayName: childSnapshotUser.get("displayName"),
                  uid: childSnapshotUser.id
                }
              }
            });
        }).then(()=>{this.friend = someUser}); 
    },
    setVisibility() {
      usersRef.doc(this.friend.uid).set({
              displayName: this.friend.displayName,
              email: this.friend.email,
              visible: this.friend.visible
      }, { merge: true }).then(()=>{this.$refs.changed.show()})
    }
  },
  created() { 
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go()
      }
    )
  },
  mounted() {  
    this.authenticate()
  }, 
  data() {
    return { 
      user: {email: '', displayName: '', uid: ''},
      friend: {visible: true, email: '', displayName: '', uid: ''},
      value: 'integram'
    }
  },
  components: {
    Navbar,
    ProfileNonogram,
    ProfileInitial,
    ProfileIntegram,
    ProfileNumberCrossword,
    ProfileCryptogram,
    NoDataToDisplay 
  } 
}
</script>

<template> 
    <Navbar></Navbar> 
    <body class="mybody">
      <span v-if="friend.email != '' || friend.displayName != '' || friend.uid != ''">
        <span v-if="user.email != friend.email">
          <h1 class="display-1">Profil korisnika {{friend.displayName}} ({{friend.email}})</h1> 
        </span>
        <span v-else>
          <h1 class="display-1">Moj profil - {{friend.displayName}} ({{friend.email}})</h1>  
          <div class = "myrow">
            <va-switch v-model="friend.visible" true-inner-label="Javno" false-inner-label="Privatno" />
            <va-button @click="setVisibility()">Promjeni vidljivost profila</va-button>  
          </div>
        </span>
        <span v-if="user.email == friend.email || friend.visible">
          <va-tabs v-model="value" vertical>
              <template #tabs> 
              <va-tab
                  label="Integrami"
                  name="integram"
              />
              <va-tab
                  label="Nonogrami"
                  name="nonogram"
              />
              <va-tab
                  label="Brojevne križaljke"
                  name="numberCrossword"
              />
              <va-tab
                  label="Kriptogrami"
                  name="cryptogram"
              />
              <va-tab
                  label="Inicijalne osmosmjerke"
                  name="initial"
              />
              </template>
          </va-tabs>
          <ProfileIntegram :friend="friend" v-if="value=='integram'"></ProfileIntegram>
          <ProfileNonogram :friend="friend" v-if="value=='nonogram'"></ProfileNonogram>
          <ProfileNumberCrossword :friend="friend" v-if="value=='numberCrossword'"></ProfileNumberCrossword>
          <ProfileCryptogram :friend="friend" v-if="value=='cryptogram'"></ProfileCryptogram>
          <ProfileInitial :friend="friend" v-if="value=='initial'"></ProfileInitial>
        </span>
        <span v-else>
          <NoDataToDisplay customMessage="Profil korisnika je postavljen kao privatan"></NoDataToDisplay> 
        </span>
      </span>
      <span v-else>
        <NoDataToDisplay customMessage="Ne postoji korisnik s navedenom email adresom"></NoDataToDisplay> 
      </span>
  </body>
  <va-modal ref="changed" hide-default-actions message="Uspješno ste izmjenili vidljivost profila." stateful />
</template>

<style>

</style>
