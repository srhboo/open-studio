import React, { useState, useRef } from "react";
import { uploadFileTo } from "../../utils/firebase/firebase-storage";
import { db } from "../../index";
import "./ObjectCreationForm.css";

export const ObjectCreationForm = ({
  handleInitiatePlaceNote,
  roomId = "public",
  closeForm,
  currentUser,
}) => {
  const [note, updateNote] = useState("");
  const fileInput = useRef(null);
  const [objectType, setObjectType] = useState("text");
  const [imageUrl, setImageUrl] = useState("");
  const room = db.collection("rooms").doc(roomId);
  const objectsRef = room.collection("objects");
  console.log(currentUser);

  const handleReadyToPlace = (downloadUrl) => {
    const { newObject, switchHelper } = handleInitiatePlaceNote();
    newObject.callback = () => {
      objectsRef
        .add({
          type: objectType,
          textContent: note,
          imageUrl: downloadUrl || imageUrl,
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
    switchHelper(newObject);
    closeForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentFileInput = fileInput.current.files[0];
    if (objectType === "image" && currentFileInput) {
      const upload = new Promise((resolve, reject) => {
        uploadFileTo({
          creator: (currentUser && currentUser.auid) || "anonymous",
          filename: currentFileInput.name,
          file: currentFileInput,
          resolve,
          reject,
        });
      });
      upload.then((downloadUrl) => {
        setImageUrl(downloadUrl);
        handleReadyToPlace(downloadUrl);
      });
      // Create a root reference
    } else {
      handleReadyToPlace();
    }
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
          <form className="add-notes-form" onSubmit={handleSubmit}>
            <label>write a note:</label>
            <textarea
              className="note-textarea"
              value={note}
              onChange={(e) => updateNote(e.target.value)}
            />

            <button type="submit">save</button>
          </form>
        )}
        {objectType === "image" && (
          <form
            className="add-image-form"
            style={{ zIndex: 9999 }}
            onSubmit={handleSubmit}
          >
            <label>upload image:</label>
            <input
              type="file"
              id="special-img"
              name="special-img"
              accept="image/png, image/jpeg"
              ref={fileInput}
            />
            <button type="submit">save</button>
          </form>
        )}
      </div>
    </div>
  );
};
