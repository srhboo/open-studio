import React from "react";
import "./editor.css";
import { deleteDecal } from "../neighbourhood/decals";

export const Editor = ({ mesh, scene }) => {
  // objects
  // size
  // position
  // rotation
  // material:
  // geometry

  //decals
  // size
  // position
  // rotation
  // material: map, envmap, colour, phong attributes

  //delete
  return (
    <div className="editor-container">
      <button
        type="button"
        onClick={() => {
          deleteDecal({ decalId: mesh.booObjectId, mesh, scene });
        }}
      >
        delete decal
      </button>
    </div>
  );
};
