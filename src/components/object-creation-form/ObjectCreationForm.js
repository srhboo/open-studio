import React, { useState } from "react";
import { TextCreationForm } from "./TextCreationForm";
import { ImageCreationForm } from "./ImageCreationForm";
import { VideoCreationForm } from "./VideoCreationForm";
import { SoundCreationForm } from "./SoundCreationForm";
import { addObject } from "../neighbourhood/objects";
import "./ObjectCreationForm.css";

export const ObjectCreationForm = ({
  handleInitiatePlaceNote,
  roomId = "public",
  closeForm,
  currentUser,
}) => {
  const [objectType, setObjectType] = useState("text");

  const handleReadyToPlace = ({ downloadUrl = "", note = "" }) => {
    const { newObject, switchHelper } = handleInitiatePlaceNote();
    newObject.callback = () => {
      addObject({
        objectData: {
          objectType,
          note,
          downloadUrl,
          newObject,
          currentUser,
        },
        roomId,
      });
      switchHelper();
    };
    switchHelper(newObject);
    closeForm();
  };

  return (
    <div className="cinematic-container">
      <div className="curtain" onClick={closeForm}>
        {" "}
      </div>
      <div className="object-creation-container">
        <div className="object-type-selection">
          <button
            type="button"
            className={`object-type-button${
              objectType === "text" ? " pressed" : ""
            }`}
            onClick={() => setObjectType("text")}
          >
            text
          </button>
          <button
            type="button"
            className={`object-type-button${
              objectType === "image" ? " pressed" : ""
            }`}
            onClick={() => setObjectType("image")}
          >
            image
          </button>
          <button
            type="button"
            className={`object-type-button${
              objectType === "video" ? " pressed" : ""
            }`}
            onClick={() => setObjectType("video")}
          >
            video
          </button>
          <button
            type="button"
            className={`object-type-button${
              objectType === "video" ? " pressed" : ""
            }`}
            onClick={() => setObjectType("sound")}
          >
            sound
          </button>
        </div>
        {objectType === "text" && (
          <TextCreationForm handleReadyToPlace={handleReadyToPlace} />
        )}
        {objectType === "image" && (
          <ImageCreationForm
            handleReadyToPlace={handleReadyToPlace}
            currentUser={currentUser}
          />
        )}
        {objectType === "video" && (
          <VideoCreationForm handleReadyToPlace={handleReadyToPlace} />
        )}
        {objectType === "sound" && (
          <SoundCreationForm
            handleReadyToPlace={handleReadyToPlace}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};
