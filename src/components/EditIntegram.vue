<script>
import { ref, uploadBytes, getDownloadURL  } from "firebase/storage";

import { projectStorage } from "../main.js"
import { integramsRef } from "../main.js"
export default {
  data() {
    return {
      numcategories: 5,
      numvalues: 5,
      numinstructions: 6,
        author: "",   
        time_created: '',
        last_updated: '',
        updater: "",
        is_public: false,
        permissions: [],
        collaborator: "",
        description: '',
        source: '',
      alert: '',
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      max_len_display: 20,
      update_order: true,
      instructions: [],
      solution: [],
      mode: -1,
      mark_error: false
    }
  },
  methods: {
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
          let oldtoolong = []
          let maxnames = this.numcategories
          if (this.category_names) {
              oldnames = this.category_names
              oldisimage = this.is_image 
              oldtoolong = this.too_long 
              if (oldnames.length > maxnames) {
                  maxnames = oldnames.length
              }
          }
          this.category_names = []
          this.is_image = []
          this.too_long = []
          for (let i = 0; i < maxnames; i++) {
              if (oldnames[i]) {
                this.category_names.push(oldnames[i])
                this.is_image.push(oldisimage[i])
                this.too_long.push(oldtoolong[i])
              } else {
                this.category_names.push('')
                this.is_image.push(false)
                this.too_long.push(false)
              }
          } 
          this.change_instructions()        
          if (this.update_order) {
            this.order_in_category()
          }    
          this.check_same()
          this.check_too_long()
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
                        this.alert += (j+1).toString() + ". uputa nema tekst.\n"  
                    } 
            } 
            for (let j = 0; j < this.numcategories; j++) { 
                    if (this.category_names[j] == "") {
                        this.alert += (j+1).toString() + ". kategorija nema naziv.\n"  
                    } 
            }
          for (let i = 0; i < this.numcategories; i++) {
              for (let j = 0; j < this.numvalues; j++) {  
                if (this.category_values[j][i] == "" || this.category_values[j][i] == []) {
                    if (this.is_image[i]) {
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") nema sliku za " + (j+1).toString() + ". pojam.\n"  
                    } else {
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") nema vrijednost za " + (j+1).toString() + ". pojam.\n"  

                    }
                }
                    
              }
          }
            for (let j = 0; j < this.numinstructions; j++) { 
                for (let k = j + 1; k < this.numinstructions; k++) { 
                    if (this.instructions[j] == this.instructions[k] && this.instructions[j] && this.instructions[k]) {
                        this.alert += (j+1).toString() + ". uputa (" + this.instructions[j] + ") i "  + (k+1).toString() + ". uputa (" + this.instructions[k] + ") imaju isti tekst.\n"  
                    }
                }
            }
            for (let j = 0; j < this.numcategories; j++) { 
                for (let k = j + 1; k < this.numcategories; k++) { 
                    if (this.category_names[j] == this.category_names[k] && this.category_names[j] && this.category_names[k]) {
                        this.alert += (j+1).toString() + ". kategorija (" + this.category_names[j] + ") i "  + (k+1).toString() + ". kategorija (" + this.category_names[k] + ") imaju isti naziv.\n"  
                    }
                }
            }
          for (let i = 0; i < this.numcategories; i++) {
              for (let j = 0; j < this.numvalues; j++) { 
                for (let k = j + 1; k < this.numvalues; k++) { 
                    if (this.category_values[j][i] == this.category_values[k][i] && this.category_values[j][i] && this.category_values[k][i]) {
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") ima jednaku vrijednost za " + (j+1).toString() + ". pojam (" + this.category_values[j][i] + ") i "  + (k+1).toString() + ". pojam (" + this.category_values[k][i] + ").\n"  
                    } 
                    if (this.is_image[i] && this.category_values[j][i].toString()[0] == '[' &&  this.category_values[k][i].name  != undefined
                    && this.category_values[j][i] != "" && this.category_values[j][i] != []  && this.category_values[k][i] != "" && this.category_values[k][i] != [] 
                    && this.category_values[j][i].name == this.category_values[k][i].name && this.category_values[j][i] && this.category_values[k][i]) {
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") ima jednaku sliku za " + (j+1).toString() + ". pojam (" + this.category_values[j][i].name + ") i "  + (k+1).toString() + ". pojam (" + this.category_values[k][i].name + ").\n"  
                    }
                    if (this.is_image[i] && this.category_values[j][i].toString()[0] != '[' &&  this.category_values[k][i].name == undefined
                    && this.category_values[j][i] != "" && this.category_values[j][i] != []  && this.category_values[k][i] != "" && this.category_values[k][i] != [] 
                    && this.category_values[j][i] == this.category_values[k][i] && this.category_values[j][i] && this.category_values[k][i]) {
                        this.alert += (i+1).toString() + ". kategorija (" + this.category_names[i] + ") ima jednaku sliku za " + (j+1).toString() + ". pojam (" + this.category_values[j][i] + ") i "  + (k+1).toString() + ". pojam (" + this.category_values[k][i] + ").\n"  
                    }
                }
              }
          } 
      },
      check_too_long() {
          this.too_long = []
          for (let j = 0; j < this.numcategories; j++) {
            this.too_long.push(false) 
            for (let i = 0; i < this.numvalues; i++) {
                if (this.is_image[j] == false && this.category_values[i][j].length > this.max_len_display) {
                    this.too_long[j] = true;
                    break;
                }
            }
          }
      },
      order_in_category() {
          this.order = []
          for (let i = 0; i < this.numcategories; i++) {
              let category_order = []
              let used = []
              for (let j = 0; j < this.numvalues; j++) { 
                  used.push(0)
              }
              for (let j = 0; j < this.numvalues; j++) { 
                  let x = Math.floor(Math.random() * this.numvalues)
                  while (used[x]) {
                        x = Math.floor(Math.random() * this.numvalues)
                  }
                  used[x] = 1;
                  category_order.push(x);
              }
              this.order.push(category_order)
          }
          this.solution = []
          this.values = []
          for (let i = 0; i < this.numcategories; i++) {
              for (let j = 0; j < this.numvalues; j++) { 
                let solution_row = []
                let values_row = []
                for (let k = 0; k < this.numcategories; k++) {
                    for (let l = 0; l < this.numvalues; l++) { 
                        if (this.order[i][j] == this.order[k][l]) {
                            solution_row.push(1)
                        } else {
                            solution_row.push(0)
                        }
                        values_row.push(-1)
                    }
                }
                this.solution.push(solution_row)
                this.values.push(values_row)
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
          this.getPicture()
       }, 
      array_to_string(array) {
          let string = "["
          for (let i = 0; i < array.length; i++) {
              if (i != 0) {
                  string += ","
              }
              string += "[" 
              for (let j = 0; j < array.length; j++) {
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
            let params_id= this.$route.params.id
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
            let category_values2 = []
            for (let i = 0; i < this.numvalues; i++) {
                category_values2.push([]) 
                for (let j = 0; j < this.numcategories; j++) {
                    category_values2[i].push(this.category_values[i][j]) 
                }
            } 
            for (let i = 0; i < this.numcategories; i++) {
                for (let j = 0; j < this.numvalues; j++) {
                    if (this.is_image[i] && this.category_values[j][i] != '' && this.category_values[j][i] != [] && this.category_values[j][i].name != undefined) {
                        let exstension = this.category_values[j][i].name.split('.')[this.category_values[j][i].name.split('.').length - 1]
                        const reference = 'integram/' + params_id + "/" + (i + 1) + this.alphabet[j] + "."  + exstension; 
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
            integramsRef.doc(params_id).update({
                    category_values: funct_ref(category_values2),
                    category_names: newcategorynames,
                    is_image: newisimage,
                    instructions: newinstructions,
                    description: this.description,
                    author: "",
                    updater: "",
                    is_public: this.is_public,
                    permissions: this.permissions,
                    source: this.source,
                    time_created: datetime,
                    last_updated: datetime,
            }) 
        }, 
        duplicate() {
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
                    description: this.description,
                    author: "",
                    updater: "",
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
                        if (this.is_image[i] && this.category_values[j][i] != '' && this.category_values[j][i] != [] && this.category_values[j][i].name != undefined) {
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
                        description: this.description,
                        author: "",
                        updater: "",
                        is_public: this.is_public,
                        permissions: this.permissions,
                        source: this.source,
                        time_created: datetime,
                        last_updated: datetime,
                })
            })
            .catch((error) => { 
            });
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
            let string_category_values = []
            let string_category_names = []
            let string_is_image = []
            let string_instructions = ""
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
            integramsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let id = childSnapshot.id;
                    if (id == params_id) {
                        string_category_values = funct_ref(childSnapshot.get('category_values'))
                        string_category_names = childSnapshot.get('category_names')
                        string_is_image = childSnapshot.get('is_image')
                        string_instructions = childSnapshot.get('instructions')
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
                    this.category_values = string_category_values 
                    this.category_names = string_category_names
                    this.is_image = string_is_image
                    this.instructions = string_instructions
                    this.description = string_description
                    this.author = string_author
                    this.updater = string_updater
                    this.is_public = string_is_public
                    this.permissions = string_permissions
                    this.source = string_source
                    this.time_created = string_time_created
                    this.last_updated = string_last_updated
                    this.numvalues = this.category_values.length
                    this.numcategories = this.category_values[0].length 
                    this.numinstructions = this.instructions.length
                    this.change_instructions()      
                    this.order_in_category() 
                    this.initialize()
                    this.getPicture()
                    this.$forceUpdate()
                } else {
                    this.$refs.no_puzzle.show()
                    this.$router.push("/searchintegram");
                }
            })
      },
      getPicture() {
         for (let i = 0; i < this.numcategories; i++) {
            for (let j = 0; j < this.numvalues; j++) {
                if (this.is_image[i] && this.category_values[j][i] != '' && this.category_values[j][i] != []) {
                    let file = this.category_values[j][i]
                    if (file && file != "" && file != []) {   
                        if (file.name == undefined) {     
                             // Create a reference to the file we want to download
                            var reference = ref(projectStorage, file)
                            // Get the download URL
                            getDownloadURL(reference)
                            .then((url) => {
                                 document.getElementById("img" + (j) + ":" + (i)).src  = url
                            })
                            .catch((error) => { 
                            }); 
                        } else {  
                            let comp_url =  URL.createObjectURL(file)
                            document.getElementById("img" + (j) + ":" + (i)).src = comp_url
                         }
                    } 
                }
            }
        }
    },
  },  
  beforeMount() {
    this.initialize() 
    this.fetch_puzzle()
  },  
}
</script>

