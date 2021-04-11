import React, { useState, useEffect } from "react";
import "./RoomControls.css";
import { PointerForm } from "../pointer-form/PointerForm";
import { db } from "../../index";

export const RoomControls = ({ handleInitiatePlaceNote, setNoteToCreate }) => {
  console.log("loaded");
  const [noteFormIsOpen, setNoteFormIsOpen] = useState(false);
  const [note, updateNote] = useState("");
  const [requiresWebMon, setRequiresWebMon] = useState(false);

  // DELETE DEFAULT LATER
  const [webMonPointer, setWebMonPointer] = useState("s3s3AHF0");

  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      newObject,
      switchHelper,
      objectsRef,
      raycastHighlightObjects,
    } = handleInitiatePlaceNote();
    newObject.callback = () => {
      objectsRef
        .add({
          type: "text",
          textContent: note,
          dialogue: [],
          requiresWebMon,
          position: {
            x: newObject.position.x,
            y: newObject.position.y,
            z: newObject.position.z,
          },
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
      switchHelper();
    };
    raycastHighlightObjects.push(newObject);
    switchHelper(newObject);
    setNoteFormIsOpen(false);
  };
  const webMonUnavailable = !webMonPointer;
  return (
    <React.Fragment>
      {noteFormIsOpen && (
        <form className="add-note-form" onSubmit={handleSubmit}>
          <label>write a note:</label>
          <textarea
            className="note-textarea"
            value={note}
            onChange={(e) => updateNote(e.target.value)}
          />
          <div className={`${webMonUnavailable ? "unavailable" : ""}`}>
            <input
              type="checkbox"
              checked={requiresWebMon}
              onChange={() => setRequiresWebMon(!requiresWebMon)}
              disabled={webMonUnavailable}
            />
            <label>requires web monetization to view</label>
          </div>

          <button type="submit">save</button>
        </form>
      )}
      <div className="room-panel">
        <h2>room panel</h2>
        <div className="room-panel-section">
          <h3>actions</h3>
          <button type="button" onClick={() => setNoteFormIsOpen(true)}>
            add note
          </button>
        </div>
        <div className="room-panel-section">
          <h3>settings</h3>
          <div>
            {webMonUnavailable ? (
              <PointerForm handleSavePointer={(id) => setWebMonPointer(id)} />
            ) : (
              `pointer: ${webMonPointer}`
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
