<script> 
import { ref, uploadBytes } from "firebase/storage"
import { projectStorage } from "../main.js"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import Navbar from './Navbar.vue'
import { usersRef } from "../main.js"
import { cryptogramsRef } from "../main.js"

export default {
  components: {
    Navbar
  },
  data() {
      return {
        user: null,
        permissions: [],
        image: null,
        imageURL: "",
        permissionsUserRecords: [],
        collaborator: "",
        description: '',
        source: '',
        title: "",
        is_public: false,
        solution: [[]],
        is_special: [[]],
        border_top: [[]],
        border_bottom: [[]],
        border_left: [[]],
        border_right: [[]],
        num_letters: 1,
        rows: 1,
        columns: 1,
        mode: -2,
        letter_alert: "",
        alphabet: ["A", "B", "C", "Č", "Ć", "D", "Đ", "DŽ", "E", "F", "G", "H", "I", "J", "K", "L", "LJ", "M", "N", "NJ", "O", "P", "R", "S", "Š", "T", "U", "V", "W", "X", "Y", "Z", "Ž"],
        letters: [],
      }
  },
  methods: {
      checkIfUserExists() {  
          let email = this.collaborator
          let found = false
          let uid = ""
          let displayName = ""
          if (this.user.email == email) {
              this.$refs.me_collaborator.show()
          } else { 
            usersRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let some_email = childSnapshot.get("email"); 
                    if (email == some_email) {
                        found = true
                        uid = childSnapshot.id
                        displayName = childSnapshot.get("displayName")
                    }
                });
            }).then(() => {  
                if (found == true) {
                    let duplicate = false
                    for (let i = 0; i < this.permissions.length; i++) {  
                        if (this.permissions[i] == uid) {
                            duplicate = true
                            break
                        }
                    } 
                    if (duplicate == true) {
                        this.$refs.duplicate_collaborator.show()
                    } else {
                        this.permissions.push(uid)
                        this.permissionsUserRecords.push({"displayName": displayName, "email": email})
                    }
                } else {
                    this.$refs.no_collaborator.show()
                }
            })  
          }
      }, 
      initialize() {
          this.rows = parseInt(this.rows)
          this.columns = parseInt(this.columns)
          let oldsolution = []
          let oldisspecial = [] 
          let oldtop = [] 
          let oldbottom = [] 
          let oldleft = [] 
          let oldright = [] 
          let maxcol = this.columns
          let maxrow = this.rows
          if (this.solution) {
               oldsolution = this.solution;
               oldisspecial = this.is_special; 
               oldtop = this.border_top; 
               oldbottom = this.border_bottom; 
               oldleft = this.border_left; 
               oldright = this.border_right; 
               if (oldsolution.length > maxrow) {
                   maxrow = oldsolution.length
               }
               if (oldsolution[0].length > maxcol) {
                   maxcol = oldsolution[0].length
               }
          }
          this.solution = []
          this.is_special = []  
          this.border_top = []; 
          this.border_bottom = []; 
          this.border_left = []; 
          this.border_right = []; 
          for (let i = 0; i < maxrow; i++) {
              let solution_row = []
              let special_row = [] 
              this.border_top.push([])
              this.border_bottom.push([])
              this.border_left.push([])
              this.border_right.push([])
              for (let j = 0; j < maxcol; j++) { 
                    if (oldsolution[i]) {
                        if (oldsolution[i].length > j) {
                            solution_row.push(oldsolution[i][j])
                            special_row.push(oldisspecial[i][j])
                            this.border_top[i].push(oldtop[i][j])  
                            this.border_bottom[i].push(oldbottom[i][j]) 
                            this.border_left[i].push(oldleft[i][j]) 
                            this.border_right[i].push(oldright[i][j]) 
                        } else {
                            solution_row.push(-2)
                            special_row.push(0) 
                            this.border_top[i].push(0)  
                            this.border_bottom[i].push(0) 
                            this.border_left[i].push(0) 
                            this.border_right[i].push(0) 
                        }
                    }  else {
                        solution_row.push(-2)
                        special_row.push(0) 
                        this.border_top[i].push(0)  
                        this.border_bottom[i].push(0) 
                        this.border_left[i].push(0) 
                        this.border_right[i].push(0) 
                    }
              }
              this.solution.push(solution_row)
              this.is_special.push(special_row) 
              for (let j = 0; j < maxcol; j++) {
                if (oldsolution[i]) {
                    if (oldsolution[i].length > j) {
                        this.solution[i][j] = oldsolution[i][j]
                        this.is_special[i][j] = oldisspecial[i][j] 
                    }
                }
              }
          } 
          let oldletters = [] 
          let maxletters = this.num_letters
          if (this.letters) {
               oldletters = this.letters; 
               if (oldletters.length > maxletters) {
                   maxletters = oldletters.length
               } 
          } 
          this.letters = [];
          for (let i = 0; i < maxletters; i++) {
                if (oldletters.length > i) {
                    this.letters.push(oldletters[i])
                } else {
                    this.letters.push("")
                }
          } 
      },
        delay(operation, delay) {
            return new Promise(resolve => {
                setTimeout(() => {
                resolve(operation);
                }, delay);
            });
        },
        async new_async(operation, delay) {
            await this.delay(operation, delay);
        },
        randomize() {
            this.solution = []
            for (let i = 0; i < this.rows; i++) {
                let solution_row = []
                for (let j = 0; j < this.columns; j++) {
                    if (this.is_special[i][j] == 1) {
                        solution_row.push(Math.floor(Math.random() * this.num_letters))
                    } else {
                        solution_row.push(Math.floor(Math.random() * (this.num_letters + 1)) - 1)
                    }
                }
                this.solution.push(solution_row)
            } 
        },
        randomize_keep_black() {
            let new_values = []
            for (let i = 0; i < this.rows; i++) {
                let solution_row = []
                for (let j = 0; j < this.columns; j++) {
                    if (this.solution[i][j] == -1) {
                        solution_row.push(-1)
                    } else {
                        solution_row.push(Math.floor(Math.random() * this.num_letters))
                    }
                }
                new_values.push(solution_row)
            }
            this.solution = new_values 
        },
        fill_empty() {
            let new_values = []
            for (let i = 0; i < this.rows; i++) {
                let solution_row = []
                for (let j = 0; j < this.columns; j++) {
                    if (this.solution[i][j] == -2) {
                    if (this.is_special[i][j] == 1) {
                        solution_row.push(Math.floor(Math.random() * this.num_letters))
                    } else {
                        solution_row.push(Math.floor(Math.random() * (this.num_letters + 1)) - 1)
                    }
                    } else {
                        solution_row.push(this.solution[i][j])
                    }
                }
                new_values.push(solution_row)
            }
            this.solution = new_values 
        },
        fill_empty_keep_black() {
            let new_values = []
            for (let i = 0; i < this.rows; i++) {
                let solution_row = []
                for (let j = 0; j < this.columns; j++) {
                    if (this.solution[i][j] == -2) {
                        solution_row.push(Math.floor(Math.random() * this.num_letters))
                    } else {
                        solution_row.push(this.solution[i][j])
                    }
                }
                new_values.push(solution_row)
            }
            this.solution = new_values 
        },
        resetNumbers() {
            let new_values = []
            for (let i = 0; i < this.rows; i++) {
                let solution_row = []
                for (let j = 0; j < this.columns; j++) {
                    solution_row.push(-2)
                }
                new_values.push(solution_row)
            }
            this.solution = new_values 
        },
        resetLetters() {
            this.letters = [] 
            for (let i = 0; i < this.num_letters; i++) {
                this.letters.push("")
            }
        },
        randomize_letters() { 
            this.letters = [] 
            for (let i = 0; i < this.num_letters; i++) {
                let random_index = Math.floor(Math.random() * this.alphabet.length)
                while (this.letters.includes(this.alphabet[random_index])) {
                    random_index = Math.floor(Math.random() * this.alphabet.length)    
                } 
                this.letters.push(this.alphabet[random_index])
            }
            this.$forceUpdate()
        },
        fill_empty_letters() { 
            for (let i = 0; i < this.num_letters; i++) {
                if (this.alphabet.includes(this.letters[i])) { 
                    continue
                }
                let random_index = Math.floor(Math.random() * this.alphabet.length)
                while (this.letters.includes(this.alphabet[random_index])) {
                    random_index = Math.floor(Math.random() * this.alphabet.length)    
                } 
                this.letters[i] = this.alphabet[random_index]
            }
            this.$forceUpdate()
        },
        check_letter() {
            this.letter_alert = ""  
            for (let i = 0; i < this.num_letters; i++) {  
                this.letters[i] = this.letters[i].toUpperCase()
                if (!this.alphabet.includes(this.letters[i])) {
                    if (this.letter_alert != "") {
                        this.letter_alert += " "
                    }
                    this.letter_alert += (i) + ". slovo (" + this.letters[i] + ") nije u zadanoj abecedi."
                } 
            }
            for (let i = 0; i < this.num_letters; i++) { 
                for (let j = i + 1; j < this.num_letters; j++) { 
                    if (this.letters[i] == this.letters[j]) {
                        if (this.letter_alert != "") {
                            this.letter_alert += " "
                        }
                        this.letter_alert += (i) + ". slovo (" + this.letters[i] + ") i " + (j) + " slovo (" + this.letters[j] + ") je jednako."
                    }
                }
            }
            this.$forceUpdate()
        },
        change_number(x, y) {
            if (this.mode <= -4) { 
                if (this.solution[x][y] == -1) { 
                    return
                }
                if (this.mode == -4 && x != 0 && this.solution[x - 1][y] != -1) {
                    this.border_top[x][y] = (this.border_top[x][y] + 1) % 2
                    this.border_bottom[x - 1][y] = (this.border_bottom[x - 1][y] + 1) % 2
                }
                if (this.mode == -5 && x != this.rows - 1 && this.solution[x + 1][y] != -1) { 
                    this.border_bottom[x][y] = (this.border_bottom[x][y] + 1) % 2
                    this.border_top[x + 1][y] = (this.border_top[x + 1][y] + 1) % 2
                }
                if (this.mode == -6 && y != 0 && this.solution[x][y - 1] != -1) { 
                    this.border_left[x][y] = (this.border_left[x][y] + 1) % 2
                    this.border_right[x][y - 1] = (this.border_right[x][y - 1] + 1) % 2
                }
                if (this.mode == -7 && y != this.columns - 1 && this.solution[x][y + 1] != -1) {
                    this.border_right[x][y] = (this.border_right[x][y] + 1) % 2
                    this.border_left[x][y + 1] = (this.border_left[x][y + 1] + 1) % 2
                }
                this.$forceUpdate()
                return
            }
            if (this.mode == -3) {
                if (this.solution[x][y] == -1) {
                    this.$refs.special_barrier.show()
                } else {
                    this.is_special[x][y] = (this.is_special[x][y] + 1) % 2
                }
            } else {
                if (this.mode == -1) {
                    if (this.is_special[x][y] == 1) {
                        this.$refs.barrier_special.show()
                    } else {
                        this.solution[x][y] = this.mode
                        this.border_bottom[x][y] = 0
                        this.border_top[x][y] = 0
                        this.border_left[x][y] = 0
                        this.border_right[x][y] = 0    
                        if (x != 0) {
                            this.border_bottom[x - 1][y] = 0
                        }
                        if (x != this.rows - 1) {
                            this.border_top[x + 1][y] = 0
                        }
                        if (y != 0) {
                            this.border_right[x][y - 1] = 0
                        }
                        if (y != this.columns - 1) {
                            this.border_left[x][y + 1] = 0
                        }
                    }
                } else {
                    this.solution[x][y] = this.mode
                    this.border_bottom[x][y] = 0
                    this.border_top[x][y] = 0
                    this.border_left[x][y] = 0
                    this.border_right[x][y] = 0    
                    if (x != 0) {
                        this.border_bottom[x - 1][y] = 0
                    }
                    if (x != this.rows - 1) {
                        this.border_top[x + 1][y] = 0
                    }
                    if (y != 0) {
                        this.border_right[x][y - 1] = 0
                    }
                    if (y != this.columns - 1) {
                        this.border_left[x][y + 1] = 0
                    }
                }
            }
        },
        hasEmpty() { 
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    if (!(this.solution[i][j] >= -1 && this.solution[i][j] < this.num_letters)) {
                        return true
                    }
                }
            }
            return false
        },
        image_uploaded() { 
            this.image = document.getElementById("fileinput").files[0] 
            this.imageURL = URL.createObjectURL(this.image) 
        }, 
        click_file() { 
            document.getElementById("fileinput").click();  
        },
      array_to_string(array) {
          let string = "["
          for (let i = 0; i < array.length; i++) {
              if (i != 0) {
                  string += ","
              }
              string += "[" 
              for (let j = 0; j < array[i].length; j++) {
                if (j != 0) {
                  string += "\\,"
                }
                string += array[i][j]
              }
              string += "]"
          }
          return string + "]"
        },
        store() {
            let datetime = new Date()
            let funct_ref = this.array_to_string
            let newsolution = []
            let newspecial = []
            let newtop = []
            let newbottom = []
            let newleft = []
            let newright = []
            for (let i = 0; i < this.rows; i++) {
                newsolution.push([])
                newspecial.push([])
                newtop.push([])
                newbottom.push([])
                newleft.push([])
                newright.push([])
                for (let j = 0; j < this.columns; j++) {
                    newsolution[i].push(this.solution[i][j])
                    newspecial[i].push(this.is_special[i][j])
                    newtop[i].push(this.border_top[i][j])
                    newbottom[i].push(this.border_bottom[i][j])
                    newleft[i].push(this.border_left[i][j])
                    newright[i].push(this.border_right[i][j])
                }
            }
            let newletters = []
            for (let i = 0; i < this.num_letters; i++) {
                newletters.push(this.letters[i])
            }   
            cryptogramsRef.add({
                    solution: funct_ref(newsolution),
                    is_special: funct_ref(newspecial), 
                    border_top: funct_ref(newtop), 
                    border_bottom: funct_ref(newbottom), 
                    border_left: funct_ref(newleft), 
                    border_right: funct_ref(newright), 
                    title: this.title,
                    letters: newletters,
                    description: this.description,
                    author: this.user.uid,
                    image: "",
                    updater: this.user.uid,
                    is_public: this.is_public,
                    permissions: this.permissions,
                    source: this.source,
                    time_created: datetime,
                    last_updated: datetime,
            }).then((docRef) => {
                    let some_id = docRef.id  
                    let exstension = this.image.name.split('.')[this.image.name.split('.').length - 1]
                    const reference = 'cryptogram/' + some_id + "."  + exstension; 
                    const storageRef = ref(projectStorage, reference);
                        const metadata = {
                        contentType: 'image/' + exstension
                    };
                    // 'file' comes from the Blob or File API 
                    uploadBytes(storageRef, this.image, metadata).then((snapshot) => {  
                    })
                    .catch((error) => {  
                    }).then(() => {
                        let imageLocation = reference 
                        cryptogramsRef.doc(some_id).update({
                            solution: funct_ref(newsolution),
                            is_special: funct_ref(newspecial), 
                            border_top: funct_ref(newtop), 
                            border_bottom: funct_ref(newbottom), 
                            border_left: funct_ref(newleft), 
                            border_right: funct_ref(newright), 
                            title: this.title,
                            letters: newletters,
                            description: this.description,
                            author: this.user.uid,
                            image: imageLocation,
                            updater: this.user.uid,
                            is_public: this.is_public,
                            permissions: this.permissions,
                            source: this.source,
                            time_created: datetime,
                            last_updated: datetime,
                        }).then(() => {this.new_async(this.$refs.store_success.show(), 1000).then(() => {this.$router.push("/searchcryptogram")}) })
                    })
            }) 
        }, 
    modeChange(event) {
        switch (event.code) {
            case "ArrowUp":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                break;
            case "ArrowDown": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                break;
            case "ArrowRight":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                break;
            case "ArrowLeft": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                break;
            case "KeyW":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                break;
            case "KeyS": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                break;
            case "KeyD":
                this.mode++
                if (this.mode >= this.num_letters) {
                    this.mode = -7
                }
                break;
            case "KeyA": 
                this.mode--
                if (this.mode < -7) {
                    this.mode = this.num_letters - 1
                }
                break;
            case "Digit0": 
                this.mode = 0
                break; 
            case "Digit1": 
                if (this.num_letters > 1) {
                    this.mode = 1
                }
                break; 
            case "Digit2": 
                if (this.num_letters > 2) {
                    this.mode = 2
                }
                break; 
            case "Digit3": 
                if (this.num_letters > 3) {
                    this.mode = 3
                }
                break; 
            case "Digit4": 
                if (this.num_letters > 4) {
                    this.mode = 4
                }
                break; 
            case "Digit5": 
                if (this.num_letters > 5) {
                    this.mode = 5
                }
                break; 
            case "Digit6": 
                if (this.num_letters > 6) {
                    this.mode = 6
                }
                break; 
            case "Digit7": 
                if (this.num_letters > 7) {
                    this.mode = 7
                }
                break; 
            case "Digit8": 
                if (this.num_letters > 8) {
                    this.mode = 8
                }
                break; 
            case "Digit9": 
                if (this.num_letters > 9) {
                    this.mode = 9
                }
                break; 
        }
    } 
  },
    created() { 
      window.addEventListener('keyup', this.modeChange);
    },
    beforeDestroy() {
      window.removeEventListener('keyup', this.modeChange);
    },
  beforeMount() {
      this.initialize() 
  }, 
  beforeUpdate() {
      this.initialize() 
      this.check_letter()
  },  
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User 
        this.user = user
        // ...
      } else {
        // User is signed out
        // ... 
      }
    });
  }
}
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">   
    <div class="myrow">
        <va-slider v-model="rows" :min="1" :max="50" track-label-visible>
            <template #label>
                <span>Broj redaka</span>
            </template>
            <template #append>
                <va-input type="number" v-model="rows" :min="1" :max="50"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="columns" :min="1" :max="50" track-label-visible>
            <template #label>
                <span>Broj stupaca</span>
            </template>
            <template #append>
                <va-input type="number" v-model="columns" :min="1" :max="50"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="num_letters" @focusout="update_order=false;" :min="1" :max="alphabet.length" track-label-visible>
            <template #label>
                <span>Broj slova</span>
            </template>
            <template #append>
                <va-input type="num_letters" v-model="num_letters" :min="1" :max="alphabet.length"/>
            </template>
        </va-slider>
    </div> 
    <br>  
    <div class="myrow" v-if="letter_alert">
        <va-alert style="white-space: pre-wrap;" color="warning" title="Udvostručena i nedozvoljena slova" center class="mb-4">
            {{letter_alert}}
        </va-alert> 
    </div> 
    <div class="myrow"> 
            <va-input
                class="mb-4" v-for="i in (num_letters)" v-bind:key="i" @click="mode=i - 1"
                v-model="letters[i - 1]" style="margin-left: 1%;width:60px; height:48px;display: inline-block"
                type="text"
                :label="'' + (i-1) + ''"
                :min-rows="3"
                :max-rows="5"
            />
            <va-button style="margin-left: 1%;margin-top: 1%" @click="mode=-2">?</va-button>
            <va-button @click="mode=-1" style="background-color: black;margin-left: 1%;margin-top: 1%">Barijera</va-button>
            <va-button @click="mode=-3" style="background-color: salmon;margin-left: 1%;margin-top: 1%">Dio rješenja</va-button>&nbsp;
    </div>  
    <div class="myrow">
            <table class="numbers_table"><tr><td class="bordertop" @click="mode=-4"></td></tr></table>&nbsp;
            <table class="numbers_table"><tr><td class="borderbottom" @click="mode=-5"></td></tr></table>&nbsp;   
            <table class="numbers_table"><tr><td class="borderleft" @click="mode=-6"></td></tr></table>&nbsp;   
            <table class="numbers_table"><tr><td class="borderright" @click="mode=-7"></td></tr></table>&nbsp; 
    </div> 
    <br>
    <div class="myrow">
            <va-button style="margin-left: 1%;margin-top: 1%" @click="fill_empty_letters()">Nadopuni prazna slova</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="randomize_letters()">Odaberi nasumična slova</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="randomize_keep_black()">Odaberi nasumične brojeve i zadrži barijere</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="randomize()">Odaberi nasumične brojeve i promijeni barijere</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="fill_empty_keep_black()">Nadopuni samo prazna polja i zadrži barijere</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="fill_empty()">Nadopuni samo prazna polja i promijeni barijere</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="resetNumbers()">Resetiraj brojeve</va-button>
            <va-button style="margin-left: 1%;margin-top: 1%" @click="resetLetters()">Resetiraj slova</va-button>
    </div> 
    <br>
    <div class="myrow">
        <table class="numbers_table">
            <tr v-for="i in (rows)" v-bind:key="i">
                <td v-for="j in (columns)" v-bind:key="j" @click="change_number(i-1,j-1)" 
                :class="{black: solution[i - 1][j - 1] == -1, special: is_special[i - 1][j - 1] == 1,
                bordertop: border_top[i - 1][j - 1] == 1, borderbottom: border_bottom[i - 1][j - 1] == 1,
                borderleft: border_left[i - 1][j - 1] == 1, borderright: border_right[i - 1][j - 1] == 1,}">
                        <div>
                            <span v-if="solution[i - 1][j - 1] == -2 || solution[i - 1][j - 1] == -1"></span>
                            <span v-else><sup>{{solution[i - 1][j - 1]}}</sup>&nbsp;{{letters[solution[i - 1][j - 1]]}}</span>
                        </div>
                </td>
            </tr>
        </table> 
    </div>  
    <div class="myrow" v-if="hasEmpty()">
        <va-alert style="white-space: pre-wrap;" color="warning" title="Prazne ćelije" center class="mb-4">
            Neke ćelije nemaju dodijeljen broj slova.
        </va-alert> 
    </div>    
    <div class="myrow">
            <va-button style="display:inline-block;overflow-wrap:anywhere" @click="click_file()">   
                    <span v-if="this.imageURL != ''">
                        {{this.imageURL}}</span><span  v-else>Odaberi sliku
                    </span>
            </va-button>  
            <input file-types="image/*" type="file" id="fileinput" style="display: none;visibility: hidden;width:0%"  @input="image_uploaded()"/> 
    </div>  
    <div class="myrow" v-if="image">
        <img id='img' :src="imageURL"  alt="No image" style="width:50%">
    </div>  
    <div class="myrow" v-if="!image">
        <va-alert style="white-space: pre-wrap;" color="warning" title="Prazna slika" center class="mb-4">
            Niste dodali sliku uz zagonetku.
        </va-alert> 
    </div>   
    <div class="myrow">
        <va-input
            class="mb-4"
            v-model="title"
            type="text"
            label="Naslov zagonetke" 
        />
        <va-input
            class="mb-4"
            v-model="description"
            type="textarea"
            label="Opis zagonetke"
            :min-rows="3"
            :max-rows="5"
        />
        <va-input
            class="mb-4"
            v-model="source"
            type="textarea"
            label="Izvor zagonetke"
            :min-rows="3"
            :max-rows="5"
        />
    </div> 
    <div class="myrow"> 
        Dozvola uređivanja
        <va-switch style="display: inline-block;margin-left: 1%;margin-top: 1%" v-model="is_public" true-inner-label="Svi" false-inner-label="Samo suradnici" class="mr-4" /> 
        <va-input style="display: inline-block;margin-left: 1%;margin-top: 1%" type="text" v-model="collaborator" placeholder="Email adresa" label="Email adresa suradnika">
            <template #append> 
                <va-icon @click="checkIfUserExists();$forceUpdate()" color="primary" class="mr-4" name="add_circle"/>   
            </template>
        </va-input> 
    </div>
    <div class="myrow">  
            Suradnici: 
            <va-chip style="display: inline-block;margin-left: 1%;margin-top: 1%" 
            v-for="(permission, i) in permissionsUserRecords" :key="i">
                <va-icon style="display: inline-block" @click="permissions.splice(i,1)" name="clear" class="mr-2"/>
                {{permission.displayName}} ({{permission.email}})
            </va-chip> 
    </div>
    <div v-if="!letter_alert && !hasEmpty() && image" class="myrow"> 
        <va-button @click="store()">Spremi zagonetku</va-button>  
    </div>       
    <va-modal ref="barrier_special" hide-default-actions message="Polje koje je dio rješenja ne može biti barijera." stateful />  
    <va-modal ref="special_barrier" hide-default-actions message="Barijera ne može biti dio rješenja." stateful />  
    <va-modal ref="no_user" hide-default-actions message="Ne možete kreirati zagonetku jer niste prijavljeni." stateful />
    <va-modal ref="store_success" hide-default-actions message="Nova zagonetka je uspješno spremljena." stateful />
    <va-modal ref="no_collaborator" hide-default-actions message="Ne možete dodati suradnika jer ne postoji korisnik s tom email adresom." stateful />
    <va-modal ref="me_collaborator" hide-default-actions message="Ne možete dodati samog sebe kao suradnika." stateful />
    <va-modal ref="duplicate_collaborator" hide-default-actions message="Ne možete dodati istu osobu kao suradnika dvaput." stateful />
  </body>
</template>

<style>
.numbers_table { 
    display: inline-table;
    border: 1px solid black;
    border-collapse: collapse
}
.numbers_table tr {
    border: 1px solid black;
    border-collapse: collapse
}
.numbers_table td {
    border: 1px solid black;
    width: 48px;
    height: 48px;
    text-align: center;
    vertical-align: middle;
    border-collapse: collapse
}
.black {
    background-color: black;
}
.special {
    background-color: salmon;
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
