import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useHistory } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "../../utils/three-jsm/controls/OrbitControls";
import { CSS2DRenderer } from "../../utils/three-jsm/renderers/CSS2DRenderer";
import Stats from "../../utils/three-jsm/libs/stats.module.js";
import { ResourceTracker } from "../../utils/three-utils/resource-tracker";
import { generateHeight, generateTexture } from "./ground-utils";
import { getRandomInt } from "../../utils/random";
import {
  createHelper,
  createPointerMoveHandler,
  createPointerClickHandler,
} from "./pointer-utils";
import { setupLiveUsers } from "./live-users";
import { socket } from "../../utils/socketio";
import { Events } from "../events/Events";

const colours = [0xb35d58, 0xc2022c, 0x58a672, 0xbf9b45, 0x223870];

export const Neighbourhood = ({ currentUser }) => {
  const containerEl = useRef(null);
  const roomId = "public";
  let random;
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const resTracker = new ResourceTracker();
    const track = resTracker.track.bind(resTracker);

    let stats;

    let camera, controls, scene, renderer;

    let groundMesh, texture;

    let cleanupUser, updateUser;

    let labelRenderer;

    let toRotate = [];

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

      const data = generateHeight(worldWidth, worldDepth);

      controls.target.y =
        data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;

      camera.position.y = controls.target.y + 500;
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
          opacity: 0.2,
          side: THREE.DoubleSide,
          wireframe: true,
          transparent: true,
        })
      );
      const textureMaterial = track(
        new THREE.MeshBasicMaterial({ map: texture })
      );

      groundMesh = track(new THREE.Mesh(geometry, wallMaterial));
      scene.add(groundMesh);
      pointerClickMeshes.push(groundMesh);

      helper = createHelper({ track });
      scene.add(helper);

      //floating walls
      const wall1Geometry = track(new THREE.CylinderGeometry(10, 10, 3000, 32));
      wall1Geometry.rotateY(-Math.PI / 5);
      let wall1Material = track(
        new THREE.MeshBasicMaterial({
          color: 0x223870,
          opacity: 0.5,
          side: THREE.DoubleSide,
          wireframe: true,
          transparent: true,
        })
      );
      let wall1 = track(new THREE.Mesh(wall1Geometry, wall1Material));
      wall1.callback = () => {
        const color = getRandomColor();
        wall1.material.color.setHex(color);
      };
      scene.add(wall1);
      pointerClickMeshes.push(wall1);
      wall1.position.y = 1000;

      for (let i = 0; i < 5; i++) {
        const wall2Geometry = track(new THREE.PlaneGeometry(500, 1000, 20, 80));
        wall2Geometry.rotateX(-Math.PI / 2);
        wall2Geometry.rotateY((-Math.PI / 3) * i);
        const randColour = getRandomColor();
        let wall2Material = track(
          new THREE.MeshBasicMaterial({
            color: randColour,
            opacity: 0.3,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
          })
        );
        let wall2 = track(new THREE.Mesh(wall2Geometry, wall2Material));
        wall2.callback = () => {
          const color = getRandomColor();
          wall2.material.color.setHex(color);
        };
        scene.add(wall2);
        pointerClickMeshes.push(wall2);
        toRotate.push(wall2);
        wall2.position.y = 300 + 300 * i;
      }

      const { updateUserFigures, cleanupUserFigures } = setupLiveUsers({
        scene,
        track,
        roomId,
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
        pointerClickMeshes,
      });
      containerEl.current.addEventListener("pointermove", onPointerMove);

      const onPointerClick = createPointerClickHandler({
        raycaster,
        scene,
        pointerClickMeshes,
      });
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

    function getRandomColor() {
      const index = getRandomInt(0, colours.length);
      return colours[index];
    }

    function rotatePlanes() {
      toRotate.forEach((plane) => {
        plane.rotateY(0.005);
      });
    }

    function update() {
      updateUser();
      rotatePlanes();
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

    const containerCurr = containerEl.current;
    return () => {
      resTracker.dispose();
      cleanupUser();
      socket.removeAllListeners();
      containerCurr.removeChild(renderer.domElement);
      containerCurr.removeChild(stats.dom);
    };
  }, []);
  return (
    <div ref={containerEl} id="container">
      <div>{currentUser ? currentUser.username : ""}</div>
      <Events roomId={roomId} />
    </div>
  );
};
