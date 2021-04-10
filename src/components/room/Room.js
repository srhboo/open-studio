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
// all geometries materials and textures must be disposed

// functionality:
// 1. allow user to add the main work of the room - start with just an image
// 2. allow user to add additional photos and text with web monetization option
// 3. allow other users to add comments
// 4. show online bodies

// separate using toggle
// make separate component for creator view/controls and friends

const sampleObjects = [
  {
    objectId: "23jsdfj",
    type: "text",
    textContent:
      "I really like Proin nibh turpis, pulvinar sed dolor ut, gravida varius libero. Cras sit amet vestibulum sem. Donec purus enim, viverra vitae eleifend ac, dapibus et ipsum. Nullam dictum ultricies pellentesque.",
    position: { x: -10.5, y: -1.7419275145443578, z: 4.925114961635961 },
    dialogue: [],
    requiresWebMon: false,
  },
  {
    id: "123245r",
    type: "text",
    textContent:
      "sdfsdfsdfsdf nibh turpis, pulvinar sed dolor ut, gravida varius libero. Cras sit amet vestibulum sem. Donec purus enim, viverra vitae eleifend ac, dapibus et ipsum. Nullam dictum ultricies pellentesque.",
    position: {
      x: -10.499999999999998,
      y: 2.972048198657813,
      z: 5.276549540988734,
    },
    dialogue: [],
    requiresWebMon: false,
  },
  {
    id: "756745r",
    type: "text",
    textContent: "3453453454t",
    position: { x: 8.867887961529597, y: -3.4502712793277643, z: 0 },
    dialogue: [],
    requiresWebMon: true,
  },
];

export const Room = ({ objects = sampleObjects }) => {
  const canvasEl = useRef(null);

  const { roomId } = useParams();

  const [isCreator, setIsCreator] = useState(true);
  const [webMonIsActive, setWebMonIsActive] = useState(false);
  const [imageViewerIsOpen, setImageViewerIsOpen] = useState(false);
  const [roomObjects, setRoomObjects] = useState([]);
  const [maxZ, setMaxZ] = useState(1);

  const [cubePos, setCubePos] = useState({ x: 50, y: 50 });

  const width = window.innerWidth;
  const height = window.innerHeight;

  //   const handleAddNote = ({ note, requiresWebMon }) => {
  //     // this is just a fake
  //     const randomX = getRandomInt(50, width - 50);
  //     const randomY = getRandomInt(50, height - 50);
  //     const newNote = {
  //       noteId: generateId(),
  //       text: note,
  //       position: { x: randomX, y: randomY },
  //       requiresWebMon,
  //     };
  //     setNotes([...notes, newNote]);
  //   };

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

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasWidth, canvasHeight);

    // get data
    const room = db.collection("rooms").doc("first-room");
    const objectsRef = room.collection("objects");

    objectsRef.onSnapshot((querySnapshot) => {
      const objectsWithId = [];
      querySnapshot.forEach((doc) => {
        objectsWithId.push({ ...doc.data(), objectId: doc.id });
      });
      const objectsWithOverlay = objectsWithId.map((object) => {
        const pos = createVector(
          object.position.x,
          object.position.y,
          object.position.z,
          camera,
          canvasWidth,
          canvasHeight
        );
        return { ...object, screenPos: pos };
      });
      setRoomObjects(objectsWithOverlay);
    });

    const { cleanupUserFigures, updateUserFigures } = setupLiveUsers({
      scene,
      toDispose,
    });

    const { render } = setupBloom({ scene, camera, renderer });

    canvasEl.current.appendChild(renderer.domElement);
    // window.addEventListener("resize", handleResize);
    canvasEl.current.addEventListener("click", onDocumentMouseDown, false);

    const { onMouseMove } = setupHelper({
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
  }, []);
  return (
    <div ref={canvasEl}>
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
          const {
            objectId,
            textContent,
            screenPos,
            dialogue,
            requiresWebMon,
          } = object;
          return (
            <Note
              key={objectId}
              objectId={objectId}
              position={screenPos}
              textContent={textContent}
              requiresWebMon={requiresWebMon}
              dialogue={dialogue}
              maxZ={maxZ}
              setMaxZ={setMaxZ}
              webMonIsActive={webMonIsActive}
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
        url="https://drive.google.com/uc?id=1rS-i83VjnNpJOe__0SUw4MxiPWOeyQi8"
        closeHandler={() => setImageViewerIsOpen(false)}
        maxZ={maxZ}
        setMaxZ={setMaxZ}
        imageViewerIsOpen={imageViewerIsOpen}
      />
      {/* {isCreator && <RoomControls handleAddNote={handleAddNote} />} */}
    </div>
  );
};
