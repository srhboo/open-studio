import { db } from "../../index";
import { createVector } from "./DrawRoom";

export const setupRoomData = ({
  roomId,
  setRoomInfo,
  setError,
  setMonetizePointer,
  camera,
  canvasWidth,
  canvasHeight,
  createRoomObjectWithScene,
  setCenterpiece,
  setRoomObjects,
  setCreatorUsername,
}) => {
  // get data
  const room = db.collection("rooms").doc(roomId);
  let centerpieceId = "";
  room.onSnapshot((doc) => {
    console.log("room snapshot");
    if (doc.exists) {
      const data = doc.data();
      setRoomInfo(data);
      centerpieceId = data.centerpieceId;
      const creator = db.collection("users").doc(data.creatorId);
      return creator.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setMonetizePointer(data.webMonPointer);
          setCreatorUsername(data.username);
        } else {
          setError("not-found");
        }
      });
    } else {
      setError("not-found");
    }
  });

  const objectsRef = room.collection("objects");
  const unsubscribeObjects = objectsRef.onSnapshot((querySnapshot) => {
    const objectsWithId = [];
    querySnapshot.forEach((doc) => {
      const objectTemp = doc.data();
      const screenPos = createVector(
        objectTemp.position.x,
        objectTemp.position.y,
        objectTemp.position.z,
        camera,
        canvasWidth,
        canvasHeight
      );
      objectsWithId.push({
        ...objectTemp,
        screenPos,
        objectId: doc.id,
      });
      if (doc.id !== centerpieceId) {
        createRoomObjectWithScene({
          position: {
            x: objectTemp.position.x,
            y: objectTemp.position.y,
            z: objectTemp.position.z,
          },
          id: doc.id,
        });
      } else {
        setCenterpiece(objectTemp);
      }
    });
    setRoomObjects(objectsWithId);
  });
  return { objectsRef, unsubscribeObjects };
};
