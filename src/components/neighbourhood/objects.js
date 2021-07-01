import * as THREE from "three";
import { OBJLoader } from "../../utils/three-jsm/loaders/OBJLoader";
import leaningMonolith from "../../assets/models/leaning-monolith.obj";
import { getRandomInt } from "../../utils/random";

// import { BLOOM_SCENE } from "./Bloom";
export const createObject = ({
  scene,
  track,
  position,
  id,
  addTo,
  setObjectOnDisplayId,
}) => {
  const objectGeometry = track(new THREE.SphereGeometry(50, 32, 32));
  const color = new THREE.Color();
  color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

  const objectMaterial = track(
    new THREE.MeshPhongMaterial({
      color,
      shininess: 100,
      side: THREE.DoubleSide,
    })
  );

  const booObject = track(new THREE.Mesh(objectGeometry, objectMaterial));
  booObject.position.x = position.x;
  booObject.position.y = position.y;
  booObject.position.z = position.z;
  // differentiate my property
  booObject.booObjectId = id;

  booObject.callback = function () {
    console.log(booObject.booObjectId);
    setObjectOnDisplayId(booObject.booObjectId);
  };
  addTo && addTo.push(booObject);
  scene.add(booObject);

  const loader = new OBJLoader();
  console.log("create");

  // load a resource
  loader.load(
    // resource URL
    leaningMonolith,
    // called when resource is loaded
    function (object) {
      const monoMeshGeometry = track(object.children[0].geometry);
      booObject.geometry = monoMeshGeometry;
      booObject.scale.set(100, 100, 100);
      booObject.rotation.y = getRandomInt(0, 360);
      booObject.rotation.x = getRandomInt(0, 360);
      console.log("rotate");
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );

  return booObject;
};
