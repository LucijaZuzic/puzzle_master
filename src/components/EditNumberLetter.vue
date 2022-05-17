<script>
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { projectStorage, friendsRef } from "../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usersRef } from "../firebase_main.js";
import { numberLettersRef } from "../firebase_main.js";


import LoadingBar from "./LoadingBar.vue";

export default {
  components: {
    
    LoadingBar,
  },
  data() {
    return {
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
      is_special: [[]],
      num_letters: 1,
      rows: 1,
      columns: 1,
      mode: -2,
      letter_alert: "",
      value_to_randomize: "letters",
      randomize_all: false,
      keep_black: true,
      current_x: null,
      current_y: null,
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
            this.$router.push("/search-number-letter");
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
                      this.$vaToast.init(
                        "Ne možete dodati suradnika jer niste prijatelji."
                      );
                    } else {
                      let duplicate = false;
                      for (let i = 0; i < this.permissions.length; i++) {
                        if (this.permissions[i] == uid) {
                          duplicate = true;
                          break;
                        }
                      }
                      if (duplicate == true) {
                        this.$vaToast.init(
                          "Ne možete dodati istog suradnika dvaput."
                        );
                      } else {
                        this.permissions.push(uid);
                        this.permissionsUserRecords.push({
                          displayName: displayName,
                          email: email,
                        });
                      }
                    }
                  } else {
                    this.$vaToast.init(
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
      for (let i = 0; i < maxletters; i++) {
        if (oldletters.length > i) {
          this.letters.push(oldletters[i]);
        } else {
          this.letters.push("");
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
    randomize() {
      this.solution = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.is_special[i][j] == 1) {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          } else {
            solution_row.push(
              Math.floor(Math.random() * (this.num_letters + 1)) - 1
            );
          }
        }
        this.solution.push(solution_row);
      }
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
    },
    fill_empty() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -2) {
            if (this.is_special[i][j] == 1) {
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
    },
    resetLetters() {
      this.letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        this.letters.push("");
      }
    },
    randomize_letters() {
      this.letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        let random_index = Math.floor(Math.random() * this.alphabet.length);
        while (this.letters.includes(this.alphabet[random_index])) {
          random_index = Math.floor(Math.random() * this.alphabet.length);
        }
        this.letters.push(this.alphabet[random_index]);
      }
      this.$forceUpdate();
    },
    fill_empty_letters() {
      for (let i = 0; i < this.num_letters; i++) {
        if (this.alphabet.includes(this.letters[i])) {
          continue;
        }
        let random_index = Math.floor(Math.random() * this.alphabet.length);
        while (this.letters.includes(this.alphabet[random_index])) {
          random_index = Math.floor(Math.random() * this.alphabet.length);
        }
        this.letters[i] = this.alphabet[random_index];
      }
      this.$forceUpdate();
    },
    check_letter() {
      this.letter_alert = "";
      for (let i = 0; i < this.num_letters; i++) {
        this.letters[i] = this.letters[i].toUpperCase();
        if (!this.alphabet.includes(this.letters[i])) {
          if (this.letter_alert != "") {
            this.letter_alert += " ";
          }
          this.letter_alert +=
            i + ". slovo (" + this.letters[i] + ") nije u zadanoj abecedi.";
        }
      }
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = i + 1; j < this.num_letters; j++) {
          if (this.letters[i] == this.letters[j]) {
            if (this.letter_alert != "") {
              this.letter_alert += " ";
            }
            this.letter_alert +=
              i +
              ". slovo (" +
              this.letters[i] +
              ") i " +
              j +
              ". slovo (" +
              this.letters[j] +
              ") je jednako.";
          }
        }
      }
      this.$forceUpdate();
    },
    change_number(x, y) {
      if (this.mode <= -4) {
        if (this.solution[x][y] == -1) {
          return;
        }
        if (this.mode == -4 && x != 0 && this.solution[x - 1][y] != -1) {
          this.border_top[x][y] = (this.border_top[x][y] + 1) % 2;
          this.border_bottom[x - 1][y] = (this.border_bottom[x - 1][y] + 1) % 2;
        }
        if (
          this.mode == -5 &&
          x != this.rows - 1 &&
          this.solution[x + 1][y] != -1
        ) {
          this.border_bottom[x][y] = (this.border_bottom[x][y] + 1) % 2;
          this.border_top[x + 1][y] = (this.border_top[x + 1][y] + 1) % 2;
        }
        if (this.mode == -6 && y != 0 && this.solution[x][y - 1] != -1) {
          this.border_left[x][y] = (this.border_left[x][y] + 1) % 2;
          this.border_right[x][y - 1] = (this.border_right[x][y - 1] + 1) % 2;
        }
        if (
          this.mode == -7 &&
          y != this.columns - 1 &&
          this.solution[x][y + 1] != -1
        ) {
          this.border_right[x][y] = (this.border_right[x][y] + 1) % 2;
          this.border_left[x][y + 1] = (this.border_left[x][y + 1] + 1) % 2;
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
              this.$router.push("/search-number-letter");
            });
          }
        });
    },
    getPicture() {
      if (this.image == null) {
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
      let newtop = [];
      let newbottom = [];
      let newleft = [];
      let newright = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newtop.push([]);
        newbottom.push([]);
        newleft.push([]);
        newright.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newtop[i].push(this.border_top[i][j]);
          newbottom[i].push(this.border_bottom[i][j]);
          newleft[i].push(this.border_left[i][j]);
          newright[i].push(this.border_right[i][j]);
        }
      }
      let newletters = [];
      for (let i = 0; i < this.num_letters; i++) {
        newletters.push(this.letters[i]);
      }
      numberLettersRef
        .doc(params_id)
        .update({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          border_top: funct_ref(newtop),
          border_bottom: funct_ref(newbottom),
          border_left: funct_ref(newleft),
          border_right: funct_ref(newright),
          title: this.title,
          letters: newletters,
          description: this.description,
          author: this.author,
          image: "",
          updater: this.user.uid,
          is_public: this.is_public,
          permissions: this.permissions,
          source: this.source,
          time_created: datetime,
          last_updated: datetime,
        })
        .then((docRef) => {
          if (this.image && this.image.name == undefined) {
            numberLettersRef
              .doc(params_id)
              .update({
                solution: funct_ref(newsolution),
                is_special: funct_ref(newspecial),
                border_top: funct_ref(newtop),
                border_bottom: funct_ref(newbottom),
                border_left: funct_ref(newleft),
                border_right: funct_ref(newright),
                title: this.title,
                letters: newletters,
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
                  this.$router.push("/search-number-letter");
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
              this.image.name.split(".")[this.image.name.split(".").length - 1];
            const reference = "numberLetter/" + params_id + "." + exstension;
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
                numberLettersRef
                  .doc(params_id)
                  .update({
                    solution: funct_ref(newsolution),
                    is_special: funct_ref(newspecial),
                    title: this.title,
                    letters: newletters,
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
                      this.$router.push("/search-number-letter");
                    });
                  });
              });
          }
        });
    },
    duplicate() {
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      let newtop = [];
      let newbottom = [];
      let newleft = [];
      let newright = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newtop.push([]);
        newbottom.push([]);
        newleft.push([]);
        newright.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newtop[i].push(this.border_top[i][j]);
          newbottom[i].push(this.border_bottom[i][j]);
          newleft[i].push(this.border_left[i][j]);
          newright[i].push(this.border_right[i][j]);
        }
      }
      let newletters = [];
      for (let i = 0; i < this.num_letters; i++) {
        newletters.push(this.letters[i]);
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
      numberLettersRef
        .add({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          border_top: funct_ref(newtop),
          border_bottom: funct_ref(newbottom),
          border_left: funct_ref(newleft),
          border_right: funct_ref(newright),
          title: this.title,
          letters: newletters,
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
          if (this.image && this.image.name == undefined) {
            var old_reference = ref(projectStorage, this.image);
            let exstension = "";
            // Get metadata properties
            getMetadata(old_reference)
              .then((metadata) => {
                // Metadata now contains the metadata for 'images/forest.jpg'
                exstension = metadata.contentType.split("/")[1];
              })
              .catch((error) => {
                // Uh-oh, an error occurred!
              });
            const reference = "numberLetter/" + some_id + "." + exstension;
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
                numberLettersRef
                  .doc(some_id)
                  .update({
                    solution: funct_ref(newsolution),
                    is_special: funct_ref(newspecial),
                    border_top: funct_ref(newtop),
                    border_bottom: funct_ref(newbottom),
                    border_left: funct_ref(newleft),
                    border_right: funct_ref(newright),
                    title: this.title,
                    letters: newletters,
                    description: this.description,
                    author: this.user.uid,
                    image: this.image,
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
                      this.$router.push("/search-number-letter");
                    });
                  });
              });
          } else {
            let exstension =
              this.image.name.split(".")[this.image.name.split(".").length - 1];
            const reference = "numberLetter/" + some_id + "." + exstension;
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
                numberLettersRef
                  .doc(some_id)
                  .update({
                    solution: funct_ref(newsolution),
                    is_special: funct_ref(newspecial),
                    border_top: funct_ref(newtop),
                    border_bottom: funct_ref(newbottom),
                    border_left: funct_ref(newleft),
                    border_right: funct_ref(newright),
                    title: this.title,
                    letters: newletters,
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
                      this.$router.push("/search-number-letter");
                    });
                  });
              });
          }
        });
    },
    modeChange(event) {
      switch (event.code) {
        case "ArrowUp":
          this.mode++;
          if (this.mode >= this.num_letters) {
            this.mode = -7;
          }
          break;
        case "ArrowDown":
          this.mode--;
          if (this.mode < -7) {
            this.mode = this.num_letters - 1;
          }
          break;
        case "ArrowRight":
          this.mode++;
          if (this.mode >= this.num_letters) {
            this.mode = -7;
          }
          break;
        case "ArrowLeft":
          this.mode--;
          if (this.mode < -7) {
            this.mode = this.num_letters - 1;
          }
          break;
        case "KeyW":
          this.mode++;
          if (this.mode >= this.num_letters) {
            this.mode = -7;
          }
          break;
        case "KeyS":
          this.mode--;
          if (this.mode < -7) {
            this.mode = this.num_letters - 1;
          }
          break;
        case "KeyD":
          this.mode++;
          if (this.mode >= this.num_letters) {
            this.mode = -7;
          }
          break;
        case "KeyA":
          this.mode--;
          if (this.mode < -7) {
            this.mode = this.num_letters - 1;
          }
          break;
        case "Digit0":
          this.mode = 0;
          break;
        case "Digit1":
          if (this.num_letters > 1) {
            this.mode = 1;
          }
          break;
        case "Digit2":
          if (this.num_letters > 2) {
            this.mode = 2;
          }
          break;
        case "Digit3":
          if (this.num_letters > 3) {
            this.mode = 3;
          }
          break;
        case "Digit4":
          if (this.num_letters > 4) {
            this.mode = 4;
          }
          break;
        case "Digit5":
          if (this.num_letters > 5) {
            this.mode = 5;
          }
          break;
        case "Digit6":
          if (this.num_letters > 6) {
            this.mode = 6;
          }
          break;
        case "Digit7":
          if (this.num_letters > 7) {
            this.mode = 7;
          }
          break;
        case "Digit8":
          if (this.num_letters > 8) {
            this.mode = 8;
          }
          break;
        case "Digit9":
          if (this.num_letters > 9) {
            this.mode = 9;
          }
          break;
      }
    },
    check_duplicated(x) {
      for (let i = 0; i < this.letters.length; i++) {
        if (x == i) {
          continue;
        }
        if (this.letters[i] == this.letters[x]) {
          return true;
        }
      }
      return false;
    },
    choose_reset_type() {
      if (this.value_to_randomize == "numbers") {
        this.resetNumbers();
      }
      if (this.value_to_randomize == "letters") {
        this.resetLetters();
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
    },
    remove_max_letter() {
      for (let i = 0; i < this.solution.length; i++) {
        for (let j = 0; j < this.solution[i].length; j++) {
          if (this.solution[i][j] >= this.num_letters) {
            this.solution[i][j] = -2;
            this.is_special[i][j] = 0;
          }
        }
      }
    },
  },
  beforeDestroy() {
    //window.removeEventListener('keyup', this.modeChange);
  },
  beforeMount() {
    this.fetch_puzzle();
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
    this.check_letter();
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
    //window.addEventListener('keyup', this.modeChange);
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
  <body class="mybody" v-if="!fully_loaded">
    
    <LoadingBar></LoadingBar>
  </body>
  <body class="mybody" v-else>
    
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="rows"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj redaka</span>
        </template>
        <!--<template #append>
          <va-input type="number" v-model="rows" :min="1" :max="50"/>
        </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="columns"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj stupaca</span>
        </template>
        <!--<template #append>
          <va-input type="number" v-model="columns" :min="1" :max="50"/>
        </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="num_letters"
        @update:model-value="update_order = false"
        :min="1"
        :max="alphabet.length"
        track-label-visible
      >
        <template #label>
          <span>Broj slova</span>
        </template>
        <!--<template #append>
          <va-input
            type="num_letters"
            v-model="num_letters"
            :min="1"
            :max="alphabet.length"
         />
        </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab
            :name="-2"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            ?
          </va-tab>
          <va-tab
            :name="-1"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <span style="color: black">Barijera</span>
          </va-tab>
          <va-tab
            :name="-3"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <span style="color: salmon">Dio rješenja</span>
          </va-tab>
          <va-tab
            :name="-4"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_top" />
            &nbsp;Iscrtkano gore
          </va-tab>
          <va-tab
            :name="-5"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_bottom" />
            &nbsp;Iscrtkano dolje
          </va-tab>
          <va-tab
            :name="-6"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_left" />
            &nbsp;Iscrtkano lijevo
          </va-tab>
          <va-tab
            :name="-7"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_right" />
            &nbsp;Iscrtkano desno
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-infinite-scroll disabled :load="() => {}">
        <div>
          <table style="display: inline-table">
            <tr>
              <td v-for="i in num_letters" v-bind:key="i">
                <va-form ref="lettersform">
                  <va-input
                    class="mb-4"
                    @click="mode = i - 1"
                    @update:model-value="check_letter()"
                    v-model="letters[i - 1]"
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
    <div class="myrow">
      <va-tabs v-model="value_to_randomize">
        <template #tabs>
          <va-tab name="letters"> Slova </va-tab>
          <va-tab name="numbers"> Brojevi </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-tabs>
        <template #tabs>
          <va-tab @click="randomize_all = !randomize_all">
            <span v-if="randomize_all == false">Nadopuni prazno</span>
            <span v-else>Promijeni upisano</span>
          </va-tab>
          <va-tab @click="keep_black = !keep_black">
            <span v-if="keep_black == false">Nove barijere</span>
            <span v-else>Zadrži barijere</span>
          </va-tab>
          <va-tab @click="choose_random_type()">
            <va-icon name="shuffle" />
            &nbsp;Odaberi nasumično
          </va-tab>
          <va-tab @click="choose_reset_type()">
            <va-icon name="delete" />
            &nbsp;Izbriši
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-chip v-if="current_x != null && current_y != null"
        >({{ current_x }}, {{ current_y }})</va-chip
      >
    </div>

    <div class="myrow" style="max-height: 500px">
      <va-infinite-scroll disabled :load="() => {}">
        <div>
          <table class="numbers_table">
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
                  black: solution[i - 1][j - 1] == -1,
                  special: is_special[i - 1][j - 1] == 1,
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
                      letters[solution[i - 1][j - 1]]
                    }}
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="myrow" v-if="hasEmpty()">
      <va-alert
        style="white-space: pre-wrap"
        color="danger"
        title="Prazne ćelije"
        center
        class="mb-4"
      >
        Neke ćelije nemaju dodijeljen broj slova.
      </va-alert>
    </div>
    <div class="myrow">
      <va-button
        style="display: inline-block; overflow-wrap: anywhere"
        @click="click_file()"
      >
        <span v-if="this.imageURL != ''"> {{ this.imageURL }} </span>
        <span v-else><va-icon name="photo" /> &nbsp;Odaberi sliku </span>
      </va-button>
      <input
        file-types="image/*"
        type="file"
        id="fileinput"
        style="display: none; visibility: hidden; width: 0%"
        @input="image_uploaded()"
      />
    </div>
    <div class="myrow" v-if="image">
      <img id="img" :src="imageURL" alt="Nema slike" style="width: 100%" />
    </div>
    <div class="myrow" v-if="!image">
      <va-alert
        style="white-space: pre-wrap"
        color="danger"
        title="Prazna slika"
        center
        class="mb-4"
      >
        Niste dodali sliku uz zagonetku.
      </va-alert>
    </div>
    <div class="myrow">
      <va-input
        class="mb-4"
        v-model="title"
        immediate-validation
        type="text"
        label="Naslov zagonetke"
        :rules="[(value) => value.length > 0 || 'Unesite naslov.']"
      />
      <va-input
        class="mb-4"
        v-model="description"
        immediate-validation
        type="textarea"
        label="Opis zagonetke"
        :min-rows="3"
        :max-rows="5"
        :rules="[(value) => value.length > 0 || 'Unesite opis.']"
      />
      <va-input
        class="mb-4"
        v-model="source"
        immediate-validation
        type="textarea"
        label="Izvor zagonetke"
        :min-rows="3"
        :max-rows="5"
        :rules="[(value) => value.length > 0 || 'Unesite izvor.']"
      />
    </div>
    <div class="myrow">
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
    <div class="myrow">
      <va-button
        style="overflow-wrap: anywhere"
        @click="is_public = !is_public"
      >
        <span v-if="is_public == false">
          <va-icon name="public_off" />
          &nbsp;Samo suradnici
        </span>
        <span v-else><va-icon name="public" /> &nbsp;Svi</span>
      </va-button>
    </div>
    <div class="myrow">
      <va-input
        style="display: inline-block; margin-left: 10px; margin-top: 10px"
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
    </div>
    <div class="myrow">
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
        &nbsp;{{ permission.displayName }} ({{ permission.email }})
      </va-chip>
    </div>
    <div class="myrow">
      <va-button
        style="overflow-wrap: anywhere; margin-left: 10px; margin-top: 10px"
        :disabled="
          !(
            !letter_alert &&
            !hasEmpty() &&
            image &&
            title.length > 0 &&
            description.length > 0 &&
            source.length > 0
          )
        "
        @click="store()"
      >
        <va-icon name="mode_edit" />
        &nbsp;Izmijeni postojeću zagonetku</va-button
      >&nbsp;
      <va-button
        style="overflow-wrap: anywhere; margin-left: 10px; margin-top: 10px"
        :disabled="
          !(
            !letter_alert &&
            !hasEmpty() &&
            image &&
            title.length > 0 &&
            description.length > 0 &&
            source.length > 0
          )
        "
        @click="duplicate()"
      >
        <va-icon name="control_point_duplicate" />
        &nbsp;Spremi izmjene kao novu zagonetku</va-button
      >
    </div>
  </body>
</template>

<style>
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
