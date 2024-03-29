import React from "react";
import * as Tone from "tone";
import "./welcome.css";

export const Welcome = ({ closeDisplay }) => {
  const startAudio = () => {
    Tone.start();
  };

  const onClose = () => {
    startAudio();
    closeDisplay();
  };
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
            just take a look around. click to move. WASD to rotate. scroll to
            zoom.
          </p>
          <p>enabling audio now.</p>
        </div>
        <button onClick={onClose}>{`ok :)`}</button>
      </div>
    </div>
  );
};
