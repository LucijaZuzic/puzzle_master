<script>
import { numberCrosswordsRef, friendsRef } from "../../firebase_main.js";
import { numberCrosswordsRecordsRef } from "../../firebase_main.js";
import { usersRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL } from "firebase/storage";
import { projectStorage } from "../../firebase_main.js";

import MyCounter from "../Utility/MyCounter.vue";
import LoadingBar from "../Utility/LoadingBar.vue";
import NumberCrosswordInfo from "../Info/NumberCrosswordInfo.vue";

export default {
  components: {
    MyCounter,
    LoadingBar,
    NumberCrosswordInfo,
  },
  data() {
    return {
      value: [false, false, false, false],
      zoom: 100,
      max_zoom: 200,
      length_to_display: null,
      fully_loaded: false,
      image: null,
      imageURL: "",
      user: null,
      title: "",
      cheat: false,
      time_elapsed: 0,
      description: "This",
      source: "Feniks",
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      rows: 0,
      victory: false,
      numbers_by_len: [],
      selected_number: 0,
      selected_number_x: -1,
      selected_number_y: -1,
      solution: [
        [1, 2, 3],
        [4, 5, 6],
        [-1, -1, 3],
      ],
      is_special: [
        [0, 0, 0],
        [1, 1, 0],
        [0, 0, 0],
      ],
      is_revealed: [
        [1, 1, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      number_positions: [],
      time_created: "",
      last_updated: "",
      number_orientation: true,
      warning: "",
      show_error: false,
      current_x: null,
      current_y: null,
    };
  },
  methods: {
    checkIdentity() {
      if (this.author == this.user.uid) {
        return true;
      }
      if (this.is_public == true) {
        return true;
      }
      for (let i = 0; i < this.permissions.length; i++) {
        if (this.permissions[i] == this.user.uid) {
          return true;
        }
      }
      return false;
    },
    getTotalLength() {
      for (let i = 0; i < this.numbers_by_len.length; i++) {
        if (this.numbers_by_len[i].length > 0) {
          return true;
        }
      }
      return false;
    },
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
      this.rows = this.solution.length;
      this.columns = this.solution[0].length;
      this.values = [];
      for (let i = 0; i < this.rows; i++) {
        let one_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1) {
            one_row.push(-1);
          } else {
            one_row.push(10);
          }
        }
        this.values.push(one_row);
      }
      this.parse_numbers();
      this.add_revealed();
    },
    add_revealed() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.is_revealed[i][j]) {
            this.values[i][j] = this.solution[i][j];
          }
        }
      }
    },
    show_solution() {
      this.cheat = true;
      clearInterval(this.interval);
      this.values = [];
      for (let i = 0; i < this.rows; i++) {
        let one_row = [];
        for (let j = 0; j < this.columns; j++) {
          one_row.push(this.solution[i][j]);
        }
        this.values.push(one_row);
      }
      this.check_victory();
      this.$forceUpdate();
    },
    parse_numbers() {
      let numbers = [];
      let maxlen = 0;
      for (let i = 0; i < this.rows; i++) {
        let number = "";
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == 10) {
            this.numbers_by_len = [];
            return;
          }
          if (this.solution[i][j] >= 0 && this.solution[i][j] < 10) {
            number += this.solution[i][j].toString();
          } else {
            if (number != "") {
              numbers.push(number);
              if (number.length > maxlen) {
                maxlen = number.length;
              }
              number = "";
            }
          }
        }
        if (
          this.solution[i][this.columns - 1] >= 0 &&
          this.solution[i][this.columns - 1] < 10
        ) {
          numbers.push(number);
          if (number.length > maxlen) {
            maxlen = number.length;
          }
          number = "";
        }
      }
      for (let i = 0; i < this.columns; i++) {
        let number = "";
        for (let j = 0; j < this.rows; j++) {
          if (this.solution[j][i] >= 0 && this.solution[j][i] < 10) {
            number += this.solution[j][i].toString();
          } else {
            if (number != "") {
              numbers.push(number);
              if (number.length > maxlen) {
                maxlen = number.length;
              }
              number = "";
            }
          }
        }
        if (
          this.solution[this.rows - 1][i] >= 0 &&
          this.solution[this.rows - 1][i] < 10
        ) {
          numbers.push(number);
          if (number.length > maxlen) {
            maxlen = number.length;
          }
          number = "";
        }
      }
      numbers.sort();
      this.numbers_by_len = [];
      this.number_positions = [];
      for (let i = 0; i < maxlen; i++) {
        let numbers_of_len = [];
        let positions = [];
        this.numbers_by_len.push(numbers_of_len);
        this.number_positions.push(positions);
      }
      for (let i = 0; i < numbers.length; i++) {
        this.numbers_by_len[numbers[i].length - 1].push(numbers[i]);
        this.number_positions[numbers[i].length - 1].push([-1, -1, -1]);
      }
      let num_lens = 0;
      let number_of_numbers = 0;
      for (let i = 1; i < maxlen; i++) {
        if (this.numbers_by_len[i].length > 0) {
          number_of_numbers += this.numbers_by_len[i].length;
          num_lens++;
        }
      }
    },
    remove_number() {
      if (
        this.number_positions[this.selected_number_x][
          this.selected_number_y
        ][0] == -1
      ) {
        return;
      }
      if (this.victory) {
        return;
      }
      let x =
        this.number_positions[this.selected_number_x][
          this.selected_number_y
        ][0];
      let y =
        this.number_positions[this.selected_number_x][
          this.selected_number_y
        ][1];
      let orientation_provisional =
        this.number_positions[this.selected_number_x][
          this.selected_number_y
        ][2];
      if (orientation_provisional == true) {
        let end = x;
        while (
          end + 1 != this.solution.length &&
          this.values[end + 1][y] != -1
        ) {
          this.values[end][y] = 10;
          end++;
        }
        this.values[end][y] = 10;
      } else {
        let end = y;
        while (
          end + 1 != this.solution.length &&
          this.values[x][end + 1] != -1
        ) {
          this.values[x][end] = 10;
          end++;
        }
        this.values[x][end] = 10;
      }
      this.number_positions[this.selected_number_x][this.selected_number_y] = [
        -1, -1, -1,
      ];
      let prev_num = this.selected_number;
      let prev_x = this.selected_number_x;
      let prev_y = this.selected_number_y;
      let prev_o = this.number_orientation;
      for (let i = 0; i < this.number_positions.length; i++) {
        for (let j = 0; j < this.number_positions[i].length; j++) {
          if (this.number_positions[i][j][0] != -1) {
            this.selected_number = this.numbers_by_len[i][j];
            this.selected_number_x = i;
            this.selected_number_y = j;
            this.number_orientation = this.number_positions[i][j][2];
            this.place_number(
              true,
              this.number_positions[i][j][0],
              this.number_positions[i][j][1]
            );
          }
        }
      }
      this.selected_number = prev_num;
      this.selected_number_x = prev_x;
      this.selected_number_y = prev_y;
      this.number_orientation = prev_o;
      this.add_revealed();
    },
    place_number(reset, x, y) {
      if (this.victory) {
        return false;
      }
      if (!this.selected_number) {
        return false;
      }
      if (this.values[x][y] == -1) {
        if (!reset) {
          this.$vaToast.init("Broj ne može započeti na barijeri.");
        }
        return false;
      }
      if (
        this.number_positions[this.selected_number_x][
          this.selected_number_y
        ][0] != -1
      ) {
        // this.$vaToast.init("Broj je već postavljen.")
        // return false;
        let old_x =
          this.number_positions[this.selected_number_x][
            this.selected_number_y
          ][0];
        let old_y =
          this.number_positions[this.selected_number_x][
            this.selected_number_y
          ][1];
        let old_orientation = this.number_orientation;
        this.number_orientation =
          this.number_positions[this.selected_number_x][
            this.selected_number_y
          ][2];
        this.remove_number();
        if (this.place_number(reset, x, y) == false) {
          this.place_number(reset, old_x, old_y);
        }
        this.number_orientation = old_orientation;
        return true;
      }
      if (this.number_orientation == true) {
        if (x == 0 || this.values[x - 1][y] == -1) {
          let end = x;
          let number_match = true;
          while (
            end + 1 != this.solution.length &&
            this.values[end + 1][y] != -1
          ) {
            if (
              this.values[end][y] != 10 &&
              this.values[end][y] !=
                parseInt(this.selected_number.toString()[end - x])
            ) {
              number_match = false;
            }
            end++;
          }
          if (end - x + 1 == this.selected_number.length && number_match) {
            let end = x;
            while (
              end + 1 != this.solution.length &&
              this.values[end + 1][y] != -1
            ) {
              this.values[end][y] = parseInt(
                this.selected_number.toString()[end - x]
              );
              end++;
            }
            this.values[end][y] = parseInt(
              this.selected_number.toString()[end - x]
            );
            this.number_positions[this.selected_number_x][
              this.selected_number_y
            ] = [x, y, true];
          } else {
            if (!number_match) {
              if (!reset) {
                this.$vaToast.init(
                  "Broj nije postavljen okomito jer se već upisane znamenke ne podudaraju."
                );
              }
              return false;
            } else {
              if (!reset) {
                if (end - x + 1 > this.selected_number.length) {
                  this.$vaToast.init(
                    "Broj nije postavljen okomito jer ima previše slobodnih mjesta."
                  );
                } else {
                  this.$vaToast.init(
                    "Broj nije postavljen okomito jer ima premalo slobodnih mjesta."
                  );
                }
              }
              return false;
            }
          }
        } else {
          if (!reset) {
            this.$vaToast.init(
              "Broj nije postavljen okomito jer prethodni element stupca nije barijera niti početak stupca."
            );
          }
          return false;
        }
      } else {
        if (y == 0 || this.values[x][y - 1] == -1) {
          let end = y;
          let number_match = true;
          while (
            end + 1 != this.solution[0].length &&
            this.values[x][end + 1] != -1
          ) {
            if (
              this.values[x][end] != 10 &&
              this.values[x][end] !=
                parseInt(this.selected_number.toString()[end - y])
            ) {
              number_match = false;
            }
            end++;
          }
          if (end - y + 1 == this.selected_number.length && number_match) {
            let end = y;
            while (
              end + 1 != this.solution[0].length &&
              this.values[x][end + 1] != -1
            ) {
              this.values[x][end] = parseInt(
                this.selected_number.toString()[end - y]
              );
              end++;
            }
            this.values[x][end] = parseInt(
              this.selected_number.toString()[end - y]
            );
            this.number_positions[this.selected_number_x][
              this.selected_number_y
            ] = [x, y, false];
          } else {
            if (!number_match) {
              if (!reset) {
                this.$vaToast.init(
                  "Broj nije postavljen vodoravno jer se već upisane znamenke ne podudaraju."
                );
              }
              return false;
            } else {
              if (!reset) {
                if (end - y + 1 > this.selected_number.length) {
                  this.$vaToast.init(
                    "Broj nije postavljen vodoravno jer ima previše slobodnih mjesta."
                  );
                } else {
                  this.$vaToast.init(
                    "Broj nije postavljen vodoravno jer ima premalo slobodnih mjesta."
                  );
                }
              }
              return false;
            }
          }
        } else {
          if (!reset) {
            this.$vaToast.init(
              "Broj nije postavljen vodoravno jer prethodni element reda nije barijera niti početak reda."
            );
          }
          return false;
        }
      }
      return true;
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
    check_victory() {
      this.victory = true;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.values[i][j] != this.solution[i][j]) {
            this.victory = false;
            return;
          }
        }
      }
      if (this.victory) {
        clearInterval(this.interval);
        this.selected_number = -1;
        this.selected_number_x = -1;
        this.selected_number_y = -1;
        this.new_async(
          this.$vaToast.init("Uspješno ste riješili zagonetku."),
          1000
        ).then(() => {
          if (this.user && !this.cheat) {
            this.new_async(this.store(), 1000).then(() => {
              this.$router.push("/search-number-crossword");
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
                  this.$router.push("/search-number-crossword");
                });
              } else {
                this.$router.push("/search-number-crossword");
              }
            }
          }
        });
      }
    },
    store() {
      let datetime = new Date();
      numberCrosswordsRecordsRef.add({
        puzzleID: this.$route.params.id,
        user: this.user.uid,
        score: this.time_elapsed,
        time: datetime,
      });
    },
    startTimer() {
      this.time_elapsed = 0;
      clearInterval(this.interval);
      this.interval = setInterval(() => (this.time_elapsed += 1), 1000);
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
    count_special() {
      for (let i = 0; i < this.is_special.length; i++) {
        for (let j = 0; j < this.is_special[i].length; j++) {
          if (this.is_special[i][j]) {
            return true;
          }
        }
      }
    },
    remove_dir(i) {
      for (let j = 0; j < this.numbers_by_len[i].length; j++) {
        this.select_number(i, j);
        this.remove_number();
      }
    },
    select_number(i, j) {
      if (this.victory) {
        return;
      }
      this.selected_number_x = i;
      this.selected_number_y = j;
      this.selected_number = this.numbers_by_len[i][j];
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
    fetch_puzzle() {
      let params_id = this.$route.params.id;
      let string_solution = [];
      let string_is_special = [];
      let string_is_revealed = [];
      let string_title = "";
      let string_description = "";
      let string_image = "";
      let string_author = "";
      let string_updater = "";
      let string_is_public = false;
      let string_permissions = [];
      let string_source = "";
      let string_time_created = "";
      let string_last_updated = "";
      let found = false;
      let funct_ref = this.string_to_array;
      numberCrosswordsRef
        .get(params_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == params_id) {
              string_solution = funct_ref(childSnapshot.get("solution"));
              string_is_special = funct_ref(childSnapshot.get("is_special"));
              string_is_revealed = funct_ref(childSnapshot.get("is_revealed"));
              string_title = childSnapshot.get("title");
              string_description = childSnapshot.get("description");
              string_image = childSnapshot.get("image");
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
            this.is_revealed = string_is_revealed;
            this.title = string_title;
            this.description = string_description;
            this.image = string_image;
            this.author = string_author;
            this.getAuthorUserRecord();
            this.updater = string_updater;
            this.getUpdaterUserRecord();
            this.is_public = string_is_public;
            this.permissions = string_permissions;
            this.source = string_source;
            this.time_created = string_time_created;
            this.last_updated = string_last_updated;
            this.initialize();
            this.getPicture();
            this.$forceUpdate();
          } else {
            this.$vaToast.init("Ne postoji zagonetka s tim brojem.");
            this.$router.push("/search-number-crossword");
          }
        });
    },
  },
  beforeMount() {
    this.initialize();
    this.fetch_puzzle();
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
    <h4 class="display-4">
      <va-icon size="large" name="format_list_numbered"></va-icon>
      &nbsp; Igraj brojevnu križaljku
    </h4>
    <br />
    <va-divider></va-divider>
    <va-tabs>
      <template #tabs>
        <va-tab disabled
          ><va-icon name="timer" />&nbsp; {{ format(time_elapsed) }}</va-tab
        >
        <va-tab @click="$refs.description.show()"
          ><va-icon name="info"></va-icon>&nbsp; Pomoć
        </va-tab>
        <va-tab
          @click="
            show_error = !show_error;
            $forceUpdate();
          "
        >
          <span v-if="show_error == false">
            <va-icon name="report_off" />
            &nbsp; Ne prikazuj greške</span
          >
          <span v-else><va-icon name="report" /> &nbsp; Prikaži greške</span>
        </va-tab>
        <va-tab @click="$refs.show_solution_modal.show()">
          <va-icon name="help" />
          &nbsp; Otkrij sva polja
        </va-tab>
        <va-tab>
          <router-link
            v-bind:to="{
              name: 'search_number_crossword',
            }"
          >
            <va-icon name="search"></va-icon>
            &nbsp; Popis zagonetki
          </router-link>
        </va-tab>
        <va-tab v-if="checkIdentity()">
          <router-link
            v-bind:to="{
              name: 'edit_number_crossword',
              params: { id: $route.params.id },
            }"
          >
            <va-icon name="edit"></va-icon>
            &nbsp; Uredi
          </router-link>
        </va-tab>
        <va-tab>
          <router-link
            v-bind:to="{
              name: 'create_number_crossword',
              params: { id: $route.params.id },
            }"
          >
            <va-icon name="add_circle"></va-icon>
            &nbsp; Nova zagonetka
          </router-link>
        </va-tab>
        <va-tab :name="10000" disabled></va-tab>
      </template>
    </va-tabs>
    <va-divider></va-divider>
    <br />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[0] = !value[0]"
        class="display-6"
        style="text-align: start"
      >
        Zagonetka &nbsp;
        <va-icon v-if="!value[0]" name="expand_more"></va-icon>
        <va-icon v-if="value[0]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[0]">
      <div>
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
          :some_text="' Povećanje'"
          :is_zoom="true"
        ></MyCounter>
      </div>
      <div v-if="current_x != null && current_y != null">
        <va-chip outline :rounded="false" style="border: none">
          <va-icon name="my_location" />
          &nbsp; Zadnja lokacija ({{ current_x }}, {{ current_y }})
        </va-chip>
      </div>
      <br v-if="current_x != null && current_y != null" />
      <div 
        style="max-height: 400px; overflow-y: scroll; overflow-x: scroll"
      >
        <table class="numbers_table" id="table_zoom">
          <tr v-for="i in rows" v-bind:key="i">
            <td
              v-for="j in columns"
              v-bind:key="j"
              @click="
                place_number(false, i - 1, j - 1);
                check_victory();
                $forceUpdate();
              "
              @mouseover="
                current_x = i;
                current_y = j;
              "
              :class="{
                wrong:
                  values[i - 1][j - 1] != solution[i - 1][j - 1] &&
                  values[i - 1][j - 1] != 10 &&
                  show_error,
                numbers: true,
                black: values[i - 1][j - 1] == -1,
                help: is_revealed[i - 1][j - 1],
                special: is_special[i - 1][j - 1],
              }"
            >
              <span
                v-if="values[i - 1][j - 1] == 10 || values[i - 1][j - 1] == -1"
                >&nbsp;
              </span>
              <span v-else>
                {{ values[i - 1][j - 1] }}
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px" v-if="count_special()">
      <h6
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Rješenje &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1] && count_special()">
      <span v-for="i in rows" v-bind:key="i">
        <span v-for="j in columns" v-bind:key="j">
          <va-chip
            v-if="
              is_special[i - 1][j - 1] &&
              values[i - 1][j - 1] != solution[i - 1][j - 1] &&
              show_error
            "
            color="danger"
            outline
            square
            style="margin-left: 5px; margin-top: 5px"
          >
            <span v-if="values[i - 1][j - 1] != 10">
              {{ values[i - 1][j - 1] }}
            </span>
            <span v-else>?</span>
          </va-chip>
          <va-chip
            v-if="
              is_special[i - 1][j - 1] &&
              !(values[i - 1][j - 1] != solution[i - 1][j - 1] && show_error)
            "
            color="#FA8072"
            outline
            square
            style="margin-left: 5px; margin-top: 5px"
          >
            <span v-if="values[i - 1][j - 1] != 10">
              {{ values[i - 1][j - 1] }}
            </span>
            <span v-else>?</span>
          </va-chip>
        </span>
      </span>
    </div>
    <br v-if="!value[1] && count_special()" />
    <va-card
      v-if="getTotalLength() && !warning"
      color="background"
      style="padding: 10px"
    >
      <h6
        @click="value[2] = !value[2]"
        class="display-6"
        style="text-align: start"
      >
        Brojevi po duljini &nbsp;
        <va-icon v-if="!value[2]" name="expand_more"></va-icon>
        <va-icon v-if="value[2]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[2] && getTotalLength() && !warning">
      <va-button
        outline
        :rounded="false"
        style="border: none"
        @click="number_orientation = !number_orientation"
      >
        <span v-if="number_orientation == true">
          <va-icon name="arrow_downward" />
          &nbsp; Okomito
        </span>
        <span v-else>
          <va-icon name="arrow_forward" />
          &nbsp; Vodoravno
        </span>
      </va-button>
      <br />
      <br />
      <va-tabs v-model="length_to_display">
        <template #tabs>
          <span v-for="(numbers_of_length, i) in numbers_by_len" v-bind:key="i">
            <va-tab v-if="numbers_of_length.length > 0 && i > 0" :name="i">
              <span>
                {{ i + 1 }}
              </span>
            </va-tab>
          </span>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <div
        v-if="
          length_to_display != null &&
          numbers_by_len[length_to_display].length > 0
        "
      >
        <va-chip
          outline
          style="padding: 20px; margin-left: 20px; margin-top: 20px"
        >
          <span>
            <span>
              {{ length_to_display + 1 }}
            </span>
            &nbsp;
            <va-icon @click="remove_dir(length_to_display)" name="delete" />
            <br />
            <br />
            <div style="max-height: 200px">
              <va-infinite-scroll disabled :load="() => {}">
                <div
                  v-for="(number, j) in numbers_by_len[length_to_display]"
                  v-bind:key="j"
                >
                  <span
                    @click="
                      select_number(length_to_display, j);
                      $forceUpdate();
                    "
                    :class="{
                      used: number_positions[length_to_display][j][0] != -1,
                      selected:
                        selected_number_x == length_to_display &&
                        selected_number_y == j &&
                        selected_number == numbers_by_len[length_to_display][j],
                    }"
                  >
                    {{ number }}
                  </span>
                  &nbsp;
                  <va-icon
                    @click="
                      select_number(length_to_display, j);
                      remove_number();
                      $forceUpdate();
                    "
                    name="delete"
                  />
                </div>
              </va-infinite-scroll>
            </div>
          </span>
        </va-chip>
      </div>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[3] = !value[3]"
        class="display-6"
        style="text-align: start"
      >
        Podaci o zagonetci &nbsp;
        <va-icon v-if="!value[3]" name="expand_more"></va-icon>
        <va-icon v-if="value[3]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[3]">
      <va-chip
        v-if="this.imageURL == ''"
        outline
        square
        :rounded="false"
        style="border: none; font-weight: bold"
      >
        <va-icon name="photo" /> &nbsp; Nema slike
      </va-chip>
      <br v-if="this.imageURL == ''" />
      <br v-if="this.imageURL == ''" />
      <img v-if="image" id="img" :src="imageURL" alt="" style="width: 100%" />
      <br v-if="image" />
      <br v-if="image" />
      <h6 class="display-6" style="text-align: start; color: #2c82e0">
        Naslov zagonetke
      </h6>
      <br />
      <div class="text-block" style="text-align: start">
        {{ title }}
      </div>
      <br />
      <h6 class="display-6" style="text-align: start; color: #2c82e0">
        Opis zagonetke
      </h6>
      <br />
      <div class="text-block" style="text-align: start">
        {{ description }}
      </div>
      <br />
      <h6 class="display-6" style="text-align: start; color: #2c82e0">
        Izvor zagonetke
      </h6>
      <br />
      <div class="text-block" style="text-align: start">
        {{ source }}
      </div>
      <br />
      <div style="text-align: start">
        <router-link :to="'/profile/' + authorUserRecord.email">
          <span style="font-weight: bold"> Autor zagonetke: </span>
          {{ authorUserRecord.displayName }}
          ({{ authorUserRecord.email }})
        </router-link>
      </div>
      <br />
      <div style="text-align: start">
        <span style="font-weight: bold"> Vrijeme kreiranja: </span>
        {{ time_created.toLocaleString() }}
      </div>
      <br />
      <div style="text-align: start">
        <router-link :to="'/profile/' + updaterUserRecord.email">
          <span style="font-weight: bold"> Zadnji ažurirao: </span>
          {{ updaterUserRecord.displayName }}
          ({{ updaterUserRecord.email }})
        </router-link>
      </div>
      <br />
      <div style="text-align: start">
        <span style="font-weight: bold"> Vrijeme zadnje izmjene: </span>
        {{ last_updated.toLocaleString() }}
      </div>
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
  <va-modal
    :mobile-fullscreen="false"
    ref="description"
    hide-default-actions
    stateful
  >
    <NumberCrosswordInfo></NumberCrosswordInfo>
  </va-modal>
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
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
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

.help {
  font-weight: bold;
  background-color: #90beee;
}

.used {
  text-decoration: line-through;
}
.selected {
  color: #40e583;
}
.wrong {
  color: #de1041;
}
</style>
