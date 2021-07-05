import React, { useState } from "react";

export const TextCreationForm = ({ handleReadyToPlace }) => {
  const [note, updateNote] = useState("");
  const handleSubmitText = (e) => {
    e.preventDefault();
    handleReadyToPlace({ note });
  };

  return (
    <form className="add-notes-form" id="text-form" onSubmit={handleSubmitText}>
      <label>write a note:</label>
      <textarea
        className="note-textarea"
        value={note}
        onChange={(e) => updateNote(e.target.value)}
      />
      <button type="submit" form="text-form">
        save
      </button>
    </form>
  );
};
