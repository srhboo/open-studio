import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CreatorControls.css";
import { PointerForm } from "../pointer-form/PointerForm";

const defaultRooms = [
  {
    roomId: "sadfsdf34",
    userId: "srhboo@gmail.com",
    roomName: "my first room",
    description: "trying out my first room",
  },
];

export const CreatorControls = ({ myRooms = defaultRooms, user }) => {
  return (
    <div className="creator-controls-container">
      <div className="rooms-list-container">
        <h2>My Rooms</h2>
        <ul>
          {myRooms.map(({ roomName, roomId }) => (
            <li key={roomId}>
              <Link to={`/r/${roomId}`}>{roomName}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
