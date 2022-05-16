<script>
import { ref, getDownloadURL } from "firebase/storage";
import { projectStorage } from "../firebase_main.js"
import { integramsRef } from "../firebase_main.js"
import { usersRef } from "../firebase_main.js"
import { integramsRecordsRef, friendsRef } from "../firebase_main.js"
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
      let some_id = this.author; let other = this.author;
      let newRecord = { displayName: "Skriveno", email: "skriveno" };
      let me = this.user.uid;
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
      let some_id = this.updater; let other = this.updater;
      let newRecord = { displayName: "Skriveno", email: "skriveno" };
      let me = this.user.uid;
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
      this.permissionsUserRecords = []; let my_activity = this; let me = this.user.uid; 
      for (let i = 0; i < this.permissions.length; i++) {
        let some_id = this.permissions[i]; let other = this.permissions[i];
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
    click_cell(x, y) {
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
          if (this.values[x][col_start + i] == 1) {
            this.$vaToast.init("Neispravan zaključak.");
            this.values = oldvalues;
            this.$forceUpdate();
            return;
          }
          if (this.values[col_start + i][x] == 1) {
            this.$vaToast.init("Neispravan zaključak.");
            this.values = oldvalues;
            this.$forceUpdate();
            return;
          }
          this.values[x][col_start + i] = 0;
          this.values[col_start + i][x] = 0;
          if (this.values[row_start + i][y] == 1) {
            this.$vaToast.init("Neispravan zaključak.");
            this.values = oldvalues;
            this.$forceUpdate();
            return;
          }
          if (this.values[y][row_start + i] == 1) {
            this.$vaToast.init("Neispravan zaključak.");
            this.values = oldvalues;
            this.$forceUpdate();
            return;
          }
          this.values[row_start + i][y] = 0;
          this.values[y][row_start + i] = 0;
        }
      }
      if (this.mode == -1 && this.values[x][y] == 1) {
        let row_start = x - (x % this.numvalues);
        let col_start = y - (y % this.numvalues);
        for (let i = 0; i < this.numvalues; i++) {
          this.values[x][col_start + i] = -1;
          this.values[col_start + i][x] = -1;
          this.values[row_start + i][y] = -1;
          this.values[y][row_start + i] = -1;
        }
      }
      this.values[x][y] = this.mode;
      this.values[y][x] = this.mode;
      let correct = this.update_values();
      for (let i = 0; i < Math.max(this.numcategories, this.numvalues); i++) {
        correct = this.update_values();
      }
      if (!correct) {
        this.$vaToast.init("Neispravan zaključak.");
        this.values = oldvalues;
      }
      correct = this.find_single();
      if (!correct) {
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
  <Navbar></Navbar>
  <body class="mybody" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <body class="mybody" v-else>
    <div class="myrow">
      <span style="float: left; overflow-wrap: anywhere">
        <va-button
          @click="show_error = !show_error"
          style="margin-left: 10px; margin-top: 10px"
        >
          <span v-if="show_error == false"
            ><va-icon name="report_off" />&nbsp;Ne prikazuj greške</span
          ><span v-else><va-icon name="report" />&nbsp;Prikaži greške</span>
        </va-button>
      </span>
      <va-chip
        style="
          float: right;
          overflow-wrap: anywhere;
          margin-left: 10px;
          margin-top: 10px;
        "
        outline
        >{{ format(time_elapsed) }}</va-chip
      >
    </div>
    <div v-for="i in numinstructions" v-bind:key="i">
      <va-card>
        <va-card-title>{{ i }}. uputa</va-card-title>
        <va-card-content>{{ instructions[i - 1] }}</va-card-content> </va-card
      ><br />
    </div>
    <br />
    <br />
    <div class="myrow" v-if="alert">
      <va-alert
        style="white-space: pre-wrap"
        color="danger"
        :title="'Greške u unosu kategorija i vrijednosti'"
        center
        class="mb-4"
      >
        {{ alert }}
      </va-alert>
    </div>
    <br />
    <div class="myrow" style="max-height: 650px">
      <va-infinite-scroll disabled :load="() => {}">
        <div class="myrow">
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
                  }}</span
                >
                <span class="checkmark, text_column" v-else
                  >{{ Math.floor((i - 1) / numvalues) + 2
                  }}{{
                    alphabet[
                      order[Math.floor((i - 1) / numvalues) + 1][
                        (i - 1) % numvalues
                      ]
                    ]
                  }}</span
                >
              </td>
            </tr>
            <tr v-for="j in numvalues" v-bind:key="j">
              <td class="first">
                <span
                  class="checkmark, text_row"
                  v-if="is_image[0] == false && too_long[0] == false"
                  >{{ category_values[order[0][j - 1]][0] }}</span
                >
                <span class="checkmark, text_row" v-else
                  >{{ 1 }}{{ alphabet[order[0][j - 1]] }}</span
                >
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
                <span class="checkmark, text_row" v-else
                  >{{ numcategories - Math.floor((j - 1) / numvalues)
                  }}{{
                    alphabet[
                      order[Math.floor((j - 1) / numvalues) + 1][
                        (j - 1) % numvalues
                      ]
                    ]
                  }}</span
                >
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
                        (numcategories - 1 - Math.floor((j - 1) / numvalues)) *
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
    <div class="myrow">
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab name="-1"> ? </va-tab>
          <va-tab name="1"> &#128504; </va-tab>
          <va-tab name="0"> &#215; </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-button @click="clear_values()"
        ><va-icon name="delete" />&nbsp;Izbriši</va-button
      >
    </div>
    <div class="myrow">
      <va-tabs v-model="category_to_display">
        <template #tabs>
          <span v-for="i in numcategories" v-bind:key="i">
            <va-tab :name="i">
              <span>{{ i }}. kategorija</span>
            </va-tab>
          </span>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <span
        v-for="j in numcategories"
        v-bind:key="j"
        :color="colors_for_number[j - 1]"
        style="margin-bottom: 20px"
      >
        <va-card
          v-if="j == category_to_display"
          :color="colors_for_number[j - 1]"
          style="margin-bottom: 20px"
          :class="{
            first: j == 1,
            second: j == 2,
            third: j == 3,
            fourth: j == 4,
            fifth: j == 5,
          }"
        >
          <va-card-title>
            <span></span>
            <va-chip :color="colors_for_number[j - 1]"
              >{{ j }}. kategorija&nbsp;<va-icon
                v-if="is_image[j - 1] == false"
                name="title" /><va-icon v-else name="photo"
            /></va-chip>
          </va-card-title>
          <va-card-content style="background-color: white">
            <br />
            <div class="myrow">
              <va-chip :color="colors_for_number[j - 1]">{{
                category_names[j - 1]
              }}</va-chip>
            </div>
            <va-divider></va-divider>
            <span v-for="k in numvalues" v-bind:key="k">
              <div
                class="myrow"
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
                          my_solution[order[0][k - 1]][j - 1].split("/")
                            .length - 1
                        ].split(".")[0]
                    }}</span
                  >
                  <span v-else>{{ my_solution[order[0][k - 1]][j - 1] }}</span>
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
                          my_solution[order[0][k - 1]][j - 1].split("/")
                            .length - 1
                        ].split(".")[0]
                    }}</span
                  >
                  <span v-else>{{ my_solution[order[0][k - 1]][j - 1] }}</span>
                </va-chip>
              </div>
              <div class="myrow" v-else><va-chip color="warning">?</va-chip></div>
            </span>
          </va-card-content>
        </va-card>
      </span>
    </div>
    <span v-for="i in numcategories" v-bind:key="i">
      <div
        class="myrow"
        v-if="
          too_long[i - 1] == true &&
          is_image[i - 1] == false &&
          i == category_to_display
        "
      >
        <va-card :color="colors_for_number[i - 1]">
          <!--<va-card-title
            ><va-chip :color="colors_for_number[i - 1]"
              >{{ i }}. kategorija&nbsp;
              <va-icon v-if="is_image[i - 1] == false" name="title" /><va-icon
                v-else
                name="photo" /></va-chip
          ></va-card-title>-->
          <va-card-content style="background-color: white">
            <!--<br />-->
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
          </va-card-content>
        </va-card>
      </div>
      <div
        class="myrow"
        v-if="is_image[i - 1] == true && i == category_to_display"
      >
        <va-card :color="colors_for_number[i - 1]">
          <!--<va-card-title
              ><va-chip :color="colors_for_number[i - 1]"
                >{{ i }}. kategorija&nbsp;
                <va-icon v-if="is_image[i - 1] == false" name="title" /><va-icon
                  v-else
                  name="photo" /></va-chip
            ></va-card-title>-->
          <va-card-content style="background-color: white">
            <!--<br />-->
            <va-tabs
              v-model="value_to_display"
              :color="colors_for_number[i - 1]"
            >
              <template #tabs>
                <span v-for="val in numvalues" v-bind:key="val">
                  <va-tab :name="val">
                    <span>{{ i }}{{ alphabet[val - 1] }}</span>
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
                <!--<div
                    :class="{
                      padded: true,
                      topleft: true,
                      first: i == 1,
                      second: i == 2,
                      third: i == 3,
                      fourth: i == 4,
                      fifth: i == 5,
                    }"
                  >
                    {{ i }}{{ alphabet[j - 1] }}
                  </div>-->
              </div>
            </span>
          </va-card-content>
        </va-card>
      </div>
    </span>
    <div class="myrow">
      <va-card>
        <va-card-title>Naslov zagonetke</va-card-title>
        <va-card-content>{{ title }}</va-card-content>
      </va-card>
    </div>
    <div class="myrow">
      <va-card>
        <va-card-title>Opis zagonetke</va-card-title>
        <va-card-content>{{ description }}</va-card-content>
      </va-card>
    </div>
    <div class="myrow">
      <va-card>
        <va-card-title>Izvor zagonetke</va-card-title>
        <va-card-content>{{ source }}</va-card-content>
      </va-card>
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
        >Vrijeme kreiranja: {{ time_created.toLocaleString() }}</va-chip
      >
      <br />
      <va-chip
        style="margin-left: 10px; margin-top: 10px; overflow-wrap: anywhere"
        >Zadnji ažurirao: {{ updaterUserRecord.displayName }} ({{
          updaterUserRecord.email
        }})</va-chip
      >
      <va-chip
        style="margin-left: 10px; margin-top: 10px; overflow-wrap: anywhere"
        >Vrijeme zadnje izmjene: {{ last_updated.toLocaleString() }}</va-chip
      >
    </div>
    <div class="myrow">
      <va-button @click="show_solution()" style="overflow-wrap: anywhere"
        ><va-icon name="help" />&nbsp;Otkrij sva polja</va-button
      >
    </div>
  </body>
  <va-modal
    ref="show_error"
    message="Želite li da greške budu uznačene?"
    @ok="show_error = true"
    stateful
    ok-text="Da"
    cancel-text="Ne"
  />
  <va-modal
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
