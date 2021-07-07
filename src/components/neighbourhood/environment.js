import * as THREE from "three";
import { getRandomInt } from "../../utils/random";
import { GLTFLoader } from "../../utils/three-jsm/loaders/GLTFLoader";
import nest from "../../assets/models/nest.glb";
import audioFlower from "../../assets/models/audio-flower.glb";
import chimney from "../../assets/models/chimney1.gltf";

const colours = [0xb35d58, 0xc2022c, 0x58a672, 0xbf9b45, 0x223870];
function getRandomColor() {
  const index = getRandomInt(0, colours.length);
  return colours[index];
}

export const createLights = ({ scene, track }) => {
  // Lights

  scene.add(track(new THREE.AmbientLight(0x505050, 1)));

  const dirLight = track(new THREE.DirectionalLight(0x55505a, 5));
  dirLight.position.set(0, 3, 0);
  scene.add(dirLight);
};
export const createRotatingPlatforms = ({
  track,
  scene,
  pointerClickMeshes,
}) => {
  let toRotate = [];

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
  function rotatePlanes() {
    toRotate.forEach((plane) => {
      plane.rotateY(0.005);
    });
  }
  return { rotatePlanes };
};

export const createNest = ({ scene, track, pointerClickMeshes }) => {
  const loader = new GLTFLoader();
  let loadedScene = {};
  // Load a glTF resource
  loader.load(
    // resource URL
    nest,
    // called when the resource is loaded
    function (gltf) {
      const nest = track(gltf.scene);
      scene.add(nest);
      nest.scale.set(300, 300, 300);
      nest.position.y = 100;
      loadedScene = nest;
      pointerClickMeshes.push(nest);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );

  function rotateNest() {
    if (loadedScene.rotateY) {
      loadedScene.rotateY(0.002);
    }
  }

  return { rotateNest };
};

export const createChimney = ({ scene, track }) => {
  // Instantiate a loader
  const loader = new GLTFLoader();

  // Load a glTF resource
  loader.load(
    // resource URL
    chimney,
    // called when the resource is loaded
    function (gltf) {
      track(gltf.scene);
      scene.add(gltf.scene);
      console.log(gltf.scene);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );
};

export const createAudioFlower = ({ scene, track, pointerClickMeshes }) => {
  const loader = new GLTFLoader();
  let loadedScene = {};
  // Load a glTF resource
  loader.load(
    // resource URL
    audioFlower,
    // called when the resource is loaded
    function (gltf) {
      const flower = track(gltf.scene);
      scene.add(flower);
      flower.children.forEach((child) => {
        pointerClickMeshes.push(child);
        child.callback = () => {
          console.log("hello");
        };
      });
      flower.scale.set(50, 50, 50);
      flower.position.y = 500;
      loadedScene = flower;
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );

  function rotateAudioFlower() {
    if (loadedScene.rotateY) {
      loadedScene.rotateY(0.002);
    }
  }
  return { rotateAudioFlower };
};
