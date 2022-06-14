<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  usersRef,
  friendsRef,
  friendRequestsRef,
} from "../../firebase_main.js";
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
import MyCounter from "./MyCounter.vue";
export default {
  components: {
    NoDataToDisplay,
    LoadingBar,
    MyCounter,
  },
  mounted() {
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
  },
  data() {
    return {
      user: null,
      fully_loaded: false,
      friends: [],
      status: [],
      selectedItemsEmitted: [],
      new_item: "",
      new_item_tag: "",
      filterBy: "",
      new_item_exact: false,
      filter: "",
      useCustomFilteringFn: false,
      filters: [],
      filtered: [],
      columns: [],
      sortBy: "score",
      sortingOrder: "asc",
      perPage: 1,
      currentPage: 1,
      columns: [
        {
          key: "user_display_name",
          sortable: true,
          classes: "data_table_overflow",
        },
        { key: "user_email", sortable: true, classes: "data_table_overflow" },
        { key: "user_id", sortable: false, classes: "data_table_overflow" },
      ],
      sortingOrderOptions: [
        { text: "Uzlazno", value: "asc" },
        { text: "Silazno", value: "desc" },
        { text: "Bez sortiranja", value: null },
      ],
    };
  },
  methods: {
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
    filterExact(source) {
      if (this.filter === "") {
        return true;
      }
      return source?.toString?.() === this.filter;
    },
    check_status(user_id) {
      this.friends = [];
      let me = this;
    },
    fetch_users() {
      this.friends = [];
      this.status = [];
      let my_friends = [];
      this.status = [];
      let me = this;
      friendsRef
        .get()
        .then(function (snapshotFriend) {
          snapshotFriend.forEach(function (childSnapshotFriend) {
            let id1 = childSnapshotFriend.get("user1");
            let id2 = childSnapshotFriend.get("user2");
            if (me.user && id1 == me.user.uid) {
              if (idUser == id2) {
                my_friends.push(id2);
              }
            }
            if (me.user && id2 == me.user.uid) {
              if (idUser == id1) {
                my_friends.push(id1);
              }
            }
          });
        })
        .then(() => {
          usersRef.get().then(function (snapshotUser) {
            snapshotUser.forEach(function (childSnapshotUser) {
              let user_display_name = childSnapshotUser.get("displayName");
              let user_email = childSnapshotUser.get("email");
              let user_id = childSnapshotUser.id;
              let visibility = childSnapshotUser.get("visible");
              if (!me.user) {
                if (visibility) {
                  me.friends.push({
                    user_display_name: user_display_name,
                    user_email: user_email,
                    user_id: user_id,
                  });
                  me.status.push({
                    user_id: user_id,
                    status: "not_logged_in",
                  });
                }
              } else {
                if (
                  my_friends.includes(user_id) &&
                  !(me.user && me.user.uid == user_id)
                ) {
                  me.friends.push({
                    user_display_name: user_display_name,
                    user_email: user_email,
                    user_id: user_id,
                  });
                  me.status.push({ user_id: user_id, status: "friends" });
                }
                if (
                  !my_friends.includes(user_id) &&
                  visibility &&
                  !(me.user && me.user.uid == user_id)
                ) {
                  let found_request = "not_sent";
                  friendRequestsRef
                    .get()
                    .then(function (snapshotFriendRequest) {
                      snapshotFriendRequest.forEach(function (
                        childSnapshotFriendRequest
                      ) {
                        let sender = childSnapshotFriendRequest.get("sender");
                        let receiver =
                          childSnapshotFriendRequest.get("receiver");
                        if (
                          me.user &&
                          receiver == me.user.uid &&
                          sender == user_id
                        ) {
                          found_request = "sent";
                        }
                        if (
                          me.user &&
                          sender == me.user.uid &&
                          receiver == user_id
                        ) {
                          found_request = "sent";
                        }
                      });
                    })
                    .then(() => {
                      me.friends.push({
                        user_display_name: user_display_name,
                        user_email: user_email,
                        user_id: user_id,
                      });
                      me.status.push({
                        user_id: user_id,
                        status: found_request,
                      });
                    });
                }
              }
            });
          });
        })
        .then(() => {
          this.filtered = this.friends; this.perPage = 1;
          this.fully_loaded = true;
        });
    },
    getStatus(user_id) {
      for (let i = 0; i < this.status.length; i++) {
        if (this.status[i]["user_id"] == user_id) {
          return this.status[i]["status"];
        }
      }
      return false;
    },
    sortByOptions() {
      return this.columns.map(({ key }) => key);
    },
  },
  created() {
    this.fetch_users();
  },
  computed: {
    customFilteringFn() {
      return this.useCustomFilteringFn ? this.filterExact : undefined;
    },
    pages() {
      return this.perPage && this.perPage !== 0
        ? Math.ceil(this.filtered.length / this.perPage)
        : this.filtered.length;
    },
  },
};
</script>

