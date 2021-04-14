import * as THREE from "three";
import { noise } from "../../utils/perlin";
import { createVector } from "./DrawRoom";

export const createBlob = ({
  position,
  handleClick,
  setOverlayPos,
  scene,
  raycastHighlightObjects,
  camera,
  canvasWidth,
  canvasHeight,
  toDispose,
  toRemove,
}) => {
  // main object blob code from https://codepen.io/farisk/pen/vrbzwL/
  const blobGeometry = new THREE.SphereGeometry(10, 9, 9);
  const blobMaterial = new THREE.MeshNormalMaterial();
  toDispose.push(blobGeometry);
  toDispose.push(blobMaterial);

  const blob = new THREE.Mesh(blobGeometry, blobMaterial);
  toRemove.push(blob);

  blob.position.x = position.x;
  blob.position.y = position.y;
  blob.position.z = position.z;
  blob.callback = handleClick;
  const tempPos = createVector(
    blob.position.x,
    blob.position.y,
    blob.position.z,
    camera,
    canvasWidth,
    canvasHeight
  );
  // position of the stickie over top
  setOverlayPos(tempPos);
  scene.add(blob);
  raycastHighlightObjects.push(blob);

  const updateBlob = () => {
    const time = performance.now() * 0.0003;
    const k = 1;
    const positions = blob.geometry.attributes.position.array;
    for (var i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      var p = new THREE.Vector3(x, y, z);
      p.normalize().multiplyScalar(
        2 + 1.2 * noise.perlin3(p.x * k + time, p.y * k, p.z * k)
      );
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }
    blob.geometry.attributes.position.needsUpdate = true;
  };
  return { updateBlob };
};
