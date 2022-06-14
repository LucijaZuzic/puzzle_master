<script>
import { usersRef, friendsRef } from "../../firebase_main.js";
import { numberCrosswordsRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { projectStorage } from "../../firebase_main.js";
import MyCounter from "../Utility/MyCounter.vue";
import NumberCrosswordInfo from "../Info/NumberCrosswordInfo.vue";
import LoadingBar from "../Utility/LoadingBar.vue";

export default {
  props: ["edit"],
  components: {
    MyCounter,
    LoadingBar,
    NumberCrosswordInfo,
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
      length_to_display: null,
      fully_loaded: false,
      image: null,
      imageURL: "",
      permission_to_edit_visibility: false,
      user: null,
      title: "",
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      is_public: false,
      permissions: [],
      permissionsUserRecords: [],
      collaborator: "",
      rows: 15,
      columns: 11,
      mode: 10,
      numbers_by_len: [],
      warning: false,
      source: "",
      time_created: "",
      last_updated: "",
      is_revealed: [],
      is_special: [],
      description: "",
      randomize_all: false,
      keep_black: true,
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
    choose_random_type() {
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
            this.$router.push("/search-number-crossword");
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
      let oldisrevealed = [];
      let maxcol = this.columns;
      let maxrow = this.rows;
      if (this.solution) {
        oldsolution = this.solution;
        oldisspecial = this.is_special;
        oldisrevealed = this.is_revealed;
        if (oldsolution.length > maxrow) {
          maxrow = oldsolution.length;
        }
        if (oldsolution[0].length > maxcol) {
          maxcol = oldsolution[0].length;
        }
      }
      this.solution = [];
      this.is_special = [];
      this.is_revealed = [];
      this.solution = [];
      for (let i = 0; i < maxrow; i++) {
        let solution_row = [];
        let special_row = [];
        let revealed_row = [];
        for (let j = 0; j < maxcol; j++) {
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              solution_row.push(oldsolution[i][j]);
              special_row.push(oldisspecial[i][j]);
              revealed_row.push(oldisrevealed[i][j]);
            } else {
              solution_row.push(10);
              special_row.push(0);
              revealed_row.push(0);
            }
          } else {
            solution_row.push(10);
            special_row.push(0);
            revealed_row.push(0);
          }
        }
        this.solution.push(solution_row);
        this.is_special.push(special_row);
        this.is_revealed.push(revealed_row);
        for (let j = 0; j < maxcol; j++) {
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              this.solution[i][j] = oldsolution[i][j];
              this.is_special[i][j] = oldisspecial[i][j];
              this.is_revealed[i][j] = oldisrevealed[i][j];
            }
          }
        }
      }
      this.parse_numbers();
    },
    randomize() {
      this.solution = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.is_revealed[i][j] || this.is_special[i][j]) {
            solution_row.push(Math.floor(Math.random() * 10));
          } else {
            solution_row.push(Math.floor(Math.random() * 11) - 1);
          }
        }
        this.solution.push(solution_row);
      }
      this.check_zero_begin();
    },
    randomize_keep_black() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1) {
            solution_row.push(-1);
          } else {
            solution_row.push(Math.floor(Math.random() * 10));
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.check_zero_begin();
    },
    fill_empty() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == 10) {
            if (this.is_revealed[i][j] || this.is_special[i][j]) {
              solution_row.push(Math.floor(Math.random() * 10));
            } else {
              solution_row.push(Math.floor(Math.random() * 11) - 1);
            }
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.check_zero_begin();
    },
    fill_empty_keep_black() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == 10) {
            solution_row.push(Math.floor(Math.random() * 10));
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.check_zero_begin();
    },
    check_zero_begin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (
            i == 0 ||
            j == 0 ||
            this.solution[i - 1][j] == -1 ||
            this.solution[i][j - 1] == -1
          ) {
            if (this.solution[i][j] == 0) {
              this.solution[i][j] = Math.floor(Math.random() * 9) + 1;
            }
          }
        }
      }
      this.parse_numbers();
    },
    reset() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          solution_row.push(10);
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.parse_numbers();
    },
    parse_numbers() {
      let numbers = [];
      let maxlen = 0;
      this.warning = false;
      for (let i = 0; i < this.rows; i++) {
        let number = "";
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == 10) {
            this.warning = true;
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
      for (let i = 0; i < maxlen; i++) {
        let numbers_of_len = [];
        this.numbers_by_len.push(numbers_of_len);
      }
      for (let i = 0; i < numbers.length; i++) {
        this.numbers_by_len[numbers[i].length - 1].push(numbers[i]);
      }
      let num_lens = 0;
      let number_of_numbers = 0;
      for (let i = 1; i < maxlen; i++) {
        if (this.numbers_by_len[i].length > 0) {
          number_of_numbers += this.numbers_by_len[i].length;
          num_lens++;
        }
      }
      this.$forceUpdate();
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
              this.$router.push("/search-number-crossword");
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
    store() {
      let params_id = this.$route.params.id;
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      let newrevealed = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newrevealed.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newrevealed[i].push(this.is_revealed[i][j]);
        }
      }
      numberCrosswordsRef
        .doc(params_id)
        .update({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          is_revealed: funct_ref(newrevealed),
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
              numberCrosswordsRef
                .doc(params_id)
                .update({
                  solution: funct_ref(newsolution),
                  is_special: funct_ref(newspecial),
                  is_revealed: funct_ref(newrevealed),
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
                    this.$router.push("/search-number-crossword");
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
              const reference =
                "numberCrossword/" + params_id + "." + exstension;
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
                  numberCrosswordsRef
                    .doc(params_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      is_revealed: funct_ref(newrevealed),
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
                        this.$router.push("/search-number-crossword");
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
              this.$router.push("/search-number-crossword");
            });
          }
        });
    },
    duplicate() {
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      let newrevealed = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newrevealed.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newrevealed[i].push(this.is_revealed[i][j]);
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
      numberCrosswordsRef
        .add({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          is_revealed: funct_ref(newrevealed),
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
              const reference = "numberCrossword/" + some_id + "." + exstension;
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
                  numberCrosswordsRef
                    .doc(some_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      is_revealed: funct_ref(newrevealed),
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
                        this.$router.push("/search-number-crossword");
                      });
                    });
                });
            } else {
              let exstension =
                this.image.name.split(".")[
                  this.image.name.split(".").length - 1
                ];
              const reference = "numberCrossword/" + some_id + "." + exstension;
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
                  numberCrosswordsRef
                    .doc(some_id)
                    .update({
                      solution: funct_ref(newsolution),
                      is_special: funct_ref(newspecial),
                      is_revealed: funct_ref(newrevealed),
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
                        this.$router.push("/search-number-crossword");
                      });
                    });
                });
            }
          } else {
            this.new_async(
              this.$vaToast.init("Nova zagonetka je uspješno spremljena."),
              1000
            ).then(() => {
              this.$router.push("/search-number-crossword");
            });
          }
        });
    },
    zero_start_horizontal(i, j) {
      if (i >= this.rows || i <= -1 || j >= this.columns || j <= -1) {
        return false;
      }
      let seq = this.solution[i][j] + "";
      let index = j + 1;
      while (
        index < this.columns &&
        this.solution[i][index] != -1 &&
        this.solution[i][index] != 10
      ) {
        seq = seq + "" + this.solution[i][index];
        index += 1;
      }
      index = j - 1;
      while (
        index > -1 &&
        this.solution[i][index] != -1 &&
        this.solution[i][index] != 10
      ) {
        seq = this.solution[i][index] + "" + seq;
        index -= 1;
      }
      if (seq[0] == "0" && seq.length > 1) {
        return true;
      }
      return false;
    },
    zero_start_vertical(i, j) {
      if (i >= this.rows || i <= -1 || j >= this.columns || j <= -1) {
        return false;
      }
      let seq = this.solution[i][j] + "";
      let index = i + 1;
      while (
        index < this.rows &&
        this.solution[index][j] != -1 &&
        this.solution[index][j] != 10
      ) {
        seq = seq + "" + this.solution[index][j];
        index += 1;
      }
      index = i - 1;
      while (
        index > -1 &&
        this.solution[index][j] != -1 &&
        this.solution[index][j] != 10
      ) {
        seq = this.solution[index][j] + "" + seq;
        index -= 1;
      }
      if (seq[0] == "0" && seq.length > 1) {
        return true;
      }
      return false;
    },
    change_number(i, j) {
      if (this.mode == 0) {
        let old = this.solution[i][j];
        this.solution[i][j] = 0;
        if (
          this.zero_start_horizontal(i, j) ||
          this.zero_start_vertical(i, j)
        ) {
          this.solution[i][j] = old;
          this.$vaToast.init("Broj ne može započinjati znamenkom 0.");
          return;
        } else {
          this.parse_numbers();
        }
        return;
      }
      if (this.mode == -1) {
        if (this.is_revealed[i][j]) {
          this.$vaToast.init("Pomoćno polje ne može biti barijera.");
          return;
        }
        if (this.is_special[i][j]) {
          this.$vaToast.init(
            "Polje koje je dio rješenja ne može biti barijera."
          );
          return;
        }
        let old = this.solution[i][j];
        this.solution[i][j] = -1;
        if (
          this.zero_start_horizontal(i + 1, j) ||
          this.zero_start_vertical(i, j + 1) ||
          this.zero_start_horizontal(i - 1, j) ||
          this.zero_start_vertical(i, j - 1)
        ) {
          this.solution[i][j] = old;
          this.$vaToast.init("Broj ne može započinjati znamenkom 0.");
          return;
        } else {
          this.parse_numbers();
        }
        return;
      }
      if (this.mode > 0 && this.mode <= 10) {
        this.solution[i][j] = this.mode;
        this.parse_numbers();
      } else {
        if (this.mode == -2) {
          if (!this.is_special[i][j]) {
            if (this.is_revealed[i][j]) {
              this.$vaToast.init("Pomoćno polje ne može biti dio rješenja.");
              return;
            }
            if (this.solution[i][j] == -1) {
              this.$vaToast.init("Barijera ne može biti dio rješenja.");
              return;
            }
          }
          this.is_special[i][j] = (this.is_special[i][j] + 1) % 2;
        } else {
          if (!this.is_revealed[i][j]) {
            if (this.is_special[i][j]) {
              this.$vaToast.init(
                "Polje koje je dio rješenja ne može biti pomoćno polje."
              );
              return;
            }
            if (this.solution[i][j] == -1) {
              this.$vaToast.init("Barijera ne može biti pomoćno polje.");
              return;
            }
          }
          this.is_revealed[i][j] = (this.is_revealed[i][j] + 1) % 2;
        }
      }
    },
    getTotalLength() {
      for (let i = 0; i < this.numbers_by_len.length; i++) {
        if (this.numbers_by_len[i].length > 0) {
          return true;
        }
      }
      return false;
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
  beforeDestroy() {
    //window.removeEventListener('keyup', this.modeChange);
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
      <va-icon size="large" name="format_list_numbered"></va-icon>
      &nbsp;
      <span v-if="edit">Uredi</span>
      <span v-else>Stvori</span> brojevnu križaljku
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
              name: 'solve_number_crossword',
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
              name: 'create_number_crossword',
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
              name: 'search_number_crossword',
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
      >
      </MyCounter>
      <MyCounter
        :min_value="column_counter_min"
        :max_value="column_counter_max"
        v-bind:value="columns"
        @input="(n) => ((columns = n), $forceUpdate())"
        :some_text="'Broj stupaca'"
      >
      </MyCounter>
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
      <h6 class="display-6" style="text-align: start">Brojevi</h6>
      <br />
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab :name="-1">
            <va-icon color="#000000" name="contrast"></va-icon>&nbsp; Barijera
          </va-tab>
          <va-tab :name="10" label="Bez broja"> </va-tab>
          <va-tab name="0" label="0"> </va-tab>
          <va-tab v-for="i in 9" v-bind:key="i" :name="i">{{ i }}</va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Pozadina</h6>
      <br />
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab :name="-2">
            <va-icon color="#FA8072" name="contrast"></va-icon>&nbsp; Dio
            rješenja
          </va-tab>
          <va-tab :name="-3">
            <va-icon color="#90beee" name="contrast"></va-icon>&nbsp; Pomoć
            (otkriveno)
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">
        Nasumično generiranje &nbsp;
      </h6>
      <br />
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
            &nbsp; Odaberi nasumično
          </va-tab>
          <va-tab @click="reset()">
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
                black: solution[i - 1][j - 1] == -1,
                help: is_revealed[i - 1][j - 1],
                special: is_special[i - 1][j - 1],
              }"
            >
              <div>
                <span
                  v-if="
                    solution[i - 1][j - 1] == 10 || solution[i - 1][j - 1] == -1
                  "
                >
                </span>
                <span v-else>
                  {{ solution[i - 1][j - 1] }}
                </span>
              </div>
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
        :title="'Nisu unesene sve znamenke'"
        center
      >
        Dok ne unesete znamenke ili prepreke u sva polja, nije dostupan pregled
        brojeva u križaljci.
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
            <span v-if="solution[i - 1][j - 1] != 10">
              {{ solution[i - 1][j - 1] }}
            </span>
            <span v-else>?</span>
          </va-chip>
        </span>
      </span>
    </div>
    <br v-if="!value[3] && count_special()" />
    <va-card
      v-if="getTotalLength() && !warning"
      color="background"
      style="padding: 10px"
    >
      <h6
        @click="value[4] = !value[4]"
        class="display-6"
        style="text-align: start"
      >
        Brojevi po duljini &nbsp;
        <va-icon v-if="!value[4]" name="expand_more"></va-icon>
        <va-icon v-if="value[4]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[4] && getTotalLength() && !warning">
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
            <br />
            <br />
            <div style="max-height: 200px; overflow-y: scroll">
              <div
                v-for="(number, j) in numbers_by_len[length_to_display]"
                v-bind:key="j"
              >
                {{ number }}
              </div>
            </div>
          </span>
        </va-chip>
      </div>
    </div>
    <br v-if="!value[4] && getTotalLength() && !warning" />
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
  font-weight: bold;
  color: white;
}

.help {
  font-weight: bold;
  background-color: #90beee;
}
</style>
