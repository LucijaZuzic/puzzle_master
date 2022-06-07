<script>
import { usersRef, friendRequestsRef, friendsRef } from "../../../firebase_main.js";
import NoDataToDisplay from "../../Utility/NoDataToDisplay.vue";
import LoadingBar from "../../Utility/LoadingBar.vue";
import MyCounter from "../../Utility/MyCounter.vue";
export default {
  components: {
    NoDataToDisplay,
    LoadingBar,
    MyCounter,
  },
  props: ["userId"],
  data() {
    return {
      fully_loaded: false,
      friends: [],
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
        { key: "time", sortable: true, classes: "data_table_overflow" },
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
      this.friends = [];
      let me = this;
      friendRequestsRef
        .get()
        .then(function (snapshotFriend) {
          snapshotFriend.forEach(function (childSnapshotFriend) {
            let sender = childSnapshotFriend.get("sender");
            let receiver = childSnapshotFriend.get("receiver");
            if (sender == me.$props.userId) {
              usersRef.get().then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let idUser = childSnapshotUser.id;
                  let user_display_name = childSnapshotUser.get("displayName");
                  let user_email = childSnapshotUser.get("email");
                  if (idUser == receiver) {
                    me.friends.push({
                      user_display_name: user_display_name,
                      user_email: user_email,
                      time: new Date(
                        childSnapshotFriend.get("time").seconds * 1000
                      ),
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
    <span v-if="friends.length > 0">
      <div class="my_row">
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
      <div class="my_row">
        <MyCounter
          :min_value="1"
          :max_value="Math.ceil(this.filtered.length)"
          v-bind:value="perPage"
          @input="(n) => (perPage = n)" :is_page_number="true"
          :some_text="'Broj rezultata na stranici'"
        ></MyCounter>
      </div>
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
            <td colspan="3">
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
      customMessage="Korisnik nije poslao zahtjev za prijateljstvo"
    >
    </NoDataToDisplay>
  </span>
</template>

<style scoped></style>
