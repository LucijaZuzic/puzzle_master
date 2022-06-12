<script>
import tinycolor from "tinycolor2/tinycolor";
import { nonogramsRef } from "../../firebase_main.js";
import { nonogramsRecordsRef } from "../../firebase_main.js";
import { usersRef, friendsRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoadingBar from "../Utility/LoadingBar.vue";
import NonogramInfo from "../Info/NonogramInfo.vue";
import MyCounter from "../Utility/MyCounter.vue";
export default {
  components: {
    MyCounter,
    LoadingBar,
    NonogramInfo,
  },
  data() {
    return {
      value: [false, false, false],
      zoom: 100,
      max_zoom: 200,
      allow_mouseover: false,
      fully_loaded: false,
      title: "",
      user: null,
      cheat: false,
      warning: "",
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      time_created: "",
      last_updated: "",
      is_public: false,
      permissions: [],
      collaborator: "",
      description: "",
      solution: [],
      blocked: false,
      source: "",
      colnum: 20,
      rownum: 20,
      maxcol: 0,
      victory: false,
      maxrow: 0,
      row_colors: [],
      col_colors: [],
      user_row_colors: [],
      user_col_colors: [],
      user_rows: [],
      user_columns: [],
      mode: 0,
      time_elapsed: 0,
      drag: false,
      prev_x: null,
      prev_y: null,
      num_colors: 2,
      show_error: false,
      colors: ["#ffffff", "#000000"],
      current_x: null,
      reset_all: false,
      current_y: null,
    };
  },
  methods: {
    reset_current_color() {
      let old_mode = this.mode;
      this.mode = 0;
      for (let i = 0; i < this.solution.length; i++) {
        for (let j = 0; j < this.solution[i].length; j++) {
          if (this.values[i][j] == old_mode) {
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
    reset() {
      this.values = new Array();
      for (let i = 0; i < this.rownum; i++) {
        let one_arr = new Array();
        for (let j = 0; j < this.colnum; j++) {
          one_arr.push(0);
        }
        this.values.push(one_arr);
      }
      this.$forceUpdate();
    },
    parse_sequence() {
      this.getrow();
      this.getcol();
      this.getuserrow();
      this.getusercol();
      this.getmaxrow();
      this.getmaxcol();
      //this.colorcol();
      //this.colorrow();
    },
    initialize() {
      this.columns = new Array();
      this.rows = new Array();
      this.col_colors = new Array();
      this.row_colors = new Array();
      for (let i = 0; i < this.colnum; i++) {
        this.col_colors.push([]);
        this.columns.push([]);
      }
      for (let i = 0; i < this.rownum; i++) {
        this.row_colors.push([]);
        this.rows.push([]);
      }
      this.values = new Array();
      for (let i = 0; i < this.rownum; i++) {
        let one_arr = new Array();
        for (let j = 0; j < this.colnum; j++) {
          one_arr.push(0);
        }
        this.values.push(one_arr);
      }
      this.parse_sequence();
    },
    increment(x, y, is_mouseover) {
      if (this.victory == true) {
        return;
      }
      if (this.blocked == true) {
        return;
      }
      if (is_mouseover) {
        if (this.allow_mouseover) {
          this.values[x][y] = this.mode;
          if (document.getElementById("cell" + x + ":" + y)) {
            document.getElementById(
              "cell" + x + ":" + y
            ).style.backgroundColor = this.mode;
          }
          this.values = [...this.values];
          this.prev_x = null;
          this.prev_y = null;
          this.parse_sequence();
          this.$forceUpdate();
          this.check_victory();
        }
        return;
      }
      if (!this.drag) {
        this.values[x][y] = this.mode;
        if (document.getElementById("cell" + x + ":" + y)) {
          document.getElementById("cell" + x + ":" + y).style.backgroundColor =
            this.mode;
        }
        this.values = [...this.values];
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
              this.values[i][j] = this.mode;
              if (document.getElementById("cell" + i + ":" + j)) {
                document.getElementById(
                  "cell" + i + ":" + j
                ).style.backgroundColor = this.mode;
              }
            }
          }
          this.values = [...this.values];
          this.prev_x = null;
          this.prev_y = null;
          this.parse_sequence();
          this.$forceUpdate();
        } else {
          this.prev_x = x;
          this.prev_y = y;
        }
      }
      this.check_victory();
    },
    update_colors() {
      for (let i = 0; i < this.rownum; i++) {
        for (let j = 0; j < this.colnum; j++) {
          if (document.getElementById("cell" + i + ":" + j)) {
            document.getElementById(
              "cell" + i + ":" + j
            ).style.backgroundColor = this.colors[this.values[i][j]];
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
    getusercol() {
      let color_val = new Array();
      let val = new Array();
      for (let i = 0; i < this.colnum; i++) {
        let color = -1;
        let prev_color = -1;
        let color_array = new Array();
        let one_arr = new Array();
        let current = 0;
        for (let j = 0; j < this.rownum; j++) {
          color = this.values[j][i];
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
      this.user_col_colors = color_val;
      this.user_columns = val;
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
    show_solution() {
      this.cheat = true;
      for (let i = 0; i < this.rownum; i++) {
        for (let j = 0; j < this.colnum; j++) {
          this.values[i][j] = this.solution[i][j];
        }
      }
      this.check_victory();
      this.update_colors();
      this.$forceUpdate();
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
    getuserrow() {
      let color_val = new Array();
      let val = new Array();
      for (let i = 0; i < this.rownum; i++) {
        let color = -1;
        let prev_color = -1;
        let color_array = new Array();
        let one_arr = new Array();
        let current = 0;
        for (let j = 0; j < this.colnum; j++) {
          color = this.values[i][j];
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
      this.user_row_colors = color_val;
      this.user_rows = val;
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
    after_click(i) {
      this.mode = i;
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
      for (let i = 0; i < this.values.length; i++) {
        for (let j = 0; j < this.values[i].length; j++) {
          if (this.values[i][j] != this.solution[i][j]) {
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
              this.$router.push("/search-nonogram");
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
                  this.$router.push("/search-nonogram");
                });
              } else {
                this.$router.push("/search-nonogram");
              }
            }
          }
        });
      }
    },
    store() {
      let datetime = new Date();
      nonogramsRecordsRef.add({
        puzzleID: this.$route.params.id,
        user: this.user.uid,
        score: this.time_elapsed,
        time: datetime,
      });
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
            this.source = string_source;
            this.time_created = string_time_created;
            this.last_updated = string_last_updated;
            this.num_colors = this.colors.length;
            this.rownum = this.solution.length;
            this.colnum = this.solution[0].length;
            this.initialize();
            this.fully_loaded = true;
            this.$forceUpdate();
          } else {
            this.$vaToast.init("Ne postoji zagonetka s tim brojem.");
            this.$router.push("/search-nonogram");
          }
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
  created() {
    //window.addEventListener('keyup', this.modeChange);
  },
  beforeDestroy() {
    //window.removeEventListener('keyup', this.modeChange);
  },
  beforeMount() {
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
  beforeUpdate() {
    this.update_colors();
    this.parse_sequence();
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
    for (let i = 0; i < this.num_colors; i++) {
      if (document.getElementById("colorbutton" + i)) {
        document.getElementById("colorbutton" + i).style.backgroundColor =
          this.colors[i];
      }
    }
    this.$refs.show_error.show();
    this.startTimer();
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
};
</script>

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="my_body" v-else>
    <h4 class="display-4">
      <va-icon size="large" name="draw"></va-icon>
      &nbsp; Igraj nonogram
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
              name: 'search_nonogram',
            }"
          >
            <va-icon name="search"></va-icon>
            &nbsp; Popis zagonetki
          </router-link>
        </va-tab>
        <va-tab v-if="checkIdentity()">
          <router-link
            v-bind:to="{
              name: 'edit_nonogram',
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
              name: 'create_nonogram',
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
        Boje &nbsp;
        <va-icon v-if="!value[0]" name="expand_more"></va-icon>
        <va-icon v-if="value[0]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[0]">
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
            @click="after_click(i)"
            :id="'colorbutton' + i"
          ></button>
        </div>
      </div>
      <br v-if="warning" />
      <va-alert dense outline
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
        @click="value[1] = !value[1]"
        class="display-6"
        style="text-align: start"
      >
        Zagonetka &nbsp;
        <va-icon v-if="!value[1]" name="expand_more"></va-icon>
        <va-icon v-if="value[1]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[1]">
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
                <span
                  style="text-decoration: line-through"
                  v-if="
                    columns[column_index - 1][
                      column_number -
                        1 -
                        maxrow +
                        columns[column_index - 1].length
                    ] ==
                      user_columns[column_index - 1][
                        column_number -
                          1 -
                          maxrow +
                          columns[column_index - 1].length
                      ] &&
                    user_col_colors[column_index - 1][
                      column_number -
                        1 -
                        maxrow +
                        columns[column_index - 1].length
                    ] ==
                      col_colors[column_index - 1][
                        column_number -
                          1 -
                          maxrow +
                          columns[column_index - 1].length
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
                </span>
                <span v-else>
                  {{
                    columns[column_index - 1][
                      column_number -
                        1 -
                        maxrow +
                        columns[column_index - 1].length
                    ]
                  }}
                </span>
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
                <span
                  style="text-decoration: line-through"
                  v-if="
                    rows[row_index - 1][
                      row_number - 1 - maxcol + rows[row_index - 1].length
                    ] ==
                      user_rows[row_index - 1][
                        row_number - 1 - maxcol + rows[row_index - 1].length
                      ] &&
                    row_colors[row_index - 1][
                      row_number - 1 - maxcol + rows[row_index - 1].length
                    ] ==
                      user_row_colors[row_index - 1][
                        row_number - 1 - maxcol + rows[row_index - 1].length
                      ]
                  "
                >
                  {{
                    rows[row_index - 1][
                      row_number - 1 - maxcol + rows[row_index - 1].length
                    ]
                  }}
                </span>
                <span v-else>
                  {{
                    rows[row_index - 1][
                      row_number - 1 - maxcol + rows[row_index - 1].length
                    ]
                  }}
                </span>
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
                upthick: row_index == 1,
                leftthick: column_index == 1,
              }"
            >
              <span
                class="numbers"
                v-if="
                  !(prev_x == row_index - 1 && prev_y == column_index - 1) &&
                  show_error &&
                  solution[row_index - 1][column_index - 1] !=
                    values[row_index - 1][column_index - 1] &&
                  values[row_index - 1][column_index - 1] != 0
                "
              >
                <va-icon
                  size="48px"
                  :color="
                    returnMostReadable(
                      colors[values[row_index - 1][column_index - 1]]
                    )
                  "
                  name="warning"
                >
                </va-icon>
              </span>
              <!--
                <span
                  class="numbers"
                  v-if="
                    !(prev_x == row_index - 1 && prev_y == column_index - 1) &&
                    show_error &&
                    solution[row_index - 1][column_index - 1] !=
                      values[row_index - 1][column_index - 1] &&
                    values[row_index - 1][column_index - 1] == 0
                  "
                >
                  <va-icon
                    :color="
                      returnMostReadable(
                        colors[values[row_index - 1][column_index - 1]]
                      )
                    "
                    name="warning"
                  >
</va-icon
                >
</span>-->
              <span
                class="numbers"
                v-if="
                  !(prev_x == row_index - 1 && prev_y == column_index - 1) &&
                  !(
                    show_error &&
                    solution[row_index - 1][column_index - 1] !=
                      values[row_index - 1][column_index - 1] &&
                    values[row_index - 1][column_index - 1] != 0
                  )
                "
                >&nbsp;
              </span>
              <span
                class="numbers"
                v-if="prev_x == row_index - 1 && prev_y == column_index - 1"
              >
                <va-icon
                  size="48px"
                  name="texture"
                  :color="
                    returnMostReadable(
                      colors[values[row_index - 1][column_index - 1]]
                    )
                  "
                >
                </va-icon>
              </span>
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
        Podaci o zagonetci &nbsp;
        <va-icon v-if="!value[2]" name="expand_more"></va-icon>
        <va-icon v-if="value[2]" name="expand_less"></va-icon>
      </h6>
    </va-card>
    <div class="my_row" v-if="value[2]">
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
