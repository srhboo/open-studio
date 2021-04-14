import React, { useState } from "react";
import { deleteRoom } from "../../utils/firebase/firebase-auth";
import "./RoomControls.css";

export const RoomControls = ({
  handleInitiatePlaceNote,
  monetizePointer,
  roomId,
  history,
}) => {
  const [noteFormIsOpen, setNoteFormIsOpen] = useState(false);
  const [note, updateNote] = useState("");
  const [requiresWebMon, setRequiresWebMon] = useState(false);

  const handleDeleteRoom = ({ roomId }) => {
    deleteRoom({ roomId }).then(() => {
      history.push("/");
    });
  };

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
          requiresWebMon,
          position: {
            x: newObject.position.x,
            y: newObject.position.y,
            z: newObject.position.z,
          },
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
  const webMonUnavailable = !monetizePointer;
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
          <button type="button" onClick={() => handleDeleteRoom({ roomId })}>
            delete room
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};
