<script>
import { initialsRecordsRef, initialsRef } from "../../firebase_main.js";
import { usersRef, friendsRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL } from "firebase/storage";
import { projectStorage } from "../../firebase_main.js";

import MyCounter from "../Utility/MyCounter.vue";
import LoadingBar from "../Utility/LoadingBar.vue";
import InitialInfo from "../Info/InitialInfo.vue";

export default {
  components: {
    MyCounter,
    LoadingBar,
    InitialInfo
},
  data() {
    return {
      zoom: 100,
      max_zoom: 200,
      dir_to_display: null,
      fully_loaded: false,
      victory: false,
      cheat: false,
      show_error: true,
      word_index: -1,
      image: null,
      imageURL: "",
      user: null,
      title: "",
      is_public: false,
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      permissions: [],
      permissionsUserRecords: [],
      collaborator: "",
      time_elapsed: 0,
      rows: 15,
      columns: 11,
      mode_x: -1,
      mode_y: -1,
      words_by_dir: [[], [], [], [], [], [], [], []],
      placed_words: [[], [], [], [], [], [], [], []],
      values: [[]],
      source: "",
      time_created: "",
      last_updated: "",
      is_special: [],
      alphabet: [
        "A",
        "B",
        "C",
        "Č",
        "Ć",
        "D",
        "Đ",
        "Ǆ",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "Ǉ",
        "M",
        "N",
        "Ǌ",
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
      description: "",
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
      let maxcol = this.columns;
      let maxrow = this.rows;
      if (this.solution) {
        oldsolution = this.solution;
        oldisspecial = this.is_special;
        if (oldsolution.length > maxrow) {
          maxrow = oldsolution.length;
        }
        if (oldsolution[0].length > maxcol) {
          maxcol = oldsolution[0].length;
        }
      }
      this.solution = [];
      this.is_special = [];
      this.solution = [];
      for (let i = 0; i < maxrow; i++) {
        let solution_row = [];
        let special_row = [];
        for (let j = 0; j < maxcol; j++) {
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              solution_row.push(oldsolution[i][j]);
              special_row.push(oldisspecial[i][j]);
            } else {
              solution_row.push("");
              special_row.push(0);
            }
          } else {
            solution_row.push("");
            special_row.push(0);
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
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.check_start(j, i, false) == false) {
            solution_row.push("");
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.values = new_values;
      let number_of_words = 0;
      let number_of_dirs = 0;
      this.placed_words = [];
      for (let i = 0; i < this.words_by_dir.length; i++) {
        if (this.words_by_dir[i][0] == "") {
          this.words_by_dir[i] = [];
        }
        if (this.words_by_dir[i].length != 0) {
          number_of_words += this.words_by_dir[i].length;
          number_of_dirs++;
        }
        this.placed_words.push([]);
        for (let j = 0; j < this.words_by_dir[i].length; j++) {
          this.placed_words[i].push(0);
        }
      }
      this.page_length = Math.ceil(number_of_words / number_of_dirs);
    },
    reset() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.check_start(j, i, false) == false) {
            solution_row.push("");
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.values = new_values;
      this.placed_words = [];
      for (let i = 0; i < this.words_by_dir.length; i++) {
        this.placed_words.push([]);
        for (let j = 0; j < this.words_by_dir[i].length; j++) {
          this.placed_words[i].push(0);
        }
      }
    },
    show_solution() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          solution_row.push(this.solution[i][j]);
        }
        new_values.push(solution_row);
      }
      this.values = new_values;
      this.placed_words = [];
      for (let i = 0; i < this.words_by_dir.length; i++) {
        this.placed_words.push([]);
        for (let j = 0; j < this.words_by_dir[i].length; j++) {
          this.placed_words.push([
            this.words_by_dir[i][j][0],
            this.words_by_dir[i][j][1],
          ]);
        }
      }
      this.cheat = true;
      this.check_victory();
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
            if (!this.alphabet.includes(array[i][j][0])) {
              array[i][j] = parseInt(array[i][j]);
            }
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
    fetch_puzzle() {
      let params_id = this.$route.params.id;
      let string_solution = [];
      let string_is_special = [];
      let string_words_by_dir = [[], [], [], [], [], [], [], []];
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
      initialsRef
        .get(params_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == params_id) {
              string_solution = funct_ref(childSnapshot.get("solution"));
              string_is_special = funct_ref(childSnapshot.get("is_special"));
              string_words_by_dir[0] = funct_ref(childSnapshot.get("dir1"));
              string_words_by_dir[1] = funct_ref(childSnapshot.get("dir2"));
              string_words_by_dir[2] = funct_ref(childSnapshot.get("dir3"));
              string_words_by_dir[3] = funct_ref(childSnapshot.get("dir4"));
              string_words_by_dir[4] = funct_ref(childSnapshot.get("dir5"));
              string_words_by_dir[5] = funct_ref(childSnapshot.get("dir6"));
              string_words_by_dir[6] = funct_ref(childSnapshot.get("dir7"));
              string_words_by_dir[7] = funct_ref(childSnapshot.get("dir8"));
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
            this.words_by_dir = string_words_by_dir;
            this.title = string_title;
            this.description = string_description;
            this.image = string_image;
            this.oldimage = this.image;
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
            this.initialize();
            this.getPicture();
            this.$forceUpdate();
          } else {
            this.new_async(
              this.$vaToast.init("Ne postoji zagonetka s tim brojem."),
              1000
            ).then(() => {
              this.$router.push("/search-initial");
            });
          }
        });
    },
    check_start(x, y, show_warning) {
      for (let i = 0; i < this.words_by_dir.length; i++) {
        for (let j = 0; j < this.words_by_dir[i].length; j++) {
          if (
            this.words_by_dir[i][j][0] == x &&
            this.words_by_dir[i][j][1] == y
          ) {
            if (show_warning == true) {
              this.$vaToast.init(
                "Nova riječ ne može započeti na istom polju kao već dodana riječ."
              );
            }
            return true;
          }
        }
      }
      return false;
    },
    check_dir(x, y, word_index, dirx, diry, show_warning) {
      let dir = this.get_dir(dirx, diry);
      let new_word = this.words_by_dir[dir][word_index][2];
      for (
        let letter_number = 0;
        letter_number < new_word.length;
        letter_number++
      ) {
        let x_new = x + letter_number * dirx;
        let y_new = y + letter_number * diry;
        if (x_new < 0 || x_new >= this.columns) {
          if (show_warning) {
            this.$vaToast.init(
              "Nova riječ ne može započeti na odabranom polju jer u odabranom smjeru nema dovoljno polja."
            );
          }
          return false;
        }
        if (y_new < 0 || y_new >= this.rows) {
          if (show_warning) {
            this.$vaToast.init(
              "Nova riječ ne može započeti na odabranom polju jer u odabranom smjeru nema dovoljno polja."
            );
          }
          return false;
        }
        if (
          this.values[y_new][x_new] != "" &&
          this.values[y_new][x_new] != new_word[letter_number]
        ) {
          if (show_warning) {
            this.$vaToast.init(
              "Nova riječ ne može započeti na odabranom polju jer su u odabranom smjeru neka polja već popunjena."
            );
          }
          return false;
        }
      }
      return true;
    },
    get_dirxy(dir) {
      let dirx = -2;
      let diry = -2;
      if (dir < 3) {
        dirx = -1;
        diry = dir - 1;
      }
      if (dir == 3) {
        dirx = 0;
        diry = -1;
      }
      if (dir == 4) {
        dirx = 0;
        diry = 1;
      }
      if (dir > 4) {
        dirx = 1;
        diry = dir - 6;
      }
      return [dirx, diry];
    },
    get_dir(dirx, diry) {
      if (dirx == -1) {
        return diry + 1;
      }
      if (dirx == 0) {
        if (diry == -1) {
          return 3;
        }
        if (diry == 1) {
          return 4;
        }
      }
      if (dirx == 1) {
        return diry + 6;
      }
    },
    add_word(x, y, word_index, dirx, diry) {
      if (this.check_start(x, y, false) == false) {
        return;
      }
      let dir = this.get_dir(dirx, diry);
      let new_word = this.words_by_dir[dir][word_index][2];
      if (this.placed_words[dir][word_index] != 0) {
        return;
      }
      if (this.victory) {
        return;
      }
      for (
        let letter_number = 0;
        letter_number < new_word.length;
        letter_number++
      ) {
        let x_new = x + letter_number * dirx;
        let y_new = y + letter_number * diry;
        this.values[y_new][x_new] = new_word[letter_number];
      }
      this.placed_words[dir][word_index] = [x, y];
    },
    place_word(x, y, word_index, dirx, diry, show_warning) {
      if (this.check_start(x, y, false) == false) {
        this.$vaToast.init(
          "Nova riječ ne može započeti na polju koje nije označeno kao početno slovo."
        );
        return false;
      }
      if (word_index == -1) {
        return false;
      }
      let dir = this.get_dir(dirx, diry);
      if (this.placed_words[dir][word_index] != 0) {
        let old_place_x = this.placed_words[dir][word_index][0];
        let old_place_y = this.placed_words[dir][word_index][1];
        this.remove_word(dir, word_index); 
        if (this.place_word(x,y,word_index,dirx,diry, show_warning) == false) {
          this.place_word(
            old_place_x,
            old_place_y,
            word_index,
            dirx,
            diry,
            show_warning
          );
        }
      }
      if (this.victory) {
        return false;
      }
      /*let dir = this.get_dirxy(dirx, diry)
          if (this.placed_words[dir][word_index] == 1) {
              this.$vaToast.init("Riječ je već postavljena.")
              return;
          } */
      //if (this.check_start(x, y, show_warning) == false) {
      if (this.check_dir(x, y, word_index, dirx, diry, show_warning) == true) {
        this.add_word(x, y, word_index, dirx, diry);
        this.check_victory();
      } else {
        return false;
      }
      //}
      this.$forceUpdate();
      return true;
    },
    store() {
      let datetime = new Date();
      initialsRecordsRef.add({
        puzzleID: this.$route.params.id,
        user: this.user.uid,
        score: this.time_elapsed,
        time: datetime,
      });
    },
    select_word(i, j) {
      if (this.victory) {
        return;
      }
      if (this.placed_words[i][j] != 0) {
        return;
      }
      this.word_index = j;
      let dirs = this.get_dirxy(i);
      this.mode_x = dirs[0];
      this.mode_y = dirs[1];
      this.$forceUpdate();
    },
    remove_dir(dir) {
      if (this.victory) {
        return;
      }
      for (let j = 0; j < this.placed_words[dir].length; j++) {
        this.placed_words[dir][j] = 0;
      }
      let old_words = this.placed_words;
      this.reset();
      for (let i = 0; i < old_words.length; i++) {
        for (let j = 0; j < old_words[i].length; j++) {
          if (old_words[i][j] == 0) {
            continue;
          }
          let dirs = this.get_dirxy(i);
          this.add_word(
            old_words[i][j][0],
            old_words[i][j][1],
            j,
            dirs[0],
            dirs[1]
          );
        }
      }
      this.check_victory();
      this.$forceUpdate();
    },
    remove_word(dir, index) {
      if (this.placed_words[dir][index] == 0) {
        return;
      }
      if (this.victory) {
        return;
      }
      this.placed_words[dir][index] = 0;
      let old_words = this.placed_words;
      this.reset();
      for (let i = 0; i < old_words.length; i++) {
        for (let j = 0; j < old_words[i].length; j++) {
          if (old_words[i][j] == 0) {
            continue;
          }
          let dirs = this.get_dirxy(i);
          this.add_word(
            old_words[i][j][0],
            old_words[i][j][1],
            j,
            dirs[0],
            dirs[1]
          );
        }
      }
      this.check_victory();
      this.$forceUpdate();
    },
    check_victory() {
      this.victory = true;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] != this.values[i][j]) {
            this.victory = false;
            return;
          }
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
              this.$router.push("/search-initial");
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
                  this.$router.push("/search-initial");
                });
              } else {
                this.$router.push("/search-initial");
              }
            }
          }
        });
      }
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
      <div class="my_row">
        <h4 class="display-4">
          <va-icon size="large" name="text_rotation_none"></va-icon>
          &nbsp; Igraj inicijalnu osmosmjerku
        </h4>
      </div> 
    <br /><br />  
      <va-divider></va-divider> 
        <va-tabs>
          <template #tabs>
            <va-tab disabled
              ><va-icon name="timer" />&nbsp; {{ format(time_elapsed) }}</va-tab
            >
            <va-tab @click="$refs.description.show()"
              ><va-icon name="info"></va-icon>&nbsp;  Pomoć
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
          <va-tab v-if="checkIdentity()">
            <router-link
              v-bind:to="{
                name: 'edit_initial',
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
                name: 'create_initial',
                params: { id: $route.params.id }, 
              }"
            >
              <va-icon name="add_circle"></va-icon>
              &nbsp; Nova zagonetka
            </router-link>
          </va-tab>
          <va-tab>
            <router-link
              v-bind:to="{
                name: 'search_initial', 
              }"
            >
              <va-icon name="search"></va-icon>
              &nbsp; Popis inicijalnih osmosmjerki
            </router-link>
          </va-tab>
          </template>
        </va-tabs>  
    <va-divider></va-divider>  
      <h4 class="display-4">Zagonetka</h4>
      <va-divider></va-divider> 
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
        :some_text="'Povećanje %'"
        :is_zoom="true"
      ></MyCounter>
    </div>
    <div class="my_row" v-if="current_x != null && current_y != null">
      <va-chip
        ><va-icon name="my_location" /> &nbsp;  Zadnja lokacija ({{ current_x }},
        {{ current_y }})</va-chip
      >
    </div>
    <div class="my_row" style="max-height: 400px">
      <va-infinite-scroll disabled :load="() => {}">
        <div>
          <table class="words_table" id="table_zoom">
            <tr v-for="i in rows" v-bind:key="i">
              <td
                v-for="j in columns"
                v-bind:key="j"
                @click="
                  place_word(j - 1, i - 1, word_index, mode_x, mode_y, true)
                "
                @mouseover="
                  current_x = i;
                  current_y = j;
                "
                :class="{
                  wrong:
                    values[i - 1][j - 1] != solution[i - 1][j - 1] &&
                    show_error,
                  help: check_start(j - 1, i - 1, false),
                  special: is_special[i - 1][j - 1],
                }"
              >
                {{ values[i - 1][j - 1] }}
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>  
      <va-divider v-if="count_special()"></va-divider>
      <h4 class="display-4" v-if="count_special()">Rješenje</h4>
      <va-divider v-if="count_special()"></va-divider>
    <div class="my_row" v-if="count_special()"> 
      <span v-for="i in rows" v-bind:key="i">
        <span v-for="j in columns" v-bind:key="j">
          <va-chip
            outline
            square
            style="margin-left: 5px; margin-top: 5px"
            v-if="is_special[i - 1][j - 1]"
          >
            <span v-if="values[i - 1][j - 1] != ''">
              {{ values[i - 1][j - 1] }}
            </span>
            <span v-else>?</span>
          </va-chip>
        </span>
      </span>
    </div>  
    <span 
      v-if="
        words_by_dir[0].length +
          words_by_dir[1].length +
          words_by_dir[2].length +
          words_by_dir[3].length +
          words_by_dir[4].length +
          words_by_dir[5].length +
          words_by_dir[6].length +
          words_by_dir[7].length >
        0
      ">
    <br />
    <br /></span> 
      <va-divider></va-divider>
      <h4 class="display-4">Riječi po smjerovima</h4>
      <va-divider></va-divider> 
      <va-button style="overflow-wrap: anywhere" @click="reset()">
        <va-icon name="delete" />
        &nbsp; Izbriši sve</va-button
      > 
      <va-tabs v-model="dir_to_display">
        <template #tabs>
          <va-tab v-if="words_by_dir[0].length > 0" name="0">
            <span>&#8598;</span>
          </va-tab>
          <span v-for="(words_in_dir, i) in words_by_dir" v-bind:key="i">
            <va-tab v-if="words_in_dir.length > 0 && i > 0" :name="i">
              <span v-if="i == 1">&#8592;</span>
              <span v-if="i == 2">&#8601;</span>
              <span v-if="i == 3">&#8593;</span>
              <span v-if="i == 4">&#8595;</span>
              <span v-if="i == 5">&#8599;</span>
              <span v-if="i == 6">&#8594;</span>
              <span v-if="i == 7">&#8600;</span>
            </va-tab>
          </span>
        </template>
      </va-tabs> 
    <div
      class="my_row"
      v-if="
        dir_to_display != null && words_by_dir[dir_to_display].length  > 0
      "
    >
      <span v-for="(words_in_dir, i) in words_by_dir" v-bind:key="i">
        <va-chip
          outline
          v-if="words_in_dir.length > 0 && i == dir_to_display"
          style="padding: 20px; margin-left: 20px; margin-top: 20px"
        >
          <span>
            <span v-if="i == 0">&#8598;</span>
            <span v-if="i == 1">&#8592;</span>
            <span v-if="i == 2">&#8601;</span>
            <span v-if="i == 3">&#8593;</span>
            <span v-if="i == 4">&#8595;</span>
            <span v-if="i == 5">&#8599;</span>
            <span v-if="i == 6">&#8594;</span>
            <span v-if="i == 7">&#8600;</span>
            &nbsp; 
            <va-icon @click="remove_dir(i)" name="delete" />
            <br />
            <br />
            <div style="max-height: 200px">
              <va-infinite-scroll disabled :load="() => {}">
                <div v-for="(word, j) in words_in_dir" v-bind:key="j">
                  <span
                    @click="select_word(i, j)"
                    :class="{
                      selected: word_index == j && get_dir(mode_x, mode_y) == i,
                      placed: placed_words[i][j] != 0,
                    }"
                  >
                    {{ word[2] }}
                  </span>
                  &nbsp; 
                  <va-icon @click="remove_word(i, j)" name="delete" />
                </div>
              </va-infinite-scroll>
            </div>
          </span>
        </va-chip>
      </span>
    </div>  
      <va-divider></va-divider>
      <h4 class="display-4">Podaci o zagonetci</h4>
      <va-divider></va-divider>
      <div class="my_row" v-if="image">
        <img id="img" :src="imageURL" alt="Nema slike" style="width: 100%" />
      </div>
      <div class="my_row" v-if="!image">
        <va-alert
          style="white-space: pre-wrap"
          color="warning"
          title="Prazna slika"
          center
          
        >
          Niste dodali sliku uz zagonetku.
        </va-alert>
      </div>
      <div class="text-block" style="margin: 20px">
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          Naslov
        </h6>
        <p style="text-align: start">
          {{ title }}
        </p>
      </div>
      <div class="text-block" style="margin: 20px">
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          Opis
        </h6>
        <p style="text-align: start">
          {{ description }}
        </p>
      </div>
      <div class="text-block" style="margin: 20px">
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          Izvor
        </h6>
        <p style="text-align: start">
          {{ source }}
        </p>
      </div>
      <div class="my_row">
        <span class="display-6" style="margin-left: 10px"
          >Autor zagonetke: {{ authorUserRecord.displayName }}
          <router-link :to="'/profile/' + authorUserRecord.email"
            >({{ authorUserRecord.email }})</router-link
          >
        </span>
        <span class="display-6" style="margin-left: 10px">
          Vrijeme kreiranja: {{ time_created.toLocaleString() }}</span
        >
      </div>
      <div class="my_row">
        <span class="display-6" style="margin-left: 10px"
          >Zadnji ažurirao: {{ updaterUserRecord.displayName }}
          <router-link :to="'/profile/' + updaterUserRecord.email"
            >({{ updaterUserRecord.email }})</router-link
          >
        </span>
        <span class="display-6" style="margin-left: 10px">
          Vrijeme zadnje izmjene: {{ last_updated.toLocaleString() }}</span
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
  <va-modal
    :mobile-fullscreen="false"
    ref="description"
    hide-default-actions
    stateful
  >
    <InitialInfo></InitialInfo> 
  </va-modal>
</template>

<style scoped>
.words_table {
  display: inline-table;
  border: 1px solid black;
  border-collapse: collapse;
}
.words_table tr {
  border: 1px solid black;
  border-collapse: collapse;
}
.words_table td {
  border: 1px solid black;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  text-align: center;
  vertical-align: middle;
  border-collapse: collapse;
}
.special {
  background-color: salmon;
}

.help {
  font-weight: bold;
  background-color: #90beee;
}
.wrong {
  color: #de1041;
}
.placed {
  text-decoration: line-through;
}

.selected {
  color: #40e583;
}
</style>
