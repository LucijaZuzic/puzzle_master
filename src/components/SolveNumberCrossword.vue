<script>
import { numberCrosswordsRef } from "../main.js"

export default {
  params: ["id"],
  data() {
    return {   
        showModal: false,
        time_elapsed: 0,
        description: "This",
        source: "Feniks",
        author: "",
        updater: "",
        rows: 0,
        victory: false,
        numbers_by_len: [],
        selected_number: 0,
        selected_number_x: -1,
        selected_number_y: -1,
        solution: [[1,2,3],[4,5,6],[-1,-1,3]],
        is_special: [[0,0,0],[1,1,0],[0,0,0]],
        is_revealed: [[1,1,0],[0,0,0],[0,0,0]],
        number_positions: [],
        time_created: '',
        last_updated: '',
        number_orientation: true,
        warning: '',
        show_error:  false
    }
  },
  methods: {
        initialize() {
            this.rows = this.solution.length
            this.columns = this.solution[0].length
            this.values = []
            for (let i = 0; i < this.rows; i++) {
                let one_row = []
                for (let j = 0; j < this.columns; j++) {
                    if (this.solution[i][j] == -1) {
                        one_row.push(-1)
                    } else {
                        one_row.push(10)
                    }
                }
                this.values.push(one_row)
            }
            this.parse_numbers()
            this.add_revealed()
        },
        add_revealed() {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    if (this.is_revealed[i][j]) {
                        this.values[i][j] = this.solution[i][j]
                    } 
                }
            }
        },
        show_solution() {
            clearInterval(this.interval)
            this.values = []
            for (let i = 0; i < this.rows; i++) {
                let one_row = []
                for (let j = 0; j < this.columns; j++) {
                    one_row.push(this.solution[i][j])
                }
                this.values.push(one_row)
            }
            this.$forceUpdate()
        },
        parse_numbers() {
            let numbers = []
            let maxlen = 0
            for (let i = 0; i < this.rows; i++) {
                let number = '';
                for (let j = 0; j < this.columns; j++) {
                    if (this.solution[i][j] == 10) {
                        this.numbers_by_len = []
                        return
                    }
                    if (this.solution[i][j] >= 0 && this.solution[i][j] < 10) {
                        number += this.solution[i][j].toString();
                    } else {
                        if (number != '') {
                            numbers.push(number)
                            if (number.length > maxlen) {
                                maxlen = number.length
                            }
                            number = ''
                        }
                    }
                }
                if (this.solution[i][this.columns - 1] >= 0 && this.solution[i][this.columns - 1] < 10) {
                    numbers.push(number)
                    if (number.length > maxlen) {
                        maxlen = number.length
                    }
                    number = ''
                }
            }
            for (let i = 0; i < this.columns; i++) {
                let number = '';
                for (let j = 0; j < this.rows; j++) {
                    if (this.solution[j][i] >= 0 && this.solution[j][i] < 10) {
                        number += this.solution[j][i].toString()
                    } else {
                        if (number != '') {
                            numbers.push(number)
                            if (number.length > maxlen) {
                                maxlen = number.length
                            }
                            number = ''
                        }
                    }
                }
                if (this.solution[this.rows - 1][i] >= 0  && this.solution[this.rows - 1][i] < 10) {
                    numbers.push(number)
                    if (number.length > maxlen) {
                        maxlen = number.length
                    }
                    number = ''
                }
            }
            numbers.sort()
            this.numbers_by_len = []
            this.number_positions = []
            for (let i = 0; i < maxlen; i++) {
                let numbers_of_len = []
                let positions = []
                this.numbers_by_len.push(numbers_of_len)
                this.number_positions.push(positions)
            } 
            for (let i = 0; i < numbers.length; i++) {
                this.numbers_by_len[numbers[i].length - 1].push(numbers[i])
                this.number_positions[numbers[i].length - 1].push([-1,-1,-1])
            }
            let num_lens = 0
            let number_of_numbers = 0
            for (let i = 1; i < maxlen; i++) {
                if (this.numbers_by_len[i].length > 0) {
                    number_of_numbers += this.numbers_by_len[i].length
                    num_lens++
                }
            } 
            this.page_length = Math.ceil(number_of_numbers / num_lens)
        },
        remove_number() {
            if (this.number_positions[this.selected_number_x][this.selected_number_y][0] == -1) {
                return
            }
            if (this.victory) {
                return;
            }
                let x = this.number_positions[this.selected_number_x][this.selected_number_y][0]
                let y = this.number_positions[this.selected_number_x][this.selected_number_y][1]
                let orientation_provisional = this.number_positions[this.selected_number_x][this.selected_number_y][2]
                if (orientation_provisional == true) {
                    let end = x
                    while (end + 1 != this.solution.length && this.values[end + 1][y] != -1) {
                        this.values[end][y] = 10
                        end++
                    }
                    this.values[end][y] = 10
                } else {
                    let end = y
                    while (end + 1 != this.solution.length && this.values[x][end + 1] != -1) {
                        this.values[x][end] = 10
                        end++
                    }
                    this.values[x][end] = 10
                }
                this.number_positions[this.selected_number_x][this.selected_number_y] = [-1,-1,-1]
                let prev_num = this.selected_number
                let prev_x = this.selected_number_x
                let prev_y = this.selected_number_y
                let prev_o = this.number_orientation
                for (let i = 0; i < this.number_positions.length; i++) {
                    for(let j = 0; j < this.number_positions[i].length; j++) {
                        if (this.number_positions[i][j][0] != -1) {
                            this.selected_number = this.numbers_by_len[i][j]
                            this.selected_number_x = i
                            this.selected_number_y = j
                            this.number_orientation = this.number_positions[i][j][2]
                            this.place_number(true, this.number_positions[i][j][0], this.number_positions[i][j][1])
                        }
                    }
                }
                this.selected_number = prev_num
                this.selected_number_x = prev_x
                this.selected_number_y = prev_y
                this.number_orientation = prev_o
                this.add_revealed()
        },
        place_number(reset, x, y) {
            if (this.victory) {
                return;
            }
            if (!this.selected_number) {
                return
            }
            if (this.values[x][y] == -1) {
                if (!reset) {
                    this.$refs.barrier.show()
                }
                return
            }
            if (!reset && this.number_positions[this.selected_number_x][this.selected_number_y][0] != -1) {
                if (!reset) {
                    this.$refs.set.show()
                }
                return
            }
            if (this.number_orientation == true) {
                if (x == 0 || this.values[x - 1][y] == -1) {
                    let end = x
                    let number_match = true
                    while (end + 1 != this.solution.length && this.values[end + 1][y] != -1) {
                        if(this.values[end][y] != 10 && this.values[end][y] != parseInt(this.selected_number.toString()[end - x])) {
                            number_match = false
                        }
                        end++; 
                    }
                    if (end - x + 1 == this.selected_number.length && number_match) {
                        let end = x
                        while (end + 1 != this.solution.length && this.values[end + 1][y] != -1) {
                            this.values[end][y] = parseInt(this.selected_number.toString()[end - x])
                            end++
                        }
                        this.values[end][y] = parseInt(this.selected_number.toString()[end - x])
                        this.number_positions[this.selected_number_x][this.selected_number_y] = [x,y,true]
                    } else {
                        if (!number_match) {
                            if (!reset) {
                                this.$refs.vertical_match.show()
                            }
                        } else {
                            if (!reset) {
                                this.$refs.vertical_length.show()
                            }
                        }
                    }
                } else {
                    if (!reset) {
                        this.$refs.vertical_begin.show()
                    }
                }
            } else {
                if (y == 0 || this.values[x][y - 1] == -1) {
                    let end = y
                    let number_match = true
                    while (end + 1 != this.solution[0].length && this.values[x][end + 1] != -1) {
                        if(this.values[x][end] != 10 && this.values[x][end] != parseInt(this.selected_number.toString()[end - y])) {
                            number_match = false
                        }
                        end++; 
                    }
                    if (end - y + 1 == this.selected_number.length && number_match) {
                        let end = y
                        while (end + 1 != this.solution[0].length && this.values[x][end + 1] != -1) {
                            this.values[x][end] = parseInt(this.selected_number.toString()[end - y])
                            end++
                        }
                        this.values[x][end] = parseInt(this.selected_number.toString()[end - y])
                        this.number_positions[this.selected_number_x][this.selected_number_y] = [x,y,false]
                    } else {
                        if (!number_match) {
                            if (!reset) {
                                this.$refs.horizontal_match.show()
                            }
                        } else {
                            if (!reset) {
                                this.$refs.horizontal_length.show()
                            }
                        }
                    }
                } else {
                    if (!reset) {
                        this.$refs.horizontal_begin.show()
                    }
                }
            }
        },
        check_victory() {
            this.victory = true;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    if (this.values[i][j] != this.solution[i][j]) {
                        this.victory = false;
                        return;
                    }
                }
            }
            if (this.victory) {
                clearInterval(this.interval)
                this.$refs.solved.show()
                this.selected_number = -1;
                this.selected_number_x = -1;
                this.selected_number_y = -1;
            }
        },
        startTimer() {
            this.time_elapsed = 0
            clearInterval(this.interval)
            this.interval = setInterval(() => (this.time_elapsed += 1), 1000);
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
        count_special() {
          for (let i = 0; i < this.is_special.length; i++) {
              for (let j = 0; j < this.is_special[i].length; j++) {
                  if (this.is_special[i][j]) {
                      return true
                  }
              }
          }
        },
        select_number(i,j) {
            if (this.victory) {
                return;
            }
            this.selected_number_x=i;
            this.selected_number_y=j;
            this.selected_number=this.numbers_by_len[i][j];
        },
        string_to_array(array_string) {
                if (!array_string) {
                    return []
                }
                if (array_string[1] == '[') {
                    let array = array_string.substring(2, array_string.length - 2).split("],[")
                    for (let i = 0; i < array.length; i++) {
                        array[i] = array[i].split(",")
                        for(let j = 0; j < array[i].length; j++) {
                            array[i][j] = parseInt(array[i][j])
                        }
                    }
                    return array
                } else {
                    let array = array_string.substring(1, array_string.length - 1).split(",")
                    return array
                }
        },
        fetch_puzzle() {
            let params_id= this.$route.params.id
            let string_solution = []
            let string_is_special = []
            let string_is_revealed = []
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
            numberCrosswordsRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let id = childSnapshot.id;
                    if (id == params_id) {
                        string_solution = funct_ref(childSnapshot.get('solution'))
                        string_is_special = funct_ref(childSnapshot.get('is_special'))
                        string_is_revealed = funct_ref(childSnapshot.get('is_revealed'))
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
                    this.is_revealed = string_is_revealed
                    this.description = string_description
                    this.author = string_author
                    this.updater = string_updater
                    this.is_public = string_is_public
                    this.permissions = string_permissions
                    this.source = string_source
                    this.time_created = string_time_created
                    this.last_updated = string_last_updated
                    this.initialize()
                    this.$forceUpdate()
                } else {
                    this.$refs.no_puzzle.show()
                    this.$router.push("/searchnonogram");
                }
            })
      }
    },
    beforeMount() {
        this.initialize()
        this.fetch_puzzle() 
    },
    mounted() {
        this.$refs.show_error.show()
        this.startTimer()
    }
}
</script>

