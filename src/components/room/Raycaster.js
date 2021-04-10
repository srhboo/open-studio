import * as THREE from "three";
import { socket } from "../../utils/socketio";

export const setupRaycaster = () => {
  const raycaster = new THREE.Raycaster();
  // const mouse = new THREE.Vector2();
  const raycastHelperObjects = [];
  const raycastHighlightObjects = [];

  const onDocumentMouseDown = (event) => {
    // event.preventDefault();
    if (event.target.tagName.toUpperCase() === "CANVAS") {
      const intersectsHighlight = raycaster.intersectObjects(
        raycastHighlightObjects
      );

      const intersectsPosition = raycaster.intersectObjects(
        raycastHelperObjects
      );

      if (intersectsHighlight.length > 0) {
        if (intersectsHighlight[0].object.callback) {
          intersectsHighlight[0].object.callback();
        }
      } else if (intersectsPosition.length > 0) {
        // update position if floor
        const intersectionPoint = intersectsPosition[0].point;
        socket.emit("new destination", { position: intersectionPoint });
      }
    }
  };

  return {
    onDocumentMouseDown,
    raycastHelperObjects,
    raycastHighlightObjects,
    raycaster,
  };
};
