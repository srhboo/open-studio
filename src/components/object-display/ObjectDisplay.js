import React from "react";
import "./ObjectDisplay.css";

export const ObjectDisplay = ({ objectOnDisplay, closeDisplay }) => {
  console.log(objectOnDisplay);
  const { type, textContent, imageUrl } = objectOnDisplay;
  let content;
  switch (type) {
    case "text":
      content = textContent;
      break;
    case "image":
      content = <img src={imageUrl} alt="" />;
      break;
    default:
      content = "";
      break;
  }
  return (
    <div className="cinematic-container">
      <div className="curtain" onClick={closeDisplay}>
        {" "}
      </div>
      <div className="content-container">{content}</div>
    </div>
  );
};
