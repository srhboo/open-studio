import React, { useState, useRef } from "react";
import { DECAL_TYPES } from "../decals/decal-types";
import { uploadFileTo } from "../../utils/firebase/firebase-storage";

export const DecalCreationForm = ({ handleReadyToPlace, currentUser }) => {
  const fileInput = useRef(null);
  const [error, setError] = useState("");
  const [decalType, setDecalType] = useState(DECAL_TYPES.CUSTOM);
  const handleSubmitText = (e) => {
    e.preventDefault();
    if (decalType === DECAL_TYPES.CUSTOM) {
      const currentFileInput = fileInput.current && fileInput.current.files[0];
      if (currentFileInput) {
        if (currentFileInput && currentFileInput.size > 2097152) {
          setError("decal uploads must be smaller than 2mb. sorry!");
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
            handleReadyToPlace({ customUrl: downloadUrl, decalType });
          });
        }
      } else {
        setError("upload a file!");
      }
    } else {
      handleReadyToPlace({ customUrl: "", decalType });
    }
  };

  return (
    <form className="add-notes-form" id="text-form" onSubmit={handleSubmitText}>
      <div className="decal-switch-container">
        decal type (select one and click to paste):{" "}
        <select
          value={decalType}
          onChange={(e) => {
            setDecalType(e.target.value);
          }}
        >
          {Object.values(DECAL_TYPES).map((type) => (
            <option value={type} key={`${type}-decal-option`}>
              {type}
            </option>
          ))}
        </select>
        {decalType === DECAL_TYPES.CUSTOM && (
          <div>
            <label>upload image:</label>
            <input
              type="file"
              id="decal-img"
              name="decal-img"
              accept="image/png, image/jpeg"
              ref={fileInput}
            />
          </div>
        )}
      </div>
      <button type="submit" form="text-form">
        place
      </button>
      {error}
    </form>
  );
};
