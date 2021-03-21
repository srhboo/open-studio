import React, { useState } from "react";

export const PointerForm = ({ handleSavePointer }) => {
  const [pointerInput, updatePointerInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSavePointer(pointerInput);
    updatePointerInput("");
  };
  return (
    <form id="webmon-pointer-form" onSubmit={handleSubmit}>
      <input
        type="text"
        id="webmon-pointer"
        value={pointerInput}
        onChange={(e) => updatePointerInput(e.target.value)}
      />
      <button type="submit">save pointer</button>
    </form>
  );
};
