<script>
import { ref, getDownloadURL } from "firebase/storage";
import { projectStorage } from "../../firebase_main.js";
import { integramsRef } from "../../firebase_main.js";
import { usersRef } from "../../firebase_main.js";
import { integramsRecordsRef, friendsRef } from "../../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import MyCounter from "../Utility/MyCounter.vue";
import LoadingBar from "../Utility/LoadingBar.vue";

export default {
  components: {
    LoadingBar,
    MyCounter,
  },
  data() {
    return { 
      category_counter_min: 1,
      category_counter_max: 5,
      value_counter_min: 1,
      value_counter_max: 5,
      instruction_counter_min: 5,
      instruction_coutner_max: 10,
      category_to_display: 1,
      value_to_display: 1,
      urls: [],
      fully_loaded: false,
      title: "",
      user: null,
      cheat: false,
      victory: false,
      numcategories: 5,
      numvalues: 5,
      numinstructions: 10,
      instructions: [],
      is_image: [false, false, false],
      alert: "",
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      max_len_display: 20,
      colors_for_number: [
        "#0a2543",
        "#144b85",
        "#1e70c8",
        "#4e96e4",
        "#90beee",
      ],
      solution: [],
      mode: -1,
      time_elapsed: 0,
      description: "",
      source: "",
      show_error: false,
      author: "",
      authorUserRecord: { displayName: "", email: "" },
      updater: "",
      updaterUserRecord: { displayName: "", email: "" },
      time_created: "",
      last_updated: "",
      is_public: false,
      permissions: [],
      collaborator: "",
    };
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
    this.$refs.show_error.show();
    this.startTimer();
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go();
      }
    );
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
    startTimer() {
      this.time_elapsed = setInterval(() => (this.time_elapsed += 1), 1000);
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
      let oldisimage = [];
      let oldtoolong = [];
      let maxnames = this.numcategories;
      if (this.category_names) {
        oldnames = this.category_names;
        oldisimage = this.is_image;
        oldtoolong = this.too_long;
        if (oldnames.length > maxnames) {
          maxnames = oldnames.length;
        }
      }
      this.category_names = [];
      this.is_image = [];
      this.too_long = [];
      for (let i = 0; i < maxnames; i++) {
        if (oldnames[i]) {
          this.category_names.push(oldnames[i]);
          this.is_image.push(oldisimage[i]);
          this.too_long.push(oldtoolong[i]);
        } else {
          this.category_names.push("");
          this.is_image.push(false);
          this.too_long.push(false);
        }
      }
      this.change_instructions();
      this.order_in_category();
      this.check_same();
      this.check_too_long();
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
      this.alert = "";
      for (let j = 0; j < this.numinstructions; j++) {
        if (this.instructions[j] == "") {
          this.alert += (j + 1).toString() + ". uputa nema tekst.\n";
        }
      }
      for (let j = 0; j < this.numcategories; j++) {
        if (this.category_names[j] == "") {
          this.alert += (j + 1).toString() + ". kategorija nema naziv.\n";
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          if (
            this.category_values[j][i] == "" ||
            this.category_values[j][i] == []
          ) {
            if (this.is_image[i]) {
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") nema sliku za " +
                (j + 1).toString() +
                ". pojam.\n";
            } else {
              this.alert +=
                (i + 1).toString() +
                ". kategorija (" +
                this.category_names[i] +
                ") nema vrijednost za " +
                (j + 1).toString() +
                ". pojam.\n";
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
            this.alert +=
              (j + 1).toString() +
              ". uputa (" +
              this.instructions[j] +
              ") i " +
              (k + 1).toString() +
              ". uputa (" +
              this.instructions[k] +
              ") imaju isti tekst.\n";
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
            this.alert +=
              (j + 1).toString() +
              ". kategorija (" +
              this.category_names[j] +
              ") i " +
              (k + 1).toString() +
              ". kategorija (" +
              this.category_names[k] +
              ") imaju isti naziv.\n";
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
                ").\n";
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
                ").\n";
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
                ").\n";
            }
          }
        }
      }
    },
    check_too_long() {
      this.too_long = [];
      for (let j = 0; j < this.numcategories; j++) {
        this.too_long.push(false);
        for (let i = 0; i < this.numvalues; i++) {
          if (this.category_values[i][j].length > this.max_len_display) {
            this.too_long[j] = true;
            break;
          }
        }
      }
    },
    order_in_category() {
      this.order = [];
      for (let i = 0; i < this.numcategories; i++) {
        let category_order = [];
        let used = [];
        for (let j = 0; j < this.numvalues; j++) {
          used.push(0);
        }
        for (let j = 0; j < this.numvalues; j++) {
          let x = Math.floor(Math.random() * this.numvalues);
          while (used[x]) {
            x = Math.floor(Math.random() * this.numvalues);
          }
          used[x] = 1;
          category_order.push(x);
        }
        this.order.push(category_order);
      }
      this.solution = [];
      this.values = [];
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          let solution_row = [];
          let values_row = [];
          for (let k = 0; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              if (this.order[i][j] == this.order[k][l]) {
                solution_row.push(1);
              } else {
                solution_row.push(0);
              }
              values_row.push(-1);
            }
          }
          this.solution.push(solution_row);
          this.values.push(values_row);
        }
      }
    }, 
    clear_cell(x, y) {  
      if (this.values[x][y] != 1) {
        return;
      } 
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) { 
          this.values[x][i * this.numvalues + j] = -1;  
          this.values[i * this.numvalues + j][x] = -1;   
          this.values[y][i * this.numvalues + j] = -1;  
          this.values[i * this.numvalues + j][y] = -1;   
        }
      }
    },
    click_cell(x, y) {   
      if (this.values[x][y] == this.mode) {
        return;
      }
      if (this.values[x][y] == 1){
        return;
      }
      let oldvalues = [];
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          let old_row = [];
          for (let k = 0; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              old_row.push(
                this.values[i * this.numvalues + j][k * this.numvalues + l]
              );
            }
          }
          oldvalues.push(old_row);
        }
      }    
      if (this.mode == 1) {
        let row_start = x - (x % this.numvalues);
        let col_start = y - (y % this.numvalues); 
        for (let i = 0; i < this.numvalues; i++) { 
          this.clear_cell(x, col_start + i);  
          this.clear_cell(col_start + i, x); 
          this.clear_cell(row_start + i, y); 
          this.clear_cell(y, row_start + i); 
        } 
      } 
      if (this.mode == 0 && this.values[x][y] == 1){
        this.values[x][y] = -1;
        this.values[y][x] = -1;
      } else {
        this.values[x][y] = this.mode;
        this.values[y][x] = this.mode;   
      }
      for (let i = 0; i < Math.max(this.numcategories, this.numvalues) + 1; i++) { 
        if (!this.update_values()) {
          this.$vaToast.init("Neispravan zaključak.");
          this.values = oldvalues;
        }
      } 
      if (!this.find_single()) { 
        this.$vaToast.init("Neispravan zaključak."); 
        this.values = oldvalues;
      }    
      this.generate_my_solution();
      this.$forceUpdate();
    },
    find_single() {
      for (let i = 0; i < this.numcategories; i++) {
        for (let k = 0; k < this.numcategories; k++) {
          for (let j = 0; j < this.numvalues; j++) {
            let row_result = 0;
            let row_free = -1;
            for (let l = 0; l < this.numvalues; l++) {
              if (
                this.values[i * this.numvalues + j][k * this.numvalues + l] == 0
              ) {
                row_result += 1;
              }
              if (
                this.values[i * this.numvalues + j][k * this.numvalues + l] ==
                -1
              ) {
                row_free = l;
              }
            }
            if (row_result == this.numvalues - 1 && row_free != -1) {
              this.values[i * this.numvalues + j][
                k * this.numvalues + row_free
              ] = 1;
              if (!this.update_values()) {
                return false;
              }
            }
            let col_result = 0;
            let col_free = -1;
            for (let l = 0; l < this.numvalues; l++) {
              if (
                this.values[i * this.numvalues + l][k * this.numvalues + j] == 0
              ) {
                col_result += 1;
              }
              if (
                this.values[i * this.numvalues + l][k * this.numvalues + j] ==
                -1
              ) {
                col_free = l;
              }
            }
            if (col_result == this.numvalues - 1 && col_free != -1) {
              this.values[i * this.numvalues + col_free][
                k * this.numvalues + j
              ] = 1;
              if (!this.update_values()) {
                return false;
              }
            }
          }
        }
      }
      return true;
    },
    update_values() {
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = 0; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              if (
                this.values[i * this.numvalues + j][k * this.numvalues + l] !=
                -1
              ) {
                if (
                  this.values[i * this.numvalues + j][k * this.numvalues + l] !=
                    this.values[k * this.numvalues + l][
                      i * this.numvalues + j
                    ] &&
                  this.values[k * this.numvalues + l][i * this.numvalues + j] !=
                    -1
                ) {
                  return false;
                }
                this.values[k * this.numvalues + l][i * this.numvalues + j] =
                  this.values[i * this.numvalues + j][k * this.numvalues + l];
              }
              if (
                this.values[k * this.numvalues + l][i * this.numvalues + j] !=
                -1
              ) {
                if (
                  this.values[k * this.numvalues + l][i * this.numvalues + j] !=
                    this.values[i * this.numvalues + j][
                      k * this.numvalues + l
                    ] &&
                  this.values[i * this.numvalues + j][k * this.numvalues + l] !=
                    -1
                ) {
                  return false;
                }
                this.values[i * this.numvalues + j][k * this.numvalues + l] =
                  this.values[k * this.numvalues + l][i * this.numvalues + j];
              }
            }
          }
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = 0; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              if (
                this.values[i * this.numvalues + j][k * this.numvalues + l] ==
                  1 ||
                this.values[k * this.numvalues + l][i * this.numvalues + j] == 1
              ) {
                for (let n = 0; n < this.numcategories; n++) {
                  for (let m = 0; m < this.numvalues; m++) {
                    if (
                      this.values[i * this.numvalues + j][
                        n * this.numvalues + m
                      ] != -1
                    ) {
                      if (
                        this.values[k * this.numvalues + l][
                          n * this.numvalues + m
                        ] != -1 &&
                        this.values[k * this.numvalues + l][
                          n * this.numvalues + m
                        ] !=
                          this.values[i * this.numvalues + j][
                            n * this.numvalues + m
                          ]
                      ) {
                        return false;
                      }
                      this.values[k * this.numvalues + l][
                        n * this.numvalues + m
                      ] =
                        this.values[i * this.numvalues + j][
                          n * this.numvalues + m
                        ];
                      if (
                        this.values[n * this.numvalues + m][
                          k * this.numvalues + l
                        ] != -1 &&
                        this.values[n * this.numvalues + m][
                          k * this.numvalues + l
                        ] !=
                          this.values[i * this.numvalues + j][
                            n * this.numvalues + m
                          ]
                      ) {
                        return false;
                      }
                      this.values[n * this.numvalues + m][
                        k * this.numvalues + l
                      ] =
                        this.values[i * this.numvalues + j][
                          n * this.numvalues + m
                        ];
                    }
                    if (
                      this.values[k * this.numvalues + l][
                        n * this.numvalues + m
                      ] != -1
                    ) {
                      if (
                        this.values[i * this.numvalues + j][
                          n * this.numvalues + m
                        ] != -1 &&
                        this.values[i * this.numvalues + j][
                          n * this.numvalues + m
                        ] !=
                          this.values[k * this.numvalues + l][
                            n * this.numvalues + m
                          ]
                      ) {
                        return false;
                      }
                      this.values[i * this.numvalues + j][
                        n * this.numvalues + m
                      ] =
                        this.values[k * this.numvalues + l][
                          n * this.numvalues + m
                        ];
                      if (
                        this.values[n * this.numvalues + m][
                          i * this.numvalues + j
                        ] != -1 &&
                        this.values[n * this.numvalues + m][
                          i * this.numvalues + j
                        ] !=
                          this.values[k * this.numvalues + l][
                            n * this.numvalues + m
                          ]
                      ) {
                        return false;
                      }
                      this.values[n * this.numvalues + m][
                        i * this.numvalues + j
                      ] =
                        this.values[k * this.numvalues + l][
                          n * this.numvalues + m
                        ];
                    }
                    if (
                      this.values[n * this.numvalues + m][
                        i * this.numvalues + j
                      ] != -1
                    ) {
                      if (
                        this.values[k * this.numvalues + l][
                          n * this.numvalues + m
                        ] != -1 &&
                        this.values[k * this.numvalues + l][
                          n * this.numvalues + m
                        ] !=
                          this.values[n * this.numvalues + m][
                            i * this.numvalues + j
                          ]
                      ) {
                        return false;
                      }
                      this.values[k * this.numvalues + l][
                        n * this.numvalues + m
                      ] =
                        this.values[n * this.numvalues + m][
                          i * this.numvalues + j
                        ];
                      if (
                        this.values[n * this.numvalues + m][
                          k * this.numvalues + l
                        ] != -1 &&
                        this.values[n * this.numvalues + m][
                          k * this.numvalues + l
                        ] !=
                          this.values[n * this.numvalues + m][
                            i * this.numvalues + j
                          ]
                      ) {
                        return false;
                      }
                      this.values[n * this.numvalues + m][
                        k * this.numvalues + l
                      ] =
                        this.values[n * this.numvalues + m][
                          i * this.numvalues + j
                        ];
                    }
                    if (
                      this.values[n * this.numvalues + m][
                        k * this.numvalues + l
                      ] != -1
                    ) {
                      if (
                        this.values[i * this.numvalues + j][
                          n * this.numvalues + m
                        ] != -1 &&
                        this.values[i * this.numvalues + j][
                          n * this.numvalues + m
                        ] !=
                          this.values[n * this.numvalues + m][
                            k * this.numvalues + l
                          ]
                      ) {
                        return false;
                      }
                      this.values[i * this.numvalues + j][
                        n * this.numvalues + m
                      ] =
                        this.values[n * this.numvalues + m][
                          k * this.numvalues + l
                        ];
                      if (
                        this.values[n * this.numvalues + m][
                          i * this.numvalues + j
                        ] != -1 &&
                        this.values[n * this.numvalues + m][
                          i * this.numvalues + j
                        ] !=
                          this.values[n * this.numvalues + m][
                            k * this.numvalues + l
                          ]
                      ) {
                        return false;
                      }
                      this.values[n * this.numvalues + m][
                        i * this.numvalues + j
                      ] =
                        this.values[n * this.numvalues + m][
                          k * this.numvalues + l
                        ];
                    }
                  }
                }
              }
            }
          }
        }
      }
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = 0; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              for (let n = 0; n < this.numcategories; n++) {
                for (let m = 0; m < this.numvalues; m++) {
                  if (
                    (this.values[i * this.numvalues + j][
                      n * this.numvalues + m
                    ] == 1 ||
                      this.values[n * this.numvalues + m][
                        i * this.numvalues + j
                      ] == 1) &&
                    (this.values[k * this.numvalues + l][
                      n * this.numvalues + m
                    ] == 1 ||
                      this.values[n * this.numvalues + m][
                        k * this.numvalues + l
                      ] == 1)
                  ) {
                    if (
                      this.values[i * this.numvalues + j][
                        k * this.numvalues + l
                      ] == 0
                    ) {
                      return false;
                    }
                    for (let z = 0; z < this.numvalues; z++) {
                      if (z != l) {
                        this.values[i * this.numvalues + j][
                          k * this.numvalues + z
                        ] = 0;
                      }
                      if (z != j) {
                        this.values[i * this.numvalues + z][
                          k * this.numvalues + l
                        ] = 0;
                      }
                    }
                    this.values[i * this.numvalues + j][
                      k * this.numvalues + l
                    ] = 1;
                    for (let z = 0; z < this.numvalues; z++) {
                      if (z != l) {
                        this.values[k * this.numvalues + z][
                          i * this.numvalues + j
                        ] = 0;
                      }
                      if (z != j) {
                        this.values[k * this.numvalues + l][
                          i * this.numvalues + z
                        ] = 0;
                      }
                    }
                    this.values[k * this.numvalues + l][
                      i * this.numvalues + j
                    ] = 1;
                  }
                }
              }
            }
          }
        }
      }
      return true;
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
    show_solution() {
      this.cheat = true;
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = i + 1; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              this.values[i * this.numvalues + j][k * this.numvalues + l] =
                this.solution[i * this.numvalues + j][k * this.numvalues + l];
            }
          }
        }
      }
      this.check_victory();
      this.$forceUpdate();
    },
    check_victory() {
      this.victory = true;
      for (let i = 0; i < this.numcategories; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = i + 1; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              if (
                this.values[i * this.numvalues + j][k * this.numvalues + l] !=
                this.solution[i * this.numvalues + j][k * this.numvalues + l]
              ) {
                this.victory = false;
                return;
              }
            }
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
              this.$router.push("/search-integram");
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
                  this.$router.push("/search-integram");
                });
              } else {
                this.$router.push("/search-integram");
              }
            }
          }
        });
      }
    },
    store() {
      let datetime = new Date();
      integramsRecordsRef.add({
        puzzleID: this.$route.params.id,
        user: this.user.uid,
        score: this.time_elapsed,
        time: datetime,
      });
    },
    generate_my_solution() {
      this.my_solution = [];
      for (let j = 0; j < this.numvalues; j++) {
        this.my_solution.push([]);
        for (let i = 0; i < this.numcategories; i++) {
          this.my_solution[j].push("");
        }
      }
      for (let i = 0; i < 1; i++) {
        for (let j = 0; j < this.numvalues; j++) {
          for (let k = i + 1; k < this.numcategories; k++) {
            for (let l = 0; l < this.numvalues; l++) {
              if (
                this.values[i * this.numvalues + j][k * this.numvalues + l] ==
                  1 ||
                this.values[k * this.numvalues + l][i * this.numvalues + j] == 1
              ) {
                this.my_solution[this.order[i][j]][i] =
                  this.category_values[this.order[i][j]][i];
                this.my_solution[this.order[i][j]][k] =
                  this.category_values[this.order[k][l]][k];
              }
            }
          }
        }
      }
      this.check_victory();
    },
    clear_values() {
      for (let i = 0; i < this.numcategories * this.numvalues; i++) {
        for (let j = 0; j < this.numvalues * this.numvalues; j++) {
          this.values[i][j] = -1;
        }
      }
      this.my_solution = [];
      for (let j = 0; j < this.numvalues; j++) {
        this.my_solution.push([]);
        for (let i = 0; i < this.numcategories; i++) {
          this.my_solution[j].push("");
        }
      }
      this.$forceUpdate();
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
            this.category_names = string_category_names;
            this.is_image = string_is_image;
            this.instructions = string_instructions;
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
            this.numvalues = this.category_values.length;
            this.numcategories = this.category_values[0].length;
            this.numinstructions = this.instructions.length;
            this.change_instructions();
            this.order_in_category();
            this.check_same();
            this.check_too_long();
            this.getPicture();
            this.$forceUpdate();
          } else {
            this.$vaToast.init("Ne postoji zagonetka s tim brojem.");
            this.$router.push("/search-integram");
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
  }, 
  beforeMount() {
    this.my_solution = [];
    for (let j = 0; j < this.numvalues; j++) {
      this.my_solution.push([]);
      for (let i = 0; i < this.numcategories; i++) {
        this.my_solution[j].push("");
      }
    }
    this.initialize();
    this.fetch_puzzle();
    this.my_solution = [];
    for (let j = 0; j < this.numvalues; j++) {
      this.my_solution.push([]);
      for (let i = 0; i < this.numcategories; i++) {
        this.my_solution[j].push("");
      }
    }
  },
};
</script>

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="my_body" v-else>
    <va-card>
      <div class="my_row">
        <h4 class="display-4">
          <va-icon size="large" name="rule_folder"></va-icon>
          &nbsp;Riješi integram
        </h4>
      </div>
    </va-card>
    <br /><br />
    <va-card>
      <div class="my_row">
        <va-tabs>
          <template #tabs>
            <va-tab disabled
              ><va-icon name="timer" />&nbsp;{{ format(time_elapsed) }}</va-tab
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
                &nbsp;Ne prikazuj greške</span
              >
              <span v-else><va-icon name="report" /> &nbsp;Prikaži greške</span>
            </va-tab>
            <va-tab @click="$refs.show_solution_modal.show()">
              <va-icon name="help" />
              &nbsp;Otkrij sva polja
            </va-tab>
          </template>
        </va-tabs>
      </div>
    </va-card>
    <br /><br />
    <va-card>
      <h4 class="display-4">Upute</h4>
      <va-divider></va-divider>
      <div
        v-for="i in numinstructions"
        v-bind:key="i"
        class="text-block"
        style="margin: 20px"
      >
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          {{ i }}. uputa
        </h6>
        <p style="text-align: start">
          {{ instructions[i - 1] }}
        </p>
      </div>
      <div class="my_row" v-if="alert">
        <va-alert
          style="white-space: pre-wrap"
          color="danger"
          :title="'Greške u unosu kategorija i vrijednosti'"
          center
        >
          {{ alert }}
        </va-alert>
      </div>
    <br /> 
    </va-card>
    <br /> 
    <br /> 
    <va-card>
      <h4 class="display-4">Opcija</h4>
      <va-divider></va-divider>
      <div class="my_row">
        <va-tabs v-model="mode">
          <template #tabs> 
            <va-tab name="-1"> ? </va-tab>
            <va-tab name="1"> &#128504; </va-tab>
            <va-tab name="0"> &#215; </va-tab>
          </template>
        </va-tabs> 
      </div> 
    </va-card>
    <br /> 
    <br />  
      <div class="my_row" style="max-height: 650px">
        <va-infinite-scroll disabled :load="() => {}">
          <div class="my_row">
            <table class="integram_solve">
              <tr>
                <td>&nbsp;</td>
                <td
                  class="rotated_text"
                  v-for="i in numvalues * (numcategories - 1)"
                  v-bind:key="i"
                  :class="{
                    second: Math.floor((i - 1) / numvalues) + 1 == 1,
                    third: Math.floor((i - 1) / numvalues) + 1 == 2,
                    fourth: Math.floor((i - 1) / numvalues) + 1 == 3,
                    fifth: Math.floor((i - 1) / numvalues) + 1 == 4,
                  }"
                >
                  <span
                    class="checkmark, text_column"
                    v-if="
                      is_image[Math.floor((i - 1) / numvalues) + 1] == false &&
                      too_long[Math.floor((i - 1) / numvalues) + 1] == false
                    "
                  >
                    {{
                      category_values[
                        order[Math.floor((i - 1) / numvalues) + 1][
                          (i - 1) % numvalues
                        ]
                      ][Math.floor((i - 1) / numvalues) + 1]
                    }}
                  </span>
                  <span class="checkmark, text_column" v-else>
                    {{ Math.floor((i - 1) / numvalues) + 2
                    }}{{
                      alphabet[
                        order[Math.floor((i - 1) / numvalues) + 1][
                          (i - 1) % numvalues
                        ]
                      ]
                    }}
                  </span>
                </td>
              </tr>
              <tr v-for="j in numvalues" v-bind:key="j">
                <td class="first">
                  <span
                    class="checkmark, text_row"
                    v-if="is_image[0] == false && too_long[0] == false"
                  >
                    {{ category_values[order[0][j - 1]][0] }}
                  </span>
                  <span class="checkmark, text_row" v-else>
                    {{ 1 }}{{ alphabet[order[0][j - 1]] }}
                  </span>
                </td>
                <td
                  v-for="i in numvalues * (numcategories - 1)"
                  v-bind:key="i"
                  @click="
                    click_cell(
                      j - 1,
                      (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                        ((i - 1) % numvalues)
                    )
                    $forceUpdate();
                  "
                  :class="{
                    wrong:
                      values[j - 1][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] !=
                        solution[j - 1][
                          (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                            ((i - 1) % numvalues)
                        ] &&
                      values[j - 1][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] != -1 &&
                      show_error,
                  }"
                >
                  <span
                    class="checkmark"
                    v-if="
                      values[j - 1][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] == 1
                    "
                    >&#128504;</span
                  >
                  <span
                    class="checkmark"
                    v-else-if="
                      values[j - 1][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] == 0
                    "
                    >&#215;</span
                  >
                  <span class="checkmark" v-else>?</span>
                </td>
              </tr>
              <tr v-for="j in numvalues * (numcategories - 2)" v-bind:key="j">
                <td
                  :class="{
                    second:
                      numcategories - 1 - Math.floor((j - 1) / numvalues) == 1,
                    third:
                      numcategories - 1 - Math.floor((j - 1) / numvalues) == 2,
                    fourth:
                      numcategories - 1 - Math.floor((j - 1) / numvalues) == 3,
                    fifth:
                      numcategories - 1 - Math.floor((j - 1) / numvalues) == 4,
                  }"
                >
                  <span
                    class="checkmark, text_row"
                    v-if="
                      is_image[
                        numcategories - 1 - Math.floor((j - 1) / numvalues)
                      ] == false &&
                      too_long[
                        numcategories - 1 - Math.floor((j - 1) / numvalues)
                      ] == false
                    "
                  >
                    {{
                      category_values[
                        order[
                          numcategories - 1 - Math.floor((j - 1) / numvalues)
                        ][(j - 1) % numvalues]
                      ][numcategories - 1 - Math.floor((j - 1) / numvalues)]
                    }}
                  </span>
                  <span class="checkmark, text_row" v-else>
                    {{ numcategories - Math.floor((j - 1) / numvalues)
                    }}{{
                      alphabet[
                        order[Math.floor((j - 1) / numvalues) + 1][
                          (j - 1) % numvalues
                        ]
                      ]
                    }}
                  </span>
                </td>
                <td
                  v-for="i in numvalues *
                  (numcategories - Math.floor((j - 1) / numvalues) - 2)"
                  v-bind:key="i"
                  @click="
                    click_cell(
                      (numcategories - 1 - Math.floor((j - 1) / numvalues)) *
                        numvalues +
                        ((j - 1) % numvalues),
                      (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                        ((i - 1) % numvalues)
                    )
                    $forceUpdate();
                  "
                  :class="{
                    wrong:
                      values[
                        (numcategories - 1 - Math.floor((j - 1) / numvalues)) *
                          numvalues +
                          ((j - 1) % numvalues)
                      ][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] !=
                        solution[
                          (numcategories -
                            1 -
                            Math.floor((j - 1) / numvalues)) *
                            numvalues +
                            ((j - 1) % numvalues)
                        ][
                          (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                            ((i - 1) % numvalues)
                        ] &&
                      values[
                        (numcategories - 1 - Math.floor((j - 1) / numvalues)) *
                          numvalues +
                          ((j - 1) % numvalues)
                      ][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] != -1 &&
                      show_error,
                  }"
                >
                  <span
                    class="checkmark"
                    v-if="
                      values[
                        (numcategories - 1 - Math.floor((j - 1) / numvalues)) *
                          numvalues +
                          ((j - 1) % numvalues)
                      ][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] == 1
                    "
                  >
                    &#128504;</span
                  >
                  <span
                    class="checkmark"
                    v-else-if="
                      values[
                        (numcategories - 1 - Math.floor((j - 1) / numvalues)) *
                          numvalues +
                          ((j - 1) % numvalues)
                      ][
                        (Math.floor((i - 1) / numvalues) + 1) * numvalues +
                          ((i - 1) % numvalues)
                      ] == 0
                    "
                    >&#215;</span
                  >
                  <span class="checkmark" v-else>?</span>
                </td>
              </tr>
            </table>
          </div>
        </va-infinite-scroll>
      </div> 
    <br />
    <br />
    <span
      v-for="j in numcategories"
      v-bind:key="j"
      :color="colors_for_number[j - 1]"
      style="margin-bottom: 20px"
    >
      <va-card
        v-if="j == category_to_display"
        :color="colors_for_number[j - 1]"
      >
        <h4 class="display-4">
          <va-chip
            :color="colors_for_number[j - 1]"
            class="display-4"
            style="overflow-wrap: anywhere"
          >
            {{ j }}. kategorija&nbsp;
            <span
              @click="
                clear_category(j - 1);
                is_image[j - 1] = !is_image[j - 1];
                clear_category(j - 1);
                $forceUpdate();
              "
            >
              <va-icon
                size="large"
                v-if="is_image[j - 1] == false"
                name="title"
              />
              <va-icon size="large" v-else name="photo" />
            </span>
          </va-chip>
        </h4>
        <va-card-content style="background-color: white">
          <br />
          <div class="my_row">
            <va-chip :color="colors_for_number[j - 1]">
              {{ category_names[j - 1] }}
            </va-chip>
          </div>
          <va-divider></va-divider>
          <span v-for="k in numvalues" v-bind:key="k">
            <div
              class="my_row"
              v-if="my_solution[order[0][k - 1]][j - 1] != ''"
            >
              <va-chip
                :color="colors_for_number[j - 1]"
                style="display: inline-block; overflow-wrap: anywhere"
                v-if="
                  my_solution[order[0][k - 1]][j - 1] != '' &&
                  (my_solution[order[0][k - 1]][j - 1] ==
                    category_values[order[0][k - 1]][j - 1] ||
                    (my_solution[order[0][k - 1]][j - 1] !=
                      category_values[order[0][k - 1]][j - 1] &&
                      !show_error))
                "
              >
                <span v-if="is_image[j - 1] == true">
                  {{
                    my_solution[order[0][k - 1]][j - 1]
                      .split("/")
                      [
                        my_solution[order[0][k - 1]][j - 1].split("/").length -
                          1
                      ].split(".")[0]
                  }}
                </span>
                <span v-else>
                  {{ my_solution[order[0][k - 1]][j - 1] }}
                </span>
              </va-chip>
              <va-chip
                style="display: inline-block; overflow-wrap: anywhere"
                color="danger"
                v-if="
                  my_solution[order[0][k - 1]][j - 1] != '' &&
                  my_solution[order[0][k - 1]][j - 1] !=
                    category_values[order[0][k - 1]][j - 1] &&
                  show_error
                "
              >
                <span v-if="is_image[j - 1] == true">
                  {{
                    my_solution[order[0][k - 1]][j - 1]
                      .split("/")
                      [
                        my_solution[order[0][k - 1]][j - 1].split("/").length -
                          1
                      ].split(".")[0]
                  }}
                </span>
                <span v-else>
                  {{ my_solution[order[0][k - 1]][j - 1] }}
                </span>
              </va-chip>
            </div>
            <div class="my_row" v-else>
              <va-chip color="warning">?</va-chip>
            </div>
          </span>
          <MyCounter
            :min_value="category_counter_min"
            :max_value="numcategories"
            v-bind:value="category_to_display"
            @input="(n) => ((category_to_display = n), $forceUpdate())"
            :some_text="''"
          ></MyCounter>
        </va-card-content>
      </va-card>
    </span>
    <span v-for="i in numcategories" v-bind:key="i">
      <div
        class="my_row"
        v-if="
          too_long[i - 1] == true &&
          is_image[i - 1] == false &&
          i == category_to_display
        "
      >
        <va-card :color="colors_for_number[i - 1]">
          <va-card-content style="background-color: white">
            <va-list v-if="too_long[i - 1] == true && is_image[i - 1] == false">
              <va-list-item v-for="j in numvalues" v-bind:key="j">
                <va-list-item-section avatar>
                  <span
                    :class="{
                      padded: true,
                      first: i == 1,
                      second: i == 2,
                      third: i == 3,
                      fourth: i == 4,
                      fifth: i == 5,
                    }"
                  >
                    {{ i }}{{ alphabet[j - 1] }}
                  </span>
                </va-list-item-section>

                <va-list-item-section style="overflow-wrap: anywhere">
                  {{ category_values[j - 1][i - 1] }}
                </va-list-item-section>
              </va-list-item>
            </va-list>
            <MyCounter
              :min_value="category_counter_min"
              :max_value="numcategories"
              v-bind:value="category_to_display"
              @input="(n) => ((category_to_display = n), $forceUpdate())"
              :some_text="''"
            ></MyCounter>
          </va-card-content>
        </va-card>
      </div>
      <div
        class="my_row"
        v-if="is_image[i - 1] == true && i == category_to_display"
      >
        <va-card :color="colors_for_number[i - 1]">
          <va-card-content style="background-color: white">
            <va-tabs
              v-model="value_to_display"
              :color="colors_for_number[i - 1]"
            >
              <template #tabs>
                <span v-for="val in numvalues" v-bind:key="val">
                  <va-tab :name="val">
                    <span> {{ i }}{{ alphabet[val - 1] }} </span>
                  </va-tab>
                </span>
              </template>
            </va-tabs>
            <span v-for="j in numvalues" v-bind:key="j">
              <div v-if="j == value_to_display" class="image_container">
                <img
                  :id="'img' + (j - 1) + ':' + (i - 1)"
                  alt="Nema slike"
                  :src="urls[j - 1][i - 1]"
                  style="width: 100%"
                />
              </div>
            </span>
          </va-card-content>
        </va-card>
      </div>
    </span>
    <br /><br />
    <va-card>
      <h4 class="display-4">Podaci o zagonetci</h4>
      <va-divider></va-divider>
      <div class="text-block" style="margin: 20px">
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          Naslov
        </h6>
        <p style="text-align: start">
          {{ title }}
        </p>
      </div>
      <div class="text-block" style="margin: 20px">
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          Opis
        </h6>
        <p style="text-align: start">
          {{ description }}
        </p>
      </div>
      <div class="text-block" style="margin: 20px">
        <h6
          class="title"
          color="info"
          style="margin-bottom: 10px; text-align: start"
        >
          Izvor
        </h6>
        <p style="text-align: start">
          {{ source }}
        </p>
      </div>
      <div class="my_row">
        <span class="display-6" style="margin-left: 10px"
          >Autor zagonetke: {{ authorUserRecord.displayName }}
          <router-link :to="'/profile/' + authorUserRecord.email"
            >({{ authorUserRecord.email }})</router-link
          >
        </span>
        <span class="display-6" style="margin-left: 10px">
          Vrijeme kreiranja: {{ time_created.toLocaleString() }}</span
        >
      </div>
      <div class="my_row">
        <span class="display-6" style="margin-left: 10px"
          >Zadnji ažurirao: {{ updaterUserRecord.displayName }}
          <router-link :to="'/profile/' + updaterUserRecord.email"
            >({{ updaterUserRecord.email }})</router-link
          >
        </span>
        <span class="display-6" style="margin-left: 10px">
          Vrijeme zadnje izmjene: {{ last_updated.toLocaleString() }}</span
        >
      </div>
    </va-card>
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
</template>

