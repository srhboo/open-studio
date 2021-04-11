import * as THREE from "three";
import { socket } from "../../utils/socketio";
import { isEmpty } from "../../utils/misc";
import { UserFigure } from "./UserFigure";
import { BLOOM_SCENE } from "./Bloom";

const createUserSphere = ({ scene, userFigures, toDispose }) => ({
  position,
  id,
}) => {
  const userSphereGeometry = new THREE.SphereGeometry(1.5, 4, 4);
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

  // class has own clean method
  userFigures[id] = figure;
  toDispose.push(userSphereGeometry);
  toDispose.push(userSphereMaterial);
  return userSphere;
};

export const setupLiveUsers = ({ scene, toDispose }) => {
  const userFigures = {};

  const createUserSphereWithScene = createUserSphere({
    scene,
    userFigures,
    toDispose,
  });

  socket.on("user connected", function ({ usersOnline, connectedUser }) {
    console.log("user connected");
    if (userFigures && isEmpty(userFigures)) {
      for (let i = 0; i < usersOnline.length; i++) {
        const user = usersOnline[i];
        createUserSphereWithScene(user);
      }
    } else {
      createUserSphereWithScene(connectedUser);
    }
  });
  socket.on("user disconnected", function ({ disconnectedUser }) {
    const figure = userFigures[disconnectedUser.id];
    figure.clean(scene);
    delete userFigures[disconnectedUser.id];
  });
  socket.on("user destination", ({ id, position }) => {
    const figure = userFigures[id];
    console.log(position);
    figure.setDestination(position);
  });

  const cleanupUserFigures = () => {
    for (const [id, figure] of Object.entries(userFigures)) {
      figure.clean(scene);
      userFigures[id] = null;
    }
  };

  const updateUserFigures = () => {
    for (const mesh of Object.values(userFigures)) {
      mesh && mesh.updatePosition();
    }
  };

  return {
    cleanupUserFigures,
    updateUserFigures,
  };
};
