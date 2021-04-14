import React, { useEffect, useRef, useState, Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useHistory } from "react-router-dom";
import * as THREE from "three";
import "./Room.css";
import { ImageViewer } from "../image-viewer/ImageViewer";
import { RoomControls } from "../room-controls/RoomControls";
import { Note } from "../note/Note";
import { addEnvironment } from "./Environment";
import { setupLiveUsers } from "./LiveUsers";
import { disposeMaterial, setupBloom } from "./Bloom";
import { createBlob } from "./Blob";
import { setupHelper } from "./Helper";
import { setupRaycaster } from "./Raycaster";
import { createRoomObject } from "./RoomObject";
import { setupRoomData } from "./RoomData";

export const Room = ({ currentUser }) => {
  const canvasEl = useRef(null);

  const { roomId } = useParams();
  const [creatorUsername, setCreatorUsername] = useState("true");
  const [imageViewerIsOpen, setImageViewerIsOpen] = useState(false);
  const [roomObjects, setRoomObjects] = useState([]);
  const [maxZ, setMaxZ] = useState(1);
  const [handlePlaceNote, setHandlePlaceNote] = useState(null);
  const [roomInfo, setRoomInfo] = useState({
    roomName: "",
    description: "",
    centerpieceId: "",
  });
  const [centerpiece, setCenterpiece] = useState({ url: "" });
  const [error, setError] = useState("none");
  const [cubePos, setCubePos] = useState({ x: 50, y: 50 });
  const [monetizePointer, setMonetizePointer] = useState(null);
  const history = useHistory();

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
    } = setupRaycaster({ roomId });

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

    const createRoomObjectWithScene = createRoomObject({
      scene,
      toDispose,
      toRemove,
    });

    const { objectsRef, unsubscribeObjects } = setupRoomData({
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
    });

    const { cleanupUserFigures, updateUserFigures } = setupLiveUsers({
      scene,
      toDispose,
      roomId,
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
      const newObject = createRoomObjectWithScene({
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

      unsubscribeObjects();
    };
  }, [roomId]);

  const currentUserIsCreator =
    currentUser && currentUser.email === roomInfo.creatorId;

  return (
    <Fragment>
      <Helmet>
        <meta name="monetization" content={monetizePointer} />
      </Helmet>
      <div ref={canvasEl}>
        <header className="room-info">
          <h1>{roomInfo.roomName}</h1>
          <h2>{roomInfo.description}</h2>
          <div>{`by: ${creatorUsername}`}</div>
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
          centerpiece
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
                currentUser={currentUser}
              />
            );
          } else {
            return "";
          }
        })}
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

        {currentUserIsCreator && (
          <RoomControls
            handleInitiatePlaceNote={handlePlaceNote}
            roomId={roomId}
            monetizePointer={monetizePointer}
            history={history}
          />
        )}
      </div>
    </Fragment>
  );
};
