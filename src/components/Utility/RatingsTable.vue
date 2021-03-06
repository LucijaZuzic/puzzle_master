<script>
import { usersRef, friendsRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
  props: ["dbRef", "puzzleId", "userId", "type"],
  data() {
    return {
      user: null,
      fully_loaded: false,
      already_rated: false,
      documentRated: "",
      sum_ratings: 0,
      value: 0,
      comment: "",
      user_ratings: [],
      new_item: "",
      new_item_tag: "",
      filterBy: "",
      new_item_exact: false,
      filter: "",
      useCustomFilteringFn: false,
      filters: [],
      filtered: [],
      columns: [],
      sortBy: "rating",
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
        { key: "rating", sortable: true, classes: "data_table_overflow" },
        { key: "comment", sortable: true, classes: "data_table_overflow" },
        { key: "time", sortable: true, classes: "data_table_overflow" },
      ],
      sortingOrderOptions: [
        { text: "Uzlazno", value: "asc" },
        { text: "Silazno", value: "desc" },
        { text: "Bez sortiranja", value: null },
      ],
      user: null,
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
      this.user_ratings = [];
      let me = this;
      this.$props.dbRef
        .get()
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let idPuzzle = childSnapshot.get("puzzleID");
            let idUser = childSnapshot.get("user");
            let idRating = childSnapshot.id;
            if (
              me.user &&
              me.user.uid == idUser &&
              me.$props.puzzleId &&
              idPuzzle == me.$props.puzzleId
            ) {
              me.already_rated = true;
              me.documentRated = idRating;
            }
            let record = childSnapshot.get("time").seconds * 1000;
            let match = true;
            if (me.$props.puzzleId && idPuzzle != me.$props.puzzleId) {
              match = false;
            }
            if (!me.$props.userId && me.$props.type == "mine") {
              match = false;
            }
            if (
              me.$props.userId &&
              me.$props.type == "mine" &&
              idUser != me.$props.userId
            ) {
              match = false;
            }
            if (match == true) {
              usersRef.get(idUser).then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let foundUser = childSnapshotUser.id;
                  if (foundUser == idUser) {
                    me.sum_ratings += parseFloat(childSnapshot.get("rating"));
                    let user_display_name = "Skriveno";
                    let user_email = "skriveno";
                    let visibility_user = childSnapshotUser.get("visible");
                    if (
                      visibility_user == true ||
                      (me.user && me.user.uid == idUser)
                    ) {
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
                            (me.user && id1 == me.user.uid && id2 == idUser) ||
                            (me.user && id2 == me.user.uid && id1 == idUser)
                          ) {
                            user_display_name =
                              childSnapshotFriend.get("displayName");
                            user_email = childSnapshotFriend.get("email");
                          }
                        });
                      })
                      .then(() => {
                        me.user_ratings.push({
                          user_display_name: user_display_name,
                          user_email: user_email,
                          rating: parseFloat(childSnapshot.get("rating")),
                          comment: childSnapshot.get("comment"),
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
          this.filtered = this.user_ratings; this.perPage = 1;
          this.fully_loaded = true;
        });
    },
    submit() {
      if (this.already_rated == false) {
        let datetime = new Date();
        this.$props.dbRef
          .add({
            puzzleID: this.$props.puzzleId,
            user: this.user.uid,
            rating: this.value,
            comment: this.comment,
            time: datetime,
          })
          .then(() => {
            this.$vaToast.init("Nova ocjena je uspješno spremljena.");
            this.fetch_users();
          });
      } else {
        let datetime = new Date();
        this.$props.dbRef
          .doc(this.documentRated)
          .update({
            puzzleID: this.$props.puzzleId,
            user: this.user.uid,
            rating: this.value,
            comment: this.comment,
            time: datetime,
          })
          .then(() => {
            this.$vaToast.init("Ocjena je uspješno ažurirana.");
            this.fetch_users();
          });
      }
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
    <br v-if="user" />
    <div v-if="user">
      <va-list-item>
        <va-list-item-section avatar>
          <va-chip outline style="border: none">
            <va-icon name="star" size="large"></va-icon>&nbsp;
            {{ value }}
          </va-chip>
        </va-list-item-section>
        <va-list-item-section>
          <va-list-item-label caption>
            <va-rating v-model="value" halves hover size="large" />
          </va-list-item-label>
        </va-list-item-section>
      </va-list-item>
    </div>
    <br v-if="user" />
    <div v-if="user">
      <va-form>
        <va-input
          type="textarea"
          placeholder="Obrazložite ocjenu"
          label="Komentar"
          :rules="[
            (value) => (value && value.length > 0) || 'Unesite komentar.',
          ]"
          immediate-validation
          v-model="comment"
        >
        </va-input>
      </va-form>
    </div>
    <br v-if="user" />
    <div v-if="user">
      <va-button
        outline
        :rounded="false"
        style="border: none"
        :disabled="comment.length < 1"
        @click="submit()"
      >
        <va-icon name="rate_review"></va-icon>&nbsp; Ocjenite</va-button
      >
    </div>
    <br v-if="user_ratings.length > 0" />
    <div v-if="user_ratings.length > 0">
      <va-chip>
        <va-icon name="stars"></va-icon>&nbsp; Ocjena:
        {{ sum_ratings / user_ratings.length }}
      </va-chip>
    </div>
    <br v-if="user_ratings.length > 0" />
    <span v-if="user_ratings.length > 0">
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
        :items="user_ratings"
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
        <template #header(rating)>Ocjena</template>
        <template #header(comment)>Komentar</template>
        <template #header(time)>Datum i vrijeme</template>
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
       
      </va-data-table>
    </span>
    <NoDataToDisplay
      v-if="user_ratings.length <= 0 && $props.type == 'mine'"
      customMessage="Nema ocjena korisnika za odabranu zagonetku"
    >
    </NoDataToDisplay>
    <NoDataToDisplay
      v-if="user_ratings.length <= 0 && $props.type == 'all'"
      customMessage="Nema ocjena za odabranu zagonetku"
    >
    </NoDataToDisplay>
  </span>
</template>

<style scoped></style>
