<script>
import { numberCrosswordsRef, friendsRef } from "../firebase_main.js"
import { usersRef } from "../firebase_main.js"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./Navbar.vue";
import { ref, uploadBytes } from "firebase/storage";
import { projectStorage } from "../firebase_main.js"

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      length_to_display: null,
      image: null,
      imageURL: "",
      user: null,
      title: "",
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
    checkIfUserExists() {
      let email = this.collaborator;
      let found = false;
      let hidden = true;
      let uid = "";
      let me = this.user.uid;
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
          permissions: this.permissions,
          source: this.source,
          time_created: datetime,
          last_updated: datetime,
        })
        .then((docRef) => {
          let some_id = docRef.id;
          let exstension =
            this.image.name.split(".")[this.image.name.split(".").length - 1];
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
                  permissions: this.permissions,
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
        });
    },
    change_number(i, j) {
      if (
        this.mode == 0 &&
        (i == 0 ||
          j == 0 ||
          (j > 0 && this.solution[i][j - 1] == -1) ||
          (i > 0 && this.solution[i - 1][j] == -1))
      ) {
        this.$vaToast.init("Broj ne može započinjati znamenkom 0.");
        return;
      }
      if (this.mode >= -1 && this.mode <= 10) {
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
        }
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
    modeChange(event) {
      switch (event.code) {
        case "ArrowUp":
          this.mode++;
          if (this.mode > 10) {
            this.mode = -3;
          }
          break;
        case "ArrowDown":
          this.mode--;
          if (this.mode < -3) {
            this.mode = 10;
          }
          break;
        case "ArrowRight":
          this.mode++;
          if (this.mode > 10) {
            this.mode = -3;
          }
          break;
        case "ArrowLeft":
          this.mode--;
          if (this.mode < -3) {
            this.mode = 10;
          }
          break;
        case "KeyW":
          this.mode++;
          if (this.mode > 10) {
            this.mode = -3;
          }
          break;
        case "KeyS":
          this.mode--;
          if (this.mode < -3) {
            this.mode = 10;
          }
          break;
        case "KeyD":
          this.mode++;
          if (this.mode > 10) {
            this.mode = -3;
          }
          break;
        case "KeyA":
          this.mode--;
          if (this.mode < -3) {
            this.mode = 10;
          }
          break;
        case "Digit0":
          this.mode = 0;
          break;
        case "Digit1":
          this.mode = 1;
          break;
        case "Digit2":
          this.mode = 2;
          break;
        case "Digit3":
          this.mode = 3;
          break;
        case "Digit4":
          this.mode = 4;
          break;
        case "Digit5":
          this.mode = 5;
          break;
        case "Digit6":
          this.mode = 6;
          break;
        case "Digit7":
          this.mode = 7;
          break;
        case "Digit8":
          this.mode = 8;
          break;
        case "Digit9":
          this.mode = 9;
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
    this.initialize();
  },
  beforeUpdate() {
    this.initialize();
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
  <Navbar></Navbar>
  <body class="mybody">
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="rows"
        @update:model-value="initialize()"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj redaka</span>
        </template>
        <!--<template #append>
                <va-input type="number" v-model="rows" @update:model-value="initialize()" :min="1" :max="50"/>
            </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="columns"
        @update:model-value="initialize()"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span>Broj stupaca</span>
        </template>
        <!--<template #append>
                <va-input type="number" v-model="columns" @update:model-value="initialize()" :min="1" :max="50" />
            </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab :name="10">
            <span>0</span>
          </va-tab>
          <va-tab v-for="i in 9" v-bind:key="i" :name="i">
            <span>{{ i }}</span>
          </va-tab>
          <va-tab :name="-1">
            <span style="color: black">Barijera</span>
          </va-tab>
          <va-tab :name="-2">
            <span style="color: salmon">Dio rješenja</span>
          </va-tab>
          <va-tab :name="-3">
            <span style="color: #90beee">Pomoć</span>
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-tabs>
        <template #tabs>
          <va-tab @click="randomize_all = !randomize_all">
            <span v-if="randomize_all == false">Nadopuni prazno</span
            ><span v-else>Promijeni upisano</span>
          </va-tab>
          <va-tab @click="keep_black = !keep_black">
            <span v-if="keep_black == false">Nove barijere</span
            ><span v-else>Zadrži barijere</span>
          </va-tab>
          <va-tab @click="choose_random_type()">
            <va-icon name="shuffle" />&nbsp;Odaberi nasumično
          </va-tab>
          <va-tab @click="reset()">
            <va-icon name="delete" />&nbsp;Izbriši
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <span v-if="current_x != null && current_y != null"
        >({{ current_x }}, {{ current_y }})</span
      >
    </div>
    <div class="myrow" style="max-height: 400px">
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
                  help: is_revealed[i - 1][j - 1],
                  special: is_special[i - 1][j - 1],
                }"
              >
                <div>
                  <span
                    v-if="
                      solution[i - 1][j - 1] == 10 ||
                      solution[i - 1][j - 1] == -1
                    "
                  ></span>
                  <span v-else>{{ solution[i - 1][j - 1] }}</span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="myrow" v-if="count_special()">
      Rješenje:
      <span v-for="i in rows" v-bind:key="i">
        <span v-for="j in columns" v-bind:key="j">
          <va-chip
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
    <div class="myrow" v-if="warning">
      <va-alert
        color="danger"
        :title="'Nisu unesene sve znamenke'"
        center
        class="mb-4"
      >
        Dok ne unesete znamenke ili prepreke u sva polja, nije dostupan pregled
        brojeva u križaljci.
      </va-alert>
    </div>
    <div class="myrow" v-if="!warning">
      <va-tabs v-model="length_to_display">
        <template #tabs>
          <span v-for="(numbers_of_length, i) in numbers_by_len" v-bind:key="i">
            <va-tab v-if="numbers_of_length.length > 0 && i > 0" :name="i">
              <span>{{ i + 1 }}</span>
            </va-tab></span
          >
        </template>
      </va-tabs>
    </div>
    <div class="myrow" v-if="!warning">
      <span v-for="(numbers_of_length, i) in numbers_by_len" v-bind:key="i">
        <va-chip
          outline
          v-if="numbers_of_length.length > 0 && i > 0 && i == length_to_display"
          style="padding: 20px; margin-left: 20px; margin-top: 20px"
        >
          <span>
            <va-chip>{{ i + 1 }}</va-chip>
            <br />
            <br />
            <div style="max-height: 200px">
              <va-infinite-scroll disabled :load="() => {}">
                <div v-for="(number, j) in numbers_of_length" v-bind:key="j">
                  {{ number }}
                </div>
              </va-infinite-scroll>
            </div>
          </span>
        </va-chip>
      </span>
    </div>
    <div class="myrow">
      <va-button
        style="display: inline-block; overflow-wrap: anywhere"
        @click="click_file()"
      >
        <span v-if="this.imageURL != ''"> {{ this.imageURL }}</span
        ><span v-else><va-icon name="photo" />&nbsp;Odaberi sliku </span>
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
        style="overflow-wrap: anywhere"
        :disabled="
          !(
            !warning &&
            image &&
            title.length > 0 &&
            description.length > 0 &&
            source.length > 0
          )
        "
        @click="store()"
      >
        <va-icon name="add_circle" />&nbsp;Spremi zagonetku
      </va-button>
    </div>
  </body>
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
}

.help {
  font-weight: bold;
  background-color: #90beee;
}
</style>
