import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./neighbourhood.css";
import { OrbitControls } from "../../utils/three-jsm/controls/OrbitControls";
import { CSS2DRenderer } from "../../utils/three-jsm/renderers/CSS2DRenderer";
import Stats from "../../utils/three-jsm/libs/stats.module.js";
import { ResourceTracker } from "../../utils/three-utils/resource-tracker";
import { createGround } from "./ground-utils";
import {
  createHelper,
  createPointerMoveHandler,
  createPointerClickHandler,
} from "./pointer-utils";
import { setupLiveUsers } from "./live-users";
import { socket } from "../../utils/socketio";
import { Events } from "../events/Events";
import { sampleData } from "./ground-data";
import { createRotatingPlatforms, createLights } from "./environment";
import { setupNeighbourhoodData } from "./neighbourhood-data";
import { createObject } from "./objects";
import { ObjectCreationForm } from "../object-creation-form/ObjectCreationForm";
import { ObjectDisplay } from "../object-display/ObjectDisplay";

export const Neighbourhood = ({ currentUser }) => {
  const containerEl = useRef(null);
  const roomId = "public";
  // let random;
  const [objectFormIsOpen, setObjectFormIsOpen] = useState(false);
  const [handlePlaceNote, setHandlePlaceNote] = useState(null);
  // const [roomObjects, setRoomObjects] = useState({});
  const roomObjects = useRef({});
  const [objectOnDisplayId, setObjectOnDisplayId] = useState("");

  useEffect(() => {
    const resTracker = new ResourceTracker();
    const track = resTracker.track.bind(resTracker);

    let stats;

    let camera, controls, scene, renderer;

    let groundMesh, texture, textureData;

    let cleanupUser, updateUser, updateRotatingPlanes;

    let unsubscribeRoomObjects;

    let labelRenderer;

    let switchHelper;

    const worldWidth = 100,
      worldDepth = 100,
      worldHalfWidth = worldWidth / 2,
      worldHalfDepth = worldDepth / 2;

    let helper;

    let pointerClickMeshes = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    init();
    animate();

    function init() {
      initializeRenderer();
      labelRenderer = initializeCSSRenderer();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        10,
        20000
      );

      controls = initializeControls();

      const { unsubscribeObjects } = setupNeighbourhoodData({
        scene,
        track,
        pointerClickMeshes,
        setObjectOnDisplayId,
        roomObjects: roomObjects.current,
      });
      unsubscribeRoomObjects = unsubscribeObjects;

      // const data = generateHeight(worldWidth, worldDepth);
      const data = sampleData;

      controls.target.y =
        data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;

      camera.position.y = controls.target.y + 500;
      camera.position.x = 2000;
      controls.update();

      const { updatedGroundMesh } = createGround({
        track,
        worldWidth,
        worldDepth,
        data,
        scene,
      });
      groundMesh = updatedGroundMesh;
      pointerClickMeshes.push(groundMesh);

      const { rotatePlanes } = createRotatingPlatforms({
        track,
        scene,
        pointerClickMeshes,
      });
      updateRotatingPlanes = rotatePlanes;

      createLights({ track, scene });

      const {
        currentHelper,
        switchHelper: switchHelperFn,
        onPointerMove,
        onPointerClick,
      } = createHelper({
        track,
        pointer,
        raycaster,
        renderer,
        camera,
        pointerClickMeshes,
        scene,
      });
      helper = currentHelper;
      switchHelper = switchHelperFn;
      scene.add(helper);

      containerEl.current.addEventListener("pointermove", onPointerMove);

      containerEl.current.addEventListener("click", onPointerClick);

      const { updateUserFigures, cleanupUserFigures } = setupLiveUsers({
        scene,
        track,
        roomId,
        currentUser,
      });
      cleanupUser = cleanupUserFigures;
      updateUser = updateUserFigures;

      stats = new Stats();
      containerEl.current.appendChild(stats.dom);

      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    function initializeRenderer() {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x004477);
      let canvas = renderer.domElement;
      containerEl.current.appendChild(canvas);
    }

    function initializeCSSRenderer() {
      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.domElement.style.position = "absolute";
      labelRenderer.domElement.style.top = "0px";
      labelRenderer.domElement.style.pointerEvents = "none";
      document
        .getElementById("container")
        .appendChild(labelRenderer.domElement);
      return labelRenderer;
    }

    function initializeControls() {
      const newControls = new OrbitControls(camera, renderer.domElement);
      newControls.minDistance = 100;
      newControls.maxDistance = 100000;
      newControls.maxPolarAngle = Math.PI / 2;
      newControls.enableZoom = true;
      newControls.enablePan = true;
      newControls.enableKeys = true;
      return newControls;
    }

    function update() {
      updateUser();
      updateRotatingPlanes();
      controls.update();
      stats && stats.update();
    }

    function animate() {
      update();
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }

    const handleAddNote = () => {
      const newObject = createObject({
        position: { x: 20, y: 0, z: 0 },
        id: "23",
        scene,
        track,
        addTo: pointerClickMeshes,
      });
      return { newObject, switchHelper };
    };
    setHandlePlaceNote(() => handleAddNote);

    const containerCurr = containerEl.current;
    console.log("useeffect");
    return () => {
      resTracker.dispose();
      cleanupUser();
      socket.removeAllListeners();
      containerCurr.removeChild(renderer.domElement);
      containerCurr.removeChild(stats.dom);
      unsubscribeRoomObjects();
    };
  }, [currentUser]);
  return (
    <React.Fragment>
      {objectOnDisplayId && roomObjects.current[objectOnDisplayId] && (
        <ObjectDisplay
          roomObjects={roomObjects.current}
          objectOnDisplay={roomObjects.current[objectOnDisplayId]}
          closeDisplay={() => setObjectOnDisplayId("")}
        />
      )}
      <button className="add-object" onClick={() => setObjectFormIsOpen(true)}>
        drop something
      </button>
      {objectFormIsOpen && (
        <ObjectCreationForm
          handleInitiatePlaceNote={handlePlaceNote}
          closeForm={() => setObjectFormIsOpen(false)}
          currentUser={currentUser}
        />
      )}
      <Events roomId={roomId} />
      <div ref={containerEl} id="container"></div>
    </React.Fragment>
  );
};
