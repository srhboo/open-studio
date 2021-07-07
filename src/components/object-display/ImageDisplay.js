import React from "react";

export const ImageDisplay = ({ textContent, downloadUrl }) => (
  <div className="image-display-container">
    <img src={downloadUrl} alt="" />
    <div className="text-display-container">{textContent}</div>
  </div>
);
