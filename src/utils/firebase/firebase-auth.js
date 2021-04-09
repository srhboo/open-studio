import firebase from "firebase/app";
import "firebase/auth";

import { db } from "../../index";

export const createUser = ({ email, password, username }) => {
  const checkIfUsernameExists = db
    .collection("usernames")
    .doc(username)
    .get()
    .then((doc) => {
      if (doc.exists) {
        throw new Error("Username already exists");
      }
      return username;
    });
  const createWithPwAuth = () =>
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  return checkIfUsernameExists
    .then(() => createWithPwAuth())
    .then((user) => {
      const { email, uid } = user;
      const userToAdd = { username, auid: uid, webMonPointer: null };
      const addToDb = db.collection("users").doc(email).set(userToAdd);
      const recordUsername = db
        .collection("usernames")
        .doc(username)
        .set({ email });
      return Promise.all([userToAdd, addToDb, recordUsername]);
    })
    .then(([user]) => {
      return { user };
    })
    .catch((error) => {
      const errorMessage = error.message;
      return Promise.reject({ errorMessage });
    });
};

export const getUserRecord = ({ email }) => {
  return db
    .collection("users")
    .doc(email)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const { username, webMonPointer, auid } = doc.data();
        return { user: { username, webMonPointer, auid, email } };
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const loginUser = ({ email, password }) => {
  return firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => getUserRecord({ email }))
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage =
        errorCode === "auth/user-not-found"
          ? "Hmmm doesn't seem you've registered with this email yet."
          : "Error";
      return Promise.reject({ errorCode, errorMessage });
    });
};

export const logoutUser = () => {
  return firebase
    .auth()
    .signOut()
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
  return firebase.auth().onAuthStateChanged(function (user) {
    console.log("changed");
    if (user) {
      onSignedIn({ user });
    } else {
      onSignedOut();
    }
  });
};
