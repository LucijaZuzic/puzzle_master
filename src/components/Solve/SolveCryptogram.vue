<script>
import { ref, getDownloadURL } from "firebase/storage";
import { cryptogramsRecordsRef, projectStorage } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usersRef, friendsRef } from "../../firebase_main.js";
import { cryptogramsRef } from "../../firebase_main.js";
import CryptogramInfo from "../Info/CryptogramInfo.vue";

import MyCounter from "../Utility/MyCounter.vue";
import LoadingBar from "../Utility/LoadingBar.vue";

export default {
  components: {
    MyCounter,
    LoadingBar,
    CryptogramInfo,
  },
  data() {
    return {
      value: [false, false, false, false],
      zoom: 100,
      max_zoom: 200,
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
      unnumbered: [[]],
      unnumbered_text: [[]],
      num_letters: 1,
      rows: 1,
      columns: 1,
      option_number: -1,
      option: [[]],
      new_options: [[]],
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
      letters: [["", "", ""]],
      letters_revealed: [[0, 0, 0]],
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
    check_duplicated(x, y) {
      for (let i = 0; i < this.values.length; i++) {
        for (let j = 0; j < 3; j++) {
          if (x == i && y == j) {
            continue;
          }
          if (this.values[i][j] == this.values[x][y]) {
            return true;
          }
        }
      }
      return false;
    },
    check_letter() {
      this.letter_alert = "";
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          this.values[i][j] = this.values[i][j].toUpperCase();
          if (!this.alphabet.includes(this.values[i][j])) {
            if (this.letter_alert != "") {
              this.letter_alert += " ";
            }
            this.letter_alert +=
              j +
              1 +
              ". opcija za " +
              i +
              ". slovo (" +
              this.values[i][j] +
              ") nije u zadanoj abecedi.";
          }
        }
      }
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < this.num_letters; j++) {
          for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
              if (i > j || (i == j && k >= l)) {
                continue;
              }
              if (this.values[i][k] == this.values[j][l]) {
                if (this.letter_alert != "") {
                  this.letter_alert += " ";
                }
                this.letter_alert +=
                  k +
                  1 +
                  ". opcija za " +
                  i +
                  ". slovo (" +
                  this.values[i][k] +
                  ") i " +
                  (l + 1) +
                  ". opcija za " +
                  j +
                  ". slovo (" +
                  this.values[j][l] +
                  ") su jednake.";
              }
            }
          }
        }
      }
      for (let i = 0; i < this.unnumbered_text.length; i++) {
        for (let j = 0; j < this.unnumbered_text[i].length; j++) {
          if (this.unnumbered_text[i][j] && this.unnumbered[i][j] == 1) {
            this.unnumbered_text[i][j] =
              this.unnumbered_text[i][j].toUpperCase();
          }
        }
      }
      this.$forceUpdate();
    },
    shuffleOrder() {
      let new_order = [];
      let old_letters = [];
      let old_revealed = [];
      for (let i = 0; i < this.num_letters; i++) {
        old_letters.push(this.letters[i]);
        old_revealed.push(this.letters_revealed[i]);
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
        this.letters_revealed[new_order[i]] = old_revealed[i];
      }
      for (let i = 0; i < this.num_letters; i++) {
        this.shuffleOneLetter(i);
      }
    },
    shuffleOneLetter(letter_number) {
      let new_order = [];
      let old_letters = [];
      let old_revealed = [];
      for (let i = 0; i < this.letters[letter_number].length; i++) {
        old_letters.push(this.letters[letter_number][i]);
        old_revealed.push(this.letters_revealed[letter_number][i]);
        let new_index = Math.floor(
          Math.random() * this.letters[letter_number].length
        );
        while (new_order.includes(new_index)) {
          new_index = Math.floor(
            Math.random() * this.letters[letter_number].length
          );
        }
        new_order.push(new_index);
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == letter_number) {
            for (let l = 0; l < this.letters[letter_number].length; l++) {
              if (this.option[i][j] == l) {
                this.option[i][j] = new_order[l];
                break;
              }
            }
          }
        }
      }
      for (let i = 0; i < this.letters[letter_number].length; i++) {
        this.letters[letter_number][new_order[i]] = old_letters[i];
        this.letters_revealed[letter_number][new_order[i]] = old_revealed[i];
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
      let oldunnumbered = [];
      let oldoption = [];
      let oldtop = [];
      let oldbottom = [];
      let oldleft = [];
      let oldright = [];
      let maxcol = this.columns;
      let maxrow = this.rows;
      if (this.solution) {
        oldsolution = this.solution;
        oldisspecial = this.is_special;
        oldunnumbered = this.unnumbered;
        oldoption = this.option;
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
      this.unnumbered = [];
      this.unnumbered_text = [];
      this.new_options = [];
      this.option = [];
      this.border_top = [];
      this.border_bottom = [];
      this.border_left = [];
      this.border_right = [];
      for (let i = 0; i < maxrow; i++) {
        let solution_row = [];
        let special_row = [];
        this.unnumbered.push([]);
        this.unnumbered_text.push([]);
        this.new_options.push([]);
        this.option.push([]);
        this.border_top.push([]);
        this.border_bottom.push([]);
        this.border_left.push([]);
        this.border_right.push([]);
        for (let j = 0; j < maxcol; j++) {
          this.unnumbered_text[i].push("");
          this.new_options[i].push(-1);
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              solution_row.push(oldsolution[i][j]);
              special_row.push(oldisspecial[i][j]);
              this.unnumbered[i].push(oldunnumbered[i][j]);
              this.option[i].push(oldoption[i][j]);
              this.border_top[i].push(oldtop[i][j]);
              this.border_bottom[i].push(oldbottom[i][j]);
              this.border_left[i].push(oldleft[i][j]);
              this.border_right[i].push(oldright[i][j]);
            } else {
              solution_row.push(-2);
              special_row.push(0);
              this.unnumbered[i].push(0);
              this.option[i].push(-1);
              this.border_top[i].push(0);
              this.border_bottom[i].push(0);
              this.border_left[i].push(0);
              this.border_right[i].push(0);
            }
          } else {
            solution_row.push(-2);
            special_row.push(0);
            this.unnumbered[i].push(0);
            this.option[i].push(-1);
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
      let oldlettersrevealed = [];
      let maxletters = this.num_letters;
      if (this.letters) {
        oldletters = this.letters;
        oldlettersrevealed = this.letters_revealed;
        if (oldletters.length > maxletters) {
          maxletters = oldletters.length;
        }
      }
      this.values = [];
      this.letters = [];
      this.letters_revealed = [];
      for (let i = 0; i < maxletters; i++) {
        if (oldletters.length > i) {
          this.letters.push(oldletters[i]);
          this.values.push([]);
          this.letters_revealed.push(oldlettersrevealed[i]);
          for (let j = 0; j < 3; j++) {
            if (this.letters_revealed[i][j] == 1) {
              this.values[i].push(this.letters[i][j]);
            } else {
              this.values[i].push("");
            }
          }
        } else {
          this.letters.push(["", "", ""]);
          this.values.push(["", "", ""]);
          this.letters_revealed.push([0, 0, 0]);
        }
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
      let string_unnumbered = [];
      let string_option = [];
      let string_top = [];
      let string_bottom = [];
      let string_left = [];
      let string_right = [];
      let string_letters = [];
      let string_letters_revealed = [];
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
      cryptogramsRef
        .get(params_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == params_id) {
              string_solution = funct_ref(childSnapshot.get("solution"));
              string_is_special = funct_ref(childSnapshot.get("is_special"));
              string_unnumbered = funct_ref(childSnapshot.get("unnumbered"));
              string_option = funct_ref(childSnapshot.get("option"));
              string_top = funct_ref(childSnapshot.get("border_top"));
              string_bottom = funct_ref(childSnapshot.get("border_bottom"));
              string_left = funct_ref(childSnapshot.get("border_left"));
              string_right = funct_ref(childSnapshot.get("border_right"));
              string_letters = funct_ref(childSnapshot.get("letters"));
              string_letters_revealed = funct_ref(
                childSnapshot.get("letters_revealed")
              );
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
            this.unnumbered = string_unnumbered;
            this.option = string_option;
            this.border_top = string_top;
            this.border_bottom = string_bottom;
            this.border_left = string_left;
            this.border_right = string_right;
            this.letters = string_letters;
            this.letters_revealed = string_letters_revealed;
            this.image = string_image;
            this.oldimage = this.image;
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
              this.$router.push("/search-cryptogram");
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
      cryptogramsRecordsRef.add({
        puzzleID: this.$route.params.id,
        user: this.user.uid,
        score: this.time_elapsed,
        time: datetime,
      });
    },
    findLetter(some_letter) {
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.values[i][j] == some_letter) {
            return true;
          }
        }
      }
      return false;
    },
    check_victory() {
      this.victory = true;
      for (let i = 0; i < this.unnumbered.length; i++) {
        for (let j = 0; j < this.unnumbered[i].length; j++) {
          if (
            this.unnumbered[i][j] == 1 &&
            // this.unnumbered_text[i][j] &&
            this.solution[i][j] != -1 &&
            this.option[i][j] != -1 &&
            this.unnumbered_text[i][j] !=
              this.letters[this.solution[i][j]][this.option[i][j]]
          ) {
            this.victory = false;
            return;
          }
        }
      }
      for (let i = 0; i < this.values.length; i++) {
        for (let j = 0; j < this.values[i].length; j++) {
          if (this.letters[i][j] != this.values[i][j]) {
            this.victory = false;
            return;
          }
        }
      }
      for (let i = 0; i < this.option.length; i++) {
        for (let j = 0; j < this.option[i].length; j++) {
          if (
            this.unnumbered[i][j] == 0 &&
            this.option[i][j] != -1 &&
            this.option[i][j] != this.new_options[i][j]
          ) {
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
              this.$router.push("/search-cryptogram");
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
                  this.$router.push("/search-cryptogram");
                });
              } else {
                this.$router.push("/search-cryptogram");
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
        for (let j = 0; j < this.letters[i].length; j++) {
          this.values[i][j] = this.letters[i][j];
        }
      }
      for (let i = 0; i < this.unnumbered_text.length; i++) {
        for (let j = 0; j < this.unnumbered_text[i].length; j++) {
          if (this.unnumbered[i][j] == 1) {
            this.unnumbered_text[i][j] =
              this.letters[this.solution[i][j]][this.option[i][j]];
          }
        }
      }
      for (let i = 0; i < this.option.length; i++) {
        for (let j = 0; j < this.option[i].length; j++) {
          this.new_options[i][j] = this.option[i][j];
        }
      }
      this.check_victory();
      this.$forceUpdate();
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
    getErrorMessage(i, j) {
      let value = this.unnumbered_text[i - 1][j - 1];
      if (this.findLetter(value) == false) {
        if (this.alphabet.includes(value)) {
          if (this.show_error == false) {
            return "Nije na popisu.";
          } else {
            if (
              value !=
              this.letters[this.solution[i - 1][j - 1]][
                this.option[i - 1][j - 1]
              ]
            ) {
              return "Netočno i nije na popisu.";
            } else {
              return "Nije na popisu.";
            }
          }
        } else {
          if (this.show_error == false) {
            return "Nije na popisu ni u abecedi.";
          } else {
            if (
              value !=
              this.letters[this.solution[i - 1][j - 1]][
                this.option[i - 1][j - 1]
              ]
            ) {
              return "Netočno, nije na popisu ni u abecedi.";
            } else {
              return "Nije na popisu ni u abecedi.";
            }
          }
        }
      } else {
        if (this.alphabet.includes(value)) {
          if (this.show_error == false) {
            return "";
          } else {
            if (
              value !=
              this.letters[this.solution[i - 1][j - 1]][
                this.option[i - 1][j - 1]
              ]
            ) {
              return "Netočno.";
            } else {
              return "";
            }
          }
        } else {
          if (this.show_error == false) {
            return "Nije u abecedi.";
          } else {
            if (
              value !=
              this.letters[this.solution[i - 1][j - 1]][
                this.option[i - 1][j - 1]
              ]
            ) {
              return "Netočno i nije u abecedi.";
            } else {
              return "Nije u abecedi.";
            }
          }
        }
      }
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
    if (this.$refs.unnumberedform) {
      for (let i = 0; i < this.$refs.unnumberedform.length; i++) {
        if (this.$refs.unnumberedform[i]) {
          this.$refs.unnumberedform[i].validate();
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
    if (this.$refs.unnumberedform) {
      for (let i = 0; i < this.$refs.unnumberedform.length; i++) {
        if (this.$refs.unnumberedform[i]) {
          this.$refs.unnumberedform[i].validate();
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
    <h4 class="display-4">
      <va-icon size="large" name="multiple_stop"></va-icon>
      &nbsp; Igraj kriptogram
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
              name: 'search_cryptogram',
            }"
          >
            <va-icon name="search"></va-icon>
            &nbsp; Popis zagonetki
          </router-link>
        </va-tab>
        <va-tab v-if="checkIdentity()">
          <router-link
            v-bind:to="{
              name: 'edit_cryptogram',
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
              name: 'create_cryptogram',
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
        Ispuna mreže &nbsp;
        <va-icon v-if="!value[0]" name="expand_more"></va-icon>
        <va-icon v-if="value[0]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[0]">
      <h6 class="display-6" style="text-align: start">Opcije</h6>
      <br />
      <va-tabs v-model="option_number">
        <template #tabs>
          <va-tab name="-1"> Bez opcije </va-tab>
          <va-tab name="0"> 1. opcija </va-tab>
          <va-tab name="1"> 2. opcija </va-tab>
          <va-tab name="2"> 3. opcija </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Slova &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1]">
      <div style="overflow-x: scroll">
        <table style="display: inline-table">
          <tr v-for="j in 3" v-bind:key="j">
            <td v-for="i in num_letters" v-bind:key="i">
              <va-form ref="lettersform">
                <va-input
                  maxlength="2"
                  @click="option_number = j - 1"
                  @update:model-value="check_letter()"
                  v-model="values[i - 1][j - 1]"
                  style="
                    width: 100px;
                    min-width: 100px;
                    max-width: 100px;
                    margin-left: 10px;
                    margin-bottom: 10px;
                  "
                  type="text"
                  :label="'' + (i - 1) + ' (' + j + ')'"
                  :readonly="letters_revealed[i - 1][j - 1] == 1"
                  immediate-validation
                  :rules="[
                    (value) => {
                      if (check_duplicated(i - 1, j - 1) == 1) {
                        if (alphabet.includes(value)) {
                          if (show_error == false) {
                            return 'Udvostručeno.';
                          } else {
                            if (values[i - 1][j - 1] != letters[i - 1][j - 1]) {
                              return 'Netočno i udvostručeno.';
                            } else {
                              return 'Udvostručeno.';
                            }
                          }
                        } else {
                          if (show_error == false) {
                            return 'Udvostručeno i nije u abecedi.';
                          } else {
                            if (values[i - 1][j - 1] != letters[i - 1][j - 1]) {
                              return 'Netočno, udvostručeno i nije u abecedi.';
                            } else {
                              return 'Udvostručeno i nije u abecedi.';
                            }
                          }
                        }
                      } else {
                        if (alphabet.includes(value)) {
                          if (show_error == false) {
                            return true;
                          } else {
                            if (values[i - 1][j - 1] != letters[i - 1][j - 1]) {
                              return 'Netočno.';
                            } else {
                              return true;
                            }
                          }
                        } else {
                          if (show_error == false) {
                            return 'Nije u abecedi.';
                          } else {
                            if (values[i - 1][j - 1] != letters[i - 1][j - 1]) {
                              return 'Netočno i nije u abecedi.';
                            } else {
                              return 'Nije u abecedi.';
                            }
                          }
                        }
                      }
                    },
                  ]"
                >
                </va-input>
              </va-form>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[2] = !value[2]"
        class="display-6"
        style="text-align: start"
      >
        Zagonetka &nbsp;
        <va-icon v-if="!value[2]" name="expand_more"></va-icon>
        <va-icon v-if="value[2]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[2]">
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
      <div style="max-height: 500px; overflow-y: scroll; overflow-x: scroll">
        <table class="numbers_table" id="table_zoom">
          <tr v-for="i in rows" v-bind:key="i">
            <td
              v-for="j in columns"
              v-bind:key="j"
              @click="
                new_options[i - 1][j - 1] = option_number;
                check_victory();
              "
              @mouseover="
                current_x = i;
                current_y = j;
              "
              :class="{
                unnumbered_cell: unnumbered[i - 1][j - 1] == 1,
                black: solution[i - 1][j - 1] == -1,
                special: is_special[i - 1][j - 1] == 1,
                wrong:
                  (show_error &&
                    new_options[i - 1][j - 1] != option[i - 1][j - 1]) ||
                  (solution[i - 1][j - 1] != -2 &&
                    solution[i - 1][j - 1] != -1 &&
                    new_options[i - 1][j - 1] != -1 &&
                    values[solution[i - 1][j - 1]][new_options[i - 1][j - 1]] !=
                      letters[solution[i - 1][j - 1]][
                        new_options[i - 1][j - 1]
                      ]),
                bordertop: border_top[i - 1][j - 1] == 1,
                borderbottom: border_bottom[i - 1][j - 1] == 1,
                borderleft: border_left[i - 1][j - 1] == 1,
                borderright: border_right[i - 1][j - 1] == 1,
              }"
            >
              <div v-if="unnumbered[i - 1][j - 1] == 0">
                <sup
                  v-if="
                    solution[i - 1][j - 1] != -2 && solution[i - 1][j - 1] != -1
                  "
                >
                  {{ solution[i - 1][j - 1] }}
                </sup>
                &nbsp;
                <span
                  v-if="
                    solution[i - 1][j - 1] != -2 &&
                    solution[i - 1][j - 1] != -1 &&
                    new_options[i - 1][j - 1] != -1
                  "
                >
                  {{
                    values[solution[i - 1][j - 1]][new_options[i - 1][j - 1]]
                  }}
                </span>
              </div>
              <div v-else>
                <input
                  maxlength="2"
                  :class="{
                    unnumbered_input: true,
                    wrong: getErrorMessage(i, j) != '',
                  }"
                  type="text"
                  v-model="unnumbered_text[i - 1][j - 1]"
                  @input="check_letter()"
                />
                <va-icon
                  name="warning"
                  class="wrong"
                  v-if="getErrorMessage(i, j) != ''"
                  @click="$vaToast.init(getErrorMessage(i, j))"
                  size="small"
                >
                </va-icon>
              </div>
            </td>
          </tr>
        </table>
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
      <img
        v-if="image"
        id="img"
        :src="imageURL"
        alt=""
        style="max-width: 500px; width: 100%"
      />
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
        <va-button outline :rounded="false" style="border: none"
          ><router-link :to="'/profile/' + authorUserRecord.email">
            <va-icon name="person" /> &nbsp; Autor zagonetke:
            {{ authorUserRecord.displayName }}
            ({{ authorUserRecord.email }})
          </router-link></va-button
        >
      </div>
      <br />
      <div style="text-align: start">
        <span style="font-weight: bold"> Vrijeme kreiranja: </span>
        {{ time_created.toLocaleString() }}
      </div>
      <br />
      <div style="text-align: start">
        <va-button outline :rounded="false" style="border: none"
          ><router-link :to="'/profile/' + updaterUserRecord.email">
            <va-icon name="person" /> &nbsp; Zadnji ažurirao:
            {{ updaterUserRecord.displayName }}
            ({{ updaterUserRecord.email }})
          </router-link></va-button
        >
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
    <CryptogramInfo></CryptogramInfo>
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
  font-weight: bold;
  color: white;
}
.unnumbered_cell {
  background-color: #fdefef !important;
}
.unnumbered_input {
  width: 24px;
  text-align: center;
  vertical-align: middle;
  display: inline-block;
  background-color: #fdefef !important;
  border: none;
}
.wrong {
  color: #de1041 !important;
}
.bordertop {
  border-top: dashed !important;
}
.borderbottom {
  border-bottom: dashed !important;
}
.borderleft {
  border-left: dashed !important;
}
.borderright {
  border-right: dashed !important;
}
</style>
