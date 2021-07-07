import { db } from "../../index";
import { createObject } from "./objects";

export const setupNeighbourhoodData = ({
  scene,
  track,
  pointerClickMeshes,
  setObjectOnDisplayId,
  roomObjects,
}) => {
  // get data
  console.log("setting up objects");
  const publicRoom = db.collection("rooms").doc("public");
  const objectsRef = publicRoom.collection("objects");
  const unsubscribeObjects = objectsRef.onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const objectTemp = doc.data();
      if (!roomObjects[doc.id]) {
        createObject({
          scene,
          track,
          position: {
            x: objectTemp.position.x,
            y: objectTemp.position.y,
            z: objectTemp.position.z,
          },
          id: doc.id,
          addTo: pointerClickMeshes,
          setObjectOnDisplayId,
          creator: objectTemp.creator,
        });
      }
      roomObjects[doc.id] = {
        ...objectTemp,
        objectId: doc.id,
      };
    });
  });
  return { unsubscribeObjects };
};
