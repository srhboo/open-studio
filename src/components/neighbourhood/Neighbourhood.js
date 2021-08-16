import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./neighbourhood.css";
import { OrbitControls } from "../../utils/three-jsm/controls/OrbitControls";
import { CSS2DRenderer } from "../../utils/three-jsm/renderers/CSS2DRenderer";
import Stats from "../../utils/three-jsm/libs/stats.module.js";
import { hypotenuse } from "../../utils/vector";
import { ResourceTracker } from "../../utils/three-utils/resource-tracker";
import { createGround } from "./ground-utils";
import { createHelper } from "./pointer-utils";
import { setupLiveUsers } from "./live-users";
import { Events } from "../events/Events";
import { sampleData } from "./ground-data";
import {
  // createRotatingPlatforms,
  createLights,
  createNest,
  createAudioFlowers,
  createChimney,
} from "./environment";
import { setupNeighbourhoodData } from "./neighbourhood-data";
import { createObject } from "./objects";
import { ObjectCreationForm } from "../object-creation-form/ObjectCreationForm";
import { ObjectDisplay } from "../object-display/ObjectDisplay";
import { loadDecals, createDecalHelper } from "./decals";
import { Editor } from "../editor/Editor";
import { Welcome } from "../welcome/Welcome";

export const Neighbourhood = ({ currentUser }) => {
  const containerEl = useRef(null);
  const roomId = "public";
  const [objectFormIsOpen, setObjectFormIsOpen] = useState(false);
  const [handlePlaceNote, setHandlePlaceNote] = useState(null);
  const [handlePlaceDecal, setHandlePlaceDecal] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const roomObjects = useRef({});
  const [objectOnDisplayId, setObjectOnDisplayId] = useState("");
  const sceneRef = useRef(null);
  const trackRef = useRef(null);
  const cameraRef = useRef(null);
  const meRef = useRef(null);
  const audioFlowerPlaying = useRef({});
  const updateUserRef = useRef(() => {});
  const cleanupUserRef = useRef(() => {});
  //reset this and make it first time visitor eventually
  const [welcomeIsDisplayed, setWelcomeIsDisplayed] = useState(true);

  useEffect(() => {
    const resTracker = new ResourceTracker();
    const track = resTracker.track.bind(resTracker);
    trackRef.current = track;

    let stats;

    let camera, controls, renderer, scene;

    let groundMesh, updateFlower;
    // let texture, textureData;
    // let updateRotatingPlanes, updateNest;

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
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x000000);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        10,
        20000
      );
      cameraRef.current = camera;

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
        data[worldHalfWidth + worldHalfDepth * worldWidth] + 1000;

      camera.position.y = controls.target.y - 800;
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

      loadDecals({
        roomId: "public",
        scene,
        track,
        groundMesh,
        pointerClickMeshes,
      });

      // const { rotatePlanes } = createRotatingPlatforms({
      //   track,
      //   scene,
      //   pointerClickMeshes,
      // });
      // updateRotatingPlanes = rotatePlanes;

      createNest({ scene, track, pointerClickMeshes });

      createChimney({ scene, track });

      const { rotateAudioFlower } = createAudioFlowers({
        scene,
        track,
        pointerClickMeshes,
        audioFlowerPlaying,
      });
      updateFlower = rotateAudioFlower;
      // updateNest = rotateNest;

      // createChimney({ scene, track });

      createLights({ track, scene });

      const helperUtils = createHelper({
        track,
        pointer,
        raycaster,
        renderer,
        camera,
        pointerClickMeshes,
        scene,
        groundMesh,
        setCurrentSelection,
      });
      const { currentHelper, onPointerMove, onPointerClick } = helperUtils;
      helper = currentHelper;
      switchHelper = helperUtils.switchHelper;
      scene.add(helper);

      containerEl.current.addEventListener("pointermove", onPointerMove);

      containerEl.current.addEventListener("click", onPointerClick);

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
      newControls.zoomSpeed = 0.05;
      return newControls;
    }

    function updateZoom() {
      if (cameraRef.current && meRef.current) {
        controls.target.x = meRef.current.position.x;
        controls.target.y = meRef.current.position.y + 100;
        controls.target.z = meRef.current.position.z;
        const a = controls.target.x - camera.position.x;
        const b = controls.target.z - camera.position.z;
        const distAway = hypotenuse(a, b);
        if (distAway > 1500) {
          controls.dIn(0.99);
        }
      }
    }

    function updateFlowers() {
      Object.keys(audioFlowerPlaying.current).forEach((id) => {
        if (audioFlowerPlaying.current[id]) {
          updateFlower(id);
        }
      });
    }

    function update() {
      updateUserRef.current();
      // updateRotatingPlanes();
      // updateNest();

      updateFlowers();
      updateZoom();

      // cameraRef.current.position.set(
      //   meRef.current.position.x,
      //   meRef.current.position.y + 1000,
      //   meRef.current.position.z + 200
      // );
      // }

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
    setHandlePlaceNote(handleAddNote);

    const handleAddDecal = () => {
      const newObject = createDecalHelper({
        track,
        scene,
      });
      return { newObject, switchHelper };
    };
    setHandlePlaceDecal(() => handleAddDecal);

    const containerCurr = containerEl.current;

    return () => {
      resTracker.dispose();
      containerCurr.removeChild(renderer.domElement);
      containerCurr.removeChild(stats.dom);
      unsubscribeRoomObjects();
      roomObjects.current = {};
    };
  }, []);

  useEffect(() => {
    const { updateUserFigures, cleanupUserFigures } = setupLiveUsers({
      scene: sceneRef.current,
      track: trackRef.current,
      camera: cameraRef.current,
      roomId,
      currentUser,
      meRef,
    });
    updateUserRef.current = updateUserFigures;
    cleanupUserRef.current = cleanupUserFigures;
    return () => {
      cleanupUserFigures();
    };
  }, [currentUser]);
  return (
    <React.Fragment>
      {welcomeIsDisplayed && (
        <Welcome closeDisplay={() => setWelcomeIsDisplayed(false)} />
      )}
      {objectOnDisplayId && roomObjects.current[objectOnDisplayId] && (
        <ObjectDisplay
          currentUser={currentUser}
          objectOnDisplay={roomObjects.current[objectOnDisplayId]}
          closeDisplay={() => setObjectOnDisplayId("")}
        />
      )}
      <button className="add-object" onClick={() => setObjectFormIsOpen(true)}>
        {`--> drop something`}
      </button>
      {currentSelection && currentUser && currentUser.username === "srhboo" && (
        <Editor
          mesh={currentSelection}
          scene={sceneRef.current}
          currentUser={currentUser}
        />
      )}
      {objectFormIsOpen && (
        <ObjectCreationForm
          handleInitiatePlaceNote={handlePlaceNote}
          handleInitiatePlaceDecal={handlePlaceDecal}
          closeForm={() => setObjectFormIsOpen(false)}
          currentUser={currentUser}
        />
      )}
      <Events roomId={roomId} />
      <div ref={containerEl} id="container"></div>
    </React.Fragment>
  );
};
