import { useEffect } from "react";
import firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import { startFirebaseUI } from "../../utils/firebase/firebase-auth";
import "./Login.css";
const rooms = [];

export const Login = () => {
  //TODO set up initializeApp
  useEffect(() => {
    startFirebaseUI();
  });

  return (
    <div className="Login">
      <h1>Welcome to My Awesome App</h1>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
      {/* <Room /> */}
    </div>
  );
};
