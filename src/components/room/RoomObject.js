import * as THREE from "three";
// import { BLOOM_SCENE } from "./Bloom";
export const createRoomObject = ({ scene, toDispose, toRemove }) => ({
  position,
  id,
}) => {
  const roomObjectGeometry = new THREE.CircleGeometry(1, 16);
  const color = new THREE.Color();
  color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

  const roomObjectMaterial = new THREE.MeshBasicMaterial({ color: color });

  const roomObject = new THREE.Mesh(roomObjectGeometry, roomObjectMaterial);
  roomObject.position.x = position.x;
  roomObject.position.y = position.y;
  roomObject.position.z = position.z;
  roomObject.layers.enable(2);
  // roomObject.rotation.y = Math.random() * 200;
  // roomObject.rotation.z = Math.random() * 200;
  // roomObject.layers.enable(BLOOM_SCENE);

  // userSphere.callback = function () {
  //   setImageViewerIsOpen(true);
  // };

  scene.add(roomObject);

  toDispose.push(roomObjectGeometry);
  toDispose.push(roomObjectMaterial);
  toRemove.push(roomObject);
  return roomObject;
};
