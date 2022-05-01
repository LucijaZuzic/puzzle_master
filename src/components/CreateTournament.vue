 
<script>
    import Navbar from './Navbar.vue'
    import { tournamentsRef } from "../main.js"
    import IntegramTable from "./IntegramTable.vue"
    import NonogramTable from "./NonogramTable.vue" 
    import CryptogramTable from './CryptogramTable.vue'
    import NumberCrosswordTable from "./NumberCrosswordTable.vue" 
    import InitialTable from './InitialTable.vue' 
    import { getAuth, onAuthStateChanged } from "firebase/auth"

    export default {
        data() { 
            return {
                user: null,
                start_time: new Date(),
                start_date: new Date(), 
                start: new Date(), 
                end_time: new Date(),
                end_date: new Date(), 
                end: new Date(),
                is_correct_time: false,
                time_alert: "", 
                selectedIntegrams: [],
                selectedNonograms: [],
                selectedNumberCrosswords: [],
                selectedCryptograms: [],
                selectedInitials: []
            }
        },
        methods: {
            checkTime() {
                this.is_correct_time = true
                this.time_alert = ""
                if (this.start >= this.end) {
                    this.is_correct_time = false
                    this.time_alert += "Turnir ne može završiti prije nego što je počeo." 
                    if (this.start < new Date() || this.end < new Date()) { 
                        if (this.time_alert != "") {
                            this.time_alert += " "
                        }
                        this.time_alert += "Turnir se ne može odvijati u prošlosti.";
                    } 
                } else if (this.start < new Date() || this.end < new Date()) {
                    this.is_correct_time = false
                    this.time_alert += "Turnir se ne može odvijati u prošlosti."; 
                } 
                return this.is_correct_time
            },
            selectIntegrams(integrams) {
                this.selectedIntegrams = []
                for (let i = 0; i < integrams.length; i++) {
                    this.selectedIntegrams.push(integrams[i].id)
                }
            },
            selectNonograms(nonograms) {
                this.selectedNonograms = []
                for (let i = 0; i < nonograms.length; i++) {
                    this.selectedNonograms.push(nonograms[i].id)
                }
            },
            selectNumberCrosswords(numberCrosswords) {
                this.selectedNumberCrosswords = []
                for (let i = 0; i < numberCrosswords.length; i++) {
                    this.selectedNumberCrosswords.push(numberCrosswords[i].id)
                }
            },
            selectCryptograms(cryptograms) {
                this.selectedCryptograms = []
                for (let i = 0; i < cryptograms.length; i++) {
                    this.selectedCryptograms.push(cryptograms[i].id)
                } 
            },
            selectInitials(initials) {
                this.selectedInitials = []
                for (let i = 0; i < initials.length; i++) {
                    this.selectedInitials.push(initials[i].id)
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
            store() {    
                tournamentsRef.add({
                    organizer: this.user.uid,
                    start: this.start, 
                    end: this.end,
                    selectedIntegrams: this.selectedIntegrams,
                    selectedNonograms: this.selectedNonograms, 
                    selectedNumberCrosswords: this.selectedNumberCrosswords,
                    selectedCryptograms: this.selectedCryptograms,
                    selectedInitials: this.selectedInitials
                }).then(() => {this.new_async(this.$refs.store_success.show(), 1000).then(() => {this.$router.push("/searchtournament")}) })
            }, 
            writeTimeToStart() {
                this.start.setHours(this.start_time.getHours());
                this.start.setMinutes(this.start_time.getMinutes());
                this.start.setSeconds(this.start_time.getSeconds());
                this.checkTime()
            },
            writeDateToStart() { 
                this.start.setFullYear(this.start_date.getFullYear())
                this.start.setMonth(this.start_date.getMonth())
                this.start.setDate(this.start_date.getDate())
                this.checkTime()
            },
            writeTimeToEnd() {
                this.end.setHours(this.end_time.getHours())
                this.end.setMinutes(this.end_time.getMinutes())
                this.end.setSeconds(this.end_time.getSeconds())
                this.checkTime()
            },
            writeDateToEnd() { 
                this.end.setFullYear(this.end_date.getFullYear())
                this.end.setMonth(this.end_date.getMonth())
                this.end.setDate(this.end_date.getDate())
                this.checkTime()
            },
        },
        mounted() {   
            const auth = getAuth()
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
            });
            this.checkTime()
        },
        components: {
    Navbar,
    IntegramTable,
    NonogramTable,
    NumberCrosswordTable,
    CryptogramTable,
    InitialTable
},
    }
</script>

<template> 
  <Navbar></Navbar>  
  <button></button>
  <body class="mybody"> 
    <va-time-input v-model="start_time" @update:model-value="writeTimeToStart()"/>
    <va-date-input v-model="start_date" @update:model-value="writeDateToStart()"/>
    <va-time-input v-model="end_time" @update:model-value="writeTimeToEnd()"/>
    <va-date-input v-model="end_date" @update:model-value="writeDateToEnd()"/>
    <div class="myrow" v-if="!is_correct_time">
        <va-alert style="white-space: pre-wrap;" color="warning" title="Nije odabrano ispravno vrijeme" center class="mb-4">
            {{time_alert}}
        </va-alert> 
    </div> 
    <br>
    <h2 class="display-2">Integrami</h2>
    <IntegramTable @selected-integrams="selectIntegrams" selectMode="multiple"></IntegramTable> 
    <br>
    <h2 class="display-2">Nonogrami</h2>
    <NonogramTable  @selected-nonograms="selectNonograms" selectMode="multiple"></NonogramTable> 
    <br>
    <h2 class="display-2">Brojevne križaljke</h2>
    <NumberCrosswordTable  @selected-number-crosswords="selectNumberCrosswords"  selectMode="multiple"></NumberCrosswordTable> 
    <br> 
    <h2 class="display-2">Kriptogrami</h2>
    <CryptogramTable  @selected-cryptograms="selectCryptograms"  selectMode="multiple"></CryptogramTable>  
    <br> 
    <h2 class="display-2">Inicijalne osmosmjerke</h2>
    <InitialTable  @selected-initials="selectInitials"  selectMode="multiple"></InitialTable>  
    <div class="myrow" v-if="!(selectedIntegrams.length > 0 || selectedNonograms.length > 0 || selectedNumberCrosswords.length > 0 || selectedCryptograms.length > 0 || selectedInitials.length > 0)">
        <va-alert style="white-space: pre-wrap;" color="warning" title="Nije odabrana niti jedna zagonetka" center class="mb-4">
            Odaberite barem jednu zagoentku da biste organizirali turnir.
        </va-alert> 
    </div> 
    <va-button v-if="user && is_correct_time && (selectedIntegrams.length > 0 || selectedNonograms.length > 0 || selectedNumberCrosswords.length > 0 || selectedCryptograms.length > 0 || selectedInitials.length > 0)" @click="store()">Spremi turnir</va-button>
    <va-modal ref="no_user" hide-default-actions message="Ne možete urganizirati turnir jer niste prijavljeni." stateful /> 
    <va-modal ref="store_success" hide-default-actions message="Novi turnir je uspješno spremljen." stateful />
  </body>
</template>

<style>
</style>
