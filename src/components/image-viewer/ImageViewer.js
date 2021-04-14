import React, { useState, Fragment } from "react";
import "./ImageViewer.css";
import { Dialogue } from "../dialogue/Dialogue";
import "../note/Note.css";
import { createCenterpiece } from "../../utils/firebase/firebase-auth";

// todo: preload
export const ImageViewer = ({
  url = "",
  alt = "",
  closeHandler = () => {},
  maxZ,
  imageViewerIsOpen,
  objectId,
  roomId,
  currentUser,
}) => {
  const [isDialogueExpanded, setIsDialogueExpanded] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const handleSubmitCenterpiece = (e) => {
    e.preventDefault();
    createCenterpiece({ roomId, url: urlInput });
  };
  return (
    <div
      className={`cinematic-container${
        imageViewerIsOpen ? "" : " viewer-mini"
      }`}
      style={{ zIndex: maxZ + 1 }}
    >
      <div className="curtain" onClick={closeHandler}>
        {" "}
      </div>
      {!url ? (
        <div className="set-centerpiece">
          <h2 style={{ paddingBottom: "2rem" }}>set your centerpiece</h2>
          <form id="centerpiece-form" onSubmit={handleSubmitCenterpiece}>
            <div style={{ marginBottom: "2rem" }}>
              image url:{" "}
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            <button type="submit">save</button>
          </form>
        </div>
      ) : (
        <Fragment>
          {" "}
          <div
            className={`gdrive-img-container${
              isDialogueExpanded ? "" : " full"
            }`}
          >
            <img src={url} className="gdrive-img" alt={alt} />
          </div>
          {isDialogueExpanded && (
            <Dialogue
              objectId={objectId}
              currentUser={currentUser}
              roomId={roomId}
            />
          )}
        </Fragment>
      )}
      <div className="display-buttons">
        <button
          type="button"
          className="mini toggle-display"
          onClick={closeHandler}
        >
          ▒-
        </button>
        {!isDialogueExpanded && (
          <button
            type="button"
            className="open-dialogue toggle-display"
            onClick={() => setIsDialogueExpanded(true)}
          >
            ▒+
          </button>
        )}
        {isDialogueExpanded && (
          <button
            type="button"
            className="close-dialogue toggle-display"
            onClick={() => setIsDialogueExpanded(false)}
          >
            ▒o
          </button>
        )}
      </div>
    </div>
  );
};
