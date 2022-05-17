import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
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
  measurementId: "G-JRHM9NQWQ8",
};

/*
const firebaseConfig = {
  apiKey: "AIzaSyByJ6uU5c8yvsEDGQu3URhtfJQvxNVfTOI",
  authDomain: "puzzle-master-d20dc.firebaseapp.com",
  projectId: "puzzle-master-d20dc",
  storageBucket: "puzzle-master-d20dc.appspot.com",
  messagingSenderId: "903128135521",
  appId: "1:903128135521:web:920741e9602a25e4adf720",
  measurementId: "G-4KB2Y6FS8D"
}; 
*/
// init firebase
firebase.initializeApp(firebaseConfig);

// init services
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();
const usersRef = projectFirestore.collection("users");
const numberCrosswordsRef = projectFirestore.collection("numberCrosswords");
const nonogramsRef = projectFirestore.collection("nonograms");
const integramsRef = projectFirestore.collection("integrams");
const tournamentsRef = projectFirestore.collection("tournaments");
const numberCrosswordsRecordsRef = projectFirestore.collection(
  "numberCrosswordsRecords"
);
const nonogramsRecordsRef = projectFirestore.collection("nonogramsRecords");
const integramsRecordsRef = projectFirestore.collection("integramsRecords");

const cryptogramsRef = projectFirestore.collection("cryptograms");
const cryptogramsRecordsRef = projectFirestore.collection("cryptogramsRecords");

const initialsRef = projectFirestore.collection("initials");
const initialsRecordsRef = projectFirestore.collection("initialsRecords");

const numberLettersRef = projectFirestore.collection("numberLetters");
const numberLettersRecordsRef = projectFirestore.collection(
  "numberLettersRecords"
);

const eightsRef = projectFirestore.collection("eights");
const eightsRecordsRef = projectFirestore.collection("eightsRecords");

const numberCrosswordsRatingsRef = projectFirestore.collection(
  "numberCrosswordsRatings"
);
const nonogramsRatingsRef = projectFirestore.collection("nonogramsRatings");
const integramsRatingsRef = projectFirestore.collection("integramsRatings");
const initialsRatingsRef = projectFirestore.collection("initialsRatings");
const cryptogramsRatingsRef = projectFirestore.collection("cryptogramsRatings");
const numberLettersRatingsRef = projectFirestore.collection(
  "numberLettersRatings"
);
const eightsRatingsRef = projectFirestore.collection("eightsRatings");

const friendsRef = projectFirestore.collection("friends");
const friendRequestsRef = projectFirestore.collection("friendRequests");

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
// Set up sign-in methods
const uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  signInSuccessUrl: ["#/sign-in-success"],
  // Other config options...
};
export {
  ui,
  uiConfig,
  projectFirestore,
  projectAuth,
  projectStorage,
  numberCrosswordsRef,
  nonogramsRef,
  integramsRef,
  numberCrosswordsRecordsRef,
  nonogramsRecordsRef,
  integramsRecordsRef,
  cryptogramsRef,
  cryptogramsRecordsRef,
  initialsRef,
  initialsRecordsRef,
  numberLettersRef,
  numberLettersRecordsRef,
  numberLettersRatingsRef,
  eightsRef,
  eightsRecordsRef,
  eightsRatingsRef,
  numberCrosswordsRatingsRef,
  nonogramsRatingsRef,
  integramsRatingsRef,
  initialsRatingsRef,
  cryptogramsRatingsRef,
  usersRef,
  tournamentsRef,
  friendsRef,
  friendRequestsRef,
};
