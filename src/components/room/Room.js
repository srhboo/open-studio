import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./Room.css";
import { ImageViewer } from "../image-viewer/ImageViewer";
import { CreatorControls } from "../creator-controls/CreatorControls";
import { Note } from "../note/Note";
import { generateId, getRandomInt } from "../../utils/random";
import { noise } from "../../utils/perlin";
import { socket } from "../../utils/socketio";
import { addEnvironment } from "./Environment";
import { isEmpty } from "../../utils/misc";
import { calculateNewPosition } from "../../utils/vector";
import {
  userVertexShader,
  userFragmentShader,
} from "../../shaders/user-shaders";
import { EffectComposer } from "../../utils/three-jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../../utils/three-jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "../../utils/three-jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "../../utils/three-jsm/postprocessing/UnrealBloomPass.js";
// all geometries materials and textures must be disposed

// functionality:
// 1. allow user to add the main work of the room - start with just an image
// 2. allow user to add additional photos and text with web monetization option
// 3. allow other users to add comments
// 4. show online bodies

// separate using toggle
// make separate component for creator view/controls and friends

const sampleNotes = [
  {
    noteId: "1",
    text:
      "for this project I wanted to Phasellus non viverra mi. Sed in rhoncus orci. Integer vulputate bibendum augue, et laoreet urna tempor quis. Aliquam posuere quam ac nisi fringilla, at ultricies metus lacinia. Donec gravida dui orci. Phasellus sed metus eu libero pharetra fringilla. Etiam pharetra pretium porta. Aliquam laoreet quam et dui eleifend, at finibus elit aliquet. Ut porta gravida enim, vitae auctor ipsum aliquam lacinia. Sed blandit nisl erat, in dignissim eros commodo ut. Nulla pretium augue sed ipsum sodales dapibus. Maecenas non fermentum metus.",
    position: {
      x: 100,
      y: 200,
    },
    requiresWebMon: false,
  },
  {
    noteId: "2",
    text:
      "I really like Proin nibh turpis, pulvinar sed dolor ut, gravida varius libero. Cras sit amet vestibulum sem. Donec purus enim, viverra vitae eleifend ac, dapibus et ipsum. Nullam dictum ultricies pellentesque. Vivamus sagittis, turpis sed varius aliquam, risus quam vehicula massa, quis molestie turpis mauris vitae nisi. Donec iaculis aliquet orci ac cursus. Mauris sit amet enim non massa lobortis vestibulum. Ut ullamcorper aliquam consequat.",
    position: {
      x: 150,
      y: 400,
    },
    requiresWebMon: false,
  },
  {
    noteId: "3",
    text:
      "this is special like Proin nibh turpis, pulvinar sed dolor ut, gravida varius libero. Cras sit amet vestibulum sem. Donec purus enim, viverra vitae eleifend ac, dapibus et ipsum. Nullam dictum ultricies pellentesque. Vivamus sagittis, turpis sed varius aliquam, risus quam vehicula massa, quis molestie turpis mauris vitae nisi. Donec iaculis aliquet orci ac cursus. Mauris sit amet enim non massa lobortis vestibulum. Ut ullamcorper aliquam consequat.",
    position: {
      x: 850,
      y: 400,
    },
    requiresWebMon: true,
  },
];

function createVector(x, y, z, camera, width, height) {
  var p = new THREE.Vector3(x, y, z);
  camera.updateMatrixWorld();
  var vector = p.project(camera);
  vector.x = ((vector.x + 1) / 2) * width;
  vector.y = (-(vector.y - 1) / 2) * height;

  return vector;
}

class UserFigure {
  constructor(mesh) {
    this.mesh = mesh;
    this.destination = this.mesh.position;
  }
  setDestination({ x, y, z }) {
    const destinationVector = new THREE.Vector3(x, y, z);
    this.destination = destinationVector;
  }
  // Method
  updatePosition() {
    const currentPosition = this.mesh.position;
    const { x, y, z } = calculateNewPosition(currentPosition, this.destination);
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
  }
  clean(scene) {
    scene.remove(this.mesh);
    this.mesh = null;
    this.destination = null;
  }
}

