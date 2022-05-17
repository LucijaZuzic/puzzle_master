<script>
import NoDataToDisplay from "./NoDataToDisplay.vue";
import Navbar from "./Navbar.vue";
import { getAuth, OAuthCredential, onAuthStateChanged } from "firebase/auth";
import ProfileNonogram from "./ProfileNonogram.vue";
import { usersRef, friendsRef, friendRequestsRef } from "../firebase_main.js";
import ProfileInitial from "./ProfileInitial.vue";
import ProfileIntegram from "./ProfileIntegram.vue";
import ProfileNumberLetter from "./ProfileNumberLetter.vue";
import ProfileEight from "./ProfileEight.vue";
import ProfileNumberCrossword from "./ProfileNumberCrossword.vue";
import ProfileCryptogram from "./ProfileCryptogram.vue";
import FriendRequestsReceivedTable from "./FriendRequestsReceivedTable.vue";
import FriendRequestsSentTable from "./FriendRequestsSentTable.vue";
import FriendsTable from "./FriendsTable.vue";
import LoadingBar from "./LoadingBar.vue";
export default {
  methods: {
    checkStatus() {
      let my_activity = this;
      let me = null;
      if (this.user) {
        me = this.user.uid;
      }
      let other = this.friend.uid;
      if (me == other) {
        this.areFriends = true;
        this.requestSent = true;
      }
      friendsRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let id1 = childSnapshotUser.get("user1");
            let id2 = childSnapshotUser.get("user2");
            if ((id1 == me && id2 == other) || (id2 == me && id1 == other)) {
              my_activity.areFriends = true;
            }
          });
        })
        .then(() => {
          friendRequestsRef
            .get()
            .then(function (snapshotUser) {
              snapshotUser.forEach(function (childSnapshotUser) {
                let id1 = childSnapshotUser.get("sender");
                let id2 = childSnapshotUser.get("receiver");
                if (
                  (id1 == me && id2 == other) ||
                  (id2 == me && id1 == other)
                ) {
                  my_activity.requestSent = true;
                }
              });
            })
            .then(() => {
              this.fully_loaded = true;
            });
        });
    },
    authenticate() {
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
      let requestedEmail = this.$route.params.email;
      let someUser = { email: "", displayName: "", uid: "" };
      let my_activity = this;
      let me = null;
      if (this.user) {
        me = this.user.uid;
      }
      usersRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let someEmail = childSnapshotUser.get("email");
            if (someEmail == requestedEmail) {
              someUser = {
                visible: childSnapshotUser.get("visible"),
                email: childSnapshotUser.get("email"),
                displayName: childSnapshotUser.get("displayName"),
                uid: childSnapshotUser.id,
              };
            }
          });
        })
        .then(() => {
          my_activity.friend = someUser;
          my_activity.checkStatus();
        });
    },
    sendFriendRequest(me, other) {
      friendRequestsRef
        .add({
          sender: me,
          receiver: other,
          time: new Date(),
        })
        .then(() => {
          this.$forceUpdate();
        });
    },
    removeFriend(me, other) {
      friendsRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let idDoc = childSnapshotUser.id;
            let id1 = childSnapshotUser.get("user1");
            let id2 = childSnapshotUser.get("user2");
            if ((id1 == me && id2 == other) || (id2 == me && id1 == other)) {
              friendsRef.doc(idDoc).delete();
            }
          });
        })
        .then(() => {
          this.$forceUpdate();
        });
    },
    setVisibility() {
      usersRef
        .doc(this.friend.uid)
        .set(
          {
            displayName: this.friend.displayName,
            email: this.friend.email,
            visible: this.friend.visible,
          },
          { merge: true }
        )
        .then(() => {
          this.$vaToast.init("Uspješno ste izmjenili vidljivost profila.");
        });
    },
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go();
      }
    );
  },
  beforeUpdate() {
    this.checkStatus();
  },
  mounted() {
    this.authenticate();
  },
  data() {
    return {
      fully_loaded: false,
      areFriends: false,
      requestSent: false,
      user: { email: "", displayName: "", uid: "" },
      friend: { visible: true, email: "", displayName: "", uid: "" },
      value: "integram",
      friendOption: "friend",
    };
  },
  components: {
    Navbar,
    ProfileNonogram,
    ProfileInitial,
    ProfileIntegram,
    ProfileNumberCrossword,
    ProfileNumberLetter,
    ProfileCryptogram,
    ProfileEight,
    NoDataToDisplay,
    FriendsTable,
    FriendRequestsSentTable,
    FriendRequestsReceivedTable,
    LoadingBar,
  },
};
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="mybody" v-else>
    <span
      v-if="friend.email != '' || friend.displayName != '' || friend.uid != ''"
    >
      <span v-if="user.email != friend.email">
        <div class="myrow">
          <h1 class="display-1">
            Profil korisnika {{ friend.displayName }} ({{ friend.email }})
          </h1>
        </div>
        <div class="myrow">
          <va-icon
            v-if="areFriends"
            @click="removeFriend(user.uid, friend.uid)"
            name="person_remove"
            size="large"
          >
          </va-icon>
          <va-icon
            v-if="!areFriends && !requestSent"
            @click="sendFriendRequest(user.uid, friend.uid)"
            name="person_add"
            size="large"
          >
          </va-icon>
          <va-icon
            v-if="!areFriends && requestSent"
            name="person_add_disabled"
            size="large"
          >
          </va-icon>
        </div>
      </span>
      <span v-else>
        <div class="myrow">
          <h1 class="display-1">
            Moj profil - {{ friend.displayName }} ({{ friend.email }})
          </h1>
        </div>
        <div class="myrow">
          <va-button
            @click="
              friend.visible = !friend.visible;
              $forceUpdate();
            "
            style="margin-left: 10px; margin-top: 10px"
          >
            <span v-if="friend.visible == true">
              <va-icon name="lock_open" />
              &nbsp;Javno</span
            >
            <span v-else><va-icon name="lock" /> &nbsp;Privatno</span>
          </va-button>
          <va-button @click="setVisibility()"
            >Promjeni vidljivost profila</va-button
          >
        </div>
      </span>
      <span v-if="user.email == friend.email || friend.visible || areFriends">
        <va-tabs v-model="value" style="width: 100%">
          <template #tabs>
            <va-tab label="Integrami" name="integram" />
            <va-tab label="Nonogrami" name="nonogram" />
            <va-tab label="Brojevne križaljke" name="numberCrossword" />
            <va-tab label="Kriptogrami" name="cryptogram" />
            <va-tab label="Isti broj - Isto slovo" name="numberLetter" />
            <va-tab label="Inicijalne osmosmjerke" name="initial" />
            <va-tab label="Osmosmjerke" name="eight" />
          </template>
        </va-tabs>
        <ProfileIntegram :friend="friend" v-if="value == 'integram'">
        </ProfileIntegram>
        <ProfileNonogram :friend="friend" v-if="value == 'nonogram'">
        </ProfileNonogram>
        <ProfileNumberCrossword
          :friend="friend"
          v-if="value == 'numberCrossword'"
        >
        </ProfileNumberCrossword>
        <ProfileCryptogram :friend="friend" v-if="value == 'cryptogram'">
        </ProfileCryptogram>
        <ProfileNumberLetter :friend="friend" v-if="value == 'numberLetter'">
        </ProfileNumberLetter>
        <ProfileInitial :friend="friend" v-if="value == 'initial'">
        </ProfileInitial>
        <ProfileEight :friend="friend" v-if="value == 'eight'"></ProfileEight>
        <va-tabs v-model="friendOption" style="width: 100%">
          <template #tabs>
            <va-tab label="Prijatelji" name="friend" />
            <va-tab
              label="Primljeni zahtjevi za prijateljstvo"
              name="received"
              v-if="user.email == friend.email"
            />
            <va-tab
              label="Poslani zahtjevi za prijateljstvo"
              name="sent"
              v-if="user.email == friend.email"
            />
          </template>
        </va-tabs>
        <FriendsTable :userId="friend.uid" v-if="friendOption == 'friend'">
        </FriendsTable>
        <FriendRequestsReceivedTable
          :userId="friend.uid"
          v-if="friendOption == 'received' && user.email == friend.email"
        >
        </FriendRequestsReceivedTable>
        <FriendRequestsSentTable
          :userId="friend.uid"
          v-if="friendOption == 'sent'"
        >
        </FriendRequestsSentTable>
      </span>
      <span v-else>
        <NoDataToDisplay
          customMessage="Profil korisnika je postavljen kao privatan"
        >
        </NoDataToDisplay>
      </span>
    </span>
    <span v-else>
      <NoDataToDisplay
        customMessage="Ne postoji korisnik s navedenom email adresom"
      >
      </NoDataToDisplay>
    </span>
  </body>
</template>

<style></style>
