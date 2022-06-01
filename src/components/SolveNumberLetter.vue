<script>
import { ref, getDownloadURL } from "firebase/storage";
import { numberLettersRecordsRef, projectStorage } from "../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usersRef, friendsRef } from "../firebase_main.js";
import { numberLettersRef } from "../firebase_main.js";

import MyCounter from "./MyCounter.vue";
import LoadingBar from "./LoadingBar.vue";

export default {
  components: {
    MyCounter,
    LoadingBar,
  },
  data() {
    return {
      zoom: 100,
      max_zoom: 200,
      current_x: null,
      current_y: null,
      fully_loaded: false,
      border_top: [[]],
      border_bottom: [[]],
      border_left: [[]],
      border_right: [[]],
      time_elapsed: 0,
      show_error: false,
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      time_created: "",
      last_updated: "",
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      permission_to_edit_visibility: false,
      cheat: false,
      victory: false,
      values: [],
      user: null,
      permissions: [],
      image: null,
      imageURL: "",
      permissionsUserRecords: [],
      collaborator: "",
      description: "",
      source: "",
      title: "",
      is_public: false,
      solution: [[]],
      is_special: [[]],
      num_letters: 1,
      rows: 1,
      columns: 1,
      letter_alert: "",
      alphabet: [
        "A",
        "B",
        "C",
        "Č",
        "Ć",
        "D",
        "Đ",
        "DŽ",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "LJ",
        "M",
        "N",
        "NJ",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "Š",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "Ž",
      ],
      letters: [],
    };
  },
  methods: {
    zoom_number() {
      if (this.zoom > this.max_zoom) {
        this.zoom = this.max_zoom;
      }
      document.getElementById("table_zoom").style.transform =
        "scale(" + this.zoom / 100 + ")";
    },
    zoom_in() {
      this.zoom++;
      document.getElementById("table_zoom").style.transform =
        "scale(" + this.zoom / 100 + ")";
    },
    zoom_out() {
      if (this.zoom > 1) {
        this.zoom--;
      }
      document.getElementById("table_zoom").style.transform =
        "scale(" + this.zoom / 100 + ")";
    },
    check_letter() {
      this.letter_alert = "";
      for (let i = 0; i < this.num_letters; i++) {
        this.values[i] = this.values[i].toUpperCase();
        if (!this.alphabet.includes(this.values[i])) {
          if (this.letter_alert != "") {
            this.letter_alert += " ";
          }
          this.letter_alert +=
            i + ". slovo (" + this.values[i] + ") nije u zadanoj abecedi.";
        }
        this.$forceUpdate();
      }
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = i + 1; j < this.num_letters; j++) {
          if (this.values[i] == this.values[j]) {
            if (this.letter_alert != "") {
              this.letter_alert += " ";
            }
            this.letter_alert +=
              i +
              ". slovo (" +
              this.values[i] +
              ") i " +
              j +
              " slovo (" +
              this.values[j] +
              ") je jednako.";
          }
        }
      }
      this.$forceUpdate();
    },
    shuffleOrder() {
      let new_order = [];
      let old_letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        old_letters.push(this.letters[i]);
        let new_index = Math.floor(Math.random() * this.num_letters);
        while (new_order.includes(new_index)) {
          new_index = Math.floor(Math.random() * this.num_letters);
        }
        new_order.push(new_index);
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          for (let l = 0; l < this.num_letters; l++) {
            if (this.solution[i][j] == l) {
              this.solution[i][j] = new_order[l];
              break;
            }
          }
        }
      }
      for (let i = 0; i < this.num_letters; i++) {
        this.letters[new_order[i]] = old_letters[i];
      }
    },
    getAuthorUserRecord() {
      let some_id = this.author;
      let other = this.author;
      let newRecord = { displayName: "Skriveno", email: "skriveno" };
      let me = null;
      if (this.user) {
        me = this.user.uid;
      }
      let my_activity = this;
      usersRef.get(some_id).then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          let id = childSnapshot.id;
          if (id == some_id) {
            let visibility = childSnapshot.get("visible");
            if (visibility == true || me == id) {
              newRecord = {
                displayName: childSnapshot.get("displayName"),
                email: childSnapshot.get("email"),
              };
            }
            friendsRef
              .get()
              .then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let id1 = childSnapshotUser.get("user1");
                  let id2 = childSnapshotUser.get("user2");
                  if (
                    (id1 == me && id2 == other) ||
                    (id2 == me && id1 == other)
                  ) {
                    newRecord = {
                      displayName: childSnapshot.get("displayName"),
                      email: childSnapshot.get("email"),
                    };
                  }
                });
              })
              .then(() => {
                my_activity.authorUserRecord = newRecord;
              });
          }
        });
      });
    },
    getUpdaterUserRecord() {
      let some_id = this.updater;
      let other = this.updater;
      let newRecord = { displayName: "Skriveno", email: "skriveno" };
      let me = null;
      if (this.user) {
        me = this.user.uid;
      }
      let my_activity = this;
      usersRef.get(some_id).then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          let id = childSnapshot.id;
          if (id == some_id) {
            let visibility = childSnapshot.get("visible");
            if (visibility == true || me == id) {
              newRecord = {
                displayName: childSnapshot.get("displayName"),
                email: childSnapshot.get("email"),
              };
            }
            friendsRef
              .get()
              .then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let id1 = childSnapshotUser.get("user1");
                  let id2 = childSnapshotUser.get("user2");
                  if (
                    (id1 == me && id2 == other) ||
                    (id2 == me && id1 == other)
                  ) {
                    newRecord = {
                      displayName: childSnapshot.get("displayName"),
                      email: childSnapshot.get("email"),
                    };
                  }
                });
              })
              .then(() => {
                my_activity.updaterUserRecord = newRecord;
              });
          }
        });
      });
    },
    getCollaboratorUserRecord() {
      this.permissionsUserRecords = [];
      let my_activity = this;
      let me = null;
      if (this.user) {
        me = this.user.uid;
      }
      for (let i = 0; i < this.permissions.length; i++) {
        let some_id = this.permissions[i];
        let other = this.permissions[i];
        let newRecord = { displayName: "Skriveno", email: "skriveno" };
        usersRef.get(some_id).then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == some_id) {
              let visibility = childSnapshot.get("visible");
              if (visibility == true || me == id) {
                newRecord = {
                  displayName: childSnapshot.get("displayName"),
                  email: childSnapshot.get("email"),
                };
              }
              friendsRef
                .get()
                .then(function (snapshotUser) {
                  snapshotUser.forEach(function (childSnapshotUser) {
                    let id1 = childSnapshotUser.get("user1");
                    let id2 = childSnapshotUser.get("user2");
                    if (
                      (id1 == me && id2 == other) ||
                      (id2 == me && id1 == other)
                    ) {
                      newRecord = {
                        displayName: childSnapshot.get("displayName"),
                        email: childSnapshot.get("email"),
                      };
                    }
                  });
                })
                .then(() => {
                  my_activity.permissionsUserRecords.push(newRecord);
                });
            }
          });
        });
      }
    },
    initialize() {
      this.rows = parseInt(this.rows);
      this.columns = parseInt(this.columns);
      let oldsolution = [];
      let oldisspecial = [];
      let oldtop = [];
      let oldbottom = [];
      let oldleft = [];
      let oldright = [];
      let maxcol = this.columns;
      let maxrow = this.rows;
      if (this.solution) {
        oldsolution = this.solution;
        oldisspecial = this.is_special;
        oldtop = this.border_top;
        oldbottom = this.border_bottom;
        oldleft = this.border_left;
        oldright = this.border_right;
        if (oldsolution.length > maxrow) {
          maxrow = oldsolution.length;
        }
        if (oldsolution[0].length > maxcol) {
          maxcol = oldsolution[0].length;
        }
      }
      this.solution = [];
      this.is_special = [];
      this.border_top = [];
      this.border_bottom = [];
      this.border_left = [];
      this.border_right = [];
      for (let i = 0; i < maxrow; i++) {
        let solution_row = [];
        let special_row = [];
        this.border_top.push([]);
        this.border_bottom.push([]);
        this.border_left.push([]);
        this.border_right.push([]);
        for (let j = 0; j < maxcol; j++) {
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              solution_row.push(oldsolution[i][j]);
              special_row.push(oldisspecial[i][j]);
              this.border_top[i].push(oldtop[i][j]);
              this.border_bottom[i].push(oldbottom[i][j]);
              this.border_left[i].push(oldleft[i][j]);
              this.border_right[i].push(oldright[i][j]);
            } else {
              solution_row.push(-2);
              special_row.push(0);
              this.border_top[i].push(0);
              this.border_bottom[i].push(0);
              this.border_left[i].push(0);
              this.border_right[i].push(0);
            }
          } else {
            solution_row.push(-2);
            special_row.push(0);
            this.border_top[i].push(0);
            this.border_bottom[i].push(0);
            this.border_left[i].push(0);
            this.border_right[i].push(0);
          }
        }
        this.solution.push(solution_row);
        this.is_special.push(special_row);
        for (let j = 0; j < maxcol; j++) {
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              this.solution[i][j] = oldsolution[i][j];
              this.is_special[i][j] = oldisspecial[i][j];
            }
          }
        }
      }
      let oldletters = [];
      let maxletters = this.num_letters;
      if (this.letters) {
        oldletters = this.letters;
        if (oldletters.length > maxletters) {
          maxletters = oldletters.length;
        }
      }
      this.letters = [];
      this.values = [];
      for (let i = 0; i < maxletters; i++) {
        if (oldletters.length > i) {
          this.letters.push(oldletters[i]);
        } else {
          this.letters.push("");
        }
        this.values.push("");
      }
    },
    delay(operation, delay) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(operation);
        }, delay);
      });
    },
    async new_async(operation, delay) {
      await this.delay(operation, delay);
    },
    string_to_array(array_string) {
      if (!array_string) {
        return [];
      }
      let array = array_string
        .substring(2, array_string.length - 2)
        .split("],[");
      for (let i = 0; i < array.length; i++) {
        array[i] = array[i].split("\\,");
        for (let j = 0; j < array[i].length; j++) {
          array[i][j] = array[i][j];
        }
      }
      return array;
    },
    fetch_puzzle() {
      let params_id = this.$route.params.id;
      let string_solution = [];
      let string_is_special = [];
      let string_top = [];
      let string_bottom = [];
      let string_left = [];
      let string_right = [];
      let string_letters = "";
      let string_image = "";
      let string_title = "";
      let string_description = "";
      let string_author = "";
      let string_updater = "";
      let string_is_public = false;
      let string_permissions = [];
      let string_source = "";
      let string_time_created = "";
      let string_last_updated = "";
      let found = false;
      let funct_ref = this.string_to_array;
      numberLettersRef
        .get(params_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == params_id) {
              string_solution = funct_ref(childSnapshot.get("solution"));
              string_is_special = funct_ref(childSnapshot.get("is_special"));
              string_top = funct_ref(childSnapshot.get("border_top"));
              string_bottom = funct_ref(childSnapshot.get("border_bottom"));
              string_left = funct_ref(childSnapshot.get("border_left"));
              string_right = funct_ref(childSnapshot.get("border_right"));
              string_letters = childSnapshot.get("letters");
              string_image = childSnapshot.get("image");
              string_title = childSnapshot.get("title");
              string_description = childSnapshot.get("description");
              string_author = childSnapshot.get("author");
              string_updater = childSnapshot.get("updater");
              string_is_public = childSnapshot.get("is_public");
              string_permissions = childSnapshot.get("permissions");
              string_source = childSnapshot.get("source");
              string_time_created = new Date(
                childSnapshot.get("time_created").seconds * 1000
              );
              string_last_updated = new Date(
                childSnapshot.get("last_updated").seconds * 1000
              );
              found = true;
            }
          });
        })
        .then(() => {
          if (found) {
            this.solution = string_solution;
            this.is_special = string_is_special;
            this.border_top = string_top;
            this.border_bottom = string_bottom;
            this.border_left = string_left;
            this.border_right = string_right;
            this.letters = string_letters;
            this.image = string_image;
            this.title = string_title;
            this.description = string_description;
            this.author = string_author;
            this.getAuthorUserRecord();
            this.updater = string_updater;
            this.getUpdaterUserRecord();
            this.is_public = string_is_public;
            this.permissions = string_permissions;
            this.getCollaboratorUserRecord();
            this.source = string_source;
            this.time_created = string_time_created;
            this.last_updated = string_last_updated;
            this.rows = this.solution.length;
            this.columns = this.solution[0].length;
            this.num_letters = this.letters.length;
            this.shuffleOrder();
            this.initialize();
            this.getPicture();
            this.$forceUpdate();
          } else {
            this.new_async(
              this.$vaToast.init("Ne postoji zagonetka s tim brojem."),
              1000
            ).then(() => {
              this.$router.push("/search-number-letter");
            });
          }
        });
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
    store() {
      let datetime = new Date();
      numberLettersRecordsRef.add({
        puzzleID: this.$route.params.id,
        user: this.user.uid,
        score: this.time_elapsed,
        time: datetime,
      });
    },
    check_victory() {
      this.victory = true;
      for (let i = 0; i < this.values.length; i++) {
        if (this.letters[i] != this.values[i]) {
          this.victory = false;
          return;
        }
      }
      if (this.victory) {
        clearInterval(this.interval);
        this.new_async(
          this.$vaToast.init("Uspješno ste riješili zagonetku."),
          1000
        ).then(() => {
          if (this.user && !this.cheat) {
            this.new_async(this.store(), 1000).then(() => {
              this.$router.push("/search-number-letter");
            });
          } else {
            if (!this.user) {
              this.new_async(
                this.$vaToast.init(
                  "Ne može se spremiti vaš rezultat jer niste prijavljeni."
                ),
                1000
              ).then(() => {
                if (this.cheat) {
                  this.new_async(
                    this.$vaToast.init(
                      "Ne može se spremiti vaš rezultat jer ste odabrali da se otkrije rješenje."
                    ),
                    1000
                  ).then(() => {
                    this.$router.push("/login");
                  });
                } else {
                  this.$router.push("/login");
                }
              });
            } else {
              if (this.cheat) {
                this.new_async(
                  this.$vaToast.init(
                    "Ne može se spremiti vaš rezultat jer ste odabrali da se otkrije rješenje."
                  ),
                  1000
                ).then(() => {
                  this.$router.push("/search-number-letter");
                });
              } else {
                this.$router.push("/search-number-letter");
              }
            }
          }
        });
      }
    },
    startTimer() {
      this.time_elapsed = setInterval(() => (this.time_elapsed += 1), 1000);
    },
    show_solution() {
      this.cheat = true;
      for (let i = 0; i < this.letters.length; i++) {
        this.values[i] = this.letters[i];
      }
      this.check_victory();
      this.$forceUpdate();
    },
    check_duplicated(x) {
      for (let i = 0; i < this.letters.length; i++) {
        if (x == i) {
          continue;
        }
        if (this.values[i] == this.values[x]) {
          return true;
        }
      }
      return false;
    },
    getPicture() {
      if (this.image == null || this.image == "") {
        this.imageURL = "";
        this.fully_loaded = true;
        return;
      }
      var reference = ref(projectStorage, this.image);
      // Get the download URL
      getDownloadURL(reference)
        .then((url) => {
          this.imageURL = url;
          this.fully_loaded = true;
        })
        .catch((error) => {});
    },
  },
  beforeMount() {
    this.fetch_puzzle();
    if (this.$refs.lettersform) {
      for (let i = 0; i < this.$refs.lettersform.length; i++) {
        if (this.$refs.lettersform[i]) {
          this.$refs.lettersform[i].validate();
        }
      }
    }
  },
  beforeUpdate() {
    this.check_letter();
    if (this.$refs.lettersform) {
      for (let i = 0; i < this.$refs.lettersform.length; i++) {
        if (this.$refs.lettersform[i]) {
          this.$refs.lettersform[i].validate();
        }
      }
    }
    this.check_victory();
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go();
      }
    );
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
        this.$refs.no_user_dialog.show();
      }
      return true;
    });
    this.$refs.show_error.show();
    this.startTimer();
  },
};
</script>

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="my_body" v-else>
    <div class="my_row">
      <span style="float: left; overflow-wrap: anywhere">
        <va-button
          @click="
            show_error = !show_error;
            $forceUpdate();
          "
          style="margin-left: 10px; margin-top: 10px"
        >
          <span v-if="show_error == false">
            <va-icon name="report_off" />
            &nbsp;Ne prikazuj greške</span
          >
          <span v-else><va-icon name="report" /> &nbsp;Prikaži greške</span>
        </va-button>
      </span>
      <va-chip
        style="
          float: right;
          overflow-wrap: anywhere;
          margin-left: 10px;
          margin-top: 10px;
        "
        outline
      >
        <va-icon name="timer" />&nbsp;{{ format(time_elapsed) }}
      </va-chip>
    </div>
    <div class="my_row">
      <va-infinite-scroll disabled :load="() => {}">
        <div>
          <table style="display: inline-table" id="table_zoom">
            <tr>
              <td v-for="i in num_letters" v-bind:key="i">
                <va-form ref="lettersform">
                  <va-input
                    class="mb-4"
                    @click="mode = i - 1"
                    @update:model-value="check_letter()"
                    v-model="values[i - 1]"
                    style="
                      width: 80px;
                      min-width: 80px;
                      max-width: 80px;
                      margin-left: 10px;
                    "
                    type="text"
                    :label="'' + (i - 1) + ''"
                    immediate-validation
                    :rules="[
                      (value) => {
                        if (
                          show_error == false ||
                          values[i - 1] == letters[i - 1]
                        ) {
                          if (check_duplicated(i - 1) == 1) {
                            if (alphabet.includes(value)) {
                              return 'Slovo je udvostručeno.';
                            } else {
                              return 'Slovo je udvostručeno i nije u abecedi.';
                            }
                          } else {
                            if (alphabet.includes(value)) {
                              return true;
                            } else {
                              return 'Slovo nije u abecedi.';
                            }
                          }
                        } else {
                          if (check_duplicated(i - 1) == 1) {
                            if (alphabet.includes(value)) {
                              return 'Slovo je netočno i udvostručeno.';
                            } else {
                              return 'Slovo je netočno, udvostručeno i nije u abecedi.';
                            }
                          } else {
                            if (alphabet.includes(value)) {
                              return true;
                            } else {
                              return 'Slovo je netočno i nije u abecedi.';
                            }
                          }
                        }
                      },
                    ]"
                  />
                </va-form>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="my_row" v-if="current_x != null && current_y != null">
      <va-chip
        ><va-icon name="my_location" />&nbsp;({{ current_x }},
        {{ current_y }})</va-chip
      >
    </div>
    <div class="my_row">
      <MyCounter
        :min_value="1"
        :max_value="max_zoom"
        v-bind:value="zoom"
        @input="
          (n) => {
            zoom = n;
            zoom_number();
          }
        "
        :some_text="'Povećanje'"
      ></MyCounter>
    </div>
    <div class="my_row" style="max-height: 500px">
      <va-infinite-scroll disabled :load="() => {}">
        <div class="my_row">
          <table class="numbers_table">
            <tr v-for="i in rows" v-bind:key="i">
              <td
                v-for="j in columns"
                v-bind:key="j"
                @mouseover="
                  current_x = i;
                  current_y = j;
                "
                :class="{
                  black: solution[i - 1][j - 1] == -1,
                  special: is_special[i - 1][j - 1] == 1,
                  wrong:
                    letters[solution[i - 1][j - 1]] !=
                      values[solution[i - 1][j - 1]] && show_error,
                  bordertop: border_top[i - 1][j - 1] == 1,
                  borderbottom: border_bottom[i - 1][j - 1] == 1,
                  borderleft: border_left[i - 1][j - 1] == 1,
                  borderright: border_right[i - 1][j - 1] == 1,
                }"
              >
                <div>
                  <span
                    v-if="
                      solution[i - 1][j - 1] == -2 ||
                      solution[i - 1][j - 1] == -1
                    "
                  >
                  </span>
                  <span v-else>
                    <sup> {{ solution[i - 1][j - 1] }} </sup>&nbsp;{{
                      values[solution[i - 1][j - 1]]
                    }}
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="my_row" v-if="image">
      <img id="img" :src="imageURL" alt="Nema slike" style="width: 100%" />
    </div>
    <div class="my_row" v-if="!image">
      <va-alert
        style="white-space: pre-wrap"
        color="warning"
        title="Prazna slika"
        center
        class="mb-4"
      >
        Niste dodali sliku uz zagonetku.
      </va-alert>
    </div>
    <div class="my_row">
      <va-card>
        <va-card-title>Naslov zagonetke</va-card-title>
        <va-card-content>
          {{ title }}
        </va-card-content>
      </va-card>
    </div>
    <div class="my_row">
      <va-card>
        <va-card-title>Opis zagonetke</va-card-title>
        <va-card-content>
          {{ description }}
        </va-card-content>
      </va-card>
    </div>
    <div class="my_row">
      <va-card>
        <va-card-title>Izvor zagonetke</va-card-title>
        <va-card-content>
          {{ source }}
        </va-card-content>
      </va-card>
    </div>
    <div class="my_row">
      <va-chip
        style="margin-left: 10px; margin-top: 10px; overflow-wrap: anywhere"
        >Autor zagonetke: {{ authorUserRecord.displayName }} ({{
          authorUserRecord.email
        }})</va-chip
      >
      <va-chip
        style="margin-left: 10px; margin-top: 10px; overflow-wrap: anywhere"
        >Vrijeme kreiranja: {{ time_created.toLocaleString() }}
      </va-chip>
      <br />
      <va-chip
        style="margin-left: 10px; margin-top: 10px; overflow-wrap: anywhere"
        >Zadnji ažurirao: {{ updaterUserRecord.displayName }} ({{
          updaterUserRecord.email
        }})</va-chip
      >
      <va-chip
        style="margin-left: 10px; margin-top: 10px; overflow-wrap: anywhere"
        >Vrijeme zadnje izmjene: {{ last_updated.toLocaleString() }}
      </va-chip>
    </div>
    <div class="my_row">
      <va-button
        @click="$refs.show_solution_modal.show()"
        style="overflow-wrap: anywhere"
      >
        <va-icon name="help" />
        &nbsp;Otkrij sva polja</va-button
      >
    </div>
  </body>
  <va-modal
    :mobile-fullscreen="false"
    ref="show_error"
    message="Želite li da greške budu uznačene?"
    @ok="show_error = true"
    stateful
    ok-text="Da"
    cancel-text="Ne"
  />
  <va-modal
    :mobile-fullscreen="false"
    ref="show_solution_modal"
    message="Želite li da se otkriju sva polja? U tom slučaju vaš rezultat neće biti spremljen."
    @ok="show_solution()"
    stateful
    ok-text="Da"
    cancel-text="Ne"
  />
  <va-modal
    :mobile-fullscreen="false"
    ref="no_user_dialog"
    @cancel="$router.push('/login')"
    ok-text="Da"
    cancel-text="Ne"
    message="Ne može se spremiti vaš rezultat jer niste prijavljeni. Želite li svejedno nastaviti?"
    stateful
  />
</template>

<style scoped>
.numbers_table {
  display: inline-table;
  border: 1px solid black;
  border-collapse: collapse;
}
.numbers_table tr {
  border: 1px solid black;
  border-collapse: collapse;
}
.numbers_table td {
  border: 1px solid black;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  text-align: center;
  vertical-align: middle;
  border-collapse: collapse;
}
.black {
  background-color: black;
}
.special {
  background-color: salmon;
}
.wrong {
  color: #de1041;
}
</style>
