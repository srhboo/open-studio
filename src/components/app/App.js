import { useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Room } from "../room/Room.js";
import { Neighbourhood } from "../neighbourhood/Neighbourhood";
import { CreatorControls } from "../creator-controls/CreatorControls";
import { Login } from "../login/Login";
import { Register } from "../register/Register";
import { Modal } from "../modal/Modal";
import { PointerForm } from "../pointer-form/PointerForm";
import {
  logoutUser,
  setUpAuthObserver,
  subscribeToUserRecord,
  updateUserRecord,
} from "../../utils/firebase/firebase-auth";
import { setSocketName } from "../../utils/socketio";
import "./App.css";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const handleOnSignedIn = ({ user }) => {
      subscribeToUserRecord({
        email: user.email,
        handleUpdate: ({ user: userRecord }) => {
          setCurrentUser(userRecord);
          setSocketName(userRecord.username);
        },
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
  const handleUpdatePointer = (pointer) => {
    updateUserRecord({
      toUpdate: { webMonPointer: pointer },
      email: currentUser.email,
    }).then(() => {
      setModalStatus("hidden");
    });
  };
  const Signage = () => (
    <div className="signage">
      <h1 className="main-banner">you are cruising fartland.net</h1> | [?]
    </div>
  );
  const NotLoggedIn = () => (
    <div>
      {`hi anonymous <3 |`}
      <button
        type="button"
        style={{ marginRight: "1rem", marginLeft: "1rem" }}
        onClick={() => setModalStatus("login")}
      >
        login
      </button>
      <button
        type="button"
        style={{ marginRight: "1rem" }}
        onClick={() => setModalStatus("register")}
      >
        register
      </button>
    </div>
  );
  const LoggedIn = () => (
    <div>
      <div>
        {`welcome back ${currentUser.username} <3 | `}
        <button
          type="button"
          style={{ marginRight: "1rem", marginLeft: "1rem" }}
          onClick={() => setModalStatus("user-settings")}
        >
          settings
        </button>
        <button
          type="button"
          style={{ marginRight: "1rem" }}
          onClick={handleLogout}
        >
          log out?
        </button>
      </div>
    </div>
  );
  const CloseModalButton = () => (
    <button type="button" onClick={() => setModalStatus("hidden")}>
      close
    </button>
  );
  return (
    <HelmetProvider>
      <Router>
        <div className="App">
          {modalStatus === "login" && (
            <Modal>
              <Login handleLoginSuccess={handleSuccess} />
              <CloseModalButton />
            </Modal>
          )}
          {modalStatus === "register" && (
            <Modal>
              <Register handleRegisterSuccess={handleSuccess} />
              <CloseModalButton />
            </Modal>
          )}
          {modalStatus === "user-settings" && (
            <Modal>
              <PointerForm
                handleSavePointer={handleUpdatePointer}
                currentPointer={currentUser.webMonPointer}
              />
              <CloseModalButton />
            </Modal>
          )}
          <div className="user-nav">
            <Signage />
            {!!currentUser ? <LoggedIn /> : <NotLoggedIn />}
          </div>
          <Switch>
            <Route path="/r/:roomId">
              <Room currentUser={currentUser} />
            </Route>
            <Route path="/neighbourhood">
              <Neighbourhood currentUser={currentUser} />
            </Route>
            <Route path="/home">
              <CreatorControls currentUser={currentUser} />
            </Route>
            <Route path="/">
              <Neighbourhood currentUser={currentUser} />
            </Route>
          </Switch>
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;
