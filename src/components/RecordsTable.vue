<script>
import { usersRef, friendsRef } from "../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
export default {
  components: {
    NoDataToDisplay,
    LoadingBar,
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
        // User is signed ouvt
        // ...
      }
      return true;
    });
  },
  props: ["dbRef", "puzzleId", "userId", "start_time", "end_time"],
  data() {
    return {
      fully_loaded: false,
      user_records: [],
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
      user: null,
      columns: [
        { key: "user_display_name", sortable: true },
        { key: "user_email", sortable: true },
        { key: "score", sortable: true },
        { key: "time", sortable: true },
      ],
      sortingOrderOptions: [
        { text: "Uzlazno", value: "asc" },
        { text: "Silazno", value: "desc" },
        { text: "Bez sortiranja", value: null },
      ],
    };
  },
  methods: {
    filterExact(source) {
      if (this.filter === "") {
        return true;
      }
      return source?.toString?.() === this.filter;
    },
    format(time) {
      var hours = Math.floor(time / 3600);
      var minutes = Math.floor((time - hours * 3600) / 60);
      var seconds = time - hours * 3600 - minutes * 60;
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (hours < 10) {
        hours = "0" + hours;
      }
      return hours + ":" + minutes + ":" + seconds;
    },
    fetch_users() {
      this.user_records = [];
      let me = this;
      this.$props.dbRef
        .get()
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let idPuzzle = childSnapshot.get("puzzleID");
            let idUser = childSnapshot.get("user");
            let record = new Date(childSnapshot.get("time").seconds * 1000);
            let match = true;
            if (me.$props.puzzleId && idPuzzle != me.$props.puzzleId) {
              match = false;
            }
            if (me.$props.userId && idUser != me.$props.userId) {
              match = false;
            }
            if (
              me.$props.start_time &&
              me.$props.end_time &&
              (record < me.$props.start_time || record > me.$props.end_time)
            ) {
              match = false;
            }
            if (match == true) {
              usersRef.get(idUser).then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let foundUser = childSnapshotUser.id;
                  if (foundUser == idUser) {
                    let user_display_name = "Skriveno";
                    let user_email = "skriveno";
                    let visibility_user = childSnapshotUser.get("visible");
                    if (visibility_user == true || me.user.uid == idUser) {
                      user_display_name = childSnapshotUser.get("displayName");
                      user_email = childSnapshotUser.get("email");
                    }
                    friendsRef
                      .get()
                      .then(function (snapshotFriend) {
                        snapshotFriend.forEach(function (childSnapshotFriend) {
                          let id1 = childSnapshotFriend.get("user1");
                          let id2 = childSnapshotFriend.get("user2");
                          if (
                            (me.user.uid &&
                              id1 == me.user.uid &&
                              id2 == idUser) ||
                            (me.user.uid && id2 == me.user.uid && id1 == idUser)
                          ) {
                            user_display_name =
                              childSnapshotFriend.get("displayName");
                            user_email = childSnapshotFriend.get("email");
                          }
                        });
                      })
                      .then(() => {
                        me.user_records.push({
                          user_display_name: user_display_name,
                          user_email: user_email,
                          score: me.format(childSnapshot.get("score")),
                          time: record,
                        });
                      });
                  }
                });
              });
            }
          });
        })
        .then(() => {
          this.fully_loaded = true;
        });
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
  <LoadingBar v-if="!fully_loaded"></LoadingBar>
  <span v-else>
    <span v-if="user_records.length > 0">
      <div class="myrow">
        <va-input placeholder="Unesite pojam za pretragu" v-model="filter" />
      </div>
      <div class="myrow">
        <va-checkbox
          label="Traži cijelu riječ"
          v-model="useCustomFilteringFn"
        />
      </div>
      <div class="myrow" v-if="this.filtered.length > 1">
        <va-slider
          type="number"
          v-model="perPage"
          :min="1"
          :max="Math.ceil(this.filtered.length)"
          label="Broj pojmova na stranici"
          track-label-visible
        >
        </va-slider>
      </div>
      <va-data-table
        :items="user_records"
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
        <template #header(score)>Rezultat</template>
        <template #header(time)>Datum i vrijeme</template>
        <template #cell(time)="{ source: time }">
          {{ time.toLocaleString() }}
        </template>
        <template #cell(user_email)="{ source: user_email }">
          <router-link
            v-bind:to="{ name: 'profile', params: { email: user_email } }"
          >
            {{ user_email }}
          </router-link>
        </template>
        <template #bodyAppend>
          <tr>
            <td colspan="4" class="table-example--pagination">
              <va-pagination v-model="currentPage" input :pages="pages" />
            </td>
          </tr>
        </template>
      </va-data-table>
    </span>
    <NoDataToDisplay
      v-if="user_records.length <= 0"
      customMessage="Nema rekorda koji zadovoljavaju kriterije"
    >
    </NoDataToDisplay>
  </span>
</template>

<style>
.table-example--pagination {
  text-align: center;
  text-align: -webkit-center;
}
</style>
