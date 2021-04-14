import React, { useEffect, useState, Fragment } from "react";
import { Link, useHistory } from "react-router-dom";
import "./CreatorControls.css";
import {
  createRoom,
  subscribeToUserRooms,
  getNeighbourRooms,
} from "../../utils/firebase/firebase-auth";
import { Modal } from "../modal/Modal";

const Separator = () => (
  <div style={{ marginBottom: "2rem" }}>
    <div>...</div>
    <div>...</div>
    <div>...</div>
    <div>...</div>
  </div>
);

export const CreatorControls = ({ currentUser }) => {
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [rooms, setRooms] = useState([]);
  const [neighbourRooms, setNeighbourRooms] = useState([]);

  const history = useHistory();

  useEffect(() => {
    let unsubscribe = () => {};
    if (currentUser && currentUser.email) {
      unsubscribe = subscribeToUserRooms({
        email: currentUser.email,
        setRooms,
      });
    }
    getNeighbourRooms({ currentUser }).then((neighbours) => {
      setNeighbourRooms(neighbours);
    });
    return () => {
      unsubscribe();
    };
  }, [setRooms, currentUser]);

  const handleSubmitCreateRoom = (e) => {
    e.preventDefault();
    const { auid, email } = currentUser;
    createRoom({ email, auid, roomName, description })
      .then((roomId) => {
        history.push(`/r/${roomId}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const loggedIn = currentUser && currentUser.username;
  return (
    <Fragment>
      {!loggedIn && (
        <div className="access-info">
          login to create rooms and participate in dialogue. or, browse rooms
          anonymously :)
        </div>
      )}
      <div className="creator-controls-container">
        {showRoomForm && (
          <Modal>
            <form id="create-room-form" onSubmit={handleSubmitCreateRoom}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "1rem",
                }}
              >
                Room Name:
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "2rem",
                }}
              >
                Room Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit">let's do it!</button>
            </form>
          </Modal>
        )}
        {loggedIn && (
          <div className="rooms-list-container white-border">
            <h1>My Rooms</h1>
            <ul>
              {rooms.map(({ roomName, roomId }) => (
                <li key={roomId}>
                  - <Link to={`/r/${roomId}`}>{roomName}</Link>
                </li>
              ))}
            </ul>
            <Separator />
            <button type="button" onClick={() => setShowRoomForm(true)}>
              Create a room
            </button>
          </div>
        )}
        <div className="rooms-list-container other-border">
          <h1>Neighbour Rooms</h1>
          <ul>
            {neighbourRooms.length === 0 ? `no rooms to show :(` : ""}
            {neighbourRooms.map(({ roomName, roomId }) => (
              <li key={roomId}>
                - <Link to={`/r/${roomId}`}>{roomName}</Link>
              </li>
            ))}
          </ul>
          <Separator />
        </div>
      </div>
    </Fragment>
  );
};
