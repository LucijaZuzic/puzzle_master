import { createApp } from 'vue'
import App from './App.vue'
import {createRouter, createWebHashHistory} from 'vue-router'

import Home from './components/Home.vue'
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
/*import BootstrapVue3 from "bootstrap-vue-3";

import "bootstrap/dist/css/bootstrap.css"; 
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";*/


import Oruga from '@oruga-ui/oruga-next' 
import '@oruga-ui/oruga-next/dist/oruga-full.css'

import { VuesticPlugin } from 'vuestic-ui' 
import 'vuestic-ui/dist/vuestic-ui.css' 
// 1. Define route components.
// These can be imported from other files
//const NumberCrossword = { template: '<CreateNumberCrossword></CreateNumberCrossword>' }
//const Ideogram = { template: '<CreateIdeogram></CreateIdeogram>' }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
    { path: '/', component: Home },
    { path: '/signinsuccess', component: SignInSuccess },
    { path: '/login', component: Login },
    { path: '/searchtournament', component: SearchTournament },
    { path: '/createtournament', component: CreateTournament },
    { path: '/createintegram', component: CreateIntegram },
    { path: '/createnonogram', component: CreateNonogram },
    { path: '/createnumbercrossword', component: CreateNumberCrossword }, 
    { path: '/editintegram/:id', component: EditIntegram, name: 'edit_integram' }, 
    { path: '/editnonogram/:id', component: EditNonogram, name: 'edit_nonogram' }, 
    { path: '/editnumbercrossword/:id', component: EditNumberCrossword, name: 'edit_number_crossword' }, 
    { path: '/searchintegram', component: SearchIntegram }, 
    { path: '/searchnonogram', component: SearchNonogram }, 
    { path: '/searchnumbercrossword', component: SearchNumberCrossword }, 
    { path: '/solveintegram/:id', component: SolveIntegram, name: 'solve_integram' },
    { path: '/solvenonogram/:id', component: SolveNonogram, name: 'solve_nonogram' },
    { path: '/solvenumbercrossword/:id', component: SolveNumberCrossword, name: 'solve_number_crossword' }, 

    { path: '/createcryptogram', component: CreateCryptogram }, 
    { path: '/searchcryptogram', component: SearchCryptogram }, 
    { path: '/editcryptogram/:id', component: EditCryptogram, name: 'edit_cryptogram' }, 
    { path: '/solvecryptogram/:id', component: SolveCryptogram, name: 'solve_cryptogram' }, 
    
    { path: '/createinitial', component: CreateInitial }, 
    { path: '/searchinitial', component: SearchInitial }, 
    { path: '/editinitial/:id', component: EditInitial, name: 'edit_initial' }, 
    { path: '/solveinitial/:id', component: SolveInitial, name: 'solve_initial' }, 
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

// 5. Create and mount the root instance. 
// Make sure to _use_ the router instance to make the
// whole app router-aware.

createApp(App).use(router).use(Oruga).use(VuesticPlugin).mount('#app')

import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage"; 

const firebaseConfig = {
    apiKey: "AIzaSyCEGoa2YCsv_0EDAlkZoLIbW901pLpcemU",
    authDomain: "strucna-praksa.firebaseapp.com",
    projectId: "strucna-praksa",
    storageBucket: "strucna-praksa.appspot.com",
    messagingSenderId: "265258934708",
    appId: "1:265258934708:web:656051d675c1de04c152e1",
    measurementId: "G-JRHM9NQWQ8"
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

const initialRef = projectFirestore.collection('initial') 
const initialRecordsRef = projectFirestore.collection('initialRecords') 
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Set up sign-in methods
var uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  signInSuccessUrl: ['/signinsuccess']
  // Other config options...
}
export { ui, uiConfig, 
  projectFirestore, projectAuth, projectStorage, 
  numberCrosswordsRef, nonogramsRef, integramsRef,
  numberCrosswordsRecordsRef, nonogramsRecordsRef,integramsRecordsRef, 
  cryptogramsRef, cryptogramsRecordsRef,
  initialRef, initialRecordsRef,
  usersRef, tournamentsRef };
