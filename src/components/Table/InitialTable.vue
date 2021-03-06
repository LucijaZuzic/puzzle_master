<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initialsRef } from "../../firebase_main.js";
import { initialsRecordsRef, initialsRatingsRef } from "../../firebase_main.js";
import RecordsTable from "../Utility/RecordsTable.vue";
import RatingsTable from "../Utility/RatingsTable.vue";
import { usersRef, friendsRef } from "../../firebase_main.js";
import { projectStorage } from "../../firebase_main.js";
import { ref, listAll, deleteObject, getMetadata } from "firebase/storage";
import LoadingBar from "../Utility/LoadingBar.vue";
import MyCounter from "../Utility/MyCounter.vue";
import NoDataToDisplay from "../Utility/NoDataToDisplay.vue";
import InitialInfo from "../Info/InitialInfo.vue";

export default {
  emits: ["selectedInitials"],
  props: ["friend", "puzzleList", "selectMode", "start_time", "end_time"],
  components: {
    RecordsTable,
    RatingsTable,
    LoadingBar,
    MyCounter,
    NoDataToDisplay,
    InitialInfo,
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
      favoriteInitials: [],
      fully_loaded: false,
      value: "all",
      user: null,
      initialsRecordsRef: initialsRecordsRef,
      initialsRatingsRef: initialsRatingsRef,
      puzzles: [],
      show_details: false,
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
      perPage: 1,
      currentPage: 1,
      columns: [
        { key: "id", sortable: false, classes: "data_table_overflow" },
        {
          key: "deletePermission",
          sortable: false,
          classes: "data_table_overflow",
        },
        {
          key: "editPermission",
          sortable: false,
          classes: "data_table_overflow",
        },
        {
          key: "favorite",
          sortable: false,
          classes: "data_table_overflow",
        },
        { key: "rows", sortable: true, classes: "data_table_overflow" },
        { key: "columns", sortable: true, classes: "data_table_overflow" },
        { key: "rating", sortable: true, classes: "data_table_overflow" },
        { key: "title", sortable: true, classes: "data_table_overflow" },
        { key: "description", sortable: true, classes: "data_table_overflow" },
        { key: "source", sortable: true, classes: "data_table_overflow" },
        { key: "is_public", sortable: true, classes: "data_table_overflow" },
        {
          key: "author_display_name",
          sortable: true,
          classes: "data_table_overflow",
        },
        { key: "author_email", sortable: true, classes: "data_table_overflow" },
        { key: "time_created", sortable: true, classes: "data_table_overflow" },
        {
          key: "updater_display_name",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "updater_email",
          sortable: true,
          classes: "data_table_overflow",
        },
        { key: "last_updated", sortable: true, classes: "data_table_overflow" },
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
      initialsRef
        .get()
        .then(function (snapshot) {
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
                            (me.user && me.user.uid == idAuthor)
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
                                  (me.user &&
                                    id1 == me.user.uid &&
                                    id2 == idAuthor) ||
                                  (me.user &&
                                    id2 == me.user.uid &&
                                    id1 == idAuthor)
                                ) {
                                  author_display_name =
                                    childSnapshotAuthor.get("displayName");
                                  author_email =
                                    childSnapshotAuthor.get("email");
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
                                        (me.user && me.user.uid == idUpdater)
                                      ) {
                                        updater_display_name =
                                          childSnapshotUpdater.get(
                                            "displayName"
                                          );
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
                                              (me.user.uid &&
                                                id1 == me.user.uid &&
                                                id2 == idUpdater) ||
                                              (me.user.uid &&
                                                id2 == me.user.uid &&
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
                                          let newEditPermission = {
                                            granted: false,
                                            id: childSnapshot.id,
                                          };
                                          if (me.user) {
                                            newEditPermission = {
                                              granted:
                                                childSnapshotAuthor.id ==
                                                  me.user.uid ||
                                                childSnapshot
                                                  .get("permissions")
                                                  .includes(me.user.email),
                                              id: childSnapshot.id,
                                            };
                                          }

                                          if (me.user) {
                                            usersRef
                                              .get()
                                              .then(function (
                                                snapshotCurrentUser
                                              ) {
                                                snapshotCurrentUser.forEach(
                                                  function (
                                                    childSnapshotCurrentUser
                                                  ) {
                                                    if (
                                                      me.user &&
                                                      childSnapshotCurrentUser.id ==
                                                        me.user.uid
                                                    ) {
                                                      if (
                                                        childSnapshotCurrentUser.get(
                                                          "favoriteInitials"
                                                        )
                                                      ) {
                                                        me.favoriteInitials =
                                                          childSnapshotCurrentUser.get(
                                                            "favoriteInitials"
                                                          );
                                                      }
                                                      let favorite = {
                                                        favorite:
                                                          me.favoriteInitials.includes(
                                                            childSnapshot.id
                                                          ),
                                                        id: childSnapshot.id,
                                                      };
                                                      me.puzzles.push({
                                                        rows: solution.length,
                                                        columns:
                                                          solution[0].length,
                                                        rating:
                                                          sum_ratings /
                                                          num_ratings,
                                                        title:
                                                          childSnapshot.get(
                                                            "title"
                                                          ),
                                                        description:
                                                          childSnapshot.get(
                                                            "description"
                                                          ),
                                                        source:
                                                          childSnapshot.get(
                                                            "source"
                                                          ),
                                                        is_public:
                                                          childSnapshot.get(
                                                            "is_public"
                                                          ),
                                                        author_display_name:
                                                          author_display_name,
                                                        author_email:
                                                          author_email,
                                                        time_created:
                                                          childSnapshot.get(
                                                            "time_created"
                                                          ).seconds * 1000,
                                                        updater_display_name:
                                                          updater_display_name,
                                                        updater_email:
                                                          updater_email,
                                                        last_updated:
                                                          childSnapshot.get(
                                                            "last_updated"
                                                          ).seconds * 1000,
                                                        id: childSnapshot.id,
                                                        deletePermission:
                                                          newDeletePermission,
                                                        editPermission:
                                                          newEditPermission,
                                                        favorite: favorite,
                                                      });
                                                    }
                                                  }
                                                );
                                              });
                                          } else {
                                            me.puzzles.push({
                                              rows: solution.length,
                                              columns: solution[0].length,
                                              rating: sum_ratings / num_ratings,
                                              title: childSnapshot.get("title"),
                                              description:
                                                childSnapshot.get(
                                                  "description"
                                                ),
                                              source:
                                                childSnapshot.get("source"),
                                              is_public:
                                                childSnapshot.get("is_public"),
                                              author_display_name:
                                                author_display_name,
                                              author_email: author_email,
                                              time_created: new Date(
                                                childSnapshot.get(
                                                  "time_created"
                                                ).seconds * 1000
                                              ),
                                              updater_display_name:
                                                updater_display_name,
                                              updater_email: updater_email,
                                              last_updated: new Date(
                                                childSnapshot.get(
                                                  "last_updated"
                                                ).seconds * 1000
                                              ),
                                              id: childSnapshot.id,
                                              deletePermission:
                                                newDeletePermission,
                                              editPermission: newEditPermission,
                                              favorite: {
                                                favorite: false,
                                                id: childSnapshot.id,
                                              },
                                            });
                                          }
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
          this.filtered = this.puzzles; this.perPage = 1;
          this.fully_loaded = true;
        });
    },
    sortByOptions() {
      return this.columns.map(({ key }) => key);
    },
    add_favorite(id) {
      this.$vaToast.init("Zagonetka je dodana u spremljene zagonetke.");
      this.favoriteInitials.push(id);
      usersRef
        .doc(this.user.uid)
        .set(
          {
            favoriteInitials: this.favoriteInitials,
          },
          { merge: true }
        )
        .then(() => {
          this.fetch_puzzles();
          this.$forceUpdate();
        });
    },
    remove_favorite(id) {
      this.$vaToast.init("Zagonetka je uklonjena iz spremljenih zagonetki.");
      let index = this.favoriteInitials.indexOf(id);
      if (index > -1) {
        this.favoriteInitials.splice(index, 1);
      }
      usersRef
        .doc(this.user.uid)
        .set(
          {
            favoriteInitials: this.favoriteInitials,
          },
          { merge: true }
        )
        .then(() => {
          this.fetch_puzzles();
          this.$forceUpdate();
        });
    },
    deletePuzzle(id) {
      this.id_to_delete = id;
      this.$refs.delete_modal.show();
    },
    deletePuzzleConfirmed() {
      let id = this.id_to_delete;
      initialsRef
        .doc(id)
        .delete()
        .then(() => {
          this.$vaToast.init("Zagonetka je uspješno izbrisana.");
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
  <br />
  <va-divider></va-divider>
  <va-tabs>
    <template #tabs>
      <va-tab>
        <va-icon name="info" @click="$refs.description.show()"></va-icon>
        &nbsp; Pomoć
      </va-tab>
      <va-tab>
        <router-link
          to="/create-initial"
          style="float: right; overflow-wrap: anywhere"
        >
          <va-icon name="add_circle" />&nbsp; Nova zagonetka
        </router-link>
      </va-tab>
      <va-tab :name="10000" disabled></va-tab>
    </template>
  </va-tabs>
  <va-divider></va-divider>
  <br />
  <LoadingBar v-if="!fully_loaded"></LoadingBar>
  <span v-else>
    <span v-if="puzzles.length > 0">
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
        <template #header(id)>Igraj</template>
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
        <template #header(editPermission)>Uredi</template>
        <template #header(favorite)>Spremi</template>
        <template #cell(time_created)="{ source: time_created }">
          {{ new Date(time_created).toLocaleString() }}
        </template>
        <template #cell(last_updated)="{ source: last_updated }">
          {{ new Date(last_updated).toLocaleString() }}
        </template>
        <template #cell(author_email)="{ source: author_email }">
          <router-link
            v-bind:to="{ name: 'profile', params: { email: author_email } }"
          >
            <va-button outline :rounded="false" style="border: none"
              ><va-icon name="email"></va-icon> &nbsp;
              {{ author_email }}</va-button
            >
          </router-link>
        </template>
        <template #cell(updater_email)="{ source: updater_email }">
          <router-link
            v-bind:to="{ name: 'profile', params: { email: updater_email } }"
          >
            <va-button outline :rounded="false" style="border: none"
              ><va-icon name="email"></va-icon> &nbsp;
              {{ updater_email }}</va-button
            >
          </router-link>
        </template>
        <template #cell(id)="{ source: id }">
          <router-link
            v-bind:to="{ name: 'solve_initial', params: { id: id } }"
          >
            <va-button outline :rounded="false" style="border: none"
              ><va-icon name="play_arrow"
            /></va-button>
          </router-link>
        </template>
        <template #cell(deletePermission)="{ source: deletePermission }">
          <va-button
            v-if="deletePermission.granted == true"
            @click="deletePuzzle(deletePermission.id)"
            outline
            :rounded="false"
            style="border: none"
            ><va-icon name="delete"
          /></va-button>
        </template>
        <template #cell(editPermission)="{ source: editPermission }">
          <router-link
            v-if="editPermission.granted == true"
            v-bind:to="{
              name: 'edit_initial',
              params: { id: editPermission.id },
            }"
          >
            <va-button outline :rounded="false" style="border: none"
              ><va-icon name="mode_edit"
            /></va-button>
          </router-link>
        </template>
        <template #cell(favorite)="{ source: favorite }">
          <va-button outline :rounded="false" style="border: none"
            ><va-icon
              v-if="favorite.favorite != true && user"
              name="favorite"
              @click="add_favorite(favorite.id)" />
            <va-icon
              v-if="favorite.favorite == true && user"
              name="heart_broken"
              @click="remove_favorite(favorite.id)"
          /></va-button>
        </template>
        <template #cell(is_public)="{ source: is_public }">
          <span v-if="is_public">Svi</span>
          <span v-else>Samo suradnici</span>
        </template>
      </va-data-table>
    </span>
    <NoDataToDisplay v-else customMessage="Nema zagonetki"></NoDataToDisplay>
    <br v-if="!start_time && !end_time && selectMode == 'single'" />
    <div v-if="!start_time && !end_time && selectMode == 'single'">
      <va-card
        v-if="selectedItemsEmitted.length > 0"
        color="background"
        style="padding: 10px"
      >
        <h6
          @click="show_details = !show_details"
          class="display-6"
          style="text-align: start"
        >
          &nbsp; Podaci o zagonetci
          <va-icon v-if="!show_details" name="expand_more"></va-icon>
          <va-icon v-if="show_details" name="expand_less"></va-icon>
        </h6>
      </va-card>
      <div class="my_row" v-if="show_details">
        <va-tabs v-if="selectedItemsEmitted.length > 0" v-model="value">
          <template #tabs>
            <va-tab name="all"
              ><va-icon name="browse_gallery" />&nbsp; Svi rezultati</va-tab
            >
            <va-tab name="mine"
              ><va-icon name="schedule" />&nbsp; Rezultati korisnika</va-tab
            >
            <va-tab name="rate"
              ><va-icon name="hotel_class" />&nbsp; Sve ocjene</va-tab
            >
            <va-tab name="rate_mine"
              ><va-icon name="star" />&nbsp; Ocjena korisnika</va-tab
            >
            <va-tab :name="10000" disabled></va-tab>
          </template>
        </va-tabs>
        <br v-if="selectedItemsEmitted.length > 0" />
        <span v-for="item in selectedItemsEmitted" :key="item.id">
          <RatingsTable
            v-if="value == 'rate'"
            :type="'all'"
            :dbRef="initialsRatingsRef"
            :puzzleId="selectedItemsEmitted[0].id"
          >
          </RatingsTable>
          <RatingsTable
            v-if="value == 'rate_mine'"
            :type="'mine'"
            :dbRef="initialsRatingsRef"
            :puzzleId="selectedItemsEmitted[0].id"
            :userId="$props.friend.uid"
          >
          </RatingsTable>
          <RecordsTable
            v-if="value == 'all'"
            :type="'all'"
            :dbRef="initialsRecordsRef"
            :puzzleId="selectedItemsEmitted[0].id"
          >
          </RecordsTable>
          <RecordsTable
            v-if="value == 'mine'"
            :type="'mine'"
            :dbRef="initialsRecordsRef"
            :puzzleId="selectedItemsEmitted[0].id"
            :userId="$props.friend.uid"
          >
          </RecordsTable>
        </span>
      </div>
    </div>
    <br v-if="start_time && end_time && selectMode == 'single'" />
    <div v-if="start_time && end_time && selectMode == 'single'">
      <va-card
        v-if="selectedItemsEmitted.length > 0"
        color="background"
        style="padding: 10px"
      >
        <h6
          @click="show_details = !show_details"
          class="display-6"
          style="text-align: start"
        >
          &nbsp; Podaci o zagonetci
          <va-icon v-if="!show_details" name="expand_more"></va-icon>
          <va-icon v-if="show_details" name="expand_less"></va-icon>
        </h6>
      </va-card>
      <div class="my_row" v-if="show_details">
        <va-tabs v-if="selectedItemsEmitted.length > 0" v-model="value">
          <template #tabs>
            <va-tab name="all"
              ><va-icon name="browse_gallery" />&nbsp; Svi rezultati</va-tab
            >
            <va-tab name="mine"
              ><va-icon name="schedule" />&nbsp; Rezultati korisnika</va-tab
            >
            <va-tab name="rate"
              ><va-icon name="hotel_class" />&nbsp; Sve ocjene</va-tab
            >
            <va-tab name="rate_mine"
              ><va-icon name="star" />&nbsp; Ocjena korisnika</va-tab
            >
            <va-tab :name="10000" disabled></va-tab>
          </template>
        </va-tabs>
        <br v-if="selectedItemsEmitted.length > 0" />
        <span v-for="item in selectedItemsEmitted" :key="item.id">
          <RatingsTable
            v-if="value == 'rate'"
            :type="'all'"
            :dbRef="initialsRatingsRef"
            :puzzleId="selectedItemsEmitted[0].id"
          >
          </RatingsTable>
          <RatingsTable
            v-if="value == 'rate_mine'"
            :type="'mine'"
            :dbRef="initialsRatingsRef"
            :puzzleId="selectedItemsEmitted[0].id"
            :userId="$props.friend.uid"
          >
          </RatingsTable>
          <RecordsTable
            v-if="value == 'all'"
            :type="'all'"
            :dbRef="initialsRecordsRef"
            :puzzleId="selectedItemsEmitted[0].id"
            :start_time="start_time"
            :end_time="end_time"
          >
          </RecordsTable>
          <RecordsTable
            v-if="value == 'mine'"
            :type="'mine'"
            :dbRef="initialsRecordsRef"
            :puzzleId="selectedItemsEmitted[0].id"
            :userId="$props.friend.uid"
            :start_time="start_time"
            :end_time="end_time"
          >
          </RecordsTable>
        </span>
      </div>
    </div>
  </span>
  <va-modal
    :mobile-fullscreen="false"
    ref="description"
    hide-default-actions
    stateful
  >
    <InitialInfo></InitialInfo>
  </va-modal>
  <va-modal
    :mobile-fullscreen="false"
    ref="delete_modal"
    message="Želite li da se zagonetka izbriše?"
    @ok="deletePuzzleConfirmed()"
    stateful
    ok-text="Da"
    cancel-text="Ne"
  />
</template>

<style scoped></style>
