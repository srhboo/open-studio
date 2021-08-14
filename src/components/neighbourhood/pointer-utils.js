import * as THREE from "three";
import { socket } from "../../utils/socketio";

export const createHelper = ({
  track,
  pointer,
  raycaster,
  renderer,
  camera,
  pointerClickMeshes,
  scene,
  setCurrentSelection,
  groundMesh,
}) => {
  const geometryHelper = track(new THREE.ConeGeometry(20, 100, 3));
  geometryHelper.translate(0, 50, 0);
  geometryHelper.rotateX(Math.PI / 2);

  const helperMaterial = track(new THREE.MeshNormalMaterial());
  const defaultHelper = track(new THREE.Mesh(geometryHelper, helperMaterial));

  let currentHelper = defaultHelper;
  let currentHelperType = "default";

  const switchHelper = (mesh) => {
    if (currentHelperType === "default") {
      currentHelper = mesh;
      defaultHelper.position.x = -1000;
      currentHelperType = "object";
    } else {
      scene.remove(currentHelper);
      currentHelper = defaultHelper;
      currentHelperType = "default";
    }
  };

  const onPointerMove = (event) => {
    pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // See if the ray from the camera into the world hits one of our meshes
    let intersects;
    if (currentHelperType === "default") {
      intersects = raycaster.intersectObjects(pointerClickMeshes);
    } else {
      intersects = raycaster.intersectObjects([groundMesh]);
    }

    // Toggle rotation bool for meshes that we clicked
    if (intersects.length > 0) {
      currentHelper.position.set(0, 0, 0);
      currentHelper.lookAt(intersects[0].face.normal);
      currentHelper.position.copy(intersects[0].point);
    }
  };

  const onPointerClick = (event) => {
    if (event.target.tagName.toUpperCase() === "CANVAS") {
      event.preventDefault();
      //   const intersectsHighlight = raycaster.intersectObjects(
      //     raycastHighlightObjects
      //   );

      //   const intersectsPosition = raycaster.intersectObjects(
      //     raycastHelperObjects
      //   );
      const intersects = raycaster.intersectObjects(pointerClickMeshes);
      if (currentHelperType === "default") {
        if (intersects.length > 0) {
          if (intersects[0].object.callback) {
            intersects[0].object.callback();
          }
          const intersectMesh = intersects.find(
            (found) => found.object.booObjectId !== "ground"
          );
          if (intersectMesh) {
            setCurrentSelection(intersectMesh.object);
          }

          const intersectPoint = intersects[0].point;
          console.log(intersectPoint);
          // affectPlaneAtPoint({
          //   point: {
          //     x: intersectPoint.x,
          //     y: intersectPoint.y,
          //     z: intersectPoint.z,
          //   },
          //   mesh: groundMesh,
          //   textureData,
          // });

          socket.emit("new destination", {
            position: {
              x: intersectPoint.x,
              y: intersectPoint.y + 50,
              z: intersectPoint.z,
            },
            roomId: "public",
          });
        }
      } else {
        const intersectsAll = raycaster.intersectObjects(scene.children);
        if (intersectsAll[0] && intersectsAll[0].object.callback) {
          intersectsAll[0].object.callback({
            track,
            scene,
            intersects: intersects[0],
            helper: currentHelper,
            pointerClickMeshes,
          });
        }
      }
    }
  };

  return {
    currentHelper,
    switchHelper,
    onPointerMove,
    onPointerClick,
  };
};
