import { useState, Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const NotLoggedIn = () => (
    <Fragment>
      <Link to="/" style={{ paddingRight: "1rem" }}>
        Home
      </Link>{" "}
      | anonymous |
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
    </Fragment>
  );
  const LoggedIn = () => (
    <div>
      <div>
        {`logged in as ${currentUser.username} | `}
        <Link to="/">Home</Link>
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
            {!!currentUser ? <LoggedIn /> : <NotLoggedIn />}
          </div>
          <Switch>
            <Route path="/r/:roomId">
              <Room currentUser={currentUser} />
            </Route>
            <Route path="/neighbourhood">
              <Neighbourhood currentUser={currentUser} />
            </Route>
            <Route path="/">
              <CreatorControls currentUser={currentUser} />
            </Route>
          </Switch>
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;