<template> 
    <div class="myrow">
        <va-slider v-model="numvalues" @focusout="update_order=true;initialize()" :min="3" :max="5" track-label-visible>
            <template #label>
                <span>Broj pojmova</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numvalues" @focusout="update_order=true;initialize()" :min="3" :max="5"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="numcategories" @focusout="update_order=true;initialize()" :min="3" :max="5" track-label-visible>
            <template #label>
                <span>Broj kategorija</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numcategories" @focusout="update_order=true;initialize()" :min="3" :max="5"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="numinstructions" @focusout="update_order=false;" :min="5" :max="10" track-label-visible>
            <template #label>
                <span>Broj opisnih uputa</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numinstructions" @focusout="update_order=false;" :min="5" :max="10"/>
            </template>
        </va-slider>
    </div> 
    <br>  
    <div class="myrow" v-for="i in numinstructions"  v-bind:key="i">
        <va-input v-model="instructions[i-1]" type="text" @focusout="check_same();update_order=false;"
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
                <va-switch v-model="is_image[i-1]" true-inner-label="Slika" false-inner-label="Nije slika" @click="clear_category(i - 1);$update_order=false;$forceUpdate()" class="mr-4" /> 
                <br> <br>
                <va-input :label="'Naslov ' + i + '. kategorije'" type="text" v-model="category_names[i-1]" @focusout="check_same();update_order=false;$forceUpdate()"/> 
                   <br> 
 <va-divider />
            </th>
        </tr> 
        <tr v-for="k in numvalues" v-bind:key="k">            
            <td v-for="j in numcategories" v-bind:key="j" style="width:15%" :class="{first:  j == 1, second: j == 2, third: j == 3, fourth: j == 4, fifth: j == 5}">
                <span  v-if="is_image[j-1]==true">
                    <va-button  style="  display:inline-block;width:25%; overflow: hidden;    white-space: nowrap;   text-overflow: ellipsis;  "    @click="click_file(k-1,j-1)">   
                        <span    style="  display:inline-block;width:100%; overflow: hidden;    white-space: nowrap;   text-overflow: ellipsis;  "    v-if="this.category_values[k-1][j-1] != '' && this.category_values[k-1][j-1] != [] && this.category_values[k-1][j-1].name != undefined">{{this.category_values[k-1][j-1].name}}</span>
                        <span    style="  display:inline-block;width:100%; overflow: hidden;    white-space: nowrap;   text-overflow: ellipsis;  "    v-if="this.category_values[k-1][j-1] != '' && this.category_values[k-1][j-1] != [] && this.category_values[k-1][j-1].name == undefined">{{this.category_values[k-1][j-1]}}</span>
                        <span  v-if="this.category_values[k-1][j-1] == '' || this.category_values[k-1][j-1] == []">Odaberi sliku</span></va-button>  
             
                <input   file-types="image/*" type="file" :id='"fileinput" + (k-1) + ":" + (j-1)'  
                style="display: none;visibility: hidden;width:0%"
                @input="image_uploaded(k-1,j-1);check_too_long();check_same();update_order=false;$forceUpdate()" /></span>
                <va-input :label="'Vrijednost ' + j + '. kategorije za ' + k + '. pojam'" v-else type="text" v-model="category_values[k-1][j-1]" @focusout="check_too_long();check_same();update_order=false;$forceUpdate()"/>

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
    <table class="integram_solve"> 
        <tr>            
            <td>&nbsp;</td>
            <td class="rotated_text" v-for="i in numvalues*(numcategories-1)" v-bind:key="i"
                :class="{second: Math.floor((i-1)/numvalues)+1==1,third: Math.floor((i-1)/numvalues)+1==2,
                fourth: Math.floor((i-1)/numvalues)+1==3,fifth: Math.floor((i-1)/numvalues)+1==4}">
                <span class="checkmark, text_column" 
                v-if="is_image[Math.floor((i-1)/numvalues)+1]==false && too_long[Math.floor((i-1)/numvalues)+1]==false">
                {{category_values[order[Math.floor((i-1)/numvalues)+1][(i-1)%numvalues]][Math.floor((i-1)/numvalues)+1]}}</span>
                <span class="checkmark, text_column" v-else>{{Math.floor((i-1)/numvalues)+2}}{{alphabet[order[Math.floor((i-1)/numvalues)+1][(i-1)%numvalues]]}}</span>
            </td>
        </tr> 
        <tr v-for="j in numvalues" v-bind:key="j">
            <td class="first">
                <span class="checkmark, text_row" v-if="is_image[0]==false && too_long[0]==false">{{category_values[order[0][j-1]][0]}}</span>
                <span class="checkmark, text_row" v-else>{{1}}{{alphabet[order[0][j-1]]}}</span>
            </td>
            <td v-for="i in numvalues*(numcategories-1)" v-bind:key="i">
                <span class="checkmark" v-if="order[0][j-1]==order[Math.floor((i-1)/numvalues)+1][(i-1)%numvalues]">&#128504;</span>
                <span class="checkmark" v-else>&#215;</span>
            </td>
        </tr> 
        <tr v-for="j in numvalues*(numcategories-2)" v-bind:key="j">
            <td :class="{second: numcategories-1-Math.floor((j-1)/numvalues)==1,third: numcategories-1-Math.floor((j-1)/numvalues)==2,
                fourth: numcategories-1-Math.floor((j-1)/numvalues)==3,fifth: numcategories-1-Math.floor((j-1)/numvalues)==4}">
                <span class="checkmark, text_row" v-if="is_image[numcategories-1-Math.floor((j-1)/numvalues)]==false && too_long[numcategories-1-Math.floor((j-1)/numvalues)]==false">
                {{category_values[order[numcategories-1-Math.floor((j-1)/numvalues)][(j-1)%numvalues]][numcategories-1-Math.floor((j-1)/numvalues)]}}
                </span>
                <span class="checkmark, text_row" v-else>{{numcategories-Math.floor((j-1)/numvalues)}}{{alphabet[order[Math.floor((j-1)/numvalues)+1][(j-1)%numvalues]]}}</span>
            </td>
            <td v-for="i in numvalues*(numcategories-Math.floor((j-1)/numvalues)-2)" v-bind:key="i">
            <span class="checkmark" v-if="order[numcategories-1-Math.floor((j-1)/numvalues)][(j-1)%numvalues]==order[Math.floor((i-1)/numvalues)+1][(i-1)%numvalues]">&#128504;</span>
            <span class="checkmark" v-else>&#215;</span>
            </td>
        </tr> 
    </table>
    
    <br>
    <div v-for="i in numcategories" v-bind:key="i">
        <va-card v-if="too_long[i-1]==true && is_image[i-1]==false">
            <va-card-title>{{i}}. kategorija</va-card-title>
            <va-card-content><div v-for="j in numvalues" v-bind:key="j">
                <div :class="{first: i==1, second: i==2, third: i==3, fourth: i==4, fifth: i==5}">{{i}}{{alphabet[j-1]}}</div> {{category_values[j-1][i-1]}}
            </div> </va-card-content>
        </va-card>
        <span v-if="is_image[i-1]==true">
            {{i}}. kategorija:<br>
            <span v-for="j in numvalues" v-bind:key="j"> 
                <div class="image_container" > 
                    <img :id='"img" + (j-1) + ":" + (i-1)' alt="No image" style="width:100%;">
                    <div :class="{topleft: true, first: i==1, second: i==2, third: i==3, fourth: i==4, fifth: i==5}">{{i}}{{alphabet[j-1]}}</div>
                </div>
            </span>
        </span>
    </div> 
    <div class="myrow">
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
        <va-input style="display: inline-block;margin-left: 1%;margin-top: 1%" type="text" v-model="collaborator" placeholder="Korisničko ime" label="Ime suradnika">
            <template #append> 
                <va-icon @click="permissions.push(collaborator);$forceUpdate()" color="primary" class="mr-4" name="add_circle"/>   
            </template>
        </va-input> 
    </div>
    <div class="myrow"> 
            Suradnici: 
            <va-chip style="display: inline-block;margin-left: 1%;margin-top: 1%" 
            v-for="(permission, i) in permissions" :key="i">
                <va-icon style="display: inline-block" @click="permissions.splice(i,1)" name="clear" class="mr-2"/>
                {{permission}}
            </va-chip> 
    </div>
    <div class="myrow" v-if="!warning">
        <va-button @click="store()">Izmijeni postojeću zagonetku</va-button>
        <va-button @click="duplicate()">Spremi izmjene kao novu zagonetku</va-button>
    </div> 
    <!--<button @click="update_order=true;$forceUpdate()">Promjeni redoslijed</button>-->
    <va-modal ref="no_puzzle" hide-default-actions message="Ne postoji zagonetka s tim brojem." stateful />
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
  width: 100px;
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
</style>