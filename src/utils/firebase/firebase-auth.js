// Initialize the FirebaseUI Widget using Firebase.

import firebase from "firebase/app";

export const createUser = ({ email, password }) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      return Promise.reject({ errorCode, errorMessage });
    });
};

export const checkCurrentUser = () => {
  return firebase.auth().currentUser;
};

export const setUpAuthObserver = ({ onSignedIn, onSignedOut }) => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      onSignedIn(user);
    } else {
      onSignedOut();
    }
  });
};
