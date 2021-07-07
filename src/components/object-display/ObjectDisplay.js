import React from "react";
import { VideoDisplay } from "./VideoDisplay";
import { SoundDisplay } from "./SoundDisplay";
import { Dialogue } from "../dialogue/Dialogue";
import "./ObjectDisplay.css";

export const ObjectDisplay = ({
  objectOnDisplay,
  closeDisplay,
  currentUser,
}) => {
  const { type, textContent, downloadUrl, creator, objectId } = objectOnDisplay;
  let content;
  switch (type) {
    case "text":
      content = textContent;
      break;
    case "image":
      content = <img src={downloadUrl} alt="" />;
      break;
    case "video":
      content = (
        <VideoDisplay
          downloadUrl={downloadUrl}
          textContent={textContent}
          creator={creator}
        />
      );
      break;
    case "sound":
      content = (
        <SoundDisplay
          downloadUrl={downloadUrl}
          textContent={textContent}
          creator={creator}
        />
      );
      break;
    default:
      content = "";
      break;
  }
  return (
    <div className="cinematic-container">
      <div className="object-display-container">
        <div className="curtain" onClick={closeDisplay}>
          {" "}
        </div>
        <button className="close-button" onClick={closeDisplay}>
          esc
        </button>
        <div className="content-container">{content}</div>
        <Dialogue
          objectId={objectId}
          roomId="public"
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};
