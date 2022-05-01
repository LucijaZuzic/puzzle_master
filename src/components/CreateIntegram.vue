<script>
import { ref, uploadBytes } from "firebase/storage";
import { usersRef } from "../main.js"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from './Navbar.vue'
import { projectStorage } from "../main.js"
import { integramsRef } from "../main.js" 

export default {
  components: {
    Navbar
  },
  data() {
    return {
        user: null,
        title: "",
        numcategories: 5,
        numvalues: 5,
        numinstructions: 6,   
        is_public: false,
        permissions: [],
        permissionsUserRecords: [],
        collaborator: "",
        description: '',
        source: '',
        alert: '',
        alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        max_len_display: 20,
        instructions: [],
        solution: [],
        mode: -1, 
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
          let oldvalues = []
          let maxcol = this.numcategories
          let maxrow = this.numvalues
          if (this.category_values) {
              oldvalues = this.category_values 
              if (oldvalues.length > maxrow) {
                   maxrow = oldvalues.length
               }
               if (oldvalues[0].length > maxcol) {
                   maxcol = oldvalues[0].length
               }
          }
          this.category_values = []
          for (let i = 0; i < maxrow; i++) {
              let category_values_row = []
              for (let j = 0; j < maxcol; j++) {
                if (oldvalues[i]) {
                    if (oldvalues[i].length > j) {
                        category_values_row.push(oldvalues[i][j])
                    } else {
                        category_values_row.push('')
                    }
                } else {
                    category_values_row.push('')
                }
              }
              this.category_values.push(category_values_row)
          }
          let oldnames = []
          let oldisimage = [] 
          let maxnames = this.numcategories
          if (this.category_names) {
              oldnames = this.category_names
              oldisimage = this.is_image  
              if (oldnames.length > maxnames) {
                  maxnames = oldnames.length
              }
          }
          this.category_names = []
          this.is_image = [] 
          for (let i = 0; i < maxnames; i++) {
              if (oldnames[i]) {
                this.category_names.push(oldnames[i])
                this.is_image.push(oldisimage[i]) 
              } else {
                this.category_names.push('')
                this.is_image.push(false) 
              }
          } 
          this.change_instructions()         
          this.check_same() 
      },
      change_instructions() {
          let oldinstructions = []
          let maxinstructions = this.numinstructions
          if (this.instructions) {
              oldinstructions = this.instructions
              if (oldinstructions.length > maxinstructions) {
                  maxinstructions = oldinstructions.length
              }
          }
          this.instructions = []
          for (let i = 0; i < maxinstructions; i++) {
              if (oldinstructions[i]) {
                this.instructions.push(oldinstructions[i])
              } else {
                this.instructions.push('')
              }
          } 
      },
       check_same() {
          this.alert = ""
            for (let j = 0; j < this.numinstructions; j++) { 
                    if (this.instructions[j] == "") {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (j+1).toString() + ". uputa nema tekst."  
                    } 
            }
            for (let j = 0; j < this.numcategories; j++) { 
                    if (this.category_names[j] == "") {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (j+1).toString() + ". kategorija nema naziv."  
                    } 
            }
          for (let i = 0; i < this.numcategories; i++) {
            for (let j = 0; j < this.numvalues; j++) {  
                if (this.category_values[j][i] == "" || this.category_values[j][i] == []) {
                    if (this.is_image[i]) {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") nema sliku za " + (j+1).toString() + ". pojam."  
                    } else {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") nema vrijednost za " + (j+1).toString() + ". pojam."  

                    }
                }
            }
          }
            for (let j = 0; j < this.numinstructions; j++) { 
                for (let k = j + 1; k < this.numinstructions; k++) { 
                    if (this.instructions[j] == this.instructions[k] && this.instructions[j] && this.instructions[k]) {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (j+1).toString() + ". uputa (" + this.instructions[j] + ") i "  + (k+1).toString() + ". uputa (" + this.instructions[k] + ") imaju isti tekst."  
                    }
                }
            }
            for (let j = 0; j < this.numcategories; j++) { 
                for (let k = j + 1; k < this.numcategories; k++) { 
                    if (this.category_names[j] == this.category_names[k] && this.category_names[j] && this.category_names[k]) {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (j+1).toString() + ". kategorija (" + this.category_names[j] + ") i "  + (k+1).toString() + ". kategorija (" + this.category_names[k] + ") imaju isti naziv."  
                    }
                }
            }
          for (let i = 0; i < this.numcategories; i++) {
              for (let j = 0; j < this.numvalues; j++) { 
                for (let k = j + 1; k < this.numvalues; k++) { 
                    if (this.category_values[j][i] == this.category_values[k][i] && this.category_values[j][i] && this.category_values[k][i]) {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") ima jednaku vrijednost za " + (j+1).toString() + ". pojam (" + this.category_values[j][i] + ") i "  + (k+1).toString() + ". pojam (" + this.category_values[k][i] + ")."  
                    } 
                    if (this.is_image[i] && this.category_values[j][i] != "" && this.category_values[j][i] != []  && this.category_values[k][i] != "" && this.category_values[k][i] != [] 
                    && this.category_values[j][i].name == this.category_values[k][i].name && this.category_values[j][i] && this.category_values[k][i]) {
                        if (this.alert != "") {
                            this.alert += " "
                        }
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") ima jednaku sliku za " + (j+1).toString() + ". pojam (" + this.category_values[j][i].name + ") i "  + (k+1).toString() + ". pojam (" + this.category_values[k][i].name + ")."  
                    }
                }
              }
          }
      },
      clear_category(category_to_clear) {
        for (let i = 0; i < this.numvalues; i++) { 
            if (this.is_image[category_to_clear]) {
                this.category_values[i][category_to_clear] = [];
            } else {
                this.category_values[i][category_to_clear] = "";
            }
        }
      }, 
      click_file(i, j) { 
          document.getElementById("fileinput" + (i) + ":" + (j)).click();  
       },
      image_uploaded(i, j) { 
          this.category_values[i][j] = document.getElementById("fileinput" + (i) + ":" + (j)).files[0];  
       },
       returnURL(file) { 
           if (file && file != "" && file != []) {  
               return URL.createObjectURL(file)
           } else {
               return ""
           }
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
            let newinstructions = []
            for (let i = 0; i < this.numinstructions; i++) {
                newinstructions.push(this.instructions[i])
            }
            let newcategorynames = []
            for (let i = 0; i < this.numcategories; i++) {
                newcategorynames.push(this.category_names[i])
            }
            let newisimage = []
            for (let i = 0; i < this.numcategories; i++) {
                newisimage.push(this.is_image[i])
            }
            integramsRef.add({
                    category_values: "",
                    category_names: newcategorynames,
                    is_image: newisimage,
                    instructions: newinstructions,
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
            .then((docRef) => {
                let some_id = docRef.id 
                let category_values2 = [] 
                for (let i = 0; i < this.numvalues; i++) {
                    category_values2.push([]) 
                    for (let j = 0; j < this.numcategories; j++) {
                        category_values2[i].push(this.category_values[i][j]) 
                    }
                } 
                for (let i = 0; i < this.numcategories; i++) {
                    for (let j = 0; j < this.numvalues; j++) {
                        if (this.is_image[i] && this.category_values[j][i] != '' && this.category_values[j][i] != []) {
                            let exstension = this.category_values[j][i].name.split('.')[this.category_values[j][i].name.split('.').length - 1]
                            const reference = 'integram/' + some_id + "/" + (i + 1) + this.alphabet[j] + "."  + exstension; 
                            const storageRef = ref(projectStorage, reference);
                                const metadata = {
                                contentType: 'image/' + exstension
                            };
                            // 'file' comes from the Blob or File API 
                            uploadBytes(storageRef, this.category_values[j][i], metadata).then((snapshot) => {  
                            })
                            .catch((error) => {  
                            })
                            category_values2[j][i] = reference
                        }
                    }
                } 
                integramsRef.doc(some_id).update({
                        category_values: funct_ref(category_values2),
                        category_names: newcategorynames,
                        is_image: newisimage,
                        instructions: newinstructions,
                        title: this.title,
                        description: this.description,
                        author: this.user.uid,
                        updater: this.user.uid,
                        is_public: this.is_public,
                        permissions: this.permissions,
                        source: this.source,
                        time_created: datetime,
                        last_updated: datetime,
                }).then(() => {this.new_async(this.$refs.store_success.show(), 1000).then(() => {this.$router.push("/searchintegram")}) })
            })
            .catch((error) => { 
            });
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
        }
  }, 
  beforeUpdate() {
    this.initialize()  
  },  
  beforeMount() {
    this.initialize() 
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
        this.new_async(this.$refs.no_user.show(), 1000).then(() => {this.$router.push("/login")})  
      }
    })
  }
}
</script>

