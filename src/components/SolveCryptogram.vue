<script> 
import { ref, getDownloadURL  } from "firebase/storage";
import { cryptogramsRecordsRef, projectStorage } from "../main.js"
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
        time_elapsed: 0,
        show_error: false,
        author: "",  
        authorUserRecord: {displayName: "", email: ""}, 
        time_created: '',
        last_updated: '',
        updater: "",
        updaterUserRecord: {displayName: "", email: ""}, 
        permission_to_edit_visibility: false,
        cheat: false,
        victory: false,
        values: [],
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
        num_letters: 1,
        rows: 1,
        columns: 1, 
        letter_alert: "",
        alphabet: ["A", "B", "C", "Č", "Ć", "D", "Đ", "DŽ", "E", "F", "G", "H", "I", "J", "K", "L", "LJ", "M", "N", "NJ", "O", "P", "R", "S", "Š", "T", "U", "V", "Z", "Ž", "X", "Y", "Z"],
        letters: [],
      }
  },
  methods: {
      shuffleOrder() {
          let new_order = [] 
          let old_letters = []  
          for (let i = 0; i < this.num_letters; i++) { 
              old_letters.push(this.letters[i])
              let new_index = Math.floor(Math.random() * this.num_letters)
              while (new_order.includes(new_index)) {
                new_index = Math.floor(Math.random() * this.num_letters)
              }
              new_order.push(new_index)
          }
          for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                for (let l = 0; l < this.num_letters; l++) {
                    if (this.solution[i][j] == l) {
                        this.solution[i][j] = new_order[l]
                        break
                    }
                }
            }
          }
          for (let i = 0; i < this.num_letters; i++) { 
              this.letters[new_order[i]] = old_letters[i]
          }
      },
      getAuthorUserRecord() { 
        let some_id = this.author
        let newRecord = {}
        usersRef.get(some_id).then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let id = childSnapshot.id; 
                if (id == some_id) {
                    newRecord = {displayName: childSnapshot.get('displayName'), email: childSnapshot.get('email')}
                }
            });
        }).then(() => { 
            this.authorUserRecord = newRecord
        }) 
    },
      getUpdaterUserRecord() { 
        let some_id = this.updater
        let newRecord = {}
        usersRef.get(some_id).then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let id = childSnapshot.id; 
                if (id == some_id) {
                    newRecord = {displayName: childSnapshot.get('displayName'), email: childSnapshot.get('email')}
                }
            });
        }).then(() => { 
            this.updaterUserRecord = newRecord
        }) 
      },
      getCollaboratorUserRecord() { 
          this.permissionsUserRecords = []
          for (let i = 0; i < this.permissions.length; i++) {
            let some_id = this.permissions[i]
            let newRecord = {}
            usersRef.get(some_id).then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let id = childSnapshot.id; 
                    if (id == some_id) {
                        newRecord = {displayName: childSnapshot.get('displayName'), email: childSnapshot.get('email')}
                    }
                });
            }).then(() => { 
                this.permissionsUserRecords.push(newRecord)
            }) 
          }  
      },  
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
          let maxcol = this.columns
          let maxrow = this.rows
          if (this.solution) {
               oldsolution = this.solution;
               oldisspecial = this.is_special; 
               
               if (oldsolution.length > maxrow) {
                   maxrow = oldsolution.length
               }
               if (oldsolution[0].length > maxcol) {
                   maxcol = oldsolution[0].length
               }
          }
          this.solution = []
          this.is_special = []  
          for (let i = 0; i < maxrow; i++) {
              let solution_row = [] 
              let special_row = [] 
              for (let j = 0; j < maxcol; j++) { 
                    if (oldsolution[i]) {
                        if (oldsolution[i].length > j) {
                            solution_row.push(oldsolution[i][j])
                            special_row.push(oldisspecial[i][j]) 
                        } else {
                            solution_row.push(-2)
                            special_row.push(0) 
                        }
                    }  else {
                        solution_row.push(-2)
                        special_row.push(0) 
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
          this.values = []
          for (let i = 0; i < maxletters; i++) {
                if (oldletters.length > i) {
                    this.letters.push(oldletters[i])
                } else {
                    this.letters.push("")
                }
                this.values.push("")
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
        string_to_array(array_string) {
            if (!array_string) {
                return []
            }
            let array = array_string.substring(2, array_string.length - 2).split("],[")
            for (let i = 0; i < array.length; i++) {
                array[i] = array[i].split("\\,")
                for(let j = 0; j < array[i].length; j++) {
                    array[i][j] = array[i][j]
                }
            }
            return array 
        },
        fetch_puzzle() {
            let params_id= this.$route.params.id
            let string_solution = [] 
            let string_is_special = []
            let string_letters = ""
            let string_image = ""
            let string_title = ""
            let string_description = ""
            let string_author = ""
            let string_updater = ""
            let string_is_public = false
            let string_permissions = []
            let string_source = ""
            let string_time_created = ""
            let string_last_updated = ""
            let found = false
            let funct_ref = this.string_to_array
            cryptogramsRef.get(params_id).then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let id = childSnapshot.id;
                    if (id == params_id) {
                        string_solution = funct_ref(childSnapshot.get('solution'))
                        string_is_special = funct_ref(childSnapshot.get('is_special'))
                        string_letters = childSnapshot.get('letters') 
                        string_image = childSnapshot.get('image') 
                        string_title = childSnapshot.get('title')
                        string_description = childSnapshot.get('description')
                        string_author = childSnapshot.get('author')
                        string_updater= childSnapshot.get('updater')
                        string_is_public = childSnapshot.get('is_public')
                        string_permissions = childSnapshot.get('permissions')
                        string_source = childSnapshot.get('source')
                        string_time_created = new Date(childSnapshot.get('time_created').seconds * 1000)
                        string_last_updated = new Date(childSnapshot.get('last_updated').seconds * 1000)
                        found = true
                    }
                });
            }).then(() => {
                if (found) {
                    this.solution = string_solution 
                    this.is_special = string_is_special
                    this.letters = string_letters 
                    this.image = string_image
                    this.title = string_title
                    this.description = string_description
                    this.author = string_author
                    this.getAuthorUserRecord()
                    this.updater = string_updater
                    this.getUpdaterUserRecord()
                    this.is_public = string_is_public
                    this.permissions = string_permissions
                    this.getCollaboratorUserRecord() 
                    this.source = string_source
                    this.time_created = string_time_created
                    this.last_updated = string_last_updated
                    this.rows = this.solution.length
                    this.columns = this.solution[0].length 
                    this.num_letters = this.letters.length 
                    this.shuffleOrder()
                    this.initialize()
                    this.getPicture()
                    this.$forceUpdate()
                } else {
                    this.new_async(this.$refs.no_puzzle.show(), 1000).then(() => {this.$router.push("/searchcryptogram")})   
                }
            })
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
    store() {  
        let datetime = new Date()  
        cryptogramsRecordsRef.add({
            puzzleID: this.$route.params.id,
            user: this.user.uid, 
            score: this.time_elapsed,
            time: datetime, 
        })
    }, 
    check_victory() {
        this.victory = true
        for (let i = 0; i < this.values.length; i++) {
            if (this.letters[i] != this.values[i]) { 
                this.victory = false
                return
            }
        } 
        if (this.victory) { 
            clearInterval(this.interval) 
            this.new_async(this.$refs.solved.show(), 1000).then(() => {
                if (this.user && !this.cheat) {
                    this.new_async(this.store(), 1000).then(() => {
                        this.$router.push("/searchcryptogram")
                    })
                } else {
                    if (!this.user) {
                        this.new_async(this.$refs.no_user.show(), 1000).then(() => {
                            if (this.cheat) {
                                this.new_async(this.$refs.no_cheat.show(), 1000).then(() => {
                                    this.$router.push("/login")
                                })
                            } else {
                                this.$router.push("/login")
                            }
                        }) 
                    } else {
                        if (this.cheat) {
                            this.new_async(this.$refs.no_cheat.show(), 1000).then(() => {
                                this.$router.push("/searchcryptogram")
                            })
                        } else {
                            this.$router.push("/searchcryptogram")
                        }
                    }
                }
            }) 
        }
    }, 
        startTimer() {
            this.time_elapsed = setInterval(() => (this.time_elapsed += 1), 1000);
        },
    show_solution() {
        this.cheat = true;
        for (let i = 0; i < this.rows; i++) { 
            this.values[i] = this.letters[i]
        }
        this.check_victory()   
        this.$forceUpdate()
    },
      getPicture() {
        if (this.image == null) {
            this.imageURL = ""
            return
        }    
        var reference = ref(projectStorage, this.image)
        // Get the download URL
        getDownloadURL(reference)
        .then((url) => {
            this.imageURL = url
        })
        .catch((error) => { 
        });  
    },  
  },
  beforeMount() {
    this.fetch_puzzle()
  },  
  beforeUpdate() {
      this.check_victory() 
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
    this.$refs.show_error.show()
    this.startTimer()
  }
}
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">   
    <div class="myrow">
        <va-checkbox class="flex mb-2 md6" style="float: left" label="Prikaži greške" v-model="show_error" />
        <va-chip style="float: right" outline>{{format(time_elapsed)}}</va-chip>
    </div>
    <div class="myrow"> 
            <va-chip outline style="margin-left: 1%;margin-top: 1%" v-for="i in (num_letters)" v-bind:key="i">
                <sup>{{i - 1}}</sup><input v-model="values[i - 1]" type="text"  />
            </va-chip> 
    </div> 
    <br> 
    <div class="myrow">
        <table class="numbers_table">
            <tr v-for="i in (rows)" v-bind:key="i">
                <td v-for="j in (columns)" v-bind:key="j"  
                :class="{black: solution[i - 1][j - 1] == -1, special: is_special[i - 1][j - 1] == 1, wrong: letters[solution[i - 1][j - 1]] != values[solution[i - 1][j - 1]] && show_error }">
                        <div>
                            <span v-if="solution[i - 1][j - 1] == -2 || solution[i - 1][j - 1] == -1"></span>
                            <span v-else><sup>{{solution[i - 1][j - 1]}}</sup>{{values[solution[i - 1][j - 1]]}}</span>
                        </div>
                </td>
            </tr>
        </table> 
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
        <va-card>
            <va-card-title>Naslov zagonetke</va-card-title>
            <va-card-content>{{title}}</va-card-content>
        </va-card>
    </div>
    <div class="myrow">
        <va-card>
            <va-card-title>Opis zagonetke</va-card-title>
            <va-card-content>{{description}}</va-card-content>
        </va-card>
    </div>
    <div class="myrow">
        <va-card>
            <va-card-title>Izvor zagonetke</va-card-title>
            <va-card-content>{{source}}</va-card-content>
        </va-card>
    </div>
    <div class="myrow"> 
        <va-chip style="margin-left: 1%;margin-top: 1%">Autor zagonetke: {{authorUserRecord.displayName}} ({{authorUserRecord.email}})</va-chip>  
        <va-chip style="margin-left: 1%;margin-top: 1%">Vrijeme kreiranja: {{time_created.toLocaleString()}}</va-chip>  
        <br>
        <va-chip style="margin-left: 1%;margin-top: 1%">Zadnji ažurirao: {{updaterUserRecord.displayName}} ({{updaterUserRecord.email}})</va-chip>  
        <va-chip style="margin-left: 1%;margin-top: 1%">Vrijeme zadnje izmjene: {{last_updated.toLocaleString()}}</va-chip>
    </div> 
    <div class="myrow">
        <va-button @click="show_solution()">Otkrij sva polja</va-button>
    </div>    
    <va-modal ref="show_error" message="Želite li da greške budu uznačene?" @ok="show_error=true" stateful ok-text="Da" cancel-text="Ne" />
    <va-modal ref="barrier" hide-default-actions message="Broj ne može biti na barijeri." stateful />
    <va-modal ref="no_puzzle" hide-default-actions message="Ne postoji zagonetka s tim brojem." stateful />
    <va-modal ref="solved" hide-default-actions message="Uspješno ste riješili zagonetku." stateful />
    <va-modal ref="no_user" hide-default-actions message="Ne može se spremiti vaš rezultat jer niste prijavljeni." stateful />
    <va-modal ref="no_user_dialog" @cancel="$router.push('/login')" ok-text="Da" cancel-text="Ne" message="Ne može se spremiti vaš rezultat jer niste prijavljeni. Želite li svejedno nastaviti?" stateful />
    <va-modal ref="no_cheat" hide-default-actions message="Ne može se spremiti vaš rezultat jer ste odabrali da se otkrije rješenje." stateful />
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
.wrong {
    color: red;
}
</style>
