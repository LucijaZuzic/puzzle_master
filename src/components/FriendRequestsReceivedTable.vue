 
<script>
import { usersRef, friendRequestsRef, friendsRef } from "../main.js";
import NoDataToDisplay from "./NoDataToDisplay.vue";
export default {
  components: {
    NoDataToDisplay,
  },
  props: ["userId"],
  data() {
    return {
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
      perPage: 10,
      currentPage: 1,
      columns: [
        { key: "user_display_name", sortable: true },
        { key: "user_email", sortable: true },
        { key: "time", sortable: true },
        { key: "user_id", sortable: false },
      ],
      sortingOrderOptions: [
        { text: "Uzlazno", value: "asc" },
        { text: "Silazno", value: "desc" },
        { text: "Bez sortiranja", value: null },
      ],
    };
  },
  methods: {
    removeFriendRequest(me, other) {
      friendRequestsRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let idDoc = childSnapshotUser.id;
            let id1 = childSnapshotUser.get("sender");
            let id2 = childSnapshotUser.get("receiver");
            if ((id1 == me && id2 == other) || (id2 == me && id1 == other)) {
              friendRequestsRef.doc(idDoc).delete();
            }
          });
        })
        .then(() => {
          this.fetch_users();
        });
    },
    acceptFriendRequest(me, other) {
      friendsRef
        .add({
          user1: me,
          user2: other,
        })
        .then(() => {
          this.removeFriendRequest(me, other);
        });
    },
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
        .then(() => {});
    },
    fetch_users() {
      this.friends = [];
      let me = this;
      friendRequestsRef.get().then(function (snapshotFriend) {
        snapshotFriend.forEach(function (childSnapshotFriend) {
          let sender = childSnapshotFriend.get("sender");
          let receiver = childSnapshotFriend.get("receiver");
          if (receiver == me.$props.userId) {
                    console.log(sender + " " + receiver + " " + me.$props.userId)
            usersRef.get().then(function (snapshotUser) {
              snapshotUser.forEach(function (childSnapshotUser) {
                let idUser = childSnapshotUser.id;
                let user_display_name = childSnapshotUser.get("displayName");
                let user_email = childSnapshotUser.get("email");
                if (idUser == sender) {
                    console.log(user_display_name + "rcv")
                  me.friends.push({
                    user_display_name: user_display_name,
                    user_email: user_email,
                    time: new Date(childSnapshotFriend.get("time").seconds * 1000),
                    user_id: sender,
                  });
                }
              });
            });
          }
        });
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
  <span v-if="friends.length > 0">
    <div class="myrow">
      <va-input
        class="flex mb-2 md6"
        style="
          display: inline-block;
          margin-left: 20px;
          margin-top: 20px;
          width: 25%;
        "
        placeholder="Unesite pojam za pretragu"
        v-model="filter"
      />
      <va-checkbox
        style="display: inline-block; margin-left: 20px; margin-top: 20px"
        class="flex mb-2 md6"
        label="Traži cijelu riječ"
        v-model="useCustomFilteringFn"
      />
      <va-input
        style="
          display: inline-block;
          margin-left: 20px;
          margin-top: 20px;
          width: 10%;
        "
        label="Trenutna stranica"
        class="flex mb-2 md6"
        v-model="currentPage"
        :min="1"
        :max="Math.ceil(this.filtered.length / this.perPage)"
        type="number"
      />
      <va-input
        style="
          display: inline-block;
          margin-left: 20px;
          margin-top: 20px;
          width: 10%;
        "
        label="Broj pojmova na stranici"
        class="flex mb-2 md6"
        v-model="perPage"
        :min="1"
        :max="Math.ceil(this.filtered.length)"
        type="number"
      />
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
      <template #header(user_id)>Akcije</template>
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
      <template #cell(user_id)="{ source: user_id }">
        <va-icon name="done" @click="removeFriendRequest($props.userId, user_id)">
        </va-icon>
        <va-icon name="close" @click="acceptFriendRequest($props.userId, user_id)">
        </va-icon>
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
    v-if="friends.length <= 0"
    customMessage="Korisnik nije primio zahtjev za prijateljstvo"
  ></NoDataToDisplay>
</template>

<style>
.table-example--pagination {
  text-align: center;
  text-align: -webkit-center;
}
</style>
