import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useHistory } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "../../utils/three-jsm/controls/OrbitControls";
import { CSS2DRenderer } from "../../utils/three-jsm/renderers/CSS2DRenderer";
import Stats from "../../utils/three-jsm/libs/stats.module.js";
import { ResourceTracker } from "../../utils/three-utils/resource-tracker";
import { generateHeight, generateTexture } from "./ground-utils";
import {
  createHelper,
  createPointerMoveHandler,
  createPointerClickHandler,
} from "./pointer-utils";
import { setupLiveUsers } from "./live-users";

export const Neighbourhood = ({ currentUser }) => {
  const containerEl = useRef(null);
  const { roomId } = useParams();
  let random;
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const resTracker = new ResourceTracker();
    const track = resTracker.track.bind(resTracker);
    random = new Date().toDateString();

    let stats;

    let camera, controls, scene, renderer;

    let groundMesh, texture;

    let cleanupUser, updateUser;

    let labelRenderer;

    const worldWidth = 256,
      worldDepth = 256,
      worldHalfWidth = worldWidth / 2,
      worldHalfDepth = worldDepth / 2;

    let helper;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    init();
    animate();

    function init() {
      renderer = initializeRenderer();
      labelRenderer = initializeCSSRenderer();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x333333);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        10,
        20000
      );

      controls = initializeControls();

      const data = generateHeight(worldWidth, worldDepth);

      controls.target.y =
        data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;

      camera.position.y = controls.target.y + 2000;
      camera.position.x = 2000;
      controls.update();

      const geometry = track(
        new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1)
      );
      geometry.rotateX(-Math.PI / 2);

      const vertices = geometry.attributes.position.array;

      for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        // only update y coordinate
        vertices[j + 1] = data[i] * 10;
      }

      geometry.computeFaceNormals(); // needed for helper

      //

      texture = track(
        new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth))
      );
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      const wallMaterial = track(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          opacity: 0.5,
          side: THREE.DoubleSide,
          wireframe: true,
          transparent: true,
        })
      );
      const textureMaterial = track(
        new THREE.MeshBasicMaterial({ map: texture })
      );

      groundMesh = track(new THREE.Mesh(geometry, textureMaterial));
      scene.add(groundMesh);

      helper = createHelper({ track });
      scene.add(helper);

      const { updateUserFigures, cleanupUserFigures } = setupLiveUsers({
        scene,
        track,
        roomId: "public",
        currentUser,
      });
      cleanupUser = cleanupUserFigures;
      updateUser = updateUserFigures;

      const onPointerMove = createPointerMoveHandler({
        pointer,
        renderer,
        camera,
        helper,
        raycaster,
        groundMesh,
      });
      containerEl.current.addEventListener("pointermove", onPointerMove);

      const onPointerClick = createPointerClickHandler({ raycaster, scene });
      containerEl.current.addEventListener("click", onPointerClick);

      stats = new Stats();
      containerEl.current.appendChild(stats.dom);

      //

      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    function initializeRenderer() {
      const newRenderer = new THREE.WebGLRenderer({ antialias: true });
      newRenderer.setPixelRatio(window.devicePixelRatio);
      newRenderer.setSize(window.innerWidth, window.innerHeight);
      newRenderer.setClearColor(0x004477);
      containerEl.current.appendChild(newRenderer.domElement);
      return newRenderer;
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

    //

    function update() {
      updateUser();
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
    return () => {
      resTracker.dispose();
      cleanupUser();
    };
  }, [roomId]);
  return (
    <div ref={containerEl} id="container">
      <div>{currentUser && currentUser.username}</div>
      <div>
        {events.map((event) => (
          <div>{event}</div>
        ))}
      </div>
    </div>
  );
};
