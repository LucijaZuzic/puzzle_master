<script>

export default {
  data() {
    return {
      numcategories: 5,
      numvalues: 5,
      numinstructions: 6,
      alert: '',
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      max_len_display: 20,
      update_order: true,
      solution: [],
      mode: -1,
      mark_error: false
    }
  },
  methods: {
      initialize() {
          this.userinput = []
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
                }
              }
          }
      },
      check_too_long() {
          this.too_long = []
          for (let j = 0; j < this.numcategories; j++) {
            this.too_long.push(false) 
            for (let i = 0; i < this.numvalues; i++) {
                if (this.category_values[i][j].length > this.max_len_display) {
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
  },
  beforeMount() {
    this.initialize() 
  }, 
}
</script>

<template> 
    <div class="myrow">
        <va-slider v-model="numvalues" @focusout="update_order=true;" :min="3" :max="5" track-label-visible>
            <template #label>
                <span>Broj pojmova</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numvalues" @focusout="update_order=true;" :min="3" :max="5"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="numcategories" @focusout="update_order=true;" :min="3" :max="5" track-label-visible>
            <template #label>
                <span>Broj kategorija</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numcategories" @focusout="update_order=true;" :min="3" :max="5"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="numinstructions" @focusout="update_order=true;" :min="5" :max="10" track-label-visible>
            <template #label>
                <span>Broj opisnih uputa</span>
            </template>
            <template #append>
                <va-input type="number" v-model="numinstructions" @focusout="update_order=true;" :min="5" :max="10"/>
            </template>
        </va-slider>
    </div> 
    <br>  
    <div class="myrow" v-for="i in numinstructions"  v-bind:key="i">
        <va-input v-model="instructions[i-1]" type="text"
            :label="i + '.'" 
        /> 
    </div>
    <table class="integram_task">
        <tr>       
            <td v-for="i in numcategories" v-bind:key="i">
                <span>{{i}}. kategorija</span>  
                <va-switch v-model="is_image[i-1]" true-inner-label="Slika" false-inner-label="Nije slika" @focusout="$update_order=false;$forceUpdate()" class="mr-4" /> 
                <va-input type="text" v-model="category_names[i-1]" @change="check_same();update_order=false;$forceUpdate()"/>
            </td>
        </tr> 
        <tr v-for="k in numvalues" v-bind:key="k">            
            <td v-for="j in numcategories" v-bind:key="j">
                <va-input type="text" v-model="category_values[k-1][j-1]" @change="check_too_long();check_same();update_order=false;$forceUpdate()"/>
                <img v-if="is_image[j-1]==true" alt="No image" style="height: 50px" :src="category_values[k-1][j-1]"> 
            </td>
        </tr> 
    </table> 
    <div class="myrow" v-if="alert">
        <va-alert style="white-space: pre-wrap;" color="warning" :title="'Greške u unosu kategorija i vrijednosti'" center class="mb-4">
            {{alert}}
        </va-alert>
        <br>
    </div> 
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
    
    <div v-for="i in numcategories" v-bind:key="i">
        <span v-if="too_long[i-1]==true && is_image[i-1]==false">
            {{i}}. kategorija:
            <span v-for="j in numvalues" v-bind:key="j">
                <span :class="{first: i==1, second: i==2, third: i==3, fourth: i==4, fifth: i==5}">{{i}}{{alphabet[j-1]}}</span> {{category_values[j-1][i-1]}}
            </span>
        </span>
        <span v-if="is_image[i-1]==true">
            {{i}}. kategorija:<br>
            <span v-for="j in numvalues" v-bind:key="j">
                <va-badge
                    :text="i + alphabet[j-1]"
                    overlap
                    class="mr-4"
                >
                <va-avatar :src="category_values[j-1][i-1]" />
                </va-badge>
                <div class="image_container">
                    
                    <img :src="category_values[j-1][i-1]" alt="No image" style="width:100%;">
                    <div :class="{topleft: true, first: i==1, second: i==2, third: i==3, fourth: i==4, fifth: i==5}">{{i}}{{alphabet[j-1]}}</div>
                </div>
            </span>
        </span>
    </div> 
    <button @click="update_order=true;$forceUpdate()">Promjeni redoslijed</button>
</template>

<style scoped>

table {
  border-collapse: collapse;
}
td, tr {
  text-align: center;
  border-collapse: collapse;
}  
.integram_task td {
   padding: 5px;
}
.integram_task th td {
   padding: 5px;
    background-color: #008080;
}
.integram_solve td, th {
  border: 1px solid black;
}  
.rotated_text { 
    writing-mode: vertical-rl;
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
    background-color: #008080;
}
.second {
    color: white;
    background-color: #009999;
}
.third {
    color: white;
    background-color: #00b3b3;
}
.fourth {
    color: white;
    background-color: #00cccc;
}
.fifth {
    color: white;
    background-color: #00e6e6;
}
.wrong {
    color: red;
}
</style>