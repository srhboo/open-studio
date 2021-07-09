import React, { useState, useRef } from "react";
import { uploadFileTo } from "../../utils/firebase/firebase-storage";

export const ImageCreationForm = ({ currentUser, handleReadyToPlace }) => {
  const fileInput = useRef(null);
  const [error, setError] = useState("");
  const [, setImageUrl] = useState("");
  const [note, updateNote] = useState("");
  const handleSubmitImage = (e) => {
    e.preventDefault();
    const currentFileInput = fileInput.current && fileInput.current.files[0];
    if (currentFileInput) {
      if (currentFileInput.size > 4194304) {
        setError("image uploads must be smaller than 4mb. sorry!");
      } else {
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
          handleReadyToPlace({ downloadUrl, note });
        });
      }
    } else {
      setError("upload a file!");
    }
  };

  return (
    <form
      className="add-image-form"
      id="image-form"
      style={{ zIndex: 9999 }}
      onSubmit={handleSubmitImage}
    >
      <label>upload image:</label>
      <input
        type="file"
        id="special-img"
        name="special-img"
        accept="image/png, image/jpeg"
        ref={fileInput}
      />
      <label>write a note:</label>
      <textarea
        className="note-textarea"
        value={note}
        onChange={(e) => updateNote(e.target.value)}
      />
      <button type="submit" form="image-form">
        save
      </button>
      {error}
    </form>
  );
};
