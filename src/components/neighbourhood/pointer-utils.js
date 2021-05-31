import * as THREE from "three";
import { socket } from "../../utils/socketio";

export const createHelper = ({ track }) => {
  const geometryHelper = track(new THREE.ConeGeometry(20, 100, 3));
  geometryHelper.translate(0, 50, 0);
  geometryHelper.rotateX(Math.PI / 2);

  const helperMaterial = track(new THREE.MeshNormalMaterial());
  const helper = track(new THREE.Mesh(geometryHelper, helperMaterial));

  return helper;
};

export const createPointerMoveHandler =
  ({ pointer, renderer, camera, helper, raycaster, pointerClickMeshes }) =>
  (event) => {
    pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // See if the ray from the camera into the world hits one of our meshes
    const intersects = raycaster.intersectObjects(pointerClickMeshes);

    // Toggle rotation bool for meshes that we clicked
    if (intersects.length > 0) {
      helper.position.set(0, 0, 0);
      helper.lookAt(intersects[0].face.normal);

      helper.position.copy(intersects[0].point);
    }
  };

export const createPointerClickHandler =
  ({ raycaster, scene, pointerClickMeshes }) =>
  (event) => {
    if (event.target.tagName.toUpperCase() === "CANVAS") {
      event.preventDefault();
      //   const intersectsHighlight = raycaster.intersectObjects(
      //     raycastHighlightObjects
      //   );

      //   const intersectsPosition = raycaster.intersectObjects(
      //     raycastHelperObjects
      //   );

      const intersects = raycaster.intersectObjects(pointerClickMeshes);

      //   if (intersectsHighlight.length > 0) {
      //     if (intersectsHighlight[0].object.callback) {
      //       intersectsHighlight[0].object.callback();
      //     }
      //   } else if (intersectsPosition.length > 0) {
      //     // update position if floor
      //     const intersectionPoint = intersectsPosition[0].point;
      //     socket.emit("new destination", { position: intersectionPoint, roomId });
      //   }
      if (intersects.length > 0) {
        if (intersects[0].object.callback) {
          intersects[0].object.callback();
        }
        const intersectPoint = intersects[0].point;
        socket.emit("new destination", {
          position: {
            x: intersectPoint.x,
            y: intersectPoint.y + 50,
            z: intersectPoint.z,
          },
          roomId: "public",
        });
      }
    }
  };
