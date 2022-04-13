<script> 

import { updateDoc } from "@firebase/firestore"
import { nonogramsRef } from "../main.js"

export default {
  data() {
    return {
        warning: "",
        author: "",   
        updater: "",
        time_created: '',
        last_updated: '',
        is_public: false,
        permissions: [],
        collaborator: "",
        description: '',
        solution: [],
        blocked: false,
        source: '',
        colnum: 20,
        rownum: 20,
        maxcol: 0,
        victory: false,
        maxrow: 0,
        row_colors: [],
        col_colors: [],
        mode: 0,
        time_elapsed: 0,
        drag: false,
        prev_x: -1,
        prev_y: -1,
        num_colors: 2,
        show_error:  false,
        wrong_colors: [false, false],
        colors: ["#FFFFFF", "#000000"]
    }
  },
  methods: {
    reset() {
        this.values = new Array()
        for (let i = 0; i < this.rownum; i++) {
            let one_arr = new Array()
            for (let j = 0; j < this.colnum; j++) {
                one_arr.push(0)
            }
            this.values.push(one_arr)
        }  
        this.$forceUpdate()
    },
    parse_sequence() {
        this.getrow()
        this.getcol()
        this.getmaxrow()
        this.getmaxcol()
        this.colorcol()
        this.colorrow()
    },
    initialize() { 
        this.columns = new Array()
        this.rows = new Array()
        this.col_colors = new Array()
        this.row_colors = new Array()
        for (let i = 0; i < this.colnum; i++) {
            this.col_colors.push([])
            this.columns.push([])
        }
        for (let i = 0; i < this.rownum; i++) {
            this.row_colors.push([])
            this.rows.push([])
        }
        this.values = new Array()
        for (let i = 0; i < this.rownum; i++) {
            let one_arr = new Array()
            for (let j = 0; j < this.colnum; j++) {
                one_arr.push(0)
            }
            this.values.push(one_arr)
        } 
        this.parse_sequence()
    },
    increment(x, y, ismouseover) {
        if (this.victory) {
            return
        }
        if (this.blocked == true) {
            return
        }
        if (ismouseover && !this.drag) {
            return;
        }
        this.values[x][y] = this.mode
        document.getElementById("cell" + x + ":" + y).style.backgroundColor = this.mode
        this.values = [... this.values]
        this.checkvictory()  
        this.parse_sequence()
        this.$forceUpdate()
    },
    update_colors() {
        for (let i = 0; i < this.rownum; i++) {
            for (let j = 0; j < this.colnum; j++) {
                if (document.getElementById("cell" + i + ":" + j)) {
                    document.getElementById("cell" + i + ":" + j).style.backgroundColor = this.colors[this.values[i][j]]
                }
            }   
        }
    },
    getcol() {
        let color_val = new Array()
        let val = new Array()
        for (let i = 0; i < this.colnum; i++) {
            let color = -1
            let prev_color = -1
            let color_array = new Array()
            let one_arr = new Array()
            let current = 0
            for (let j = 0; j < this.rownum; j++) {
                color = this.solution[j][i]
                if (color == prev_color) {
                    if (color != 0) {
                        current += 1
                    }
                } else {
                    if (current != 0 && prev_color != 0) {
                        color_array.push(prev_color)
                        one_arr.push(current)
                    }
                    current = 1
                }
                prev_color = color
            }
            if (current != 0 && prev_color != 0) {
                color_array.push(prev_color)
                one_arr.push(current)
            }
            color_val.push(color_array)
            val.push(one_arr) 
        }
        this.col_colors = color_val
        this.columns = val
    },
    colorcol() {
        for (let i = 0; i < this.col_colors.length; i++) {
            for (let j = 0; j < this.col_colors[i].length; j++) {
                if (document.getElementById('column' + i + ':' + j)) {
                    document.getElementById('column' + i + ':' + j).style.color = this.colors[this.col_colors[i][j]]
                }
            }
        }
    },
    show_solution() {
        for (let i = 0; i < this.rownum; i++) {
            for (let j = 0; j < this.colnum; j++) {
                this.values[i][j] = this.solution[i][j]
            }
        }
        this.checkvictory()  
        this.update_colors()
        this.$forceUpdate()
    },
    getrow() {
        let color_val = new Array()
        let val = new Array()
        for (let i = 0; i < this.rownum; i++) {
            let color = -1
            let prev_color = -1
            let color_array = new Array()
            let one_arr = new Array()
            let current = 0
            for (let j = 0; j < this.colnum; j++) {
                color = this.solution[i][j]
                if (color == prev_color) {
                    if (color != 0) {
                        current += 1
                    }
                } else {
                    if (current != 0 && prev_color != 0) {
                        color_array.push(prev_color)
                        one_arr.push(current)
                    }
                    current = 1
                }
                prev_color = color
            }
            if (current != 0 && prev_color != 0) {
                color_array.push(prev_color)
                one_arr.push(current)
            }
            color_val.push(color_array)
            val.push(one_arr) 
        }
        this.row_colors = color_val
        this.rows = val
    },
    colorrow() {
        for (let i = 0; i < this.row_colors.length; i++) {
            for (let j = 0; j < this.row_colors[i].length; j++) {
                if (document.getElementById('row' + i + ':' + j)) {
                    document.getElementById('row' + i + ':' + j).style.color = this.colors[this.row_colors[i][j]]
                }
            }
        }
    },
    getmaxrow() {
        let val = 0
        for (let i = 0; i < this.colnum; i++) {
            if (this.columns[i].length > val) {
                val = this.columns[i].length
            }
        }
        this.maxrow = val

    },
    getmaxcol() { 
        let val = 0
        for (let i = 0; i < this.rownum; i++) {
            if (this.rows[i].length > val) {
                val = this.rows[i].length
            }
        }
        this.maxcol = val
    }, 
    after_click(i) {
        this.mode = i 
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
    checkvictory() {
        this.victory = true;
        for (let i = 0; i < this.values.length; i++) {
            for (let j = 0; j < this.values[i].length; j++) {
                if (this.values[i][j] != this.solution[i][j]) { 
                    this.victory = false;
                    return;
                }
            }
        }
    },
    fetch_puzzle() {
        let params_id= this.$route.params.id
        let string_solution = []
        let string_colors = []
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
        nonogramsRef.get().then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let id = childSnapshot.id;
                if (id == params_id) {
                    string_solution = funct_ref(childSnapshot.get('solution'))
                    string_colors = childSnapshot.get('colors') 
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
                this.colors = string_colors
                this.num_colors = this.colors.length
                this.description = string_description
                this.author = string_author
                this.updater = string_updater
                this.is_public = string_is_public
                this.permissions = string_permissions
                this.source = string_source
                this.time_created = string_time_created
                this.last_updated = string_last_updated
                this.num_colors = this.colors.length
                this.rownum = this.solution.length
                this.colnum = this.solution[0].length
                this.initialize()
                this.$forceUpdate()
            } else {
                this.$refs.no_puzzle.show()
                this.$router.push("/searchnonogram");
            }
        })
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
  }, 
  beforeMount() { 
    this.fetch_puzzle() 
  },
  beforeUpdate() {
    this.update_colors()
    this.parse_sequence()
  },
  mounted() {
    for (let i = 0; i < this.num_colors; i++) {
        document.getElementById("colorbutton" + (i)).style.backgroundColor = this.colors[i]
    } 
    this.$refs.show_error.show()
    this.startTimer()
  },
  updated() {
    this.update_colors()
    for (let i = 0; i < this.num_colors; i++) {
        document.getElementById("colorbutton" + (i)).style.backgroundColor = this.colors[i]
    } 
    this.colorcol()
    this.colorrow()
  }
}
</script>

