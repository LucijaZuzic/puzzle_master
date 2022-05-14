<script>
import { nonogramsRef } from "../main.js";
import { usersRef } from "../main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Navbar from "./Navbar.vue";
import LoadingBar from "./LoadingBar.vue";

export default {
  components: {
    Navbar,
    LoadingBar,
  },
  data() {
    return {
      fully_loaded: false,
      permission_to_edit_visibility: false,
      user: null,
      title: "",
      warning: "",
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
      colnum: 20,
      rownum: 20,
      maxcol: 0,
      maxrow: 0,
      row_colors: [],
      col_colors: [],
      mode: 0,
      blocked: false,
      drag: false,
      prev_x: -1,
      prev_y: -1,
      num_colors: 2,
      wrong_colors: [false, false],
      colors: ["#FFFFFF", "#000000"],
      current_x: null,
      current_y: null,
    };
  },
  methods: {
    getAuthorUserRecord() {
      let some_id = this.author;
      let newRecord = {};
      usersRef
        .get(some_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == some_id) {
              newRecord = {
                displayName: childSnapshot.get("displayName"),
                email: childSnapshot.get("email"),
              };
            }
          });
        })
        .then(() => {
          this.authorUserRecord = newRecord;
        });
    },
    getUpdaterUserRecord() {
      let some_id = this.updater;
      let newRecord = {};
      usersRef
        .get(some_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == some_id) {
              newRecord = {
                displayName: childSnapshot.get("displayName"),
                email: childSnapshot.get("email"),
              };
            }
          });
        })
        .then(() => {
          this.updaterUserRecord = newRecord;
        });
    },
    getCollaboratorUserRecord() {
      this.permissionsUserRecords = [];
      for (let i = 0; i < this.permissions.length; i++) {
        let some_id = this.permissions[i];
        let newRecord = {};
        usersRef
          .get(some_id)
          .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              let id = childSnapshot.id;
              if (id == some_id) {
                newRecord = {
                  displayName: childSnapshot.get("displayName"),
                  email: childSnapshot.get("email"),
                };
              }
            });
          })
          .then(() => {
            this.permissionsUserRecords.push(newRecord);
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
            this.$router.push("/search-nonogram");
          });
        }
      }
    },
    checkIfUserExists() {
      let email = this.collaborator;
      let found = false;
      let uid = "";
      let displayName = "";
      if (this.user.email == email) {
        this.$vaToast.init("Ne možete dodati samog sebe kao suradnika.");
      } else {
        usersRef
          .get()
          .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              let some_email = childSnapshot.get("email");
              if (email == some_email) {
                found = true;
                uid = childSnapshot.id;
                displayName = childSnapshot.get("displayName");
              }
            });
          })
          .then(() => {
            if (found == true) {
              let duplicate = false;
              for (let i = 0; i < this.permissions.length; i++) {
                if (this.permissions[i] == uid) {
                  duplicate = true;
                  break;
                }
              }
              if (duplicate == true) {
                this.$vaToast.init("Ne možete dodati istog suradnika dvaput.");
              } else {
                this.permissions.push(uid);
                this.permissionsUserRecords.push({
                  displayName: displayName,
                  email: email,
                });
              }
            } else {
              this.$vaToast.init(
                "Ne možete dodati suradnika jer ne postoji korisnik s tom email adresom."
              );
            }
          });
      }
    },
    reset() {
      this.solution = new Array();
      for (let i = 0; i < this.rownum; i++) {
        let one_arr = new Array();
        for (let j = 0; j < this.colnum; j++) {
          one_arr.push(0);
        }
        this.solution.push(one_arr);
      }
      this.$forceUpdate();
    },
    parse_sequence() {
      this.getrow();
      this.getcol();
      this.getmaxrow();
      this.getmaxcol();
      this.colorcol();
      this.colorrow();
    },
    initialize() {
      this.maxcol = 0;
      this.maxrow = 0;
      let oldsolution = new Array();
      let maxrownum = this.rownum;
      let maxcolnum = this.colnum;
      if (this.solution) {
        oldsolution = this.solution;
        if (oldsolution.length > maxrownum) {
          maxrownum = oldsolution.length;
        }
        if (oldsolution[0].length > maxcolnum) {
          maxcolnum = oldsolution[0].length;
        }
      }

      this.columns = new Array();
      this.rows = new Array();
      this.col_colors = new Array();
      this.row_colors = new Array();
      for (let i = 0; i < maxcolnum; i++) {
        this.col_colors.push([]);
        this.columns.push([]);
      }
      for (let i = 0; i < maxrownum; i++) {
        this.row_colors.push([]);
        this.rows.push([]);
      }

      this.solution = new Array();
      for (let i = 0; i < maxrownum; i++) {
        let one_arr = new Array();
        for (let j = 0; j < maxcolnum; j++) {
          one_arr.push(0);
        }
        this.solution.push(one_arr);
      }
      for (let i = 0; i < oldsolution.length; i++) {
        for (let j = 0; j < oldsolution[i].length; j++) {
          this.solution[i][j] = oldsolution[i][j];
        }
      }
      this.parse_sequence();
    },
    increment(x, y, ismouseover) {
      if (this.blocked == true) {
        return;
      }
      if (ismouseover && !this.drag) {
        return;
      }
      if (!document.getElementById("colorpicker" + this.mode)) {
        this.mode = 0;
      }
      this.solution[x][y] = this.mode;
      document.getElementById("cell" + x + ":" + y).style.backgroundColor =
        document.getElementById("colorpicker" + this.mode).value;
      this.solution = [...this.solution];
      this.parse_sequence();
      this.$forceUpdate();
    },
    check_equal_colors() {
      this.wrong_colors = [];
      this.warning = "";
      for (let i = 0; i < this.num_colors; i++) {
        for (let j = i + 1; j < this.num_colors; j++) {
          if (this.colors[i] == this.colors[j]) {
            if (this.warning.length > 0) {
              this.warning += " ";
            }
            this.warning += i + ". i " + j + ". boja su jednake.";
          }
        }
      }
      for (let i = 0; i < this.num_colors; i++) {
        this.wrong_colors.push(false);
        for (let j = 0; j < this.num_colors; j++) {
          if (i != j && this.colors[i] == this.colors[j]) {
            this.wrong_colors[i] = true;
            break;
          }
        }
      }
    },
    update_colors() {
      for (let i = 1; i < this.colors.length; i++) {
        if (document.getElementById("colorpicker" + i)) {
          this.colors[i] = document.getElementById("colorpicker" + i).value;
        }
      }
      for (let i = 0; i < this.rownum; i++) {
        for (let j = 0; j < this.colnum; j++) {
          if (document.getElementById("cell" + i + ":" + j)) {
            document.getElementById(
              "cell" + i + ":" + j
            ).style.backgroundColor = this.colors[this.solution[i][j]];
            if (this.solution[i][j] >= this.num_colors) {
              document.getElementById(
                "cell" + i + ":" + j
              ).style.backgroundColor = this.colors[0];
              this.solution[i][j] = 0;
            }
          }
        }
      }
    },
    getcol() {
      let color_val = new Array();
      let val = new Array();
      for (let i = 0; i < this.colnum; i++) {
        let color = -1;
        let prev_color = -1;
        let color_array = new Array();
        let one_arr = new Array();
        let current = 0;
        for (let j = 0; j < this.rownum; j++) {
          color = this.solution[j][i];
          if (color == prev_color) {
            if (color != 0) {
              current += 1;
            }
          } else {
            if (current != 0 && prev_color != 0) {
              color_array.push(prev_color);
              one_arr.push(current);
            }
            current = 1;
          }
          prev_color = color;
        }
        if (current != 0 && prev_color != 0) {
          color_array.push(prev_color);
          one_arr.push(current);
        }
        color_val.push(color_array);
        val.push(one_arr);
      }
      this.col_colors = color_val;
      this.columns = val;
    },
    colorcol() {
      for (let i = 0; i < this.col_colors.length; i++) {
        for (let j = 0; j < this.col_colors[i].length; j++) {
          if (document.getElementById("column" + i + ":" + j)) {
            document.getElementById("column" + i + ":" + j).style.color =
              this.colors[this.col_colors[i][j]];
          }
        }
      }
    },
    getrow() {
      let color_val = new Array();
      let val = new Array();
      for (let i = 0; i < this.rownum; i++) {
        let color = -1;
        let prev_color = -1;
        let color_array = new Array();
        let one_arr = new Array();
        let current = 0;
        for (let j = 0; j < this.colnum; j++) {
          color = this.solution[i][j];
          if (color == prev_color) {
            if (color != 0) {
              current += 1;
            }
          } else {
            if (current != 0 && prev_color != 0) {
              color_array.push(prev_color);
              one_arr.push(current);
            }
            current = 1;
          }
          prev_color = color;
        }
        if (current != 0 && prev_color != 0) {
          color_array.push(prev_color);
          one_arr.push(current);
        }
        color_val.push(color_array);
        val.push(one_arr);
      }
      this.row_colors = color_val;
      this.rows = val;
    },
    colorrow() {
      for (let i = 0; i < this.row_colors.length; i++) {
        for (let j = 0; j < this.row_colors[i].length; j++) {
          if (document.getElementById("row" + i + ":" + j)) {
            document.getElementById("row" + i + ":" + j).style.color =
              this.colors[this.row_colors[i][j]];
          }
        }
      }
    },
    getmaxrow() {
      let val = 0;
      for (let i = 0; i < this.colnum; i++) {
        if (this.columns[i].length > val) {
          val = this.columns[i].length;
        }
      }
      this.maxrow = val;
    },
    getmaxcol() {
      let val = 0;
      for (let i = 0; i < this.rownum; i++) {
        if (this.rows[i].length > val) {
          val = this.rows[i].length;
        }
      }
      this.maxcol = val;
    },
    expand_color_list() {
      let oldcolors = [];
      let maxcolors = this.num_colors;
      if (this.colors) {
        oldcolors = this.colors;
        if (oldcolors.length > this.num_colors) {
          maxcolors = oldcolors.length;
        }
      }
      this.colors = [];
      for (let i = 0; i < maxcolors; i++) {
        this.colors.push("#000000");
      }
      for (let i = 0; i < oldcolors.length; i++) {
        this.colors[i] = oldcolors[i];
      }
    },
    trigger_click(i) {
      this.blocked = true;
      document.getElementById("colorpicker" + i).click();
    },
    after_click(i) {
      this.mode = i;
      document.getElementById("colorbutton" + i).style.backgroundColor =
        document.getElementById("colorpicker" + i).value;
      this.update_colors();
      this.blocked = false;
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
    shorten_colors() {
      let colors_array = [];
      for (let i = 0; i < this.num_colors; i++) {
        colors_array.push(this.colors[i]);
      }
      this.colors = colors_array;
    },
    store() {
      this.shorten_colors();
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      for (let i = 0; i < this.rownum; i++) {
        newsolution.push([]);
        for (let j = 0; j < this.colnum; j++) {
          newsolution[i].push(this.solution[i][j]);
          if (newsolution[i][j] >= this.num_colors) {
            newsolution[i][j] = 0;
          }
        }
      }
      let newcolors = [];
      for (let i = 0; i < this.num_colors; i++) {
        newcolors.push(this.colors[i]);
      }
      nonogramsRef
        .doc(this.$route.params.id)
        .update({
          solution: funct_ref(newsolution),
          colors: newcolors,
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
            this.$router.push("/search-nonogram");
          });
        });
    },
    duplicate() {
      this.shorten_colors();
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      for (let i = 0; i < this.rownum; i++) {
        newsolution.push([]);
        for (let j = 0; j < this.colnum; j++) {
          newsolution[i].push(this.solution[i][j]);
          if (newsolution[i][j] >= this.num_colors) {
            newsolution[i][j] = 0;
          }
        }
      }
      let newcolors = [];
      for (let i = 0; i < this.num_colors; i++) {
        newcolors.push(this.colors[i]);
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
      nonogramsRef
        .add({
          solution: funct_ref(newsolution),
          colors: newcolors,
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
            this.$router.push("/search-nonogram");
          });
        });
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
      let string_colors = [];
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
      nonogramsRef
        .get(params_id)
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == params_id) {
              string_solution = funct_ref(childSnapshot.get("solution"));
              string_colors = childSnapshot.get("colors");
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
            this.colors = string_colors;
            this.num_colors = this.colors.length;
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
            this.rownum = this.solution.length;
            this.colnum = this.solution[0].length;
            this.expand_color_list();
            this.initialize();
            this.check_equal_colors();
            this.fully_loaded = true;
            this.$forceUpdate();
          } else {
            this.new_async(
              this.$vaToast.init("Ne postoji zagonetka s tim brojem."),
              1000
            ).then(() => {
              this.$router.push("/search-nonogram");
            });
          }
        });
    },
    modeChange(event) {
      switch (event.code) {
        case "ArrowUp":
          this.mode++;
          if (this.mode >= this.num_colors) {
            this.mode = 0;
          }
          break;
        case "ArrowDown":
          this.mode--;
          if (this.mode < 0) {
            this.mode = this.num_colors - 1;
          }
          break;
        case "ArrowRight":
          this.mode++;
          if (this.mode >= this.num_colors) {
            this.mode = 0;
          }
          break;
        case "ArrowLeft":
          this.mode--;
          if (this.mode < 0) {
            this.mode = this.num_colors - 1;
          }
          break;
        case "KeyW":
          this.mode++;
          if (this.mode >= this.num_colors) {
            this.mode = 0;
          }
          break;
        case "KeyS":
          this.mode--;
          if (this.mode < 0) {
            this.mode = this.num_colors - 1;
          }
          break;
        case "KeyD":
          this.mode++;
          if (this.mode >= this.num_colors) {
            this.mode = 0;
          }
          break;
        case "KeyA":
          this.mode--;
          if (this.mode < 0) {
            this.mode = this.num_colors - 1;
          }
          break;
        case "Digit0":
          this.mode = 0;
          break;
        case "Digit1":
          if (this.num_colors > 1) {
            this.mode = 1;
          }
          break;
        case "Digit2":
          if (this.num_colors > 2) {
            this.mode = 2;
          }
          break;
        case "Digit3":
          if (this.num_colors > 3) {
            this.mode = 3;
          }
          break;
        case "Digit4":
          if (this.num_colors > 4) {
            this.mode = 4;
          }
          break;
        case "Digit5":
          if (this.num_colors > 5) {
            this.mode = 5;
          }
          break;
        case "Digit6":
          if (this.num_colors > 6) {
            this.mode = 6;
          }
          break;
        case "Digit7":
          if (this.num_colors > 7) {
            this.mode = 7;
          }
          break;
        case "Digit8":
          if (this.num_colors > 8) {
            this.mode = 8;
          }
          break;
        case "Digit9":
          if (this.num_colors > 9) {
            this.mode = 9;
          }
          break;
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
  },
  beforeDestroy() {
    //window.removeEventListener('keyup', this.modeChange);
  },
  beforeMount() {
    this.fetch_puzzle();
    this.expand_color_list();
    this.initialize();
    this.check_equal_colors();
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
  beforeUpdate() {
    this.expand_color_list();
    this.initialize();
    this.check_equal_colors();
  },
  updated() {
    this.update_colors();
    for (let i = 0; i < this.num_colors; i++) {
      document.getElementById("colorbutton" + i).style.backgroundColor =
        this.colors[i];
    }
    this.colorcol();
    this.colorrow();
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
  <Navbar></Navbar>
  <body class="mybody" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="mybody" v-else>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="rownum"
        @update:model-value="initialize()"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj redaka</span>
        </template>
        <!--<template #append>
                <va-input type="number" v-model="rownum" @update:model-value="initialize()" :min="1" :max="50"/>
            </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="colnum"
        @update:model-value="initialize()"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj stupaca</span>
        </template>
        <!--<template #append>
                <va-input type="number" v-model="colnum" @update:model-value="initialize()" :min="1" :max="50" />
            </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <span v-if="current_x != null && current_y != null"
        >({{ current_x }}, {{ current_y }})</span
      >
    </div>
    <div class="myrow" style="max-height: 500px">
      <va-infinite-scroll disabled :load="() => {}">
        <div>
          <table border="2">
            <tr v-for="column_number in maxrow" v-bind:key="column_number">
              <td
                v-if="column_number == 1"
                :colspan="maxcol"
                :rowspan="maxrow"
                style="background-color: #2c82e0"
              ></td>
              <td v-for="column_index in colnum" v-bind:key="column_index">
                <span
                  class="numbers"
                  :id="
                    'column' +
                    (column_index - 1) +
                    ':' +
                    (column_number -
                      1 -
                      maxrow +
                      columns[column_index - 1].length)
                  "
                >
                  {{
                    columns[column_index - 1][
                      column_number -
                        1 -
                        maxrow +
                        columns[column_index - 1].length
                    ]
                  }}
                </span>
              </td>
            </tr>
            <tr v-if="maxrow == 0">
              <td></td>
              <td v-for="column_index in colnum" v-bind:key="column_index">
                &nbsp;
              </td>
            </tr>
            <tr v-for="row_index in rownum" v-bind:key="row_index">
              <td v-for="row_number in maxcol" v-bind:key="row_number">
                <span
                  class="numbers"
                  :id="
                    'row' +
                    (row_index - 1) +
                    ':' +
                    (row_number - 1 - maxcol + rows[row_index - 1].length)
                  "
                >
                  {{
                    rows[row_index - 1][
                      row_number - 1 - maxcol + rows[row_index - 1].length
                    ]
                  }}
                </span>
              </td>
              <td v-if="maxcol == 0"></td>
              <td
                v-for="column_index in colnum"
                v-bind:key="column_index"
                @mouseover="
                  current_x = row_index;
                  current_y = column_index;
                  increment(row_index - 1, column_index - 1, true);
                "
                @click="increment(row_index - 1, column_index - 1, false)"
                :id="'cell' + (row_index - 1) + ':' + (column_index - 1)"
              >
                &nbsp;
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="myrow">
      <va-button style="overflow-wrap: anywhere" @click="reset()"
        ><va-icon name="delete" />&nbsp;Izbriši</va-button
      >
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="num_colors"
        @update:model-value="expand_color_list()"
        :min="2"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj boja</span>
        </template>
        <!--<template #append>
                <va-input type="number" v-model="num_colors" @update:model-value="expand_color_list()" :min="2" :max="50"/>
            </template>-->
      </va-slider>
    </div>
    <br />
    <div class="myrow">
      <va-icon
        v-if="wrong_colors[0] == true"
        name="error"
        color="danger"
      ></va-icon>
      <button
        class="mr-2"
        style="
          width: 28px;
          height: 28px;
          display: inline-block;
          background-color: white;
          border-radius: 50%;
        "
        :id="'colorbutton' + 0"
        @click="mode = 0"
      ></button>
      <input
        :id="'colorpicker' + 0"
        type="color"
        disabled
        hidden
        :value="colors[0]"
      />
      <div
        style="display: inline-block"
        v-for="i in num_colors - 1"
        v-bind:key="i"
      >
        <!--<va-icon style="position:relative;left:10px" v-if="wrong_colors[i]==true" name="error" color="danger"></va-icon>-->
        <button
          class="mr-2"
          style="
            width: 28px;
            height: 28px;
            display: inline-block;
            background-color: black;
            border-radius: 50%;
          "
          v-if="wrong_colors[i] == false"
          @click="trigger_click(i)"
          @focusout="after_click(i)"
          :id="'colorbutton' + i"
        ></button>
        <button
          class="mr-2"
          style="
            width: 28px;
            height: 28px;
            display: inline-block;
            color: white;
            background-color: black;
            border-color: #de1041;
            border-radius: 50%;
          "
          v-else
          @click="trigger_click(i)"
          @focusout="after_click(i)"
          :id="'colorbutton' + i"
        ></button>
      </div>
    </div>
    <br />
    <input
      hidden
      v-for="i in num_colors - 1"
      v-bind:key="i"
      type="color"
      @focusout="
        mode = i;
        update_colors();
      "
      :id="'colorpicker' + i"
      :value="colors[i]"
    />
    <div class="myrow">
      <va-button
        @click="drag = !drag"
        style="overflow-wrap: anywhere; margin-left: 10px; margin-top: 10px"
      >
        <span v-if="drag == false"
          ><va-icon name="grid_view" />&nbsp;Bojanje jedan po jedan</span
        ><span v-else
          ><va-icon name="gesture" />&nbsp;Bojanje prelaskom miša</span
        >
      </va-button>
    </div>
    <div class="myrow" v-if="warning">
      <va-alert
        color="danger"
        :title="'Postoje boje koje se ponavljaju'"
        center
        class="mb-4"
      >
        <!--<p >{{warning}}</p>-->
        Boje moraju biti jedinstvene.
      </va-alert>
      <br />
    </div>
    <br />
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
      <va-button
        style="overflow-wrap: anywhere"
        @click="is_public = !is_public"
      >
        <span v-if="is_public == false"
          ><va-icon name="public_off" />&nbsp;Samo suradnici</span
        ><span v-else><va-icon name="public" />&nbsp;Svi</span>
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
            !warning &&
            title.length > 0 &&
            description.length > 0 &&
            source.length > 0
          )
        "
        @click="store()"
      >
        <va-icon name="mode_edit" />&nbsp;Izmijeni postojeću
        zagonetku</va-button
      >
      <va-button
        style="overflow-wrap: anywhere; margin-left: 10px; margin-top: 10px"
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
        <va-icon name="control_point_duplicate" />&nbsp;Spremi izmjene kao novu
        zagonetku</va-button
      >
    </div>
  </body>
</template>

<style scoped>
table {
  display: inline-table;
  border: 1px solid black;
  border-collapse: collapse;
}
tr {
  border: 1px solid black;
  border-collapse: collapse;
}
td {
  border: 1px solid black;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  text-align: center;
  vertical-align: middle;
  border-collapse: collapse;
}
.numbers {
  font-weight: bold;
  display: block;
  position: relative;
  width: 24px;
  text-align: center;
}
</style>
