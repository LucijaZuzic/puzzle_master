<script>
import tinycolor from "tinycolor2/tinycolor";
import { nonogramsRef, friendsRef } from "../firebase_main.js";
import { usersRef } from "../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  components: {},
  data() {
    return {
      allow_mouseover: false,
      prev_x: null,
      prev_y: null,
      user: null,
      title: "",
      warning: "",
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
      num_colors: 2,
      wrong_colors: [false, false],
      colors: ["#FFFFFF", "#000000"],
      current_x: null,
      current_y: null,
    };
  },
  methods: {
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
          document.getElementById("cell" + x + ":" + y).style.backgroundColor =
            document.getElementById("colorpicker" + this.mode).value;
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
        document.getElementById("cell" + x + ":" + y).style.backgroundColor =
          document.getElementById("colorpicker" + this.mode).value;
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
              document.getElementById(
                "cell" + i + ":" + j
              ).style.backgroundColor = document.getElementById(
                "colorpicker" + this.mode
              ).value;
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
        .add({
          solution: funct_ref(newsolution),
          colors: newcolors,
          title: this.title,
          description: this.description,
          author: this.user.uid,
          updater: this.user.uid,
          is_public: this.is_public,
          permissions: this.permissions,
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
  created() {
    //window.addEventListener('keyup', this.modeChange);
  },
  beforeDestroy() {
    //window.removeEventListener('keyup', this.modeChange);
  },
  beforeMount() {
    this.expand_color_list();
    this.initialize();
    this.check_equal_colors();
  },
  beforeUpdate() {
    this.expand_color_list();
    this.update_colors();
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
            "Ne možete kreirati zagonetku jer niste prijavljeni."
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
  <body class="mybody">
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
                <va-input type="number" v-model="colnum" @update:model-value="initialize()" :min="1" :max="50"/>
            </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-chip v-if="current_x != null && current_y != null"
        >({{ current_x }}, {{ current_y }})</va-chip
      >
    </div>
    <div class="myrow" v-if="prev_x != null && prev_y != null && drag">
      <va-chip>
        <va-icon name="close" @click="(prev_x = null), (prev_y = null)">
        </va-icon>
        &nbsp; Početak segmenta: ({{ prev_x }}, {{ prev_y }})
      </va-chip>
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
                  increment(row_index - 1, column_index - 1, true)
                "
                @click="increment(row_index - 1, column_index - 1, false)"
                :id="'cell' + (row_index - 1) + ':' + (column_index - 1)"
              >
                <span
                  class="numbers"
                  v-if="prev_x == row_index - 1 && prev_y == column_index - 1"
                >
                  <va-icon
                    :color="
                      returnMostReadable(
                        colors[solution[row_index - 1][column_index - 1]]
                      )
                    "
                    name="check_box_outline_blank"
                  >
                  </va-icon>
                </span>
                <span class="numbers" v-else>&nbsp;</span>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="myrow">
      <va-button style="overflow-wrap: anywhere" @click="reset()">
        <va-icon name="delete" />
        &nbsp;Izbriši</va-button
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
      <va-icon v-if="wrong_colors[0] == true" name="error" color="danger">
      </va-icon>
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
        <!--<va-icon style="position:relative;left:10px" v-if="wrong_colors[i]==true" name="error" color="danger">
</va-icon>-->
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
        @click="
          allow_mouseover = !allow_mouseover;
          if (allow_mouseover) {
            drag = false;
          }
        "
        style="overflow-wrap: anywhere; margin-left: 10px; margin-top: 10px"
      >
        <span v-if="allow_mouseover == false">
          <va-icon name="grid_view" />
          &nbsp;Bojanje gestom isključeno
        </span>
        <span v-else
          ><va-icon name="gesture" /> &nbsp;Bojanje gestom uključeno</span
        >
      </va-button>
    </div>
    <div class="myrow">
      <va-button
        @click="
          drag = !drag;
          if (allow_mouseover) {
            drag = false;
          }
        "
        style="overflow-wrap: anywhere; margin-left: 10px; margin-top: 10px"
        :disabled="allow_mouseover"
      >
        <span v-if="drag == false">
          <va-icon name="grid_off" />
          &nbsp;Bojanje jedan po jedan
        </span>
        <span v-else><va-icon name="grid_on" /> &nbsp;Bojanje segmenta</span>
      </va-button>
    </div>
    <div class="myrow" v-if="warning">
      <va-alert
        color="danger"
        :title="'Postoje boje koje se ponavljaju'"
        center
        class="mb-4"
      >
        <!--<p >
                  {{warning}}
        </p>-->
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
        style="overflow-wrap: anywhere"
        :disabled="
          !(
            warning.length == 0 &&
            title.length > 0 &&
            description.length > 0 &&
            source.length > 0
          )
        "
        @click="store()"
      >
        <va-icon name="add_circle" />
        &nbsp;Spremi zagonetku
      </va-button>
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
