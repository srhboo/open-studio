import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./neighbourhood.css";
import { OrbitControls } from "../../utils/three-jsm/controls/OrbitControls";
import { CSS2DRenderer } from "../../utils/three-jsm/renderers/CSS2DRenderer";
import Stats from "../../utils/three-jsm/libs/stats.module.js";
import { ResourceTracker } from "../../utils/three-utils/resource-tracker";
import { createGround } from "./ground-utils";
import { createHelper } from "./pointer-utils";
import { setupLiveUsers } from "./live-users";
import { socket } from "../../utils/socketio";
import { Events } from "../events/Events";
import { sampleData } from "./ground-data";
import {
  // createRotatingPlatforms,
  createLights,
  createNest,
  createAudioFlower,
  // createChimney,
} from "./environment";
import { setupNeighbourhoodData } from "./neighbourhood-data";
import { createObject } from "./objects";
import { ObjectCreationForm } from "../object-creation-form/ObjectCreationForm";
import { ObjectDisplay } from "../object-display/ObjectDisplay";
import { DECAL_TYPES, DEFAULT_DECAL_TYPE } from "../decals/decal-types";
import { loadDecals } from "./decals";
import { Editor } from "../editor/Editor";

export const Neighbourhood = ({ currentUser }) => {
  const containerEl = useRef(null);
  const roomId = "public";
  const [objectFormIsOpen, setObjectFormIsOpen] = useState(false);
  const [handlePlaceNote, setHandlePlaceNote] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const roomObjects = useRef({});
  const [objectOnDisplayId, setObjectOnDisplayId] = useState("");
  const [currentDecalType, setCurrentDecalType] = useState(DEFAULT_DECAL_TYPE);
  const switchDecal = useRef(null);
  const switchDecalUrl = useRef("");
  const sceneRef = useRef(null);
  const trackRef = useRef(null);
  const updateUserRef = useRef(() => {});
  const cleanupUserRef = useRef(() => {});

  useEffect(() => {
    console.log("use effect 1");
    const resTracker = new ResourceTracker();
    const track = resTracker.track.bind(resTracker);
    trackRef.current = track;
    let stats;

    let camera, controls, renderer, scene;

    let groundMesh;
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

    let cleanupUser = cleanupUserRef.current;

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
      /* eslint-disable */
      const { rotateAudioFlower } = createAudioFlower({
        scene,
        track,
        pointerClickMeshes,
      });
      /* eslint-enable */
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
      const { currentHelper, onPointerMove, onPointerClick, switchCustomUrl } =
        helperUtils;
      helper = currentHelper;
      switchHelper = helperUtils.switchHelper;
      switchDecal.current = helperUtils.switchDecal;
      switchDecalUrl.current = switchCustomUrl;
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
      return newControls;
    }

    function update() {
      updateUserRef.current();
      cleanupUser();
      // updateRotatingPlanes();
      // updateNest();
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

    return () => {
      resTracker.dispose();
      socket.removeAllListeners();
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
      roomId,
      currentUser,
    });
    updateUserRef.current = updateUserFigures;
    cleanupUserRef.current = cleanupUserFigures;
    return () => {
      cleanupUserFigures();
    };
  }, [currentUser]);
  return (
    <React.Fragment>
      {objectOnDisplayId && roomObjects.current[objectOnDisplayId] && (
        <ObjectDisplay
          currentUser={currentUser}
          objectOnDisplay={roomObjects.current[objectOnDisplayId]}
          closeDisplay={() => setObjectOnDisplayId("")}
        />
      )}
      <button className="add-object" onClick={() => setObjectFormIsOpen(true)}>
        drop something
      </button>
      <div className="decal-switch-container">
        <select
          value={currentDecalType}
          onChange={(e) => {
            switchDecal.current(e.target.value);
            setCurrentDecalType(e.target.value);
          }}
        >
          {Object.values(DECAL_TYPES).map((type) => (
            <option value={type} key={`${type}-decal-option`}>
              {type}
            </option>
          ))}
        </select>
        {currentDecalType === DECAL_TYPES.CUSTOM && (
          <input
            type="text"
            onChange={(e) => switchDecalUrl.current(e.target.value)}
          />
        )}
      </div>
      <div className="current-selection-container">
        {currentSelection && currentSelection.booObjectId}
      </div>
      {currentSelection && (
        <Editor mesh={currentSelection} scene={sceneRef.current} />
      )}
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
