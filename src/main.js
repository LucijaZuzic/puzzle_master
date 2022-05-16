//import { create-App } from 'vue'
import { createApp } from "vue/dist/vue.esm-bundler.js"
import App from './App.vue'
import {createRouter, createWebHashHistory} from 'vue-router'
  
import NotFound from './components/NotFound.vue'
import SignInSuccess from './components/SignInSuccess.vue' 
import Login from './components/Login.vue'
import CreateTournament from './components/CreateTournament.vue'
import SearchTournament from './components/TournamentsTable.vue'
import CreateIntegram from './components/CreateIntegram.vue'
import CreateNonogram from './components/CreateNonogram.vue'
import CreateNumberCrossword from './components/CreateNumberCrossword.vue'
import EditIntegram from './components/EditIntegram.vue'
import EditNonogram from './components/EditNonogram.vue'
import EditNumberCrossword from './components/EditNumberCrossword.vue'
import SearchIntegram from './components/SearchIntegram.vue'
import SearchNonogram from './components/SearchNonogram.vue'
import SearchNumberCrossword from './components/SearchNumberCrossword.vue'
import SolveIntegram from './components/SolveIntegram.vue'
import SolveNonogram from './components/SolveNonogram.vue'
import SolveNumberCrossword from './components/SolveNumberCrossword.vue'

import CreateCryptogram from './components/CreateCryptogram.vue'
import SearchCryptogram from './components/SearchCryptogram.vue'
import EditCryptogram from './components/EditCryptogram.vue' 
import SolveCryptogram from './components/SolveCryptogram.vue'

import CreateInitial from './components/CreateInitial.vue'
import SearchInitial from './components/SearchInitial.vue'
import EditInitial from './components/EditInitial.vue' 
import SolveInitial from './components/SolveInitial.vue'

import CreateNumberLetter from './components/CreateNumberLetter.vue'
import SearchNumberLetter from './components/SearchNumberLetter.vue'
import EditNumberLetter from './components/EditNumberLetter.vue' 
import SolveNumberLetter from './components/SolveNumberLetter.vue'

import CreateEight from './components/CreateEight.vue'
import SearchEight from './components/SearchEight.vue'
import EditEight from './components/EditEight.vue' 
import SolveEight from './components/SolveEight.vue'

import FriendProfile from './components/FriendProfile.vue'
/*import BootstrapVue3 from "bootstrap-vue-3";

import "bootstrap/dist/css/bootstrap.css"; 
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";*/


import Oruga from '@oruga-ui/oruga-next' 
import '@oruga-ui/oruga-next/dist/oruga-full.css'

import { VuesticPlugin } from 'vuestic-ui' 
import 'vuestic-ui/dist/vuestic-ui.css' 
// 1. Define route components.
// These can be imported from other files
//const NumberCrossword = { template: '<create-number-crossword></create-number-crossword>' }
//const Ideogram = { template: '<create-Ideogram></create-Ideogram>' }
// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
    { path: '/:pathMatch(.*)*', name: 'not_found', component: NotFound },
    { path: '/', name: 'not_entered', component: NotFound }, 
    { path: '/sign-in-success', name: 'sign_in_success', component: SignInSuccess }, 
    { path: '/login', name: 'login', component: Login },
    { path: '/search-tournament', component: SearchTournament, name: "search_tournament" },
    { path: '/create-tournament', component: CreateTournament, name: "create_tournament" },
    { path: '/create-integram', component: CreateIntegram, name: "create_integram" },
    { path: '/create-nonogram', component: CreateNonogram, name: "create_nonogram" },
    { path: '/create-number-crossword', component: CreateNumberCrossword, name: "create_number_crossword" }, 
    { path: '/edit-integram/:id', component: EditIntegram, name: 'edit_integram' }, 
    { path: '/edit-nonogram/:id', component: EditNonogram, name: 'edit_nonogram' }, 
    { path: '/edit-number-crossword/:id', component: EditNumberCrossword, name: 'edit_number_crossword' }, 
    { path: '/search-integram', component: SearchIntegram, name: "search_integram" }, 
    { path: '/search-nonogram', component: SearchNonogram, name: "search_nonogram" }, 
    { path: '/search-number-crossword', component: SearchNumberCrossword, name: "search_number_crossword" }, 
    { path: '/solve-integram/:id', component: SolveIntegram, name: 'solve_integram' },
    { path: '/solve-nonogram/:id', component: SolveNonogram, name: 'solve_nonogram' },
    { path: '/solve-number-crossword/:id', component: SolveNumberCrossword, name: 'solve_number_crossword' }, 
    
    { path: '/profile/:email', component: FriendProfile, name: 'profile' },

    { path: '/create-cryptogram', component: CreateCryptogram, name: "create_cryptogram" }, 
    { path: '/search-cryptogram', component: SearchCryptogram, name: "search_cryptogram" }, 
    { path: '/edit-cryptogram/:id', component: EditCryptogram, name: 'edit_cryptogram' }, 
    { path: '/solve-cryptogram/:id', component: SolveCryptogram, name: 'solve_cryptogram' }, 
    
    { path: '/create-initial', component: CreateInitial, name: "create_initial" }, 
    { path: '/search-initial', component: SearchInitial }, 
    { path: '/edit-initial/:id', component: EditInitial, name: 'edit_initial' }, 
    { path: '/solve-initial/:id', component: SolveInitial, name: 'solve_initial' }, 

    { path: '/create-number-letter', component: CreateNumberLetter, name: "create_number_letter" }, 
    { path: '/search-number-letter', component: SearchNumberLetter }, 
    { path: '/edit-numberletter/:id', component: EditNumberLetter, name: 'edit_number_letter' }, 
    { path: '/solve-numberletter/:id', component: SolveNumberLetter, name: 'solve_number_letter' }, 

    { path: '/create-eight', component: CreateEight }, 
    { path: '/search-eight', component: SearchEight }, 
    { path: '/edit-eight/:id', component: EditEight, name: 'edit_eight' }, 
    { path: '/solve-eight/:id', component: SolveEight, name: 'solve_eight' }, 
]

