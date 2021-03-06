import * as THREE from "three";
import { DecalGeometry } from "../../utils/three-jsm/geometries/DecalGeometry";

import { DECAL_MAT_FNS, DECAL_TYPES } from "../decals/decal-types";
import { db } from "../../index";

export const pasteGroundDecal = ({
  track,
  scene,
  intersects,
  helper,
  decalType,
  pointerClickMeshes,
  customUrl,
}) => {
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const size = new THREE.Vector3(10, 10, 10);

  const isOnGround = intersects.object.booObjectId === "ground";

  const getDecalMat = DECAL_MAT_FNS[decalType];
  const decalMaterial = getDecalMat({ track, customUrl });
  position.copy(intersects.point);

  orientation.copy(helper.rotation);

  // if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  // const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  if (decalType === DECAL_TYPES.CUSTOM) {
    size.set(200, 200, 200);
  } else {
    size.set(500, 500, 500);
  }

  //   const material = decalMaterial.clone();
  //   material.color.setHex(Math.random() * 0xffffff);
  const decalGeo = track(
    new DecalGeometry(intersects.object, position, orientation, size)
  );
  const decal = track(new THREE.Mesh(decalGeo, decalMaterial));
  scene.add(decal);
  pointerClickMeshes.push(decal);
  if (isOnGround) {
    saveDecal({
      decal,
      decalType,
      customUrl,
      position: { x: position.x, y: position.y, z: position.z },
      orientation: { x: orientation.x, y: orientation.y, z: orientation.z },
      size: { x: size.x, y: size.y, z: size.z },
    });
  }
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
      const { decalType, position, orientation, size, customUrl, permanent } =
        doc.data();

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
      const decalMaterial = getDecalMat({ track, customUrl });
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
      decal.permanent = permanent;
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
  customUrl = "",
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
      customUrl,
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

export const createDecalHelper = ({ track, scene }) => {
  // const geometryHelper = track(new THREE.BoxGeometry(100, 5, 100));
  // geometryHelper.translate(0, 50, 0);

  // const helperMaterial = track(new THREE.MeshNormalMaterial());
  // const decalHelper = track(new THREE.Mesh(geometryHelper, helperMaterial));
  const geometryHelper = track(new THREE.ConeGeometry(20, 100, 3));
  geometryHelper.translate(0, 50, 0);
  geometryHelper.rotateX(Math.PI / 2);

  const helperMaterial = track(new THREE.MeshNormalMaterial());
  const decalHelper = track(new THREE.Mesh(geometryHelper, helperMaterial));
  scene.add(decalHelper);
  return decalHelper;
};