<template> 
  <Navbar></Navbar>
  <body class="mybody">
    <div class="myrow">
        <va-slider v-model="numvalues" :min="3" :max="5" track-label-visible>
            <template #label>
                <span>Broj pojmova</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numvalues" :min="3" :max="5"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="numcategories" :min="3" :max="5" track-label-visible>
            <template #label>
                <span>Broj kategorija</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numcategories" :min="3" :max="5"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="numinstructions" :min="5" :max="10" track-label-visible>
            <template #label>
                <span>Broj opisnih uputa</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numinstructions" :min="5" :max="10"/>
            </template>
        </va-slider>
    </div> 
    <br>  
    <div class="myrow" v-for="i in numinstructions"  v-bind:key="i">
        <va-input v-model="instructions[i-1]" type="text" @focusout="check_same();"
            :label="i + '. uputa'" 
        /> 
    </div>
    <br>
    <br>
    <table class="integram_task">
        <tr>       
            <th v-for="i in numcategories" v-bind:key="i" :class="{first: i == 1, second: i == 2, third: i == 3, fourth: i == 4, fifth: i == 5}">
                <va-chip>{{i}}. kategorija</va-chip>    
                &nbsp;
                <va-switch v-model="is_image[i-1]" true-inner-label="Slika" false-inner-label="Nije slika" @click="clear_category(i - 1);$forceUpdate()" class="mr-4" /> 
                <br> <br>
                <va-input :label="'Naslov ' + i + '. kategorije'" type="text" v-model="category_names[i-1]" @focusout="check_same();$forceUpdate()"/> 
                   <br> 
 <va-divider />
            </th>
        </tr> 
        <tr v-for="k in numvalues" v-bind:key="k">            
            <td v-for="j in numcategories" v-bind:key="j" style="width:15%" :class="{first:  j == 1, second: j == 2, third: j == 3, fourth: j == 4, fifth: j == 5}">
                <span v-if="is_image[j-1]==true">
                    <va-button style="display:inline-block;overflow-wrap:anywhere" @click="click_file(k-1,j-1)">   
                        <span v-if="this.category_values[k-1][j-1] != '' && this.category_values[k-1][j-1] != []">{{this.category_values[k-1][j-1].name}}</span>
                        <span v-else>Odaberi sliku</span>
                    </va-button>       
                    <input file-types="image/*" type="file" :id='"fileinput" + (k-1) + ":" + (j-1)'  
                    style="display: none;visibility: hidden;width:0%"
                    @input="image_uploaded(k-1,j-1);check_same();$forceUpdate()" />
                </span>
                <va-input :label="'Vrijednost ' + j + '. kategorije za ' + k + '. pojam'" v-else type="text" v-model="category_values[k-1][j-1]" @focusout="check_same();$forceUpdate()"/>

            </td>
        </tr> 
    </table> 
    <br>  
    <div class="myrow" v-if="alert">
        <va-alert style="white-space: pre-wrap;" color="warning" :title="'Greške u unosu kategorija i vrijednosti'" center class="mb-4">
            {{alert}}
        </va-alert> 
    </div> 
    <br>   
    <div class="myrow" v-for="i in numcategories" v-bind:key="i"> 
        <va-card v-if="is_image[i-1]==true">
            <va-card-title><va-chip>{{i}}. kategorija</va-chip></va-card-title> 
            <va-card-content> 
                <div v-for="j in numvalues" v-bind:key="j" class="image_container" > 
                    <img :id='"img" + (j-1) + ":" + (i-1)' :src="returnURL(category_values[j-1][i-1])" alt="No image" style="width:100%;">
                    <div :class="{padded: true, topleft: true, first: i==1, second: i==2, third: i==3, fourth: i==4, fifth: i==5}">{{i}}{{alphabet[j-1]}}</div>
                </div>
            </va-card-content>
        </va-card> 
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
    <div  v-if="!alert" class="myrow"> 
        <va-button @click="store()">Spremi zagonetku</va-button>  
    </div>       
    <va-modal ref="no_user" hide-default-actions message="Ne možete kreirati zagonetku jer niste prijavljeni." stateful />
    <va-modal ref="store_success" hide-default-actions message="Nova zagonetka je uspješno spremljena." stateful />
    <va-modal ref="no_collaborator" hide-default-actions message="Ne možete dodati suradnika jer ne postoji korisnik s tom email adresom." stateful />
    <va-modal ref="me_collaborator" hide-default-actions message="Ne možete dodati samog sebe kao suradnika." stateful />
    <va-modal ref="duplicate_collaborator" hide-default-actions message="Ne možete dodati istu osobu kao suradnika dvaput." stateful />
  </body>
</template>

<style scoped>

table { 
  border-collapse: collapse;
}
td, tr {
  text-align: center;
  border-collapse: collapse;
}   
.integram_task th { 
    border: none;
   padding: 15px;
}
.integram_task td {
    border-collapse:separate;
   padding: 15px;
}
table  { 
    display: inline-table;
}
.integram_solve td, th {
  border: 1px solid black;
}  
.rotated_text { 
    writing-mode: vertical-rl;
}
.checkmark { 
    width: 25px;
    text-align: center;
    vertical-align: middle;
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
  width: 19%;
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
    background-color:  #1e70c8;
}
.fourth {
    color: white;
    background-color:  #4e96e4;
}
.fifth {
    color: white;
    background-color:  #90beee;
}
.wrong {
    color: red;
}
.padded {
  padding: 5px;
  border-radius: 50%;
  margin: 5px;
  font-weight: bold;
}
</style>