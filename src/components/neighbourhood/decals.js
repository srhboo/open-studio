import * as THREE from "three";
import { DecalGeometry } from "../../utils/three-jsm/geometries/DecalGeometry";
import greenMarble from "../../assets/green-marble-s.png";
import wallImg from "../../assets/wall-fix.png";
import { DDSLoader } from "../../utils/three-jsm/loaders/DDSLoader";
import disturbTex from "../../assets/textures/disturb_dxt1_nomip.dds";

import { DECAL_MAT_FNS } from "../decals/decal-types";
import { db } from "../../index";

export const pasteGroundDecal = ({
  track,
  scene,
  intersects,
  helper,
  decalType,
  pointerClickMeshes,
}) => {
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const size = new THREE.Vector3(10, 10, 10);

  const loader = new DDSLoader();

  const getDecalMat = DECAL_MAT_FNS[decalType];
  const decalMaterial = getDecalMat({ track });
  position.copy(intersects.point);

  orientation.copy(helper.rotation);

  // if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  // const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set(1000, 1000, 1000);

  //   const material = decalMaterial.clone();
  //   material.color.setHex(Math.random() * 0xffffff);
  const decalGeo = track(
    new DecalGeometry(intersects.object, position, orientation, size)
  );
  const decal = track(new THREE.Mesh(decalGeo, decalMaterial));
  scene.add(decal);
  pointerClickMeshes.push(decal);
  saveDecal({
    decal,
    decalType,
    position: { x: position.x, y: position.y, z: position.z },
    orientation: { x: orientation.x, y: orientation.y, z: orientation.z },
    size: { x: size.x, y: size.y, z: size.z },
  });
};

export const loadDecals = ({
  roomId = "public",
  scene,
  track,
  groundMesh,
  pointerClickMeshes,
}) => {
  const room = db.collection("rooms").doc(roomId);
  const decalsRef = room.collection("decals");
  decalsRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const { decalType, position, orientation, size } = doc.data();

      const decalPosition = new THREE.Vector3(
        position.x,
        position.y,
        position.z
      );
      const decalOrientation = new THREE.Euler(
        orientation.x,
        orientation.y,
        orientation.z
      );
      const decalSize = new THREE.Vector3(size.x, size.y, size.z);

      const getDecalMat = DECAL_MAT_FNS[decalType];
      const decalMaterial = getDecalMat({ track });
      const decalGeo = track(
        new DecalGeometry(
          groundMesh,
          decalPosition,
          decalOrientation,
          decalSize
        )
      );
      const decal = track(new THREE.Mesh(decalGeo, decalMaterial));
      decal.booObjectId = doc.id;
      scene.add(decal);
      pointerClickMeshes.push(decal);
    });
  });
};

export const saveDecal = ({
  decal,
  decalType,
  mesh = "ground",
  position,
  orientation,
  size,
  roomId = "public",
}) => {
  const room = db.collection("rooms").doc(roomId);
  const decalsRef = room.collection("decals");
  decalsRef
    .add({
      decalType,
      mesh,
      position,
      orientation,
      size,
    })
    .then((docRef) => {
      decal.booObjectId = docRef.id;
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};

export const deleteDecal = ({ decalId, roomId = "public", mesh, scene }) => {
  const room = db.collection("rooms").doc(roomId);
  const decalRef = room.collection("decals").doc(decalId);
  decalRef
    .delete()
    .then(() => {
      console.log("deleted decal", decalId);
      if (mesh) {
        scene.remove(mesh);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
