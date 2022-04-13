import { createApp } from 'vue'
import App from './App.vue'
import {createRouter, createWebHashHistory} from 'vue-router'

import Home from './components/Home.vue'
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

const firebaseConfig = {
    apiKey: "AIzaSyCEGoa2YCsv_0EDAlkZoLIbW901pLpcemU",
    authDomain: "strucna-praksa.firebaseapp.com",
    projectId: "strucna-praksa",
    storageBucket: "strucna-praksa.appspot.com",
    messagingSenderId: "265258934708",
    appId: "1:265258934708:web:656051d675c1de04c152e1",
    measurementId: "G-JRHM9NQWQ8"
  };

import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

// init firebase
firebase.initializeApp(firebaseConfig);

// init services
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();
const numberCrosswordsRef = projectFirestore.collection('numberCrosswords') 
const nonogramsRef = projectFirestore.collection('nonograms') 
const integramsRef = projectFirestore.collection('integrams') 

export { projectFirestore, projectAuth, projectStorage, numberCrosswordsRef, nonogramsRef, integramsRef };
