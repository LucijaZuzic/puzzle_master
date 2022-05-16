 
<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initialsRef } from "../firebase_main.js"
import { initialsRecordsRef, initialsRatingsRef } from "../firebase_main.js"
import RecordsTable from "./RecordsTable.vue";
import RatingsTable from "./RatingsTable.vue";
import { usersRef, friendsRef } from "../firebase_main.js"
import { projectStorage } from "../firebase_main.js"
import { ref, listAll, deleteObject, getMetadata } from "firebase/storage";
import LoadingBar from "./LoadingBar.vue";

export default {
  emits: ["selectedInitials"],
  props: ["friend", "puzzleList", "selectMode", "start_time", "end_time"],
  components: {
    RecordsTable,
    RatingsTable,
    LoadingBar
  },
  mounted() {
    if (!this.$props.friend) {
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
    } else {
      this.user = this.$props.friend;
    }
  },
  data() {
    return {
      fully_loaded: false,
      value: "all",
      user: null,
      initialsRecordsRef: initialsRecordsRef,
      initialsRatingsRef: initialsRatingsRef,
      puzzles: [],
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
      sortBy: "time_created",
      sortingOrder: "desc",
      perPage: 10,
      currentPage: 1,
      columns: [
        { key: "rows", sortable: true },
        { key: "columns", sortable: true },
        { key: "rating", sortable: true },
        { key: "title", sortable: true },
        { key: "description", sortable: true },
        { key: "source", sortable: true },
        { key: "is_public", sortable: true },
        { key: "author_display_name", sortable: true },
        { key: "author_email", sortable: true },
        { key: "time_created", sortable: true },
        { key: "updater_display_name", sortable: true },
        { key: "updater_email", sortable: true },
        { key: "last_updated", sortable: true },
        { key: "id", sortable: false },
        { key: "deletePermission", sortable: false },
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
      friendRequestsRef.add({
        sender: me,
        receiver: other,
      });
    },
    filterExact(source) {
      if (this.filter === "") {
        return true;
      }
      return source?.toString?.() === this.filter;
    },
    string_to_array(array_string) {
      if (!array_string) {
        return [];
      }
      if (array_string[1] == "[") {
        let array = array_string
          .substring(2, array_string.length - 2)
          .split("],[");
        for (let i = 0; i < array.length; i++) {
          array[i] = array[i].split(",");
          for (let j = 0; j < array[i].length; j++) {
            array[i][j] = parseInt(array[i][j]);
          }
        }
        return array;
      } else {
        let array = array_string
          .substring(1, array_string.length - 1)
          .split(",");
        return array;
      }
    },
    fetch_puzzles() {
      this.puzzles = [];
      let me = this;
      let funct_ref = this.string_to_array;
      initialsRef.get().then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          let inList = true;
          if (me.$props.puzzleList) {
            inList = false;
            for (let i = 0; i < me.$props.puzzleList.length; i++) {
              if (me.$props.puzzleList[i] == childSnapshot.id) {
                inList = true;
                break;
              }
            }
          }
          if (inList == true) {
            let sum_ratings = 0;
            let num_ratings = 0;
            initialsRatingsRef
              .get()
              .then(function (snapshotRating) {
                snapshotRating.forEach(function (childSnapshotRating) {
                  let idPuzzle = childSnapshotRating.get("puzzleID");
                  let match = true;
                  if (idPuzzle != childSnapshot.id) {
                    match = false;
                  }
                  if (match == true) {
                    sum_ratings += parseFloat(
                      childSnapshotRating.get("rating")
                    );
                    num_ratings += 1;
                  }
                });
              })
              .then(() => {
                if (num_ratings == 0) {
                  num_ratings = 1;
                }
                let solution = funct_ref(childSnapshot.get("solution"));
                usersRef
                  .get(childSnapshot.get("author"))
                  .then(function (snapshotAuthor) {
                    snapshotAuthor.forEach(function (childSnapshotAuthor) {
                      let idAuthor = childSnapshotAuthor.id;
                      if (idAuthor == childSnapshot.get("author")) {
                        let author_display_name = "Skriveno";
                        let author_email = "skriveno";
                        let visibility_author =
                          childSnapshotAuthor.get("visible");
                        if (
                          visibility_author == true ||
                          me.user.uid == idAuthor
                        ) {
                          author_display_name =
                            childSnapshotAuthor.get("displayName");
                          author_email = childSnapshotAuthor.get("email");
                        }
                        friendsRef
                          .get()
                          .then(function (snapshotUserAuthor) {
                            snapshotUserAuthor.forEach(function (
                              childSnapshotUserAuthor
                            ) {
                              let id1 = childSnapshotUserAuthor.get("user1");
                              let id2 = childSnapshotUserAuthor.get("user2");
                              if (
                                (id1 == me.user.uid && id2 == idAuthor) ||
                                (id2 == me.user.uid && id1 == idAuthor)
                              ) {
                                author_display_name =
                                  childSnapshotAuthor.get("displayName");
                                author_email = childSnapshotAuthor.get("email");
                              }
                            });
                          })
                          .then(() => {
                            usersRef
                              .get(childSnapshot.get("updater"))
                              .then(function (snapshotUpdater) {
                                snapshotUpdater.forEach(function (
                                  childSnapshotUpdater
                                ) {
                                  let idUpdater = childSnapshotUpdater.id;
                                  if (
                                    idUpdater == childSnapshot.get("updater")
                                  ) {
                                    let updater_display_name = "Skriveno";
                                    let updater_email = "skriveno";
                                    let visibility_updater =
                                      childSnapshotUpdater.get("visible");
                                    if (
                                      visibility_updater == true ||
                                      me.user.uid == idUpdater
                                    ) {
                                      updater_display_name =
                                        childSnapshotUpdater.get("displayName");
                                      updater_email =
                                        childSnapshotUpdater.get("email");
                                    }
                                    friendsRef
                                      .get()
                                      .then(function (snapshotUserUpdater) {
                                        snapshotUserUpdater.forEach(function (
                                          childSnapshotUserUpdater
                                        ) {
                                          let id1 =
                                            childSnapshotUserUpdater.get(
                                              "user1"
                                            );
                                          let id2 =
                                            childSnapshotUserUpdater.get(
                                              "user2"
                                            );
                                          if (
                                            (id1 == me.user.uid &&
                                              id2 == idUpdater) ||
                                            (id2 == me.user.uid &&
                                              id1 == idUpdater)
                                          ) {
                                            updater_display_name =
                                              childSnapshotUpdater.get(
                                                "displayName"
                                              );
                                            updater_email =
                                              childSnapshotUpdater.get(
                                                "email"
                                              );
                                          }
                                        });
                                      })
                                      .then(() => {
                                        let newDeletePermission = {
                                          granted: false,
                                          id: childSnapshot.id,
                                        };
                                        if (me.user) {
                                          newDeletePermission = {
                                            granted:
                                              childSnapshotAuthor.id ==
                                              me.user.uid,
                                            id: childSnapshot.id,
                                          };
                                        }
                                        me.puzzles.push({
                                          rows: solution.length,
                                          columns: solution[0].length,
                                          rating: sum_ratings / num_ratings,
                                          title: childSnapshot.get("title"),
                                          description:
                                            childSnapshot.get("description"),
                                          source: childSnapshot.get("source"),
                                          is_public:
                                            childSnapshot.get("is_public"),
                                          author_display_name:
                                            author_display_name,
                                          author_email: author_email,
                                          time_created: new Date(
                                            childSnapshot.get("time_created")
                                              .seconds * 1000
                                          ),
                                          updater_display_name:
                                            updater_display_name,
                                          updater_email: updater_email,
                                          last_updated: new Date(
                                            childSnapshot.get("last_updated")
                                              .seconds * 1000
                                          ),
                                          id: childSnapshot.id,
                                          deletePermission: newDeletePermission,
                                        });
                                      });
                                  }
                                });
                              });
                          });
                      }
                    });
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
    deletePuzzle(id) {
      initialsRef
        .doc(id)
        .delete()
        .then(() => {
          this.fetch_puzzles();
          this.$forceUpdate();
        })
        .then(() => {
          initialsRatingsRef
            .get()
            .then(function (snapshotRating) {
              snapshotRating.forEach(function (childSnapshotRating) {
                let idPuzzle = childSnapshotRating.get("puzzleID");
                let idRating = childSnapshotRating.id;
                if (idPuzzle == id) {
                  initialsRatingsRef
                    .doc(idRating)
                    .delete()
                    .then(() => {
                      //console.log("Document successfully deleted!");
                    })
                    .catch((error) => {
                      //console.error("Error removing document: ", error);
                    });
                }
              });
            })
            .then(() => {
              initialsRecordsRef.get().then(function (snapshotRecord) {
                snapshotRecord.forEach(function (childSnapshotRecord) {
                  let idPuzzle = childSnapshotRecord.get("puzzleID");
                  let idRecord = childSnapshotRecord.id;
                  if (idPuzzle == id) {
                    initialsRecordsRef
                      .doc(idRecord)
                      .delete()
                      .then(() => {
                        //console.log("Document successfully deleted!");
                      })
                      .catch((error) => {
                        //console.error("Error removing document: ", error);
                      });
                  }
                });
              });
            });
        })
        .then(() => {
          // Create a reference under which you want to list
          const listRef = ref(projectStorage, "inital/");
          // Find all the prefixes and items.
          listAll(listRef)
            .then((res) => {
              res.prefixes.forEach((folderRef) => {
                // All the prefixes under listRef.
                // You may call listAll() recursively on them.
              });
              res.items.forEach((itemRef) => {
                // All the items under listRef.
                // Get metadata properties
                getMetadata(itemRef)
                  .then((metadata) => {
                    // Metadata now contains the metadata for 'images/forest.jpg'
                    if (metadata.name.toString().includes(id)) {
                      deleteObject(itemRef)
                        .then(() => {
                          // File deleted successfully
                        })
                        .catch((error) => {
                          // Uh-oh, an error occurred!
                        });
                    }
                  })
                  .catch((error) => {
                    // Uh-oh, an error occurred!
                  });
              });
            })
            .catch((error) => {
              // Uh-oh, an error occurred!
            });
        })
        .catch((error) => {
          // Uh-oh, an error occurred!
        });
    },
  },
  created() {
    this.fetch_puzzles();
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
      label="Broj pojmova"
      class="flex mb-2 md6"
      v-model="perPage"
      :min="1"
      :max="Math.ceil(this.filtered.length)"
      type="number"
    />
  </div>
  <va-data-table
    :items="puzzles"
    :filter="filter"
    :columns="columns"
    :hoverable="true"
    :per-page="perPage"
    selectable="selectable"
    :select-mode="selectMode"
    @selectionChange="
      selectedItemsEmitted = $event.currentSelectedItems;
      $emit('selectedInitials', selectedItemsEmitted);
    "
    :current-page="currentPage"
    v-model:sort-by="sortBy"
    v-model:sorting-order="sortingOrder"
    @filtered="filtered = $event.items"
    no-data-filtered-html="Pretraga nije dala rezultate."
    no-data-html="Nema podataka."
    :filter-method="customFilteringFn"
  >
    <template #header(id)>Akcije</template>
    <template #header(rows)>Broj redaka</template>
    <template #header(columns)>Broj stupaca</template>
    <template #header(rating)>Ocjena</template>
    <template #header(title)>Naslov zagonetke</template>
    <template #header(description)>Opis zagonetke</template>
    <template #header(author_display_name)>Autor (ime)</template>
    <template #header(author_email)>Autor (email)</template>
    <template #header(updater_display_name)>Zadnji ažurirao (ime)</template>
    <template #header(updater_email)>Zadnji ažurirao (email)</template>
    <template #header(is_public)>Dozvola uređivanja</template>
    <template #header(source)>Izvor zagonetke</template>
    <template #header(time_created)>Vrijeme kreiranja</template>
    <template #header(last_updated)>Vrijeme zadnje izmjene</template>
    <template #header(deletePermission)>Izbriši</template>
    <template #cell(time_created)="{ source: time_created }">
      {{ time_created.toLocaleString() }}
    </template>
    <template #cell(last_updated)="{ source: last_updated }">
      {{ last_updated.toLocaleString() }}
    </template>
    <template #cell(author_email)="{ source: author_email }">
      <router-link
        v-bind:to="{ name: 'profile', params: { email: author_email } }"
      >
        {{ author_email }}
      </router-link>
    </template>
    <template #cell(updater_email)="{ source: updater_email }">
      <router-link
        v-bind:to="{ name: 'profile', params: { email: updater_email } }"
      >
        {{ updater_email }}
      </router-link>
    </template>
    <template #cell(id)="{ source: id }">
      <router-link v-bind:to="{ name: 'edit_initial', params: { id: id } }">
        <va-icon name="mode_edit" />
      </router-link>
      <router-link v-bind:to="{ name: 'solve_initial', params: { id: id } }">
        <va-icon name="play_arrow" />
      </router-link>
    </template>
    <template #cell(deletePermission)="{ source: deletePermission }">
      <va-icon
        v-if="deletePermission.granted == true"
        @click="deletePuzzle(deletePermission.id)"
        name="delete"
      />
    </template>
    <template #cell(is_public)="{ source: is_public }"
      ><span v-if="is_public">Svi</span
      ><span v-else>Samo suradnici</span></template
    >
    <template #bodyAppend>
      <tr>
        <td colspan="15" style="text-align: left">
          <router-link to="/create-initial">
            <va-icon color="primary" class="mr-4" name="add_circle" /> Nova
            zagonetka
          </router-link>
        </td>
      </tr>
      <tr>
        <td colspan="15" class="table-example--pagination">
          <va-pagination v-model="currentPage" input :pages="pages" />
        </td>
      </tr>
    </template>
  </va-data-table>
  <div class="myrow" v-if="!start_time && !end_time && selectMode == 'single'">
    <va-tabs
      v-if="selectedItemsEmitted.length > 0"
      v-model="value"
      style="width: 100%"
    >
      <template #tabs>
        <va-tab label="Svi rezultati" name="all" />
        <va-tab label="Rezultati korisnika" name="mine" />
        <va-tab label="Ocjena" name="rate" />
      </template>
    </va-tabs>
    <span v-for="item in selectedItemsEmitted" :key="item.id">
      <RatingsTable
        v-if="value == 'rate'"
        :dbRef="initialsRatingsRef"
        :puzzleId="selectedItemsEmitted[0].id"
        :userId="user.uid"
      ></RatingsTable>
      <RecordsTable
        v-if="value == 'all'"
        :dbRef="initialsRecordsRef"
        :puzzleId="selectedItemsEmitted[0].id"
      ></RecordsTable>
      <RecordsTable
        v-if="user && value == 'mine'"
        :dbRef="initialsRecordsRef"
        :puzzleId="selectedItemsEmitted[0].id"
        :userId="user.uid"
      ></RecordsTable>
    </span>
  </div>
  <div class="myrow" v-if="start_time && end_time && selectMode == 'single'">
    <va-tabs
      v-if="selectedItemsEmitted.length > 0"
      v-model="value"
      style="width: 100%"
    >
      <template #tabs>
        <va-tab label="Svi rezultati" name="all" />
        <va-tab label="Rezultati korisnika" name="mine" />
        <va-tab label="Ocjena" name="rate" />
      </template>
    </va-tabs>
    <span v-for="item in selectedItemsEmitted" :key="item.id">
      <RatingsTable
        v-if="value == 'rate'"
        :dbRef="initialsRatingsRef"
        :puzzleId="selectedItemsEmitted[0].id"
        :userId="user.uid"
      ></RatingsTable>
      <RecordsTable
        v-if="value == 'all'"
        :dbRef="initialsRecordsRef"
        :puzzleId="selectedItemsEmitted[0].id"
        :start_time="start_time"
        :end_time="end_time"
      ></RecordsTable>
      <RecordsTable
        v-if="user && value == 'mine'"
        :dbRef="initialsRecordsRef"
        :puzzleId="selectedItemsEmitted[0].id"
        :userId="user.uid"
        :start_time="start_time"
        :end_time="end_time"
      ></RecordsTable>
    </span>
  </div>
  </span>
</template>

<style>
.table-example--pagination {
  text-align: center;
  text-align: -webkit-center;
}
</style>
