import * as THREE from "three";

export const setupHelper = ({
  scene,
  renderer,
  camera,
  raycaster,
  raycastHelperObjects,
  toRemove,
  toDispose,
}) => {
  const helperGeometry = new THREE.CircleGeometry(0.4, 10);
  const helperMaterial = new THREE.MeshNormalMaterial();
  toDispose.push(helperGeometry);
  toDispose.push(helperMaterial);

  let defaultHelper;
  defaultHelper = new THREE.Mesh(helperGeometry, helperMaterial);
  defaultHelper.position.x = -100;
  scene.add(defaultHelper);
  toRemove.push(defaultHelper);

  let helper = defaultHelper;
  let currentHelper = "default";

  const mouse = new THREE.Vector2();

  const onMouseMove = (event) => {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObjects(raycastHelperObjects);

    // Toggle rotation bool for meshes that we clicked
    if (intersects.length > 0) {
      helper.position.set(0, 0, 0);

      var normalMatrix = new THREE.Matrix3().getNormalMatrix(
        intersects[0].object.matrixWorld
      );
      var newNormal = intersects[0].face.normal
        .clone()
        .applyMatrix3(normalMatrix)
        .normalize();

      helper.lookAt(newNormal);

      helper.position.copy(intersects[0].point);
    }
  };

  const switchHelper = (mesh) => {
    if (currentHelper === "default") {
      helper = mesh;
      defaultHelper.position.x = -100;
      currentHelper = "object";
    } else {
      helper = defaultHelper;
      currentHelper = "default";
    }
  };
  return { onMouseMove, switchHelper };
};
