import React from "react";
import { DecalGeometry } from "../../utils/three-jsm/geometries/DecalGeometry";
import "./editor.css";
import { deleteDecal } from "../neighbourhood/decals";
import { deleteObject } from "../neighbourhood/objects";

export const Editor = ({ mesh, scene, currentUser }) => {
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
  let canDelete;
  if (mesh.geometry instanceof DecalGeometry) {
    canDelete = !mesh.permanent;
  } else {
    canDelete =
      (currentUser && mesh.creator && mesh.creator.auid === currentUser.auid) ||
      (mesh.creator && mesh.creator.username === "anonymous") ||
      (currentUser && currentUser.username === "srhboo");
  }

  const handleClickDelete = () => {
    if (mesh.geometry instanceof DecalGeometry) {
      deleteDecal({ decalId: mesh.booObjectId, mesh, scene });
    } else {
      deleteObject({ objectId: mesh.booObjectId, mesh, scene });
    }
  };
  return (
    <div className="editor-container">
      <div>last clicked object:</div>
      <div className="current-selection-container">
        {mesh && mesh.booObjectId}
      </div>
      {canDelete && (
        <button type="button" onClick={handleClickDelete}>
          delete it?
        </button>
      )}
    </div>
  );
};
