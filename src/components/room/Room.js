import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import "./Room.css";
import { ImageViewer } from "../image-viewer/ImageViewer";
import { RoomControls } from "../room-controls/RoomControls";
import { Note } from "../note/Note";
import { addEnvironment } from "./Environment";
import { createVector } from "./DrawRoom";
import { setupLiveUsers } from "./LiveUsers";
import { disposeMaterial, setupBloom } from "./Bloom";
import { createBlob } from "./Blob";
import { setupHelper } from "./Helper";
import { setupRaycaster } from "./Raycaster";
import { db } from "../../index";
import { createRoomObject } from "./RoomObject";

export const Room = ({ currentUser }) => {
  const canvasEl = useRef(null);

  const { roomId } = useParams();

  const [isCreator, setIsCreator] = useState(true);
  const [webMonIsActive, setWebMonIsActive] = useState(false);
  const [imageViewerIsOpen, setImageViewerIsOpen] = useState(false);
  const [roomObjects, setRoomObjects] = useState([]);
  const [maxZ, setMaxZ] = useState(1);
  const [handlePlaceNote, setHandlePlaceNote] = useState(null);
  const [roomInfo, setRoomInfo] = useState({
    name: "",
    description: "",
    centerpieceId: "",
  });
  const [centerpiece, setCenterpiece] = useState({ url: "" });
  const [error, setError] = useState("none");

  const [cubePos, setCubePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // three js clean-up
    const toRemove = [];
    const toDispose = [];

    const curr = canvasEl.current;

    const {
      raycastHelperObjects,
      raycastHighlightObjects,
      onDocumentMouseDown,
      raycaster,
    } = setupRaycaster();

    // canvas, scene, camera, renderer setup
    const canvasWidth = 1200;
    const canvasHeight = 800;
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x404040));
    scene.traverse(disposeMaterial);
    scene.children.length = 0;
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasWidth / canvasHeight,
      0.1,
      1000
    );
    camera.rotation.x = -0.3;
    camera.position.z = 18;
    camera.position.y = 3;

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasWidth, canvasHeight);

    // get data
    const room = db.collection("rooms").doc(roomId);
    let centerpieceId = "";
    room.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setRoomInfo(data);
        centerpieceId = data.centerpieceId;
      } else {
        setError("not-found");
      }
    });
    const objectsRef = room.collection("objects");

    objectsRef.onSnapshot((querySnapshot) => {
      console.log("Changed");
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
          createRoomObject({ scene, toDispose, toRemove })({
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

    const { cleanupUserFigures, updateUserFigures } = setupLiveUsers({
      scene,
      toDispose,
    });

    const { render } = setupBloom({ scene, camera, renderer });

    canvasEl.current.appendChild(renderer.domElement);
    // window.addEventListener("resize", handleResize);
    canvasEl.current.addEventListener("click", onDocumentMouseDown, false);

    const { onMouseMove, switchHelper } = setupHelper({
      scene,
      renderer,
      camera,
      raycaster,
      raycastHelperObjects,
      toRemove,
      toDispose,
    });
    canvasEl.current.addEventListener("mousemove", onMouseMove, false);

    const { floor } = addEnvironment({
      scene,
      toDispose,
      toRemove,
      raycastHelperObjects,
    });

    const { updateBlob } = createBlob({
      position: {
        x: floor.position.x,
        y: floor.position.y + 1,
        z: floor.position.z,
      },
      handleClick: () => setImageViewerIsOpen(true),
      setOverlayPos: setCubePos,
      scene,
      raycastHighlightObjects,
      camera,
      canvasWidth,
      canvasHeight,
      toDispose,
      toRemove,
    });

    // add new objects
    const handleAddNote = () => {
      const newObject = createRoomObject({ scene, toDispose, toRemove })({
        position: { x: 20, y: 0, z: 0 },
        id: "23",
      });
      return { newObject, switchHelper, objectsRef, raycastHighlightObjects };
    };
    setHandlePlaceNote(() => handleAddNote);

    const update = () => {
      updateBlob();
      updateUserFigures();
    };
    const animate = () => {
      update();
      requestAnimationFrame(animate);
      render();
    };
    animate();

    return () => {
      curr.removeChild(renderer.domElement);
      cleanupUserFigures();

      // clean up meshes
      for (let i = 0; i < toRemove.length; i++) {
        scene.remove(toRemove[i]);
      }

      // clean up geos and mats
      for (let i = 0; i < toDispose.length; i++) {
        toDispose[i].dispose();
      }
    };
  }, [roomId]);
  return (
    <div ref={canvasEl}>
      <header className="room-info">
        <h1>{roomInfo.name}</h1>
        <h2>{roomInfo.description}</h2>
      </header>
      <div
        style={{
          backgroundColor: "red",
          width: 20,
          height: 20,
          position: "absolute",
          left: cubePos.x,
          top: cubePos.y,
        }}
      >
        test
      </div>
      {roomObjects.map((object) => {
        if (object.type === "text") {
          const { objectId, textContent, screenPos, requiresWebMon } = object;
          return (
            <Note
              key={objectId}
              objectId={objectId}
              roomId={roomId}
              position={screenPos}
              textContent={textContent}
              requiresWebMon={requiresWebMon}
              maxZ={maxZ}
              setMaxZ={setMaxZ}
              webMonIsActive={webMonIsActive}
              currentUser={currentUser}
            />
          );
        } else {
          return "";
        }
      })}
      <div className="ui-controls">
        <div>
          <input
            type="checkbox"
            name="creator"
            checked={isCreator}
            onChange={() => setIsCreator(!isCreator)}
          />
          <label htmlFor="creator">IS CREATOR VIEW</label>
        </div>
        <div>
          <input
            type="checkbox"
            name="creator"
            checked={webMonIsActive}
            onChange={() => setWebMonIsActive(!webMonIsActive)}
          />
          <label htmlFor="creator">WEB MONETIZATION ACCESS</label>
        </div>
      </div>

      <ImageViewer
        url={centerpiece.url}
        closeHandler={() => setImageViewerIsOpen(false)}
        maxZ={maxZ}
        setMaxZ={setMaxZ}
        imageViewerIsOpen={imageViewerIsOpen}
        currentUser={currentUser}
        objectId={roomInfo.centerpieceId}
        roomId={roomId}
      />

      <RoomControls handleInitiatePlaceNote={handlePlaceNote} />
    </div>
  );
};