// 3. create- the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

// 5. create- and mount the root instance. 
// Make sure to _use_ the router instance to make the
// whole app router-aware.

createApp(App).use(router).use(Oruga).use(VuesticPlugin).mount('#app')

import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage"; 
/*
const firebaseConfig = {
    apiKey: "AIzaSyCEGoa2YCsv_0EDAlkZoLIbW901pLpcemU",
    authDomain: "strucna-praksa.firebaseapp.com",
    projectId: "strucna-praksa",
    storageBucket: "strucna-praksa.appspot.com",
    messagingSenderId: "265258934708",
    appId: "1:265258934708:web:656051d675c1de04c152e1",
    measurementId: "G-JRHM9NQWQ8"
  }; 
*/


const firebaseConfig = {
  apiKey: "AIzaSyByJ6uU5c8yvsEDGQu3URhtfJQvxNVfTOI",
  authDomain: "puzzle-master-d20dc.firebaseapp.com",
  projectId: "puzzle-master-d20dc",
  storageBucket: "puzzle-master-d20dc.appspot.com",
  messagingSenderId: "903128135521",
  appId: "1:903128135521:web:920741e9602a25e4adf720",
  measurementId: "G-4KB2Y6FS8D"
}; 
// init firebase
firebase.initializeApp(firebaseConfig); 
 
// init services
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();
const usersRef = projectFirestore.collection('users') 
const numberCrosswordsRef = projectFirestore.collection('numberCrosswords') 
const nonogramsRef = projectFirestore.collection('nonograms') 
const integramsRef = projectFirestore.collection('integrams') 
const tournamentsRef = projectFirestore.collection('tournaments') 
const numberCrosswordsRecordsRef = projectFirestore.collection('numberCrosswordsRecords') 
const nonogramsRecordsRef = projectFirestore.collection('nonogramsRecords') 
const integramsRecordsRef = projectFirestore.collection('integramsRecords') 


const cryptogramsRef = projectFirestore.collection('cryptograms') 
const cryptogramsRecordsRef = projectFirestore.collection('cryptogramsRecords') 

const initialsRef = projectFirestore.collection('initials') 
const initialsRecordsRef = projectFirestore.collection('initialsRecords') 

const numberLettersRef = projectFirestore.collection('numberLetters') 
const numberLettersRecordsRef = projectFirestore.collection('numberLettersRecords') 

const eightsRef = projectFirestore.collection('eights') 
const eightsRecordsRef = projectFirestore.collection('eightsRecords') 

const numberCrosswordsRatingsRef = projectFirestore.collection('numberCrosswordsRatings') 
const nonogramsRatingsRef = projectFirestore.collection('nonogramsRatings') 
const integramsRatingsRef = projectFirestore.collection('integramsRatings') 
const initialsRatingsRef = projectFirestore.collection('initialsRatings') 
const cryptogramsRatingsRef = projectFirestore.collection('cryptogramsRatings')  
const numberLettersRatingsRef = projectFirestore.collection('numberLettersRatings') 
const eightsRatingsRef = projectFirestore.collection('eightsRatings') 

const friendsRef = projectFirestore.collection('friends') 
const friendRequestsRef = projectFirestore.collection('friendRequests') 

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
// Set up sign-in methods
const uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  signInSuccessUrl: ['#/sign-in-success']
  // Other config options...
}
export { ui, uiConfig, 
  projectFirestore, projectAuth, projectStorage, 
  numberCrosswordsRef, nonogramsRef, integramsRef,
  numberCrosswordsRecordsRef, nonogramsRecordsRef, integramsRecordsRef, 
  cryptogramsRef, cryptogramsRecordsRef,
  initialsRef, initialsRecordsRef,
  numberLettersRef, numberLettersRecordsRef, numberLettersRatingsRef,
  eightsRef, eightsRecordsRef, eightsRatingsRef,
  numberCrosswordsRatingsRef, nonogramsRatingsRef, integramsRatingsRef, initialsRatingsRef, cryptogramsRatingsRef,
  usersRef, tournamentsRef, friendsRef, friendRequestsRef };
