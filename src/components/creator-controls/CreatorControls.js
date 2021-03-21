import React, { useState } from "react";
import "./CreatorControls.css";
import { PointerForm } from "../pointer-form/PointerForm";

export const CreatorControls = ({ handleAddNote = () => {} }) => {
  const [noteFormIsOpen, setNoteFormIsOpen] = useState(false);
  const [note, updateNote] = useState("");
  const [requiresWebMon, setRequiresWebMon] = useState(false);

  // DELETE DEFAULT LATER
  const [webMonPointer, setWebMonPointer] = useState("s3s3AHF0");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddNote({ note, requiresWebMon });
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
      <div className="creator-panel">
        <h2>creator panel</h2>
        <div className="creator-panel-section">
          <h3>actions</h3>
          <button type="button" onClick={() => setNoteFormIsOpen(true)}>
            add note
          </button>
        </div>
        <div className="creator-panel-section">
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
