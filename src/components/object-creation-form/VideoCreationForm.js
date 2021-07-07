import React, { useState } from "react";

export const VideoCreationForm = ({ handleReadyToPlace }) => {
  const [note, updateNote] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const handleSubmitVideo = (e) => {
    e.preventDefault();
    handleReadyToPlace({ note, downloadUrl: videoUrl });
  };

  return (
    <form
      className="add-video-form"
      id="video-form"
      style={{ zIndex: 9999 }}
      onSubmit={handleSubmitVideo}
    >
      <label>vimeo or youtube link:</label>
      <input
        type="text"
        required
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />

      <label>write a note:</label>
      <textarea
        className="note-textarea"
        value={note}
        onChange={(e) => updateNote(e.target.value)}
      />
      <button type="submit" form="video-form">
        save
      </button>
    </form>
  );
};
