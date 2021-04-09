import { useState, Fragment, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Room } from "../room/Room.js";
import { CreatorControls } from "../creator-controls/CreatorControls";
import { Login } from "../login/Login";
import { Register } from "../register/Register";
import { Modal } from "../modal/Modal";
import {
  logoutUser,
  setUpAuthObserver,
  getUserRecord,
} from "../../utils/firebase/firebase-auth";
import "./App.css";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const handleOnSignedIn = ({ user }) => {
      getUserRecord({ email: user.email }).then(({ user: userRecord }) => {
        setCurrentUser(userRecord);
      });
    };
    setUpAuthObserver({
      onSignedIn: handleOnSignedIn,
      onSignedOut: () => setCurrentUser(null),
    });
  }, [setCurrentUser]);

  const [modalStatus, setModalStatus] = useState("hidden");
  const handleSuccess = ({ user }) => {
    setCurrentUser(user);
    setModalStatus("hidden");
  };
  const handleLogout = () => {
    logoutUser()
      .then(() => {
        setCurrentUser(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const NotLoggedIn = () => (
    <Fragment>
      anonymous |
      <button type="button" onClick={() => setModalStatus("login")}>
        login
      </button>
      <button type="button" onClick={() => setModalStatus("register")}>
        register
      </button>
    </Fragment>
  );
  const LoggedIn = () => (
    <Fragment>
      {`logged in as ${currentUser.username} | `}
      <button type="button" onClick={handleLogout}>
        log out?
      </button>
    </Fragment>
  );

  return (
    <Router>
      <div className="App">
        {modalStatus === "login" && (
          <Modal>
            <Login handleLoginSuccess={handleSuccess} />
          </Modal>
        )}
        {modalStatus === "register" && (
          <Modal>
            <Register handleRegisterSuccess={handleSuccess} />
          </Modal>
        )}
        <div className="user-nav">
          {!!currentUser ? <LoggedIn /> : <NotLoggedIn />}
        </div>
        <Switch>
          <Route path="/r/:roomId">
            <Room />
          </Route>
          <Route path="/">
            <CreatorControls />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
