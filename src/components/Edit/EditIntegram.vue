<script>
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import tinycolor from "tinycolor2/tinycolor";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { projectStorage, friendsRef } from "../../firebase_main.js";
import { usersRef } from "../../firebase_main.js";
import { integramsRef } from "../../firebase_main.js";

import MyCounter from "../Utility/MyCounter.vue";
import LoadingBar from "../Utility/LoadingBar.vue";
import IntegramInfo from "../Info/IntegramInfo.vue";

export default {
  props: ["edit"],
  components: {
    MyCounter,
    LoadingBar,
    IntegramInfo,
  },
  data() {
    return {
      category_for_image: null,
      value_to_display: null,
      value: [false, false, false, false, false, false],
      category_counter_min: 3,
      category_counter_max: 5,
      value_counter_min: 3,
      value_counter_max: 5,
      instruction_counter_min: 5,
      instruction_coutner_max: 10,
      urls: [],
      fully_loaded: false,
      permission_to_edit_visibility: false,
      user: null,
      title: "",
      numcategories: 5,
      numvalues: 5,
      numinstructions: 9,
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      time_created: "",
      last_updated: "",
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      is_public: false,
      permissions: [],
      permissionsUserRecords: [],
      collaborator: "",
      description: "",
      source: "",
      alert: "",
      alert_instruction: "",
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      max_len_display: 20,
      is_image: [],
      instructions: [],
      solution: [],
      mode: -1,
      mark_error: false,
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
            this.$router.push("/search-integram");
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
      let oldvalues = [];
      let maxcol = this.numcategories;
      let maxrow = this.numvalues;
      if (this.category_values) {
        oldvalues = this.category_values;
        if (oldvalues.length > maxrow) {
          maxrow = oldvalues.length;
        }
        if (oldvalues[0].length > maxcol) {
          maxcol = oldvalues[0].length;
        }
      }
      this.category_values = [];
      for (let i = 0; i < maxrow; i++) {
        let category_values_row = [];
        for (let j = 0; j < maxcol; j++) {
          if (oldvalues[i]) {
            if (oldvalues[i].length > j) {
              category_values_row.push(oldvalues[i][j]);
            } else {
              category_values_row.push("");
            }
          } else {
            category_values_row.push("");
          }
        }
        this.category_values.push(category_values_row);
      }
      let oldnames = [];
      let maxnames = this.numcategories;
      if (this.category_names) {
        oldnames = this.category_names;
        if (oldnames.length > maxnames) {
          maxnames = oldnames.length;
        }
      }
      let oldisimage = [];
      let maxisimage = this.numcategories;
      if (this.is_image) {
        oldisimage = this.is_image;
        if (oldisimage.length > maxisimage) {
          maxisimage = oldisimage.length;
        }
      }
      this.category_names = [];
      for (let i = 0; i < maxnames; i++) {
        if (oldnames[i]) {
          this.category_names.push(oldnames[i]);
        } else {
          this.category_names.push("");
        }
      }
      this.is_image = [];
      for (let i = 0; i < maxisimage; i++) {
        if (oldisimage[i]) {
          this.is_image.push(oldisimage[i]);
        } else {
          this.is_image.push(false);
        }
      }
      this.change_instructions();
      this.check_same();
    },
    change_instructions() {
      let oldinstructions = [];
      let maxinstructions = this.numinstructions;
      if (this.instructions) {
        oldinstructions = this.instructions;
        if (oldinstructions.length > maxinstructions) {
          maxinstructions = oldinstructions.length;
        }
      }
      this.instructions = [];
      for (let i = 0; i < maxinstructions; i++) {
        if (oldinstructions[i]) {
          this.instructions.push(oldinstructions[i]);
        } else {
          this.instructions.push("");
        }
      }
    },
    check_same() {
      this.alert_instruction = "";
      this.alert = "";
      for (let j = 0; j < this.numinstructions; j++) {
        if (this.instructions[j] == "") {
          if (this.alert_instruction != "") {
            this.alert_instruction += " ";
          }
          this.alert_instruction += (j + 1).toString() + ". uputa nema tekst.";
        }
      }
      for (let j = 0; j < this.numcategories; j++) {
        if (this.category_names[j] == "") {
          if (this.alert != "") {
            this.alert += " ";
          }
          this.alert += (j + 1).toString() + ". kategorija nema naziv.";
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          if (
            this.category_values[j][i] == "" ||
            this.category_values[j][i] == []
          ) {
            if (this.is_image[i]) {
              if (this.alert != "") {
                this.alert += " ";
              }
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") nema sliku za " +
                (j + 1).toString() +
                ". pojam.";
            } else {
              if (this.alert != "") {
                this.alert += " ";
              }
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") nema vrijednost za " +
                (j + 1).toString() +
                ". pojam.";
            }
          }
        }
      }
      for (let j = 0; j < this.numinstructions; j++) {
        for (let k = j + 1; k < this.numinstructions; k++) {
          if (
            this.instructions[j] == this.instructions[k] &&
            this.instructions[j] &&
            this.instructions[k]
          ) {
            if (this.alert_instruction != "") {
              this.alert_instruction += " ";
            }
            this.alert_instruction +=
              (j + 1).toString() +
              ". uputa (" +
              this.instructions[j] +
              ") i " +
              (k + 1).toString() +
              ". uputa (" +
              this.instructions[k] +
              ") imaju isti tekst.";
          }
        }
      }
      for (let j = 0; j < this.numcategories; j++) {
        for (let k = j + 1; k < this.numcategories; k++) {
          if (
            this.category_names[j] == this.category_names[k] &&
            this.category_names[j] &&
            this.category_names[k]
          ) {
            if (this.alert != "") {
              this.alert += " ";
            }
            this.alert +=
              (j + 1).toString() +
              ". kategorija (" +
              this.category_names[j] +
              ") i " +
              (k + 1).toString() +
              ". kategorija (" +
              this.category_names[k] +
              ") imaju isti naziv.";
          }
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = j + 1; k < this.numvalues; k++) {
            if (
              this.category_values[j][i] == this.category_values[k][i] &&
              this.category_values[j][i] &&
              this.category_values[k][i]
            ) {
              if (this.alert != "") {
                this.alert += " ";
              }
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") ima jednaku vrijednost za " +
                (j + 1).toString() +
                ". pojam (" +
                this.category_values[j][i] +
                ") i " +
                (k + 1).toString() +
                ". pojam (" +
                this.category_values[k][i] +
                ").";
            }
            if (
              this.is_image[i] &&
              this.category_values[j][i].toString()[0] == "[" &&
              this.category_values[k][i].name != undefined &&
              this.category_values[j][i] != "" &&
              this.category_values[j][i] != [] &&
              this.category_values[k][i] != "" &&
              this.category_values[k][i] != [] &&
              this.category_values[j][i].name ==
                this.category_values[k][i].name &&
              this.category_values[j][i] &&
              this.category_values[k][i]
            ) {
              if (this.alert != "") {
                this.alert += " ";
              }
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") ima jednaku sliku za " +
                (j + 1).toString() +
                ". pojam (" +
                this.category_values[j][i].name +
                ") i " +
                (k + 1).toString() +
                ". pojam (" +
                this.category_values[k][i].name +
                ").";
            }
            if (
              this.is_image[i] &&
              this.category_values[j][i].toString()[0] != "[" &&
              this.category_values[k][i].name == undefined &&
              this.category_values[j][i] != "" &&
              this.category_values[j][i] != [] &&
              this.category_values[k][i] != "" &&
              this.category_values[k][i] != [] &&
              this.category_values[j][i] == this.category_values[k][i] &&
              this.category_values[j][i] &&
              this.category_values[k][i]
            ) {
              if (this.alert != "") {
                this.alert += " ";
              }
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") ima jednaku sliku za " +
                (j + 1).toString() +
                ". pojam (" +
                this.category_values[j][i] +
                ") i " +
                (k + 1).toString() +
                ". pojam (" +
                this.category_values[k][i] +
                ").";
            }
          }
        }
      }
    },
    clear_category(category_to_clear) {
      for (let i = 0; i < this.numvalues; i++) {
        if (this.is_image[category_to_clear] == true) {
          this.category_values[i][category_to_clear] = [];
        } else {
          this.category_values[i][category_to_clear] = "";
        }
      }
    },
    click_file(i, j) {
      document.getElementById("fileinput" + i + ":" + j).click();
    },
    image_uploaded(i, j) {
      this.category_values[i][j] = document.getElementById(
        "fileinput" + i + ":" + j
      ).files[0];
      this.getPicture();
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
    is_duplicate_instruction(i) {
      for (let j = 0; j < this.instructions.length; j++) {
        if (this.instructions[j] == this.instructions[i] && i != j) {
          return true;
        }
      }
      return false;
    },
    is_duplicate_name(i) {
      for (let j = 0; j < this.category_names.length; j++) {
        if (this.category_names[j] == this.category_names[i] && i != j) {
          return true;
        }
      }
      return false;
    },
    is_duplicate_value(category_num, value_num) {
      for (let j = 0; j < this.numvalues; j++) {
        if (value_num == j) {
          continue;
        }
        if (
          this.category_values[j][category_num] ==
          this.category_values[value_num][category_num]
        ) {
          return true;
        }
        if (
          this.category_values[value_num][category_num].name &&
          this.category_values[j][category_num].name &&
          this.category_values[j][category_num].name ==
            this.category_values[value_num][category_num].name
        ) {
          return true;
        }
      }
      return false;
    },
    store() {
      let datetime = new Date();
      let params_id = this.$route.params.id;
      let funct_ref = this.array_to_string;
      let newinstructions = [];
      for (let i = 0; i < this.numinstructions; i++) {
        newinstructions.push(this.instructions[i]);
      }
      let newcategorynames = [];
      for (let i = 0; i < this.numcategories; i++) {
        newcategorynames.push(this.category_names[i]);
      }
      let newisimage = [];
      for (let i = 0; i < this.numcategories; i++) {
        newisimage.push(this.is_image[i]);
      }
      let category_values2 = [];
      for (let i = 0; i < this.numvalues; i++) {
        category_values2.push([]);
        for (let j = 0; j < this.numcategories; j++) {
          category_values2[i].push(this.category_values[i][j]);
        }
      }
      for (let i = 0; i < this.old_values.length; i++) {
        for (let j = 0; j < this.old_values[i].length; j++) {
          if (
            this.old_isimage[j] &&
            !this.is_image[j] &&
            this.old_values[i][j] != "" &&
            this.old_values[i][j] != []
          ) {
            let oldRef = ref(projectStorage, this.old_values[i][j]);
            // Delete the file
            deleteObject(oldRef)
              .then(() => {
                // File deleted successfully
              })
              .catch((error) => {
                // Uh-oh, an error occurred!
              });
          }
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          if (
            this.is_image[i] &&
            this.category_values[j][i] != "" &&
            this.category_values[j][i] != [] &&
            this.category_values[j][i].name != undefined
          ) {
            if (
              this.old_isimage[i] &&
              this.old_values[j][i] != "" &&
              this.old_values[j][i] != []
            ) {
              let oldRef = ref(projectStorage, this.old_values[j][i]);
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
              this.category_values[j][i].name.split(".")[
                this.category_values[j][i].name.split(".").length - 1
              ];
            const reference =
              "integram/" +
              params_id +
              "/" +
              (i + 1) +
              this.alphabet[j] +
              "." +
              exstension;
            const storageRef = ref(projectStorage, reference);
            const metadata = {
              contentType: "image/" + exstension,
            };
            // 'file' comes from the Blob or File API
            uploadBytes(storageRef, this.category_values[j][i], metadata)
              .then((snapshot) => {})
              .catch((error) => {});
            category_values2[j][i] = reference;
          }
        }
      }
      integramsRef
        .doc(params_id)
        .update({
          category_values: funct_ref(category_values2),
          category_names: newcategorynames,
          is_image: newisimage,
          instructions: newinstructions,
          title: this.title,
          description: this.description,
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
            this.$vaToast.init("Postojeća zagonetka je uspješno izmijenjena."),
            1000
          ).then(() => {
            this.$router.push("/search-integram");
          });
        });
    },
    duplicate() {
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newinstructions = [];
      for (let i = 0; i < this.numinstructions; i++) {
        newinstructions.push(this.instructions[i]);
      }
      let newcategorynames = [];
      for (let i = 0; i < this.numcategories; i++) {
        newcategorynames.push(this.category_names[i]);
      }
      let newisimage = [];
      for (let i = 0; i < this.numcategories; i++) {
        newisimage.push(this.is_image[i]);
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
      integramsRef
        .add({
          category_values: "",
          category_names: newcategorynames,
          is_image: newisimage,
          instructions: newinstructions,
          title: this.title,
          description: this.description,
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
          let category_values2 = [];
          for (let i = 0; i < this.numvalues; i++) {
            category_values2.push([]);
            for (let j = 0; j < this.numcategories; j++) {
              category_values2[i].push(this.category_values[i][j]);
            }
          }
          for (let i = 0; i < this.numcategories; i++) {
            for (let j = 0; j < this.numvalues; j++) {
              if (
                this.is_image[i] &&
                this.category_values[j][i] != "" &&
                this.category_values[j][i] != [] &&
                this.category_values[j][i].name != undefined
              ) {
                let exstension =
                  this.category_values[j][i].name.split(".")[
                    this.category_values[j][i].name.split(".").length - 1
                  ];
                const reference =
                  "integram/" +
                  some_id +
                  "/" +
                  (i + 1) +
                  this.alphabet[j] +
                  "." +
                  exstension;
                const storageRef = ref(projectStorage, reference);
                const metadata = {
                  contentType: "image/" + exstension,
                };
                // 'file' comes from the Blob or File API
                uploadBytes(storageRef, this.category_values[j][i], metadata)
                  .then((snapshot) => {})
                  .catch((error) => {});
                category_values2[j][i] = reference;
              } else {
                if (
                  this.is_image[i] &&
                  this.category_values[j][i] != "" &&
                  this.category_values[j][i] != [] &&
                  this.category_values[j][i].name == undefined
                ) {
                  var old_reference = ref(
                    projectStorage,
                    this.old_values[j][i]
                  );
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
                  const reference =
                    "integram/" +
                    some_id +
                    "/" +
                    (i + 1) +
                    this.alphabet[j] +
                    "." +
                    exstension;
                  const storageRef = ref(projectStorage, reference);
                  const metadata = {
                    contentType: "image/" + exstension,
                  };
                  // 'file' comes from the Blob or File API
                  uploadBytes(storageRef, this.category_values[j][i], metadata)
                    .then((snapshot) => {})
                    .catch((error) => {});
                  category_values2[j][i] = reference;
                }
              }
            }
          }
          integramsRef
            .doc(some_id)
            .update({
              category_values: funct_ref(category_values2),
              category_names: newcategorynames,
              is_image: newisimage,
              instructions: newinstructions,
              title: this.title,
              description: this.description,
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
                this.$vaToast.init("Nova zagonetka je uspješno spremljena."),
                1000
              ).then(() => {
                this.$router.push("/search-integram");
              });
            });
        })
        .catch((error) => {});
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
      let string_category_values = [];
      let string_category_names = [];
      let string_is_image = [];
      let string_instructions = "";
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
      integramsRef
        .get(params_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == params_id) {
              string_category_values = funct_ref(
                childSnapshot.get("category_values")
              );
              string_category_names = childSnapshot.get("category_names");
              string_is_image = childSnapshot.get("is_image");
              string_instructions = childSnapshot.get("instructions");
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
            this.category_values = string_category_values;
            this.old_values = this.category_values;
            this.category_names = string_category_names;
            this.is_image = string_is_image;
            this.old_isimage = this.is_image;
            this.instructions = string_instructions;
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
            this.numvalues = this.category_values.length;
            this.numcategories = this.category_values[0].length;
            this.numinstructions = this.instructions.length;
            this.change_instructions();
            this.initialize();
            this.getPicture();
            this.$forceUpdate();
          } else {
            this.new_async(
              this.$vaToast.init("Ne postoji zagonetka s tim brojem."),
              1000
            ).then(() => {
              this.$router.push("/search-integram");
            });
          }
        });
    },
    getPicture() {
      this.urls = [];
      let me = this;
      for (let i = 0; i < this.numcategories; i++) {
        this.urls.push([]);
        for (let j = 0; j < this.numvalues; j++) {
          this.urls[i].push("");
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          if (
            this.is_image[i] &&
            this.category_values[j][i] != "" &&
            this.category_values[j][i] != []
          ) {
            let file = this.category_values[j][i];
            if (file && file != "" && file != []) {
              if (file.name == undefined) {
                // Create a reference to the file we want to download
                var reference = ref(projectStorage, file);
                // Get the download URL
                getDownloadURL(reference)
                  .then((url) => {
                    me.urls[j][i] = url;
                    this.$forceUpdate();
                    if (document.getElementById("img" + j + ":" + i)) {
                      document.getElementById("img" + j + ":" + i).src = url;
                    }
                  })
                  .catch((error) => {});
              } else {
                let comp_url = URL.createObjectURL(file);
                me.urls[j][i] = comp_url;
                this.$forceUpdate();
                if (document.getElementById("img" + j + ":" + i)) {
                  document.getElementById("img" + j + ":" + i).src = comp_url;
                }
              }
            }
          }
        }
      }
      this.fully_loaded = true;
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
    getColorDarker(starting_color, amount) {
      return tinycolor(starting_color)
        .darken(amount * 10)
        .toString();
    },
    colorOrWarning(starting_color, category_to_display, k) {
      if (this.is_duplicate_value(category_to_display - 1, k - 1) == false) {
        if (this.category_values[k - 1][category_to_display - 1] == "") {
          return "danger";
        } else {
          return this.getColorDarker(starting_color, category_to_display);
        }
      } else {
        return "danger";
      }
    },
    getWarningText(category_to_display, k) {
      if (this.is_duplicate_value(category_to_display - 1, k - 1) == false) {
        if (this.category_values[k - 1][category_to_display - 1] == "") {
          return "Nema slike.";
        } else {
          return "";
        }
      } else {
        return "Slika nije jedinstvena unutar kategorije.";
      }
    },
  },
  beforeUpdate() {
    this.initialize();
    if (this.$refs.valuesform) {
      for (let i = 0; i < this.$refs.valuesform.length; i++) {
        if (this.$refs.valuesform[i]) {
          this.$refs.valuesform[i].validate();
        }
      }
    }
    if (this.$refs.namesform) {
      for (let i = 0; i < this.$refs.namesform.length; i++) {
        if (this.$refs.namesform[i]) {
          this.$refs.namesform[i].validate();
        }
      }
    }
    if (this.$refs.instructionsform) {
      for (let i = 0; i < this.$refs.instructionsform.length; i++) {
        if (this.$refs.instructionsform[i]) {
          this.$refs.instructionsform[i].validate();
        }
      }
    }
  },
  beforeMount() {
    this.initialize();
    if (this.$props.edit) {
      this.fetch_puzzle();
    } else {
      this.change_instructions();
      this.initialize();
      this.getPicture();
    }
    if (this.$refs.valuesform) {
      for (let i = 0; i < this.$refs.valuesform.length; i++) {
        if (this.$refs.valuesform[i]) {
          this.$refs.valuesform[i].validate();
        }
      }
    }
    if (this.$refs.namesform) {
      for (let i = 0; i < this.$refs.namesform.length; i++) {
        if (this.$refs.namesform[i]) {
          this.$refs.namesform[i].validate();
        }
      }
    }
    if (this.$refs.instructionsform) {
      for (let i = 0; i < this.$refs.instructionsform.length; i++) {
        if (this.$refs.instructionsform[i]) {
          this.$refs.instructionsform[i].validate();
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
      <va-icon size="large" name="rule_folder"></va-icon>
      &nbsp;
      <span v-if="edit">Uredi</span>
      <span v-else>Stvori</span> integram
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
              name: 'solve_integram',
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
              name: 'create_integram',
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
              name: 'search_integram',
            }"
          >
            <va-icon name="search"></va-icon>
            &nbsp; Popis integrama
          </router-link>
        </va-tab>
        <va-tab
          v-if="edit"
          :disabled="
            !(
              edit &&
              !alert &&
              !alert_instruction &&
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
              !alert &&
              !alert_instruction &&
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
        :min_value="value_counter_min"
        :max_value="value_counter_max"
        v-bind:value="numvalues"
        @input="(n) => ((numvalues = n), $forceUpdate())"
        :some_text="'Broj pojmova'"
      ></MyCounter>
      <MyCounter
        :min_value="category_counter_min"
        :max_value="category_counter_max"
        v-bind:value="numcategories"
        @input="(n) => ((numcategories = n), $forceUpdate())"
        :some_text="'Broj kategorija'"
      ></MyCounter>
      <MyCounter
        :min_value="instruction_counter_min"
        :max_value="instruction_coutner_max"
        v-bind:value="numinstructions"
        @input="(n) => ((numinstructions = n), $forceUpdate())"
        :some_text="'Broj opisnih uputa'"
      ></MyCounter>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Upute &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1]">
      <div v-for="i in numinstructions" v-bind:key="i">
        <h6 class="display-6" style="text-align: start; color: #2c82e0">
          {{ i }} . uputa
        </h6>
        <br />
        <va-form ref="instructionsform">
          <va-input
            v-model="instructions[i - 1]"
            type="text"
            @update:model-value="
              check_same();
              $forceUpdate();
            "
            immediate-validation
            :rules="[
              (value) => {
                if (is_duplicate_instruction(i - 1) == false) {
                  if (value == '') {
                    return 'Unesite uputu.';
                  } else {
                    return true;
                  }
                } else {
                  if (value == '') {
                    return 'Unesite uputu.';
                  } else {
                    return 'Uputa nije jedinstvena.';
                  }
                }
              },
            ]"
          />
        </va-form>
        <br v-if="numinstructions != i" />
      </div>
      <!--<br v-if="alert_instruction" />
      <va-alert dense outline
        v-if="alert_instruction"
        style="white-space: pre-wrap; border: none"
        color="danger"
        :title="'Greške u unosu uputa'"
        center
      >
        Neke upute nisu popunjene ili nisu jedinstvene.
      </va-alert>-->
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[2] = !value[2]"
        class="display-6"
        style="text-align: start"
      >
        Kategorije &nbsp;
        <va-icon v-if="!value[2]" name="expand_more"></va-icon>
        <va-icon v-if="value[2]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[2]">
      <div style="overflow-x: scroll">
        <table style="display: inline-table">
          <tr>
            <td
              v-for="category_to_display in numcategories"
              :key="category_to_display"
              style="
                width: 250px;
                min-width: 250px;
                max-width: 250px;
                padding: 10px;
              "
            >
              <va-button
                @click="
                  clear_category(category_to_display - 1);
                  is_image[category_to_display - 1] =
                    !is_image[category_to_display - 1];
                  clear_category(category_to_display - 1);
                  $forceUpdate();
                "
                outline
                :rounded="false"
                style="border: none"
                :color="getColorDarker('#2C82E0', category_to_display)"
              >
                {{ category_to_display }}. kategorija
                <va-icon
                  v-if="is_image[category_to_display - 1] == false"
                  name="title"
                />
                <va-icon size="large" v-else name="photo" />
              </va-button>
            </td>
          </tr>
          <tr>
            <td
              v-for="category_to_display in numcategories"
              :key="category_to_display"
              style="
                width: 250px;
                min-width: 250px;
                max-width: 250px;
                padding: 10px;
              "
            >
              <va-form ref="namesform">
                <va-input
                  type="text"
                  v-model="category_names[category_to_display - 1]"
                  immediate-validation
                  @update:model-value="
                    check_same();
                    $forceUpdate();
                  "
                  :rules="[
                    (value) => {
                      if (is_duplicate_name(category_to_display - 1) == false) {
                        if (value == '') {
                          return 'Unesite kategoriju.';
                        } else {
                          return true;
                        }
                      } else {
                        if (value == '') {
                          return 'Unesite kategoriju.';
                        } else {
                          return 'Kategorija nije jedinstvena.';
                        }
                      }
                    },
                  ]"
                />
              </va-form>
            </td>
          </tr>
          <tr v-for="k in numvalues" v-bind:key="k">
            <td
              v-for="category_to_display in numcategories"
              :key="category_to_display"
              style="
                width: 250px;
                min-width: 250px;
                max-width: 250px;
                padding: 10px;
              "
            >
              <span v-if="is_image[category_to_display - 1] == true">
                <div>
                  <va-button
                    outline
                    :rounded="false"
                    style="border: none"
                    :color="colorOrWarning('#2C82E0', category_to_display, k)"
                    @click="
                      click_file(k - 1, category_to_display - 1);
                      check_same();
                      $forceUpdate();
                    "
                  >
                    <span
                      v-if="
                        this.category_values[k - 1][category_to_display - 1] !=
                          '' &&
                        this.category_values[k - 1][category_to_display - 1] !=
                          [] &&
                        this.category_values[k - 1][category_to_display - 1]
                          .name != undefined
                      "
                    >
                      {{
                        this.category_values[k - 1][category_to_display - 1]
                          .name
                      }}
                    </span>
                    <span
                      v-if="
                        this.category_values[k - 1][category_to_display - 1] !=
                          '' &&
                        this.category_values[k - 1][category_to_display - 1] !=
                          [] &&
                        this.category_values[k - 1][category_to_display - 1]
                          .name == undefined
                      "
                    >
                      {{ this.category_values[k - 1][category_to_display - 1] }}
                    </span>
                    <span
                      v-if="
                        this.category_values[k - 1][category_to_display - 1] ==
                          '' ||
                        this.category_values[k - 1][category_to_display - 1] ==
                          []
                      "
                    >
                      <va-icon name="photo" />
                      &nbsp; Odaberi sliku
                    </span>
                  </va-button>
                </div>
                <span
                  v-if="getWarningText(category_to_display, k) != ''"
                  style="font-size: 13px; color: #de1041"
                >
                  {{ getWarningText(category_to_display, k) }}
                </span>
              </span>
              <va-form ref="valuesform">
                <input
                  v-if="is_image[category_to_display - 1] == true"
                  file-types="image/*"
                  type="file"
                  :id="'fileinput' + (k - 1) + ':' + (category_to_display - 1)"
                  style="display: none; visibility: hidden; width: 0%"
                  @input="
                    image_uploaded(k - 1, category_to_display - 1);
                    check_same();
                    $forceUpdate();
                  "
                />
                <va-input
                  v-else
                  type="text"
                  :label="k + ' . pojam'"
                  v-model="category_values[k - 1][category_to_display - 1]"
                  immediate-validation
                  @update:model-value="
                    check_same();
                    $forceUpdate();
                  "
                  :rules="[
                    (value) => {
                      if (
                        is_duplicate_value(category_to_display - 1, k - 1) ==
                        false
                      ) {
                        if (value == '') {
                          return 'Unesite pojam.';
                        } else {
                          return true;
                        }
                      } else {
                        if (value == '') {
                          return 'Unesite pojam.';
                        } else {
                          return 'Pojam nije jedinstven unutar kategorije.';
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
      <!--<br v-if="alert" />
      <va-alert dense outline
        v-if="alert"
        style="white-space: pre-wrap; border: none"
        color="danger"
        :title="'Greške u unosu kategorija i vrijednosti'"
        center
      >
        Neke kategorije i vrijednosti nisu popunjene ili nisu jedinstvene.
      </va-alert>-->
    </div>
    <br v-else />

    <va-card
      color="background"
      style="padding: 10px"
      v-if="
        is_image[0] == true ||
        is_image[1] == true ||
        is_image[2] == true ||
        is_image[3] == true ||
        is_image[4] == true
      "
    >
      <h6
        @click="value[3] = !value[3]"
        class="display-6"
        style="text-align: start"
      >
        Slike &nbsp;
        <va-icon v-if="!value[3]" name="expand_more"></va-icon>
        <va-icon v-if="value[3]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div
      class="my_row"
      v-if="
        value[3] &&
        (is_image[0] == true ||
          is_image[1] == true ||
          is_image[2] == true ||
          is_image[3] == true ||
          is_image[4] == true)
      "
    >
      <h6 class="display-6" style="text-align: start">Kategorija</h6>
      <br />
      <div>
        <va-tabs v-model="category_for_image">
          <template #tabs>
            <span v-for="category in numcategories" v-bind:key="category">
              <va-tab
                :name="category"
                v-if="is_image[category - 1] == true"
                :color="getColorDarker('#2C82E0', category)"
              >
                <span> {{ category }} </span>
              </va-tab>
            </span>
            <va-tab :name="10000" disabled></va-tab>
          </template>
        </va-tabs>
      </div>
      <br />
      <h6
        class="display-6"
        style="text-align: start"
        v-if="category_for_image != null && is_image[category_for_image - 1]"
      >
        Pojam
      </h6>
      <br
        v-if="category_for_image != null && is_image[category_for_image - 1]"
      />
      <div>
        <va-tabs
          v-if="category_for_image != null && is_image[category_for_image - 1]"
          v-model="value_to_display"
          :color="getColorDarker('#2C82E0', category_for_image)"
        >
          <template #tabs>
            <span v-for="val in numvalues" v-bind:key="val">
              <va-tab
                :name="val"
                :color="getColorDarker('#2C82E0', category_for_image)"
              >
                <span> {{ category_for_image }}{{ alphabet[val - 1] }} </span>
              </va-tab>
            </span>
            <va-tab :name="10000" disabled></va-tab>
          </template>
        </va-tabs>
      </div>
      <br
        v-if="category_for_image != null && is_image[category_for_image - 1]"
      />
      <div
        v-if="
          value_to_display != null &&
          category_for_image != null &&
          is_image[category_for_image - 1] &&
          urls[value_to_display - 1][category_for_image - 1] != ''
        "
      >
        <img
          :id="'img' + (value_to_display - 1) + ':' + (category_for_image - 1)"
          :src="urls[value_to_display - 1][category_for_image - 1]"
          alt=""
          style="max-width: 500px; max-height: 500px; width: 100%; height: 100%"
        />
      </div>
      <div
        v-if="
          value_to_display != null &&
          category_for_image != null &&
          is_image[category_for_image - 1] &&
          urls[value_to_display - 1][category_for_image - 1] == ''
        "
        style="color: #de1041"
      >
        Nema slike
      </div>
    </div>
    <br
      v-if="
        !value[3] &&
        (is_image[0] == true ||
          is_image[1] == true ||
          is_image[2] == true ||
          is_image[3] == true ||
          is_image[4] == true)
      "
    />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[4] = !value[4]"
        class="display-6"
        style="text-align: start"
      >
        Podaci o zagonetci &nbsp;
        <va-icon v-if="!value[4]" name="expand_more"></va-icon>
        <va-icon v-if="value[4]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[4]">
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
        @click="value[5] = !value[5]"
        class="display-6"
        v-if="permission_to_edit_visibility || !edit"
        style="text-align: start"
      >
        Dozvola uređivanja &nbsp;
        <va-icon v-if="!value[5]" name="expand_more"></va-icon>
        <va-icon v-if="value[5]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[5]">
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
    <IntegramInfo></IntegramInfo>
  </va-modal>
</template>


<style scoped>
table {
  border-collapse: collapse;
}
td,
tr {
  text-align: center;
  border-collapse: collapse;
}
table {
  display: inline-table;
}
</style>