<template>
  <body class="my_body">
    <h4 class="display-4">
      <va-icon size="large" name="person_search"></va-icon>
      &nbsp; Pretraži korisnike
    </h4>
    <LoadingBar v-if="!fully_loaded"></LoadingBar>
    <span v-else>
      <span v-if="friends.length > 0">
        <br />
        <div>
          <va-input
            style="display: inline-block"
            placeholder="Unesite pojam za pretragu"
            v-model="filter"
          />
          &nbsp;
          <va-checkbox
            style="display: inline-block"
            label="Traži cijelu riječ"
            v-model="useCustomFilteringFn"
          />
        </div>
        <br />
        <div>
          <div style="display: inline-block">
            <MyCounter
              :min_value="1"
              :max_value="Math.ceil(this.filtered.length)"
              v-bind:value="perPage"
              @input="(n) => (perPage = n)"
              :is_page_size="true"
              :some_text="'Po stranici'"
            >
            </MyCounter>
          </div>
          <div style="display: inline-block; margin-left: 10px">
            <MyCounter
              :min_value="1"
              :max_value="Math.floor(this.filtered.length / perPage)"
              v-bind:value="currentPage"
              @input="(n) => (currentPage = n)"
              :is_page_number="true"
              :some_text="'Stranica'"
            >
            </MyCounter>
          </div>
        </div>
        <br />
        <va-data-table
          :items="friends"
          :filter="filter"
          :columns="columns"
          :hoverable="true"
          :per-page="perPage"
          :current-page="currentPage"
          v-model:sort-by="sortBy"
          v-model:sorting-order="sortingOrder"
          @filtered="filtered = $event.items"
          no-data-filtered-html="Pretraga nije dala rezultate."
          no-data-html="Nema podataka."
          :filter-method="customFilteringFn"
        >
          <template #header(user_display_name)>Korisnik (ime)</template>
          <template #header(user_email)>Korisnik (email)</template>
          <template #header(user_id)>Akcije</template>
          <template #cell(time)="{ source: time }">
            {{ new Date(time).toLocaleString() }}
          </template>
          <template #cell(user_email)="{ source: user_email }">
            <router-link
              v-bind:to="{ name: 'profile', params: { email: user_email } }"
            >
              <va-button outline :rounded="false" style="border: none"
                ><va-icon name="email"></va-icon> &nbsp;
                {{ user_email }}</va-button
              >
            </router-link>
          </template>
          <template #cell(user_id)="{ source: user_id }">
            <va-button
              :disabled="
                getStatus(user_id) == 'not_logged_in' ||
                getStatus(user_id) == 'sent'
              "
              outline
              :rounded="false"
              style="border: none"
            >
              <span
                @click="removeFriend(user.uid, user_id)"
                v-if="getStatus(user_id) == 'friends'"
              >
                <va-icon name="person_remove"> </va-icon>
                &nbsp; Prekini prijateljstvo
              </span>
              <span
                @click="sendFriendRequest(user.uid, user_id)"
                v-if="getStatus(user_id) == 'not_sent'"
              >
                <va-icon name="person_add"> </va-icon>
                &nbsp; Pošalji zahtjev za prijateljstvo
              </span>
              <span v-if="getStatus(user_id) == 'sent'">
                <va-icon name="person_add_disabled"> </va-icon>
                &nbsp; Već je poslan zahtjev za prijateljstvo
              </span>
            </va-button>
          </template>
          <template #bodyAppend>
            <tr>
              <td colspan="4">
                <div style="display: inline-block; margin-top: 10px">
                  <va-pagination v-model="currentPage" input :pages="pages" />
                </div>
              </td>
            </tr>
          </template>
        </va-data-table>
      </span>
      <NoDataToDisplay
        v-if="friends.length <= 0"
        customMessage="Nema korisnika"
      >
      </NoDataToDisplay>
    </span>
  </body>
</template>

<style scoped></style>