<template>
    <div class="myrow">
        <va-switch style="float: left" v-model="number_orientation" true-inner-label="Okomito" false-inner-label="Vodoravno" class="mr-4" />  
        <va-checkbox class="flex mb-2 md6" style="float: left" label="Prikaži greške" v-model="show_error" />
        <va-chip style="float: right" outline>{{format(time_elapsed)}}</va-chip>
    </div>
    <div class="myrow">
        <table class="numbers_table">
            <tr v-for="i in (rows)" v-bind:key="i">
                <td v-for="j in (columns)" v-bind:key="j" @click="place_number(false,i-1,j-1);check_victory();$forceUpdate()" 
                :class="{wrong: values[i - 1][j - 1] != solution[i - 1][j - 1] && values[i-1][j-1] != 10 && show_error, numbers: true, black: values[i - 1][j - 1] == -1,
                help: is_revealed[i - 1][j - 1], special: is_special[i - 1][j - 1]}">
                    <span v-if="values[i - 1][j - 1] == 10 || values[i - 1][j - 1] == -1">&nbsp;</span>
                    <span v-else>{{values[i - 1][j - 1]}}</span>
                </td>
            </tr>
        </table>
    </div>   
    <br> 
    <div class="myrow" v-if="count_special()"> 
            Rješenje:
            <span v-for="i in (rows)" v-bind:key="i">
                <span v-for="j in (columns)" v-bind:key="j">
                    <va-chip outline square style="margin-left:5px" v-if="is_special[i - 1][j - 1]">
                        <span v-if="values[i - 1][j - 1] != 10">
                            {{values[i - 1][j - 1]}}
                        </span>
                        <span v-else>?</span>
                    </va-chip>
                </span>
            </span> 
    </div>   
    <div class="myrow">
        <span v-for="(numbers_of_length, i) in numbers_by_len" v-bind:key="i">
            <va-chip outline v-if="numbers_of_length.length > 0 && i > 0" style="margin-left: 2%;margin-top: 2%">
                <va-chip>{{i + 1}}</va-chip>
                <va-list fit v-for="page_number in Math.ceil(numbers_of_length.length / page_length)" v-bind:key="page_number">
                    <va-list-item v-for="j in Math.min(numbers_of_length.length, page_number * page_length) - ((page_number - 1) * page_length)" v-bind:key="j">
                        <span oncontextmenu="return false;" :class="{used: number_positions[i][(page_number - 1) * page_length + j - 1][0] != -1,
                        selected: selected_number_x == i && selected_number_y == (page_number - 1) * page_length + j - 1 &&
                        selected_number == numbers_of_length[(page_number - 1) * page_length + j - 1]}"
                        @click.left="select_number(i,(page_number - 1) * page_length + j - 1);$forceUpdate()" 
                        @click.right="select_number(i,(page_number - 1) * page_length + j - 1);remove_number();$forceUpdate()"> 
                        {{numbers_of_length[(page_number - 1) * page_length + j - 1]}}
                        </span>
                    </va-list-item> 
                </va-list> 
            </va-chip>
        </span>
        <br> 
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
        <va-chip style="margin-left: 1%;margin-top: 1%">Autor zagonetke: {{author}}</va-chip>  
        <va-chip style="margin-left: 1%;margin-top: 1%">Vrijeme kreiranja: {{time_created.toLocaleString()}}</va-chip>  
        <br>
        <va-chip style="margin-left: 1%;margin-top: 1%">Zadnji ažurirao: {{updater}}</va-chip> 
        <va-chip style="margin-left: 1%;margin-top: 1%">Vrijeme zadnje izmjene: {{last_updated.toLocaleString()}}</va-chip>
    </div>
    <div class="myrow">
        <va-button @click="show_solution();$forceUpdate()">Otkrij sva polja</va-button>
    </div>    
    <va-modal ref="show_error" message="Želite li da greške budu uznačene?" @ok="show_error=true" stateful ok-text="Da" cancel-text="Ne" />
    <va-modal ref="barrier" hide-default-actions message="Broj ne može započeti na barijeri." stateful />
    <va-modal ref="set" hide-default-actions message="Broj je već postavljen." stateful />
    <va-modal ref="vertical_match" hide-default-actions message="Broj nije postavljen okomito jer se već upisane znamenke ne podudaraju." stateful />
    <va-modal ref="vertical_length" hide-default-actions message="Broj nije postavljen okomito jer nema dovoljno slobodnih mjesta." stateful />
    <va-modal ref="vertical_begin" hide-default-actions message="Broj nije postavljen okomito jer prethodni element stupca nije barijera niti početak stupca." stateful />
    <va-modal ref="horizontal_match" hide-default-actions message="Broj nije postavljen vodoravno jer se već upisane znamenke ne podudaraju." stateful />
    <va-modal ref="horizontal_length" hide-default-actions message="Broj nije postavljen vodoravno jer nema dovoljno slobodnih mjesta." stateful />
    <va-modal ref="horizontal_begin" hide-default-actions message="Broj nije postavljen vodoravno jer prethodni element reda nije barijera niti početak reda." stateful />
    <va-modal ref="solved" hide-default-actions message="Uspješno ste riješili zagonetku." stateful />
    <va-modal ref="no_puzzle" hide-default-actions message="Ne postoji zagonetka s tim brojem." stateful />
</template>

<style scoped>
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
    width: 24px;
    height: 24px;
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


.help {
    font-weight: bold;
    background-color: #90beee;
} 

.used {
    text-decoration: line-through;
}
.selected {
    color: green;
}
.wrong {
    color: red;
}

</style>