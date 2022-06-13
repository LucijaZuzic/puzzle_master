<script>
import tinycolor from "tinycolor2/tinycolor";
import { nonogramsRef, friendsRef } from "../../firebase_main.js";
import { usersRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import MyCounter from "../Utility/MyCounter.vue";
import NonogramInfo from "../Info/NonogramInfo.vue";
import LoadingBar from "../Utility/LoadingBar.vue";

export default {
  props: ["edit"],
  components: {
    LoadingBar,
    MyCounter,
    NonogramInfo,
  },
  data() {
    return {
      gridlines_on: true,
      reset_all: false,
      value: [false, false, false, false, false],
      zoom: 100,
      max_zoom: 200,
      row_counter_min: 1,
      row_counter_max: 50,
      column_counter_min: 1,
      column_counter_max: 50,
      color_counter_min: 2,
      color_counter_max: 50,
      allow_mouseover: false,
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
      prev_x: null,
      prev_y: null,
      num_colors: 2,
      wrong_colors: [false, false],
      colors: ["#ffffff", "#000000"],
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
    invertColor(hex) {
      if (hex.indexOf("#") === 0) {
        hex = hex.slice(1);
      }
      // convert 3-digit hex to 6-digits.
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) {
        throw new Error("Invalid HEX color.");
      }
      // invert color components
      var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
      // pad each with zeros and return
      return "#" + this.padZero(r) + this.padZero(g) + this.padZero(b);
    },
    padZero(str, len) {
      len = len || 2;
      var zeros = new Array(len).join("0");
      return (zeros + str).slice(-len);
    },
    returnMostReadable(hex) {
      return tinycolor
        .mostReadable(hex, [hex, this.invertColor(hex), "#000000", "#ffffff"], {
          includeFallbackColors: true,
        })
        .toHexString();
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
            this.$router.push("/search-nonogram");
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
    reset_current_color() {
      let old_mode = this.mode;
      this.mode = 0;
      for (let i = 0; i < this.solution.length; i++) {
        for (let j = 0; j < this.solution[i].length; j++) {
          if (this.solution[i][j] == old_mode) {
            this.increment(i, j, false);
          }
        }
      }
      this.mode = old_mode;
      this.$forceUpdate();
    },
    reset_choose_mode() {
      if (this.reset_all == true) {
        this.reset();
      } else {
        this.reset_current_color();
      }
    },
    parse_sequence() {
      this.getrow();
      this.getcol();
      this.getmaxrow();
      this.getmaxcol();
      //this.colorcol();
      //this.colorrow();
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
    increment(x, y, is_mouseover) {
      if (this.blocked == true) {
        return;
      }
      if (!document.getElementById("colorpicker" + this.mode)) {
        this.mode = 0;
      }
      if (is_mouseover) {
        if (this.allow_mouseover) {
          this.solution[x][y] = this.mode;
          if (
            document.getElementById("cell" + x + ":" + y) &&
            document.getElementById("colorpicker" + this.mode)
          ) {
            document.getElementById(
              "cell" + x + ":" + y
            ).style.backgroundColor = document.getElementById(
              "colorpicker" + this.mode
            ).value;
          }
          this.solution = [...this.solution];
          this.prev_x = null;
          this.prev_y = null;
          this.parse_sequence();
          this.$forceUpdate();
        }
        return;
      }
      if (!this.drag) {
        this.solution[x][y] = this.mode;
        if (
          document.getElementById("cell" + x + ":" + y) &&
          document.getElementById("colorpicker" + this.mode)
        ) {
          document.getElementById("cell" + x + ":" + y).style.backgroundColor =
            document.getElementById("colorpicker" + this.mode).value;
        }
        this.solution = [...this.solution];
        this.prev_x = null;
        this.prev_y = null;
        this.parse_sequence();
        this.$forceUpdate();
      } else {
        if (this.prev_x && this.prev_y) {
          for (
            let i = Math.min(this.prev_x, x);
            i <= Math.max(this.prev_x, x);
            i++
          ) {
            for (
              let j = Math.min(this.prev_y, y);
              j <= Math.max(this.prev_y, y);
              j++
            ) {
              this.solution[i][j] = this.mode;
              if (
                document.getElementById("cell" + i + ":" + j) &&
                document.getElementById("colorpicker" + this.mode)
              ) {
                document.getElementById(
                  "cell" + i + ":" + j
                ).style.backgroundColor = document.getElementById(
                  "colorpicker" + this.mode
                ).value;
              }
            }
          }
          this.solution = [...this.solution];
          this.prev_x = null;
          this.prev_y = null;
          this.parse_sequence();
          this.$forceUpdate();
        } else {
          this.prev_x = x;
          this.prev_y = y;
        }
      }
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
            document.getElementById(
              "column" + i + ":" + j
            ).style.backgroundColor = this.returnMostReadable(
              this.colors[this.col_colors[i][j]]
            );
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
            document.getElementById("row" + i + ":" + j).style.backgroundColor =
              this.returnMostReadable(this.colors[this.row_colors[i][j]]);
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
        let new_color = tinycolor.random();
        while (this.colors.includes(new_color)) {
          new_color = tinycolor.random();
        }
        this.colors.push(new_color.toHexString());
      }
      for (let i = 0; i < oldcolors.length; i++) {
        this.colors[i] = oldcolors[i].toLowerCase();
      }
    },
    trigger_click(i) {
      this.blocked = true;
      document.getElementById("colorpicker" + i).click();
    },
    after_click(i) {
      this.mode = i;
      let new_color = document.getElementById("colorpicker" + i).value;
      let found = false;
      for (let j = 0; j < this.num_colors; j++) {
        if (i == j) {
          continue;
        }
        if (new_color == this.colors[j]) {
          found = true;
          break;
        }
      }
      if (found) {
        this.$vaToast.init(
          "Dodali ste dvostruku boju, automatski je izmijenjena."
        );
      }
      while (found) {
        new_color = tinycolor.random().toHexString();
        found = false;
        for (let j = 0; j < this.num_colors; j++) {
          if (i == j) {
            continue;
          }
          if (new_color == this.colors[j]) {
            found = true;
            break;
          }
        }
      }
      this.colors[i] = new_color;
      document.getElementById("colorpicker" + i).value = new_color;
      document.getElementById("colorbutton" + i).style.backgroundColor =
        new_color;
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
    if (this.$props.edit) {
      this.fetch_puzzle();
    } else {
      this.expand_color_list();
      this.initialize();
      this.check_equal_colors();
      this.fully_loaded = true;
      this.$forceUpdate();
    }
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
      if (document.getElementById("colorbutton" + i)) {
        document.getElementById("colorbutton" + i).style.backgroundColor =
          this.colors[i];
      }
    }
    //this.colorcol();
    //this.colorrow();
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
      <va-icon size="large" name="draw"></va-icon>
      &nbsp;
      <span v-if="edit">Uredi</span>
      <span v-else>Stvori</span> nonogram
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
              name: 'solve_nonogram',
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
              name: 'create_nonogram',
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
              name: 'search_nonogram',
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
        v-bind:value="rownum"
        @input="(n) => ((rownum = n), $forceUpdate())"
        :some_text="'Broj redaka'"
      ></MyCounter>
      <MyCounter
        :min_value="column_counter_min"
        :max_value="column_counter_max"
        v-bind:value="colnum"
        @input="(n) => ((colnum = n), $forceUpdate())"
        :some_text="'Broj stupaca'"
      ></MyCounter>
      <MyCounter
        :min_value="color_counter_min"
        :max_value="color_counter_max"
        v-bind:value="num_colors"
        @input="(n) => ((num_colors = n), $forceUpdate())"
        :some_text="'Broj boja'"
      ></MyCounter>
    </div>
    <br v-else />
    <va-card color="background" style="padding: 10px">
      <h6
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Boje &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1]">
      <h6 class="display-6" style="text-align: start">Način bojanja</h6>
      <br />
      <va-tabs>
        <template #tabs>
          <va-tab
            @click="
              drag = !drag;
              if (allow_mouseover) {
                drag = false;
              }
            "
            :disabled="allow_mouseover"
          >
            <span v-if="drag == false">
              <va-icon name="grid_off" />
              &nbsp; Bojanje segmenta isključeno
            </span>
            <span v-else
              ><va-icon name="grid_on" /> &nbsp; Bojanje segmenta uključeno
            </span>
          </va-tab>
          <va-tab
            @click="
              allow_mouseover = !allow_mouseover;
              if (allow_mouseover) {
                drag = false;
              }
            "
          >
            <span v-if="allow_mouseover == false">
              <va-icon name="grid_view" />
              &nbsp; Bojanje gestom isključeno
            </span>
            <span v-else
              ><va-icon name="gesture" /> &nbsp; Bojanje gestom uključeno</span
            >
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <h6 class="display-6" style="text-align: start">Način brisanja</h6>
      <br />
      <va-tabs>
        <template #tabs>
          <va-tab @click="reset()"> Izbriši sve </va-tab>
          <va-tab @click="reset_current_color()">
            Izbriši odabranu boju
          </va-tab>
          <va-tab :name="10000" disabled></va-tab>
        </template>
      </va-tabs>
      <br />
      <div>
        <va-icon
          style="
            border-radius: 50%;
            display: inline-block;
            position: absolute;
            background-color: black;
          "
          v-if="mode == 0"
          name="check_circle"
          color="success"
        >
        </va-icon>
        <button
          class="mr-2"
          style="
            width: 28px;
            height: 28px;
            display: inline-block;
            background-color: white;
            border-radius: 50%;
            margin: 10px;
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
          <va-icon
            style="
              border-radius: 50%;
              display: inline-block;
              position: absolute;
              background-color: black;
            "
            v-if="mode == i"
            name="check_circle"
            color="success"
          >
          </va-icon>
          <button
            class="mr-2"
            style="
              width: 28px;
              height: 28px;
              display: inline-block;
              background-color: black;
              border-radius: 50%;
              margin: 10px;
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
      </div>
      <br v-if="warning" />
      <va-alert
        dense
        outline
        style="white-space: pre-wrap; border: none"
        v-if="warning"
        color="danger"
        :title="'Postoje boje koje se ponavljaju'"
        center
      >
        Boje moraju biti jedinstvene.
      </va-alert>
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
        <va-button
          @click="gridlines_on = !gridlines_on"
          outline
          :rounded="false"
          style="border: none"
        >
          <va-icon v-if="gridlines_on" name="border_all"></va-icon>
          <va-icon v-if="!gridlines_on" name="border_outer"></va-icon>
          <span v-if="gridlines_on"> &nbsp; Podebljaj mrežu</span>
          <span v-if="!gridlines_on"> &nbsp; Nemoj podebljati mrežu</span>
        </va-button>
      </div> 
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
        <table style="border: 5px solid black" id="table_zoom">
          <tr
            v-for="column_number in maxrow"
            v-bind:key="column_number"
            style="border: none !important"
          >
            <td
              v-if="column_number == 1"
              :colspan="maxcol"
              :rowspan="maxrow"
              style="
                background-color: #2c82e0;
                border-bottom: 5px solid black;
                border-right: 5px solid black;
              "
            ></td>
            <td
              v-for="column_index in colnum"
              v-bind:key="column_index"
              style="border: none !important"
            >
              <va-chip
                square
                class="numbers"
                v-if="
                  columns[column_index - 1][
                    column_number -
                      1 -
                      maxrow +
                      columns[column_index - 1].length
                  ]
                "
                :color="
                  colors[
                    col_colors[column_index - 1][
                      column_number -
                        1 -
                        maxrow +
                        columns[column_index - 1].length
                    ]
                  ]
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
              </va-chip>
            </td>
          </tr>
          <tr v-if="maxrow == 0">
            <td
              :colspan="maxcol"
              style="
                background-color: #2c82e0;
                border-bottom: 5px solid black;
                border-right: 5px solid black;
              "
            />
            <td
              v-for="column_index in colnum - 1"
              v-bind:key="column_index"
              style="border: none !important"
            >
              &nbsp;
            </td>
          </tr>
          <tr
            v-for="row_index in rownum"
            v-bind:key="row_index"
            style="border: none !important"
          >
            <td
              v-for="row_number in maxcol"
              v-bind:key="row_number"
              style="border: none !important"
            >
              <va-chip
                square
                class="numbers"
                v-if="
                  rows[row_index - 1][
                    row_number - 1 - maxcol + rows[row_index - 1].length
                  ]
                "
                :color="
                  colors[
                    row_colors[row_index - 1][
                      row_number - 1 - maxcol + rows[row_index - 1].length
                    ]
                  ]
                "
              >
                {{
                  rows[row_index - 1][
                    row_number - 1 - maxcol + rows[row_index - 1].length
                  ]
                }}
              </va-chip>
            </td>
            <td v-if="maxcol == 0" style="border: none !important"></td>
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
              :class="{
                upthick:
                  row_index == 1 || ((row_index - 1) % 5 == 0 && gridlines_on),
                leftthick:
                  column_index == 1 ||
                  ((column_index - 1) % 5 == 0 && gridlines_on),
              }"
            >
              <span
                class="numbers"
                v-if="prev_x == row_index - 1 && prev_y == column_index - 1"
              >
                <va-icon
                  size="48px"
                  :color="
                    returnMostReadable(
                      colors[solution[row_index - 1][column_index - 1]]
                    )
                  "
                  name="texture"
                >
                </va-icon>
              </span>
              <span class="numbers" v-else>&nbsp; </span>
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
        <router-link :to="'/profile/' + authorUserRecord.email">
          <span style="font-weight: bold"> Autor zagonetke: </span>
          {{ authorUserRecord.displayName }}
          ({{ authorUserRecord.email }})
        </router-link>
      </div>
      <br v-if="edit" />
      <div v-if="edit" style="text-align: start">
        <span style="font-weight: bold"> Vrijeme kreiranja: </span>
        {{ time_created.toLocaleString() }}
      </div>
      <br v-if="edit" />
      <div v-if="edit" style="text-align: start">
        <router-link :to="'/profile/' + updaterUserRecord.email">
          <span style="font-weight: bold"> Zadnji ažurirao: </span>
          {{ updaterUserRecord.displayName }}
          ({{ updaterUserRecord.email }})
        </router-link>
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
        @click="value[4] = !value[4]"
        class="display-6"
        v-if="permission_to_edit_visibility || !edit"
        style="text-align: start"
      >
        Dozvola uređivanja &nbsp;
        <va-icon v-if="!value[4]" name="expand_more"></va-icon>
        <va-icon v-if="value[4]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[4]">
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
    <NonogramInfo></NonogramInfo>
  </va-modal>
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
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  text-align: center;
  vertical-align: middle;
  border-collapse: collapse;
}
.numbers {
  font-weight: bold;
}
.upthick {
  border-top: 5px solid black !important;
}
.leftthick {
  border-left: 5px solid black !important;
}
</style>
