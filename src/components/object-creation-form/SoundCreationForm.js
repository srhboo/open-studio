import React, { useState, useRef } from "react";
import { uploadFileTo } from "../../utils/firebase/firebase-storage";

export const SoundCreationForm = ({ handleReadyToPlace, currentUser }) => {
  const [note, updateNote] = useState("");
  const [source, setSource] = useState("file");
  const [soundUrl, setSoundUrl] = useState("");
  const fileInput = useRef(null);

  const handleSubmitSound = (e) => {
    e.preventDefault();
    if (source === "file") {
      const currentFileInput = fileInput.current && fileInput.current.files[0];
      if (currentFileInput) {
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
          setSoundUrl(downloadUrl);
          handleReadyToPlace({ downloadUrl, note });
        });
      }
    } else {
      handleReadyToPlace({ downloadUrl: soundUrl, note });
    }
  };

  return (
    <form
      className="add-sound-form"
      id="sound-form"
      style={{ zIndex: 9999 }}
      onSubmit={handleSubmitSound}
    >
      {source === "file" && (
        <React.Fragment>
          <label>upload sound:</label>
          <input
            type="file"
            id="special-sound"
            name="special-sound"
            accept="audio/mp3"
            ref={fileInput}
          />
          <button type="button" onClick={() => setSource("url")}>
            use bandcamp / soundcloud link instead
          </button>
        </React.Fragment>
      )}
      {source === "url" && (
        <React.Fragment>
          <label>bandcamp or soundcloud link:</label>
          <input
            type="text"
            value={soundUrl}
            onChange={(e) => setSoundUrl(e.target.value)}
          />
          <button type="button" onClick={() => setSource("file")}>
            upload file instead
          </button>
        </React.Fragment>
      )}
      <label>write a note:</label>
      <textarea
        className="note-textarea"
        value={note}
        onChange={(e) => updateNote(e.target.value)}
      />
      <button type="submit" form="sound-form">
        save
      </button>
    </form>
  );
};
