import * as THREE from "three";

export const createVector = (x, y, z, camera, width, height) => {
  var p = new THREE.Vector3(x, y, z);
  camera.updateMatrixWorld();
  var vector = p.project(camera);
  vector.x = ((vector.x + 1) / 2) * width;
  vector.y = (-(vector.y - 1) / 2) * height;

  return vector;
};