<style scoped>
table {
  border-collapse: collapse;
  border-right: 0;
  border-bottom: 0;
}
td,
th {
  border: 1px solid black;
  text-align: center;
}
.integram_task {
  border: none;
}
.integram_task th {
  border: none;
  padding: 15px;
}
.integram_task td {
  border: none;
  border-collapse: separate;
  padding: 15px;
}
.rotated_text {
  writing-mode: vertical-rl;
}
table {
  display: inline-table;
}
.integram_solve td,
th {
  border: 1px solid black;
}

.checkmark {
  width: 25px;
  vertical-align: center;
  display: inline-block;
}
.text_column {
  padding-top: 5px;
  padding-bottom: 5px;
}
.text_row {
  padding-left: 5px;
  padding-right: 5px;
}
.image_container {
  display: inline-block;
  position: relative;
  width: 100%;
  margin-right: 1%;
  text-align: center;
}
/* Top left text */
.topleft {
  position: absolute;
  top: 0px;
  left: 0px;
}
.first {
  color: white;
  background-color: #0a2543;
}
.second {
  color: white;
  background-color: #144b85;
}
.third {
  color: white;
  background-color: #1e70c8;
}
.fourth {
  color: black;
  background-color: #4e96e4;
}
.fifth {
  color: black;
  background-color: #90beee;
}
.wrong {
  color: #de1041;
}
.padded {
  padding: 5px;
  border-radius: 50%;
  margin: 5px;
  font-weight: bold;
}
</style>