export const Room = () => {
  const canvasEl = useRef(null);

  const [name, updateName] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  const [isCreator, setIsCreator] = useState(true);
  const [webMonIsActive, setWebMonIsActive] = useState(false);
  const [imageViewerIsOpen, setImageViewerIsOpen] = useState(false);
  const [notes, setNotes] = useState(sampleNotes);
  const [maxZ, setMaxZ] = useState(1);

  const [cubePos, setCubePos] = useState({ x: 50, y: 50 });

  const width = window.innerWidth;
  const height = window.innerHeight;

  const handleAddNote = ({ note, requiresWebMon }) => {
    // this is just a fake
    const randomX = getRandomInt(50, width - 50);
    const randomY = getRandomInt(50, height - 50);
    const newNote = {
      noteId: generateId(),
      text: note,
      position: { x: randomX, y: randomY },
      requiresWebMon,
    };
    setNotes([...notes, newNote]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setCurrentUser(name);
    updateName("");
  };

  useEffect(() => {
    let userFigures = {};
    socket.on("user connected", function ({ usersOnline, connectedUser }) {
      if (userFigures && isEmpty(userFigures)) {
        for (let i = 0; i < usersOnline.length; i++) {
          const user = usersOnline[i];
          createUserSphere(user);
        }
      } else {
        createUserSphere(connectedUser);
      }
    });
    socket.on("user disconnected", function ({ disconnectedUser }) {
      const figure = userFigures[disconnectedUser.id];
      figure.clean(scene);
      delete userFigures[disconnectedUser.id];
    });
    socket.on("user destination", ({ id, position }) => {
      const figure = userFigures[id];
      figure.setDestination(position);
    });

    const curr = canvasEl.current;

    const BLOOM_SCENE = 1;
    const bloomLayer = new THREE.Layers();
    const materials = {};
    bloomLayer.set(BLOOM_SCENE);

    function darkenNonBloomed(obj) {
      if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
      }
    }
    function restoreMaterial(obj) {
      if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
      }
    }
    function disposeMaterial(obj) {
      if (obj.material) {
        obj.material.dispose();
      }
    }

    const render = () => {
      // renderer.render(scene, camera);
      scene.traverse(darkenNonBloomed);
      bloomComposer.render();
      scene.traverse(restoreMaterial);

      // render the entire scene, then render bloom scene on top
      finalComposer.render();
    };

    const params = {
      exposure: 1,
      bloomStrength: 5,
      bloomThreshold: 0,
      bloomRadius: 0,
      scene: "Scene with Glow",
    };

    const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const raycastHelperObjects = [];
    const raycastHighlightObjects = [];

    const onDocumentMouseDown = (event) => {
      // event.preventDefault();
      if (event.target.tagName.toUpperCase() === "CANVAS") {
        const intersectsHighlight = raycaster.intersectObjects(
          raycastHighlightObjects
        );

        const intersectsPosition = raycaster.intersectObjects(
          raycastHelperObjects
        );

        if (intersectsHighlight.length > 0) {
          if (intersectsHighlight[0].object.callback) {
            intersectsHighlight[0].object.callback();
          }
        } else if (intersectsPosition.length > 0) {
          // update position if floor
          const intersectionPoint = intersectsPosition[0].point;
          socket.emit("new destination", { position: intersectionPoint });
        }
      }
    };

    let userSphereGeos = [];
    let userSphereMats = [];

    const createUserSphere = ({ position, id }) => {
      const userSphereGeometry = new THREE.SphereGeometry(1, 4, 4);
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

      const userSphereMaterial = new THREE.MeshBasicMaterial({ color: color });

      const userSphere = new THREE.Mesh(userSphereGeometry, userSphereMaterial);
      userSphere.position.x = position.x;
      userSphere.position.y = position.y;
      userSphere.position.z = position.z;
      userSphere.layers.enable(BLOOM_SCENE);

      // userSphere.callback = function () {
      //   setImageViewerIsOpen(true);
      // };
      const figure = new UserFigure(userSphere);
      scene.add(userSphere);

      userFigures[id] = figure;
      userSphereGeos.push(userSphereGeometry);
      userSphereMats.push(userSphereMaterial);
      return userSphere;
    };

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

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: userVertexShader,
        fragmentShader: userFragmentShader,
        defines: {},
      }),
      "baseTexture"
    );
    finalPass.needsSwap = true;

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    canvasEl.current.appendChild(renderer.domElement);
    // window.addEventListener("resize", handleResize);
    canvasEl.current.addEventListener("click", onDocumentMouseDown, false);

    const helperGeometry = new THREE.CircleGeometry(0.4, 10);
    const helperMaterial = new THREE.MeshNormalMaterial();
    let helper;
    helper = new THREE.Mesh(helperGeometry, helperMaterial);
    helper.position.x = -100;
    scene.add(helper);

    const {
      floor,
      leftWall,
      backWall,
      rightWall,
      wallGeo,
      floorGeo,
      backWallGeo,
      wallMaterial,
      floorMaterial,
    } = addEnvironment(scene);
    raycastHelperObjects.push(floor, leftWall, backWall, rightWall);

    // main object blob code from https://codepen.io/farisk/pen/vrbzwL/
    const blobGeometry = new THREE.SphereGeometry(10, 9, 9);
    const blobMaterial = new THREE.MeshNormalMaterial();

    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    blob.position.x = floor.position.x;
    blob.position.y = floor.position.y + 1;
    blob.position.z = floor.position.z;
    blob.callback = function () {
      setImageViewerIsOpen(true);
    };
    const tempPos = createVector(
      blob.position.x,
      blob.position.y,
      blob.position.z,
      camera,
      canvasWidth,
      canvasHeight
    );
    setCubePos(tempPos);
    scene.add(blob);
    raycastHighlightObjects.push(blob);

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // See if the ray from the camera into the world hits one of our meshes
      var intersects = raycaster.intersectObjects(raycastHelperObjects);

      // Toggle rotation bool for meshes that we clicked
      if (intersects.length > 0) {
        helper.position.set(0, 0, 0);

        var normalMatrix = new THREE.Matrix3().getNormalMatrix(
          intersects[0].object.matrixWorld
        );
        var newNormal = intersects[0].face.normal
          .clone()
          .applyMatrix3(normalMatrix)
          .normalize();

        helper.lookAt(newNormal);

        helper.position.copy(intersects[0].point);
      }
    };
    canvasEl.current.addEventListener("mousemove", onMouseMove, false);

    const update = () => {
      // change '0.003' for more aggressive animation
      var time = performance.now() * 0.0003;
      var k = 1;
      const positions = blob.geometry.attributes.position.array;
      for (var i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        var p = new THREE.Vector3(x, y, z);
        p.normalize().multiplyScalar(
          2 + 1.2 * noise.perlin3(p.x * k + time, p.y * k, p.z * k)
        );
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }
      blob.geometry.attributes.position.needsUpdate = true;

      for (const mesh of Object.values(userFigures)) {
        mesh && mesh.updatePosition();
      }
    };
    const animate = () => {
      update();
      requestAnimationFrame(animate);
      render();
    };
    animate();

    return () => {
      curr.removeChild(renderer.domElement);

      // meshes
      scene.remove(leftWall);
      scene.remove(backWall);
      scene.remove(rightWall);
      scene.remove(floor);
      scene.remove(blob);
      for (const [id, figure] of Object.entries(userFigures)) {
        figure.clean(scene);
        userFigures[id] = null;
      }
      scene.remove(helper);

      //geometries
      wallGeo.dispose();
      floorGeo.dispose();
      backWallGeo.dispose();
      blobGeometry.dispose();
      userSphereGeos = userSphereGeos.map((geo) => geo.dispose());
      helperGeometry.dispose();

      //materials
      wallMaterial.dispose();
      floorMaterial.dispose();
      blobMaterial.dispose();
      userSphereMats = userSphereMats.map((mat) => mat.dispose());
      helperMaterial.dispose();
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
      {notes.map((note) => (
        <Note
          key={note.noteId}
          {...note}
          maxZ={maxZ}
          setMaxZ={setMaxZ}
          webMonIsActive={webMonIsActive}
        />
      ))}
      <div className="ui-controls">
        <div>
          {!!currentUser ? (
            `logged in as: ${currentUser}`
          ) : (
            <form onSubmit={handleLogin}>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => updateName(e.target.value)}
              />
              <button type="submit">login</button>
            </form>
          )}
        </div>
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
      {isCreator && <CreatorControls handleAddNote={handleAddNote} />}
    </div>
  );
};
