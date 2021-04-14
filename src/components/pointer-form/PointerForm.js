import React, { useState } from "react";

export const PointerForm = ({ handleSavePointer, currentPointer }) => {
  const [pointerInput, updatePointerInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSavePointer(pointerInput);
    updatePointerInput("");
  };
  return (
    <form id="webmon-pointer-form" onSubmit={handleSubmit}>
      <h2>Web Monetization pointer</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            paddingBottom: "2rem",
          }}
        >{`your pointer: ${currentPointer || "none"}`}</div>
        <input
          type="text"
          id="webmon-pointer"
          value={pointerInput}
          style={{ marginBottom: "1rem" }}
          onChange={(e) => updatePointerInput(e.target.value)}
        />
        <button type="submit">update pointer</button>
      </div>
    </form>
  );
};
