import React from "react";
import { DecalGeometry } from "../../utils/three-jsm/geometries/DecalGeometry";
import "./editor.css";
import { deleteDecal } from "../neighbourhood/decals";
import { deleteObject } from "../neighbourhood/objects";

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
  console.log(mesh.booObjectId);

  const handleClickDelete = () => {
    if (mesh.geometry instanceof DecalGeometry) {
      console.log("its a decal");
      deleteDecal({ decalId: mesh.booObjectId, mesh, scene });
    } else {
      console.log("its an object");
      deleteObject({ objectId: mesh.booObjectId, mesh, scene });
    }
  };
  return (
    <div className="editor-container">
      <button type="button" onClick={handleClickDelete}>
        delete
      </button>
    </div>
  );
};
