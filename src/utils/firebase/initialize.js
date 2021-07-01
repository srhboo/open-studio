import firebase from "firebase";
import "firebase/firestore";

export const initializeFirebase = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyASQg5GfleiuvqPMhqLyYtQfre4FlW3hyM",
    authDomain: "rooms-bdca3.firebaseapp.com",
    projectId: "rooms-bdca3",
    storageBucket: "rooms-bdca3.appspot.com",
    messagingSenderId: "501132148269",
    appId: "1:501132148269:web:6adf37bb1484a56e11c2a4",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  const db = firebase.firestore();
  const storage = firebase.storage();
  return { db, storage };
};
