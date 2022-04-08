<script>

export default {
  data() {
    return {
      category_values: [['Bez naslova', '1964.','03\'00\'\''],
                        ['Krek','1967.','09\'36\'\''], 
                        ['Ljubitelji cvijeća','1971.','10\'15\'\''],
                        ['Putnik drugog razreda','1973.','10\'54\'\''],
                        ['Znatiželja','1966.','08\'09\'\'']],
      category_names: ['Film','Godina','Trajanje'],
      numcategories: 0,
      numvalues: 0,
      numinstructions: 0,
      instructions: ['1s','2s','3s','4s','5s','6s'],
      is_image: [false,false,false,false,false],
      alert: '',
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      max_len_display: 20,
      solution: [],
      mode: -1,
      time_elapsed: 0,
      mark_error: this.startup()
    }
  },
  methods: {
        startup () {
            var c = window.confirm("Želite li da greške budu uznačene?");
            this.startTimer();
            return c;
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
          this.numvalues = this.category_values.length
          this.numcategories = this.category_values[0].length
          this.numinstructions = this.instructions.length
          this.order_in_category()
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
      click_cell(x,  y) {
        let oldvalues = []
        for (let i = 0; i < this.numcategories; i++) {
            for (let j = 0; j < this.numvalues; j++) { 
                let old_row = []
                for (let k = 0; k < this.numcategories; k++) {
                    for (let l = 0; l < this.numvalues; l++) { 
                        old_row.push(this.values[i * this.numvalues + j][k * this.numvalues + l])
                    }
                }
                oldvalues.push(old_row)
            }
        }
        if (this.mode == 1) {
            let row_start = x - x % this.numvalues
            let col_start = y - y % this.numvalues
            for (let i = 0; i < this.numvalues; i++) {
                if (this.values[x][col_start + i] == 1) {
                    window.alert("Neispravan zaključak")
                    this.values = oldvalues
                    this.$forceUpdate();
                    return
                }
                if (this.values[col_start + i][x] == 1) {
                    window.alert("Neispravan zaključak")
                    this.values = oldvalues
                    this.$forceUpdate();
                    return
                }
                this.values[x][col_start + i] = 0
                this.values[col_start + i][x] = 0
                if (this.values[row_start + i][y] == 1) {
                    window.alert("Neispravan zaključak")
                    this.values = oldvalues
                    this.$forceUpdate();
                    return
                }
                if (this.values[y][row_start + i] == 1) {
                    window.alert("Neispravan zaključak")
                    this.values = oldvalues
                    this.$forceUpdate();
                    return
                }
                this.values[row_start + i][y] = 0
                this.values[y][row_start + i] = 0
            }
        } 
        if (this.mode == -1 && this.values[x][y] == 1) {
            let row_start = x - x % this.numvalues
            let col_start = y - y % this.numvalues
            for (let i = 0; i < this.numvalues; i++) {
                this.values[x][col_start + i] = -1
                this.values[col_start + i][x] = -1
                this.values[row_start + i][y] = -1
                this.values[y][row_start + i] = -1
            }
        } 
        this.values[x][y] = this.mode;
        this.values[y][x] = this.mode;
        let correct = this.update_values()
        for (let i = 0; i < Math.max(this.numcategories, this.numvalues); i++) {
            correct = this.update_values()
        }
        if (!correct) {
            window.alert("Neispravan zaključak")
            this.values = oldvalues
        }
        correct = this.find_single()
        if (!correct) {
            window.alert("Neispravan zaključak")
            this.values = oldvalues
        }
        this.update_order=false;
        this.$forceUpdate();
      },
      find_single() {
        for (let i = 0; i < this.numcategories; i++) {
            for (let k = 0; k < this.numcategories; k++) {
                for (let j = 0; j < this.numvalues; j++) { 
                    let row_result = 0
                    let row_free = -1
                    for (let l = 0; l < this.numvalues; l++) {
                        if (this.values[i * this.numvalues + j][k * this.numvalues + l] == 0) {
                            row_result += 1;
                        }
                        if (this.values[i * this.numvalues + j][k * this.numvalues + l] == -1) {
                            row_free = l;
                        }
                    }
                    if (row_result == this.numvalues - 1 && row_free != -1) {
                        this.values[i * this.numvalues + j][k * this.numvalues + row_free] = 1;
                        if (!this.update_values()) {
                            return false
                        }
                    }
                    let col_result = 0
                    let col_free = -1
                    for (let l = 0; l < this.numvalues; l++) {
                        if (this.values[i * this.numvalues + l][k * this.numvalues + j] == 0) {
                            col_result += 1;
                        }
                        if (this.values[i * this.numvalues + l][k * this.numvalues + j] == -1) {
                            col_free = l;
                        }
                    }
                    if (col_result == this.numvalues - 1 && col_free != -1) {
                        this.values[i * this.numvalues + col_free][k * this.numvalues + j] = 1;
                        if (!this.update_values()) {
                            return false
                        }
                    }
                }
            }
        }
        return true
      },
    update_values() {
          for (let i = 0; i < this.numcategories; i++) {
              for (let j = 0; j < this.numvalues; j++) { 
                for (let k = 0; k < this.numcategories; k++) {
                    for (let l = 0; l < this.numvalues; l++) {
                        if (this.values[i * this.numvalues + j][k * this.numvalues + l] != -1) {
                            if (this.values[i * this.numvalues + j][k * this.numvalues + l] != this.values[k * this.numvalues + l][i * this.numvalues + j] && this.values[k * this.numvalues + l][i * this.numvalues + j] != -1) {
                                return false
                            }
                            this.values[k * this.numvalues + l][i * this.numvalues + j] = this.values[i * this.numvalues + j][k * this.numvalues + l]
                        }
                        if (this.values[k * this.numvalues + l][i * this.numvalues + j] != -1) {
                            if (this.values[k * this.numvalues + l][i * this.numvalues + j] != this.values[i * this.numvalues + j][k * this.numvalues + l] && this.values[i * this.numvalues + j][k * this.numvalues + l] != -1) {
                                return false
                            }
                            this.values[i * this.numvalues + j][k * this.numvalues + l] = this.values[k * this.numvalues + l][i * this.numvalues + j]
                        }
                    }
                }
              }
          }
          for (let i = 0; i < this.numcategories; i++) {
              for (let j = 0; j < this.numvalues; j++) { 
                for (let k = 0; k < this.numcategories; k++) {
                    for (let l = 0; l < this.numvalues; l++) {
                        if (this.values[i * this.numvalues + j][k * this.numvalues + l] == 1 || this.values[k * this.numvalues + l][i * this.numvalues + j] == 1) {
                            for (let n = 0; n < this.numcategories; n++) {
                                for (let m = 0; m < this.numvalues; m++) {
                                    if (this.values[i * this.numvalues + j][n * this.numvalues + m] != -1) {
                                        if (this.values[k * this.numvalues + l][n * this.numvalues + m] != -1 && this.values[k * this.numvalues + l][n * this.numvalues + m] != this.values[i * this.numvalues + j][n * this.numvalues + m]) {
                                            return false
                                        }
                                        this.values[k * this.numvalues + l][n * this.numvalues + m] = this.values[i * this.numvalues + j][n * this.numvalues + m]
                                        if (this.values[n * this.numvalues + m][k * this.numvalues + l] != -1 && this.values[n * this.numvalues + m][k * this.numvalues + l] != this.values[i * this.numvalues + j][n * this.numvalues + m]) {
                                            return false
                                        }
                                        this.values[n * this.numvalues + m][k * this.numvalues + l] = this.values[i * this.numvalues + j][n * this.numvalues + m]
                                    } 
                                    if (this.values[k * this.numvalues + l][n * this.numvalues + m] != -1) {
                                        if (this.values[i * this.numvalues + j][n * this.numvalues + m] != -1 && this.values[i * this.numvalues + j][n * this.numvalues + m] != this.values[k * this.numvalues + l][n * this.numvalues + m]) {
                                            return false
                                        }
                                        this.values[i * this.numvalues + j][n * this.numvalues + m] = this.values[k * this.numvalues + l][n * this.numvalues + m]
                                        if (this.values[n * this.numvalues + m][i * this.numvalues + j] != -1 && this.values[n * this.numvalues + m][i * this.numvalues + j] != this.values[k * this.numvalues + l][n * this.numvalues + m]) {
                                            return false
                                        }
                                        this.values[n * this.numvalues + m][i * this.numvalues + j] = this.values[k * this.numvalues + l][n * this.numvalues + m]
                                    }
                                    if (this.values[n * this.numvalues + m][i * this.numvalues + j] != -1) {
                                        if (this.values[k * this.numvalues + l][n * this.numvalues + m] != -1 && this.values[k * this.numvalues + l][n * this.numvalues + m] != this.values[n * this.numvalues + m][i * this.numvalues + j]) {
                                            return false
                                        }
                                        this.values[k * this.numvalues + l][n * this.numvalues + m] = this.values[n * this.numvalues + m][i * this.numvalues + j]
                                        if (this.values[n * this.numvalues + m][k * this.numvalues + l] != -1 && this.values[n * this.numvalues + m][k * this.numvalues + l] != this.values[n * this.numvalues + m][i * this.numvalues + j]) {
                                            return false
                                        }
                                        this.values[n * this.numvalues + m][k * this.numvalues + l] = this.values[n * this.numvalues + m][i * this.numvalues + j]
                                    } 
                                    if (this.values[n * this.numvalues + m][k * this.numvalues + l] != -1) {
                                        if (this.values[i * this.numvalues + j][n * this.numvalues + m] != -1 && this.values[i * this.numvalues + j][n * this.numvalues + m] != this.values[n * this.numvalues + m][k * this.numvalues + l]) {
                                            return false
                                        }
                                        this.values[i * this.numvalues + j][n * this.numvalues + m] = this.values[n * this.numvalues + m][k * this.numvalues + l]
                                        if (this.values[n * this.numvalues + m][i * this.numvalues + j] != -1 && this.values[n * this.numvalues + m][i * this.numvalues + j] != this.values[n * this.numvalues + m][k * this.numvalues + l]) {
                                            return false
                                        }
                                        this.values[n * this.numvalues + m][i * this.numvalues + j] = this.values[n * this.numvalues + m][k * this.numvalues + l]
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
                                if ((this.values[i * this.numvalues + j][n * this.numvalues + m] == 1 || this.values[n * this.numvalues + m][i * this.numvalues + j] == 1) && (this.values[k * this.numvalues + l][n * this.numvalues + m] == 1 || this.values[n * this.numvalues + m][k * this.numvalues + l] == 1)) {
                                    if (this.values[i * this.numvalues + j][k * this.numvalues + l] == 0) {
                                        return false
                                    }
                                    for (let z = 0; z < this.numvalues; z++) {
                                        if (z != l) {
                                            this.values[i * this.numvalues + j][k * this.numvalues + z] = 0
                                        }
                                        if (z != j) {
                                            this.values[i * this.numvalues + z][k * this.numvalues + l] = 0
                                        }
                                    }
                                    this.values[i * this.numvalues + j][k * this.numvalues + l] = 1
                                    for (let z = 0; z < this.numvalues; z++) {
                                        if (z != l) {
                                            this.values[k * this.numvalues + z][i * this.numvalues + j] = 0
                                        }
                                        if (z != j) {
                                            this.values[k * this.numvalues + l][i * this.numvalues + z] = 0
                                        }
                                    }
                                    this.values[k * this.numvalues + l][i * this.numvalues + j] = 1
                                }
                            }
                        }
                    }
                }
            }
        }
        return true
    }
  },
  beforeMount() { 
    this.initialize()
  }
}
</script>

<template> 

<span class="rounded" style="background-color: lightgray; padding: 5px;float:right">{{format(time_elapsed)}}</span>
  <div v-for="i in numinstructions" v-bind:key="i">{{i}}: <input type="text" v-model="instructions[i-1]"></div>
    <table> 
        <tr>       
            <td v-for="i in numcategories" v-bind:key="i">
                <span>{{i}}. kategorija</span> 
                Slika: <input type="checkbox" v-model="is_image[i-1]" unchecked @change="$update_order=false;$forceUpdate()"><br>
                <input type="text" v-model="category_names[i-1]" @change="check_same();update_order=false;$forceUpdate()">
            </td>
        </tr> 
        <tr v-for="k in numvalues" v-bind:key="k">            
            <td v-for="j in numcategories" v-bind:key="j">
                <input type="text" v-model="category_values[k-1][j-1]" @change="check_too_long();check_same();update_order=false;$forceUpdate()">
                <img v-if="is_image[j-1]==true" alt="No image" style="height: 50px" :src="category_values[k-1][j-1]"> 
            </td>
        </tr> 
    </table>
  <span style=" white-space: pre-wrap;">{{alert}}</span>
    <table> 
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
            <td v-for="i in numvalues*(numcategories-1)" v-bind:key="i" @click="click_cell(j-1,(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues)"
            :class="{wrong: values[j-1][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]!=solution[j-1][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues] 
            && values[j-1][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]!= -1 && mark_error}">
                <span class="checkmark" v-if="values[j-1][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]==1">&#128504;</span>
                <span class="checkmark" v-else-if="values[j-1][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]==0">&#215;</span>
                <span class="checkmark" v-else>?</span>
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
            <td v-for="i in numvalues*(numcategories-Math.floor((j-1)/numvalues)-2)" v-bind:key="i" 
            @click="click_cell((numcategories-1-Math.floor((j-1)/numvalues))*numvalues+(j-1)%numvalues,(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues)"
            :class="{wrong: values[(numcategories-1-Math.floor((j-1)/numvalues))*numvalues+(j-1)%numvalues][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]
            !=solution[(numcategories-1-Math.floor((j-1)/numvalues))*numvalues+(j-1)%numvalues][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]
            && values[(numcategories-1-Math.floor((j-1)/numvalues))*numvalues+(j-1)%numvalues][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]!= -1 && mark_error}">
                <span class="checkmark" v-if="values[(numcategories-1-Math.floor((j-1)/numvalues))*numvalues+(j-1)%numvalues][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]==1">
                &#128504;</span>
                <span class="checkmark" v-else-if="values[(numcategories-1-Math.floor((j-1)/numvalues))*numvalues+(j-1)%numvalues][(Math.floor((i-1)/numvalues)+1)*numvalues+(i-1)%numvalues]==0">&#215;</span>
                <span class="checkmark" v-else>?</span>
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
                <div class="image_container">
                    <img :src="category_values[j-1][i-1]" alt="No image" style="width:100%;">
                    <div :class="{topleft: true, first: i==1, second: i==2, third: i==3, fourth: i==4, fifth: i==5}">{{i}}{{alphabet[j-1]}}</div>
                </div>
            </span>
        </span>
    </div>
    Označi greške<input type="checkbox" v-model="mark_error"> 
    
    <button @click="mode=-1">?</button>
    <button @click="mode=1">&#128504;</button>
    <button @click="mode=0">&#215;</button>
</template>

<style scoped>

table {
  border-collapse: collapse;
  border-right: 0;
  border-bottom: 0;
}
td, th {
  border: 1px solid black;
  text-align: center;
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