import * as THREE from "three";
import { OBJLoader } from "../../utils/three-jsm/loaders/OBJLoader";
import leaningMonolith from "../../assets/models/leaning-monolith.obj";
import { getRandomInt } from "../../utils/random";
import { db } from "../../index";
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

  // load a resource
  loader.load(
    // resource URL
    leaningMonolith,
    // called when resource is loaded
    function (object) {
      track(object.children[0]);
      const monoMeshGeometry = track(object.children[0].geometry);
      booObject.geometry = monoMeshGeometry;
      booObject.scale.set(100, 100, 100);
      booObject.rotation.y = getRandomInt(0, 360);
      booObject.rotation.x = getRandomInt(0, 360);
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

export const addObject = ({ roomId, objectData }) => {
  const room = db.collection("rooms").doc(roomId);
  const objectsRef = room.collection("objects");
  const { objectType, note, downloadUrl, imageUrl, newObject, currentUser } =
    objectData;
  objectsRef
    .add({
      type: objectType,
      textContent: note,
      imageUrl: downloadUrl || imageUrl,
      position: {
        x: newObject.position.x,
        y: newObject.position.y,
        z: newObject.position.z,
      },
      creator: {
        auid: currentUser ? currentUser.auid : 666,
        username: currentUser ? currentUser.username : "anonymous",
      },
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};

export const deleteObject = ({ decalId, roomId = "public", mesh, scene }) => {
  const room = db.collection("rooms").doc(roomId);
  const decalRef = room.collection("decals").doc(decalId);
  decalRef
    .delete()
    .then(() => {
      console.log("deleted decal", decalId);
      if (mesh) {
        scene.remove(mesh);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};