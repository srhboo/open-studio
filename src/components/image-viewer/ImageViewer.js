import React, { useState } from "react";
import "./ImageViewer.css";
import { Dialogue } from "../dialogue/Dialogue";
import "../note/Note.css";

// todo: preload
export const ImageViewer = ({
  url = "",
  alt = "",
  closeHandler = () => {},
  maxZ,
  setMaxZ,
  imageViewerIsOpen,
}) => {
  const [isDialogueExpanded, setIsDialogueExpanded] = useState(false);

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
      <div
        className={`gdrive-img-container${isDialogueExpanded ? "" : " full"}`}
      >
        <img src={url} className="gdrive-img" alt={alt} />
      </div>

      {isDialogueExpanded && <Dialogue />}
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
