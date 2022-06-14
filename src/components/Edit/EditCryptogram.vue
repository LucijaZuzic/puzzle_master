<script>
import {
  ref,
  getBytes,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { projectStorage, friendsRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usersRef } from "../../firebase_main.js";
import {
  cryptogramsRef,
  cryptogramsRatingsRef,
  cryptogramsRecordsRef,
} from "../../firebase_main.js";
import MyCounter from "../Utility/MyCounter.vue";
import CryptogramInfo from "../Info/CryptogramInfo.vue";
import LoadingBar from "../Utility/LoadingBar.vue";

export default {
  props: ["edit"],
  components: {
    MyCounter,
    LoadingBar,
    CryptogramInfo,
  },
  data() {
    return {
      value: [false, false, false, false, false, false, false],
      zoom: 100,
      max_zoom: 200,
      row_counter_min: 2,
      row_counter_max: 50,
      column_counter_min: 2,
      column_counter_max: 50,
      fully_loaded: false,
      border_top: [[]],
      border_bottom: [[]],
      border_left: [[]],
      border_right: [[]],
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      time_created: "",
      last_updated: "",
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      permission_to_edit_visibility: false,
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
      option: [[]],
      is_special: [[]],
      unnumbered: [[]],
      num_letters: 11,
      rows: 22,
      columns: 23,
      use_option: false,
      use_mode: true,
      mode: -2,
      option_number: -1,
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
      value_to_randomize: "letters",
      randomize_all: false,
      keep_black: true,
      current_x: null,
      current_y: null,
    };
  },
  methods: {
    deletePuzzle() {
      let id = this.$route.params.id;
      cryptogramsRef
        .doc(id)
        .delete()
        .then(() => {
          this.$vaToast.init("Zagonetka je uspješno izbrisana.");
          this.$router.push("/search-cryptogram");
        })
        .then(() => {
          cryptogramsRatingsRef
            .get()
            .then(function (snapshotRating) {
              snapshotRating.forEach(function (childSnapshotRating) {
                let idPuzzle = childSnapshotRating.get("puzzleID");
                let idRating = childSnapshotRating.id;
                if (idPuzzle == id) {
                  cryptogramsRatingsRef
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
              cryptogramsRecordsRef.get().then(function (snapshotRecord) {
                snapshotRecord.forEach(function (childSnapshotRecord) {
                  let idPuzzle = childSnapshotRecord.get("puzzleID");
                  let idRecord = childSnapshotRecord.id;
                  if (idPuzzle == id) {
                    cryptogramsRecordsRef
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
          const listRef = ref(projectStorage, "cryptogram/");
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
    checkIdentity() {
      this.permission_to_edit_visibility = false;
      if (this.author == this.user.uid) {
        this.permission_to_edit_visibility = true;
        return;
      }
      let is_collaborator = false;
      for (let i = 0; i < this.permissions.length; i++) {
        if (this.permissions[i] == this.user.uid) {
          is_collaborator = true;
          break;
        }
      }
      if (is_collaborator == true) {
        this.permission_to_edit_visibility = false;
        return;
      } else {
        if (this.is_public == true) {
          this.permission_to_edit_visibility = false;
          return;
        } else {
          this.new_async(
            this.$vaToast.init(
              "Ne možete uređivati zagonetku jer niste autor niti suradnik."
            ),
            1000
          ).then(() => {
            this.$router.push("/search-cryptogram");
          });
        }
      }
    },
    checkIfUserExists() {
      let email = this.collaborator;
      let found = false;
      let hidden = true;
      let uid = "";
      let me = null;
      let my_activity = this;
      if (this.user) {
        me = this.user.uid;
      }
      if (this.user.email == email) {
        this.$vaToast.init("Ne možete dodati samog sebe kao suradnika.");
      } else {
        usersRef.get().then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let some_id = childSnapshot.id;
            let displayName = childSnapshot.get("displayName");
            let some_email = childSnapshot.get("email");
            let visibility = childSnapshot.get("visible");
            if (email == some_email) {
              found = true;
              uid = childSnapshot.id;
              if (visibility == true || me == some_id) {
                hidden = false;
              }
              friendsRef
                .get()
                .then(function (snapshotUser) {
                  snapshotUser.forEach(function (childSnapshotUser) {
                    let id1 = childSnapshotUser.get("user1");
                    let id2 = childSnapshotUser.get("user2");
                    if (
                      (id1 == me && id2 == some_id) ||
                      (id2 == me && id1 == some_id)
                    ) {
                      hidden = false;
                    }
                  });
                })
                .then(() => {
                  if (found == true) {
                    if (hidden == true) {
                      my_activity.$vaToast.init(
                        "Ne možete dodati suradnika jer niste prijatelji."
                      );
                    } else {
                      let duplicate = false;
                      for (let i = 0; i < this.permissions.length; i++) {
                        if (my_activity.permissions[i] == uid) {
                          duplicate = true;
                          break;
                        }
                      }
                      if (duplicate == true) {
                        my_activity.$vaToast.init(
                          "Ne možete dodati istog suradnika dvaput."
                        );
                      } else {
                        my_activity.permissions.push(uid);
                        my_activity.permissionsUserRecords.push({
                          displayName: displayName,
                          email: email,
                        });
                      }
                    }
                  } else {
                    my_activity.$vaToast.init(
                      "Ne možete dodati suradnika jer ne postoji korisnik s tom email adresom."
                    );
                  }
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
      this.option = [];
      this.border_top = [];
      this.border_bottom = [];
      this.border_left = [];
      this.border_right = [];
      for (let i = 0; i < maxrow; i++) {
        let solution_row = [];
        let special_row = [];
        this.unnumbered.push([]);
        this.option.push([]);
        this.border_top.push([]);
        this.border_bottom.push([]);
        this.border_left.push([]);
        this.border_right.push([]);
        for (let j = 0; j < maxcol; j++) {
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
      this.letters = [];
      this.letters_revealed = [];
      for (let i = 0; i < maxletters; i++) {
        if (oldletters.length > i) {
          this.letters.push(oldletters[i]);
          this.letters_revealed.push(oldlettersrevealed[i]);
        } else {
          this.letters.push(["", "", ""]);
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
    normalize_option() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1 || this.solution[i][j] == -2) {
            this.option[i][j] = -1;
            this.unnumbered[i][j] = 0;
          }
        }
      }
    },
    randomize_option() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1 || this.solution[i][j] == -2) {
            this.option[i][j] = -1;
          } else {
            this.option[i][j] = Math.floor(Math.random() * 3);
          }
        }
      }
    },
    randomize_option_if_not_set() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1 || this.solution[i][j] == -2) {
            this.option[i][j] = -1;
            continue;
          }
          if (this.option[i][j] != -1) {
            continue;
          }
          this.option[i][j] = Math.floor(Math.random() * 3);
        }
      }
    },
    resetOptions() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.option[i][j] = -1;
        }
      }
    },
    randomize() {
      this.solution = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.is_special[i][j] == 1 || this.unnumbered[i][j] == 1) {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          } else {
            solution_row.push(
              Math.floor(Math.random() * (this.num_letters + 1)) - 1
            );
          }
        }
        this.solution.push(solution_row);
      }
      this.normalize_option();
    },
    randomize_keep_black() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1) {
            solution_row.push(-1);
          } else {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.normalize_option();
    },
    fill_empty() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -2) {
            if (this.is_special[i][j] == 1 || this.unnumbered[i][j] == 1) {
              solution_row.push(Math.floor(Math.random() * this.num_letters));
            } else {
              solution_row.push(
                Math.floor(Math.random() * (this.num_letters + 1)) - 1
              );
            }
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.normalize_option();
    },
    fill_empty_keep_black() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -2) {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.normalize_option();
    },
    resetNumbers() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          solution_row.push(-2);
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.resetOptions();
    },
    resetLetters() {
      this.letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        this.letters.push(["", "", ""]);
      }
    },
    check_leters_exists(letter_new) {
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          if (
            this.letters[i] &&
            this.letters[i][j] &&
            this.letters[i][j] == letter_new
          ) {
            return true;
          }
        }
      }
      return false;
    },
    randomize_letters() {
      this.letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        this.letters.push([]);
        for (let j = 0; j < 3; j++) {
          let random_index = Math.floor(Math.random() * this.alphabet.length);
          while (this.check_leters_exists(this.alphabet[random_index])) {
            random_index = Math.floor(Math.random() * this.alphabet.length);
          }
          this.letters[i].push(this.alphabet[random_index]);
        }
      }
      this.$forceUpdate();
    },
    fill_empty_letters() {
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.alphabet.includes(this.letters[i][j])) {
            continue;
          }
          let random_index = Math.floor(Math.random() * this.alphabet.length);
          while (this.check_leters_exists(this.alphabet[random_index])) {
            random_index = Math.floor(Math.random() * this.alphabet.length);
          }
          this.letters[i][j] = this.alphabet[random_index];
        }
      }
    },
    remove_max_letter() {
      for (let i = 0; i < this.solution.length; i++) {
        for (let j = 0; j < this.solution[i].length; j++) {
          if (this.solution[i][j] >= this.num_letters) {
            this.solution[i][j] = -2;
            this.option[i][j] = -1;
            this.is_special[i][j] = 0;
            this.unnumbered[i][j] = 0;
          }
        }
      }
    },
    check_letter() {
      let letter_alert = "";
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          this.letters[i][j] = this.letters[i][j].toUpperCase();
          if (!this.alphabet.includes(this.letters[i][j])) {
            if (letter_alert != "") {
              letter_alert += " ";
            }
            letter_alert +=
              j +
              1 +
              ". opcija za " +
              i +
              ". slovo (" +
              this.letters[i][j] +
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
              if (this.letters[i][k] == this.letters[j][l]) {
                if (letter_alert != "") {
                  letter_alert += " ";
                }
                letter_alert +=
                  k +
                  1 +
                  ". opcija za " +
                  i +
                  ". slovo (" +
                  this.letters[i][k] +
                  ") i " +
                  (l + 1) +
                  ". opcija za " +
                  j +
                  ". slovo (" +
                  this.letters[j][l] +
                  ") su jednake.";
              }
            }
          }
        }
      }
      return letter_alert;
    },
    check_duplicated(x, y) {
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          if (x == i && y == j) {
            continue;
          }
          if (this.letters[i][j] == this.letters[x][y]) {
            return true;
          }
        }
      }
      return false;
    },
    add_unnumbered(x, y) {
      if (this.solution[x][y] == -1) {
        this.$vaToast.init("Ne možete sakriti broj na barijeri.");
        return;
      }
      if (this.solution[x][y] == -2) {
        this.$vaToast.init("Ne možete sakriti broj na polju bez broja.");
        return;
      }
      if (!(this.option[x][y] >= 0 && this.option[x][y] <= 2)) {
        this.$vaToast.init("Ne možete sakriti broj na polju bez opcije.");
        return;
      }
      if (this.unnumbered[x][y] != -1) {
        this.unnumbered[x][y] = (this.unnumbered[x][y] + 1) % 2;
        return;
      } else {
        this.unnumbered[x][y] = 1;
        return;
      }
    },
    change_number(x, y) {
      if (
        this.use_option == true &&
        this.use_mode == true &&
        this.mode >= 0 &&
        this.option_number >= 0 &&
        this.mode < this.num_letters &&
        this.option_number < 3
      ) {
        this.option[x][y] = this.option_number;
        this.solution[x][y] = this.mode;
        return;
      }
      if (this.use_option == true) {
        this.option[x][y] = this.option_number;
        if (this.solution[x][y] == -1 || this.solution[x][y] == -2) {
          this.option[x][y] = -1;
        }
      }
      if (this.use_mode == false) {
        return;
      }
      if (this.mode <= -4) {
        if (this.solution[x][y] == -1) {
          if (this.mode != -8) {
            this.$vaToast.init("Barijeri se ne može dodati brid.");
          } else {
            this.$vaToast.init("Ne možete sakriti broj na barijeri.");
          }
          return;
        }
        if (this.mode == -4) {
          if (x != 0 && this.solution[x - 1][y] != -1) {
            this.border_top[x][y] = (this.border_top[x][y] + 1) % 2;
            this.border_bottom[x - 1][y] =
              (this.border_bottom[x - 1][y] + 1) % 2;
          } else {
            this.$vaToast.init("Barijeri se ne može dodati brid.");
          }
        }
        if (this.mode == -5) {
          if (x != this.rows - 1 && this.solution[x + 1][y] != -1) {
            this.border_bottom[x][y] = (this.border_bottom[x][y] + 1) % 2;
            this.border_top[x + 1][y] = (this.border_top[x + 1][y] + 1) % 2;
          } else {
            this.$vaToast.init("Barijeri se ne može dodati brid.");
          }
        }
        if (this.mode == -6) {
          if (y != 0 && this.solution[x][y - 1] != -1) {
            this.border_left[x][y] = (this.border_left[x][y] + 1) % 2;
            this.border_right[x][y - 1] = (this.border_right[x][y - 1] + 1) % 2;
          } else {
            this.$vaToast.init("Barijeri se ne može dodati brid.");
          }
        }
        if (this.mode == -7) {
          if (y != this.columns - 1 && this.solution[x][y + 1] != -1) {
            this.border_right[x][y] = (this.border_right[x][y] + 1) % 2;
            this.border_left[x][y + 1] = (this.border_left[x][y + 1] + 1) % 2;
          } else {
            this.$vaToast.init("Barijeri se ne može dodati brid.");
          }
        }
        if (this.mode == -8) {
          this.add_unnumbered(x, y);
        }
        this.$forceUpdate();
        return;
      }
      if (this.mode == -3) {
        if (this.solution[x][y] == -1) {
          this.$vaToast.init("Barijera ne može biti dio rješenja.");
        } else {
          this.is_special[x][y] = (this.is_special[x][y] + 1) % 2;
        }
      } else {
        if (this.mode == -1) {
          if (this.is_special[x][y] == 1) {
            this.$vaToast.init(
              "Polje koje je dio rješenja ne može biti barijera."
            );
          } else {
            this.solution[x][y] = this.mode;
            this.border_bottom[x][y] = 0;
            this.border_top[x][y] = 0;
            this.border_left[x][y] = 0;
            this.border_right[x][y] = 0;
            if (x != 0) {
              this.border_bottom[x - 1][y] = 0;
            }
            if (x != this.rows - 1) {
              this.border_top[x + 1][y] = 0;
            }
            if (y != 0) {
              this.border_right[x][y - 1] = 0;
            }
            if (y != this.columns - 1) {
              this.border_left[x][y + 1] = 0;
            }
          }
        } else {
          this.solution[x][y] = this.mode;
        }
        if (this.solution[x][y] == -1 || this.solution[x][y] == -2) {
          this.option[x][y] = -1;
        }
      }
    },
    hasEmpty() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (
            !(
              this.solution[i][j] >= -1 &&
              this.solution[i][j] < this.num_letters
            )
          ) {
            return true;
          }
        }
      }
      return false;
    },
    hasEmptyOption() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] > -1 && this.option[i][j] == -1) {
            return true;
          }
        }
      }
      return false;
    },
    image_uploaded() {
      this.image = document.getElementById("fileinput").files[0];
      this.imageURL = URL.createObjectURL(this.image);
    },
    click_file() {
      document.getElementById("fileinput").click();
    },
    array_to_string(array) {
      let string = "[";
      for (let i = 0; i < array.length; i++) {
        if (i != 0) {
          string += ",";
        }
        string += "[";
        for (let j = 0; j < array[i].length; j++) {
          if (j != 0) {
            string += "\\,";
          }
          string += array[i][j];
        }
        string += "]";
      }
      return string + "]";
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
            this.checkIdentity();
            this.source = string_source;
            this.time_created = string_time_created;
            this.last_updated = string_last_updated;
            this.rows = this.solution.length;
            this.columns = this.solution[0].length;
            this.num_letters = this.letters.length;
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
    getPicture() {
      if (this.image == null || this.image == "") {
        this.imageURL = "";
        this.fully_loaded = true;
        return;
      }
      if (this.image && this.image.name == undefined) {
        var reference = ref(projectStorage, this.image);
        // Get the download URL
        getDownloadURL(reference)
          .then((url) => {
            this.imageURL = url;
            this.fully_loaded = true;
          })
          .catch((error) => {});
      } else {
        let comp_url = URL.createObjectURL(this.image);
        this.imageURL = comp_url;
        this.fully_loaded = true;
      }
    },
    store() {
      let params_id = this.$route.params.id;
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      let newunnnumbered = [];
      let newoption = [];
      let newtop = [];
      let newbottom = [];
      let newleft = [];
      let newright = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newunnnumbered.push([]);
        newoption.push([]);
        newtop.push([]);
        newbottom.push([]);
        newleft.push([]);
        newright.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newunnnumbered[i].push(this.unnumbered[i][j]);
          newoption[i].push(this.option[i][j]);
          newtop[i].push(this.border_top[i][j]);
          newbottom[i].push(this.border_bottom[i][j]);
          newleft[i].push(this.border_left[i][j]);
          newright[i].push(this.border_right[i][j]);
        }
      }
      let newletters = [];
      let newlettersrevealed = [];
      for (let i = 0; i < this.num_letters; i++) {
        newletters.push(this.letters[i]);
        newlettersrevealed.push(this.letters_revealed[i]);
      }
      cryptogramsRef
        .doc(params_id)
        .update({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          unnumbered: funct_ref(newunnnumbered),
          option: funct_ref(newoption),
          border_top: funct_ref(newtop),
          border_bottom: funct_ref(newbottom),
          border_left: funct_ref(newleft),
          border_right: funct_ref(newright),
          title: this.title,
          letters: funct_ref(newletters),
          letters_revealed: funct_ref(newlettersrevealed),
          description: this.description,
          author: this.author,
          image: "",
          updater: this.user.uid,
          is_public: this.is_public,
          permissions: this.permissions,
          source: this.source,
          time_created: this.time_created,
          last_updated: datetime,
        })
        .then((docRef) => {
          if (this.image && this.image != "") {
            if (this.image.name == undefined) {
              cryptogramsRef
                .doc(params_id)
                .update({
                  solution: funct_ref(newsolution),
                  is_special: funct_ref(newspecial),
                  unnumbered: funct_ref(newunnnumbered),
                  option: funct_ref(newoption),
                  border_top: funct_ref(newtop),
                  border_bottom: funct_ref(newbottom),
                  border_left: funct_ref(newleft),
                  border_right: funct_ref(newright),
                  title: this.title,
                  letters: funct_ref(newletters),
                  letters_revealed: funct_ref(newlettersrevealed),
                  description: this.description,
                  author: this.author,
                  image: this.image,
                  updater: this.user.uid,
                  is_public: this.is_public,
                  permissions: this.permissions,
                  source: this.source,
                  time_created: this.time_created,
                  last_updated: datetime,
                })
                .then(() => {
                  this.new_async(
                    this.$vaToast.init(
                      "Postojeća zagonetka je uspješno izmijenjena."
                    ),
                    1000
                  ).then(() => {
                    this.$router.push("/search-cryptogram");
                  });
                });
            } else {
              if (this.oldimage) {
                let oldRef = ref(projectStorage, this.oldimage);
                // Delete the file
                deleteObject(oldRef)
                  .then(() => {
                    // File deleted successfully
                  })
                  .catch((error) => {
                    // Uh-oh, an error occurred!
                  });
              }
              let exstension =
                this.image.name.split(".")[
                  this.image.name.split(".").length - 1
                ];
              const reference = "cryptogram/" + params_id + "." + exstension;
              const storageRef = ref(projectStorage, reference);
              const metadata = {
                contentType: "image/" + exstension,
              };
              // 'file' comes from the Blob or File API
              uploadBytes(storageRef, this.image, metadata)
                .then((snapshot) => {})
                .catch((error) => {})
                .then(() => {
                  let imageLocation = reference;
                  cryptogramsRef
                    .doc(params_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      unnumbered: funct_ref(newunnnumbered),
                      option: funct_ref(newoption),
                      title: this.title,
                      letters: funct_ref(newletters),
                      letters_revealed: funct_ref(newlettersrevealed),
                      description: this.description,
                      author: this.author,
                      image: imageLocation,
                      updater: this.user.uid,
                      is_public: this.is_public,
                      permissions: this.permissions,
                      source: this.source,
                      time_created: this.time_created,
                      last_updated: datetime,
                    })
                    .then(() => {
                      this.new_async(
                        this.$vaToast.init(
                          "Postojeća zagonetka je uspješno izmijenjena."
                        ),
                        1000
                      ).then(() => {
                        this.$router.push("/search-cryptogram");
                      });
                    });
                });
            }
          } else {
            this.new_async(
              this.$vaToast.init(
                "Postojeća zagonetka je uspješno izmijenjena."
              ),
              1000
            ).then(() => {
              this.$router.push("/search-cryptogram");
            });
          }
        });
    },
    duplicate() {
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      let newunnnumbered = [];
      let newoption = [];
      let newtop = [];
      let newbottom = [];
      let newleft = [];
      let newright = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newunnnumbered.push([]);
        newoption.push([]);
        newtop.push([]);
        newbottom.push([]);
        newleft.push([]);
        newright.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newunnnumbered[i].push(this.unnumbered[i][j]);
          newoption[i].push(this.option[i][j]);
          newtop[i].push(this.border_top[i][j]);
          newbottom[i].push(this.border_bottom[i][j]);
          newleft[i].push(this.border_left[i][j]);
          newright[i].push(this.border_right[i][j]);
        }
      }
      let newletters = [];
      let newlettersrevealed = [];
      for (let i = 0; i < this.num_letters; i++) {
        newletters.push(this.letters[i]);
        newlettersrevealed.push(this.letters_revealed[i]);
      }
      let newPermissions = [];
      let authorAdded = false;
      if (this.author == this.user.uid) {
        authorAdded = true;
      }
      for (let i = 0; i < this.permissions; i++) {
        if (this.permissions[i] != this.user.uid) {
          newPermissions.push(this.permissions[i]);
          if (this.permissions[i] == this.author) {
            authorAdded = true;
          }
        }
      }
      if (authorAdded == false) {
        newPermissions.push(this.author);
      }
      cryptogramsRef
        .add({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          unnumbered: funct_ref(newunnnumbered),
          option: funct_ref(newoption),
          border_top: funct_ref(newtop),
          border_bottom: funct_ref(newbottom),
          border_left: funct_ref(newleft),
          border_right: funct_ref(newright),
          title: this.title,
          letters: funct_ref(newletters),
          letters_revealed: funct_ref(newlettersrevealed),
          description: this.description,
          author: this.user.uid,
          image: "",
          updater: this.user.uid,
          is_public: this.is_public,
          permissions: newPermissions,
          source: this.source,
          time_created: datetime,
          last_updated: datetime,
        })
        .then((docRef) => {
          let some_id = docRef.id;
          if (this.image && this.image != "") {
            if (this.image.name == undefined) {
              var old_reference = ref(projectStorage, this.image);
              let exstension = "";
              // Get metadata properties
              getMetadata(old_reference).then((metadata) => {
                exstension = metadata.contentType.split("/")[1];
                console.log(exstension);
                const reference = "cryptogram/" + some_id + "." + exstension;
                console.log(this.image, reference);
                const storageRef = ref(projectStorage, reference);
                const new_metadata = {
                  contentType: "image/" + exstension,
                };
                // 'file' comes from the Blob or File API
                getBytes(old_reference).then((bytes) => {
                  uploadBytes(storageRef, bytes, new_metadata)
                    .then((snapshot) => {})
                    .catch((error) => {})
                    .then(() => {
                      let imageLocation = reference;
                      cryptogramsRef
                        .doc(some_id)
                        .update({
                          solution: funct_ref(newsolution),
                          is_special: funct_ref(newspecial),
                          unnumbered: funct_ref(newunnnumbered),
                          option: funct_ref(newoption),
                          border_top: funct_ref(newtop),
                          border_bottom: funct_ref(newbottom),
                          border_left: funct_ref(newleft),
                          border_right: funct_ref(newright),
                          title: this.title,
                          letters: funct_ref(newletters),
                          letters_revealed: funct_ref(newlettersrevealed),
                          description: this.description,
                          author: this.user.uid,
                          image: imageLocation,
                          updater: this.user.uid,
                          is_public: this.is_public,
                          permissions: newPermissions,
                          source: this.source,
                          time_created: datetime,
                          last_updated: datetime,
                        })
                        .then(() => {
                          this.new_async(
                            this.$vaToast.init(
                              "Nova zagonetka je uspješno spremljena."
                            ),
                            1000
                          ).then(() => {
                            this.$router.push("/search-cryptogram");
                          });
                        });
                    });
                });
              });
            } else {
              let exstension =
                this.image.name.split(".")[
                  this.image.name.split(".").length - 1
                ];
              const reference = "cryptogram/" + some_id + "." + exstension;
              const storageRef = ref(projectStorage, reference);
              const metadata = {
                contentType: "image/" + exstension,
              };
              // 'file' comes from the Blob or File API
              uploadBytes(storageRef, this.image, metadata)
                .then((snapshot) => {})
                .catch((error) => {})
                .then(() => {
                  let imageLocation = reference;
                  cryptogramsRef
                    .doc(some_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      unnumbered: funct_ref(newunnnumbered),
                      option: funct_ref(newoption),
                      border_top: funct_ref(newtop),
                      border_bottom: funct_ref(newbottom),
                      border_left: funct_ref(newleft),
                      border_right: funct_ref(newright),
                      title: this.title,
                      letters: funct_ref(newletters),
                      letters_revealed: funct_ref(newlettersrevealed),
                      description: this.description,
                      author: this.user.uid,
                      image: imageLocation,
                      updater: this.user.uid,
                      is_public: this.is_public,
                      permissions: newPermissions,
                      source: this.source,
                      time_created: datetime,
                      last_updated: datetime,
                    })
                    .then(() => {
                      this.new_async(
                        this.$vaToast.init(
                          "Nova zagonetka je uspješno spremljena."
                        ),
                        1000
                      ).then(() => {
                        this.$router.push("/search-cryptogram");
                      });
                    });
                });
            }
          } else {
            this.new_async(
              this.$vaToast.init("Nova zagonetka je uspješno spremljena."),
              1000
            ).then(() => {
              this.$router.push("/search-cryptogram");
            });
          }
        });
    },
    choose_reset_type() {
      if (this.value_to_randomize == "numbers") {
        this.resetNumbers();
      }
      if (this.value_to_randomize == "letters") {
        this.resetLetters();
      }
      if (this.value_to_randomize == "values") {
        this.resetOptions();
      }
    },
    choose_random_type() {
      if (this.value_to_randomize == "numbers") {
        if (this.randomize_all == true) {
          if (this.keep_black == true) {
            this.randomize_keep_black();
          } else {
            this.randomize();
          }
        } else {
          if (this.keep_black == true) {
            this.fill_empty_keep_black();
          } else {
            this.fill_empty();
          }
        }
      }
      if (this.value_to_randomize == "letters") {
        if (this.randomize_all == true) {
          this.randomize_letters();
        } else {
          this.fill_empty_letters();
        }
      }
      if (this.value_to_randomize == "values") {
        if (this.randomize_all == true) {
          this.randomize_option();
        } else {
          this.randomize_option_if_not_set();
        }
      }
    },
  },
  beforeMount() {
    if (this.$props.edit) {
      this.fetch_puzzle();
    } else {
      this.initialize();
      this.getPicture();
    }
    this.remove_max_letter();
    if (this.$refs.lettersform) {
      for (let i = 0; i < this.$refs.lettersform.length; i++) {
        if (this.$refs.lettersform[i]) {
          this.$refs.lettersform[i].validate();
        }
      }
    }
  },
  beforeUpdate() {
    this.initialize();
    this.remove_max_letter();
    if (this.$refs.lettersform) {
      for (let i = 0; i < this.$refs.lettersform.length; i++) {
        if (this.$refs.lettersform[i]) {
          this.$refs.lettersform[i].validate();
        }
      }
    }
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
        this.new_async(
          this.$vaToast.init(
            "Ne možete uređivati zagonetku jer niste prijavljeni."
          ),
          1000
        ).then(() => {
          this.$router.push("/login");
        });
      }
      return true;
    });
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
      &nbsp;
      <span v-if="edit">Uredi</span>
      <span v-else>Stvori</span>
      kriptogram
    </h4>
    <br />
    <va-divider></va-divider>
    <va-tabs>
      <template #tabs>
        <va-tab @click="$refs.description.show()">
          <va-icon name="info"></va-icon>
          &nbsp; Pomoć
        </va-tab>
        <va-tab v-if="edit">
          <router-link
            v-bind:to="{
              name: 'solve_cryptogram',
              params: { id: $route.params.id },
            }"
          >
            <va-icon name="play_arrow"></va-icon>
            &nbsp; Igraj
          </router-link>
        </va-tab>
        <va-tab v-if="edit">
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
        <va-tab v-if="edit" @click="$refs.delete_modal.show()">
          <va-icon name="delete" /> &nbsp; Izbriši zagonetku
        </va-tab>
        <va-tab
          v-if="edit"
          :disabled="
            !(
              edit &&
              check_letter() == '' &&
              !hasEmpty() &&
              !hasEmptyOption() &&
              title.length > 0 &&
              description.length > 0 &&
              source.length > 0
            )
          "
          @click="store()"
        >
          <va-icon name="mode_edit" /> &nbsp; Izmijeni zagonetku
        </va-tab>
        <va-tab
          :disabled="
            !(
              check_letter() == '' &&
              !hasEmpty() &&
              !hasEmptyOption() &&
              title.length > 0 &&
              description.length > 0 &&
              source.length > 0
            )
          "
          @click="duplicate()"
        >
          <va-icon v-if="edit" name="control_point_duplicate" /><va-icon
            v-else
            name="add_circle"
          />
          &nbsp;
          <span v-if="edit">Udvostruči zagonetku</span>
          <span v-else>Spremi novu zagonetku</span>
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
        Dimenzije &nbsp;
        <va-icon v-if="!value[0]" name="expand_more"></va-icon>
        <va-icon v-if="value[0]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[0]">
      <MyCounter
        :min_value="row_counter_min"
        :max_value="row_counter_max"
        v-bind:value="rows"
        @input="(n) => ((rows = n), $forceUpdate())"
        :some_text="'Broj redaka'"
      ></MyCounter>
      <MyCounter
        :min_value="column_counter_min"
        :max_value="column_counter_max"
        v-bind:value="columns"
        @input="(n) => ((columns = n), $forceUpdate())"
        :some_text="'Broj stupaca'"
      ></MyCounter>
      <MyCounter
        :min_value="2"
        :max_value="Math.floor(alphabet.length / 3)"
        v-bind:value="num_letters"
        @input="(n) => ((num_letters = n), $forceUpdate())"
        :some_text="'Broj slova'"
      ></MyCounter>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Nasumično generiranje &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1]">
      <h6 class="display-6" style="text-align: start">
        Vrijednosti koje se generiraju
      </h6>
      <br />
      <va-tabs v-model="value_to_randomize">
        <template #tabs>
          <va-tab name="letters">Slova</va-tab>
          <va-tab name="numbers">Brojevi</va-tab>
          <va-tab name="values">Opcije</va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Opcije generiranja</h6>
      <br />
      <va-tabs>
        <template #tabs>
          <va-tab @click="randomize_all = !randomize_all">
            <span v-if="randomize_all == false">Nadopuni prazno</span>
            <span v-else>Promijeni upisano</span>
          </va-tab>
          <va-tab
            :disabled="value_to_randomize != 'numbers'"
            @click="keep_black = !keep_black"
          >
            <span v-if="keep_black == false">Nove barijere</span>
            <span v-else>Zadrži barijere</span>
          </va-tab>
          <va-tab @click="choose_random_type()">
            <va-icon name="shuffle" />
            &nbsp; Odaberi nasumično
          </va-tab>
          <va-tab @click="choose_reset_type()">
            <va-icon name="delete" />
            &nbsp; Izbriši
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[2] = !value[2]"
        class="display-6"
        style="text-align: start"
      >
        Ispuna mreže &nbsp;
        <va-icon v-if="!value[2]" name="expand_more"></va-icon>
        <va-icon v-if="value[2]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[2]">
      <h6 class="display-6" style="text-align: start">Ispuna</h6>
      <br />
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab
            :name="-1"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon color="#000000" name="contrast"></va-icon>&nbsp; Barijera
          </va-tab>
          <va-tab
            :name="-2"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            Bez broja
          </va-tab>
          <va-tab
            name="0"
            label="0"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
          </va-tab>
          <va-tab
            v-for="i in num_letters - 1"
            v-bind:key="i"
            :name="i"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            {{ i }}
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Ključ</h6>
      <br />
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab
            :name="-3"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon color="#FA8072" name="contrast"></va-icon>&nbsp; Pomoćni
            ključ (osjenčano)
          </va-tab>
          <va-tab
            :name="-8"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon color="#fdefef" name="contrast"></va-icon>&nbsp; Glavni
            ključ (neobrojčeno)
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Bridovi</h6>
      <br />
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab
            :name="-4"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_top" />
            &nbsp; Iscrtkano gore
          </va-tab>
          <va-tab
            :name="-5"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_bottom" />
            &nbsp; Iscrtkano dolje
          </va-tab>
          <va-tab
            :name="-6"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_left" />
            &nbsp; Iscrtkano lijevo
          </va-tab>
          <va-tab
            :name="-7"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_right" />
            &nbsp; Iscrtkano desno
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Opcije</h6>
      <br />
      <va-tabs v-model="option_number">
        <template #tabs>
          <va-tab
            name="-1"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            Bez opcije
          </va-tab>
          <va-tab
            name="0"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            1. opcija
          </va-tab>
          <va-tab
            name="1"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            2. opcija
          </va-tab>
          <va-tab
            name="2"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            3. opcija
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[3] = !value[3]"
        class="display-6"
        style="text-align: start"
      >
        Slova &nbsp;
        <va-icon v-if="!value[3]" name="expand_more"></va-icon>
        <va-icon v-if="value[3]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[3]">
      <div style="overflow-x: scroll">
        <table style="display: inline-table">
          <tr v-for="j in 3" v-bind:key="j">
            <td v-for="i in num_letters" v-bind:key="i">
              <va-form ref="lettersform">
                <va-input
                  maxlength="2"
                  @click="
                    mode = i - 1;
                    option_number = j - 1;
                    use_mode = true;
                    use_option = true;
                  "
                  v-model="letters[i - 1][j - 1]"
                  style="
                    width: 140px;
                    min-width: 140px;
                    max-width: 140px;
                    margin-left: 10px;
                    margin-bottom: 10px;
                  "
                  type="text"
                  :label="'' + (i - 1) + ' (' + j + ')'"
                  immediate-validation
                  :rules="[
                    (value) => {
                      if (check_duplicated(i - 1, j - 1) == 1) {
                        if (alphabet.includes(value)) {
                          return 'Udvostručeno.';
                        } else {
                          return 'Udvostručeno i nije u abecedi.';
                        }
                      } else {
                        if (alphabet.includes(value)) {
                          return true;
                        } else {
                          return 'Nije u abecedi.';
                        }
                      }
                    },
                  ]"
                >
                  <template #append>
                    &nbsp; &nbsp;
                    <va-icon
                      style="margin-left: 10px; display: inline-block"
                      name="visibility_off"
                      v-if="letters_revealed[i - 1][j - 1] == 0"
                      @click="letters_revealed[i - 1][j - 1] = 1"
                    />
                    <va-icon
                      style="margin-left: 10px; display: inline-block"
                      name="visibility"
                      v-if="letters_revealed[i - 1][j - 1] == 1"
                      @click="letters_revealed[i - 1][j - 1] = 0"
                    />
                    &nbsp; &nbsp;
                  </template>
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
        @click="value[4] = !value[4]"
        class="display-6"
        style="text-align: start"
      >
        Zagonetka &nbsp;
        <va-icon v-if="!value[4]" name="expand_more"></va-icon>
        <va-icon v-if="value[4]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[4]">
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
      <div style="max-height: 500px; overflow-x: scroll; overflow-y: scroll">
        <table class="numbers_table" id="table_zoom">
          <tr v-for="i in rows" v-bind:key="i">
            <td
              v-for="j in columns"
              v-bind:key="j"
              @click="change_number(i - 1, j - 1)"
              @mouseover="
                current_x = i;
                current_y = j;
              "
              :class="{
                unnumbered: unnumbered[i - 1][j - 1] == 1,
                black: solution[i - 1][j - 1] == -1,
                special: is_special[i - 1][j - 1] == 1,
                bordertop: border_top[i - 1][j - 1] == 1,
                borderbottom: border_bottom[i - 1][j - 1] == 1,
                borderleft: border_left[i - 1][j - 1] == 1,
                borderright: border_right[i - 1][j - 1] == 1,
              }"
            >
              <div>
                <sup
                  v-if="
                    unnumbered[i - 1][j - 1] == 0 &&
                    solution[i - 1][j - 1] != -2 &&
                    solution[i - 1][j - 1] != -1
                  "
                >
                  {{ solution[i - 1][j - 1] }}
                </sup>
                &nbsp;
                <span
                  v-if="
                    solution[i - 1][j - 1] != -2 &&
                    solution[i - 1][j - 1] != -1 &&
                    option[i - 1][j - 1] != -1
                  "
                >
                  {{ letters[solution[i - 1][j - 1]][option[i - 1][j - 1]] }}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </div>
      <br v-if="hasEmpty()" />
      <va-alert
        dense
        outline
        v-if="hasEmpty()"
        style="white-space: pre-wrap; border: none"
        color="danger"
        title="Prazne ćelije"
        center
      >
        Neke ćelije nemaju dodijeljen broj slova.
      </va-alert>
      <br v-if="hasEmptyOption()" />
      <va-alert
        dense
        outline
        v-if="hasEmptyOption()"
        style="white-space: pre-wrap; border: none"
        color="danger"
        title="Slova bez opcije"
        center
      >
        Neke ćelije nemaju dodijeljen broj opcije.
      </va-alert>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[5] = !value[5]"
        class="display-6"
        style="text-align: start"
      >
        Podaci o zagonetci &nbsp;
        <va-icon v-if="!value[5]" name="expand_more"></va-icon>
        <va-icon v-if="value[5]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[5]">
      <va-button
        outline
        :rounded="false"
        style="border: none"
        @click="click_file()"
      >
        <span v-if="this.imageURL != ''"> {{ this.imageURL }} </span>
        <span v-else><va-icon name="photo" /> &nbsp; Odaberi sliku </span>
      </va-button>
      <br />
      <input
        file-types="image/*"
        type="file"
        id="fileinput"
        style="display: none; visibility: hidden; width: 0%"
        @input="image_uploaded()"
      />
      <br />
      <img
        v-if="image"
        id="img"
        :src="imageURL"
        alt=""
        style="max-width: 500px; width: 100%"
      />
      <br v-if="image" />
      <va-alert
        dense
        outline
        v-if="!image"
        style="white-space: pre-wrap; border: none"
        color="warning"
        title="Nema slike"
        center
      >
        Niste dodali sliku uz zagonetku.
      </va-alert>
      <br />
      <h6 class="display-6" style="text-align: start; color: #2c82e0">
        Naslov zagonetke
      </h6>
      <br />
      <va-input
        v-model="title"
        immediate-validation
        type="text"
        :rules="[(value) => value.length > 0 || 'Unesite naslov.']"
      />
      <br />
      <h6 class="display-6" style="text-align: start; color: #2c82e0">
        Opis zagonetke
      </h6>
      <br />
      <va-input
        v-model="description"
        immediate-validation
        type="textarea"
        :min-rows="3"
        :max-rows="5"
        :rules="[(value) => value.length > 0 || 'Unesite opis.']"
      />
      <br />
      <h6 class="display-6" style="text-align: start; color: #2c82e0">
        Izvor zagonetke
      </h6>
      <br />
      <va-input
        v-model="source"
        immediate-validation
        type="textarea"
        :min-rows="3"
        :max-rows="5"
        :rules="[(value) => value.length > 0 || 'Unesite izvor.']"
      />
      <br v-if="edit" />
      <div v-if="edit" style="text-align: start">
        <va-button outline :rounded="false" style="border: none"
          ><router-link :to="'/profile/' + authorUserRecord.email">
            <va-icon name="person" /> &nbsp; Autor zagonetke:
            {{ authorUserRecord.displayName }}
            ({{ authorUserRecord.email }})
          </router-link></va-button
        >
      </div>
      <br v-if="edit" />
      <div v-if="edit" style="text-align: start">
        <span style="font-weight: bold"> Vrijeme kreiranja: </span>
        {{ time_created.toLocaleString() }}
      </div>
      <br v-if="edit" />
      <div v-if="edit" style="text-align: start">
        <va-button outline :rounded="false" style="border: none"
          ><router-link :to="'/profile/' + updaterUserRecord.email">
            <va-icon name="person" /> &nbsp; Zadnji ažurirao:
            {{ updaterUserRecord.displayName }}
            ({{ updaterUserRecord.email }})
          </router-link></va-button
        >
      </div>
      <br v-if="edit" />
      <div v-if="edit" style="text-align: start">
        <span style="font-weight: bold"> Vrijeme zadnje izmjene: </span>
        {{ last_updated.toLocaleString() }}
      </div>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[6] = !value[6]"
        class="display-6"
        v-if="permission_to_edit_visibility || !edit"
        style="text-align: start"
      >
        Dozvola uređivanja &nbsp;
        <va-icon v-if="!value[6]" name="expand_more"></va-icon>
        <va-icon v-if="value[6]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[6]">
      <div>
        <va-button
          outline
          :rounded="false"
          style="border: none"
          @click="is_public = !is_public"
        >
          <span v-if="is_public == false">
            <va-icon name="public_off" />
            &nbsp; Samo suradnici
          </span>
          <span v-else><va-icon name="public" /> &nbsp; Svi</span>
        </va-button>
      </div>
      <br />
      <va-input
        style="display: inline-block"
        type="text"
        v-model="collaborator"
        placeholder="Email adresa"
        label="Email adresa suradnika"
      >
        <template #append>
          &nbsp;
          <va-icon
            @click="
              checkIfUserExists();
              $forceUpdate();
            "
            color="primary"
            class="mr-4"
            name="add_moderator"
          />
        </template>
      </va-input>
      <br v-if="permissionsUserRecords.length > 0" />
      <div v-if="permissionsUserRecords.length > 0">
        <va-chip
          style="
            overflow-wrap: anywhere;
            display: inline-block;
            margin-left: 10px;
            margin-top: 10px;
          "
          v-for="(permission, i) in permissionsUserRecords"
          :key="i"
        >
          <va-icon
            style="display: inline-block"
            @click="permissions.splice(i, 1)"
            name="remove_moderator"
            class="mr-2"
          />
          &nbsp; {{ permission.displayName }} ({{ permission.email }})
        </va-chip>
      </div>
    </div>
    <br v-else />
  </body>
  <va-modal
    :mobile-fullscreen="false"
    ref="description"
    hide-default-actions
    stateful
  >
    <CryptogramInfo></CryptogramInfo>
  </va-modal>
  <va-modal
    :mobile-fullscreen="false"
    ref="delete_modal"
    message="Želite li da se zagonetka izbriše?"
    @ok="deletePuzzle()"
    stateful
    ok-text="Da"
    cancel-text="Ne"
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
  background-color: white;
}
.black {
  background-color: black !important;
}
.special {
  background-color: salmon !important;
  font-weight: bold !important;
  color: white !important;
}
.unnumbered {
  background-color: #fdefef !important;
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
