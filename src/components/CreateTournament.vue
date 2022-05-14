 
<script>
    import Navbar from './Navbar.vue'
    import { tournamentsRef } from "../main.js"
    import IntegramTable from "./IntegramTable.vue"
    import NonogramTable from "./NonogramTable.vue" 
    import CryptogramTable from './CryptogramTable.vue'
    import NumberCrosswordTable from "./NumberCrosswordTable.vue" 
    import EightTable from './EightTable.vue'
    import NumberLetterTable from "./NumberLetterTable.vue" 
    import InitialTable from './InitialTable.vue' 
    import { getAuth, onAuthStateChanged } from "firebase/auth" 

    export default {
        data() { 
            return {
                value: 'integram',
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
                selectedNumberLetters: [],
                selectedInitials: [],
                selectedEights: []
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
            selectNumberLetters(numberLetters) {
                this.selectedNumberLetters = []
                for (let i = 0; i < numberLetters.length; i++) {
                    this.selectedNumberLetters.push(numberLetters[i].id)
                } 
            },
            selectInitials(initials) {
                this.selectedInitials = []
                for (let i = 0; i < initials.length; i++) {
                    this.selectedInitials.push(initials[i].id)
                }
            },
            selectEights(eights) {
                this.selectedEights = []
                for (let i = 0; i < eights.length; i++) {
                    this.selectedEights.push(eights[i].id)
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
                    selectedNumberLetters: this.selectedNumberLetters,
                    selectedInitials: this.selectedInitials,
                    selectedEights: this.selectedEights
                }).then(() => {this.new_async(this.$vaToast.init("Novi turnir je uspješno spremljen."), 1000).then(() => {this.$router.push("/search-tournament")}) })
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
                this.new_async(this.$vaToast.init("Ne možete kreirati turnir jer niste prijavljeni."), 1000).then(() => {this.$router.push("/login")})  
            }
            return true
            });
            this.checkTime()
        },
        components: {
    Navbar,
    IntegramTable,
    NonogramTable,
    NumberCrosswordTable,
    CryptogramTable,
    InitialTable,
    EightTable,
    NumberLetterTable
},
    }
</script>

<template> 
  <Navbar></Navbar>   
  <body class="mybody"> 
    <va-time-input v-model="start_time" @update:model-value="writeTimeToStart()"/>
    <va-date-input v-model="start_date" @update:model-value="writeDateToStart()"/>
    <va-time-input v-model="end_time" @update:model-value="writeTimeToEnd()"/>
    <va-date-input v-model="end_date" @update:model-value="writeDateToEnd()"/>
    <div class="myrow" v-if="!is_correct_time">
        <va-alert style="white-space: pre-wrap;" color="danger" title="Nije odabrano ispravno vrijeme" center class="mb-4">
            {{time_alert}}
        </va-alert> 
    </div> 
    <br>
    <br>
    <va-tabs v-model="value"  style="width: 100%;">
        <template #tabs> 
            <va-tab
                label="Integrami"
                name="integram"
            />
            <va-tab
                label="Nonogrami"
                name="nonogram"
            />
            <va-tab
                label="Brojevne križaljke"
                name="numberCrossword"
            />
            <va-tab
                label="Kriptogrami"
                name="cryptogram"
            />
            <va-tab
                label="Isti broj - Isto slovo"
                name="numberLetter"
            />
            <va-tab
                label="Inicijalne osmosmjerke"
                name="initial"
            />
            <va-tab
                label="Osmosmjerke"
                name="eight"
            />
        </template>
    </va-tabs>
    <IntegramTable v-if="value=='integram'" @selected-integrams="selectIntegrams" selectMode="multiple"></IntegramTable> 

    <NonogramTable v-if="value=='nonogram'" @selected-nonograms="selectNonograms" selectMode="multiple"></NonogramTable> 

    <NumberCrosswordTable v-if="value=='numberCrossword'" @selected-number-crosswords="selectNumberCrosswords"  selectMode="multiple"></NumberCrosswordTable> 

    <CryptogramTable v-if="value=='cryptogram'" @selected-cryptograms="selectCryptograms"  selectMode="multiple"></CryptogramTable> 

    <NumberLetterTable v-if="value=='numberLetter'" @selected-number-letters="selectNumberLetters"  selectMode="multiple"></NumberLetterTable>  

    <InitialTable v-if="value=='initial'" @selected-initials="selectInitials"  selectMode="multiple"></InitialTable>  

    <EightTable v-if="value=='eight'" @selected-eights="selectEights"  selectMode="multiple"></EightTable>  
    
    <div class="myrow" v-if="!(selectedIntegrams.length > 0 || selectedNonograms.length > 0 || selectedNumberCrosswords.length > 0 || selectedCryptograms.length > 0 || selectedInitials.length > 0)">
        <va-alert style="white-space: pre-wrap;" color="danger" title="Nije odabrana niti jedna zagonetka" center class="mb-4">
            Odaberite barem jednu zagoentku da biste organizirali turnir.
        </va-alert> 
    </div> 
    <va-button v-if="user && is_correct_time && (selectedIntegrams.length > 0 || selectedNonograms.length > 0 || selectedNumberCrosswords.length > 0 || selectedCryptograms.length > 0 || selectedInitials.length > 0)" @click="store()">Spremi turnir</va-button>
  </body>
</template>

<style>
</style>
