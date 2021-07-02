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
}) => {
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const size = new THREE.Vector3(10, 10, 10);

  const loader = new DDSLoader();

  const getDecalMat = DECAL_MAT_FNS[decalType];
  const decalMaterial = getDecalMat({ track });
  position.copy(intersects.point);

  orientation.copy(helper.rotation);
  console.log(position);
  console.log(orientation);

  // if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  // const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set(1000, 1000, 1000);

  //   const material = decalMaterial.clone();
  //   material.color.setHex(Math.random() * 0xffffff);

  const decal = track(
    new THREE.Mesh(
      new DecalGeometry(intersects.object, position, orientation, size),
      decalMaterial
    )
  );
  scene.add(decal);
  saveDecal({
    decalType,
    position: { x: position.x, y: position.y, z: position.z },
    orientation: { x: orientation.x, y: orientation.y, z: orientation.z },
    size: { x: size.x, y: size.y, z: size.z },
  });
};

export const loadDecals = ({ roomId = "public", scene, track, groundMesh }) => {
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

      const decal = track(
        new THREE.Mesh(
          new DecalGeometry(
            groundMesh,
            decalPosition,
            decalOrientation,
            decalSize
          ),
          decalMaterial
        )
      );
      scene.add(decal);
      console.log(doc.id, " => ", doc.data());
    });
  });
};

export const saveDecal = ({
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
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};

export const deleteDecal = ({ decalId, roomId = "public" }) => {
  const room = db.collection("rooms").doc(roomId);
  const decalRef = room.collection("decals").doc(decalId);
  decalRef
    .delete()
    .then(() => {
      console.log("deleted decal", decalId);
    })
    .catch(() => {
      console.log("error deleting decal", decalId);
    });
};