<template> 
    <div class="myrow">
        <va-checkbox class="flex mb-2 md6" style="float: left" label="Prikaži greške" v-model="show_error" />
        <va-chip style="float: right" outline>{{format(time_elapsed)}}</va-chip>
    </div>
    <div class="myrow">
        <table border='2'>
            <tr v-for="column_number in maxrow" 
                v-bind:key="column_number"> 
                <td v-if="column_number==1" :colspan="maxcol" :rowspan="maxrow"></td> 
                <td v-for="column_index in colnum"
                v-bind:key=column_index>
                    <span class="numbers" :id="'column' + (column_index-1) + ':' + (column_number-1-maxrow+columns[column_index-1].length)">
                        {{columns[column_index-1][column_number-1-maxrow+columns[column_index-1].length]}}
                    </span>
                </td>
            </tr>
            <tr v-if="maxrow==0">
                <td></td>
                <td v-for="column_index in colnum"
                v-bind:key="column_index">
                    &nbsp; 
                </td></tr>
            <tr v-for="row_index in rownum" 
            v-bind:key="row_index">
                <td v-for="row_number in maxcol" 
                v-bind:key="row_number">
                    <span class="numbers" :id="'row' + (row_index-1) + ':' + (row_number-1-maxcol+rows[row_index - 1].length)">
                        {{rows[row_index - 1][row_number-1-maxcol+rows[row_index - 1].length]}}
                    </span>
                </td> 
                <td v-if="maxcol==0"></td>
                <td v-for="column_index in colnum" v-bind:key="column_index"   @mouseover="increment(row_index - 1, column_index - 1,true)"
                @click="increment(row_index - 1, column_index - 1,false)" :id="'cell' + (row_index - 1) + ':' + (column_index - 1)">
                <va-icon  
                v-if="show_error && solution[row_index - 1][column_index - 1] != values[row_index - 1][column_index - 1] && values[row_index - 1][column_index - 1] != 0" name="error" >
                </va-icon>
                <span v-else>&nbsp;</span></td>
            </tr>
        </table>
    </div> 
    <br> 
    <div class="myrow">
        <va-button @click="reset()">Resetiraj</va-button>
    </div> 
    <br> 
    
    <div class="myrow">
        <va-icon v-if="wrong_colors[0]==true" name="error" color="danger"></va-icon>
        <button class="mr-2" style="width:28px;height:28px;display:inline-block;background-color: white;border-radius: 50%" :id="'colorbutton' + 0" @click="mode=0"></button>
        <div style="display:inline-block" v-for=" i in num_colors - 1" v-bind:key="i">
            <va-icon style="position:relative;left:10px" v-if="wrong_colors[i]==true" name="error" color="danger"></va-icon>
            <button class="mr-2"  style="width:28px;height:28px;display:inline-block;background-color: black; border: 1px solid black;border-radius: 50%"  
            @click="after_click(i)" :id="'colorbutton' + (i)"></button>
        </div>
    </div> 
    <br> 
    <div class="myrow">
        <va-checkbox style="display: inline-block;margin-left: 2%;margin-top: 2%" class="flex mb-2 md6" v-model="drag" /> Bojanje prelaskom miša 
    </div> 
    <br> 
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
    <va-modal ref="no_puzzle" hide-default-actions message="Ne postoji zagonetka s tim brojem." stateful />
</template>

<style scoped>
table {
    display: inline-table;
    border: 1px solid black;
    border-collapse: collapse
}
tr {
    border: 1px solid black;
    border-collapse: collapse
}
td {
    border: 1px solid black;
    width: 28px;
    height: 28px;
    text-align: center;
    vertical-align: middle;
    border-collapse: collapse
}
.numbers {
    font-weight: bold;
    display: block;
    position: relative;
    width: 25px;
    text-align: center
} 
</style>