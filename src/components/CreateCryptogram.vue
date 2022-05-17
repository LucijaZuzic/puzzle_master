<script>
import { ref, uploadBytes } from "firebase/storage";
import { projectStorage } from "../firebase_main.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./Navbar.vue";
import { usersRef } from "../firebase_main.js";
import { cryptogramsRef, friendsRef } from "../firebase_main.js";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      user: null,
      permissions: [],
      image: null,
      imageURL: "",
      permissionsUserRecords: [],
      collaborator: "",
      description: "",
      source: "",
      title: "",
      is_public: false,
      solution: [[]],
      option: [[]],
      is_special: [[]],
      unnumbered: [[]],
      border_top: [[]],
      border_bottom: [[]],
      border_left: [[]],
      border_right: [[]],
      num_letters: 1,
      rows: 1,
      columns: 1,
      use_option: false,
      use_mode: true,
      mode: -2,
      option_number: -1,
      letter_alert: "",
      alphabet: [
        "A",
        "B",
        "C",
        "Č",
        "Ć",
        "D",
        "Đ",
        "DŽ",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "LJ",
        "M",
        "N",
        "NJ",
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
      letters: [["", "", ""]],
      letters_revealed: [[0, 0, 0]],
      value_to_randomize: "letters",
      randomize_all: false,
      keep_black: true,
      randomize_labels: ["Slova", "Brojevi", "Opcije"],
      randomize_options: ["letters", "numbers", "options"],
      current_x: null,
      current_y: null,
    };
  },
  methods: {
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
    initialize() {
      this.rows = parseInt(this.rows);
      this.columns = parseInt(this.columns);
      let oldsolution = [];
      let oldisspecial = [];
      let oldunnumbered = [];
      let oldoption = [];
      let oldtop = [];
      let oldbottom = [];
      let oldleft = [];
      let oldright = [];
      let maxcol = this.columns;
      let maxrow = this.rows;
      if (this.solution) {
        oldsolution = this.solution;
        oldisspecial = this.is_special;
        oldunnumbered = this.unnumbered;
        oldoption = this.option;
        oldtop = this.border_top;
        oldbottom = this.border_bottom;
        oldleft = this.border_left;
        oldright = this.border_right;
        if (oldsolution.length > maxrow) {
          maxrow = oldsolution.length;
        }
        if (oldsolution[0].length > maxcol) {
          maxcol = oldsolution[0].length;
        }
      }
      this.solution = [];
      this.is_special = [];
      this.unnumbered = [];
      this.option = [];
      this.border_top = [];
      this.border_bottom = [];
      this.border_left = [];
      this.border_right = [];
      for (let i = 0; i < maxrow; i++) {
        let solution_row = [];
        let special_row = [];
        this.unnumbered.push([]);
        this.option.push([]);
        this.border_top.push([]);
        this.border_bottom.push([]);
        this.border_left.push([]);
        this.border_right.push([]);
        for (let j = 0; j < maxcol; j++) {
          if (oldsolution[i]) {
            if (oldsolution[i].length > j) {
              solution_row.push(oldsolution[i][j]);
              special_row.push(oldisspecial[i][j]);
              this.unnumbered[i].push(oldunnumbered[i][j]);
              this.option[i].push(oldoption[i][j]);
              this.border_top[i].push(oldtop[i][j]);
              this.border_bottom[i].push(oldbottom[i][j]);
              this.border_left[i].push(oldleft[i][j]);
              this.border_right[i].push(oldright[i][j]);
            } else {
              solution_row.push(-2);
              special_row.push(0);
              this.unnumbered[i].push(0);
              this.option[i].push(-1);
              this.border_top[i].push(0);
              this.border_bottom[i].push(0);
              this.border_left[i].push(0);
              this.border_right[i].push(0);
            }
          } else {
            solution_row.push(-2);
            special_row.push(0);
            this.unnumbered[i].push(0);
            this.option[i].push(-1);
            this.border_top[i].push(0);
            this.border_bottom[i].push(0);
            this.border_left[i].push(0);
            this.border_right[i].push(0);
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
      let oldletters = [];
      let oldlettersrevealed = [];
      let maxletters = this.num_letters;
      if (this.letters) {
        oldletters = this.letters;
        oldlettersrevealed = this.letters_revealed;
        if (oldletters.length > maxletters) {
          maxletters = oldletters.length;
        }
      }
      this.letters = [];
      this.letters_revealed = [];
      for (let i = 0; i < maxletters; i++) {
        if (oldletters.length > i) {
          this.letters.push(oldletters[i]);
          this.letters_revealed.push(oldlettersrevealed[i]);
        } else {
          this.letters.push(["", "", ""]);
          this.letters_revealed.push([0, 0, 0]);
        }
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
    normalize_option() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1 || this.solution[i][j] == -2) {
            this.option[i][j] = -1;
            this.unnumbered[i][j] = 0;
          }
        }
      }
    },
    randomize_option() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1 || this.solution[i][j] == -2) {
            this.option[i][j] = -1;
          } else {
            this.option[i][j] = Math.floor(Math.random() * 3);
          }
        }
      }
    },
    randomize_option_if_not_set() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1 || this.solution[i][j] == -2) {
            this.option[i][j] = -1;
            continue;
          }
          if (this.option[i][j] != -1) {
            continue;
          }
          this.option[i][j] = Math.floor(Math.random() * 3);
        }
      }
    },
    resetOptions() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.option[i][j] = -1;
        }
      }
    },
    randomize() {
      this.solution = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.is_special[i][j] == 1 || this.unnumbered[i][j] == 1) {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          } else {
            solution_row.push(
              Math.floor(Math.random() * (this.num_letters + 1)) - 1
            );
          }
        }
        this.solution.push(solution_row);
      }
      this.normalize_option();
    },
    randomize_keep_black() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -1) {
            solution_row.push(-1);
          } else {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.normalize_option();
    },
    fill_empty() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -2) {
            if (this.is_special[i][j] == 1 || this.unnumbered[i][j] == 1) {
              solution_row.push(Math.floor(Math.random() * this.num_letters));
            } else {
              solution_row.push(
                Math.floor(Math.random() * (this.num_letters + 1)) - 1
              );
            }
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.normalize_option();
    },
    fill_empty_keep_black() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] == -2) {
            solution_row.push(Math.floor(Math.random() * this.num_letters));
          } else {
            solution_row.push(this.solution[i][j]);
          }
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.normalize_option();
    },
    resetNumbers() {
      let new_values = [];
      for (let i = 0; i < this.rows; i++) {
        let solution_row = [];
        for (let j = 0; j < this.columns; j++) {
          solution_row.push(-2);
        }
        new_values.push(solution_row);
      }
      this.solution = new_values;
      this.resetOptions();
    },
    resetLetters() {
      this.letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        this.letters.push(["", "", ""]);
      }
    },
    check_leters_exists(letter_new) {
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          if (
            this.letters[i] &&
            this.letters[i][j] &&
            this.letters[i][j] == letter_new
          ) {
            return true;
          }
        }
      }
      return false;
    },
    randomize_letters() {
      this.letters = [];
      for (let i = 0; i < this.num_letters; i++) {
        this.letters.push([]);
        for (let j = 0; j < 3; j++) {
          let random_index = Math.floor(Math.random() * this.alphabet.length);
          while (this.check_leters_exists(this.alphabet[random_index])) {
            random_index = Math.floor(Math.random() * this.alphabet.length);
          }
          this.letters[i].push(this.alphabet[random_index]);
        }
      }
      this.$forceUpdate();
    },
    fill_empty_letters() {
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.alphabet.includes(this.letters[i][j])) {
            continue;
          }
          let random_index = Math.floor(Math.random() * this.alphabet.length);
          while (this.check_leters_exists(this.alphabet[random_index])) {
            random_index = Math.floor(Math.random() * this.alphabet.length);
          }
          this.letters[i][j] = this.alphabet[random_index];
        }
      }
    },
    remove_max_letter() {
      for (let i = 0; i < this.solution.length; i++) {
        for (let j = 0; j < this.solution[i].length; j++) {
          if (this.solution[i][j] >= this.num_letters) {
            this.solution[i][j] = -2;
            this.option[i][j] = -1;
            this.is_special[i][j] = 0;
            this.unnumbered[i][j] = 0;
          }
        }
      }
    },
    check_letter() {
      this.letter_alert = "";
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < 3; j++) {
          this.letters[i][j] = this.letters[i][j].toUpperCase();
          if (!this.alphabet.includes(this.letters[i][j])) {
            if (this.letter_alert != "") {
              this.letter_alert += " ";
            }
            this.letter_alert +=
              j +
              1 +
              ". opcija za " +
              i +
              ". slovo (" +
              this.letters[i][j] +
              ") nije u zadanoj abecedi.";
          }
        }
      }
      for (let i = 0; i < this.num_letters; i++) {
        for (let j = 0; j < this.num_letters; j++) {
          for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
              if (i > j || (i == j && k >= l)) {
                continue;
              }
              if (this.letters[i][k] == this.letters[j][l]) {
                if (this.letter_alert != "") {
                  this.letter_alert += " ";
                }
                this.letter_alert +=
                  k +
                  1 +
                  ". opcija za " +
                  i +
                  ". slovo (" +
                  this.letters[i][k] +
                  ") i " +
                  (l + 1) +
                  ". opcija za " +
                  j +
                  ". slovo (" +
                  this.letters[j][l] +
                  ") su jednake.";
              }
            }
          }
        }
      }
      this.$forceUpdate();
    },
    check_duplicated(x, y) {
      for (let i = 0; i < this.letters.length; i++) {
        for (let j = 0; j < 3; j++) {
          if (x == i && y == j) {
            continue;
          }
          if (this.letters[i][j] == this.letters[x][y]) {
            return true;
          }
        }
      }
      return false;
    },
    add_unnumbered(x, y) {
      if (
        this.solution[x][y] != -1 &&
        this.solution[x][y] != -2 &&
        this.unnumbered[x][y] != -1
      ) {
        this.unnumbered[x][y] = (this.unnumbered[x][y] + 1) % 2;
        return;
      }
      if (this.solution[x][y] == -1) {
        this.$vaToast.init("Ne možete sakriti broj na barijeri.");
      }
      if (this.solution[x][y] == -2) {
        this.$vaToast.init("Ne možete sakriti broj na polju bez broja.");
      }
      if (this.solution[x][y] == -2) {
        this.$vaToast.init("Ne možete sakriti broj na polju bez opcije.");
      }
    },
    change_number(x, y) {
      if (this.use_option == true) {
        this.option[x][y] = this.option_number;
        if (this.solution[x][y] == -1 || this.solution[x][y] == -2) {
          this.option[x][y] = -1;
        }
      }
      if (this.use_mode == false) {
        return;
      }
      if (this.mode <= -4) {
        if (this.solution[x][y] == -1) {
          return;
        }
        if (this.mode == -4 && x != 0 && this.solution[x - 1][y] != -1) {
          this.border_top[x][y] = (this.border_top[x][y] + 1) % 2;
          this.border_bottom[x - 1][y] = (this.border_bottom[x - 1][y] + 1) % 2;
        }
        if (
          this.mode == -5 &&
          x != this.rows - 1 &&
          this.solution[x + 1][y] != -1
        ) {
          this.border_bottom[x][y] = (this.border_bottom[x][y] + 1) % 2;
          this.border_top[x + 1][y] = (this.border_top[x + 1][y] + 1) % 2;
        }
        if (this.mode == -6 && y != 0 && this.solution[x][y - 1] != -1) {
          this.border_left[x][y] = (this.border_left[x][y] + 1) % 2;
          this.border_right[x][y - 1] = (this.border_right[x][y - 1] + 1) % 2;
        }
        if (
          this.mode == -7 &&
          y != this.columns - 1 &&
          this.solution[x][y + 1] != -1
        ) {
          this.border_right[x][y] = (this.border_right[x][y] + 1) % 2;
          this.border_left[x][y + 1] = (this.border_left[x][y + 1] + 1) % 2;
        }
        if (this.mode == -8) {
          this.add_unnumbered(x, y);
        }
        this.$forceUpdate();
        return;
      }
      if (this.mode == -3) {
        if (this.solution[x][y] == -1) {
          this.$vaToast.init("Barijera ne može biti dio rješenja.");
        } else {
          this.is_special[x][y] = (this.is_special[x][y] + 1) % 2;
        }
      } else {
        if (this.mode == -1) {
          if (this.is_special[x][y] == 1) {
            this.$vaToast.init(
              "Polje koje je dio rješenja ne može biti barijera."
            );
          } else {
            this.solution[x][y] = this.mode;
            this.border_bottom[x][y] = 0;
            this.border_top[x][y] = 0;
            this.border_left[x][y] = 0;
            this.border_right[x][y] = 0;
            if (x != 0) {
              this.border_bottom[x - 1][y] = 0;
            }
            if (x != this.rows - 1) {
              this.border_top[x + 1][y] = 0;
            }
            if (y != 0) {
              this.border_right[x][y - 1] = 0;
            }
            if (y != this.columns - 1) {
              this.border_left[x][y + 1] = 0;
            }
          }
        } else {
          this.solution[x][y] = this.mode;
        }
        if (this.solution[x][y] == -1 || this.solution[x][y] == -2) {
          this.option[x][y] = -1;
        }
      }
    },
    hasEmpty() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (
            !(
              this.solution[i][j] >= -1 &&
              this.solution[i][j] < this.num_letters
            )
          ) {
            return true;
          }
        }
      }
      return false;
    },
    hasEmptyOption() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.solution[i][j] > -1 && this.option[i][j] == -1) {
            return true;
          }
        }
      }
      return false;
    },
    image_uploaded() {
      this.image = document.getElementById("fileinput").files[0];
      this.imageURL = URL.createObjectURL(this.image);
    },
    click_file() {
      document.getElementById("fileinput").click();
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
    store() {
      let datetime = new Date();
      let funct_ref = this.array_to_string;
      let newsolution = [];
      let newspecial = [];
      let newunnnumbered = [];
      let newoption = [];
      let newtop = [];
      let newbottom = [];
      let newleft = [];
      let newright = [];
      for (let i = 0; i < this.rows; i++) {
        newsolution.push([]);
        newspecial.push([]);
        newunnnumbered.push([]);
        newoption.push([]);
        newtop.push([]);
        newbottom.push([]);
        newleft.push([]);
        newright.push([]);
        for (let j = 0; j < this.columns; j++) {
          newsolution[i].push(this.solution[i][j]);
          newspecial[i].push(this.is_special[i][j]);
          newunnnumbered[i].push(this.unnumbered[i][j]);
          newoption[i].push(this.option[i][j]);
          newtop[i].push(this.border_top[i][j]);
          newbottom[i].push(this.border_bottom[i][j]);
          newleft[i].push(this.border_left[i][j]);
          newright[i].push(this.border_right[i][j]);
        }
      }
      let newletters = [];
      let newlettersrevealed = [];
      for (let i = 0; i < this.num_letters; i++) {
        newletters.push(this.letters[i]);
        newlettersrevealed.push(this.letters_revealed[i]);
      }
      cryptogramsRef
        .add({
          solution: funct_ref(newsolution),
          is_special: funct_ref(newspecial),
          unnumbered: funct_ref(newunnnumbered),
          option: funct_ref(newoption),
          border_top: funct_ref(newtop),
          border_bottom: funct_ref(newbottom),
          border_left: funct_ref(newleft),
          border_right: funct_ref(newright),
          title: this.title,
          letters: funct_ref(newletters),
          letters_revealed: funct_ref(newlettersrevealed),
          description: this.description,
          author: this.user.uid,
          image: "",
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
          const reference = "cryptogram/" + some_id + "." + exstension;
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
              cryptogramsRef
                .doc(some_id)
                .update({
                  solution: funct_ref(newsolution),
                  is_special: funct_ref(newspecial),
                  unnumbered: funct_ref(newunnnumbered),
                  option: funct_ref(newoption),
                  border_top: funct_ref(newtop),
                  border_bottom: funct_ref(newbottom),
                  border_left: funct_ref(newleft),
                  border_right: funct_ref(newright),
                  title: this.title,
                  letters: funct_ref(newletters),
                  letters_revealed: funct_ref(newlettersrevealed),
                  description: this.description,
                  author: this.user.uid,
                  image: imageLocation,
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
                    this.$router.push("/search-cryptogram");
                  });
                });
            });
        });
    },
    modeChange(event) {
      /*this.use_mode = false
        this.use_option = false
        switch (event.code) {
            case "Enter":
                this.option_number++
                if (this.option_number >= 3) {
                    this.option_number = -1
                }
                this.use_option = true;break;
            case "Backspace":
                this.option_number--
                if (this.option_number <= -2) {
                    this.option_number = 2
                }
                this.use_option = true;break;
            case "ArrowUp":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                this.use_mode = true;break;
            case "ArrowDown": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                this.use_mode = true;break;
            case "ArrowRight":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                this.use_mode = true;break;
            case "ArrowLeft": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                this.use_mode = true;break;
            case "KeyW":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                this.use_mode = true;break;
            case "KeyS": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                this.use_mode = true;break;
            case "KeyD":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                this.use_mode = true;break;
            case "KeyA": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                this.use_mode = true;break;
            case "Digit0": 
                this.mode = 0
                this.use_mode = true;break; 
            case "Digit1": 
                if (this.num_letters > 1) {
                    this.mode = 1
                }
                this.use_mode = true;break; 
            case "Digit2": 
                if (this.num_letters > 2) {
                    this.mode = 2
                }
                this.use_mode = true;break; 
            case "Digit3": 
                if (this.num_letters > 3) {
                    this.mode = 3
                }
                this.use_mode = true;break; 
            case "Digit4": 
                if (this.num_letters > 4) {
                    this.mode = 4
                }
                this.use_mode = true;break; 
            case "Digit5": 
                if (this.num_letters > 5) {
                    this.mode = 5
                }
                this.use_mode = true;break; 
            case "Digit6": 
                if (this.num_letters > 6) {
                    this.mode = 6
                }
                this.use_mode = true;break; 
            case "Digit7": 
                if (this.num_letters > 7) {
                    this.mode = 7
                }
                this.use_mode = true;break; 
            case "Digit8": 
                if (this.num_letters > 8) {
                    this.mode = 8
                }
                this.use_mode = true;break; 
            case "Digit9": 
                if (this.num_letters > 9) {
                    this.mode = 9
                }
                this.use_mode = true;break; 
        }*/
    },
    choose_reset_type() {
      if (this.value_to_randomize == "numbers") {
        this.resetNumbers();
      }
      if (this.value_to_randomize == "letters") {
        this.resetLetters();
      }
      if (this.value_to_randomize == "values") {
        this.resetOptions();
      }
    },
    choose_random_type() {
      if (this.value_to_randomize == "numbers") {
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
      }
      if (this.value_to_randomize == "letters") {
        if (this.randomize_all == true) {
          this.randomize_letters();
        } else {
          this.fill_empty_letters();
        }
      }
      if (this.value_to_randomize == "values") {
        if (this.randomize_all == true) {
          this.randomize_option();
        } else {
          this.randomize_option_if_not_set();
        }
      }
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
    this.remove_max_letter();
    this.check_letter();
    if (this.$refs.lettersform) {
      for (let i = 0; i < this.$refs.lettersform.length; i++) {
        if (this.$refs.lettersform[i]) {
          this.$refs.lettersform[i].validate();
        }
      }
    }
  },
  beforeUpdate() {
    this.initialize();
    this.remove_max_letter();
    this.check_letter();
    if (this.$refs.lettersform) {
      for (let i = 0; i < this.$refs.lettersform.length; i++) {
        if (this.$refs.lettersform[i]) {
          this.$refs.lettersform[i].validate();
        }
      }
    }
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
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span> Broj redaka </span>
        </template>
        <!--<template #append>
          <va-input type="number" v-model="rows" :min="1" :max="50"/>
        </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="columns"
        :min="1"
        :max="50"
        track-label-visible
      >
        <template #label>
          <span> Broj stupaca </span>
        </template>
        <!--<template #append>
          <va-input type="number" v-model="columns" :min="1" :max="50"/>
        </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-slider
        class="trackMe"
        v-model="num_letters"
        @update:model-value="$forceUpdate()"
        :min="1"
        :max="Math.floor(alphabet.length / 3)"
        track-label-visible
      >
        <template #label>
          <span> Broj slova </span>
        </template>
        <!--<template #append>
          <va-input
            type="number"
            @update:model-value="$forceUpdate()"
            v-model="num_letters"
            :min="1"
            :max="Math.floor(alphabet.length / 3)"
         />
        </template>-->
      </va-slider>
    </div>
    <div class="myrow">
      <va-tabs v-model="mode">
        <template #tabs>
          <va-tab
            :name="-2"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            ?
          </va-tab>
          <va-tab
            :name="-1"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <span style="color: black"> Barijera </span>
          </va-tab>
          <va-tab
            :name="-3"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <span style="color: salmon"> Dio rješenja </span>
          </va-tab>
          <va-tab
            :name="-4"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_top" />
            &nbsp;Iscrtkano gore
          </va-tab>
          <va-tab
            :name="-5"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_bottom" />
            &nbsp;Iscrtkano dolje
          </va-tab>
          <va-tab
            :name="-6"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_left" />
            &nbsp;Iscrtkano lijevo
          </va-tab>
          <va-tab
            :name="-7"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <va-icon name="border_right" />
            &nbsp;Iscrtkano desno
          </va-tab>
          <va-tab
            :name="-8"
            @click="
              use_mode = true;
              use_option = false;
            "
          >
            <span style="color: orange">Sakrij broj</span>
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-tabs v-model="option_number">
        <template #tabs>
          <va-tab
            name="-1"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            Bez opcije
          </va-tab>
          <va-tab
            name="0"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            1. opcija
          </va-tab>
          <va-tab
            name="1"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            2. opcija
          </va-tab>
          <va-tab
            name="2"
            @click="
              use_mode = false;
              use_option = true;
            "
          >
            3. opcija
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-infinite-scroll disabled :load="() => {}">
        <div>
          <table style="display: inline-table">
            <tr>
              <td>
                <va-chip
                  style="
                    width: 140px;
                    min-width: 140px;
                    max-width: 140px;
                    margin-left: 10px;
                  "
                  >Broj slova</va-chip
                >
              </td>
              <td v-for="i in num_letters" v-bind:key="i">
                <va-chip
                  style="
                    width: 140px;
                    min-width: 140px;
                    max-width: 140px;
                    margin-left: 10px;
                  "
                >
                  {{ i - 1 }}. slovo</va-chip
                >
                <br />
                <br />
              </td>
            </tr>
            <tr v-for="j in 3" v-bind:key="j">
              <td>
                <va-chip
                  style="
                    width: 140px;
                    min-width: 140px;
                    max-width: 140px;
                    margin-left: 10px;
                  "
                >
                  {{ j }}. opcija</va-chip
                >
              </td>
              <td v-for="i in num_letters" v-bind:key="i">
                <va-form ref="lettersform">
                  <va-input
                    class="mb-4"
                    @click="mode = i - 1"
                    @update:model-value="check_letter()"
                    v-model="letters[i - 1][j - 1]"
                    style="
                      width: 140px;
                      min-width: 140px;
                      max-width: 140px;
                      margin-left: 10px;
                    "
                    type="text"
                    :label="'' + (i - 1) + ' (' + j + ')'"
                    immediate-validation
                    :rules="[
                      (value) => {
                        if (check_duplicated(i - 1, j - 1) == 1) {
                          if (alphabet.includes(value)) {
                            return 'Slovo je udvostručeno.';
                          } else {
                            return 'Slovo je udvostručeno i nije u abecedi.';
                          }
                        } else {
                          if (alphabet.includes(value)) {
                            return true;
                          } else {
                            return 'Slovo nije u abecedi.';
                          }
                        }
                      },
                    ]"
                  >
                    <template #append>
                      &nbsp;&nbsp;
                      <va-icon
                        style="margin-left: 10px; display: inline-block"
                        name="visibility_off"
                        v-if="letters_revealed[i - 1][j - 1] == 0"
                        @click="letters_revealed[i - 1][j - 1] = 1"
                      />
                      <va-icon
                        style="margin-left: 10px; display: inline-block"
                        name="visibility"
                        v-if="letters_revealed[i - 1][j - 1] == 1"
                        @click="letters_revealed[i - 1][j - 1] = 0"
                      />
                      &nbsp;&nbsp;
                    </template>
                  </va-input>
                </va-form>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="myrow">
      <va-tabs v-model="value_to_randomize">
        <template #tabs>
          <va-tab name="letters"> Slova </va-tab>
          <va-tab name="numbers"> Brojevi </va-tab>
          <va-tab name="values"> Opcije </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
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
            &nbsp;Odaberi nasumično
          </va-tab>
          <va-tab @click="choose_reset_type()">
            <va-icon name="delete" />
            &nbsp;Izbriši
          </va-tab>
        </template>
      </va-tabs>
    </div>
    <div class="myrow">
      <va-chip v-if="current_x != null && current_y != null"
        >({{ current_x }}, {{ current_y }})</va-chip
      >
    </div>
    <div class="myrow" style="max-height: 500px">
      <va-infinite-scroll disabled :load="() => {}">
        <div class="myrow">
          <table class="numbers_table">
            <tr v-for="i in rows" v-bind:key="i">
              <td
                v-for="j in columns"
                v-bind:key="j"
                @mouseover="
                  current_x = i;
                  current_y = j;
                "
                @click="change_number(i - 1, j - 1)"
                :class="{
                  unnumbered: unnumbered[i - 1][j - 1] == 1,
                  black: solution[i - 1][j - 1] == -1,
                  special: is_special[i - 1][j - 1] == 1,
                  bordertop: border_top[i - 1][j - 1] == 1,
                  borderbottom: border_bottom[i - 1][j - 1] == 1,
                  borderleft: border_left[i - 1][j - 1] == 1,
                  borderright: border_right[i - 1][j - 1] == 1,
                }"
              >
                <div>
                  <sup
                    v-if="
                      solution[i - 1][j - 1] != -2 &&
                      solution[i - 1][j - 1] != -1
                    "
                  >
                    {{ solution[i - 1][j - 1] }}
                  </sup>
                  &nbsp;
                  <span
                    v-if="
                      solution[i - 1][j - 1] != -2 &&
                      solution[i - 1][j - 1] != -1 &&
                      option[i - 1][j - 1] != -1
                    "
                  >
                    {{ letters[solution[i - 1][j - 1]][option[i - 1][j - 1]] }}
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </va-infinite-scroll>
    </div>
    <div class="myrow" v-if="hasEmpty()">
      <va-alert
        style="white-space: pre-wrap"
        color="danger"
        title="Prazne ćelije"
        center
        class="mb-4"
      >
        Neke ćelije nemaju dodijeljen broj slova.
      </va-alert>
    </div>
    <div class="myrow" v-if="hasEmptyOption()">
      <va-alert
        style="white-space: pre-wrap"
        color="danger"
        title="Slova bez opcije"
        center
        class="mb-4"
      >
        Neka slova u ćelijama nemaju dodijeljen broj opcije.
      </va-alert>
    </div>
    <div class="myrow">
      <va-button
        style="display: inline-block; overflow-wrap: anywhere"
        @click="click_file()"
      >
        <span v-if="this.imageURL != ''">
          {{ this.imageURL }}
        </span>
        <span v-else
          ><va-icon name="photo" />
          &nbsp;Odaberi sliku
        </span>
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
        :disabled="
          !(
            !letter_alert &&
            !hasEmpty() &&
            !hasEmptyOption() &&
            image &&
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

<style>
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
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
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
.unnumbered {
  background-color: orange !important;
}
.bordertop {
  border-top: dashed !important;
}
.borderbottom {
  border-bottom: dashed !important;
}
.borderleft {
  border-left: dashed !important;
}
.borderright {
  border-right: dashed !important;
}
</style>
