<script>
import { initialsRef, friendsRef } from "../../firebase_main.js";
import { usersRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import LoadingBar from "../Utility/LoadingBar.vue";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { projectStorage } from "../../firebase_main.js";
import MyCounter from "../Utility/MyCounter.vue";
import InitialInfo from "../Info/InitialInfo.vue";

export default {
  props: ["edit"],
  components: {
    MyCounter,
    LoadingBar,
    InitialInfo,
  },
  data() {
    return {
      permission_to_edit_visibility: false,
      value: [false, false, false, false, false, false, false],
      zoom: 100,
      max_zoom: 200,
      row_counter_min: 1,
      row_counter_max: 50,
      column_counter_min: 1,
      column_counter_max: 50,
      dir_to_display: null,
      fully_loaded: false,
      word_warning: "",
      word: "",
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
      rows: 13,
      columns: 22,
      current_dir: 0,
      mode_x: -1,
      mode_y: -1,
      words_by_dir: [[], [], [], [], [], [], [], []],
      warning: true,
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
    image_uploaded() {
      this.image = document.getElementById("fileinput").files[0];
      this.imageURL = URL.createObjectURL(this.image);
    },
    click_file() {
      document.getElementById("fileinput").click();
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
            this.$router.push("/search-initial");
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
      for (let i = 0; i < this.solution.length; i++) {
        for (let j = 0; j < this.solution[i].length; j++) {
          this.solution[i][j] = "";
        }
      }
      let old_words = this.words_by_dir;
      this.words_by_dir = [[], [], [], [], [], [], [], []];
      for (let i = 0; i < old_words.length; i++) {
        for (let j = 0; j < old_words[i].length; j++) {
          let dirs = this.get_dirxy(i);
          this.place_word(
            old_words[i][j][0],
            old_words[i][j][1],
            old_words[i][j][2],
            dirs[0],
            dirs[1],
            false
          );
        }
      }
      this.check_full();
    },
    reset() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          solution_row.push("");
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.words_by_dir = [[], [], [], [], [], [], [], []];
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
            this.checkIdentity();
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
    array_to_string(array) {
      let string = "[";
      for (let i = 0; i < array.length; i++) {
        if (i != 0) {
          string += ",";
        }
        string += "[" + array[i].toString() + "]";
      }
      return string + "]";
    },
    check_word() {
      this.word_warning = "";
      this.word = this.word.toUpperCase();
      for (let i = 0; i < this.word.length; i++) {
        if (!this.alphabet.includes(this.word[i])) {
          if (this.word_warning != "") {
            this.word_warning += " ";
          }
          this.word_warning +=
            i +
            1 +
            ". slovo riječi " +
            this.word +
            " (" +
            this.word[i] +
            ") nije dio abecede.";
        }
      }
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
    check_dir(x, y, new_word, dirx, diry, show_warning) {
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
          this.solution[y_new][x_new] != "" &&
          this.solution[y_new][x_new] != new_word[letter_number]
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
    add_word(x, y, new_word, dirx, diry) {
      for (
        let letter_number = 0;
        letter_number < new_word.length;
        letter_number++
      ) {
        let x_new = x + letter_number * dirx;
        let y_new = y + letter_number * diry;
        this.solution[y_new][x_new] = new_word[letter_number];
      }
      this.words_by_dir[this.get_dir(dirx, diry)].push([x, y, new_word]);
      this.words_by_dir[this.get_dir(dirx, diry)].sort(this.sortFunction);
    },
    sortFunction(a, b) {
      if (a[2] === b[2]) {
        if (a[1] === b[1]) {
          if (a[0] === b[0]) {
            return 0;
          } else {
            return a[0] < b[0] ? -1 : 1;
          }
        } else {
          return a[1] < b[1] ? -1 : 1;
        }
      } else {
        return a[2] < b[2] ? -1 : 1;
      }
    },
    place_word(x, y, new_word, dirx, diry, show_warning) {
      if (dirx == -2 || diry == -2) {
        if (this.check_start(x, y, false) == false) {
          this.is_special[y][x] = (this.is_special[y][x] + 1) % 2;
        } else {
          this.$vaToast.init("Početno slovo riječi ne može biti dio rješenja.");
        }
        return;
      }
      if (this.is_special[y][x]) {
        this.$vaToast.init("Riječ ne može započeti u dijelu rješenja.");
        return;
      }
      if (!new_word) {
        return;
      }
      if (new_word.length == 0) {
        return;
      }
      if (this.word_warning == "" || !show_warning) {
        //if (this.check_start(x, y, show_warning) == false) {
        if (this.check_dir(x, y, new_word, dirx, diry, show_warning) == true) {
          this.add_word(x, y, new_word, dirx, diry);
          let number_of_words = 0;
          let number_of_dirs = 0;
          for (let i = 0; i < this.words_by_dir.length; i++) {
            if (this.words_by_dir[i].length != 0) {
              number_of_words += this.words_by_dir[i].length;
              number_of_dirs++;
            }
          }
          this.page_length = Math.ceil(number_of_words / number_of_dirs);
          this.check_full();
        }
        //}
      }
      this.$forceUpdate();
    },
    remove_word(i, j) {
      this.words_by_dir[i].splice(j, 1);
      let old_words = this.words_by_dir;
      this.reset();
      for (let i = 0; i < old_words.length; i++) {
        for (let j = 0; j < old_words[i].length; j++) {
          let dirs = this.get_dirxy(i);
          this.add_word(
            old_words[i][j][0],
            old_words[i][j][1],
            old_words[i][j][2],
            dirs[0],
            dirs[1]
          );
        }
      }
      this.check_full();
      this.$forceUpdate();
    },
    check_full() {
      this.warning = false;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == "") {
            this.warning = true;
          }
        }
      }
    },
    store() {
      let params_id = this.$route.params.id;
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
        }
      }
      initialsRef
        .doc(params_id)
        .update({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          dir1: funct_ref(this.words_by_dir[0]),
          dir2: funct_ref(this.words_by_dir[1]),
          dir3: funct_ref(this.words_by_dir[2]),
          dir4: funct_ref(this.words_by_dir[3]),
          dir5: funct_ref(this.words_by_dir[4]),
          dir6: funct_ref(this.words_by_dir[5]),
          dir7: funct_ref(this.words_by_dir[6]),
          dir8: funct_ref(this.words_by_dir[7]),
          title: this.title,
          description: this.description,
          image: "",
          author: this.author,
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
              initialsRef
                .doc(params_id)
                .update({
                  solution: funct_ref(newsolution),
                  is_special: funct_ref(newspecial),
                  dir1: funct_ref(this.words_by_dir[0]),
                  dir2: funct_ref(this.words_by_dir[1]),
                  dir3: funct_ref(this.words_by_dir[2]),
                  dir4: funct_ref(this.words_by_dir[3]),
                  dir5: funct_ref(this.words_by_dir[4]),
                  dir6: funct_ref(this.words_by_dir[5]),
                  dir7: funct_ref(this.words_by_dir[6]),
                  dir8: funct_ref(this.words_by_dir[7]),
                  title: this.title,
                  description: this.description,
                  image: this.image,
                  author: this.author,
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
                    this.$router.push("/search-initial");
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
              const reference = "initial/" + params_id + "." + exstension;
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
                  initialsRef
                    .doc(params_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      dir1: funct_ref(this.words_by_dir[0]),
                      dir2: funct_ref(this.words_by_dir[1]),
                      dir3: funct_ref(this.words_by_dir[2]),
                      dir4: funct_ref(this.words_by_dir[3]),
                      dir5: funct_ref(this.words_by_dir[4]),
                      dir6: funct_ref(this.words_by_dir[5]),
                      dir7: funct_ref(this.words_by_dir[6]),
                      dir8: funct_ref(this.words_by_dir[7]),
                      title: this.title,
                      description: this.description,
                      image: imageLocation,
                      author: this.author,
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
                        this.$router.push("/search-initial");
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
              this.$router.push("/search-initial");
            });
          }
        });
    },
    duplicate() {
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
        }
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
      initialsRef
        .add({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          dir1: funct_ref(this.words_by_dir[0]),
          dir2: funct_ref(this.words_by_dir[1]),
          dir3: funct_ref(this.words_by_dir[2]),
          dir4: funct_ref(this.words_by_dir[3]),
          dir5: funct_ref(this.words_by_dir[4]),
          dir6: funct_ref(this.words_by_dir[5]),
          dir7: funct_ref(this.words_by_dir[6]),
          dir8: funct_ref(this.words_by_dir[7]),
          title: this.title,
          description: this.description,
          image: "",
          author: this.user.uid,
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
              getMetadata(old_reference)
                .then((metadata) => {
                  // Metadata now contains the metadata for 'images/forest.jpg'
                  exstension = metadata.contentType.split("/")[1];
                })
                .catch((error) => {
                  // Uh-oh, an error occurred!
                });
              const reference = "initial/" + some_id + "." + exstension;
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
                  initialsRef
                    .doc(some_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      dir1: funct_ref(this.words_by_dir[0]),
                      dir2: funct_ref(this.words_by_dir[1]),
                      dir3: funct_ref(this.words_by_dir[2]),
                      dir4: funct_ref(this.words_by_dir[3]),
                      dir5: funct_ref(this.words_by_dir[4]),
                      dir6: funct_ref(this.words_by_dir[5]),
                      dir7: funct_ref(this.words_by_dir[6]),
                      dir8: funct_ref(this.words_by_dir[7]),
                      title: this.title,
                      description: this.description,
                      image: imageLocation,
                      author: this.user.uid,
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
                        this.$router.push("/search-initial");
                      });
                    });
                });
            } else {
              let exstension =
                this.image.name.split(".")[
                  this.image.name.split(".").length - 1
                ];
              const reference = "initial/" + some_id + "." + exstension;
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
                  initialsRef
                    .doc(some_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      dir1: funct_ref(this.words_by_dir[0]),
                      dir2: funct_ref(this.words_by_dir[1]),
                      dir3: funct_ref(this.words_by_dir[2]),
                      dir4: funct_ref(this.words_by_dir[3]),
                      dir5: funct_ref(this.words_by_dir[4]),
                      dir6: funct_ref(this.words_by_dir[5]),
                      dir7: funct_ref(this.words_by_dir[6]),
                      dir8: funct_ref(this.words_by_dir[7]),
                      title: this.title,
                      description: this.description,
                      image: imageLocation,
                      author: this.user.uid,
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
                        this.$router.push("/search-initial");
                      });
                    });
                });
            }
          } else {
            this.new_async(
              this.$vaToast.init("Nova zagonetka je uspješno spremljena."),
              1000
            ).then(() => {
              this.$router.push("/search-initial");
            });
          }
        });
    },
    remove_dir(i) {
      this.words_by_dir[i] = [];
      let old_words = this.words_by_dir;
      this.reset();
      for (let i = 0; i < old_words.length; i++) {
        for (let j = 0; j < old_words[i].length; j++) {
          let dirs = this.get_dirxy(i);
          this.add_word(
            old_words[i][j][0],
            old_words[i][j][1],
            old_words[i][j][2],
            dirs[0],
            dirs[1]
          );
        }
      }
      this.check_full();
      this.$forceUpdate();
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
    if (this.$props.edit) {
      this.fetch_puzzle();
    } else {
      this.initialize();
      this.getPicture();
    }
  },
  beforeUpdate() {
    this.initialize();
  },
  beforeDestroy() {
    //window.removeEventListener('keyup', this.modeChange);
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
  computed: {},
};
</script> 

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="my_body" v-else>
    <h4 class="display-4">
      <va-icon size="large" name="text_rotation_none"></va-icon>

      &nbsp;
      <span v-if="edit">Uredi</span>
      <span v-else>Stvori</span> inicijalnu osmosmjerku
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
              name: 'solve_initial',
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
            &nbsp; Popis zagonetki
          </router-link>
        </va-tab>
        <va-tab
          v-if="edit"
          :disabled="
            !(
              edit &&
              !warning &&
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
              !warning &&
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
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Ispuna mreže &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1]">
      <h6 class="display-6" style="text-align: start">Način dodavanja</h6>
      <br />
      <va-tabs v-model="current_dir">
        <template #tabs>
          <va-tab
            name="0"
            @click="
              mode_x = -1;
              mode_y = -1;
            "
          >
            &#8598;
          </va-tab>
          <va-tab
            name="1"
            @click="
              mode_x = -1;
              mode_y = 0;
            "
          >
            &#8592;
          </va-tab>
          <va-tab
            name="2"
            @click="
              mode_x = -1;
              mode_y = 1;
            "
          >
            &#8601;
          </va-tab>
          <va-tab
            name="3"
            @click="
              mode_x = 0;
              mode_y = -1;
            "
          >
            &#8593;
          </va-tab>
          <va-tab
            name="4"
            @click="
              mode_x = 0;
              mode_y = 1;
            "
          >
            &#8595;
          </va-tab>
          <va-tab
            name="5"
            @click="
              mode_x = 1;
              mode_y = -1;
            "
          >
            &#8599;
          </va-tab>
          <va-tab
            name="6"
            @click="
              mode_x = 1;
              mode_y = 0;
            "
          >
            &#8594;
          </va-tab>
          <va-tab
            name="7"
            @click="
              mode_x = 1;
              mode_y = 1;
            "
          >
            &#8600;
          </va-tab>
          <va-tab
            name="-1"
            @click="
              mode_x = -2;
              mode_y = -2;
            "
          >
            <va-icon color="#FA8072" name="contrast"></va-icon>
            &nbsp; Dio rješenja
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Dodatne mogućnosti</h6>
      <br />
      <va-tabs>
        <template #tabs>
          <va-tab @click="word += 'Ǆ'"> Ǆ </va-tab>
          <va-tab @click="word += 'Ǉ'"> Ǉ </va-tab>
          <va-tab @click="word += 'Ǌ'"> Ǌ </va-tab>
          <va-tab @click="reset()">
            <va-icon name="delete" />
            &nbsp; Izbriši sve
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <va-input
        style="display: inline-block; margin-left: 10px; margin-top: 10px"
        type="text"
        v-model="word"
        placeholder="Nova riječ"
        label="Dodaj riječ"
        immediate-validation
        :rules="[(value) => word_warning == '' || 'Nedozvoljena slova.']"
        @update:model-value="check_word()"
      />
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
      <div style="max-height: 400px; overflow-x: scroll; overflow-y: scroll">
        <table class="words_table" id="table_zoom">
          <tr v-for="i in rows" v-bind:key="i">
            <td
              v-for="j in columns"
              v-bind:key="j"
              @click="place_word(j - 1, i - 1, word, mode_x, mode_y, true)"
              @mouseover="
                current_x = i;
                current_y = j;
              "
              :class="{
                help: check_start(j - 1, i - 1, false),
                special: is_special[i - 1][j - 1],
              }"
            >
              {{ solution[i - 1][j - 1] }}
            </td>
          </tr>
        </table>
      </div>
      <br v-if="warning" />
      <va-alert
        dense
        outline
        v-if="warning"
        style="white-space: pre-wrap; border: none"
        color="danger"
        :title="'Nisu unesena sva slova'"
        center
      >
        Morate unesti dovoljno riječi u osmosmjerku tako da sva polja budu
        definirana barem pomoću jedne riječi.
      </va-alert>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px" v-if="count_special()">
      <h6
        @click="value[3] = !value[3]"
        class="display-6"
        style="text-align: start"
      >
        Rješenje &nbsp;
        <va-icon v-if="!value[3]" name="expand_more"></va-icon>
        <va-icon v-if="value[3]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[3] && count_special()">
      <span v-for="i in rows" v-bind:key="i">
        <span v-for="j in columns" v-bind:key="j">
          <va-chip
            color="#FA8072"
            outline
            square
            style="margin-left: 5px; margin-top: 5px"
            v-if="is_special[i - 1][j - 1]"
          >
            <span v-if="solution[i - 1][j - 1] != ''">
              {{ solution[i - 1][j - 1] }}
            </span>
            <span v-else>?</span>
          </va-chip>
        </span>
      </span>
    </div>
    <br v-if="!value[3] && count_special()" />
    <va-card
      color="background"
      style="padding: 10px"
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
      "
    >
      <h6
        @click="value[4] = !value[4]"
        class="display-6"
        style="text-align: start"
      >
        Riječi po smjerovima &nbsp;
        <va-icon v-if="!value[4]" name="expand_more"></va-icon>
        <va-icon v-if="value[4]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div
      class="my_row"
      v-if="
        value[4] &&
        words_by_dir[0].length +
          words_by_dir[1].length +
          words_by_dir[2].length +
          words_by_dir[3].length +
          words_by_dir[4].length +
          words_by_dir[5].length +
          words_by_dir[6].length +
          words_by_dir[7].length >
          0
      "
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
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <div
        v-if="dir_to_display != null && words_by_dir[dir_to_display].length > 0"
      >
        <va-chip
          outline
          style="padding: 20px; margin-left: 20px; margin-top: 20px"
        >
          <span>
            <span v-if="dir_to_display == 0">&#8598;</span>
            <span v-if="dir_to_display == 1">&#8592;</span>
            <span v-if="dir_to_display == 2">&#8601;</span>
            <span v-if="dir_to_display == 3">&#8593;</span>
            <span v-if="dir_to_display == 4">&#8595;</span>
            <span v-if="dir_to_display == 5">&#8599;</span>
            <span v-if="dir_to_display == 6">&#8594;</span>
            <span v-if="dir_to_display == 7">&#8600;</span>
            &nbsp;
            <va-icon @click="remove_dir(dir_to_display)" name="delete" />
            <br />
            <br />
            <div style="max-height: 200px; overflow-y: scroll">
              <div
                v-for="(word, j) in words_by_dir[dir_to_display]"
                v-bind:key="j"
              >
                {{ word[2] }}&nbsp; ({{ word[1] + 1 }},{{ word[0] + 1 }}) &nbsp;
                <va-icon
                  @click="remove_word(dir_to_display, j)"
                  name="delete"
                />
              </div>
            </div>
          </span>
        </va-chip>
      </div>
    </div>
    <br
      v-if="
        !value[4] &&
        words_by_dir[0].length +
          words_by_dir[1].length +
          words_by_dir[2].length +
          words_by_dir[3].length +
          words_by_dir[4].length +
          words_by_dir[5].length +
          words_by_dir[6].length +
          words_by_dir[7].length >
          0
      "
    />
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
        style="max-width: 500px; max-height: 500px; width: 100%; height: 100%"
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
.black {
  background-color: black;
}
.special {
  background-color: salmon;
  font-weight: bold;
  color: white;
}

.help {
  font-weight: bold;
  background-color: #90beee;
}
</style>
