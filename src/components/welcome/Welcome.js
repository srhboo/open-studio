import React, { useEffect } from "react";
import * as Tone from "tone";
import "./welcome.css";

export const Welcome = ({ closeDisplay }) => {
  useEffect(() => {
    Tone.start();
  });
  return (
    <div className="cinematic-container">
      <div className="curtain" onClick={closeDisplay}>
        {" "}
      </div>
      <div className="welcome-container">
        <div>
          <p>welcome! </p>
          <p>
            make yourself at home - feel free to add to the neighbourhood or
            just take a look around.
          </p>
          <p>enabling audio now.</p>
        </div>
        <button onClick={closeDisplay}>{`ok :)`}</button>
      </div>
    </div>
  );
};
