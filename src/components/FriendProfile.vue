<script>
import NoDataToDisplay from "./NoDataToDisplay.vue";
import ProfilePuzzle from "./ProfilePuzzle.vue";

import {
  integramsRatingsRef,
  integramsRecordsRef,
  integramsRef,
} from "../firebase_main.js";
import {
  nonogramsRatingsRef,
  nonogramsRecordsRef,
  nonogramsRef,
} from "../firebase_main.js";
import {
  eightsRatingsRef,
  eightsRecordsRef,
  eightsRef,
} from "../firebase_main.js";
import {
  initialsRatingsRef,
  initialsRecordsRef,
  initialsRef,
} from "../firebase_main.js";
import {
  numberCrosswordsRatingsRef,
  numberCrosswordsRecordsRef,
  numberCrosswordsRef,
} from "../firebase_main.js";
import {
  numberLettersRecordsRef,
  numberLettersRatingsRef,
  numberLettersRef,
} from "../firebase_main.js";
import {
  cryptogramsRecordsRef,
  cryptogramsRatingsRef,
  cryptogramsRef,
} from "../firebase_main.js";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { usersRef, friendsRef, friendRequestsRef } from "../firebase_main.js";

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
      integramsRatingsRef: integramsRatingsRef,
      integramsRecordsRef: integramsRecordsRef,
      integramsRef: integramsRef,
      cryptogramsRatingsRef: cryptogramsRatingsRef,
      cryptogramsRecordsRef: cryptogramsRecordsRef,
      cryptogramsRef: cryptogramsRef,
      nonogramsRatingsRef: nonogramsRatingsRef,
      nonogramsRecordsRef: nonogramsRecordsRef,
      nonogramsRef: nonogramsRef,
      numberLettersRatingsRef: numberLettersRatingsRef,
      numberLettersRecordsRef: numberLettersRecordsRef,
      numberLettersRef: numberLettersRef,
      numberCrosswordsRatingsRef: numberCrosswordsRatingsRef,
      numberCrosswordsRecordsRef: numberCrosswordsRecordsRef,
      numberCrosswordsRef: numberCrosswordsRef,
      eightsRatingsRef: eightsRatingsRef,
      eightsRecordsRef: eightsRecordsRef,
      eightsRef: eightsRef,
      initialsRatingsRef: initialsRatingsRef,
      initialsRecordsRef: initialsRecordsRef,
      initialsRef: initialsRef,
      areFriends: false,
      requestSent: false,
      user: { email: "", displayName: "", uid: "" },
      friend: { visible: true, email: "", displayName: "", uid: "" },
      value: "integram",
      friendOption: "friend",
    };
  },
  components: {
    ProfilePuzzle,
    NoDataToDisplay,
    FriendsTable,
    FriendRequestsSentTable,
    FriendRequestsReceivedTable,
    LoadingBar,
  },
};
</script>

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="my_body" v-else>
    <span
      v-if="friend.email != '' || friend.displayName != '' || friend.uid != ''"
    >
      <span v-if="user.email != friend.email">
        <div class="my_row">
          <h4 class="display-4">
            <va-icon name="account_box"></va-icon>&nbsp; Profil korisnika
          </h4>
        </div>
        <div class="my_row">
          <h4 class="display-4">
            <va-icon name="person"></va-icon>&nbsp;
            {{ friend.displayName }}
          </h4>
        </div>
        <div class="my_row">
          <span>
            <va-icon name="email"></va-icon>&nbsp;
            {{ friend.email }}
          </span>
        </div>
        <div class="my_row" v-if="user.uid != ''">
          <va-button>
            <span v-if="areFriends">
              <va-icon
                @click="removeFriend(user.uid, friend.uid)"
                name="person_remove"
                size="large"
              >
              </va-icon>
              &nbsp; Prekini prijateljstvo
            </span>
            <span v-if="!areFriends && !requestSent">
              <va-icon
                @click="sendFriendRequest(user.uid, friend.uid)"
                name="person_add"
                size="large"
              >
              </va-icon>
              &nbsp; Pošalji zahtjev za prijateljstvo
            </span>
            <span v-if="!areFriends && requestSent">
              <va-icon name="person_add_disabled" size="large"> </va-icon>
              &nbsp; Već je poslan zahtjev za prijateljstvo
            </span>
          </va-button>
        </div>
      </span>
      <span v-else>
        <div class="my_row">
          <h4 class="display-4">
            <va-icon name="account_box"></va-icon>&nbsp; Moj profil
          </h4>
        </div>
        <div class="my_row">
          <h4 class="display-4">
            <va-icon name="person"></va-icon>&nbsp;
            {{ friend.displayName }}
          </h4>
        </div>
        <div class="my_row">
          <span>
            <va-icon name="email"></va-icon>&nbsp;
            {{ friend.email }}
          </span>
        </div>
        <div class="my_row">
          <va-button
            @click="
              friend.visible = !friend.visible;
              $forceUpdate();
            "
            style="margin-left: 10px; margin-top: 10px; display: inline-block"
          >
            <span v-if="friend.visible == true">
              <va-icon name="lock_open" />
              &nbsp;Javno</span
            >
            <span v-else><va-icon name="lock" /> &nbsp;Privatno</span>
          </va-button>
          <va-button
            @click="setVisibility()"
            style="margin-left: 10px; margin-top: 10px; display: inline-block"
          >
            <va-icon name="settings"></va-icon>&nbsp; Izmjeni vidljivost profila
          </va-button>
        </div>
      </span>
      <span v-if="user.email == friend.email || friend.visible || areFriends">
        <va-tabs v-model="value" style="width: 100%">
          <template #tabs>
            <va-tab name="integram"
              ><va-icon name="rule_folder"></va-icon>Integrami</va-tab
            >
            <va-tab name="nonogram"
              ><va-icon name="draw"></va-icon>Nonogrami</va-tab
            >
            <va-tab name="numberCrossword"
              ><va-icon name="format_list_numbered"></va-icon>Brojevne
              križaljke</va-tab
            >
            <va-tab name="cryptogram"
              ><va-icon name="multiple_stop"></va-icon>Kriptogrami</va-tab
            >
            <va-tab name="numberLetter"
              ><va-icon name="sync_alt"></va-icon>Isti broj - isto slovo</va-tab
            >
            <va-tab name="initial"
              ><va-icon name="text_rotation_none"></va-icon>Inicijalne
              osmosmjerke</va-tab
            >
            <va-tab name="eight"
              ><va-icon name="pattern"></va-icon>Osmosmjerke</va-tab
            >
          </template>
        </va-tabs>
        <ProfilePuzzle
          component_name="IntegramTable"
          :friend="friend"
          text_to_get="favoriteIntegrams"
          text="integram"
          v-if="value == 'integram'"
          :dbRatingsRef="integramsRatingsRef"
          :dbRecordsRef="integramsRecordsRef"
          :dbRef="integramsRef"
        ></ProfilePuzzle>
        <ProfilePuzzle
          component_name="NonogramTable"
          :friend="friend"
          text_to_get="favoriteNonograms"
          text="nonogram"
          v-if="value == 'nonogram'"
          :dbRatingsRef="nonogramsRatingsRef"
          :dbRecordsRef="nonogramsRecordsRef"
          :dbRef="nonogramsRef"
        ></ProfilePuzzle>
        <ProfilePuzzle
          component_name="NumberCrosswordTable"
          :friend="friend"
          text_to_get="favoriteNumberCrosswords"
          text="brojevna križaljka"
          v-if="value == 'numberCrossword'"
          :dbRatingsRef="numberCrosswordsRatingsRef"
          :dbRecordsRef="numberCrosswordsRecordsRef"
          :dbRef="numberCrosswordsRef"
        ></ProfilePuzzle>
        <ProfilePuzzle
          component_name="CryptogramTable"
          :friend="friend"
          text_to_get="favoriteCryptograms"
          text="kriptogram"
          v-if="value == 'cryptogram'"
          :dbRatingsRef="cryptogramsRatingsRef"
          :dbRecordsRef="cryptogramsRecordsRef"
          :dbRef="cryptogramsRef"
        ></ProfilePuzzle>
        <ProfilePuzzle
          component_name="NumberLetterTable"
          :friend="friend"
          text_to_get="favoriteNumberLetters"
          text="isto broj - isto slovo"
          v-if="value == 'numberLetter'"
          :dbRatingsRef="numberLettersRatingsRef"
          :dbRecordsRef="numberLettersRecordsRef"
          :dbRef="numberLettersRef"
        ></ProfilePuzzle>
        <ProfilePuzzle
          component_name="InitialTable"
          :friend="friend"
          text_to_get="favoriteInitials"
          text="inicijalna osmosjerka"
          v-if="value == 'initial'"
          :dbRatingsRef="initialsRef"
          :dbRecordsRef="initialsRecordsRef"
          :dbRef="initialsRef"
        ></ProfilePuzzle>
        <ProfilePuzzle
          component_name="EightTable"
          :friend="friend"
          text_to_get="favoriteEights"
          text="osmosmjerka"
          v-if="value == 'eight'"
          :dbRatingsRef="eightsRatingsRef"
          :dbRecordsRef="eightsRecordsRef"
          :dbRef="eightsRef"
        ></ProfilePuzzle>
        <va-tabs v-model="friendOption" style="width: 100%">
          <template #tabs>
            <va-tab name="friend"
              ><va-icon name="person_add"></va-icon>&nbsp; Prijatelji</va-tab
            >
            <va-tab name="received"
              ><va-icon name="inbox"></va-icon>&nbsp; Primljeni zahtjevi za
              prijateljstvo</va-tab
            >
            <va-tab name="sent"
              ><va-icon name="outgoing_mail"></va-icon>&nbsp; Poslani zahtjevi
              za prijateljstvo</va-tab
            >
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

<style scoped></style>
