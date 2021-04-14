import React, { useState } from "react";
import "./Note.css";
import { Dialogue } from "../dialogue/Dialogue";

const NOTE_STATUS = {
  MINI: "MINI",
  NORMAL: "NORMAL",
  EXPANDED: "EXPANDED",
};

const NoAccessNote = ({ style, maxZ }) => {
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);
  return (
    <React.Fragment>
      <div
        className={"note-container mini-display no-access"}
        onClick={() => setIsInfoWindowOpen(true)}
        style={{ ...style }}
      >
        ??
      </div>
      {isInfoWindowOpen && (
        <div className="web-mon-info" style={{ zIndex: maxZ + 1 }}>
          <a
            href="https://webmonetization.org/"
            target="_blank"
            rel="noreferrer"
          >
            click here to find out more
          </a>
          <button type="button" onClick={() => setIsInfoWindowOpen(false)}>
            close window
          </button>
        </div>
      )}
    </React.Fragment>
  );
};

export const Note = ({
  objectId,
  roomId,
  textContent,
  position,
  maxZ,
  setMaxZ,
  requiresWebMon,
  dialogue,
  currentUser,
}) => {
  const [noteDisplay, setNoteDisplay] = useState(NOTE_STATUS.MINI);
  const [zIndex, setZIndex] = useState(0);
  const handleNoteClick = () => {
    if (noteDisplay === NOTE_STATUS.MINI) {
      setNoteDisplay(NOTE_STATUS.NORMAL);
    }
    if (zIndex < maxZ) {
      const newMaxZ = maxZ + 1;
      setZIndex(newMaxZ);
      setMaxZ(newMaxZ);
    }
  };
  const noteNormalDisplayPosition = {
    left: position.x,
    top: position.y,
    zIndex,
  };
  const noteExpandedDisplayPosition = { left: "50%", top: "50%", zIndex };
  const isMonetized =
    document.monetization && document.monetization.state === "started";
  const noAccess = requiresWebMon && !isMonetized;

  return (
    <React.Fragment>
      {noAccess ? (
        <NoAccessNote style={noteNormalDisplayPosition} maxZ={maxZ} />
      ) : (
        <div
          className={`note-container${
            noteDisplay === NOTE_STATUS.MINI ? " mini-display" : ""
          }${noteDisplay === NOTE_STATUS.EXPANDED ? " expanded-display" : ""}`}
          style={
            noteDisplay === NOTE_STATUS.EXPANDED
              ? noteExpandedDisplayPosition
              : noteNormalDisplayPosition
          }
          onClick={handleNoteClick}
        >
          <div className="note">
            <div className="note-text">{textContent}</div>
            <div className="display-buttons">
              <button
                type="button"
                className="mini toggle-display"
                onClick={() => setNoteDisplay(NOTE_STATUS.MINI)}
              >
                ▒-
              </button>
              {noteDisplay !== NOTE_STATUS.EXPANDED && (
                <button
                  type="button"
                  className="open-dialogue toggle-display"
                  onClick={() => setNoteDisplay(NOTE_STATUS.EXPANDED)}
                >
                  ▒+
                </button>
              )}
              {noteDisplay === NOTE_STATUS.EXPANDED && (
                <button
                  type="button"
                  className="close-dialogue toggle-display"
                  onClick={() => setNoteDisplay(NOTE_STATUS.NORMAL)}
                >
                  ▒o
                </button>
              )}
            </div>
          </div>
          {noteDisplay === NOTE_STATUS.EXPANDED && (
            <Dialogue
              dialogueList={dialogue}
              objectId={objectId}
              roomId={roomId}
              currentUser={currentUser}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
};
